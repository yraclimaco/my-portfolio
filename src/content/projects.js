// Every figure and statistic below comes from the project repositories, their published
// reports, or the résumé. Evidence types are kept separate on purpose:
//   model:   performance of a model on held-out data
//   finding: a descriptive or statistical result from the analysis
//   impact:  measured real-world outcome (none of these projects has one yet)

export const projects = [
  {
    slug: 'nba-shot-model',
    thumb: { src: '/work/nba/thumb.webp', width: 960, height: 540 },
    number: '05',
    featured: true,
    tile: { label: 'Shot model', sub: 'Basketball analytics' },
    title: 'NBA Shot Make Probability Model',
    subtitle: 'Estimating how likely an NBA shot is to go in',
    dates: 'Sept 2026',
    context: 'Individual technical project',
    kind: 'Probabilistic modeling · Ensemble · Model validation',
    summary:
      'A probabilistic model that estimates NBA shot make probability from player-tracking and shot-context features across 425K+ training shots.',
    headline: { value: '0.6245', label: 'Cross-season validation log loss (my own development score)', type: 'model' },
    metrics: [
      { value: '425K+', label: 'training shots' },
      { value: '0.6245', label: 'validation log loss' },
      { value: '3-model', label: 'ensemble' },
    ],
    links: [],
    stack: ['Python', 'Scikit-learn', 'LightGBM', 'CatBoost', 'Pandas/Polars', 'Feature Engineering', 'Model Validation'],
    question: 'How well can player-tracking and shot-context data estimate the chance that a shot goes in, including in a season the model has never seen?',
    contribution: {
      note: 'My own modeling work:',
      items: [
        'Built and evaluated probabilistic models across 425K+ NBA training shots using player-tracking and shot-context features.',
        'Designed cross-season validation to test generalization to an unseen season instead of relying on a random row split.',
        'Compared multiple modeling approaches and combined HistGradientBoosting, LightGBM, and CatBoost into the final ensemble.',
      ],
    },
    data: [
      'Player-tracking and shot-context features: shot distance, shot type, defender proximity, shot clock, court location, shooter movement, and contest information.',
      'The supplied dataset is not shared on this site.',
    ],
    approach: [
      { title: 'Validate on a new season', text: 'Used season-based validation instead of a random split to better test generalization to a new season.' },
      { title: 'Model shot difficulty', text: 'Engineered features describing the shot, the shooter’s movement, and how closely the shot was contested.' },
      { title: 'Compare and ensemble', text: 'Started from a logistic regression baseline, then combined HistGradientBoosting, LightGBM, and CatBoost.' },
    ],
    findings: {
      model: [
        {
          stat: '0.6245',
          text: 'Improved cross-season validation log loss from 0.6414 with logistic regression to 0.6245 with the final three-model ensemble.',
          note: 'This is my own development validation score, not an official Thunder evaluation.',
        },
      ],
      finding: [
        {
          stat: 'Distance + shot type',
          text: 'Shot distance and shot type were the strongest features in the LightGBM component. This reflects what the model relied on, not a causal relationship.',
        },
      ],
    },
    learned:
      'During review, I found and corrected issues in my validation process, reinforcing the importance of fair model comparisons and leakage prevention.',
    figures: [
      {
        src: '/work/nba/validation.webp',
        width: 1000,
        height: 640,
        alt: 'Two cards comparing cross-season validation log loss, where lower is better: logistic regression baseline at 0.6414 and the three-model ensemble, the best result, at 0.6245, an improvement of 0.0169.',
        caption: 'Validation performance comparison from my development analysis. Not an official Thunder evaluation.',
      },
    ],
  },
  {
    slug: 'surfcast',
    // Gallery card image (title card); the project's own screenshots and charts stay in the detail view.
    thumb: { src: '/work/surfcast/thumb.webp', width: 960, height: 540 },
    number: '01',
    featured: true,
    tile: { label: 'SurfCast', sub: 'Surf forecasting' },
    title: 'SurfCast SD',
    subtitle: 'Forecasting surf quality for three San Diego breaks',
    dates: 'May – June 2026',
    context: 'Team project',
    kind: 'Classification · Data pipeline · Deployed app',
    summary:
      'A live forecasting system that predicts 7-tier surf-quality ratings for La Jolla Shores, Blacks Beach, and Pacific Beach Point from public buoy, tide, wind, and weather data.',
    headline: { value: '0.541', label: 'Macro F1 across 7 imbalanced rating classes', type: 'model' },
    links: [
      { label: 'Live dashboard', url: 'https://surfcast-frontend-19545389323.us-west1.run.app/', kind: 'live' },
      { label: 'GitHub', url: 'https://github.com/kanglee05/Surf-Cast-SD', kind: 'code' },
    ],
    stack: ['Python', 'Scikit-learn', 'FastAPI', 'GCP Cloud Run', 'GCS', 'Next.js'],
    question:
      'Can public ocean and weather data predict how good the surf will be at a specific break, reliably enough to power a forecast people can check each morning?',
    contribution: {
      team: true,
      items: [
        'Built a live ML forecasting system predicting 7-tier surf-quality ratings across three breaks from 303,000+ hourly ocean observations spanning three years.',
        'Benchmarked and tuned five classifiers with RandomizedSearchCV, selecting a Random Forest on macro F1.',
        'Automated live predictions with GCS and Cloud Run, and used time-series EDA to identify daily wind cycles as a key predictive signal.',
      ],
    },
    data: [
      'Training set of 303,375 hourly rows from 2022–2024, covering three breaks and two NDBC buoy stations.',
      'Sources: NDBC buoys (wave height, period, direction), NOAA tide gauge, San Diego airport weather (NOAA ISD), and NWS / Open-Meteo for live forecasts.',
      'Labels: historical Surfline ratings in seven ordered tiers, from Very Poor to Epic.',
    ],
    approach: [
      { title: 'Engineer features', text: '13 surf-relevant features, including circular season encoding (sin/cos of day of year) and hours since sunrise to capture the morning offshore-wind window.' },
      { title: 'Choose the right metric', text: 'FAIR made up 47% of labels, so raw accuracy rewarded predicting the majority class. Models were compared on macro F1, which weights all seven classes equally.' },
      { title: 'Benchmark five models', text: 'Random Forest, gradient boosting variants, logistic regression, and naive Bayes, each tuned with RandomizedSearchCV (3-fold, 20 iterations).' },
      { title: 'Ship it', text: 'The selected model is served by a FastAPI service on Cloud Run; a scheduled job writes a 7-day forecast to GCS that the Next.js dashboard reads.' },
    ],
    findings: {
      model: [
        { stat: '0.541', text: 'Macro F1 for the Random Forest, the only model that produced meaningful predictions across all seven classes.' },
        { stat: '68.1%', text: 'Accuracy of gradient boosting, the highest of any model. Yet it never predicted Good or Epic, collapsing toward the majority class (macro F1 0.379).' },
      ],
      finding: [
        { stat: 'APD', text: 'Average wave period ranked as the most important feature in both tree models (0.146 and 0.173 importance), ahead of dominant period. This suggests mixed-swell conditions matter more than the single peak swell.' },
      ],
      impact: 'Shipped as a public dashboard. No usage or outcome data has been collected, so real-world impact is not measured.',
    },
    table: {
      caption: 'Model comparison on the held-out set (from the project README)',
      columns: ['Model', 'Accuracy', 'Weighted F1', 'Macro F1'],
      rows: [
        ['Random Forest', '65.2%', '0.663', '0.541'],
        ['Hist. Gradient Boosting', '55.1%', '0.573', '0.471'],
        ['Gradient Boosting', '68.1%', '0.670', '0.379'],
        ['Gaussian Naive Bayes', '47.2%', '0.474', '0.264'],
        ['Logistic Regression', '34.7%', '0.387', '0.197'],
      ],
      highlightRow: 0,
    },
    couldInform: [
      'Which conditions a surf-check product should surface first (period and wind, not just wave height).',
      'Where better data would pay off most: more labels for rare classes and break-level wind measurements.',
    ],
    limitations: [
      'Rare classes are extremely sparse (Epic has 24 examples in 303,375 rows), so the model over-predicts Fair.',
      'Wind comes from San Diego airport, miles from the breaks and in a different microclimate.',
      'Live forecasts use Open-Meteo wave period as a proxy for the buoy period the model was trained on, introducing a distribution shift.',
      'Each hour is predicted independently; no lag features capture building or fading swells.',
      'One combined model serves all three breaks, even though Blacks Beach behaves differently from the bay breaks.',
    ],
    figures: [
      {
        src: '/work/surfcast/dashboard.webp',
        width: 1440,
        height: 454,
        alt: 'SurfCast SD dashboard for La Jolla Shores showing a Fair rating, a best surf window of 5 to 7 AM, water temperature, and an hourly forecast strip rated Fair from 5 AM to noon.',
        caption: 'The live dashboard, showing model-predicted ratings for each hour. Captured October 2026.',
      },
    ],
  },
  {
    slug: 'lol-snowball',
    // Gallery card image (title card); the project's own screenshots and charts stay in the detail view.
    thumb: { src: '/work/lol/thumb.webp', width: 960, height: 540 },
    number: '02',
    featured: true,
    tile: { label: 'Snowball', sub: 'Esports analytics' },
    title: 'How Punishing Is the Snowball?',
    subtitle: 'Early-game leads in 2025 professional League of Legends',
    dates: 'Mar 2026',
    context: 'Individual project · UCSD DSC 80',
    kind: 'Hypothesis testing · Classification',
    summary:
      'Do early advantages in gold, kills, and objectives reliably predict which team wins? A permutation-tested, modeled answer across 9,236 professional matches.',
    headline: { value: '+45.8 pts', label: 'Higher win rate for teams ahead in gold at 15 minutes', type: 'finding' },
    links: [
      { label: 'Interactive report', url: 'https://yraclimaco.github.io/lol-snowball-analysis/', kind: 'live' },
      { label: 'GitHub', url: 'https://github.com/yraclimaco/lol-snowball-analysis', kind: 'code' },
    ],
    stack: ['Python', 'Pandas', 'Scikit-learn', 'Plotly'],
    question:
      'In League of Legends, teams that build early advantages can “snowball” them into more resources. How punishing is that in professional play? Do 15-minute leads reliably predict the winner?',
    contribution: {
      team: false,
      items: [
        'Framed the question, cleaned the data, and designed every test and model.',
        'Analyzed missingness and potential bias, including a fairness test across map sides.',
        'Published the full analysis as an interactive report.',
      ],
    },
    data: [
      'Oracle’s Elixir match data from the 2025 professional season.',
      '18,472 team-level rows (one per team per game, or 9,236 matches) after dropping games that ended before 15 minutes.',
      'Features available at 15 minutes: gold, experience, and creep-score differentials, kills, and first blood, dragon, herald, and tower.',
    ],
    approach: [
      { title: 'Explore', text: 'Compared 15-minute gold differentials between winners and losers, and win rate across gold-lead buckets.' },
      { title: 'Check missingness', text: 'Used permutation tests to show missing 25-minute stats depend on game length (MAR), not on unobserved factors.' },
      { title: 'Test the hypothesis', text: 'Permutation test (1,000 shuffles) comparing win rates for teams ahead vs. behind in gold at 15 minutes.' },
      { title: 'Model the outcome', text: 'Logistic regression baseline, then a Random Forest with engineered features (absolute gold lead, gold × kills interaction) tuned with 5-fold GridSearchCV.' },
      { title: 'Audit fairness', text: 'Permutation test comparing model accuracy for Blue-side vs. Red-side teams.' },
    ],
    findings: {
      finding: [
        { stat: '+45.8 pts', text: 'Teams ahead in gold at 15 minutes won 45.8 percentage points more often than teams behind (permutation p ≈ 0 across 1,000 shuffles).' },
        { stat: '73% vs 27%', text: 'Win rate for teams that took both first herald and first dragon, versus teams that took neither.' },
      ],
      model: [
        { stat: '73.6%', text: 'Test accuracy of the Random Forest using only 15-minute data, against a 50% balanced baseline. The simpler logistic regression reached 72.9%, so the added flexibility helped only modestly.' },
        { stat: 'p = 0.633', text: 'No evidence the model is less accurate for either side: 73.3% on Blue vs. 74.0% on Red.' },
      ],
      impact: 'Course project. Findings are analytical; no external use has been measured.',
    },
    couldInform: [
      'How coaching staff weight 15-minute game state when reviewing matches.',
      'Win-probability graphics for broadcasts, built from early-game features.',
      'Game balance discussions about how decisive early leads should be.',
    ],
    limitations: [
      'Observational data: gold leads and wins share causes such as team strength, so the analysis shows association, not that leads cause wins.',
      'One season, with all leagues pooled; results may differ by region or competitive tier.',
      'A 15-minute snapshot ignores draft and team-composition effects that shape late-game play.',
    ],
    figures: [
      {
        src: '/work/lol/winrate-by-gold.webp',
        width: 1189,
        height: 826,
        alt: 'Line chart of win rate by gold differential at 15 minutes. Win rate is near zero for teams more than 7,000 gold behind, rises steeply through even games, and reaches nearly 100% for leads above 5,000 gold.',
        caption: 'Win rate climbs steeply with the size of the 15-minute gold lead.',
      },
      {
        src: '/work/lol/gold-by-result.webp',
        width: 1216,
        height: 826,
        alt: 'Overlapping histograms of gold differential at 15 minutes: losing teams cluster below zero and winning teams cluster above zero, with clear separation.',
        caption: 'Winners and losers separate clearly by 15-minute gold differential.',
      },
      {
        src: '/work/lol/permutation-test.webp',
        width: 1201,
        height: 832,
        alt: 'Histogram of win-rate differences from 1,000 permutations, centered near zero and staying below 0.05, with the observed difference of 0.458 marked far to the right.',
        caption: 'The observed difference (0.458) sits far outside the permutation distribution.',
      },
    ],
  },
  {
    slug: 'tubescope',
    // Gallery card image (title card); the project's own screenshots and charts stay in the detail view.
    thumb: { src: '/work/tubescope/thumb.webp', width: 960, height: 540 },
    number: '03',
    featured: true,
    tile: { label: 'TubeScope', sub: 'Trend prediction' },
    title: 'TubeScope',
    subtitle: 'Predicting which trending YouTube videos keep trending',
    dates: 'Oct – Dec 2025',
    context: 'Team project · DS3 Showcase, 3rd of 10',
    kind: 'Survival analysis · Classification · Live app',
    summary:
      'Most trending videos fall off the list within a day. TubeScope measures that cliff with survival analysis and flags the videos most likely to keep trending.',
    headline: { value: '83%', label: 'Of trending videos drop off within 24 hours', type: 'finding' },
    links: [
      { label: 'Live app', url: 'https://tubescopeds3.streamlit.app/', kind: 'live' },
      { label: 'GitHub', url: 'https://github.com/VedVar43789/TubeScope', kind: 'code' },
    ],
    stack: ['Python', 'Pandas', 'lifelines', 'Scikit-learn', 'YouTube Data API', 'Streamlit'],
    question:
      'If most videos trend for only one day, can channel and video metadata flag the ones that will keep trending, early enough to matter?',
    contribution: {
      team: true,
      items: [
        'Integrated the YouTube Data API to analyze metadata and audience behavior, identifying the 83% drop-off with Kaplan-Meier survival analysis.',
        'Built and evaluated a Random Forest classifier for identifying videos that keep trending.',
        'Engineered features and an automated data pipeline powering the live dashboard.',
      ],
    },
    data: [
      'Training: a Kaggle dataset of 10,000 historical trending videos.',
      'Live: daily YouTube Data API v3 pulls of the top 50 U.S. trending videos, with channel metrics.',
      'Features: channel size (subscribers, views, video count), video metadata (duration, tags, title and description length, category), and upload timing.',
    ],
    approach: [
      { title: 'Try regression first', text: 'An initial model predicting views scored R² = 0.95, which turned out to be data leakage. Once fixed, R² went negative: views were too noisy to predict directly.' },
      { title: 'Measure the lifecycle', text: 'Kaplan-Meier survival analysis showed how quickly videos leave the trending list.' },
      { title: 'Reframe the problem', text: 'Turned it into binary classification: will a video trend for more than one day? Class-weighted Random Forest on a stratified 80/20 split.' },
      { title: 'Optimize for recall', text: 'Prioritized catching multi-day videos early, accepting lower precision as the trade-off.' },
    ],
    findings: {
      finding: [
        { stat: '83%', text: 'Of trending videos drop off the list within 24 hours (Kaplan-Meier estimate).' },
        { stat: 'Duration', text: 'The strongest predictor in the model, followed by channel views, subscribers, and video count.' },
      ],
      model: [
        { stat: '68.3%', text: 'Recall on the test set: 192 of 281 videos that kept trending were flagged.' },
        { stat: '2.9×', text: 'Precision of 49.5% against a 17% base rate. About half of flagged videos kept trending, versus roughly one in six by chance.' },
      ],
      impact: 'Placed 3rd of 10 teams at the DS3 Showcase. No usage or outcome data has been collected.',
    },
    couldInform: [
      'Which trending videos an editorial or creator-tools team might monitor or promote.',
      'How a platform thinks about the “24-hour cliff” when designing trending surfaces.',
    ],
    limitations: [
      'The model trains on a static Kaggle snapshot but scores daily live pulls, so drift over time is likely.',
      'With precision near 50%, about half of flagged videos do not keep trending.',
      'Features describe channels and metadata, not the content itself; feature importance shows association, not cause.',
    ],
    figures: [
      {
        src: '/work/tubescope/km-survival.webp',
        width: 846,
        height: 548,
        alt: 'Kaplan-Meier curve of trending survival: probability stays at 1.0 until day one, then drops to about 0.17, and falls near zero by day three.',
        caption: 'The 24-hour cliff: survival probability falls to about 17% after one day.',
      },
      {
        src: '/work/tubescope/feature-importance.webp',
        width: 989,
        height: 590,
        alt: 'Bar chart of the top 15 features. Duration is the largest at about 0.23, followed by channel view count, subscriber count, and video count near 0.12 each.',
        caption: 'Video duration and channel size dominate the model’s feature importances.',
      },
      {
        src: '/work/tubescope/confusion-matrix.webp',
        width: 722,
        height: 590,
        alt: 'Confusion matrix: 1,166 standard videos correctly predicted, 196 standard videos flagged as viral, 89 viral videos missed, and 192 viral videos correctly flagged.',
        caption: 'Test-set confusion matrix behind the recall and precision figures.',
      },
    ],
  },
  {
    slug: 'adcc',
    // Gallery card image (title card); the project's own screenshots and charts stay in the detail view.
    thumb: { src: '/work/adcc/thumb.webp', width: 718, height: 404 },
    number: '04',
    featured: false,
    tile: { label: 'ADCC', sub: 'Grappling analysis' },
    title: 'ADCC Grappling Analysis',
    subtitle: 'Two decades of elite submission grappling, in data',
    dates: 'Aug – Sept 2025',
    context: 'Individual project',
    kind: 'Exploratory data analysis',
    summary:
      'An exploratory analysis of every ADCC World Championship from 1998 to 2022: how winning techniques changed, and how athletes compete when a title is on the line.',
    headline: { value: '60.5%', label: 'Of finals decided on points, vs. 49.7% of earlier rounds', type: 'finding' },
    links: [{ label: 'GitHub', url: 'https://github.com/yraclimaco/ADCC-Grappling-Analysis', kind: 'code' }],
    stack: ['Python', 'Pandas', 'Matplotlib', 'Seaborn'],
    question:
      'How has the submission-grappling “meta” changed across ADCC World Championships, and do athletes compete more conservatively in finals?',
    contribution: {
      team: false,
      items: ['Cleaned the data and produced the full exploratory analysis and visualizations.'],
    },
    data: [
      '1,028 matches from 14 ADCC World Championship editions, 1998–2022 (Kaggle).',
      'Each match records the winner, win method (submission, points, or decision), submission technique, weight class, and tournament stage.',
    ],
    approach: [
      { title: 'Profile techniques', text: 'Ranked submissions overall, by weight class, and by edition to track trends over time.' },
      { title: 'Compare stages', text: 'Compared how matches are won in opening rounds versus semifinals and finals.' },
      { title: 'Profile athletes', text: 'Built a “winning style” breakdown for the ten most successful competitors.' },
    ],
    findings: {
      finding: [
        { stat: '24.6%', text: 'Of all submission wins came by rear naked choke, the most common finish (99 of 402).' },
        { stat: '4% → 23%', text: 'Heel hooks’ share of submissions (including inside heel hooks), from 1998–2009 to 2011–2019, before falling to 12.5% in 2022.' },
        { stat: '60.5%', text: 'Of finals were decided on points, versus 49.7% of earlier-round matches.' },
      ],
      model: [],
      impact: 'Personal project. Findings are descriptive; no external use has been measured.',
    },
    couldInform: [
      'How athletes and coaches prepare for late-round matches.',
      'How organizers might evaluate rule-set changes against historical finishing rates.',
    ],
    limitations: [
      'Descriptive only. No significance tests were run on the trends.',
      'Finals are a small sample (86 matches), and each edition has only 11–40 submission wins.',
      'Relies on a public Kaggle dataset whose accuracy was not independently verified.',
    ],
    figures: [
      {
        src: '/work/adcc/submission-trends.webp',
        width: 1389,
        height: 790,
        alt: 'Line chart of the top five submissions per edition from 1998 to 2022. Rear naked choke stays highest most years; heel hook spikes to 8 in 2011 and 10 in 2013 before falling to zero by 2019.',
        caption: 'Submission counts by edition for the five most common techniques, as labeled in the data (inside heel hooks are recorded separately).',
      },
      {
        src: '/work/adcc/win-method-by-stage.webp',
        width: 984,
        height: 790,
        alt: 'Stacked bar chart of win methods by stage. Submissions fall from 48% in the first round to 34.9% in finals, while points wins rise from 43.9% to 60.5%.',
        caption: 'Points wins rise as the stakes rise.',
      },
      {
        src: '/work/adcc/winning-styles.webp',
        width: 1183,
        height: 989,
        alt: 'Horizontal stacked bars of win methods for the ten most successful competitors. Marcelo Garcia won 85.2% by submission and Dean Lister 84.2%, while Pablo Popovitch won 78.9% on points.',
        caption: 'Two winning archetypes: submission hunters and points specialists.',
      },
    ],
  },
]

export const featuredProjects = projects.filter((p) => p.featured)
export const getProject = (slug) => projects.find((p) => p.slug === slug)

export const evidenceLabels = {
  model: 'Model performance',
  finding: 'Analytical finding',
  impact: 'Real-world impact',
}
