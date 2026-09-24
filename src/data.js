// Single source of truth for all site content. Update your resume changes here.

export const profile = {
  name: 'Yra Climaco',
  firstName: 'Yra',
  initials: 'YC',
  email: 'climacoyra@gmail.com',
  linkedin: 'https://linkedin.com/in/yra-climaco',
  github: 'https://github.com/yraclimaco',
  resume: '/Yra_Climaco_Resume.pdf', // replace public/Yra_Climaco_Resume.pdf when your resume changes
  school: 'University of California, San Diego',
  degree: 'B.S. Data Science, Minor in Business Analytics',
  gpa: '3.82',
  grad: 'June 2028',
  location: 'San Diego, CA',
  portrait: null, // e.g. '/portrait.jpg' after adding the file to /public
}

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'hobbies', label: 'Hobbies' },
  { id: 'contact', label: 'Contact' },
]

export const heroMarquee = [
  'Product Analytics', 'A/B Testing', 'Experimentation', 'Python', 'SQL', 'Retention', 'Machine Learning', 'Dashboards',
]

export const focusAreas = ['Gaming', 'Streaming', 'Entertainment', 'B2C consumer tech']

export const stats = [
  { to: 3.82, decimals: 2, label: 'GPA at UC San Diego' },
  { to: 900, suffix: '+', label: 'Solar prospects identified' },
  { to: 303, suffix: 'K+', label: 'Ocean observations modeled' },
  { to: 9236, label: 'Pro matches analyzed' },
]

export const experience = [
  {
    date: 'Sept 2026 — Dec 2026',
    role: 'National Security Innovation Intern',
    org: 'Innovating for National Security (i4NS)',
    place: 'San Diego, CA',
    bullets: [
      'Scoping data-driven approaches to address navigation and inertial system drift for Extra Large Unmanned Undersea Vehicles (XLUUVs) during long-duration submerged transit.',
      'Collaborating with a 5-person research team to translate an ambiguous technical problem into analytical requirements, constraints, and potential solution approaches.',
    ],
    tags: ['Research', 'Systems analysis', 'Teamwork'],
  },
  {
    date: 'Aug 2026 — Present',
    role: 'Projects Mentor',
    org: 'Data Science Student Society (DS3)',
    place: 'San Diego, CA',
    bullets: [
      'Mentoring student project teams within a 600+ member organization on end-to-end data product development and cloud deployment (GCP, AWS).',
      'Providing technical reviews on analytical methodology, data cleaning pipelines, exploratory data analysis, and model implementation.',
    ],
    tags: ['Mentorship', 'GCP', 'AWS'],
  },
  {
    date: 'Feb 2026 — June 2026',
    role: 'Data Science Intern',
    org: 'Center for Community Energy (CCE)',
    place: 'San Diego, CA',
    bullets: [
      'Built a PostgreSQL database identifying 900+ commercial solar prospects across San Diego County in partnership with the Move Now renewable energy team.',
      'Engineered a SQL ETL pipeline using CTEs, JOINs, CASE WHEN, and UNION ALL to clean, integrate, and standardize inconsistent datasets.',
      'Applied LEFT JOIN logic to find organizations missing from existing prospect lists and surface additional outreach opportunities.',
    ],
    tags: ['PostgreSQL', 'SQL', 'ETL'],
  },
]

export const projects = [
  {
    title: 'SurfCast SD',
    lens: 'Predictive product',
    subtitle: 'Surf forecast & ML rating predictor',
    date: 'May – June 2026',
    color: 'coral',
    metric: '0.541',
    metricLabel: 'macro F1 on 47% class-imbalanced data',
    bullets: [
      'Live ML forecasting system predicting 7-tier surf-quality ratings across three San Diego breaks from 303,000+ hourly ocean observations.',
      'Benchmarked and tuned five classifiers with RandomizedSearchCV, selecting a Random Forest.',
      'Automated live predictions with GCS and Cloud Run; time-series EDA surfaced daily wind cycles as a key signal.',
    ],
    tags: ['Python', 'Scikit-learn', 'GCP'],
    link: null,
  },
  {
    title: 'Snowball Effect in Pro LoL',
    lens: 'Gaming analytics',
    subtitle: 'Do early-game advantages decide matches?',
    date: 'Mar 2026',
    color: 'purple',
    metric: '73.6%',
    metricLabel: 'test accuracy, +23.6 pts over the 50% baseline',
    bullets: [
      'Evaluated 9,236 professional matches with permutation testing (p < 0.001).',
      'Random Forest classifier on 15-minute game states.',
      'Analyzed missingness and potential bias; published an interactive report covering EDA, testing, and model evaluation.',
    ],
    tags: ['Python', 'Pandas', 'Scikit-learn', 'Plotly'],
    link: null, // add the live site URL here to show a "Live site" button
  },
  {
    title: 'TubeScope',
    lens: 'Streaming & engagement',
    subtitle: 'Viral trend predictor',
    date: 'Oct – Dec 2025',
    color: 'teal',
    metric: '83%',
    metricLabel: 'viral-trend drop-off rate, 3rd place at DS3 Showcase',
    bullets: [
      'Kaplan-Meier survival analysis of trend lifetimes; Random Forest with 68% recall and a 3× precision lift.',
      'Engineered features from YouTube Data API metadata into an automated pipeline powering a live dashboard.',
      'Placed 3rd of 10 teams for technical execution and presentation.',
    ],
    tags: ['Python', 'Pandas', 'Plotly', 'Survival analysis'],
    link: null,
  },
]

export const skills = [
  { title: 'Languages', items: ['Python', 'SQL'] },
  { title: 'Libraries', items: ['Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib', 'Seaborn', 'Plotly'] },
  {
    title: 'Statistics / ML',
    items: [
      'Hypothesis Testing', 'A/B Testing', 'Permutation Testing', 'Survival Analysis',
      'Time-Series Analysis', 'EDA', 'Feature Engineering', 'Model Evaluation', 'Hyperparameter Optimization',
    ],
  },
  {
    title: 'Cloud / Data',
    items: ['GCP (Cloud Run, GCS)', 'AWS (S3, EC2, Lambda)', 'PostgreSQL', 'ETL Pipelines'],
  },
  { title: 'Tools', items: ['Claude Code', 'Tableau', 'Excel', 'Git', 'Jupyter', 'VS Code'] },
]

export const certification = {
  name: 'AWS Certified Cloud Practitioner',
  issuer: 'Amazon Web Services',
  date: 'Aug 2026',
}

// Edit the blurbs freely — they're written from your list of hobbies, not from details you gave me.
export const hobbies = [
  {
    emoji: '🥋',
    title: 'Brazilian Jiu-Jitsu',
    text: 'Chess with your whole body. Every roll is problem-solving under pressure, one position at a time.',
    color: '#FF5A3C',
  },
  {
    emoji: '🎲',
    title: 'Board games',
    text: 'Game night is sacred. Give me strategy, probability, and a little table talk.',
    color: '#7C5CFF',
  },
  {
    emoji: '🃏',
    title: 'Card magic',
    text: 'Sleight of hand, misdirection, and a deck that is never quite where you left it. Go on, pick a card.',
    color: '#FFD23F',
  },
  {
    emoji: '🍜',
    title: 'Trying new food',
    text: 'If there is a spot or a dish I have not tried yet, it is going on the list.',
    color: '#2EC4B6',
  },
]
