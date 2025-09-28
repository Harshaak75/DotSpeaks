/*
  # Seed COO Dashboard Data

  This migration adds sample data for the COO dashboard to demonstrate functionality.
*/

-- Insert sample profiles
INSERT INTO profiles (user_id, employee_code, name, contact, email, designation, department, join_date) VALUES
  (gen_random_uuid(), 'COO001', 'Sarah Johnson', '+1 (555) 123-4567', 'sarah.johnson@company.com', 'Chief Operating Officer', 'Operations', '2020-01-15'),
  (gen_random_uuid(), 'PM001', 'Michael Rodriguez', '+1 (555) 234-5678', 'michael.rodriguez@company.com', 'Project Manager', 'Operations', '2022-03-15'),
  (gen_random_uuid(), 'HR001', 'Lisa Chen', '+1 (555) 345-6789', 'lisa.chen@company.com', 'HR Manager', 'Human Resources', '2021-11-20');

-- Insert sample attendance data
INSERT INTO attendance (user_id, date, login_time, logout_time, status, hours_worked) VALUES
  ((SELECT id FROM profiles WHERE employee_code = 'COO001'), '2024-01-15', '09:00', '18:00', 'Present', 8.0),
  ((SELECT id FROM profiles WHERE employee_code = 'COO001'), '2024-01-16', '09:15', '18:00', 'Late', 7.75),
  ((SELECT id FROM profiles WHERE employee_code = 'COO001'), '2024-01-17', '09:00', '18:00', 'Present', 8.0),
  ((SELECT id FROM profiles WHERE employee_code = 'COO001'), '2024-01-18', '09:00', '13:00', 'Half Day', 4.0),
  ((SELECT id FROM profiles WHERE employee_code = 'COO001'), '2024-01-19', NULL, NULL, 'Absent', 0.0);

-- Insert sample company goals
INSERT INTO company_goals (title, description, category, priority, status, progress, start_date, end_date, owner, department) VALUES
  ('Increase Annual Revenue by 25%', 'Achieve $10M in annual revenue through strategic partnerships and market expansion', 'Financial', 'High', 'On Track', 68, '2024-01-01', '2024-12-31', 'CEO', 'Executive'),
  ('Launch New Product Line', 'Develop and launch innovative SaaS solutions for mid-market clients', 'Product', 'High', 'Behind', 45, '2024-02-01', '2024-08-31', 'CTO', 'Technology'),
  ('Expand Team by 50%', 'Hire 25 new employees across all departments to support growth', 'Human Resources', 'Medium', 'On Track', 72, '2024-01-01', '2024-12-31', 'HR Manager', 'Human Resources'),
  ('Improve Customer Satisfaction', 'Achieve 95% customer satisfaction rating through enhanced support', 'Customer Success', 'High', 'Completed', 100, '2024-01-01', '2024-06-30', 'CMO', 'Marketing'),
  ('Reduce Operational Costs', 'Optimize processes and reduce operational expenses by 15%', 'Operations', 'Medium', 'At Risk', 25, '2024-03-01', '2024-09-30', 'COO', 'Operations');

-- Insert sample department goals
INSERT INTO department_goals (title, description, priority, status, progress, start_date, end_date, assigned_to, department, editable) VALUES
  ('Streamline Supply Chain Process', 'Optimize supply chain operations to reduce costs by 20%', 'High', 'On Track', 65, '2024-01-15', '2024-06-30', 'Operations Team', 'Operations', true),
  ('Implement Quality Management System', 'Deploy ISO 9001 compliant quality management system', 'Medium', 'Behind', 35, '2024-02-01', '2024-08-31', 'QA Team', 'Operations', true),
  ('Migrate to Cloud Infrastructure', 'Complete migration of legacy systems to AWS cloud', 'High', 'On Track', 78, '2024-01-01', '2024-05-31', 'DevOps Team', 'Technology', false),
  ('Launch Digital Marketing Campaign', 'Increase brand awareness through multi-channel digital marketing', 'High', 'Completed', 100, '2024-01-01', '2024-03-31', 'Marketing Team', 'Marketing', false),
  ('Implement Financial Reporting System', 'Deploy automated financial reporting and analytics platform', 'Medium', 'At Risk', 25, '2024-03-01', '2024-09-30', 'Finance Team', 'Finance', false);

-- Insert sample reports
INSERT INTO reports (title, type, date, uploaded_by, file_size, status, summary) VALUES
  ('Operations Performance Report - January 2024', 'Monthly', '2024-01-31', 'Sarah Johnson', '2.4 MB', 'Completed', '{"revenue": "$850,000", "growth": "+12.5%", "target": "95%", "completion": 94}'),
  ('Weekly Operations Summary - Week 6', 'Weekly', '2024-02-09', 'Operations Team', '1.8 MB', 'Completed', '{"revenue": "$195,000", "growth": "+8.3%", "target": "98%", "completion": 97}'),
  ('Cost Optimization Report - Q1 2024', 'Monthly', '2024-03-31', 'Sarah Johnson', '3.2 MB', 'In Progress', '{"revenue": "$920,000", "growth": "+15.2%", "target": "90%", "completion": 78}'),
  ('Supply Chain Efficiency - Week 10', 'Weekly', '2024-03-08', 'Operations Team', '1.5 MB', 'Review', '{"revenue": "$210,000", "growth": "+6.7%", "target": "92%", "completion": 89}');

-- Insert sample meetings
INSERT INTO meetings (title, date, time, duration, participants, location, type, status, agenda, organizer) VALUES
  ('Operations Review Meeting', '2024-01-15', '09:00', '1h 30m', ARRAY['Sarah Johnson', 'Mike Chen', 'Lisa Wang', 'Operations Team'], 'Conference Room A', 'In-Person', 'Scheduled', 'Review Q1 operations metrics, discuss process improvements, plan for Q2', 'Sarah Johnson'),
  ('Weekly Stand-up', '2024-01-16', '10:00', '30m', ARRAY['Sarah Johnson', 'Team Leads', 'Project Managers'], 'Virtual - Zoom', 'Virtual', 'Scheduled', 'Weekly progress updates, blockers discussion, priority alignment', 'Sarah Johnson'),
  ('Board Meeting Preparation', '2024-01-17', '14:00', '2h', ARRAY['Sarah Johnson', 'CEO', 'CFO', 'CTO'], 'Executive Boardroom', 'In-Person', 'Scheduled', 'Prepare quarterly reports, review financial metrics, discuss strategic initiatives', 'CEO'),
  ('Vendor Partnership Review', '2024-01-18', '11:00', '1h', ARRAY['Sarah Johnson', 'Procurement Team', 'External Vendors'], 'Conference Room B', 'Hybrid', 'Completed', 'Review vendor performance, negotiate contracts, discuss future partnerships', 'Sarah Johnson'),
  ('Team Building Session', '2024-01-19', '16:00', '3h', ARRAY['Sarah Johnson', 'HR Manager', 'All Operations Staff'], 'Training Center', 'In-Person', 'Scheduled', 'Team building activities, communication workshops, Q&A session', 'HR Manager');

-- Insert sample documents
INSERT INTO documents (title, type, category, size, download_url, description, confidentiality, version) VALUES
  ('Employment Contract - COO', 'PDF', 'Employment', '2.4 MB', '#', 'Official employment contract outlining terms, conditions, and responsibilities', 'Confidential', '2.1'),
  ('Salary Slip - January 2024', 'PDF', 'Financial', '156 KB', '#', 'Monthly salary statement with detailed breakdown of earnings and deductions', 'Confidential', '1.0'),
  ('Non-Disclosure Agreement (NDA)', 'PDF', 'Legal', '1.2 MB', '#', 'Confidentiality agreement protecting company proprietary information', 'Restricted', '3.0'),
  ('Performance Review - Q4 2023', 'PDF', 'Employment', '890 KB', '#', 'Quarterly performance evaluation and goal setting document', 'Confidential', '1.2'),
  ('Company Policy Handbook', 'PDF', 'Compliance', '4.8 MB', '#', 'Comprehensive guide to company policies, procedures, and code of conduct', 'Internal', '5.1'),
  ('Stock Options Agreement', 'PDF', 'Financial', '1.8 MB', '#', 'Employee stock option plan terms and vesting schedule', 'Confidential', '2.0'),
  ('IT Security Policy', 'PDF', 'Compliance', '2.1 MB', '#', 'Information technology security guidelines and requirements', 'Internal', '1.5'),
  ('Travel & Expense Policy', 'PDF', 'Compliance', '1.5 MB', '#', 'Guidelines for business travel and expense reimbursement procedures', 'Internal', '2.3');

-- Insert sample tutorials
INSERT INTO tutorials (title, description, type, duration, category, instructor, is_watched, url, thumbnail_url) VALUES
  ('Operations Management Fundamentals', 'Comprehensive guide to modern operations management principles and best practices', 'video', '45 minutes', 'Operations', 'Dr. Sarah Mitchell', true, 'https://example.com/video1', 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Strategic Planning Workshop', 'Learn how to develop and implement strategic plans for operational excellence', 'video', '1 hour 20 minutes', 'Strategy', 'Michael Chen', false, 'https://example.com/video2', 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Team Leadership Guide', 'Essential leadership skills for managing diverse teams and driving performance', 'pdf', '30 pages', 'Leadership', 'Lisa Rodriguez', false, 'https://example.com/pdf1', 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Process Optimization Techniques', 'Advanced methods for streamlining operations and reducing waste', 'document', '25 minutes read', 'Process Improvement', 'James Wilson', true, 'https://example.com/doc1', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Quality Management Systems', 'Understanding ISO standards and implementing quality management frameworks', 'video', '55 minutes', 'Quality', 'Anna Thompson', false, 'https://example.com/video3', 'https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Financial Operations Overview', 'Key financial metrics and budgeting principles for operations managers', 'pdf', '42 pages', 'Finance', 'Robert Kim', true, 'https://example.com/pdf2', 'https://images.pexels.com/photos/3184419/pexels-photo-3184419.jpeg?auto=compress&cs=tinysrgb&w=400');

-- Insert sample team members
INSERT INTO team_members (name, position, email, phone, department, location, join_date, avatar, status, reports_to, direct_reports, current_projects, skills) VALUES
  ('Michael Rodriguez', 'Project Manager', 'michael.rodriguez@company.com', '+1 (555) 234-5678', 'Operations', 'New York, NY', '2022-03-15', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150', 'Active', 'COO', 8, ARRAY['Project Alpha', 'System Migration', 'Quality Improvement'], ARRAY['Project Management', 'Agile', 'Team Leadership', 'Risk Management']),
  ('Lisa Chen', 'HR Manager', 'lisa.chen@company.com', '+1 (555) 345-6789', 'Human Resources', 'San Francisco, CA', '2021-11-20', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150', 'Active', 'COO', 5, ARRAY['Recruitment Drive', 'Employee Wellness', 'Performance Reviews'], ARRAY['HR Management', 'Recruitment', 'Employee Relations', 'Training']),
  ('David Thompson', 'Support Lead', 'david.thompson@company.com', '+1 (555) 456-7890', 'Customer Support', 'Austin, TX', '2022-07-10', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150', 'Away', 'COO', 12, ARRAY['Support Automation', 'Customer Satisfaction', 'Team Training'], ARRAY['Customer Service', 'Team Management', 'Process Improvement', 'Communication']),
  ('Sarah Williams', 'BD Manager', 'sarah.williams@company.com', '+1 (555) 567-8901', 'Business Development', 'Chicago, IL', '2021-09-05', 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150', 'Active', 'COO', 6, ARRAY['Partnership Expansion', 'Market Research', 'Sales Strategy'], ARRAY['Business Development', 'Sales', 'Market Analysis', 'Negotiation']),
  ('James Park', 'BA Lead', 'james.park@company.com', '+1 (555) 678-9012', 'Business Analysis', 'Seattle, WA', '2022-01-18', 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150', 'Active', 'COO', 4, ARRAY['Requirements Analysis', 'Process Optimization', 'Data Analytics'], ARRAY['Business Analysis', 'Data Analysis', 'Requirements Gathering', 'Process Mapping']);