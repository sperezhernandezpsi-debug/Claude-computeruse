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

  // Suma en columna con la llevada visualizada (unidades bajo unidades,
  // decenas bajo decenas, y el "1" de la llevada marcado en rojo).
  function renderColumnSum(a, b) {
    const ta = Math.floor(a / 10), ua = a % 10;
    const tb = Math.floor(b / 10), ub = b % 10;
    const carry = (ua + ub) >= 10;
    return `
      <div class="column-sum">
        <div class="col-row carry-row">
          <span class="col-op"></span>
          <span class="col-cell carry-mark">${carry ? '¹' : ''}</span>
          <span class="col-cell"></span>
        </div>
        <div class="col-row">
          <span class="col-op"></span>
          <span class="col-cell">${ta || ''}</span>
          <span class="col-cell">${ua}</span>
        </div>
        <div class="col-row">
          <span class="col-op">+</span>
          <span class="col-cell">${tb || ''}</span>
          <span class="col-cell">${ub}</span>
        </div>
        <div class="col-line"></div>
      </div>`;
  }

  // Excerpt del cuadro numérico del 100 centrado en n, para practicar
  // "justo antes/después" (vecinos horizontales) y "10 más/10 menos"
  // (vecinos verticales), tal como en la tabla del 100 real.
  function renderHundredGrid(n) {
    const offsets = [-11, -10, -9, -1, 0, 1, 9, 10, 11];
    let html = '<div class="hundred-grid">';
    offsets.forEach(off => {
      const val = n + off;
      if (val < 1 || val > 100) {
        html += '<span class="hundred-cell empty"></span>';
      } else if (off === 0) {
        html += `<span class="hundred-cell center">${val}</span>`;
      } else {
        html += `<span class="hundred-cell">${val}</span>`;
      }
    });
    html += '</div>';
    return html;
  }

  const RANGES = {
    sumas: {
      facil: { mode: 'single', min: 1, max: 5, visual: true },
      medio: { mode: 'twoDigit', minA: 10, maxA: 59, minB: 1, maxB: 9, carryProb: 0.6 },
      dificil: { mode: 'twoDigit', minA: 10, maxA: 89, minB: 10, maxB: 89, carryProb: 0.85 },
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
    },
    tabla100: {
      facil: { min: 2, max: 89, types: ['despues', 'antes'] },
      medio: { min: 2, max: 89, types: ['despues', 'antes', 'mas10', 'menos10'] },
      dificil: { min: 1, max: 100, types: ['despues', 'antes', 'mas10', 'menos10'] },
    },
  };

  function genSumas(diff) {
    const r = RANGES.sumas[diff];

    if (r.mode === 'single') {
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

    // dos números (de una o dos cifras) sumados en columna, forzando la
    // llevada la mayoría de las veces según carryProb
    const wantCarry = Math.random() < r.carryProb;
    let a, b, guard = 0;
    do {
      a = randInt(r.minA, r.maxA);
      b = randInt(r.minB, r.maxB);
      guard++;
    } while (guard < 30 && (((a % 10) + (b % 10)) >= 10) !== wantCarry);

    const correct = a + b;
    return {
      prompt: '¿Cuánto suman?',
      visualHTML: renderColumnSum(a, b),
      choices: numericChoices(correct, Math.max(6, Math.round(correct * 0.15))),
      correctAnswer: String(correct),
    };
  }

  function genTabla100(diff) {
    const r = RANGES.tabla100[diff];
    const type = r.types[randInt(0, r.types.length - 1)];
    let n, correct, prompt;

    if (type === 'despues') {
      n = randInt(r.min, Math.min(r.max, 99));
      correct = n + 1;
      prompt = `¿Qué número va justo después del ${n}?`;
    } else if (type === 'antes') {
      n = randInt(Math.max(r.min, 2), Math.min(r.max + 1, 100));
      correct = n - 1;
      prompt = `¿Qué número va justo antes del ${n}?`;
    } else if (type === 'mas10') {
      n = randInt(r.min, Math.min(r.max, 90));
      correct = n + 10;
      prompt = `¿Qué número es 10 más que ${n}?`;
    } else {
      n = randInt(Math.max(r.min, 11), r.max);
      correct = n - 10;
      prompt = `¿Qué número es 10 menos que ${n}?`;
    }

    return {
      prompt,
      visualHTML: renderHundredGrid(n),
      choices: numericChoices(correct, type === 'mas10' || type === 'menos10' ? 8 : 3),
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
    tabla100: genTabla100,
  };

  function generate(mode, difficulty, count = 10) {
    const gen = GENERATORS[mode];
    const list = [];
    const seen = new Set();
    let guard = 0;
    while (list.length < count && guard < count * 20) {
      guard++;
      const q = gen(difficulty);
      // clave que distingue preguntas cuyo texto de prompt se repite
      // (p.ej. conteo, o sumas en columna que comparten "¿Cuánto suman?")
      // pero cuyo contenido visual es distinto: se usa el HTML completo,
      // no solo su longitud, para no confundir sumas distintas con el
      // mismo total (p.ej. 47+38 y 46+39 dan ambas 85).
      const key = `${q.prompt}::${q.correctAnswer}::${q.visualHTML || ''}`;
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
