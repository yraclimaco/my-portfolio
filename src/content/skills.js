// Skills, grouped as on the résumé. No proficiency ratings: just what I use.
//
// `icon` names a brand mark from the simple-icons package, `mark: 'database'` draws the neutral
// SQL symbol, and anything else gets a plain monogram (`mono`). "Used in" links come only from
// verified sources: each project's own `stack` in content/projects.js, the role skills in
// content/experience.js, and the few method links below, each tied to a project's write-up.
import { projects } from './projects'

const project = (slug) => {
  const p = projects.find((x) => x.slug === slug)
  return { label: p.title, to: `/projects/${p.slug}` }
}
const cce = { label: 'Data Science Intern, Center for Community Energy', to: '/experience#cce' }

// Which `stack` entries count as this skill.
const stackNames = {
  Python: ['Python'],
  pandas: ['Pandas'],
  'scikit-learn': ['Scikit-learn'],
  Matplotlib: ['Matplotlib'],
  Seaborn: ['Seaborn'],
  Plotly: ['Plotly'],
  GCP: ['GCP Cloud Run', 'GCS'],
}

// Verified outside a project stack.
const extra = {
  SQL: [cce],
  PostgreSQL: [cce],
  'ETL pipelines': [cce],
  'Data validation': [cce],
  // Each named in the project's own approach or contribution notes.
  'Hypothesis testing': [project('lol-snowball')],
  'Permutation testing': [project('lol-snowball')],
  EDA: [project('surfcast')],
}

export function usedIn(name) {
  const fromStack = projects.filter((p) => (stackNames[name] ?? []).some((s) => p.stack.includes(s))).map((p) => project(p.slug))
  return [...fromStack, ...(extra[name] ?? [])]
}

export const featured = [
  { name: 'Python', icon: 'python' },
  { name: 'SQL', mark: 'database' },
]

export const groups = [
  {
    id: 'libraries',
    title: 'Libraries',
    items: [
      { name: 'pandas', icon: 'pandas' },
      { name: 'NumPy', icon: 'numpy' },
      { name: 'scikit-learn', icon: 'scikitlearn' },
      { name: 'Matplotlib', mono: 'Mpl' },
      { name: 'Seaborn', mono: 'Sns' },
      { name: 'Plotly', icon: 'plotly' },
    ],
  },
  {
    id: 'data-cloud',
    title: 'Data and cloud',
    items: [
      { name: 'PostgreSQL', icon: 'postgresql' },
      { name: 'GCP', detail: 'Cloud Run, GCS', icon: 'googlecloud' },
      { name: 'AWS', detail: 'S3, EC2, Lambda', mono: 'AWS' },
    ],
    practices: ['ETL pipelines', 'Data cleaning', 'Data validation'],
  },
  {
    id: 'tools',
    title: 'Tools',
    items: [
      { name: 'Tableau', mono: 'Tb' },
      { name: 'Excel', mono: 'Xl' },
      { name: 'Git', icon: 'git' },
      { name: 'Jupyter', icon: 'jupyter' },
      { name: 'VS Code', mono: 'VS' },
    ],
  },
]

export const analytics = {
  id: 'analytics',
  title: 'Analytics',
  items: ['Statistical analysis', 'Hypothesis testing', 'A/B testing', 'Permutation testing', 'Behavioral analysis', 'EDA', 'Data visualization'],
}
