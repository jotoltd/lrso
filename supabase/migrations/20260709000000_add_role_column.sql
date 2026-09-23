-- Add role column to admin_users table
alter table public.admin_users add column if not exists role text not null default 'Staff';

-- Update existing users to have Admin role
update public.admin_users set role = 'Admin' where username in ('admin', 'Josh');

-- Add check constraint for valid roles
alter table public.admin_users add constraint valid_role check (role in ('Admin', 'Staff'));
