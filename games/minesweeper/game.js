// ===== 扫雷 Minesweeper =====
GameRegistry.register({
  id: 'minesweeper',
  name: '扫雷',
  icon: '💣',
  desc: '经典扫雷！找出所有地雷，数字提示周围有多少雷！',
  difficulties: [
    { id: 'easy', name: '简单', icon: '🌱', desc: '9×9 · 10个雷' },
    { id: 'medium', name: '中等', icon: '🔥', desc: '16×16 · 40个雷' },
    { id: 'hard', name: '困难', icon: '💀', desc: '16×30 · 99个雷' },
  ],

  init(container, difficulty, onComplete) {
    const config = {
      easy: { rows: 9, cols: 9, mines: 10 },
      medium: { rows: 16, cols: 16, mines: 40 },
      hard: { rows: 16, cols: 30, mines: 99 },
    };
    const { rows, cols, mines } = config[difficulty];
    let grid, revealed, flagged, gameOver, started, flagMode;
    let startTime, timerInterval, minesLeft;

    initGame();

    function initGame() {
      grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ mine: false, count: 0 })));
      revealed = Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));
      flagged = Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));
      gameOver = false; started = false; flagMode = false;
      timerInterval = null; startTime = null; minesLeft = mines;
    }

    function placeMines(safeR, safeC) {
      const safe = new Set();
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const r = safeR + dr, c = safeC + dc;
          if (r >= 0 && r < rows && c >= 0 && c < cols) safe.add(r * cols + c);
        }
      let placed = 0;
      while (placed < mines) {
        const r = randInt(0, rows - 1), c = randInt(0, cols - 1);
        if (safe.has(r * cols + c) || grid[r][c].mine) continue;
        grid[r][c].mine = true;
        placed++;
      }
      // 计算数字
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (!grid[r][c].mine)
            grid[r][c].count = countAdjMines(r, c);
    }

    function countAdjMines(r, c) {
      let n = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].mine) n++;
        }
      return n;
    }

    function reveal(r, c) {
      if (gameOver || flagged[r][c]) return;
      if (!started) { started = true; placeMines(r, c); startTimer(); }

      if (grid[r][c].mine) {
        // 踩雷
        revealed[r][c] = true;
        gameOver = true;
        clearInterval(timerInterval);
        revealAll();
        render();
        setTimeout(() => onComplete({ win: false, score: 999, title: '💥 踩到雷了！', detail: '再接再厉！' }), 800);
        return;
      }

      // Flood fill
      const stack = [[r, c]];
      while (stack.length) {
        const [cr, cc] = stack.pop();
        if (revealed[cr][cc] || flagged[cr][cc]) continue;
        revealed[cr][cc] = true;
        if (grid[cr][cc].count === 0) {
          for (let dr = -1; dr <= 1; dr++)
            for (let dc = -1; dc <= 1; dc++) {
              const nr = cr + dr, nc = cc + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !revealed[nr][nc])
                stack.push([nr, nc]);
            }
        }
      }

      checkWin();
      render();
    }

    function toggleFlag(r, c) {
      if (gameOver || revealed[r][c] || !started) return;
      flagged[r][c] = !flagged[r][c];
      minesLeft += flagged[r][c] ? -1 : 1;
      checkWin();
      render();
    }

    function checkWin() {
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (!grid[r][c].mine && !revealed[r][c]) return;
      // 所有非雷格已翻开
      gameOver = true;
      clearInterval(timerInterval);
      // 标记所有雷
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (grid[r][c].mine) flagged[r][c] = true;
      minesLeft = 0;
      render();
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setTimeout(() => onComplete({
        win: true, score: elapsed, time: elapsed,
        title: '🎉 扫雷成功！', detail: `用时 ${fmtTime(elapsed)}`,
      }), 600);
    }

    function revealAll() {
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (grid[r][c].mine) revealed[r][c] = true;
    }

    function startTimer() {
      startTime = Date.now();
      timerInterval = setInterval(() => render(), 1000);
    }

    function getElapsed() {
      if (!startTime) return 0;
      return gameOver ? Math.round((Date.now() - startTime) / 1000) : Math.round((Date.now() - startTime) / 1000);
    }

    const NUM_COLORS = ['','#4fc3f7','#66bb6a','#ef5350','#7e57c2','#f44336','#e91e63','#880e4f','#757575'];

    function render() {
      const cellSize = cols > 16 ? 36 : cols > 9 ? 40 : 48;
      const fontSize = cols > 16 ? '0.9em' : cols > 9 ? '1em' : '1.2em';

      const html = grid.map((row, r) =>
        `<div style="display:flex;">${row.map((cell, c) => {
          let content = '', bg = 'var(--surface2)', color = '';
          if (revealed[r][c]) {
            bg = '#1a1a2e';
            if (cell.mine) { content = '💣'; bg = '#ff4757'; }
            else if (cell.count > 0) { content = cell.count; color = NUM_COLORS[cell.count]; }
          } else if (flagged[r][c]) {
            content = '🚩'; bg = 'rgba(255,165,0,0.15)';
          }
          return `<div class="sweep-cell" data-r="${r}" data-c="${c}" style="
            width:${cellSize}px;height:${cellSize}px;display:flex;align-items:center;justify-content:center;
            font-size:${fontSize};font-weight:700;background:${bg};color:${color};
            border:1px solid rgba(255,255,255,0.06);cursor:pointer;user-select:none;
            ${!revealed[r][c] && !flagged[r][c] ? 'box-shadow:inset 1px 1px 0 rgba(255,255,255,0.05),inset -1px -1px 0 rgba(0,0,0,0.2);' : ''}
          ">${content}</div>`;
        }).join('')}</div>`
      ).join('');

      container.innerHTML = `
        <div style="text-align:center;">
          <div style="display:flex;align-items:center;justify-content:center;gap:20px;margin-bottom:12px;">
            <span style="font-size:1.3em;">💣 ${minesLeft}</span>
            <button class="btn btn-secondary" id="btnFlagMode" style="font-size:0.9em;${flagMode?'border-color:var(--accent);background:rgba(108,99,255,0.2);':''}">
              🚩 ${flagMode ? '插旗模式' : '挖掘模式'}
            </button>
            <span style="font-size:1.3em;">⏱ ${getElapsed()}秒</span>
            <button class="btn btn-secondary" id="btnReset" style="font-size:0.9em;">🔄</button>
          </div>
          <div style="display:inline-block;border:2px solid var(--surface2);border-radius:4px;overflow:hidden;line-height:0;" id="sweepGrid">
            ${html}
          </div>
          <div style="margin-top:8px;color:var(--text-dim);font-size:0.8em;">
            点击翻开 · 点击🚩切换模式后点击可插旗 · 长按也可插旗
          </div>
        </div>
      `;

      // Click / touch handlers — 兼容 iPad
      let touchMoved = false, touchStartRC = null;
      container.querySelectorAll('.sweep-cell').forEach(cell => {
        const r = +cell.dataset.r, c = +cell.dataset.c;

        cell.addEventListener('touchstart', (e) => {
          touchMoved = false;
          touchStartRC = [r, c];
        }, { passive: true });

        cell.addEventListener('touchmove', () => { touchMoved = true; });

        cell.addEventListener('touchend', (e) => {
          e.preventDefault();
          if (touchMoved) return;
          // 长按 > 600ms = 插旗标记
          if (e.timeStamp - cell._touchStart > 600) {
            toggleFlag(r, c);
          } else if (flagMode) {
            toggleFlag(r, c);
          } else {
            reveal(r, c);
          }
        });

        cell.addEventListener('touchstart', (e) => { cell._touchStart = e.timeStamp; }, { passive: true });

        // 桌面端点击
        cell.addEventListener('click', (e) => {
          if (e.pointerType === 'touch') return; // 触屏设备跳过 click（touchend 已处理）
          if (flagMode) toggleFlag(r, c);
          else reveal(r, c);
        });

        // 桌面端右键
        cell.addEventListener('contextmenu', (e) => { e.preventDefault(); toggleFlag(r, c); });
      });

      document.getElementById('btnFlagMode').onclick = () => { flagMode = !flagMode; render(); };
      document.getElementById('btnReset').onclick = () => { clearInterval(timerInterval); initGame(); render(); };
    }

    render();
  }
});
