// ===== Player Profile =====
const PlayerProfile = {
  _key: 'cg_player',
  get() {
    const raw = localStorage.getItem(this._key);
    return raw ? JSON.parse(raw) : null;
  },
  save(name, avatar) {
    const p = { name, avatar, createdAt: Date.now() };
    localStorage.setItem(this._key, JSON.stringify(p));
    return p;
  },
  exists() { return !!this.get(); },
  clear() { localStorage.removeItem(this._key); }
};

// ===== Avatars =====
const AVATARS = ['🐶','🐱','🦊','🐸','🐵','🦁','🐯','🐻','🐼','🐨','🐰','🐙','🦄','🐲','🤖'];

// ===== Leaderboard =====
const Leaderboard = {
  _prefix: 'cg_lb_',
  _maxEntries: 50,

  _key(gameId, difficulty) { return `${this._prefix}${gameId}_${difficulty}`; },

  get(gameId, difficulty) {
    const raw = localStorage.getItem(this._key(gameId, difficulty));
    return raw ? JSON.parse(raw) : [];
  },

  add(gameId, difficulty, entry) {
    const list = this.get(gameId, difficulty);
    list.push({ ...entry, date: new Date().toISOString().slice(0, 10) });
    list.sort((a, b) => a.score - b.score || a.time - b.time);
    const trimmed = list.slice(0, this._maxEntries);
    localStorage.setItem(this._key(gameId, difficulty), JSON.stringify(trimmed));
    return { list: trimmed, rank: trimmed.indexOf(entry) + 1 };
  },

  getTop(gameId, difficulty, n = 10) {
    return this.get(gameId, difficulty).slice(0, n);
  },

  render(gameId, difficulty, container) {
    const list = this.get(gameId, difficulty);
    if (!list.length) {
      container.innerHTML = '<div class="lb-empty">暂无记录，快来挑战吧！🏆</div>';
      return;
    }
    const rows = list.map((e, i) => {
      const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
      return `<tr>
        <td class="lb-rank ${rankClass}">${medal}</td>
        <td>${e.avatar} ${escHtml(e.name)}</td>
        <td>${e.score}</td>
        <td>${fmtTime(e.time)}</td>
        <td>${e.date}</td>
      </tr>`;
    }).join('');
    container.innerHTML = `<table class="lb-table">
      <thead><tr><th>排名</th><th>玩家</th><th>成绩</th><th>用时</th><th>日期</th></tr></thead>
      <tbody>${rows}</tbody></table>`;
  }
};

// ===== Game Registry =====
const GameRegistry = {
  _games: [],
  register(game) { this._games.push(game); },
  list() { return [...this._games]; },
  find(id) { return this._games.find(g => g.id === id); }
};

// ===== UI Helpers =====
function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function fmtTime(seconds) {
  if (seconds < 60) return `${seconds}秒`;
  const m = Math.floor(seconds / 60), s = seconds % 60;
  return `${m}分${s}秒`;
}
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ===== Game Entry Point =====
let _currentCleanup = null;

function cleanupGame() {
  if (_currentCleanup) { _currentCleanup(); _currentCleanup = null; }
}

function startGame(gameId, difficulty) {
  cleanupGame();
  const game = GameRegistry.find(gameId);
  if (!game) return;
  const player = PlayerProfile.get();
  if (!player) return showPlayerSetup(() => startGame(gameId, difficulty));

  const area = document.getElementById('gameArea');
  const body = document.getElementById('gameBody');
  const title = document.getElementById('gameTitle');
  const stats = document.getElementById('gameStats');

  title.textContent = `${game.icon} ${game.name} - ${game.difficulties.find(d => d.id === difficulty).name}`;
  stats.textContent = `玩家: ${player.avatar} ${player.name}`;
  area.classList.remove('hidden');
  body.innerHTML = '';

  const startTime = Date.now();

  game.init(body, difficulty, (result) => {
    if (_currentCleanup) { _currentCleanup(); _currentCleanup = null; }
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const entry = {
      name: player.name, avatar: player.avatar,
      score: result.score, time: result.time ?? elapsed,
    };
    const { rank } = Leaderboard.add(gameId, difficulty, entry);
    showResult(gameId, difficulty, { ...result, time: entry.time, rank });
  });
  _currentCleanup = body._cleanup || null;
}

function showResult(gameId, difficulty, result) {
  const game = GameRegistry.find(gameId);
  const icons = { win: '🎉', complete: '✅', good: '👍' };
  const icon = result.win ? icons.win : result.complete ? icons.complete : icons.good;

  const body = document.getElementById('gameBody');
  body.innerHTML = `<div class="result-card animate-in">
    <div class="result-icon pop">${icon}</div>
    <div class="result-title">${result.title || '完成！'}</div>
    <div class="result-detail">${result.detail || ''}<br>用时: ${fmtTime(result.time)}</div>
    <div class="result-rank">🏆 排名: 第 ${result.rank} 名</div>
    <div class="flex-center">
      <button class="btn btn-primary" onclick="startGame('${gameId}','${difficulty}')">🔄 再玩一次</button>
      <button class="btn btn-secondary" id="btnBackToMenu">🏠 返回菜单</button>
    </div>
    <div class="lb-panel mt-24" id="lbPanel"></div>
  </div>`;
  Leaderboard.render(gameId, difficulty, document.getElementById('lbPanel'));
  document.getElementById('btnBackToMenu').onclick = () => {
    document.getElementById('gameArea').classList.add('hidden');
    renderHomeLeaderboard();
  };
}

// ===== Player Setup =====
function showPlayerSetup(callback) {
  const overlay = document.getElementById('playerSetup');
  const avatarGrid = document.getElementById('avatarGrid');
  const nameInput = document.getElementById('playerNameInput');

  avatarGrid.innerHTML = AVATARS.map(a =>
    `<div class="avatar-option" data-avatar="${a}">${a}</div>`
  ).join('');

  let selectedAvatar = AVATARS[0];
  avatarGrid.querySelector('.avatar-option').classList.add('selected');

  avatarGrid.onclick = (e) => {
    const opt = e.target.closest('.avatar-option');
    if (!opt) return;
    avatarGrid.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    selectedAvatar = opt.dataset.avatar;
  };

  overlay.classList.remove('hidden');
  nameInput.focus();

  document.getElementById('btnStartPlaying').onclick = () => {
    const name = nameInput.value.trim();
    if (!name) { nameInput.focus(); return; }
    PlayerProfile.save(name, selectedAvatar);
    overlay.classList.add('hidden');
    updatePlayerUI();
    if (callback) callback();
  };

  nameInput.onkeydown = (e) => {
    if (e.key === 'Enter') document.getElementById('btnStartPlaying').click();
  };
}

function updatePlayerUI() {
  const p = PlayerProfile.get();
  if (p) {
    document.getElementById('playerAvatar').textContent = p.avatar;
    document.getElementById('playerName').textContent = p.name;
  }
}

// ===== Init =====
function initApp() {
  updatePlayerUI();

  const grid = document.getElementById('gameGrid');
  const games = GameRegistry.list();
  grid.innerHTML = games.map(g => `
    <div class="game-card animate-in" data-game="${g.id}">
      <div class="card-icon">${g.icon}</div>
      <div class="card-name">${g.name}</div>
      <div class="card-desc">${g.desc}</div>
      <div class="card-badge">3个难度</div>
    </div>
  `).join('');

  grid.onclick = (e) => {
    const card = e.target.closest('.game-card');
    if (!card) return;
    showDifficultyModal(card.dataset.game);
  };

  document.getElementById('playerInfo').onclick = () => showPlayerSetup(null);

  document.getElementById('btnBack').onclick = () => {
    cleanupGame();
    document.getElementById('gameArea').classList.add('hidden');
    renderHomeLeaderboard();
  };

  if (!PlayerProfile.exists()) showPlayerSetup(null);

  renderHomeLeaderboard();
}

function renderHomeLeaderboard(gameId, difficulty) {
  const games = GameRegistry.list();
  if (!games.length) return;
  // 默认第一个游戏、简单难度
  if (!gameId) gameId = games[0].id;
  const game = GameRegistry.find(gameId);
  if (!difficulty) difficulty = game.difficulties[0].id;

  // 选择器
  document.getElementById('lbSelector').innerHTML = `
    <select id="lbGameSelect" style="padding:8px 12px;border-radius:6px;border:1px solid var(--surface2);background:var(--surface2);color:var(--text);font-size:0.9em;">
      ${games.map(g => `<option value="${g.id}" ${g.id===gameId?'selected':''}>${g.icon} ${g.name}</option>`).join('')}
    </select>
    <select id="lbDiffSelect" style="padding:8px 12px;border-radius:6px;border:1px solid var(--surface2);background:var(--surface2);color:var(--text);font-size:0.9em;">
      ${game.difficulties.map(d => `<option value="${d.id}" ${d.id===difficulty?'selected':''}>${d.name}</option>`).join('')}
    </select>
  `;

  document.getElementById('lbGameSelect').onchange = function() {
    renderHomeLeaderboard(this.value);
  };
  document.getElementById('lbDiffSelect').onchange = function() {
    renderHomeLeaderboard(gameId, this.value);
  };

  Leaderboard.render(gameId, difficulty, document.getElementById('homeLbTable'));
}

function showDifficultyModal(gameId) {
  const game = GameRegistry.find(gameId);
  if (!game) return;

  const overlay = document.getElementById('diffModal');
  const content = document.getElementById('diffContent');
  content.innerHTML = `
    <h2>${game.icon} ${game.name}</h2>
    <div class="subtitle">${game.desc}</div>
    <div class="diff-grid">
      ${game.difficulties.map(d => `
        <div class="diff-card" data-diff="${d.id}">
          <div class="diff-icon">${d.icon || '🎯'}</div>
          <div class="diff-name">${d.name}</div>
          <div class="diff-desc">${d.desc}</div>
        </div>
      `).join('')}
    </div>
    <button class="btn btn-secondary btn-block" id="btnDiffCancel">取消</button>
  `;
  overlay.classList.remove('hidden');

  content.querySelector('.diff-grid').onclick = (e) => {
    const card = e.target.closest('.diff-card');
    if (!card) return;
    overlay.classList.add('hidden');
    startGame(gameId, card.dataset.diff);
  };
  document.getElementById('btnDiffCancel').onclick = () => overlay.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', initApp);
