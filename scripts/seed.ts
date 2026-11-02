import { config as loadEnv } from 'dotenv';
import { promises as fs } from 'node:fs';
import type { Dirent } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createId } from '@paralleldrive/cuid2';
import { PDFParse } from 'pdf-parse';
import postgres from 'postgres';
import type { InferInsertModel } from 'drizzle-orm';
import { normalizeAboutSkills } from '../src/lib/about-skills';

loadEnv({ path: '.env.local' });
loadEnv();

type SchemaModule = typeof import('../src/lib/db/schema');
type DbModule = typeof import('../src/lib/db');

type AboutInsert = InferInsertModel<SchemaModule['aboutMe']>;
type AchievementInsert = InferInsertModel<SchemaModule['achievements']>;
type KnowledgeDocInsert = InferInsertModel<SchemaModule['knowledgeDocs']>;
type ProfileLinkInsert = InferInsertModel<SchemaModule['profileLinks']>;
type ProjectInsert = InferInsertModel<SchemaModule['projects']>;
type AdminRuntime = {
  db: DbModule['db'];
  aboutMe: SchemaModule['aboutMe'];
  achievements: SchemaModule['achievements'];
  knowledgeDocs: SchemaModule['knowledgeDocs'];
  profileLinks: SchemaModule['profileLinks'];
  projects: SchemaModule['projects'];
};

type SeedExperience = {
  type: string;
  title: string;
  organization: string;
  startDate: string;
  endDate?: string | null;
  location?: string;
  description?: string;
};

type FreelanceProfileSeed = {
  hourlyRate: number;
  currency: string;
  completedProjects: number;
  pricingNotes: string;
  featurePricing: Array<{
    feature: string;
    price: number;
    notes?: string;
    relatedProjectSlugs?: string[];
  }>;
  projectReferences: Array<{
    slug: string;
    title: string;
    notes?: string;
  }>;
};

type JsonKnowledgeEntry = {
  text: string;
  metadata?: {
    sumber?: string;
    kategori?: string;
    atribut?: string;
    [key: string]: unknown;
  };
};

type JsonKnowledgeFile = {
  data?: JsonKnowledgeEntry[];
};

type SeedProject = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  techStack: string[];
  tags: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  featured: boolean;
  visible: boolean;
  order: number;
  projectDate: string;
  contexts: Array<{
    type:
      | 'CONTEXT'
      | 'ROLE'
      | 'DECISIONS'
      | 'TRADEOFFS'
      | 'RESULT'
      | 'ARCHITECTURE'
      | 'OPERATIONS'
      | 'METRICS';
    title: string;
    content: string;
  }>;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../..');
const dataDir = path.join(repoRoot, 'data');

const PROTECTED_ATTRIBUTES = new Set([
  'tempat_tanggal_lahir',
  'tanggal_lahir',
  'usia',
  'golongan_darah',
  'agama',
  'jenis_kelamin_agama',
  'informasi_hubungan',
]);

const PROTECTED_CATEGORIES = new Set(['pacar']);

const PROTECTED_TEXT_PATTERNS = [
  /golongan darah/i,
  /beragama/i,
  /agama/i,
  /lahir di .*\d{4}/i,
  /usia .*\d+/i,
  /pasangan/i,
  /hubungan sejak/i,
  /anak pertama/i,
  /dua bersaudara/i,
  /ayah/i,
  /ibu/i,
  /saudara/i,
  /siblings?/i,
  /religion/i,
  /blood type/i,
  /relationship/i,
];

const PUBLIC_PROFILE = {
  fullName: 'Naufal Rizqullah Firdaus',
  tagline: 'Web Developer & Hardware Engineer',
  roles: ['Web Developer', 'Hardware Engineer', 'Computer Engineering Student'],
  shortBio:
    'Computer Engineering student focused on web development, IoT systems, and AI-powered solutions that are practical, scalable, and easy to use.',
  bio: 'My name is Naufal, and I am a Computer Engineering student with a strong focus on web development, the Internet of Things (IoT), and artificial intelligence (AI). Through practical projects, technology competitions, and internships, I have gained hands-on expertise in building full-stack applications, integrating IoT devices with cloud platforms, and designing data-driven smart solutions.\n\nI have experience in end-to-end system architecture, collaborative teamwork, and technology research, with a deep interest in how AI and IoT can enhance efficiency and unlock new opportunities for innovation. Flexible and analytical, I am committed to delivering functional, impactful, and sustainable solutions.',
  email: 'contact@naufalrf.net',
  phone: '+62 859-7494-0903',
  location: 'Depok, Indonesia',
  availabilityStatus: 'available' as const,
  skills: normalizeAboutSkills([
    'Next.js',
    'React',
    'TypeScript',
    'JavaScript',
    'Node.js',
    'Express.js',
    'PostgreSQL',
    'MySQL',
    'Supabase',
    'Tailwind CSS',
    'Python',
    'Bash',
    'Docker',
    'IoT',
    'ESP32',
    'MQTT',
    'RAG Workflows',
    'OpenAI API',
    'LangChain',
    'AI Integration',
    'Workflow Automation',
    'Figma',
    'Postman',
    'Git',
    'AWS S3',
  ]),
  experience: [
    {
      type: 'Work',
      title: 'Class Manager, Digistar Class Internship',
      organization: 'PT Telkom Indonesia',
      startDate: '2025-03-01',
      endDate: null,
      location: 'Jakarta, Indonesia',
      description:
        'Facilitated requirement clarification and technical guidance between mentors and mentees, supervised RAG and AI content capstone projects, and supported solution troubleshooting throughout the program.',
    },
    {
      type: 'Work',
      title: 'Hardware Engineering Intern',
      organization: 'PT Nutech Integrasi (TelkomGroup)',
      startDate: '2025-02-01',
      endDate: '2025-07-31',
      location: 'Jakarta, Indonesia',
      description:
        'Built a real-time power monitoring system using ESP32 and MQTT, and developed a full-stack visitor management system with face recognition, NFC authentication, and an operational dashboard.',
    },
    {
      type: 'Education',
      title: 'Computer Engineering Technology',
      organization: 'IPB University',
      startDate: '2022-08-01',
      endDate: '2026-08-31',
      location: 'Bogor, West Java',
      description:
        'Bachelor of Applied Science track with a focus on web programming, embedded systems, machine learning, and software engineering.',
    },
    {
      type: 'Education',
      title: 'Computer & Network Engineering',
      organization: 'SMKS Nasional Depok',
      startDate: '2019-07-01',
      endDate: '2022-06-30',
      location: 'Depok, West Java',
      description:
        'Built strong networking, server configuration, and IT infrastructure fundamentals through hands-on technical projects.',
    },
    {
      type: 'Organizational',
      title: 'Co-Lead Chapter IPB University',
      organization: 'GDGoC IPB',
      startDate: '2025-09-01',
      endDate: null,
      location: 'Bogor, West Java',
      description:
        'Helped lead chapter activities, community programs, and digital workflows for the campus Google Developer Group community.',
    },
    {
      type: 'Organizational',
      title: 'Digital Network Club Ranger (Event & Creative)',
      organization: 'Digistar Club',
      startDate: '2024-07-01',
      endDate: null,
      location: 'Remote',
      description:
        'Supported event execution, digital workflows, and community engagement initiatives for Digistar Club by Telkom Indonesia.',
    },
    {
      type: 'Organizational',
      title: 'Staff & Webmaster Mentorship',
      organization: 'Himavo Micro IT Community',
      startDate: '2022-11-01',
      endDate: '2024-11-30',
      location: 'Bogor, West Java',
      description:
        'Mentored students in web and IT fundamentals, contributed to major programs, and improved the community website and learning workflows.',
    },
    {
      type: 'Certification',
      title: 'AWS Academy Cloud Architecting',
      organization: 'Amazon Web Services',
      startDate: '2024-02-01',
      endDate: null,
      description:
        'Cloud architecture training focused on scalable solutions, system design, and modern cloud delivery practices.',
    },
    {
      type: 'Certification',
      title: 'CCNA: Switching, Routing, and Wireless Essentials',
      organization: 'Cisco',
      startDate: '2023-12-01',
      endDate: null,
      description:
        'Networking and security certification covering routing, switching, wireless essentials, and network operations.',
    },
    {
      type: 'Certification',
      title: 'Learning Next.js',
      organization: 'LinkedIn Learning',
      startDate: '2023-12-01',
      endDate: null,
      description:
        'Framework training focused on building modern web applications with Next.js and React.',
    },
  ] satisfies SeedExperience[],
  freelanceProfile: {
    hourlyRate: 150000,
    currency: 'IDR',
    completedProjects: 12,
    pricingNotes:
      'Use this profile only for pricing and freelance-intent tool workflows. Final quotes still depend on scope, integrations, and delivery risk.',
    featurePricing: [
      {
        feature: 'Drizzle authentication system',
        price: 1000000,
        notes: 'Includes credential auth, session wiring, and protected dashboard access.',
        relatedProjectSlugs: ['naufalrf-portfolio'],
      },
      {
        feature: 'Admin dashboard CRUD module',
        price: 1500000,
        notes: 'Reference for scoped dashboard content management work.',
        relatedProjectSlugs: ['naufalrf-portfolio'],
      },
    ],
    projectReferences: [
      {
        slug: 'naufalrf-portfolio',
        title: 'NaufalRF Portfolio Platform',
        notes: 'Multi-app portfolio platform with Admin, public apps, and RAG service.',
      },
    ],
  } satisfies FreelanceProfileSeed,
};

const PUBLIC_PROJECTS: SeedProject[] = [
  {
    title: 'Infinitigroup HRIS : MBO Module',
    slug: 'infinitigroup-hris-mbo-module',
    summary:
      'An internal HRIS module for objective setting, KPI tracking, and structured performance evaluation.',
    description:
      'This project involved the development of an internal HRIS module to support Management by Objectives based performance appraisal within Infinitigroup. The system helps HR teams and managers define objectives, monitor progress, and conduct structured employee evaluations in one centralized platform. The application was built with a focus on data consistency, scalability, and ease of use to support internal HR workflows.',
    category: 'Web Development',
    techStack: ['Next.js', 'Tailwind CSS', 'PostgreSQL'],
    tags: ['HRIS', 'Performance Management', 'Internal Tools'],
    liveUrl: 'https://mbo-demo.wisebyte.web.id',
    repoUrl: null,
    featured: true,
    visible: true,
    order: 0,
    projectDate: '2025',
    contexts: [
      {
        type: 'CONTEXT',
        title: 'Business Context',
        content:
          'Built to support Management by Objectives based performance appraisal in an internal HR workflow.',
      },
      {
        type: 'OPERATIONS',
        title: 'Core Features',
        content:
          'Employee objective and KPI management, performance evaluation tracking, and a secure internal system with structured relational data.',
      },
      {
        type: 'RESULT',
        title: 'Implementation Focus',
        content:
          'Prioritized data consistency, scalability, and ease of use so HR teams and managers could manage objectives and evaluations in one place.',
      },
    ],
  },
  {
    title: 'Indonesia Human Development Center',
    slug: 'indonesia-human-development-center',
    summary:
      'A clean, responsive landing page for programs, initiatives, and organizational information.',
    description:
      'This project involved building a static landing page to present programs, initiatives, and organizational information for Indonesia Human Development Center. The website was designed to be clean, accessible, and easy to navigate across different devices. The main focus of this project was on responsive layout implementation and clear information delivery using a modern frontend stack.',
    category: 'Web Development',
    techStack: ['React', 'Tailwind CSS', 'Static Site'],
    tags: ['Landing Page', 'Institutional Website', 'Responsive UI'],
    liveUrl: 'https://www.idn-hdc.id/',
    repoUrl: null,
    featured: false,
    visible: true,
    order: 1,
    projectDate: '2025',
    contexts: [
      {
        type: 'CONTEXT',
        title: 'Website Goal',
        content:
          'Created to communicate programs, initiatives, and organizational information for Indonesia Human Development Center.',
      },
      {
        type: 'OPERATIONS',
        title: 'Core Features',
        content:
          'Responsive and mobile-friendly layout, clear institutional information structure, and lightweight static pages with fast load performance.',
      },
      {
        type: 'RESULT',
        title: 'Delivery Focus',
        content:
          'Optimized for accessibility, clarity, and multi-device navigation instead of complex application workflows.',
      },
    ],
  },
  {
    title: 'Siap Impact SAKINA',
    slug: 'siap-impact-sakina',
    summary:
      'A registration and submission management platform for a national program under Kemendukbangga.',
    description:
      'This platform was developed to support the online registration process for the Siap Impact SAKINA program under the Ministry of Population and Family Development (Kemendukbangga). The system enables participants to register digitally while allowing organizers to manage submissions more efficiently. The project focuses on delivering a smooth registration experience and reliable data handling for program administration.',
    category: 'Web Development',
    techStack: ['Laravel', 'React', 'Tailwind CSS', 'MySQL'],
    tags: ['Registration Platform', 'Government Program', 'Admin Dashboard'],
    liveUrl: 'https://siapimpact.kemendukbangga.id',
    repoUrl: null,
    featured: true,
    visible: true,
    order: 2,
    projectDate: '2025',
    contexts: [
      {
        type: 'CONTEXT',
        title: 'Program Context',
        content:
          'Built for the Siap Impact SAKINA program to handle online participant registration and organizer administration.',
      },
      {
        type: 'OPERATIONS',
        title: 'Core Features',
        content:
          'Online participant registration, structured organizer data management, and a responsive interface for desktop and mobile users.',
      },
      {
        type: 'RESULT',
        title: 'Outcome',
        content:
          'Focused on a smooth registration flow and reliable submission handling for public-facing program operations.',
      },
    ],
  },
  {
    title: 'ELSA IoT',
    slug: 'elsa-iot',
    summary:
      'A lightweight real-time water quality monitoring system with cloud synchronization and a responsive dashboard.',
    description:
      'ELSA IoT is a lightweight real time water quality monitoring system designed as a simplified version of SIMONAIR. The system focuses on essential monitoring needs while maintaining reliable data transmission and accessibility. I built this system by integrating ESP32 S3 with cloud based data storage and a web dashboard, enabling users to monitor sensor data remotely through a responsive interface.',
    category: 'IoT & Web Development',
    techStack: ['ESP32-S3', 'Next.js', 'Tailwind CSS', 'Firebase'],
    tags: ['IoT', 'Water Quality', 'Dashboard'],
    liveUrl: 'https://elsaiot.web.id',
    repoUrl: null,
    featured: true,
    visible: true,
    order: 3,
    projectDate: '2025',
    contexts: [
      {
        type: 'CONTEXT',
        title: 'Monitoring Context',
        content:
          'Designed as a lightweight version of SIMONAIR to cover essential water quality monitoring needs.',
      },
      {
        type: 'ARCHITECTURE',
        title: 'Technical Approach',
        content:
          'Integrated ESP32 S3 hardware with cloud-based storage and a responsive web dashboard for remote monitoring.',
      },
      {
        type: 'OPERATIONS',
        title: 'Core Features',
        content:
          'Real-time water quality monitoring, cloud synchronization, and responsive multi-device dashboard access.',
      },
    ],
  },
  {
    title: 'SIMONAIR 4.0',
    slug: 'simonair-4-0',
    summary:
      'An academic IoT dashboard for freshwater ornamental fish aquarium water quality monitoring.',
    description:
      'SIMONAIR 4.0 is the fourth iteration of an ongoing project developed for academic research, designed to monitor the water quality of freshwater ornamental fish aquariums. I independently built this system from start to finish, connecting pH, TDS, DO, and temperature sensors to a Raspberry Pi 4, transmitting data via MQTT, and displaying it through a web dashboard optimized for mobile devices. This platform provides real-time insights to support better fish care and informed decision-making in fish farming practices.',
    category: 'IoT & Web Development',
    techStack: ['React', 'Tailwind CSS', 'Raspberry Pi 4', 'MQTT'],
    tags: ['IoT', 'Academic Research', 'Monitoring'],
    liveUrl: 'https://simonair.web.id',
    repoUrl: null,
    featured: true,
    visible: true,
    order: 4,
    projectDate: '2025',
    contexts: [
      {
        type: 'CONTEXT',
        title: 'Research Context',
        content:
          'Built as the fourth iteration of an academic research project for freshwater ornamental fish aquarium monitoring.',
      },
      {
        type: 'ARCHITECTURE',
        title: 'Technical Approach',
        content:
          'Connected pH, TDS, DO, and temperature sensors to Raspberry Pi 4, transmitted data via MQTT, and rendered it in a mobile-optimized dashboard.',
      },
      {
        type: 'RESULT',
        title: 'Impact',
        content:
          'Delivered real-time insights to support fish care and more informed operational decision-making.',
      },
    ],
  },
  {
    title: 'GDGoC IPB University',
    slug: 'gdgoc-ipb-university',
    summary:
      'A community registration platform for core team members, mentors, and active members.',
    description:
      'As part of the Google Developer Group on Campus (GDGoC) IPB, I designed and built a registration platform to simplify the registration process for prospective core team members, mentors, and active members independently. This platform simplifies the registration process and improves overall community management. Built using Next.js and Supabase, the system ensures secure data handling and multi-device accessibility. It reduces manual errors, saves significant administrative time, and increases participation in the community.',
    category: 'Web Development',
    techStack: ['Next.js', 'Tailwind CSS', 'Supabase'],
    tags: ['Community Platform', 'Registration', 'Operations'],
    liveUrl: 'https://gdgipb.site',
    repoUrl: null,
    featured: false,
    visible: true,
    order: 5,
    projectDate: '2025',
    contexts: [
      {
        type: 'CONTEXT',
        title: 'Community Context',
        content:
          'Built to simplify the registration process for prospective core team members, mentors, and active members in GDGoC IPB.',
      },
      {
        type: 'ARCHITECTURE',
        title: 'Technical Stack',
        content:
          'Implemented with Next.js and Supabase to support secure structured data handling and responsive multi-device access.',
      },
      {
        type: 'RESULT',
        title: 'Operational Value',
        content:
          'Reduced manual errors, saved administrative time, and improved participation in the community.',
      },
    ],
  },
  {
    title: 'Visitor Management System',
    slug: 'visitor-management-system',
    summary:
      'A full-stack workplace security and attendance system with face recognition and NFC authentication.',
    description:
      'This project was developed independently during an internship at PT Nutech Integrasi, with a focus on improving workplace security and attendance automation. I built a full-stack system using React, Express, and PostgreSQL, and implemented facial scanning and NFC card readers for secure identity verification. This solution streamlines the check-in process for employees and visitors, reducing manual work while strengthening access security.',
    category: 'IoT & Web Development',
    techStack: ['React', 'Tailwind CSS', 'Express.js', 'PostgreSQL'],
    tags: ['Security', 'Attendance', 'Internship Project'],
    liveUrl: null,
    repoUrl: null,
    featured: false,
    visible: true,
    order: 6,
    projectDate: '2025',
    contexts: [
      {
        type: 'CONTEXT',
        title: 'Internship Context',
        content:
          'Developed independently during an internship at PT Nutech Integrasi to improve workplace security and attendance automation.',
      },
      {
        type: 'ARCHITECTURE',
        title: 'Technical Stack',
        content:
          'Built as a full-stack system with React, Express, and PostgreSQL plus face recognition and NFC card readers for identity verification.',
      },
      {
        type: 'RESULT',
        title: 'Operational Value',
        content:
          'Reduced manual check-in work while strengthening access security and improving reliability for employees and visitors.',
      },
    ],
  },
];

const PUBLIC_ACHIEVEMENTS: Array<
  Pick<
    AchievementInsert,
    'name' | 'location' | 'monthYear' | 'description' | 'externalUrl' | 'order' | 'visible'
  > & { photos: string[] }
> = [
  {
    name: '3rd Place Gelar Pangan Kreatif',
    location: 'Universitas Terbuka',
    monthYear: '2023',
    description:
      'Recognized for contributing to a creative food-education video project that combined storytelling, editing, and public communication.',
    externalUrl: null,
    order: 0,
    visible: true,
    photos: [],
  },
  {
    name: '1st Place Festival Teknik Informatika',
    location: 'Universitas Darussalam Gontor',
    monthYear: '2023',
    description:
      'Won the web landing page competition through IslamicVerse, an AI-enabled platform for digital Islamic information and services.',
    externalUrl: null,
    order: 1,
    visible: true,
    photos: [],
  },
  {
    name: '1st Place Dinus Application Competition',
    location: 'Universitas Dian Nuswantoro',
    monthYear: '2024',
    description:
      'Won DINACOM 2024 with SEMAPOR (Semarang Lapor), a civic reporting platform built to improve public issue reporting and resolution workflows.',
    externalUrl: null,
    order: 2,
    visible: true,
    photos: [],
  },
  {
    name: '1st Place JIASIC Hackathon Java Business Competition',
    location: 'Telkom University',
    monthYear: '2024',
    description:
      'Won JIASIC Hackathon 2024 with ReneU, an AI-driven renewable energy marketplace concept focused on adoption and education.',
    externalUrl: null,
    order: 3,
    visible: true,
    photos: [],
  },
  {
    name: 'Most Outstanding Student of Computer Engineering Technology',
    location: 'IPB University',
    monthYear: '2024',
    description:
      'Selected as a standout student in the Computer Engineering Technology program for technical achievement and contribution.',
    externalUrl: null,
    order: 4,
    visible: true,
    photos: [],
  },
  {
    name: 'Speaker at Digistar Club: Introduction Computer Vision #1',
    location: 'Digistar Club',
    monthYear: '2025',
    description:
      'Invited as a speaker to share practical computer vision knowledge with the Digistar Club community.',
    externalUrl: null,
    order: 5,
    visible: true,
    photos: [],
  },
  {
    name: '3rd Place Student Innovation Competition in Climate, Energy, and Sustainability',
    location: 'Universitas Hasanuddin',
    monthYear: '2025',
    description:
      'Recognized for an innovation project in the climate, energy, and sustainability domain.',
    externalUrl: null,
    order: 6,
    visible: true,
    photos: [],
  },
];

const PROFILE_LINKS: Array<
  Pick<ProfileLinkInsert, 'label' | 'url' | 'icon' | 'order' | 'visible'>
> = [
  {
    label: 'About Me',
    url: 'https://naufalrf.net/about',
    icon: 'website',
    order: 0,
    visible: true,
  },
  {
    label: 'Featured Projects',
    url: 'https://naufalrf.net/projects',
    icon: 'code',
    order: 1,
    visible: true,
  },
  {
    label: 'AI Chat About Naufal',
    url: 'https://naufalrf.net/ai-chatbot',
    icon: 'code',
    order: 2,
    visible: true,
  },
  {
    label: 'Read Blogs',
    url: 'https://naufalrf.net/blogs',
    icon: 'blog',
    order: 3,
    visible: true,
  },
  {
    label: 'Get In Touch',
    url: 'https://naufalrf.net/contact',
    icon: 'website',
    order: 4,
    visible: true,
  },
  {
    label: 'WhatsApp Me',
    url: 'https://wa.me/6285974940903',
    icon: 'website',
    order: 5,
    visible: true,
  },
  {
    label: 'Email Me',
    url: 'mailto:contact@naufalrf.net',
    icon: 'website',
    order: 6,
    visible: true,
  },
];

function uniqueSkills(values: Array<{ name: string; level: number; category: string }>) {
  const seen = new Set<string>();

  return values.filter((skill) => {
    const key = `${skill.category}:${skill.name.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function formatRange(startDate: string, endDate?: string | null): string {
  const start = new Date(startDate);
  const startLabel = Number.isNaN(start.getTime())
    ? startDate
    : start.toLocaleString('en-US', { month: 'short', year: 'numeric' });

  if (!endDate) {
    return `${startLabel} - Present`;
  }

  const end = new Date(endDate);
  const endLabel = Number.isNaN(end.getTime())
    ? endDate
    : end.toLocaleString('en-US', { month: 'short', year: 'numeric' });

  return `${startLabel} - ${endLabel}`;
}

function buildAboutRow(now: string): AboutInsert {
  return {
    id: createId(),
    fullName: PUBLIC_PROFILE.fullName,
    tagline: PUBLIC_PROFILE.tagline,
    roles: PUBLIC_PROFILE.roles,
    shortBio: PUBLIC_PROFILE.shortBio,
    bio: PUBLIC_PROFILE.bio,
    email: PUBLIC_PROFILE.email,
    phone: PUBLIC_PROFILE.phone,
    location: PUBLIC_PROFILE.location,
    avatarUrl: null,
    resumeUrl: null,
    availabilityStatus: PUBLIC_PROFILE.availabilityStatus,
    skills: uniqueSkills(PUBLIC_PROFILE.skills),
    experience: PUBLIC_PROFILE.experience,
    freelanceProfile: PUBLIC_PROFILE.freelanceProfile,
    createdAt: now,
    updatedAt: now,
  };
}

function buildProjectRows(now: string): ProjectInsert[] {
  return PUBLIC_PROJECTS.map((project) => ({
    id: createId(),
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    description: project.description,
    category: project.category,
    techStack: project.techStack,
    tags: project.tags,
    liveUrl: project.liveUrl,
    repoUrl: project.repoUrl,
    featured: project.featured,
    visible: project.visible,
    order: project.order,
    projectDate: project.projectDate,
    startDate: null,
    endDate: null,
    imageUrl: null,
    thumbnailId: null,
    content: buildProjectContent(project.contexts),
    createdAt: now,
    updatedAt: now,
  }));
}

function buildProjectContent(
  contexts: Array<{ title: string; content: string }> | undefined
): string | null {
  if (!contexts || contexts.length === 0) {
    return null;
  }

  return contexts.map((context) => `## ${context.title}\n\n${context.content.trim()}`).join('\n\n');
}

function buildAchievementRows(now: string): AchievementInsert[] {
  return PUBLIC_ACHIEVEMENTS.map((achievement) => ({
    id: createId(),
    name: achievement.name,
    location: achievement.location,
    monthYear: achievement.monthYear,
    description: achievement.description,
    externalUrl: achievement.externalUrl,
    order: achievement.order,
    visible: achievement.visible,
    photos: achievement.photos,
    createdAt: now,
    updatedAt: now,
  }));
}

function buildProfileLinkRows(now: string): ProfileLinkInsert[] {
  return PROFILE_LINKS.map((link) => ({
    id: createId(),
    label: link.label,
    url: link.url,
    icon: link.icon,
    order: link.order,
    visible: link.visible,
    createdAt: now,
    updatedAt: now,
  }));
}

function shouldExcludeKnowledgeEntry(entry: JsonKnowledgeEntry): boolean {
  const kategori = entry.metadata?.kategori?.toLowerCase();
  const atribut = entry.metadata?.atribut?.toLowerCase();

  if (
    (kategori && PROTECTED_CATEGORIES.has(kategori)) ||
    (atribut && PROTECTED_ATTRIBUTES.has(atribut))
  ) {
    return true;
  }

  return PROTECTED_TEXT_PATTERNS.some((pattern) => pattern.test(entry.text));
}

function sanitizeKnowledgeText(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !PROTECTED_TEXT_PATTERNS.some((pattern) => pattern.test(line)))
    .join('\n');
}

async function readJsonKnowledgeDoc(fileName: string): Promise<string | null> {
  const filePath = path.join(dataDir, fileName);
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as JsonKnowledgeFile;
  const safeEntries = (parsed.data ?? []).filter((entry) => !shouldExcludeKnowledgeEntry(entry));

  if (safeEntries.length === 0) {
    return null;
  }

  const lines = safeEntries.map((entry) => {
    const category = entry.metadata?.kategori ?? 'unknown';
    const attribute = entry.metadata?.atribut ?? 'unknown';
    return `- [${category}/${attribute}] ${entry.text.trim()}`;
  });

  return `# ${fileName}\n\n${lines.join('\n')}`;
}

async function readPdfText(fileName: string): Promise<string | null> {
  const filePath = path.join(dataDir, fileName);
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  try {
    const result = await parser.getText();
    const text = sanitizeKnowledgeText(result.text);
    return text.length > 0 ? `# ${fileName}\n\n${text}` : null;
  } finally {
    await parser.destroy();
  }
}

async function buildKnowledgeDocs(now: string): Promise<KnowledgeDocInsert[]> {
  let dataEntries: Dirent<string>[] = [];

  try {
    dataEntries = await fs.readdir(dataDir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  const supportedFiles = dataEntries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => /\.(json|pdf)$/i.test(fileName))
    .sort((left, right) => left.localeCompare(right));

  const docs: KnowledgeDocInsert[] = [];

  for (const fileName of supportedFiles) {
    const extension = path.extname(fileName).toLowerCase();
    const content =
      extension === '.json' ? await readJsonKnowledgeDoc(fileName) : await readPdfText(fileName);

    if (!content) {
      continue;
    }

    docs.push({
      id: createId(),
      filename: `${fileName}.md`,
      content,
      indexed: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  docs.push({
    id: createId(),
    filename: 'public-profile-seed.md',
    content: [
      '# Public Profile Seed',
      '',
      `Full Name: ${PUBLIC_PROFILE.fullName}`,
      `Tagline: ${PUBLIC_PROFILE.tagline}`,
      `Location: ${PUBLIC_PROFILE.location}`,
      `Email: ${PUBLIC_PROFILE.email}`,
      `Phone: ${PUBLIC_PROFILE.phone}`,
      `Roles: ${PUBLIC_PROFILE.roles.join(', ')}`,
      '',
      '## Skills',
      ...PUBLIC_PROFILE.skills.map((skill) => `- ${skill}`),
      '',
      '## Experience',
      ...PUBLIC_PROFILE.experience.map(
        (item) =>
          `- [${item.type}] ${item.title} @ ${item.organization} (${formatRange(item.startDate, item.endDate)})${item.description ? ` - ${item.description}` : ''}`
      ),
    ].join('\n'),
    indexed: false,
    createdAt: now,
    updatedAt: now,
  });

  return docs;
}

async function loadAdminRuntime(): Promise<AdminRuntime> {
  const [{ db }, schema] = await Promise.all([
    import('../src/lib/db'),
    import('../src/lib/db/schema'),
  ]);

  return {
    db,
    aboutMe: schema.aboutMe,
    achievements: schema.achievements,
    knowledgeDocs: schema.knowledgeDocs,
    profileLinks: schema.profileLinks,
    projects: schema.projects,
  };
}

async function resetPublicContentTables(runtime: AdminRuntime) {
  await runtime.db.delete(runtime.projects);
  await runtime.db.delete(runtime.achievements);
  await runtime.db.delete(runtime.profileLinks);
  await runtime.db.delete(runtime.knowledgeDocs);
  await runtime.db.delete(runtime.aboutMe);
}

async function triggerRagIngest() {
  const ragUrl = process.env.RAG_SERVICE_URL || 'http://127.0.0.1:3005';
  const serviceToken = process.env.RAG_INGEST_SERVICE_TOKEN || process.env.ADMIN_SERVICE_TOKEN;

  if (!serviceToken) {
    console.warn('Skipping RAG ingest because RAG_INGEST_SERVICE_TOKEN is missing.');
    return;
  }

  try {
    const response = await fetch(`${ragUrl.replace(/\/$/, '')}/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Token': serviceToken,
      },
      body: JSON.stringify({ type: 'all' }),
    });

    if (!response.ok) {
      const payload = await response.text();
      throw new Error(`RAG ingest failed with ${response.status}: ${payload}`);
    }

    const payload = (await response.json()) as {
      success?: boolean;
      chunksIngested?: number;
      source?: string;
    };
    console.log(
      `RAG ingest completed. success=${String(payload.success)} chunks=${payload.chunksIngested ?? 0}`
    );
  } catch (error) {
    console.warn(
      error instanceof Error
        ? `Skipping RAG ingest because the service is unavailable or returned an error: ${error.message}`
        : 'Skipping RAG ingest because the service is unavailable or returned an unknown error.'
    );
  }
}

async function reconcileIndexedKnowledgeDocs() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return;
  }

  const sql = postgres(databaseUrl, {
    max: 1,
    prepare: false,
  });

  try {
    await sql.unsafe(
      'update "knowledge_docs" set indexed = true, "updatedAt" = CURRENT_TIMESTAMP where id in (select source_ref from rag.documents where source_type = \'knowledge\') and indexed = false'
    );
    const result = await sql.unsafe(
      'select count(*)::int as count from "knowledge_docs" where indexed = true'
    );
    console.log(`Indexed knowledge docs reconciled to ${result[0].count}.`);
  } finally {
    await sql.end();
  }
}

async function waitForRagIngestionToSettle() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return;
  }

  const sql = postgres(databaseUrl, {
    max: 1,
    prepare: false,
  });

  try {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const result = await sql.unsafe(
        'select completed_at from rag."ingestion_runs" order by started_at desc limit 1'
      );
      const completedAt = result[0]?.completed_at;

      if (completedAt) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  } finally {
    await sql.end();
  }
}

async function main() {
  const now = new Date().toISOString();
  const args = new Set(process.argv.slice(2));
  const skipIngest = args.has('--skip-ingest');
  const runtime = await loadAdminRuntime();

  const aboutRow = buildAboutRow(now);
  const projectRows = buildProjectRows(now);
  const achievementRows = buildAchievementRows(now);
  const profileLinkRows = buildProfileLinkRows(now);
  const knowledgeDocRows = await buildKnowledgeDocs(now);

  await resetPublicContentTables(runtime);

  await runtime.db.insert(runtime.aboutMe).values(aboutRow);
  if (projectRows.length > 0) {
    await runtime.db.insert(runtime.projects).values(projectRows);
  }
  if (achievementRows.length > 0) {
    await runtime.db.insert(runtime.achievements).values(achievementRows);
  }
  if (profileLinkRows.length > 0) {
    await runtime.db.insert(runtime.profileLinks).values(profileLinkRows);
  }
  if (knowledgeDocRows.length > 0) {
    await runtime.db.insert(runtime.knowledgeDocs).values(knowledgeDocRows);
  }

  console.log(
    `Seeded about=${1} projects=${projectRows.length} achievements=${achievementRows.length} profileLinks=${profileLinkRows.length} knowledgeDocs=${knowledgeDocRows.length}`
  );

  if (!skipIngest) {
    await triggerRagIngest();
    await waitForRagIngestionToSettle();
    await reconcileIndexedKnowledgeDocs();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
