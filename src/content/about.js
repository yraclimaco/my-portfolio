// The main introduction, shown once (on About). Same words as profile.intro, split for reading.
export const about = {
  paragraphs: [
    'I’m a Data Science student at UC San Diego who’s curious about people, the choices they make, and the products they love.',
    'I enjoy turning that curiosity into projects, learning alongside others, and finding useful patterns in messy data. My goal is to bring data and an understanding of people together to help build better everyday experiences.',
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

// Interests on the About page. To use a real photo, set `image` (a path in /public) and describe it
// in `alt`; the card then shows the photo in its image area instead of the suit mark.
export const interests = [
  { suit: '♠', title: 'Brazilian Jiu-Jitsu', note: 'It also became a dataset.', link: '/projects/adcc', linkLabel: 'See the ADCC analysis', image: null, alt: '' },
  { suit: '♦', title: 'Board games', note: 'The reason this portfolio is a board.', image: null, alt: '' },
  { suit: '♣', title: 'Card magic', note: 'Practicing sleight of hand.', image: null, alt: '' },
  { suit: '♥', title: 'Trying new food', note: 'Always looking for the next place to try.', image: null, alt: '' },
]
