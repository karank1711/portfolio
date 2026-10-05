import { getSupabase } from '../config/supabase.js';
import { missingEnv } from '../config/env.js';
import { ensureAdminFromEnv, readAdminCredentials } from '../services/adminAccount.service.js';

/**
 * Demo content for local preview.
 * Replace it from the admin panel before sharing the site.
 * Admin sign-in comes from admin/.env, not from this file.
 */
const force = process.argv.includes('--force');

const skills = [
  ['Frontend', 'React'],
  ['Frontend', 'JavaScript'],
  ['Frontend', 'HTML'],
  ['Frontend', 'CSS'],
  ['Frontend', 'Tailwind'],
  ['Backend', 'Node.js'],
  ['Backend', 'Express.js'],
  ['Backend', 'REST APIs'],
  ['Database', 'PostgreSQL'],
  ['Database', 'Supabase'],
  ['Database', 'MongoDB'],
  ['Programming', 'JavaScript'],
  ['Programming', 'Java'],
  ['Programming', 'Python'],
  ['AI / Data', 'Machine Learning'],
  ['AI / Data', 'Data Analysis'],
  ['AI / Data', 'AI APIs'],
];

const experiences = [
  {
    company: 'Northline Studio',
    role: 'Full Stack Intern',
    employment_type: 'internship',
    start_date: '2025-06-01',
    end_date: null,
    location: 'Remote',
    description: 'Demo entry. Built internal tools for content editing, API integrations, and a small design system used by the marketing site.',
    technologies: ['React', 'Node.js', 'PostgreSQL'],
    is_current: true,
    display_order: 1,
  },
  {
    company: 'Campus Labs',
    role: 'Student Developer',
    employment_type: 'part_time',
    start_date: '2024-08-01',
    end_date: '2025-05-31',
    location: 'College campus',
    description: 'Demo entry. Helped ship club websites and a registration flow used during the annual technical fest.',
    technologies: ['JavaScript', 'Express.js', 'MongoDB'],
    is_current: false,
    display_order: 2,
  },
];

const education = [
  {
    institution: 'Demo Institute of Technology',
    degree: 'B.Tech',
    specialization: 'Computer Science and Engineering',
    start_year: 2023,
    end_year: 2027,
    grade: 'In progress',
    description: 'Demo entry. Coursework across data structures, databases, and machine learning, with most of the practical work done in web projects.',
    display_order: 1,
  },
];

const projects = [
  {
    name: 'InterviewIQ',
    slug: 'interviewiq',
    short_description: 'Demo project. An interview practice space with structured questions and written feedback.',
    detailed_description: 'Demo project for layout preview. InterviewIQ collects a role, generates a short question set, and keeps notes beside each answer so practice sessions are easy to review later.',
    features: ['Role-based question sets', 'Session notes', 'Feedback summary', 'Saved practice history'],
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'AI APIs'],
    github_url: 'https://github.com/example/interviewiq',
    live_url: 'https://example.com/interviewiq',
    category: 'AI',
    is_featured: true,
    status: 'completed',
    is_published: true,
    start_date: '2025-11-01',
    end_date: '2026-02-01',
    display_order: 1,
    development_details: 'Demo write-up. The interface is a single practice view: prompt, response, and notes. The API stores sessions and calls an AI provider only when a key is configured.',
  },
  {
    name: 'Campus Pantry',
    slug: 'campus-pantry',
    short_description: 'Demo project. A small board for sharing textbooks, lab kits, and other campus items.',
    detailed_description: 'Demo project for layout preview. Listings stay short, photos are optional, and a request stays attached to the original post instead of turning into a separate chat product.',
    features: ['Photo listings', 'Request thread', 'Pickup location', 'Mark as given away'],
    technologies: ['React', 'Express.js', 'PostgreSQL'],
    github_url: 'https://github.com/example/campus-pantry',
    live_url: 'https://example.com/campus-pantry',
    category: 'Web App',
    is_featured: true,
    status: 'completed',
    is_published: true,
    start_date: '2025-03-01',
    end_date: '2025-05-20',
    display_order: 2,
    development_details: 'Demo write-up. Listings and requests are separate tables. Images are stored outside the database.',
  },
  {
    name: 'Trailnotes',
    slug: 'trailnotes',
    short_description: 'Demo project. A quiet writing desk for course notes and weekly reviews.',
    detailed_description: 'Demo project for layout preview. Trailnotes is deliberately plain: folders, markdown notes, and a weekly review page with no social features.',
    features: ['Folders', 'Markdown notes', 'Weekly review', 'Export'],
    technologies: ['React', 'Supabase', 'Tailwind'],
    github_url: 'https://github.com/example/trailnotes',
    live_url: null,
    category: 'Product',
    is_featured: false,
    status: 'in_progress',
    is_published: true,
    start_date: '2026-01-10',
    end_date: null,
    display_order: 3,
    development_details: 'Demo write-up. Notes stay in Postgres. The editor is a textarea with a rendered preview, not a full document suite.',
  },
];

const achievements = [
  {
    title: 'Demo Cloud Practitioner',
    organization: 'Example Certification Board',
    achieved_on: '2025-12-12',
    description: 'Demo certificate. Replace this with a real credential, or delete it from the admin panel.',
    verification_url: 'https://example.com/certificates/demo',
    type: 'certification',
    display_order: 1,
    is_enabled: true,
  },
  {
    title: 'Demo Hackathon Finalist',
    organization: 'College Technical Fest',
    achieved_on: '2025-04-18',
    description: 'Demo award. The team built a campus lost-and-found board over one weekend.',
    verification_url: null,
    type: 'competition',
    display_order: 2,
    is_enabled: true,
  },
];

async function main() {
  const missing = missingEnv();
  if (missing.length) {
    console.error(`Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  const supabase = getSupabase();
  const credentials = readAdminCredentials();
  if (!credentials) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in admin/.env before seeding.');
    process.exit(1);
  }
  await ensureAdminFromEnv();

  const { data: existingProfile, error: profileError } = await supabase.from('profile').select('id').limit(1).maybeSingle();
  if (profileError) throw profileError;
  if (existingProfile && !force) {
    console.log('Portfolio content already exists. Run with --force to replace demo content.');
    console.log(`Admin sign-in email: ${credentials.email}`);
    return;
  }

  if (force) {
    const tables = [
      'project_images',
      'projects',
      'contact_messages',
      'skills',
      'experiences',
      'education',
      'achievements',
      'social_links',
      'resume',
      'about',
      'profile',
    ];
    for (const table of tables) {
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
    }
  }

  const { error: profileInsertError } = await supabase.from('profile').insert({
    full_name: 'Karan Kumar',
    professional_title: 'Full Stack Developer',
    roles: ['Full Stack Developer', 'AI/ML Enthusiast'],
    short_intro: 'I build modern web applications and practical software, with a preference for clear interfaces and reliable APIs.',
    location: 'India',
    email: 'hello@example.com',
    phone: null,
  });
  if (profileInsertError) throw profileInsertError;

  const { error: aboutError } = await supabase.from('about').insert({
    summary: 'Demo profile. I enjoy shipping small, useful products: the kind of software a person can open and understand without a tour.',
    personal_intro: 'This is demo portfolio content. Replace it from the admin panel before publishing. I like working across the interface and the API, especially when a project needs both a calm design and a straightforward data model.',
    current_education: 'B.Tech in Computer Science and Engineering',
    highlights: [
      { label: 'Focus', value: 'Web applications and applied machine learning' },
      { label: 'Currently', value: 'Studying computer science' },
      { label: 'Looking for', value: 'Internships and collaborative product work' },
    ],
  });
  if (aboutError) throw aboutError;

  const { error: skillError } = await supabase.from('skills').insert(
    skills.map(([category, name], index) => ({
      name,
      category,
      display_order: index + 1,
      is_enabled: true,
    })),
  );
  if (skillError) throw skillError;

  const { error: experienceError } = await supabase.from('experiences').insert(experiences);
  if (experienceError) throw experienceError;
  const { error: educationError } = await supabase.from('education').insert(education);
  if (educationError) throw educationError;
  const { error: projectError } = await supabase.from('projects').insert(projects);
  if (projectError) throw projectError;
  const { error: achievementError } = await supabase.from('achievements').insert(achievements);
  if (achievementError) throw achievementError;
  const { error: socialError } = await supabase.from('social_links').insert([
    { platform: 'github', label: 'GitHub', url: 'https://github.com/example', display_order: 1, is_enabled: true },
    { platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/example', display_order: 2, is_enabled: true },
    { platform: 'email', label: 'Email', url: 'hello@example.com', display_order: 3, is_enabled: true },
  ]);
  if (socialError) throw socialError;
  const { error: messageError } = await supabase.from('contact_messages').insert({
    name: 'Demo Visitor',
    email: 'visitor@example.com',
    message: 'Demo message. This is here so the inbox and dashboard are not empty on first launch.',
    is_read: false,
  });
  if (messageError) throw messageError;

  console.log('Demo portfolio content is ready.');
  console.log(`Admin sign-in email: ${credentials.email}`);
  console.log('The password is ADMIN_PASSWORD in admin/.env.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
