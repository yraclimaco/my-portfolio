// Beyond Data: hobbies and interests. The page lays these out; to add a story or photos, edit
// this file only. See docs/beyond-data.md for the full guide.
//
// Each interest:
//   id        stable identifier, also the page anchor (/beyond-data#bjj)
//   title     heading
//   summary   one or two short sentences
//   story     optional longer text: a string, or an array of paragraphs
//   links     optional [{ label, to }] (to: a site path like '/projects/adcc', or a full URL)
//   photos    optional [{ src, alt, caption, width, height, position }]
//             src: a path under /public, e.g. '/beyond/bjj/open-mat.webp'
//             alt: what the photo shows, for people who cannot see it (required)
//             caption: optional short line shown under the photo
//             width/height: the image's pixel size, so the page reserves its space while it loads
//             position: optional crop focus when the photo is trimmed to fit, e.g. '50% 20%'
//   accent    which small illustration to show: 'bjj' | 'games' | 'cards' | 'food'
//
// The "On repeat" song below the interests is edited here too (see `music`).

export const beyondIntro = 'Outside of data: Brazilian Jiu-Jitsu, board games, card magic, and trying new food.'

export const interests = [
  {
    id: 'bjj',
    title: 'Brazilian Jiu-Jitsu',
    summary: 'I train at Surfight. The sport also became a dataset.',
    story: '',
    links: [{ label: 'See the ADCC analysis', to: '/projects/adcc' }],
    photos: [
      {
        src: '/beyond/bjj/jjwl-san-diego.webp',
        alt: 'Holding a medal in front of the Jiu Jitsu World League San Diego banner.',
        caption: 'Jiu Jitsu World League, San Diego.',
        width: 747,
        height: 1600,
        position: '50% 35%',
      },
      {
        src: '/beyond/bjj/grappling.webp',
        alt: 'Two grapplers in dark shirts on a mat, one behind the other with an arm around the other’s neck.',
        caption: 'Grappling.',
        width: 428,
        height: 640,
      },
      {
        src: '/beyond/bjj/agf-podium.webp',
        alt: 'Three competitors with medals on a podium in front of an American Grappling Federation banner.',
        caption: 'American Grappling Federation tournament.',
        width: 480,
        height: 640,
      },
      {
        src: '/beyond/bjj/surfight-gym.webp',
        alt: 'The Surfight training room: green mats under a ceiling hung with surfboards.',
        caption: 'Surfight, with its surfboard ceiling.',
        width: 480,
        height: 640,
      },
    ],
    accent: 'bjj',
  },
  {
    id: 'board-games',
    title: 'Board games',
    summary: 'Catan and more. The reason this portfolio is a board.',
    story: '',
    links: [],
    photos: [
      {
        src: '/beyond/board-games/catan.webp',
        alt: 'A game of Catan in progress on a marble table, with resource cards and the box nearby.',
        caption: 'A game of Catan.',
        width: 480,
        height: 640,
      },
      {
        src: '/beyond/board-games/catan-big-map.webp',
        alt: 'A very large Catan map spread across a table, with players placing pieces.',
        caption: 'Catan on a much bigger map.',
        width: 480,
        height: 640,
      },
      {
        src: '/beyond/board-games/game-night.webp',
        alt: 'Friends around a dining table playing a board game with a large map board and many cards.',
        caption: 'Game night.',
        width: 480,
        height: 640,
      },
    ],
    accent: 'games',
  },
  {
    id: 'card-magic',
    title: 'Card magic',
    summary: 'Practicing sleight of hand, and visiting the Magic Castle.',
    story: '',
    links: [],
    photos: [
      {
        src: '/beyond/card-magic/magic-castle.webp',
        alt: 'A group dressed up and smiling in front of the Magic Castle backdrop.',
        caption: 'A visit to the Magic Castle.',
        width: 629,
        height: 640,
      },
    ],
    accent: 'cards',
  },
  {
    id: 'food',
    title: 'Trying new food',
    summary: 'Always looking for the next spot to try.',
    story: '',
    links: [],
    photos: [
      {
        src: '/beyond/food/katsu-curry.webp',
        alt: 'A plate of Japanese curry with a breaded cutlet, rice, and pickles.',
        caption: 'Katsu curry.',
        width: 480,
        height: 640,
      },
      {
        src: '/beyond/food/taco-spread.webp',
        alt: 'A table spread of tacos, tortas, radishes, and limes, with a horchata.',
        caption: 'A taco spread.',
        width: 1200,
        height: 1600,
      },
      {
        src: '/beyond/food/poke-bowl.webp',
        alt: 'A takeout poke bowl with tuna, spicy salmon, and rice topped with furikake.',
        caption: 'A poke bowl.',
        width: 480,
        height: 640,
      },
      {
        src: '/beyond/food/banana-bread.webp',
        alt: 'Two thick slices of homemade banana bread with chocolate chips on a black plate, on a speckled counter.',
        caption: 'Banana bread I baked.',
        width: 960,
        height: 1280,
      },
    ],
    accent: 'food',
  },
]

// "On repeat": one song to recommend, picked by hand (not live listening data).
//   title, artist  shown as written
//   artwork        { src, alt, width, height }: the cover image, kept under /public
//   trackUrl       the song's Spotify link (open.spotify.com/track/...). Leave '' to hide the link.
//   previewUrl     a short audio preview (about 30 seconds) for the play button. Leave '' to hide the
//                  button. Spotify no longer shares preview clips, so this one is Apple's public
//                  preview of the same song, from the Collide With The Sky album.
//   profileUrl     your Spotify profile link. Leave '' and the profile icon stays hidden.
export const music = {
  heading: 'On repeat',
  title: 'Hold On Till May',
  artist: 'Pierce the Veil',
  artwork: {
    src: '/beyond/music/hold-on-till-may.jpg',
    alt: 'Album cover for Collide With The Sky by Pierce the Veil: a weathered house with a figure floating above it under a cloudy blue sky.',
    width: 300,
    height: 300,
  },
  trackUrl: 'https://open.spotify.com/track/6ZTykhKItjlAEjZXl81GUO',
  previewUrl:
    'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/88/92/e9/8892e99f-12e4-6b21-f88f-5e25ebbac5f1/mzaf_3853468370589365417.plus.aac.p.m4a',
  profileUrl: 'https://open.spotify.com/user/v1hg1ue2bpil0af29p6knxqt5',
}
