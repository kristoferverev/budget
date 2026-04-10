# Minu Eelarve - Setup & Deployment Guide

This guide covers everything you need to set up, configure, and deploy the **Minu Eelarve** smart budgeting and grocery analysis app using **Supabase** and **Vercel**.

## 🚀 Prerequisites

Before starting, ensure you have:
- A [Supabase](https://supabase.com/) account.
- A [Vercel](https://vercel.com/) account.
- [Node.js](https://nodejs.org/) installed locally.

---

## 1. Supabase Setup

### Create a New Project
1. Log in to your Supabase dashboard and create a new project.
2. Note your **Project URL** and **Anon Key** (found in Project Settings > API).

### Database Schema
1. Open the **SQL Editor** in your Supabase project.
2. Create a new query and paste the contents of the schema file found at `scratch/supabase_schema.sql` in this repository.
3. Click **Run**. This will create all necessary tables and Row Level Security (RLS) policies.

### Authentication
1. Go to **Authentication > Providers**.
2. Ensure **Email** is enabled.
3. Disable "Confirm email" if you want Magic Links to work instantly without a confirmation step (optional but easier for MVP).

### Storage
1. Go to **Storage**.
2. Create a new bucket named `receipts`.
3. Set the bucket to **Public** (or configure access policies if you prefer private storage).

---

## 2. Local Development

### Environment Variables
1. Create a `.env` file in the root directory (use `.env.example` as a template).
2. Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Run Locally
```bash
npm install
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 3. Deployment to Vercel

### Connect Repository
1. Push your code to a Git repository (GitHub/GitLab/Bitbucket).
2. In the Vercel dashboard, click **Add New > Project** and import your repository.

### Configure Environment Variables
1. During the setup in Vercel, find the **Environment Variables** section.
2. Add the same variables as in your local `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Production Check
1. Vercel will automatically build and deploy the app.
2. Ensure the build target is set to `vite build` and output directory to `dist`.
3. Verify that the app loads and you can sign in via Magic Link.

---

## 4. Progressive Web App (PWA)

The app is pre-configured as a PWA. To install it on your mobile device:
- **iOS**: Open the app in Safari, tap the **Share** button, and select **"Add to Home Screen"**.
- **Android**: Open the app in Chrome and tap the menu (three dots), then select **"Install App"**.

---

## 5. Troubleshooting & Maintenance

### Common Issues
- **Auth Redirects**: If Magic Link redirects to localhost instead of your production URL, update the "Site URL" in Supabase Authentication > URL Configuration.
- **Storage Errors**: Ensure the `receipts` bucket exists and has correct permissions.
- **Data Sync**: If data doesn't appear across devices, verify that you are logged into the same email on both.

### Updating the App
To update the project later:
1. Make your changes locally.
2. Verify with `npm run dev`.
3. Push to your Git repository – Vercel will automatically trigger a new deployment.
