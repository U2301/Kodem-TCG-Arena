// normalize-kodem.js
const fs = require('fs');

function getArg(flag, def = undefined) {
  const i = process.argv.indexOf(flag);
  if (i >= 0 && i < process.argv.length - 1) return process.argv[i + 1];
  return def;
}
function hasFlag(flag) { return process.argv.includes(flag); }

const IN_PATH  = getArg('--in',  'cards.json');
const OUT_PATH = getArg('--out', 'KodemCards.tcg.json');
const GH_USER  = getArg('--user');
const GH_REPO  = getArg('--repo');
const USE_PAGES = hasFlag('--pages');

function toNum(v) {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const s = String(v).trim();
  if (!s || s === '?' || s.toLowerCase() === 'null') return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}
function toStr(v) { return (v === null || v === undefined) ? '' : String(v); }

function normalizeCard(c) {
  const id = toStr(c.folio || `${toStr(c.set)}-${toStr(c.name)}` || '').trim();
  const rarity = Array.isArray(c.rarity_variants) ? c.rarity_variants : [];
  const norm = {
    id: id,
    folio: toStr(c.folio || id),
    name: toStr(c.name),
    set: toStr(c.set),
    type: toStr(c.type),
    subtype: toStr(c.subtype),
    energy: toStr(c.energy),
    energy2: toStr(c.energy2),
    damage: toNum(c.damage),
    rests: toNum(c.rests),
    effect_type: toStr(c.effect_type),
    effect_text: toStr(c.effect_text),
    cost_text: toStr(c.cost_text),
    flavor_text: toStr(c.flavor_text),
    species: toStr(c.species),
    artist: toStr(c.artist),
    rarity_variants: rarity,
    image: toStr(c.image)
  };
  delete norm._note; // limpiar notas internas
  return norm;
}
function isPlayable(card) {
  return (card.type || '').toLowerCase() !== 'art print'; // excluye Art Print
}

(function main() {
  // 1) cargar cards.json
  const raw = fs.readFileSync(IN_PATH, 'utf8');
  let data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error('El archivo de entrada debe ser un array de cartas.');

  // 2) normalizar y filtrar
  const normalized = data.map(normalizeCard).filter(isPlayable);

  // 3) guardar catálogo
  fs.writeFileSync(OUT_PATH, JSON.stringify(normalized, null, 2), 'utf8');
  console.log(`✅ ${OUT_PATH} generado (${normalized.length} cartas)`);

  // 4) mazo demo
  const pickByType = (t) => normalized.find(c => (c.type || '').toLowerCase() === t);
  const protector = pickByType('protector');
  const bio = pickByType('bio');
  const adendei = normalized.filter(c => (c.type || '').toLowerCase() === 'adendei').slice(0, 2);

  const demoDeck = {
    name: "Demo — Test Kódem",
    cards: [
      ...(protector ? [{ id: protector.id, qty: 1, zone: "protector" }] : []),
      ...(bio       ? [{ id: bio.id,       qty: 1, zone: "bio"       }] : []),
      ...adendei.map(c => ({ id: c.id, qty: 1, zone: "deck" }))
    ]
  };
  fs.writeFileSync('KodemDecks.json', JSON.stringify([demoDeck], null, 2), 'utf8');
  console.log(`✅ KodemDecks.json generado`);

  // 5) game file para Pages o raw
  if (GH_USER && GH_REPO) {
    const base = USE_PAGES
      ? `https://${GH_USER}.github.io/${GH_REPO}`
      : `https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main`;

    const game = {
      name: "Kódem TCG (Testing)",
      version: "0.1.0",
      cardsUrl: `${base}/${OUT_PATH}`,
      decksUrl: `${base}/KodemDecks.json`,
      images: {
        frontTemplate: `${base}/images/{id}.webp`,
        backDefault: `${base}/images/kodem-back.png`
      },
      layout: {
        zones: [
          { id: "deck",      name: "Mazo",           visible: false },
          { id: "board",     name: "Zona Principal", slots: 3, visible: true },
          { id: "protector", name: "Protector",      visible: true },
          { id: "bio",       name: "Bio",            visible: true },
          { id: "equips",    name: "Equipos",        visible: true },
          { id: "grave",     name: "Extinción",      visible: true }
        ],
        startingSetup: {
          putFaceDown: { board: 3 },
          protector: { life: 12, rests: 3 },
          lifeDefault: 6
        }
      },
      rules: {
        minDeckSize: 15,
        maxDeckSize: 24,
        shuffleDeck: false,
        replacement: { take: 3, choose: 1, putBackBottom: true }
      },
      script: `${base}/Script_Kodem.js`,
      ui: {
        statusTags: ["Quemar","Envenenar","Abismar","Protegida/o"],
        counters: ["Vida","Descansos"]
      }
    };
    fs.writeFileSync('Game_Kodem-Testing.json', JSON.stringify(game, null, 2), 'utf8');
    console.log(`✅ Game_Kodem-Testing.json generado -> ${game.cardsUrl}`);
  } else {
    console.log('ℹ️ Pasa --user y --repo para generar Game_Kodem-Testing.json con URLs completas.');
  }
})();