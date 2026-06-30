// ===== 滑动拼图 Sliding Puzzle =====
GameRegistry.register({
  id: 'puzzle',
  name: '拼图游戏',
  icon: '🧩',
  desc: '经典滑动拼图。移动数字方块，还原正确的顺序！',
  difficulties: [
    { id: 'easy', name: '简单', icon: '🌱', desc: '3×3 九宫格' },
    { id: 'medium', name: '中等', icon: '🔥', desc: '4×4 十六宫格' },
    { id: 'hard', name: '困难', icon: '💀', desc: '5×5 二十五宫格' },
  ],

  init(container, difficulty, onComplete) {
    const size = { easy: 3, medium: 4, hard: 5 }[difficulty];
    const total = size * size;
    let board, emptyR, emptyC, moves, startTime;

    reset();

    function reset() {
      // 从完成状态开始
      board = Array.from({ length: size }, (_, r) =>
        Array.from({ length: size }, (_, c) => r * size + c + 1)
      );
      board[size - 1][size - 1] = 0; // 0 = empty
      emptyR = size - 1;
      emptyC = size - 1;
      moves = 0;
      startTime = Date.now();

      // 通过随机移动来打乱（保证可解）
      const shuffleMoves = size * size * 20;
      const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
      let lastDr = 0, lastDc = 0;
      for (let i = 0; i < shuffleMoves; i++) {
        const valid = dirs.filter(([dr, dc]) => {
          const nr = emptyR + dr, nc = emptyC + dc;
          return nr >= 0 && nr < size && nc >= 0 && nc < size && !(dr === -lastDr && dc === -lastDc);
        });
        const [dr, dc] = valid[Math.floor(Math.random() * valid.length)];
        swap(emptyR + dr, emptyC + dc);
        lastDr = dr; lastDc = dc;
      }
      moves = 0;
      startTime = Date.now();
    }

    function swap(r, c) {
      board[emptyR][emptyC] = board[r][c];
      board[r][c] = 0;
      emptyR = r; emptyC = c;
    }

    function isAdjacent(r, c) {
      return Math.abs(r - emptyR) + Math.abs(c - emptyC) === 1;
    }

    function isSolved() {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const expected = r === size - 1 && c === size - 1 ? 0 : r * size + c + 1;
          if (board[r][c] !== expected) return false;
        }
      }
      return true;
    }

    function render() {
      const cellSize = size <= 3 ? 90 : size <= 4 ? 75 : 60;
      const fontSize = size <= 3 ? '1.8em' : size <= 4 ? '1.4em' : '1.1em';
      const gap = size <= 3 ? 4 : 3;

      const html = board.map((row, r) =>
        `<div style="display:flex;gap:${gap}px;margin-bottom:${gap}px;">${row.map((val, c) => {
          if (val === 0) return `<div style="width:${cellSize}px;height:${cellSize}px;"></div>`;
          const correct = val === r * size + c + 1;
          return `<div class="game-cell" data-r="${r}" data-c="${c}" style="
            width:${cellSize}px;height:${cellSize}px;font-size:${fontSize};
            ${correct ? 'border-color:rgba(39,174,96,0.4);background:rgba(39,174,96,0.1);' : ''}
            ${isAdjacent(r, c) ? 'cursor:pointer;' : 'cursor:not-allowed;opacity:0.5;'}
          ">${val}</div>`;
        }).join('')}</div>`
      ).join('');

      container.innerHTML = `
        <div style="text-align:center;">
          <div style="margin-bottom:16px;color:var(--text-dim);">
            步数: <b style="color:var(--accent);">${moves}</b>
            &nbsp;|&nbsp; 已归位: <b style="color:#27ae60;">${countCorrect()}</b>/${total - 1}
          </div>
          <div style="display:inline-block;" id="puzzleGrid">${html}</div>
          <div style="margin-top:16px;color:var(--text-dim);font-size:0.85em;">
            点击空白格旁边的方块来移动 | R 重置
          </div>
        </div>
      `;

      document.getElementById('puzzleGrid').onclick = (e) => {
        const cell = e.target.closest('[data-r]');
        if (!cell) return;
        const r = +cell.dataset.r, c = +cell.dataset.c;
        if (!isAdjacent(r, c)) return;
        swap(r, c);
        moves++;
        render();

        if (isSolved()) {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          setTimeout(() => onComplete({
            win: true, score: moves, time: elapsed,
            title: '🎉 拼图完成！',
            detail: `共 ${moves} 步，用时 ${fmtTime(elapsed)}`,
          }), 400);
        }
      };
    }

    function countCorrect() {
      let count = 0;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (board[r][c] === r * size + c + 1) count++;
        }
      }
      return board[size - 1][size - 1] === 0 ? count : 0;
    }

    render();

    function onKey(e) {
      if (e.key === 'r' || e.key === 'R') { reset(); render(); return; }
      const dirMap = { ArrowUp: [1,0], ArrowDown: [-1,0], ArrowLeft: [0,1], ArrowRight: [0,-1],
                       w: [1,0], W: [1,0], s: [-1,0], S: [-1,0], a: [0,1], A: [0,1], d: [0,-1], D: [0,-1] };
      const [dr, dc] = dirMap[e.key] || [];
      if (dr === undefined) return;
      e.preventDefault();
      const nr = emptyR + dr, nc = emptyC + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        swap(nr, nc);
        moves++;
        render();
        if (isSolved()) {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          setTimeout(() => onComplete({
            win: true, score: moves, time: elapsed,
            title: '🎉 拼图完成！',
            detail: `共 ${moves} 步，用时 ${fmtTime(elapsed)}`,
          }), 400);
        }
      }
    }

    document.addEventListener('keydown', onKey);
    container._cleanup = () => document.removeEventListener('keydown', onKey);
  }
});
