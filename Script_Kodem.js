// Script_Kodem.js — utilidades de mesa para Kódem en TCG Arena
// Nota: este script no “juzga” reglas. Solo ofrece atajos de UI.
// Basado en las capacidades que expone TCG Arena para juegos personalizados. (Ver ejemplos públicos)
// - Tags/estados: addTag / clearTags
// - Contadores: counters.increment / counters.set
// - Movimiento: zones.move
// - Botones: ui.registerButton / ui.registerGlobalButton

const KODEM = {
  // === ESTADOS / TAGS ===
  addStatus: (card, status) => ui.addTag(card, status),
  clearStatuses: (card) => ui.clearTags(card),

  // === CONTADORES ===
  incRest: (card, n = 1) => counters.increment(card, "Descansos", n),
  decRest: (card, n = 1) => counters.increment(card, "Descansos", -n),
  setLife: (card, v) => counters.set(card, "Vida", v),
  incLife: (card, n = 1) => counters.increment(card, "Vida", n),
  decLife: (card, n = 1) => counters.increment(card, "Vida", -n),

  // === MOVIMIENTOS ===
  toExtincion: (card) => zones.move(card, "grave"),

  // === UTILIDADES DE REEMPLAZO (ej. tu regla 3-pick) ===
  // Muestra 3 del tope del mazo y las manda a "board" para que el jugador elija 1;
  // el resto vuelven al fondo manualmente (según tu regla).
  replacePick3: () => flow.pickFromTop("deck", 3, "board")
};

// --- Botones por carta ---
ui.registerButton("Quemar",     c => KODEM.addStatus(c, "Quemar"));
ui.registerButton("Envenenar",  c => KODEM.addStatus(c, "Envenenar"));
ui.registerButton("Abismar",    c => KODEM.addStatus(c, "Abismar"));
ui.registerButton("Protegida",  c => KODEM.addStatus(c, "Protegida/o"));
ui.registerButton("Quitar estados", c => KODEM.clearStatuses(c));

ui.registerButton("+1 Descanso", c => KODEM.incRest(c, 1));
ui.registerButton("-1 Descanso", c => KODEM.decRest(c, 1));

ui.registerButton("+1 Vida",     c => KODEM.incLife(c, 1));
ui.registerButton("-1 Vida",     c => KODEM.decLife(c, 1));
// Si quieres una forma rápida de setear la vida por defecto (6):
ui.registerButton("Vida = 6",    c => KODEM.setLife(c, 6));

ui.registerButton("A Extinción", c => KODEM.toExtincion(c));

// --- Botón global (no ligado a una carta concreta) ---
ui.registerGlobalButton("Reemplazo 3‑pick", () => KODEM.replacePick3());