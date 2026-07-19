// Generador de preguntas para cada modo y dificultad.
const Questions = (() => {

  const COUNT_EMOJIS = ['🍎', '🍓', '⭐', '🎈', '🍩', '🐝', '🦋', '🍪', '🐠', '🌸'];
  const SHAPES = [
    { name: 'círculo', emoji: '⚪' },
    { name: 'cuadrado', emoji: '🟪' },
    { name: 'triángulo', emoji: '🔺' },
    { name: 'estrella', emoji: '⭐' },
    { name: 'corazón', emoji: '❤️' },
    { name: 'rectángulo', emoji: '🟦' },
  ];

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function numericChoices(correct, spread) {
    const set = new Set([correct]);
    let guard = 0;
    while (set.size < 4 && guard < 50) {
      guard++;
      let delta = randInt(-spread, spread);
      if (delta === 0) continue;
      let val = correct + delta;
      if (val < 0) val = correct + Math.abs(delta);
      set.add(val);
    }
    // fallback si aún faltan
    let filler = correct + spread + 1;
    while (set.size < 4) {
      if (!set.has(filler) && filler >= 0) set.add(filler);
      filler++;
    }
    return shuffle(Array.from(set)).map(String);
  }

  function visualDots(a, b, emoji) {
    const e = emoji || COUNT_EMOJIS[randInt(0, COUNT_EMOJIS.length - 1)];
    const groupA = e.repeat(a);
    const groupB = e.repeat(b);
    return `<div class="visual-groups">${groupA} <span class="op-sep">y</span> ${groupB}</div>`;
  }

  const RANGES = {
    sumas: {
      facil: { min: 1, max: 5, visual: true },
      medio: { min: 1, max: 10, visual: false },
      dificil: { min: 10, max: 50, visual: false },
    },
    restas: {
      facil: { min: 2, max: 10, visual: true },
      medio: { min: 10, max: 20, visual: false },
      dificil: { min: 20, max: 100, visual: false },
    },
    multiplicacion: {
      facil: { tables: [1, 2, 5, 10] },
      medio: { tables: [1, 2, 3, 4, 5, 6] },
      dificil: { tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    },
    comparar: {
      facil: { min: 1, max: 20 },
      medio: { min: 1, max: 100 },
      dificil: { min: 1, max: 1000 },
    },
    conteo: {
      facil: { min: 3, max: 10 },
      medio: { min: 8, max: 20 },
      dificil: { min: 15, max: 30 },
    },
    formas: {
      facil: {}, medio: {}, dificil: {},
    }
  };

  function genSumas(diff) {
    const r = RANGES.sumas[diff];
    const a = randInt(r.min, r.max);
    const b = randInt(r.min, r.max);
    const correct = a + b;
    return {
      prompt: `${a} + ${b} = ?`,
      visualHTML: r.visual ? visualDots(a, b) : '',
      choices: numericChoices(correct, Math.max(3, Math.round(correct * 0.3))),
      correctAnswer: String(correct),
    };
  }

  function genRestas(diff) {
    const r = RANGES.restas[diff];
    const a = randInt(r.min, r.max);
    const b = randInt(1, a);
    const correct = a - b;
    return {
      prompt: `${a} - ${b} = ?`,
      visualHTML: r.visual ? `<div class="visual-groups">${'⭐'.repeat(a)}</div>` : '',
      choices: numericChoices(correct, Math.max(3, Math.round(a * 0.3))),
      correctAnswer: String(correct),
    };
  }

  function genMultiplicacion(diff) {
    const r = RANGES.multiplicacion[diff];
    const table = r.tables[randInt(0, r.tables.length - 1)];
    const factor = randInt(1, 10);
    const correct = table * factor;
    return {
      prompt: `${table} × ${factor} = ?`,
      visualHTML: '',
      choices: numericChoices(correct, Math.max(4, table)),
      correctAnswer: String(correct),
    };
  }

  function genComparar(diff) {
    const r = RANGES.comparar[diff];
    let a = randInt(r.min, r.max);
    let b = randInt(r.min, r.max);
    // evitar demasiados empates
    if (a === b && Math.random() < 0.7) b = Math.min(r.max, b + randInt(1, 5));
    let correct;
    if (a > b) correct = '>';
    else if (a < b) correct = '<';
    else correct = '=';
    return {
      prompt: `${a}   ?   ${b}`,
      visualHTML: '',
      choices: ['<', '>', '='],
      correctAnswer: correct,
      isSymbol: true,
    };
  }

  function genConteo(diff) {
    const r = RANGES.conteo[diff];
    const n = randInt(r.min, r.max);
    const emoji = COUNT_EMOJIS[randInt(0, COUNT_EMOJIS.length - 1)];
    // grid con saltos de línea cada 5 para facilitar el conteo visual
    let html = '<div class="visual-groups count-grid">';
    for (let i = 1; i <= n; i++) {
      html += emoji;
      if (i % 5 === 0) html += '<br>';
    }
    html += '</div>';
    return {
      prompt: '¿Cuántos hay?',
      visualHTML: html,
      choices: numericChoices(n, 4),
      correctAnswer: String(n),
    };
  }

  function genFormas() {
    const target = SHAPES[randInt(0, SHAPES.length - 1)];
    let opts = shuffle(SHAPES.filter(s => s.name !== target.name)).slice(0, 3);
    opts.push(target);
    opts = shuffle(opts);
    return {
      prompt: `¿Cuál es el ${target.name}?`,
      visualHTML: '',
      choices: opts.map(s => s.emoji),
      correctAnswer: target.emoji,
      isShape: true,
    };
  }

  const GENERATORS = {
    sumas: genSumas,
    restas: genRestas,
    multiplicacion: genMultiplicacion,
    comparar: genComparar,
    conteo: genConteo,
    formas: genFormas,
  };

  function generate(mode, difficulty, count = 10) {
    const gen = GENERATORS[mode];
    const list = [];
    const seen = new Set();
    let guard = 0;
    while (list.length < count && guard < count * 20) {
      guard++;
      const q = gen(difficulty);
      // clave que distingue preguntas cuyo texto se repite (p.ej. conteo)
      // pero cuyo contenido visual o respuesta correcta es distinto
      const key = `${q.prompt}::${q.correctAnswer}::${(q.visualHTML || '').length}`;
      if (seen.has(key)) continue;
      seen.add(key);
      list.push(q);
    }
    // si el espacio de preguntas únicas es limitado (p.ej. formas solo tiene
    // pocas figuras), rellenamos el resto permitiendo repeticiones para
    // garantizar siempre `count` preguntas en la ronda
    while (list.length < count) {
      list.push(gen(difficulty));
    }
    return list;
  }

  return { generate };
})();
