// Script_Kodem.js — helpers visuales; no implementa efectos de cartas.
const KODEM = {
  addStatus: (card, status) => ui.addTag(card, status),     // "Quemar" | "Envenenar" | "Abismar" | "Protegida/o"
  clearStatus: (card) => ui.clearTags(card),
  plusRest: (card, n=1) => counters.increment(card, "Descansos", n),
  setLife: (card, v) => counters.set(card, "Vida", v),
  toExtincion: (card) => zones.move(card, "grave"),
  replacePick3: () => flow.pickFromTop("deck", 3, "board")
};
ui.registerButton("Quemar",     (c)=>KODEM.addStatus(c,"Quemar"));
ui.registerButton("Envenenar",  (c)=>KODEM.addStatus(c,"Envenenar"));
ui.registerButton("Abismar",    (c)=>KODEM.addStatus(c,"Abismar"));
ui.registerButton("Protegida",  (c)=>KODEM.addStatus(c,"Protegida/o"));
ui.registerButton("+1 Descanso",(c)=>KODEM.plusRest(c,1));
ui.registerButton("A Extinción",(c)=>KODEM.toExtincion(c));
ui.registerGlobalButton("Reemplazo 3‑pick", ()=>KODEM.replacePick3());
