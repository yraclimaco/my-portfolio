export const about = {
  lead: 'I’m most interested in the products people choose to spend their free time on, like games, streaming, and entertainment, and in what the data says about how people actually use them.',
  paragraphs: [
    'I study Data Science at UC San Diego with a minor in Business Analytics. My work so far spans SQL pipelines for renewable-energy outreach, statistical testing on professional esports data, survival analysis of YouTube trends, and a deployed surf-forecasting model.',
    'My goal is product analytics at a consumer tech company: framing the right question, testing it rigorously, and communicating what the data does and doesn’t support.',
  ],
}

export const skills = [
  { group: 'Languages', items: ['Python', 'SQL'] },
  {
    group: 'Analytics',
    items: ['Statistical analysis', 'Hypothesis testing', 'A/B testing', 'Permutation testing', 'Behavioral analysis', 'EDA', 'Data visualization'],
  },
  { group: 'Libraries', items: ['Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib', 'Seaborn', 'Plotly'] },
  {
    group: 'Data & cloud',
    items: ['PostgreSQL', 'ETL pipelines', 'Data cleaning', 'Data validation', 'GCP (Cloud Run, GCS)', 'AWS (S3, EC2, Lambda)'],
  },
  { group: 'Tools', items: ['Tableau', 'Excel', 'Git', 'Jupyter', 'VS Code'] },
]

export const certification = {
  name: 'AWS Certified Cloud Practitioner',
  issuer: 'Amazon Web Services',
  date: 'Aug 2026',
}

export const interestsLine = 'Outside of data: Brazilian Jiu-Jitsu, board games, card magic, and trying new food.'

// Interests revealed by the "Draw a card" deck on the About page.
export const interests = [
  { suit: '♠', title: 'Brazilian Jiu-Jitsu', note: 'It also became a dataset. See the ADCC analysis in Work.', link: '/work/adcc' },
  { suit: '♦', title: 'Board games', note: 'The reason this portfolio is a board.' },
  { suit: '♣', title: 'Card magic', note: 'Practicing sleight of hand. The deck on this page is stacked, by the way.' },
  { suit: '♥', title: 'Trying new food', note: 'Always looking for the next place to try.' },
]
