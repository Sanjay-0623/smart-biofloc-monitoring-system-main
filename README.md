# Smart Biofloc Monitoring System

A comprehensive full-stack application for fish farming management with AI-powered disease detection and real-time biofloc monitoring.

## Features

### Core Biofloc Monitoring
- Real-time water quality monitoring dashboard
- CSV data upload and analysis
- AI-powered water quality predictions
- Automated recommendations based on sensor readings
- Interactive charts and trend visualization
- Support for 4 key sensors: pH, Temperature, Ultrasonic (water level), and Turbidity

### AI-Powered Fish Disease Detection
- Upload fish images for instant disease analysis
- CNN-based disease classification (mock model, replaceable with TensorFlow/PyTorch/Hugging Face)
- Detects: Fin Rot, Ich, Dropsy, Columnaris, Fungal Infections, and more
- Confidence scores and detailed treatment recommendations
- Complete detection history with image storage

### User Management
- Secure authentication with NextAuth.js
- Email/password signup and login
- User profiles with role-based access control
- Personal dashboard with activity statistics
- Complete upload and detection history

### Admin Dashboard
- Separate admin login and interface
- User management and monitoring
- View all detections across the platform
- Comprehensive analytics with interactive charts
- Activity timeline and trend analysis
- Disease distribution statistics

### Additional Features
- Dark/Light mode toggle
- PDF report generation (infrastructure ready)
- Email notifications (infrastructure ready)
- Responsive mobile-first design
- Secure Row Level Security (RLS) policies
- Image storage with Vercel Blob

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: Neon (PostgreSQL)
- **Authentication**: NextAuth.js
- **Storage**: Vercel Blob
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Fonts**: Work Sans (headings), Open Sans (body)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Neon account and database
- Vercel account (for deployment)

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   - Neon database credentials (DATABASE_URL)
   - NextAuth secret (NEXTAUTH_SECRET)
   - Vercel Blob token

4. Run database migrations:
   - Execute SQL scripts in the `scripts` folder in order:
     - `001_create_profiles_neon.sql`
     - `002_create_fish_disease_detections_neon.sql`

5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000)

### Creating an Admin User

After signing up, manually update the user's role in your Neon database:

\`\`\`sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
\`\`\`

## Project Structure

\`\`\`
├── app/
│   ├── admin/              # Admin dashboard and management
│   ├── auth/               # Authentication pages
│   ├── user/               # User dashboard and history
│   ├── disease-detection/  # Fish disease detection
│   ├── dashboard/          # Biofloc monitoring
│   └── api/                # API routes
├── components/             # Reusable UI components
├── lib/                    # Utilities and services
│   ├── supabase/          # Supabase client utilities (legacy)
│   ├── fish-disease-model.ts
│   └── email-notifications.ts
├── scripts/               # Database migration scripts
└── esp32_biofloc_monitor.ino  # ESP32 hardware code
\`\`\`

## User Roles

### Regular Users
- Sign up and log in
- Upload fish images for disease detection
- View personal dashboard and history
- Access biofloc monitoring tools

### Admins
- All user capabilities
- Separate admin login at `/admin/login`
- Manage all users
- View all detections across the platform
- Access comprehensive analytics
- Monitor system activity

## AI Model Integration

### Fish Disease Detection

The current implementation uses a mock ML model. To integrate a real model:

1. **TensorFlow.js**:
\`\`\`typescript
import * as tf from '@tensorflow/tfjs'
const model = await tf.loadLayersModel('/models/fish-disease-model.json')
const predictions = await model.predict(tensor)
\`\`\`

2. **Hugging Face API**:
\`\`\`typescript
const response = await fetch('https://api-inference.huggingface.co/models/your-model', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
  body: imageFile
})
\`\`\`

3. **PyTorch with ONNX Runtime**: Export your PyTorch model to ONNX and use onnxruntime-node

## Hardware Integration

### ESP32 Biofloc Monitor

The project includes complete ESP32 code for hardware sensor integration:

**Supported Sensors:**
- pH sensor (analog)
- DS18B20 temperature sensor (OneWire)
- HC-SR04 ultrasonic sensor (water level)
- Turbidity sensor (analog)

**Setup Instructions:**
See `ESP32_SETUP_GUIDE.md` for complete wiring diagrams, calibration steps, and upload instructions.

## Optional Enhancements

### PDF Report Generation

Install a PDF library:
\`\`\`bash
npm install jspdf
# or
npm install pdfkit
\`\`\`

Update `app/api/generate-pdf/route.ts` with actual PDF generation logic.

### Email Notifications

Install an email service:
\`\`\`bash
npm install resend
# or
npm install @sendgrid/mail
\`\`\`

Update `lib/email-notifications.ts` with your email service credentials.

### Real-time Updates

Add real-time subscriptions using database triggers and webhooks.

## Security

- Row Level Security (RLS) enabled on all tables (Supabase)
- Users can only access their own data
- Admins have elevated permissions
- Secure authentication with NextAuth.js
- Protected API routes with session verification
- Environment variables for sensitive data

## Database Schema

### profiles
- `id` (uuid, primary key)
- `email` (text)
- `full_name` (text)
- `role` (text: 'user' | 'admin')
- `created_at` (timestamp)

### fish_disease_detections
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `image_url` (text)
- `disease_name` (text)
- `confidence` (float)
- `description` (text)
- `treatment` (text)
- `created_at` (timestamp)

## Deployment

Deploy to Vercel with one click:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will automatically detect Next.js and configure build settings
4. Add environment variables in Vercel dashboard
5. Deploy

## Contributing

This project is designed to be modular and extensible. Key areas for contribution:

- Replace mock ML models with real trained models
- Add more disease types to the detection system
- Implement real-time notifications
- Add multi-language support
- Enhance analytics with more visualizations
- Add export functionality for reports

## License

MIT License - feel free to use this project for your own fish farming operations or as a template for similar AI-powered monitoring systems.

## Support

For issues or questions:
- Check the documentation above
- Review the code comments in each file
- Open an issue on GitHub
- Contact the development team

---

Built with Next.js, Neon, and AI-powered detection systems for modern aquaculture management.
