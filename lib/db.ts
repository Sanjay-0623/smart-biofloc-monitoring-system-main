import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set. Please add it to your environment variables.")
}

const sql = neon(process.env.DATABASE_URL)

export async function initializeDatabase() {
  try {
    console.log("[v0] Checking if profiles table exists...")

    // Create profiles table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
      )
    `

    // Create trigger function for updated_at
    await sql`
      CREATE OR REPLACE FUNCTION public.handle_updated_at()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      AS $$
      BEGIN
        NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
        RETURN NEW;
      END;
      $$
    `

    // Create trigger
    await sql`
      DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles
    `

    await sql`
      CREATE TRIGGER handle_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at()
    `

    // Create email index
    await sql`
      CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email)
    `

    console.log("[v0] Database initialized successfully!")
    return true
  } catch (error) {
    console.error("[v0] Database initialization error:", error)
    return false
  }
}

export { sql }
