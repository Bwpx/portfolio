// Static data shared by the desktop, the dock and the Settings app.
// Kept free of components so any file can import it without cycles.

// w/h: preferred window size; x/y: preferred position as a fraction of the screen.
// Apps with an href (classic, controller) open a page instead of a window;
// `external` ones open in a new tab. `hint` is read out by screen readers.
export const APP_META = {
  about: { title: "About Me", tile: "linear-gradient(135deg,#f59e0b,#ea580c)", w: 560, h: 600, x: 0.1, y: 0.06 },
  projects: { title: "Projects", tile: "linear-gradient(135deg,#38bdf8,#4f46e5)", w: 640, h: 540, x: 0.4, y: 0.1 },
  controller: {
    title: "Controller Diagnostics",
    tile: "linear-gradient(135deg,#a78bfa,#7c3aed)",
    href: "https://controller-diagnostics.vercel.app",
    external: true,
    hint: "opens in a new tab",
  },
  resume: { title: "Resume", tile: "linear-gradient(135deg,#e2e8f0,#94a3b8)", w: 660, h: 640, x: 0.24, y: 0.04 },
  skills: { title: "Skills", tile: "linear-gradient(135deg,#34d399,#0d9488)", w: 480, h: 400, x: 0.18, y: 0.3 },
  contact: { title: "Contact", tile: "linear-gradient(135deg,#fb7185,#db2777)", w: 460, h: 420, x: 0.56, y: 0.26 },
  browser: { title: "Browser", tile: "linear-gradient(135deg,#60a5fa,#0891b2)", w: 900, h: 600, x: 0.16, y: 0.05, flush: true },
  terminal: { title: "Terminal", tile: "linear-gradient(135deg,#3f3f46,#18181b)", w: 620, h: 400, x: 0.32, y: 0.38 },
  notes: { title: "Notes", tile: "linear-gradient(135deg,#fde047,#f59e0b)", w: 640, h: 440, x: 0.44, y: 0.2, flush: true },
  calculator: { title: "Calculator", tile: "linear-gradient(135deg,#a1a1aa,#52525b)", w: 300, h: 460, x: 0.66, y: 0.12, flush: true },
  settings: { title: "Settings", tile: "linear-gradient(135deg,#94a3b8,#475569)", w: 640, h: 660, x: 0.3, y: 0.03, flush: true },
  classic: {
    title: "Classic View",
    tile: "linear-gradient(135deg,#71717a,#3f3f46)",
    href: "/",
    hint: "opens the classic site",
  },
};

export const APP_IDS = Object.keys(APP_META);

export const DEFAULT_DESKTOP = ["about", "projects", "controller", "resume", "contact", "classic"];
export const DEFAULT_DOCK = [
  "about",
  "projects",
  "controller",
  "skills",
  "contact",
  "browser",
  "terminal",
  "notes",
  "calculator",
  "settings",
];

// Photos from Wikimedia Commons featured pictures, resized for the web.
export const WALLPAPERS = [
  {
    id: "lake-louise",
    name: "Lake Louise",
    kind: "Mountains",
    author: "Chensiyuan",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:1_lake_louise_pano_2019.jpg",
  },
  {
    id: "alpine-dusk",
    name: "Alpine Dusk",
    kind: "Mountains",
    author: "Diego Delso",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Hochries,_Alpes_del_Chiemgau,_Alemania,_2024-10-19,_DD_34-36_HDR.jpg",
  },
  {
    id: "river-dusk",
    name: "Mekong at Dusk",
    kind: "River",
    author: "Basile Morin",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Li_Phi_falls_at_dusk_with_colorful_sky_in_Don_Khon_Laos.jpg",
  },
  {
    id: "highland-stream",
    name: "Highland Stream",
    kind: "River",
    author: "Eric Kilby",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Birks_of_Aberfeldy_(55085667062).jpg",
  },
  {
    id: "rainforest-falls",
    name: "Hopetoun Falls",
    kind: "Waterfall",
    author: "Diliff",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Hopetoun_falls.jpg",
  },
  {
    id: "forest-light",
    name: "Forest Light",
    kind: "Forest",
    author: "Dietmar Rabich",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Rorup,_NSG_Roruper_Holz_--_2021_--_8187-91.jpg",
  },
  {
    id: "autumn-valley",
    name: "Autumn Valley",
    kind: "Forest",
    author: "Rbrechko",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:21-224-5054_NNP_Synevyr_RB_18.jpg",
  },
  {
    id: "cherry-blossoms",
    name: "Cherry Blossoms",
    kind: "Spring",
    author: "掬茶",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Rail_tracks_and_cherry_trees_in_Ashino_Park.jpg",
  },
  {
    id: "still-lake",
    name: "Still Lake",
    kind: "Lake",
    author: "Bartosz Dworski",
    license: "CC BY-SA 3.0 PL",
    source: "https://commons.wikimedia.org/wiki/File:Dolina_Baryczy_1.jpg",
  },
  {
    id: "coastline",
    name: "Point Reyes",
    kind: "Coast",
    author: "King of Hearts",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Chimney_Rock_Trail_Point_Reyes_December_2016_panorama_1.jpg",
  },
  {
    id: "milky-way",
    name: "Milky Way",
    kind: "Night sky",
    author: "Juliancolton",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Bontecou_Lake_Milky_Way_panorama.jpg",
  },
  // The original drawn-in-CSS wallpaper; follows the light/dark theme.
  { id: "classic", name: "Classic", kind: "Drawn in CSS" },
];

export const DEFAULT_WALLPAPER = "lake-louise";

export const wallpaperUrl = (id, thumb = false) =>
  `/wallpapers/${id}${thumb ? "-thumb" : ""}.jpg`;

export const SOURCE_URL = "https://github.com/bwpx/portfolio";
