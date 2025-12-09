# Requirements Documentation

## Smart Biofloc Monitoring System

### System Requirements

#### Node.js Dependencies (package.json)
The project uses Next.js 14 with React 19 and TypeScript. All JavaScript/TypeScript dependencies are managed through npm/yarn/pnpm.

**Core Framework:**
- Next.js 14.2.25
- React 19
- TypeScript 5

**Key Dependencies:**
- Supabase (Database & Auth): `@supabase/ssr`, `@supabase/supabase-js`
- Vercel AI SDK: `ai` (for disease detection)
- Vercel Blob: `@vercel/blob` (for image storage)
- UI Components: Radix UI primitives
- Forms: `react-hook-form`, `zod`
- Charts: `recharts`
- Styling: Tailwind CSS 4

#### Python Dependencies (requirements.txt)
Python is used for machine learning model training (optional).

**Required:**
- pandas >= 2.0.0
- scikit-learn >= 1.3.0
- numpy >= 1.24.0

**Optional:**
- matplotlib >= 3.7.0
- seaborn >= 0.12.0

### Environment Variables

Required environment variables (automatically configured with integrations):

**Supabase Integration:**
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_POSTGRES_URL`
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`

**Vercel Blob Storage:**
- `BLOB_READ_WRITE_TOKEN`

**Optional (for enhanced AI features):**
- `HUGGINGFACE_API_KEY`

### Database Requirements

**PostgreSQL Database (Supabase):**

Required tables:
1. `profiles` - User profiles and authentication
2. `sensor_readings` - Biofloc sensor data
3. `fish_disease_detections` - Disease detection history

Run SQL scripts in order:
1. `scripts/001_create_profiles.sql` or `scripts/001_create_profiles_v2.sql`
2. `scripts/002_create_fish_disease_detections.sql`
3. `scripts/005_simplify_profiles_rls.sql` (fixes RLS policies)

### Installation Steps

#### 1. Install Node.js Dependencies
\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

#### 2. Install Python Dependencies (Optional)
Only needed if you want to train custom ML models:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

#### 3. Configure Integrations
Connect the following integrations through the v0 UI or Vercel dashboard:
- Supabase (Database & Authentication)
- Vercel Blob (Image Storage)

#### 4. Run Database Migrations
Execute the SQL scripts in your Supabase SQL editor in the order listed above.

#### 5. Start Development Server
\`\`\`bash
npm run dev
\`\`\`

### Deployment Requirements

**Vercel (Recommended):**
- Node.js 18.x or higher
- All environment variables configured
- Supabase and Blob integrations connected

**Other Platforms:**
- Node.js 18.x or higher
- PostgreSQL database
- Object storage for images
- Environment variables configured

### Feature Requirements

**Disease Detection:**
- AI SDK with vision model access (GPT-4o, Claude Sonnet)
- Vercel Blob storage for image uploads
- Supabase database for detection history

**Water Quality Monitoring:**
- Sensor data input (manual or CSV upload)
- ML model for quality prediction
- Visualization with Recharts

**User Authentication:**
- Supabase Auth
- Row Level Security (RLS) policies
- User and Admin roles
