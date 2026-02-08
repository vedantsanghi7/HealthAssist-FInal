# HealthAssist - AI-Powered Healthcare Platform

HealthAssist is a comprehensive healthcare platform connecting patients and doctors with real-time vitals monitoring, secure medical records, and AI-powered health insights.

## Features
- **Unified Portal**: Seamless interface for both Patients and Doctors.
- **Sarvam AI Integration**: Multilingual AI assistant (English + 10 Indian Languages) for analyzing medical reports and answering health queries.
- **Real-time Vitals**: Dashboard with simulated 3D visualizations for heart rate, blood pressure, and health scores.
- **Secure Records**: Upload and manage digital medical records.
- **Appointments & Messaging**: Integrated booking system and direct secure messaging.

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vedantsanghi7/HealthAssist-FInal.git
   cd HealthAssist-FInal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory with the following structure:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   
   # Sarvam AI API Key
   SARVAM_API_KEY=your_sarvam_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS
- **UI Components**: Lucide React, Framer Motion, Glassmorphism Design
- **Backend/Database**: Supabase
- **AI**: Sarvam AI

## Team (BITS Pilani)
- **Vedant Sanghi**
- **Aadi Shravan**
- **Chitransh Tiwari**
- **Pushkar Kumar**
- **Parth Gupta**
