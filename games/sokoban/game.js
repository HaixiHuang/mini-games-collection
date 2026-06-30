// ===== 推箱子 Sokoban =====
GameRegistry.register({
  id: 'sokoban',
  name: '推箱子',
  icon: '📦',
  desc: '经典推箱子谜题。把所有箱子推到目标位置！',
  difficulties: [
    { id: 'easy', name: '简单', icon: '🌱', desc: '小型地图，2个箱子' },
    { id: 'medium', name: '中等', icon: '🔥', desc: '中型地图，3个箱子' },
    { id: 'hard', name: '困难', icon: '💀', desc: '大型地图，4个箱子' },
  ],

  init(container, difficulty, onComplete) {
    const levels = {
      easy: [
        // 6x6, 2 boxes
        [
          '  ####',
          '###  #',
          '#  $ #',
          '# .#@#',
          '# .  #',
          '######',
        ],
        [
          '##### ',
          '#   # ',
          '# # # ',
          '# $ # ',
          '#.@.##',
          '#. $ #',
          '######',
        ],
      ],
      medium: [
        // 7x7, 3 boxes
        [
          '  #####',
          '###   #',
          '#  $# #',
          '# #.  #',
          '# .$# #',
          '##.@  #',
          ' ######',
        ],
      ],
      hard: [
        // 8x8, 4 boxes
        [
          '  ######',
          '  #    #',
          '### ## #',
          '#  $   #',
          '# .#.$##',
          '# .$.  #',
          '# .# @ #',
          '########',
        ],
      ],
    };

    const pool = levels[difficulty];
    const rawLevel = pool[Math.floor(Math.random() * pool.length)];
    let grid, playerR, playerC, moves, pushes;

    resetLevel();

    function resetLevel() {
      grid = rawLevel.map(row => [...row]);
      moves = 0; pushes = 0;
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          if (grid[r][c] === '@' || grid[r][c] === '+') { playerR = r; playerC = c; }
        }
      }
    }

    function isTarget(r, c) {
      return rawLevel[r] && rawLevel[r][c] === '.' || rawLevel[r][c] === '*' || rawLevel[r][c] === '+';
    }

    function render() {
      const cellSize = grid.length > 7 ? 58 : grid.length > 6 ? 68 : 78;
      const symbols = { '#': '🧱', '.': '🎯', '$': '📦', '@': '🧑', '*': '✅', '+': '🧑', ' ': '' };
      const html = grid.map((row, r) =>
        `<div style="display:flex;">${row.map((ch, c) => {
          const bg = ch === '#' ? '#333' : isTarget(r, c) ? 'rgba(255,100,100,0.2)' : 'transparent';
          let display = symbols[ch] || '';
          if (ch === ' ') display = '';
          return `<div style="width:${cellSize}px;height:${cellSize}px;display:flex;align-items:center;justify-content:center;font-size:${cellSize*0.55}px;background:${bg};border:1px solid rgba(255,255,255,0.05);">${display}</div>`;
        }).join('')}</div>`
      ).join('');

      const remaining = grid.flat().filter(ch => ch === '$').length;

      container.innerHTML = `
        <div style="text-align:center;">
          <div style="margin-bottom:16px;color:var(--text-dim);">
            步数: ${moves} | 推动: ${pushes} | 剩余箱子: ${remaining}
          </div>
          <div style="display:inline-block;border:2px solid var(--surface2);border-radius:8px;overflow:hidden;" id="sokoGrid">${html}</div>
          <div style="margin-top:16px;color:var(--text-dim);font-size:0.85em;">
            ↑↓←→ 或 WASD 移动 | R 重置
          </div>
        </div>
      `;
    }

    function move(dr, dc) {
      const nr = playerR + dr, nc = playerC + dc;
      if (nr < 0 || nr >= grid.length || nc < 0 || nc >= grid[0].length) return;

      const cell = grid[nr][nc];

      if (cell === '#' ) return;

      if (cell === '$' || cell === '*') {
        const br = nr + dr, bc = nc + dc;
        if (br < 0 || br >= grid.length || bc < 0 || bc >= grid[0].length) return;
        const bcell = grid[br][bc];
        if (bcell === '#' || bcell === '$' || bcell === '*') return;

        // Push box
        grid[br][bc] = isTarget(br, bc) ? '*' : '$';
        grid[nr][nc] = isTarget(nr, nc) ? '+' : '@';
        grid[playerR][playerC] = isTarget(playerR, playerC) ? '.' : ' ';
        pushes++;
      } else {
        grid[nr][nc] = isTarget(nr, nc) ? '+' : '@';
        grid[playerR][playerC] = isTarget(playerR, playerC) ? '.' : ' ';
      }

      playerR = nr; playerC = nc;
      moves++;

      render();

      // Check win: no more $
      if (!grid.flat().includes('$')) {
        setTimeout(() => onComplete({
          win: true, score: moves,
          title: '🎉 全部推到目标位置！',
          detail: `共用 ${moves} 步，推动 ${pushes} 次`,
        }), 500);
      }
    }

    render();

    function onKey(e) {
      const map = { ArrowUp: [-1,0], ArrowDown: [1,0], ArrowLeft: [0,-1], ArrowRight: [0,1],
                    w: [-1,0], W: [-1,0], s: [1,0], S: [1,0], a: [0,-1], A: [0,-1], d: [0,1], D: [0,1],
                    r: 'reset', R: 'reset' };
      const action = map[e.key];
      if (!action) return;
      e.preventDefault();
      if (action === 'reset') { resetLevel(); render(); return; }
      move(action[0], action[1]);
    }

    document.addEventListener('keydown', onKey);
    container._cleanup = () => document.removeEventListener('keydown', onKey);
  }
});
