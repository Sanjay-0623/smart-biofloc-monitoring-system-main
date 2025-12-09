# ESP32 Setup Guide for Biofloc Monitoring

## Hardware Requirements

### Components Needed:
1. **ESP32 Development Board** (ESP32-DevKitC or similar)
2. **pH Sensor Module** (Analog output) - Connect to GPIO34
3. **DS18B20 Temperature Sensor** (Digital, waterproof) - Connect to GPIO4
4. **HC-SR04 Ultrasonic Sensor** - Trigger: GPIO5, Echo: GPIO18
5. **Turbidity Sensor** (Analog output) - Connect to GPIO35
6. **Breadboard and jumper wires**
7. **Power supply** (5V for sensors, ESP32 can be powered via USB)

## Wiring Diagram

### pH Sensor:
- VCC → 5V
- GND → GND
- Signal → GPIO34 (ADC1)

### DS18B20 Temperature Sensor:
- Red (VCC) → 3.3V
- Black (GND) → GND
- Yellow (Data) → GPIO4
- **Important:** Add 4.7kΩ pull-up resistor between Data and VCC

### HC-SR04 Ultrasonic Sensor:
- VCC → 5V
- GND → GND
- Trig → GPIO5
- Echo → GPIO18
- **Important:** Use voltage divider (1kΩ + 2kΩ) on Echo pin to reduce 5V to 3.3V

### Turbidity Sensor:
- VCC → 5V
- GND → GND
- Signal → GPIO35 (ADC1)

## Software Setup

### 1. Install Arduino IDE
Download from: https://www.arduino.cc/en/software

### 2. Install ESP32 Board Support
1. Open Arduino IDE
2. Go to **File → Preferences**
3. Add this URL to "Additional Board Manager URLs":
   \`\`\`
   https://dl.espressif.com/dl/package_esp32_index.json
   \`\`\`
4. Go to **Tools → Board → Boards Manager**
5. Search for "esp32" and install "ESP32 by Espressif Systems"

### 3. Install Required Libraries
Go to **Sketch → Include Library → Manage Libraries** and install:
- **OneWire** by Paul Stoffregen
- **DallasTemperature** by Miles Burton

### 4. Configure the Code
Open `esp32_biofloc_monitor.ino` and update:

\`\`\`cpp
// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server URL (your website)
const char* serverUrl = "https://your-domain.vercel.app/api/predict";
\`\`\`

### 5. Calibrate Sensors

#### pH Sensor Calibration:
1. Place sensor in pH 7.0 buffer solution
2. Read the voltage in Serial Monitor
3. Update `PH_NEUTRAL_VOLTAGE` in code
4. Test with pH 4.0 and pH 10.0 buffers to verify accuracy

#### Turbidity Sensor Calibration:
1. Test with clear water (should read low NTU)
2. Test with known turbidity samples
3. Adjust the formula in `readTurbidity()` function

#### Ultrasonic Sensor Calibration:
1. Measure your tank height in centimeters
2. Update `TANK_HEIGHT_CM` in code

### 6. Upload Code
1. Connect ESP32 via USB
2. Select **Tools → Board → ESP32 Dev Module**
3. Select correct **Port**
4. Click **Upload** button

## Testing

### Serial Monitor:
1. Open **Tools → Serial Monitor**
2. Set baud rate to **115200**
3. You should see:
   - WiFi connection status
   - Sensor readings every minute
   - Server response

### Expected Output:
\`\`\`
Connecting to WiFi...
WiFi connected!
IP address: 192.168.1.100

========== Sensor Readings ==========
pH: 7.45
Temperature: 28.2 °C
Water Level: 82.0 cm
Turbidity: 48.5 NTU
====================================

Sending data to server...
HTTP Response code: 200
Server response: {"score":85,"category":"good",...}
\`\`\`

## Troubleshooting

### WiFi Connection Issues:
- Check SSID and password are correct
- Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- Move ESP32 closer to router

### Sensor Reading Errors:
- **pH showing 7.0 constantly:** Check wiring and sensor power
- **Temperature error:** Verify DS18B20 has pull-up resistor
- **Ultrasonic timeout:** Check Echo pin voltage divider, ensure sensor has clear line of sight
- **Turbidity unstable:** Clean sensor probe, ensure it's submerged properly

### HTTP POST Errors:
- Verify server URL is correct and accessible
- Check firewall settings
- For local testing, use ESP32's IP address from same network

## Power Management

### Battery Operation (Optional):
- Use 18650 Li-ion battery with charging module
- Add deep sleep mode between readings to save power
- Typical battery life: 12-24 hours with 1-minute intervals

### Example Deep Sleep Code:
\`\`\`cpp
// At end of loop(), add:
esp_sleep_enable_timer_wakeup(60 * 1000000); // 60 seconds
esp_deep_sleep_start();
\`\`\`

## Maintenance

- **Clean sensors weekly:** Biofilm buildup affects accuracy
- **Calibrate pH monthly:** pH sensors drift over time
- **Check connections:** Corrosion in humid environments
- **Update firmware:** Keep ESP32 libraries up to date

## Next Steps

1. **Data Logging:** Add SD card module to store readings locally
2. **Display:** Add OLED screen to show readings without computer
3. **Alerts:** Implement SMS/email notifications for critical values
4. **Multiple Tanks:** Use multiple ESP32s with unique IDs
