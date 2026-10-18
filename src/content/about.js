// About: background and goals. Skills live in content/skills.js and hobbies in content/beyond.js.

// The main introduction, shown once (on About). Same words as profile.intro, split for reading.
export const about = {
  paragraphs: [
    'I’m a Data Science student at UC San Diego who’s curious about people, the choices they make, and the products they love.',
    'I enjoy turning that curiosity into projects, learning alongside others, and finding useful patterns in messy data. My goal is to bring data and an understanding of people together to help build better everyday experiences.',
  ],
}

// Three highlights, each counted up once. Sources:
//   GPA: profile.education.gpa
//   303K+: SurfCast's 303,375 hourly rows (content/projects.js: "303,000+ hourly ocean observations")
//   3rd place: TubeScope's DS3 Showcase result (content/projects.js: "Placed 3rd of 10 teams")
export const highlights = [
  { id: 'gpa', value: 3.82, decimals: 2, suffix: ' / 4.0', label: 'GPA at UC San Diego' },
  { id: 'surfcast', value: 303, decimals: 0, suffix: 'K+', label: 'Ocean observations analyzed, SurfCast SD', to: '/projects/surfcast' },
  { id: 'showcase', value: 3, ordinal: true, suffix: ' place', label: 'DS3 DinoCage Showcase, TubeScope', to: '/projects/tubescope' },
]

export const certification = {
  name: 'AWS Certified Cloud Practitioner',
  issuer: 'Amazon Web Services',
  date: 'August 2026',
}

// Campus involvement: short entries that point to the fuller story elsewhere.
export const involvement = [
  {
    id: 'ds3',
    title: 'Data Science Student Society',
    meta: 'Projects Mentor',
    text: 'I mentor student teams through end-to-end data projects, from scoping the problem to communicating results. With a DS3 team, I also built TubeScope, which placed 3rd at the showcase.',
    link: { label: 'Mentoring in Experience', to: '/experience#ds3' },
  },
  {
    id: 'bjj',
    title: 'UCSD BJJ Club',
    text: 'I train Brazilian Jiu-Jitsu with the club, part of the campus grappling community.',
    link: { label: 'More in Beyond Data', to: '/beyond-data#bjj' },
  },
]
