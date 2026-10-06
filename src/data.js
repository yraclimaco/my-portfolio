// Single source of truth for all site content. Update your resume changes here.

export const profile = {
  name: 'Yra Climaco',
  firstName: 'Yra',
  initials: 'YC',
  email: 'climacoyra@gmail.com',
  linkedin: 'https://www.linkedin.com/in/yra-climaco',
  github: 'https://github.com/yraclimaco',
  resume: '/Yra_Climaco_Resume.pdf', // replace public/Yra_Climaco_Resume.pdf when your resume changes
  school: 'University of California, San Diego',
  degree: 'B.S. Data Science, Minor in Business Analytics',
  gpa: '3.82',
  grad: 'June 2028',
  location: 'San Diego, CA',
  portrait: '/portrait.jpg', // file lives in /public
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
      'Conducting recurring interviews with problem sponsors and subject matter experts to uncover user needs, test assumptions, and refine an ambiguous technical problem.',
      'Collaborating with a 5-person team to translate stakeholder feedback and technical research into clearer analytical requirements, constraints, and solution priorities.',
    ],
    tags: ['User research', 'Stakeholder interviews', 'Teamwork'],
  },
  {
    date: 'Aug 2026 — Present',
    role: 'Projects Mentor',
    org: 'Data Science Student Society (DS3)',
    place: 'San Diego, CA',
    bullets: [
      'Supporting student project teams with problem scoping, data analysis, project planning, and technical decision-making across end-to-end data projects.',
      'Providing feedback on analytical methodology, data cleaning, exploratory analysis, model evaluation, and communication of results.',
    ],
    tags: ['Mentorship', 'Problem scoping', 'Data analysis'],
  },
  {
    date: 'Feb 2026 — June 2026',
    role: 'Data Science Intern',
    org: 'Center for Community Energy (CCE)',
    place: 'San Diego, CA',
    bullets: [
      'Built a PostgreSQL database identifying 900+ commercial solar prospects across San Diego County by integrating and analyzing multiple inconsistent datasets.',
      'Engineered a SQL ETL pipeline using CTEs, JOINs, CASE WHEN, and UNION ALL to clean, standardize, and validate source data for prospect analysis.',
      'Applied LEFT JOIN logic to identify missing organizations, investigate gaps in existing prospect lists, and surface additional outreach opportunities.',
    ],
    tags: ['PostgreSQL', 'SQL', 'ETL', 'Data validation'],
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
    links: [
      { label: 'Live app', url: 'https://surfcast-frontend-19545389323.us-west1.run.app/' },
      { label: 'GitHub', url: 'https://github.com/kanglee05/Surf-Cast-SD' },
    ],
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
      'Analyzed player and match behavior across 9,236 professional League of Legends matches to quantify how early-game advantages influence outcomes.',
      'Applied permutation testing (p < 0.001) and predictive modeling with a Random Forest on 15-minute game states.',
      'Evaluated missingness and potential bias; published an interactive report communicating EDA, statistical testing, model evaluation, and findings.',
    ],
    tags: ['Python', 'Pandas', 'Scikit-learn', 'Plotly'],
    links: [
      { label: 'Live report', url: 'https://yraclimaco.github.io/lol-snowball-analysis/' },
      { label: 'GitHub', url: 'https://github.com/yraclimaco/lol-snowball-analysis' },
    ],
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
      'Integrated the YouTube Data API to analyze metadata and audience behavior, identifying an 83% viral-trend drop-off rate with Kaplan-Meier survival analysis.',
      'Built a Random Forest classifier achieving 68% recall and a 3× precision lift for identifying viral-trending videos.',
      'Engineered features and an automated data pipeline powering live dashboard analytics; placed 3rd of 10 teams at the DS3 Showcase.',
    ],
    tags: ['Python', 'Pandas', 'Plotly', 'Survival analysis'],
    links: [
      { label: 'Live app', url: 'https://tubescopeds3.streamlit.app/' },
      { label: 'GitHub', url: 'https://github.com/VedVar43789/TubeScope' },
    ],
  },
  {
    title: 'ADCC Grappling Analysis',
    lens: 'BJJ × data',
    subtitle: 'Two decades of submission grappling, in data',
    date: 'Sept 2025 · Independent',
    color: 'amber',
    metric: '3×',
    metricLabel: 'rise in heel hook finishes (7% of subs pre-2012 → 21% since)',
    bullets: [
      'Analyzed 1,028 ADCC World Championship matches from 1998–2022, categorizing every win by submission, points, or decision.',
      'The Rear Naked Choke held steady at ~25% of all submissions across both eras — the sport’s most consistent finish — even as the heel hook nearly tripled its share.',
      'Championship finals are decided by points 60.5% of the time vs. 49.7% in earlier rounds — a measurably more conservative style once a title is on the line.',
    ],
    tags: ['Python', 'Pandas', 'Seaborn', 'EDA'],
    links: [
      { label: 'GitHub', url: 'https://github.com/yraclimaco/ADCC-Grappling-Analysis' },
    ],
  },
]

export const skills = [
  { title: 'Languages', items: ['Python', 'SQL'] },
  {
    title: 'Analytics',
    items: [
      'Statistical Analysis', 'Hypothesis Testing', 'A/B Testing', 'Permutation Testing',
      'Behavioral Analysis', 'EDA', 'Data Visualization',
    ],
  },
  { title: 'Libraries', items: ['Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib', 'Seaborn', 'Plotly'] },
  {
    title: 'Data / Cloud',
    items: [
      'PostgreSQL', 'ETL Pipelines', 'Data Cleaning', 'Data Validation',
      'GCP (Cloud Run, GCS)', 'AWS (S3, EC2, Lambda)',
    ],
  },
  { title: 'Tools', items: ['Tableau', 'Excel', 'Git', 'Jupyter', 'VS Code'] },
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
