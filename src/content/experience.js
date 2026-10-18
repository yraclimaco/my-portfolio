// Roles and bullets mirror the current résumé (Yra_Climaco_Resume.pdf).
export const experience = [
  {
    id: 'i4ns',
    role: 'National Security Innovation Intern',
    org: 'Innovating for National Security (i4NS)',
    place: 'San Diego, CA',
    dates: 'Sept 2026 – Dec 2026',
    current: true,
    summary: 'Discovery work on an ambiguous technical problem, alongside problem sponsors and subject matter experts.',
    bullets: [
      'Conducting recurring interviews with problem sponsors and subject matter experts to uncover user needs, test assumptions, and refine an ambiguous technical problem.',
      'Collaborating with a 5-person team to translate stakeholder feedback and technical research into clearer analytical requirements, constraints, and solution priorities.',
    ],
    skills: ['User research', 'Stakeholder interviews', 'Problem scoping'],
  },
  {
    id: 'ds3',
    role: 'Projects Mentor',
    org: 'Data Science Student Society (DS3)',
    place: 'San Diego, CA',
    dates: 'Aug 2026 – Present',
    current: true,
    summary: 'Guiding student teams through end-to-end data projects.',
    bullets: [
      'Supporting student project teams with problem scoping, data analysis, project planning, and technical decision-making across end-to-end data projects.',
      'Providing feedback on analytical methodology, data cleaning, exploratory analysis, model evaluation, and communication of results.',
    ],
    skills: ['Mentorship', 'Methodology review', 'Communication'],
  },
  {
    id: 'cce',
    role: 'Data Science Intern',
    org: 'Center for Community Energy (CCE)',
    place: 'San Diego, CA',
    dates: 'Feb 2026 – June 2026',
    current: false,
    summary: 'Built the data foundation for commercial solar outreach across San Diego County.',
    bullets: [
      'Built a PostgreSQL database identifying 900+ commercial solar prospects across San Diego County by integrating and analyzing multiple inconsistent datasets.',
      'Engineered a SQL ETL pipeline using CTEs, JOINs, CASE WHEN, and UNION ALL to clean, standardize, and validate source data for prospect analysis.',
      'Applied LEFT JOIN logic to identify missing organizations, investigate gaps in existing prospect lists, and surface additional outreach opportunities.',
    ],
    skills: ['PostgreSQL', 'SQL ETL', 'Data validation'],
  },
]
