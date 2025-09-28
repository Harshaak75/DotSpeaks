/*
  # COO Dashboard Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `employee_code` (text, unique)
      - `name` (text)
      - `contact` (text)
      - `email` (text, unique)
      - `designation` (text)
      - `department` (text)
      - `join_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `attendance`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `date` (date)
      - `login_time` (time)
      - `logout_time` (time)
      - `status` (text)
      - `hours_worked` (decimal)
      - `created_at` (timestamp)

    - `company_goals`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `priority` (text)
      - `status` (text)
      - `progress` (integer)
      - `start_date` (date)
      - `end_date` (date)
      - `owner` (text)
      - `department` (text)
      - `created_at` (timestamp)

    - `department_goals`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `priority` (text)
      - `status` (text)
      - `progress` (integer)
      - `start_date` (date)
      - `end_date` (date)
      - `assigned_to` (text)
      - `department` (text)
      - `editable` (boolean)
      - `created_at` (timestamp)

    - `reports`
      - `id` (uuid, primary key)
      - `title` (text)
      - `type` (text)
      - `date` (date)
      - `uploaded_by` (text)
      - `file_size` (text)
      - `status` (text)
      - `summary` (jsonb)
      - `created_at` (timestamp)

    - `meetings`
      - `id` (uuid, primary key)
      - `title` (text)
      - `date` (date)
      - `time` (time)
      - `duration` (text)
      - `participants` (text[])
      - `location` (text)
      - `type` (text)
      - `status` (text)
      - `agenda` (text)
      - `organizer` (text)
      - `created_at` (timestamp)

    - `documents`
      - `id` (uuid, primary key)
      - `title` (text)
      - `type` (text)
      - `category` (text)
      - `size` (text)
      - `last_modified` (timestamp)
      - `download_url` (text)
      - `description` (text)
      - `confidentiality` (text)
      - `version` (text)
      - `created_at` (timestamp)

    - `tutorials`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `type` (text)
      - `duration` (text)
      - `category` (text)
      - `instructor` (text)
      - `is_watched` (boolean)
      - `url` (text)
      - `thumbnail_url` (text)
      - `last_updated` (timestamp)
      - `created_at` (timestamp)

    - `team_members`
      - `id` (uuid, primary key)
      - `name` (text)
      - `position` (text)
      - `email` (text)
      - `phone` (text)
      - `department` (text)
      - `location` (text)
      - `join_date` (date)
      - `avatar` (text)
      - `status` (text)
      - `reports_to` (text)
      - `direct_reports` (integer)
      - `current_projects` (text[])
      - `skills` (text[])
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for COO role to access team data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_code text UNIQUE NOT NULL,
  name text NOT NULL,
  contact text,
  email text UNIQUE NOT NULL,
  designation text NOT NULL,
  department text NOT NULL,
  join_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  login_time time,
  logout_time time,
  status text NOT NULL DEFAULT 'Present',
  hours_worked decimal(4,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create company_goals table
CREATE TABLE IF NOT EXISTS company_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  priority text NOT NULL DEFAULT 'Medium',
  status text NOT NULL DEFAULT 'On Track',
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date date NOT NULL,
  end_date date NOT NULL,
  owner text NOT NULL,
  department text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create department_goals table
CREATE TABLE IF NOT EXISTS department_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  priority text NOT NULL DEFAULT 'Medium',
  status text NOT NULL DEFAULT 'On Track',
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date date NOT NULL,
  end_date date NOT NULL,
  assigned_to text NOT NULL,
  department text NOT NULL,
  editable boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  date date NOT NULL,
  uploaded_by text NOT NULL,
  file_size text,
  status text NOT NULL DEFAULT 'Completed',
  summary jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  duration text,
  participants text[],
  location text,
  type text NOT NULL DEFAULT 'In-Person',
  status text NOT NULL DEFAULT 'Scheduled',
  agenda text,
  organizer text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  category text NOT NULL,
  size text,
  last_modified timestamptz DEFAULT now(),
  download_url text,
  description text,
  confidentiality text NOT NULL DEFAULT 'Internal',
  version text DEFAULT '1.0',
  created_at timestamptz DEFAULT now()
);

-- Create tutorials table
CREATE TABLE IF NOT EXISTS tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL,
  duration text,
  category text NOT NULL,
  instructor text,
  is_watched boolean DEFAULT false,
  url text,
  thumbnail_url text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  department text NOT NULL,
  location text,
  join_date date NOT NULL,
  avatar text,
  status text NOT NULL DEFAULT 'Active',
  reports_to text,
  direct_reports integer DEFAULT 0,
  current_projects text[],
  skills text[],
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for attendance
CREATE POLICY "Users can read own attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create policies for company_goals (read-only for all authenticated users)
CREATE POLICY "Authenticated users can read company goals"
  ON company_goals
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for department_goals
CREATE POLICY "Authenticated users can read department goals"
  ON department_goals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage editable department goals"
  ON department_goals
  FOR ALL
  TO authenticated
  USING (editable = true);

-- Create policies for reports
CREATE POLICY "Authenticated users can read reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for meetings
CREATE POLICY "Authenticated users can read meetings"
  ON meetings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create meetings"
  ON meetings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for documents
CREATE POLICY "Authenticated users can read documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for tutorials
CREATE POLICY "Authenticated users can read tutorials"
  ON tutorials
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update tutorial watch status"
  ON tutorials
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for team_members
CREATE POLICY "Authenticated users can read team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (true);