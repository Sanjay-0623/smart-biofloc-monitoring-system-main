# Usage notes:
# - Place your CSV in the same structure as /public/samples/biofloc-sensor-sample.csv
# - Columns required: timestamp, ph, temperature_c, dissolved_oxygen_mg_l, tds_ppm, salinity_ppt, ammonia_mg_l, nitrite_mg_l, nitrate_mg_l, alkalinity_mg_l
# - If you have a labeled column 'quality_label' in {good,warning,critical}, the script will fit logistic regression.
# - Otherwise it will synthesize labels from heuristic thresholds, then fit.
#
# Output:
# - Prints a JSON object you can paste into lib/model-data.ts (replace mean/std/weights/bias/thresholds).

import json
import math
from typing import List, Dict
import sys

try:
    import pandas as pd
    from sklearn.preprocessing import StandardScaler
    from sklearn.linear_model import LogisticRegression
except Exception as e:
    print("Please ensure pandas and scikit-learn are available.", file=sys.stderr)
    raise e

FEATURES = [
    "ph","temperature_c","dissolved_oxygen_mg_l","tds_ppm","salinity_ppt",
    "ammonia_mg_l","nitrite_mg_l","nitrate_mg_l","alkalinity_mg_l"
]

def synthesize_label(row: Dict) -> str:
    score = 100
    # penalty heuristic
    if row["dissolved_oxygen_mg_l"] < 5: score -= 20
    if row["ammonia_mg_l"] > 0.5: score -= 25
    if row["nitrite_mg_l"] > 0.3: score -= 20
    if row["nitrate_mg_l"] > 50: score -= 10
    if row["ph"] < 7.0 or row["ph"] > 8.5: score -= 10
    if row["alkalinity_mg_l"] < 120: score -= 10
    if row["temperature_c"] < 26 or row["temperature_c"] > 30: score -= 5
    if row["tds_ppm"] > 2000: score -= 5
    if score >= 70: return "good"
    if score >= 45: return "warning"
    return "critical"

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/train_model.py /path/to/data.csv", file=sys.stderr)
        sys.exit(1)
    path = sys.argv[1]
    df = pd.read_csv(path)

    if "quality_label" not in df.columns:
        df["quality_label"] = df.apply(lambda r: synthesize_label(r.to_dict()), axis=1)

    X = df[FEATURES].values
    y = df["quality_label"].map({"good":2, "warning":1, "critical":0}).values

    scaler = StandardScaler().fit(X)
    Xs = scaler.transform(X)

    # Multiclass logistic regression
    clf = LogisticRegression(multi_class="ovr", max_iter=1000).fit(Xs, y)

    mean = dict(zip(FEATURES, scaler.mean_.round(6)))
    std = dict(zip(FEATURES, scaler.scale_.round(6)))

    # Reduce to a single linear form via class weights difference (good vs others)
    # This keeps the JS inference simple (sigmoid of linear combo)
    # Use the class for "good" (label 2)
    class_index = list(clf.classes_).index(2)
    weights = dict(zip(FEATURES, clf.coef_[class_index].round(6)))
    bias = float(round(clf.intercept_[class_index], 6))

    model = {
        "version": "0.1.0",
        "type": "logistic",
        "features": FEATURES,
        "mean": mean,
        "std": std,
        "weights": weights,
        "bias": bias,
        "thresholds": { "good": 70, "warning": 45 }
    }

    print(json.dumps(model, indent=2))

if __name__ == "__main__":
    main()
