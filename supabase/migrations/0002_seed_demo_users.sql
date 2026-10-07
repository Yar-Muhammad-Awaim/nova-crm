-- 0002 — seed the ten demo accounts
-- Idempotent: re-running this will NOT duplicate users.
-- Passwords are hashed by Postgres itself, so no plaintext is stored anywhere.

create extension if not exists pgcrypto with schema extensions;

insert into users (id, name, email, password_hash, role, specialization, skills) values
 ('ADMIN','Admin',      'admin@novaworks.example',  extensions.crypt('Demo123!', extensions.gen_salt('bf')), 'ADMIN',   'Administrator', array['Company overview','Transcript creation']),
 ('PM01', 'Ayesha Khan','ayesha@novaworks.example', extensions.crypt('Demo123!', extensions.gen_salt('bf')), 'MANAGER', 'Web PM',        array['Web projects','Client coordination']),
 ('PM02', 'Bilal Ahmed','bilal@novaworks.example',  extensions.crypt('Demo123!', extensions.gen_salt('bf')), 'MANAGER', 'Mobile PM',     array['Mobile projects','Delivery planning']),
 ('PM03', 'Hina Malik', 'hina@novaworks.example',   extensions.crypt('Demo123!', extensions.gen_salt('bf')), 'MANAGER', 'AI PM',         array['AI projects','Requirement review']),
 ('DEV01','Ali Raza',   'ali@novaworks.example',    extensions.crypt('Demo123!', extensions.gen_salt('bf')), 'AGENT',   'Full-Stack',    array['React','Frontend integration']),
 ('DEV02','Hamza Shah', 'hamza@novaworks.example',  extensions.crypt('Demo123!', extensions.gen_salt('bf')), 'AGENT',   'Full-Stack',    array['Node.js','Databases','APIs']),
 ('DEV03','Sara Noor',  'sara@novaworks.example',   extensions.crypt('Demo123!', extensions.gen_salt('bf')), 'AGENT',   'App Developer', array['Flutter','Mobile UI']),
 ('DEV04','Usman Tariq','usman@novaworks.example',  extensions.crypt('Demo123!', extensions.gen_salt('bf')), 'AGENT',   'App Developer', array['Flutter','Integration','Testing']),
 ('DEV05','Zain Abbas', 'zain@novaworks.example',   extensions.crypt('Demo123!', extensions.gen_salt('bf')), 'AGENT',   'AI Developer',  array['LLMs','Extraction','Prompts']),
 ('DEV06','Maryam Asif','maryam@novaworks.example', extensions.crypt('Demo123!', extensions.gen_salt('bf')), 'AGENT',   'AI Developer',  array['Retrieval','Document processing'])
on conflict (email) do nothing;
