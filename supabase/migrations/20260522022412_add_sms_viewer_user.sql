-- Add viewer-only user "Sms" used for the mobile student card view
insert into public.app_users (username, password, role, can_edit)
values ('Sms', 'sMs@@min', 'user', false)
on conflict (username) do nothing;
