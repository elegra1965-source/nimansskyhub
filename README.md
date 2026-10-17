# No Man's Sky Hub

**Live:** [nomansskyhub.app](https://nomansskyhub.app)

The front door to a family of free, fan-made *No Man's Sky* tools. One cinematic page that links every tool, dials portal addresses, and tracks the live expedition. No account, no ads, and it installs as an app.

![No Man's Sky Hub: cinematic hero with the title in the NMS alphabet](screenshots/01-hero.jpg)

<p align="center"><a href="https://nomansskyhub.app/assets/nms-hub-tour.mp4"><img src="screenshots/04-tour-preview.gif" alt="Tour preview: portal dialer, ATLAS, the Galactic Map, the camera glyph reader and the Weather Station" width="300"></a><br><b><a href="https://nomansskyhub.app/assets/nms-hub-tour.mp4">▶ Watch the full 2-minute tour</a></b> · <a href="https://nomansskyhub.app/assets/nms-hub-teaser-30s.mp4">34 s teaser</a> · <a href="https://nomansskyhub.app/assets/nms-hub-creator-pack.zip">creator pack</a> (free to use, original music)</p>

## What it does

- **Anomaly intro and cinematic hero** with a live clock and a status bar showing the current expedition, read live from the official Galactic Atlas feed.
- **Six nodes, one network.** Image cards for every tool in the family (see below).
- **Portal dialer.** Enter or tap a 12-glyph portal address, pick any of the 256 galaxies, and jump straight to that system on the Galactic Map.
- **Speak like the Atlas.** A built-in alien-alphabet translator.
- **Expedition milestones & tips.** Under the live expedition card, every milestone of the current expedition by phase — what to do, hints and rewards — read live from the No Man's Sky Wiki.
- **Traveller ID.** Save your name, platform, home galaxy and (optionally) your NMS friend code once. The sister sites read it from a small cookie on `.nomansskyhub.app` (nothing goes to a server): ATLAS greets you by name, the Galactic Map opens in your home galaxy on a first visit, the Weather planet card carries your name, and the Theme Pack's portal wallpaper fills in your name, galaxy and friend code. "Forget me" removes it.
- **Expedition alerts.** A link under the expedition card opens the Weather station's alert settings for new-expedition and ends-in-24-hours notifications.
- **Galactic Alliances.** A short guide to alliances from the Cosmos update, with the details (founding one, joining one, the three-alliance limit, alliance teleporters and how the rankings work) behind a **How alliances work** button. A **live top 5** leaderboard (re-checked every 15 minutes while the page is open) (in-game rank, members, stations and 24-hour changes) sits above it, courtesy of [Voyager's Haven](https://havenmap.online) by [u/IAmThe-Ekimo-1920](https://www.reddit.com/user/IAmThe-Ekimo-1920/); the full top 10 runs on the ATLAS alliance ticker.
- **Recently charted ticker.** Under the hero buttons, a live strip headed *Live from the Galactic Map* says how many systems travellers charted there today and this week, then a slow tape of *name charted system · galaxy · time* links that fly straight to each system. It pauses on hover, keyboard focus or a finger press so a link is easy to tap, stands still for anyone who has reduced motion turned on, and **See all ›** opens the map's own Recently charted list. Read from the map's small `?recent=1` feed; only the names travellers chose to type are shown.
- **Built for phones too.** On a phone the page is about 40% shorter: a sticky jump bar (Tools · Dialer · Translate · Alliances), the six tool cards in one swipeable row, the dialer's explainer and saved addresses folded behind toggles, the translator opening its NMS-text panel when you tap in, the expedition card tucked into the hero, and a back-to-top button. Desktop is unchanged.
- **Short links.** `nomansskyhub.app/atlas`, `/weather`, `/theme`, `/translator` and `/map` jump to each tool.

![Recently charted ticker under the hero buttons: Live from the Galactic Map, 4 systems charted by travellers today, 12 this week, OldSaltySak charted Jura-Tempest Federation](screenshots/06-charted-ticker.jpg)

![Six nodes, one network: image cards for every tool](screenshots/02-nodes.jpg)

![Galactic Alliances guide from the Cosmos update](screenshots/03-alliances.jpg)

**New on the Theme Pack: make it yours.** Put your Traveller name and home portal glyphs on a wallpaper, wear one of today's real player-charted planets from the Weather Station, or keep a live expedition countdown on your home screen: [theme.nomansskyhub.app](https://theme.nomansskyhub.app/#studio-portal).

![Portal wallpaper, planet of the day and the expedition countdown](screenshots/05-make-it-yours.jpg)

## The family

| Tool | Link |
|---|---|
| ATLAS — voice AI companion | [atlas.nomansskyhub.app](https://atlas.nomansskyhub.app) |
| Weather as a planet scan | [weather.nomansskyhub.app](https://weather.nomansskyhub.app) |
| Galactic Map and portal decoder | [map.nomansskyhub.app](https://map.nomansskyhub.app) |
| Theme Pack — icons, wallpapers, font | [theme.nomansskyhub.app](https://theme.nomansskyhub.app) |
| Alphabet Translator | [translator.nomansskyhub.app](https://translator.nomansskyhub.app) |

## How it's built

Plain HTML, CSS and JavaScript with no build step and no framework. Deployed on Netlify straight from this repo: every push to `main` goes live.

| File | What it is |
|---|---|
| `index.html` | The whole page: layout, styles and logic |
| `codex.js`, `expguide.js`, `expguide.css` | Expedition milestones & tips (NMS Wiki data; `codex.js` is shared with ATLAS) |
| `mobile.css`, `mobile.js` | Phone layout: jump bar, swipeable tool cards, dialer folds, back-to-top |
| `alliances.css`, `alliances.js` | The Galactic Alliances section, including the live top 5 |
| `_redirects` | Short links, plus same-origin proxies for the Galactic Atlas API (`/nms-api/`) and the Voyager's Haven alliance leaderboard (`/haven-api/alliances`) |
| `sw.js` | Service worker for install and offline use |
| `manifest.webmanifest` | App install details |
| `assets/` | Backgrounds, intro video, glyph masks, icons and the NMS alphabet font |

## Videos for creators

All linked in the page footer and free to use in videos (monetised ones included), reviews and posts. The music in the tour and teaser is original, made for them (no third-party tracks or samples), so they won't trigger copyright / Content ID claims. A credit to nomansskyhub.app is appreciated.

- `assets/nms-hub-tour.mp4`: 2-minute captioned tour of every tool, portrait 1080x1920, original music (FULL TOUR VIDEO)
- `assets/nms-hub-teaser-30s.mp4`: 34-second captioned teaser for Shorts, Reels and TikTok (30s TEASER)
- `assets/nms-hub-creator-pack.zip`: 19 clean 16:9 clips of every tool, 1920x1080, 5-10 seconds each, no text and no audio, with a README (CREATOR PACK)
- `assets/nms-hub-portal-dialer-clip.mp4`: 17-second clip of the portal dialer (CREATOR CLIP)
- `assets/nms-hub-tour-shotlist.txt`: timestamps for every scene in the tour (SHOT LIST)

## Credits

- Live expedition data: the official Galactic Atlas API by Hello Games
- Expedition milestones: the [No Man's Sky Wiki](https://nomanssky.fandom.com) community (CC BY-SA)
- Real worlds and alliance leaderboard (in ATLAS and NMS Weather): [Voyager's Haven](https://havenmap.online), built and run by [u/IAmThe-Ekimo-1920](https://www.reddit.com/user/IAmThe-Ekimo-1920/)
- NMS Alphabet font by seontonppa (built with FontStruct), used with permission

## Licence

The code is MIT licensed (see `LICENSE`). Game names, glyphs and imagery belong to Hello Games and are not covered by that licence.

*An unofficial, fan-made project. Not affiliated with, sponsored by, or endorsed by Hello Games.*

Built by elegra1965.
