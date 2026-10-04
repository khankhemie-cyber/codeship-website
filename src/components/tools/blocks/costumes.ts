/**
 * Built-in characters and page backgrounds, drawn as inline SVG so there is
 * nothing to download and nothing for a child to upload. Characters are
 * 100x100 and face the viewer; names are for adults (alt text, menus).
 */

export type Costume = { id: string; name: { en: string; fr: string }; svg: string };

const svg = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${body}</svg>`;

export const COSTUMES: Costume[] = [
  {
    id: "robot",
    name: { en: "Robot", fr: "Robot" },
    svg: svg(
      `<line x1="50" y1="8" x2="50" y2="20" stroke="#586173" stroke-width="4"/><circle cx="50" cy="7" r="5" fill="#D58401"/>` +
        `<rect x="26" y="20" width="48" height="34" rx="10" fill="#B8C4D6" stroke="#586173" stroke-width="3"/>` +
        `<circle cx="40" cy="36" r="6" fill="#010F2A"/><circle cx="60" cy="36" r="6" fill="#010F2A"/><circle cx="42" cy="34" r="2" fill="#fff"/><circle cx="62" cy="34" r="2" fill="#fff"/>` +
        `<rect x="40" y="46" width="20" height="4" rx="2" fill="#035762"/>` +
        `<rect x="22" y="57" width="56" height="32" rx="8" fill="#9FB0C8" stroke="#586173" stroke-width="3"/><circle cx="50" cy="72" r="7" fill="#D58401"/>` +
        `<rect x="10" y="60" width="10" height="22" rx="5" fill="#B8C4D6" stroke="#586173" stroke-width="3"/><rect x="80" y="60" width="10" height="22" rx="5" fill="#B8C4D6" stroke="#586173" stroke-width="3"/>` +
        `<rect x="32" y="89" width="12" height="9" rx="3" fill="#586173"/><rect x="56" y="89" width="12" height="9" rx="3" fill="#586173"/>`,
    ),
  },
  {
    id: "can",
    name: { en: "Can", fr: "Canette" },
    svg: svg(
      `<ellipse cx="50" cy="20" rx="22" ry="7" fill="#C9D2DE" stroke="#586173" stroke-width="3"/><rect x="28" y="20" width="44" height="62" fill="#E53935" stroke="#586173" stroke-width="3"/>` +
        `<ellipse cx="50" cy="82" rx="22" ry="7" fill="#B71C1C" stroke="#586173" stroke-width="3"/><rect x="28" y="40" width="44" height="18" fill="#fff"/><path d="M36 49h28" stroke="#E53935" stroke-width="5" stroke-linecap="round"/>`,
    ),
  },
  {
    id: "bin",
    name: { en: "Recycling bin", fr: "Bac de recyclage" },
    svg: svg(
      `<rect x="18" y="16" width="64" height="12" rx="4" fill="#1565C0" stroke="#0D3C78" stroke-width="3"/><path d="M24 28h52l-6 62H30z" fill="#1E88E5" stroke="#0D3C78" stroke-width="3"/>` +
        `<path d="M50 44l9 15H41z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><path d="M37 66h26" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
    ),
  },
  {
    id: "card",
    name: { en: "Card", fr: "Carte" },
    svg: svg(
      `<rect x="16" y="14" width="68" height="74" rx="6" fill="#FFE3EC" stroke="#C2185B" stroke-width="3"/>` +
        `<path d="M50 70C30 56 28 44 34 38c5-5 12-3 16 4 4-7 11-9 16-4 6 6 4 18-16 32z" fill="#E91E63"/><circle cx="28" cy="24" r="3" fill="#D58401"/><circle cx="72" cy="80" r="3" fill="#D58401"/>`,
    ),
  },
  {
    id: "tree",
    name: { en: "Park tree", fr: "Arbre du parc" },
    svg: svg(`<rect x="44" y="58" width="12" height="34" rx="3" fill="#795548"/><circle cx="50" cy="40" r="28" fill="#43A047"/><circle cx="34" cy="50" r="16" fill="#388E3C"/><circle cx="66" cy="50" r="16" fill="#388E3C"/><circle cx="58" cy="30" r="4" fill="#E53935"/><circle cx="40" cy="42" r="4" fill="#E53935"/>`),
  },
  {
    id: "library",
    name: { en: "Library", fr: "Bibliothèque" },
    svg: svg(
      `<path d="M10 34L50 10l40 24z" fill="#4E2B6F"/><rect x="14" y="34" width="72" height="8" fill="#7E57C2"/><rect x="14" y="84" width="72" height="8" fill="#7E57C2"/>` +
        `<rect x="20" y="42" width="8" height="42" fill="#EDE7F6"/><rect x="36" y="42" width="8" height="42" fill="#EDE7F6"/><rect x="56" y="42" width="8" height="42" fill="#EDE7F6"/><rect x="72" y="42" width="8" height="42" fill="#EDE7F6"/>` +
        `<rect x="45" y="58" width="10" height="26" fill="#D58401"/>`,
    ),
  },
  {
    id: "school",
    name: { en: "School", fr: "École" },
    svg: svg(
      `<rect x="16" y="40" width="68" height="50" fill="#EF6C00"/><path d="M10 42L50 18l40 24z" fill="#BF360C"/><line x1="50" y1="18" x2="50" y2="4" stroke="#586173" stroke-width="3"/><path d="M50 4h14l-4 4 4 4H50z" fill="#E53935"/>` +
        `<rect x="24" y="50" width="14" height="12" fill="#BBDEFB"/><rect x="62" y="50" width="14" height="12" fill="#BBDEFB"/><rect x="42" y="64" width="16" height="26" fill="#5D4037"/><circle cx="50" cy="32" r="6" fill="#fff"/>`,
    ),
  },
  {
    id: "house",
    name: { en: "House", fr: "Maison" },
    svg: svg(`<path d="M12 48L50 14l38 34z" fill="#C62828"/><rect x="22" y="46" width="56" height="44" fill="#FFF3E0" stroke="#8D6E63" stroke-width="3"/><rect x="42" y="62" width="16" height="28" fill="#6D4C41"/><rect x="28" y="54" width="10" height="10" fill="#90CAF9"/><rect x="62" y="54" width="10" height="10" fill="#90CAF9"/>`),
  },
  {
    id: "cat",
    name: { en: "Cat", fr: "Chat" },
    svg: svg(
      `<path d="M22 38L28 10l18 18M78 38L72 10 54 28" fill="#FFA726" stroke="#E65100" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="52" r="32" fill="#FFA726" stroke="#E65100" stroke-width="3"/>` +
        `<circle cx="38" cy="48" r="5" fill="#010F2A"/><circle cx="62" cy="48" r="5" fill="#010F2A"/><path d="M46 60l4 4 4-4z" fill="#E91E63"/><path d="M50 64c-3 6-10 6-12 2M50 64c3 6 10 6 12 2" fill="none" stroke="#010F2A" stroke-width="2"/>`,
    ),
  },
  {
    id: "dog",
    name: { en: "Dog", fr: "Chien" },
    svg: svg(
      `<ellipse cx="22" cy="44" rx="10" ry="22" fill="#6D4C41"/><ellipse cx="78" cy="44" rx="10" ry="22" fill="#6D4C41"/><circle cx="50" cy="50" r="30" fill="#A1887F"/>` +
        `<circle cx="39" cy="44" r="5" fill="#010F2A"/><circle cx="61" cy="44" r="5" fill="#010F2A"/><ellipse cx="50" cy="60" rx="8" ry="6" fill="#010F2A"/><path d="M50 66v6" stroke="#010F2A" stroke-width="2"/><ellipse cx="50" cy="78" rx="6" ry="5" fill="#E57373"/>`,
    ),
  },
  {
    id: "star",
    name: { en: "Star", fr: "Étoile" },
    svg: svg(`<path d="M50 8l12 26 28 3-21 19 6 28-25-15-25 15 6-28-21-19 28-3z" fill="#FFCA28" stroke="#D58401" stroke-width="3" stroke-linejoin="round"/><circle cx="42" cy="46" r="3" fill="#010F2A"/><circle cx="58" cy="46" r="3" fill="#010F2A"/><path d="M43 56q7 6 14 0" fill="none" stroke="#010F2A" stroke-width="2.5"/>`),
  },
  {
    id: "gift",
    name: { en: "Present", fr: "Cadeau" },
    svg: svg(`<rect x="16" y="40" width="68" height="50" fill="#26A69A"/><rect x="12" y="30" width="76" height="14" fill="#00897B"/><rect x="44" y="30" width="12" height="60" fill="#FFCA28"/><path d="M50 30c-10-16-26-12-20-2 3 4 20 2 20 2zM50 30c10-16 26-12 20-2-3 4-20 2-20 2z" fill="#FFCA28"/>`),
  },
  {
    id: "sun",
    name: { en: "Sun", fr: "Soleil" },
    svg: svg(`<g stroke="#FFA000" stroke-width="6" stroke-linecap="round"><path d="M50 4v12M50 84v12M4 50h12M84 50h12M17 17l9 9M74 74l9 9M17 83l9-9M74 26l9-9"/></g><circle cx="50" cy="50" r="24" fill="#FFCA28"/>`),
  },
  {
    id: "car",
    name: { en: "Car", fr: "Voiture" },
    svg: svg(`<path d="M14 62l8-20h50l14 20z" fill="#1E88E5"/><rect x="8" y="60" width="84" height="18" rx="6" fill="#1565C0"/><rect x="28" y="46" width="18" height="14" fill="#BBDEFB"/><rect x="52" y="46" width="18" height="14" fill="#BBDEFB"/><circle cx="28" cy="80" r="9" fill="#263238"/><circle cx="72" cy="80" r="9" fill="#263238"/>`),
  },
  {
    id: "ball",
    name: { en: "Ball", fr: "Ballon" },
    svg: svg(`<circle cx="50" cy="50" r="36" fill="#fff" stroke="#263238" stroke-width="3"/><path d="M50 32l14 10-5 17H41l-5-17z" fill="#263238"/><path d="M50 14v18M86 44l-22-2M14 44l22-2M72 82l-13-23M28 82l13-23" stroke="#263238" stroke-width="3"/>`),
  },
  {
    id: "flower",
    name: { en: "Flower", fr: "Fleur" },
    svg: svg(`<path d="M50 56v38" stroke="#388E3C" stroke-width="5"/><path d="M50 78c-10-10-22-6-24 0 10 4 18 4 24 0z" fill="#43A047"/><g fill="#EC407A"><circle cx="50" cy="20" r="13"/><circle cx="72" cy="36" r="13"/><circle cx="64" cy="60" r="13"/><circle cx="36" cy="60" r="13"/><circle cx="28" cy="36" r="13"/></g><circle cx="50" cy="42" r="11" fill="#FFCA28"/>`),
  },
];

export const costumeById = (id: string) => COSTUMES.find((c) => c.id === id) ?? COSTUMES[0];

export const costumeUrl = (id: string) => `data:image/svg+xml;utf8,${encodeURIComponent(costumeById(id).svg)}`;

export type Background = { id: string; name: { en: string; fr: string }; css: string };

/** Page backgrounds: plain colour fields so the counting grid stays readable on top. */
export const BACKGROUNDS: Background[] = [
  { id: "grass", name: { en: "Grass", fr: "Herbe" }, css: "linear-gradient(#BDE5F8 0 25%, #A5D6A7 25%)" },
  { id: "map", name: { en: "Map", fr: "Carte" }, css: "linear-gradient(90deg, transparent 47%, #FFFFFF 47% 53%, transparent 53%), linear-gradient(transparent 47%, #FFFFFF 47% 53%, transparent 53%), #DCEDC8" },
  { id: "room", name: { en: "Room", fr: "Chambre" }, css: "linear-gradient(#FFF3E0 0 70%, #D7B899 70%)" },
  { id: "street", name: { en: "Street", fr: "Rue" }, css: "linear-gradient(#BBDEFB 0 45%, #CFD8DC 45% 75%, #90A4AE 75%)" },
  { id: "sky", name: { en: "Sky", fr: "Ciel" }, css: "linear-gradient(#81D4FA, #E1F5FE)" },
  { id: "party", name: { en: "Party", fr: "Fête" }, css: "radial-gradient(circle at 20% 20%, #FFE082 0 6%, transparent 7%), radial-gradient(circle at 80% 30%, #F8BBD0 0 6%, transparent 7%), radial-gradient(circle at 60% 80%, #B2EBF2 0 6%, transparent 7%), #FFF8E1" },
  { id: "night", name: { en: "Night", fr: "Nuit" }, css: "radial-gradient(circle at 80% 20%, #FFF9C4 0 5%, transparent 6%), linear-gradient(#1A237E, #3949AB)" },
  { id: "plain", name: { en: "Plain", fr: "Uni" }, css: "#FFFFFF" },
];

export const backgroundById = (id: string) => BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];
