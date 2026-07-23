-- ============================================================
-- Portfolio — full Supabase setup (tables + data + read access)
-- Paste ALL of this into Supabase → SQL Editor → New query → Run.
-- Safe to re-run: it drops and recreates the tables each time.
-- ============================================================

drop table if exists profile      cascade;
drop table if exists projects     cascade;
drop table if exists certificates cascade;
drop table if exists education    cascade;
drop table if exists achievements cascade;
drop table if exists skills       cascade;
drop table if exists socials      cascade;
drop table if exists nav_links    cascade;

-- ---------------------------- tables ----------------------------
create table profile (
  id          bigint generated always as identity primary key,
  name        text,
  short_name  text,
  role        text,
  email       text,
  resume_url  text,
  photo       text,
  created_at  timestamptz default now()
);

create table projects (
  id          bigint generated always as identity primary key,
  category    text,
  title       text,
  description text,
  tags        text[],
  image       text,
  glow        text,
  link        text,
  fit         text,
  sort_order  int,
  created_at  timestamptz default now()
);

create table certificates (
  id          bigint generated always as identity primary key,
  title       text,
  issuer      text,
  date        text,
  color       text,
  link        text,
  sort_order  int,
  created_at  timestamptz default now()
);

create table education (
  id          bigint generated always as identity primary key,
  period      text,
  cgpa        text,
  title       text,
  place       text,
  icon        text,
  color       text,
  progress    int,
  sort_order  int,
  created_at  timestamptz default now()
);

create table achievements (
  id             bigint generated always as identity primary key,
  period         text,
  cgpa           text,
  title          text,
  place          text,
  icon           text,
  color          text,
  progress       int,
  longest_streak int,
  sort_order     int,
  created_at     timestamptz default now()
);

create table skills (
  id          bigint generated always as identity primary key,
  name        text,
  icon_name   text,
  img         text,
  bg          text,
  fg          text,
  color       text,
  context     text,   -- 'orbit' or 'playground'
  sort_order  int,
  created_at  timestamptz default now()
);

create table socials (
  id          bigint generated always as identity primary key,
  label       text,
  href        text,
  icon_name   text,
  sort_order  int,
  created_at  timestamptz default now()
);

create table nav_links (
  id          bigint generated always as identity primary key,
  label       text,
  href        text,
  sort_order  int,
  created_at  timestamptz default now()
);

-- ----------------------------- data -----------------------------
insert into profile (name, short_name, role, email, resume_url, photo) values
('Vishal Kushwaha','VK','Software Developer & Web Developer','kushwahavishal296@gmail.com','#','/profile1.png');

insert into projects (category, title, description, tags, image, glow, link, fit, sort_order) values
('AI','AI WorkHub','AI WorkHub is an enterprise-grade AI-powered project management platform. It combines classic PM features (projects, Kanban boards, tasks, comments, file attachments) with an AI assistant that can break a raw project idea into actionable tasks and answer project-management questions.',ARRAY['React 19','Vite','Java 21','Spring Boot','Spring Security','Spring Data JPA','JWT (jjwt)','OpenAI'],'/portfolio-banner.svg','#22D3EE','#',null,1),
('PDF-Toolkit','PDFVish','Every PDF tool you need — in one place.',ARRAY['React','Python','Tailwind'],'/project1.png','#A855F7','https://pdfvish.onrender.com/','contain',2),
('Food & Menu','Kitchen King','Kitchen King that has daily menu as well as logs and stocks also remind for water intake.',ARRAY['React','MySql'],'/project2.jpg','#6EE7F9','https://kitchen-king.onrender.com',null,3),
('E-Commerce','Vi-mmerce','Creating a E-Commerce website',ARRAY['Node.js','React js','Springboot','MySql','Redis'],'/ecommerce.svg','#3B82F6','#',null,4);

insert into certificates (title, issuer, date, color, link, sort_order) values
('Python From Scratch','CodeWithHarry','June 2026','#C8881F','#',1),
('AWS from Scratch','Telusko','July 2026','#2496ED','#',2),
('Generative AI','Aakriti E-Learning Academy','April 2026','#3E7C97','#',3),
('Full Stack Web Developer','Google Cloud','Oct 2024','#2D5B9E','#',4),
('UI/UX Design Professional','Adobe','Sep 2024','#B23A63','#',5);

insert into education (period, cgpa, title, place, icon, color, progress, sort_order) values
('2021-2025','Secured 8.07 CGPA','B.Tech, Computer Science & Engineering','Maharana Pratap Engineering College, Kanpur','🎓','#22D3EE',100,1),
('2019-2021','Secured 76.8%','Higher Secondary','J.R.Convent School','🏫','#34D399',100,2),
('2018–2019','Secured 78.2%','Secondary Education','J.R.Convent School','🏛️','#F472B6',100,3);

insert into achievements (period, cgpa, title, place, icon, color, progress, longest_streak, sort_order) values
('2024','National Level','Coding Challenge','Naukri Campus Young Turks Coding - Ranked #41','🏆','#FBBF24',96,150,1),
('2023','Top 1%','TECH-A-THON','MPGI TECH-A-THON','⭐','#A855F7',95,null,2);

insert into skills (name, icon_name, img, bg, fg, color, context, sort_order) values
('JavaScript','SiJavascript',null,null,null,'#F7DF1E','orbit',1),
('Java','FaJava',null,null,null,'#E76F00','orbit',2),
('Python','SiPython',null,null,null,'#3776AB','orbit',3),
('React','SiReact',null,null,null,'#61DAFB','orbit',4),
('HTML5','SiHtml5',null,null,null,'#E34F26','orbit',5),
('CSS3','SiCss',null,null,null,'#1572B6','orbit',6),
('Tailwind','SiTailwindcss',null,null,null,'#38BDF8','orbit',7),
('MongoDB','SiMongodb',null,null,null,'#47A248','orbit',8),
('MySQL','SiMysql',null,null,null,'#4479A1','orbit',9),
('Git','SiGit',null,null,null,'#F05033','orbit',10),
('JavaScript','SiJavascript',null,'#F7DF1E','#000000',null,'playground',11),
('Java','FaJava',null,'#E76F00','#FFFFFF',null,'playground',12),
('Python','SiPython',null,'#3776AB','#FFFFFF',null,'playground',13),
('React','SiReact',null,'#22D3EE','#000000',null,'playground',14),
('HTML5','SiHtml5',null,'#E34F26','#FFFFFF',null,'playground',15),
('CSS3','SiCss',null,'#1572B6','#FFFFFF',null,'playground',16),
('Tailwind','SiTailwindcss',null,'#38BDF8','#FFFFFF',null,'playground',17),
('Node.js','SiNodedotjs',null,'#3C873A','#FFFFFF',null,'playground',18),
('Express','SiExpress',null,'#A8A8A8','#000000',null,'playground',19),
('MongoDB','SiMongodb',null,'#47A248','#FFFFFF',null,'playground',20),
('MySQL','SiMysql',null,'#4479A1','#FFFFFF',null,'playground',21),
('Docker','SiDocker',null,'#2496ED','#FFFFFF',null,'playground',22),
('Git','SiGit',null,'#F05033','#FFFFFF',null,'playground',23),
('Render','SiRender',null,'#46E3B7','#000000',null,'playground',24),
('Vercel','SiVercel',null,'#FFFFFF','#000000',null,'playground',25),
('Aiven',null,'/aiven.svg','#FF3554','#FFFFFF',null,'playground',26);

insert into socials (label, href, icon_name, sort_order) values
('GitHub','https://github.com/vishalk2309','FaGithub',1),
('LinkedIn','https://linkedin.com/in/vishalkumarkushwaha','FaLinkedin',2),
('Email','mailto:kushwahavishal296@gmail.com','FaEnvelope',3);

insert into nav_links (label, href, sort_order) values
('About','#about',1),
('Projects','#projects',2),
('Experience','#experience',3),
('Skills','#skills',4),
('Contact','#contact',5);

-- ------------------- public read-only access --------------------
-- Turns on Row Level Security and lets ANYONE read (your live site),
-- while nobody can write yet. We'll add owner-only write in Phase 3.
do $$
declare t text;
begin
  foreach t in array array['profile','projects','certificates','education',
                           'achievements','skills','socials','nav_links']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "public read %1$s" on %1$I;', t);
    execute format('create policy "public read %1$s" on %1$I for select using (true);', t);
  end loop;
end $$;
