ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS can_edit boolean NOT NULL DEFAULT false;

-- Ensure existing admins keep edit permission
UPDATE public.app_users SET can_edit = true WHERE role = 'admin';