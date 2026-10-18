# Updating Beyond Data (hobbies, stories, photos)

Everything on the Beyond Data page comes from one file: `src/content/beyond.js`.
You never need to touch the layout components to add a story or photos.

## 1. Add the photo files

Put images in `public/beyond/<interest id>/`, for example:

```
public/beyond/bjj/open-mat.jpg
public/beyond/board-games/game-night.jpg
```

Tips:

- Use JPG or WebP, about 1600 px on the long side, under ~400 KB each.
- Landscape (4:3 or 3:2) photos crop best. Photos are shown at 4:3 and centered, so keep the subject near the middle.
- Only use photos you took or have permission to use.

## 2. List them in `src/content/beyond.js`

Each interest has a `photos` array. Add one object per photo:

```js
{
  id: 'bjj',
  title: 'Brazilian Jiu-Jitsu',
  summary: 'It also became a dataset.',
  story: [
    'First paragraph of a longer story (optional).',
    'Second paragraph (optional).',
  ],
  links: [{ label: 'See the ADCC analysis', to: '/projects/adcc' }],
  photos: [
    {
      src: '/beyond/bjj/open-mat.jpg', // path under /public, starting with /
      alt: 'Two people practicing a guard pass on mats', // what the photo shows (required)
      caption: 'Open mat at the UCSD BJJ Club.', // optional, shown under the photo
      width: 1600, // the image's real pixel size (reserves space while it loads)
      height: 1200,
    },
  ],
  accent: 'bjj',
},
```

Field reference:

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Stable identifier and page anchor (`/beyond-data#bjj`). Don't change it once shared. |
| `title` | yes | Section heading. |
| `summary` | yes | One or two short sentences. |
| `story` | no | A string, or an array of strings for several paragraphs. |
| `links` | no | `{ label, to }`. Use a site path (`/projects/adcc`) or a full URL (`https://...`, opens in a new tab). |
| `photos` | no | See above. `alt` is required for each photo; `caption`, `width`, `height` are optional but recommended. |
| `accent` | yes | Illustration: `'bjj'`, `'games'`, `'cards'`, or `'food'`. |

## How the page adapts

- **No photos:** the interest shows its illustration (nothing empty is shown).
- **One photo:** shown large as a print, with its caption; click or press Enter to open a larger view.
- **Several photos:** the first is shown large, the next three as a strip; a "+N" marks any beyond that. All open in the larger view, which supports the arrow keys and Escape.

To find an image's pixel size on Windows: right-click the file, Properties, Details tab.

## Preview before publishing

Run `npm run dev` and open http://localhost:5177/beyond-data.
In development only, `http://localhost:5177/beyond-data?photos=demo` fills in sample photos so you can see the one-photo and several-photo layouts.
