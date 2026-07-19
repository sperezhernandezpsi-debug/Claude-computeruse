// Lógica principal de Ruby Moon Maths.
(() => {
  const STORAGE_KEY = 'ruby_moon_maths_profile_v1';
  const QUESTIONS_PER_ROUND = 10;
  const CHILD_NAME = 'Ruby';

  const MODE_LABELS = {
    sumas: 'Sumas',
    restas: 'Restas',
    multiplicacion: 'Multiplicar',
    comparar: 'Comparar',
    conteo: 'Contar',
    formas: 'Formas',
  };

  const DIFF_LABELS = { facil: 'Fácil', medio: 'Medio', dificil: 'Difícil' };
  const DIFF_ORDER = ['facil', 'medio', 'dificil'];

  const MASCOT_MESSAGES = {
    great: [
      `¡Increíble, ${CHILD_NAME}! ¡Eres un genio de las mates! 🌟`,
      `¡Wow, ${CHILD_NAME}! ¡Lo has hecho perfecto! 🎉`,
      `¡Eres una estrella de las matemáticas, ${CHILD_NAME}! ⭐`,
    ],
    good: [
      `¡Muy bien hecho, ${CHILD_NAME}! ¡Sigue así! 💪`,
      `¡Buen trabajo, ${CHILD_NAME}! Cada vez lo haces mejor. 🙂`,
      `¡Genial, ${CHILD_NAME}! Estás aprendiendo un montón. 📚`,
    ],
    ok: [
      `¡Buen intento, ${CHILD_NAME}! Practiquemos un poco más. 🌱`,
      `¡Vas por buen camino, ${CHILD_NAME}! Inténtalo otra vez. 💫`,
      `¡Casi, ${CHILD_NAME}! Con práctica lo conseguirás. 🍀`,
    ],
    low: [
      `No pasa nada, ${CHILD_NAME}, ¡todos aprendemos practicando! 🤗`,
      `¡Sigue intentándolo, ${CHILD_NAME}, tú puedes! 💜`,
      `Cada error nos ayuda a aprender más, ${CHILD_NAME}. 🌈`,
    ],
  };

  const BADGES = [
    { id: 'primera_estrella', emoji: '🌟', name: 'Primera estrella', cond: p => p.totalStars >= 1 },
    { id: 'diez_estrellas', emoji: '✨', name: '10 estrellas', cond: p => p.totalStars >= 10 },
    { id: 'treinta_estrellas', emoji: '💫', name: '30 estrellas', cond: p => p.totalStars >= 30 },
    { id: 'rey_sumas', emoji: '➕', name: 'Reina de las sumas', cond: p => (p.stats.sumas.dificil?.bestStars || 0) >= 3 },
    { id: 'rey_restas', emoji: '➖', name: 'Reina de las restas', cond: p => (p.stats.restas.dificil?.bestStars || 0) >= 3 },
    { id: 'rey_multi', emoji: '✖️', name: 'Maestra de la tabla', cond: p => (p.stats.multiplicacion.dificil?.bestStars || 0) >= 3 },
    { id: 'racha_5', emoji: '🔥', name: 'Racha de 5', cond: p => p.maxStreak >= 5 },
    { id: 'todas_las_estrellas', emoji: '👑', name: 'Campeona total', cond: p => modesAtMaxStars(p) },
  ];

  function modesAtMaxStars(p) {
    return Object.keys(MODE_LABELS).every(m => (p.stats[m].dificil?.bestStars || 0) >= 3);
  }

  // ---------- Perfil / Storage ----------
  function defaultProfile() {
    const stats = {};
    Object.keys(MODE_LABELS).forEach(m => {
      stats[m] = { facil: emptyModeStat(), medio: emptyModeStat(), dificil: emptyModeStat() };
    });
    return {
      name: CHILD_NAME,
      avatar: '🦄',
      totalStars: 0,
      maxStreak: 0,
      muted: false,
      badges: [],
      stats,
    };
  }
  function emptyModeStat() {
    return { plays: 0, bestScore: 0, bestStars: 0, lastScore: null };
  }

  function loadProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // asegurar estructura completa por si se añadieron modos nuevos
      const base = defaultProfile();
      Object.keys(base.stats).forEach(m => {
        if (!parsed.stats[m]) parsed.stats[m] = base.stats[m];
      });
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function saveProfile() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  let profile = loadProfile();

  // ---------- Navegación entre pantallas ----------
  const screens = {};
  document.querySelectorAll('.screen').forEach(el => { screens[el.id] = el; });
  function showScreen(id) {
    Object.values(screens).forEach(el => el.classList.add('hidden'));
    screens[id].classList.remove('hidden');
  }

  // ---------- Estado de la partida ----------
  let game = null; // { mode, difficulty, questions, index, correct, streak }

  // ================= ONBOARDING =================
  let chosenAvatar = '🦄';
  document.querySelectorAll('.avatar-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.avatar-choice').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      chosenAvatar = btn.dataset.avatar;
      document.getElementById('onb-mascot').textContent = chosenAvatar;
      SoundFX.playTap();
    });
  });
  const firstAvatarBtn = document.querySelector('.avatar-choice');
  if (firstAvatarBtn) {
    firstAvatarBtn.classList.add('selected');
    chosenAvatar = firstAvatarBtn.dataset.avatar;
    document.getElementById('onb-mascot').textContent = chosenAvatar;
  }

  document.getElementById('onb-start').addEventListener('click', () => {
    profile = defaultProfile();
    profile.avatar = chosenAvatar;
    saveProfile();
    SoundFX.playCorrect();
    goHome();
  });

  // ================= HOME =================
  function goHome() {
    renderHome();
    showScreen('screen-home');
  }

  function renderHome() {
    document.getElementById('home-avatar').textContent = profile.avatar;
    document.getElementById('home-name').textContent = profile.name;
    document.getElementById('home-stars').textContent = profile.totalStars;
    document.getElementById('home-message').textContent = homeGreeting();
    Object.keys(MODE_LABELS).forEach(mode => {
      const best = bestStarsAcross(mode);
      document.getElementById(`stars-${mode}`).textContent = best > 0 ? '⭐'.repeat(best) : 'Nuevo';
    });
    renderBadges();
  }

  function bestStarsAcross(mode) {
    return Math.max(
      profile.stats[mode].facil.bestStars,
      profile.stats[mode].medio.bestStars,
      profile.stats[mode].dificil.bestStars
    );
  }

  function homeGreeting() {
    const greetings = [
      `¡Hola, ${profile.name}! ¿Lista para una aventura matemática? 🌙`,
      `¡Qué alegría verte, ${profile.name}! Elige un juego.`,
      `${profile.name}, ¡hoy vamos a aprender jugando! 🎈`,
      `Brilla como la luna, ${profile.name}. ¡Tú puedes! 🌙✨`,
    ];
    return greetings[randInt(0, greetings.length - 1)];
  }

  function renderBadges() {
    const row = document.getElementById('badges-row');
    row.innerHTML = '';
    profile.badges.forEach(id => {
      const b = BADGES.find(x => x.id === id);
      if (!b) return;
      const chip = document.createElement('span');
      chip.className = 'badge-chip';
      chip.title = b.name;
      chip.textContent = b.emoji;
      row.appendChild(chip);
    });
  }

  document.querySelectorAll('.mode-tile').forEach(btn => {
    btn.addEventListener('click', () => {
      SoundFX.playClick();
      openDifficulty(btn.dataset.mode);
    });
  });

  // ================= DIFFICULTY =================
  let selectedMode = null;
  function openDifficulty(mode) {
    selectedMode = mode;
    document.getElementById('diff-title').textContent = `${MODE_LABELS[mode]} — elige tu nivel`;
    const unlocked = unlockedDifficulties(mode);
    document.querySelectorAll('.btn-diff').forEach(btn => {
      const d = btn.dataset.diff;
      btn.disabled = !unlocked.includes(d);
      btn.classList.toggle('locked', !unlocked.includes(d));
      btn.innerHTML = `<span class="diff-emoji">${btn.dataset.diff === 'facil' ? '🌱' : btn.dataset.diff === 'medio' ? '🌟' : '🔥'}</span> ${DIFF_LABELS[d]}` + (!unlocked.includes(d) ? ' 🔒' : '');
    });
    showScreen('screen-difficulty');
  }

  function unlockedDifficulties(mode) {
    const s = profile.stats[mode];
    const unlocked = ['facil'];
    if (s.facil.bestStars >= 1) unlocked.push('medio');
    if (s.medio.bestStars >= 2) unlocked.push('dificil');
    return unlocked;
  }

  document.getElementById('diff-back').addEventListener('click', () => { SoundFX.playClick(); goHome(); });

  document.querySelectorAll('.btn-diff').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      SoundFX.playClick();
      startGame(selectedMode, btn.dataset.diff);
    });
  });

  // ================= GAME =================
  function startGame(mode, difficulty) {
    game = {
      mode, difficulty,
      questions: Questions.generate(mode, difficulty, QUESTIONS_PER_ROUND),
      index: 0,
      correct: 0,
      streak: 0,
    };
    showScreen('screen-game');
    renderQuestion();
  }

  document.getElementById('btn-quit').addEventListener('click', () => {
    SoundFX.playClick();
    game = null;
    goHome();
  });

  function renderQuestion() {
    const q = game.questions[game.index];
    document.getElementById('game-progress').style.width = `${(game.index / game.questions.length) * 100}%`;
    document.getElementById('game-streak').textContent = game.streak;
    document.getElementById('game-visual').innerHTML = q.visualHTML || '';
    document.getElementById('game-question').textContent = q.prompt;
    document.getElementById('game-feedback').textContent = '';

    const grid = document.getElementById('game-choices');
    grid.innerHTML = '';
    q.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice;
      btn.addEventListener('click', () => handleAnswer(btn, choice, q));
      grid.appendChild(btn);
    });
  }

  function handleAnswer(btn, choice, q) {
    const allBtns = document.querySelectorAll('#game-choices .choice-btn');
    allBtns.forEach(b => b.classList.add('disabled'));

    const isCorrect = choice === q.correctAnswer;
    if (isCorrect) {
      btn.classList.add('correct');
      game.correct++;
      game.streak++;
      profile.maxStreak = Math.max(profile.maxStreak, game.streak);
      SoundFX.playCorrect();
      document.getElementById('game-feedback').textContent = pickFeedback(true);
      document.getElementById('game-feedback').style.color = '#16a34a';
    } else {
      btn.classList.add('wrong');
      allBtns.forEach(b => { if (b.textContent === q.correctAnswer) b.classList.add('correct'); });
      game.streak = 0;
      SoundFX.playWrong();
      document.getElementById('game-feedback').textContent = pickFeedback(false);
      document.getElementById('game-feedback').style.color = '#dc2626';
    }

    setTimeout(() => {
      game.index++;
      if (game.index >= game.questions.length) {
        endGame();
      } else {
        renderQuestion();
      }
    }, 1100);
  }

  function pickFeedback(correct) {
    const yes = [
      `¡Correcto, ${CHILD_NAME}! 🎉`,
      `¡Genial, ${CHILD_NAME}! ✅`,
      `¡Perfecto, ${CHILD_NAME}! 👏`,
      `¡Así se hace, ${CHILD_NAME}! 🌟`,
    ];
    const no = [
      `¡Casi, ${CHILD_NAME}! 💪`,
      `Sigue intentando, ${CHILD_NAME} 🌈`,
      `La próxima seguro, ${CHILD_NAME} 🍀`,
      `¡No te rindas, ${CHILD_NAME}! 💜`,
    ];
    const arr = correct ? yes : no;
    return arr[randInt(0, arr.length - 1)];
  }

  function endGame() {
    document.getElementById('game-progress').style.width = '100%';
    const { mode, difficulty, correct, questions } = game;
    const total = questions.length;
    const stars = starsForScore(correct, total);

    const s = profile.stats[mode][difficulty];
    s.plays++;
    s.lastScore = correct;
    s.bestScore = Math.max(s.bestScore, correct);
    const isNewBestStars = stars > s.bestStars;
    s.bestStars = Math.max(s.bestStars, stars);

    profile.totalStars += stars;
    saveProfile();

    showResults(correct, total, stars, isNewBestStars);
  }

  function starsForScore(correct, total) {
    const pct = correct / total;
    if (pct >= 0.9) return 3;
    if (pct >= 0.7) return 2;
    if (pct >= 0.5) return 1;
    return 0;
  }

  function showResults(correct, total, stars, isNewBestStars) {
    document.getElementById('res-mascot').textContent = profile.avatar;
    document.getElementById('res-title').textContent =
      stars === 3 ? `¡Perfecto, ${CHILD_NAME}!` : stars === 2 ? `¡Muy bien, ${CHILD_NAME}!` : stars === 1 ? `¡Buen intento, ${CHILD_NAME}!` : `¡Sigue practicando, ${CHILD_NAME}!`;
    document.getElementById('res-score').textContent = `${correct} / ${total} aciertos`;
    document.getElementById('res-stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

    const tier = stars === 3 ? 'great' : stars === 2 ? 'good' : stars === 1 ? 'ok' : 'low';
    const msgs = MASCOT_MESSAGES[tier];
    document.getElementById('res-message').textContent = msgs[randInt(0, msgs.length - 1)];

    const newBadges = checkBadges();
    const badgeEl = document.getElementById('res-badge');
    if (newBadges.length > 0) {
      badgeEl.classList.remove('hidden');
      badgeEl.innerHTML = `¡${CHILD_NAME}, has ganado una insignia nueva! ${newBadges.map(b => `${b.emoji} ${b.name}`).join(', ')}`;
    } else {
      badgeEl.classList.add('hidden');
    }

    showScreen('screen-results');
    if (stars >= 2 || newBadges.length > 0) {
      Confetti.burst(stars === 3 ? 140 : 90);
      SoundFX.playFanfare();
    }
  }

  function checkBadges() {
    const earned = [];
    BADGES.forEach(b => {
      if (!profile.badges.includes(b.id) && b.cond(profile)) {
        profile.badges.push(b.id);
        earned.push(b);
      }
    });
    if (earned.length > 0) saveProfile();
    return earned;
  }

  document.getElementById('res-again').addEventListener('click', () => {
    SoundFX.playClick();
    startGame(game.mode, game.difficulty);
  });
  document.getElementById('res-home').addEventListener('click', () => {
    SoundFX.playClick();
    game = null;
    goHome();
  });

  // ================= PARENT ZONE =================
  document.getElementById('btn-parent').addEventListener('click', () => {
    SoundFX.playClick();
    openParentGate();
  });

  let gateAnswer = 0;
  function openParentGate() {
    const a = randInt(6, 12);
    const b = randInt(6, 9);
    gateAnswer = a * b;
    document.getElementById('gate-question').textContent = `${a} × ${b} = ?`;
    document.getElementById('gate-input').value = '';
    document.getElementById('gate-error').classList.add('hidden');
    showScreen('screen-parent-gate');
    setTimeout(() => document.getElementById('gate-input').focus(), 200);
  }

  document.getElementById('gate-back').addEventListener('click', () => { SoundFX.playClick(); goHome(); });

  document.getElementById('gate-submit').addEventListener('click', submitGate);
  document.getElementById('gate-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') submitGate();
  });

  function submitGate() {
    const val = parseInt(document.getElementById('gate-input').value, 10);
    if (val === gateAnswer) {
      SoundFX.playCorrect();
      openParentPanel();
    } else {
      SoundFX.playWrong();
      document.getElementById('gate-error').classList.remove('hidden');
    }
  }

  function openParentPanel() {
    document.getElementById('parent-name').textContent = profile.name;
    document.getElementById('parent-sound-toggle').checked = !profile.muted;
    const statsEl = document.getElementById('parent-stats');
    statsEl.innerHTML = '';
    Object.keys(MODE_LABELS).forEach(mode => {
      const row = document.createElement('div');
      row.className = 'stat-row';
      const totalPlays = DIFF_ORDER.reduce((sum, d) => sum + profile.stats[mode][d].plays, 0);
      const best = bestStarsAcross(mode);
      row.innerHTML = `<span>${MODE_LABELS[mode]}</span><span><strong>${best}⭐</strong> · ${totalPlays} partidas</span>`;
      statsEl.appendChild(row);
    });
    showScreen('screen-parent');
  }

  document.getElementById('parent-back').addEventListener('click', () => { SoundFX.playClick(); goHome(); });

  document.getElementById('parent-sound-toggle').addEventListener('change', e => {
    profile.muted = !e.target.checked;
    SoundFX.setMuted(profile.muted);
    saveProfile();
  });

  document.getElementById('parent-reset').addEventListener('click', () => {
    if (confirm('¿Seguro que quieres borrar todo el progreso? Esta acción no se puede deshacer.')) {
      localStorage.removeItem(STORAGE_KEY);
      profile = null;
      location.reload();
    }
  });

  // ================= UTIL =================
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ================= INIT =================
  function init() {
    if (profile) {
      SoundFX.setMuted(!!profile.muted);
      goHome();
    } else {
      showScreen('screen-onboarding');
    }
  }
  init();
})();
