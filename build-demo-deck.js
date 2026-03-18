// build-demo-deck.js
// Genera un KodemDecks.json "Demo — Kódem 15" con:
// - 15 Adendei (si hay suficientes en el catálogo)
// - +1 Protector (si existe), +1 Bio (si existe)
//
// Entrada:  KodemCards.json  (array de cartas con { id, type, ... })
// Salida:   KodemDecks.json  (array con 1 deck en formato simple)
//
// Uso:
//   node build-demo-deck.js
//
// Opcionales:
//   node build-demo-deck.js --take 18    # para tomar 18 Adendei en lugar de 15
//   node build-demo-deck.js --format Extended  # si quieres otro nombre de formato

const fs = require('fs');

function arg(name, def) {
  const i = process.argv.indexOf(name);
  if (i >= 0 && i < process.argv.length - 1) return process.argv[i + 1];
  return def;
}

const TAKE = Number(arg('--take', '15')) || 15;
const FORMAT = arg('--format', 'Classic');

const CARDS_PATH = 'KodemCards.json';
const DECKS_PATH = 'KodemDecks.json';

function normType(s) {
  return String(s || '').trim().toLowerCase();
}

function loadJson(p) {
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

function main() {
  const cards = loadJson(CARDS_PATH);

  // Seleccionar cartas por tipo
  const byType = cards.reduce((acc, c) => {
    const t = normType(c.type);
    (acc[t] ||= []).push(c);
    return acc;
  }, {});

  const adendei = byType['adendei'] || [];
  const protector = (byType['protector'] || [])[0] || null;
  const bio = (byType['bio'] || [])[0] || null;

  if (adendei.length === 0) {
    console.error('❌ No se encontraron cartas de tipo "Adendei" en KodemCards.json.');
    process.exit(1);
  }

  const picked = adendei.slice(0, TAKE);
  const nowIso = new Date().toISOString();

  // Construimos el deck en formato simple: [{ name, cards:[ {id, qty, zone}, ... ] }]
  const deckCards = [];

  if (protector) deckCards.push({ id: protector.id, qty: 1, zone: 'protector' });
  if (bio)       deckCards.push({ id: bio.id,       qty: 1, zone: 'bio' });

  picked.forEach(c => deckCards.push({ id: c.id, qty: 1, zone: 'deck' }));

  const deck = [
    {
      name: `Demo — Kódem ${TAKE}`,
      // Campos de metadatos opcionales
      id: 'kodem-demo-001',
      game: 'Kódem TCG',
      format: FORMAT,
      createdAt: nowIso,
      lastModifiedAt: nowIso,
      // Lista de cartas
      cards: deckCards
    }
  ];

  fs.writeFileSync(DECKS_PATH, JSON.stringify(deck, null, 2), 'utf8');

  console.log('✅ KodemDecks.json generado con éxito');
  console.log(`   - Adendei en deck: ${picked.length}`);
  console.log(`   - Protector: ${protector ? protector.id : 'no incluido (no encontrado)'}`);
  console.log(`   - Bio: ${bio ? bio.id : 'no incluido (no encontrado)'}`);
  console.log(`   - Formato: ${FORMAT}`);
  console.log(`   - Archivo: ${DECKS_PATH}`);
}

main();
