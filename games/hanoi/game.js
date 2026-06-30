// ===== 汉诺塔 Tower of Hanoi =====
GameRegistry.register({
  id: 'hanoi',
  name: '汉诺塔',
  icon: '🗼',
  desc: '经典递归谜题。将所有盘子从左边移到右边，大盘不能放在小盘上面！',
  difficulties: [
    { id: 'easy', name: '简单', icon: '🌱', desc: '3个盘子（最少7步）' },
    { id: 'medium', name: '中等', icon: '🔥', desc: '5个盘子（最少31步）' },
    { id: 'hard', name: '困难', icon: '💀', desc: '7个盘子（最少127步）' },
  ],

  init(container, difficulty, onComplete) {
    const n = { easy: 3, medium: 5, hard: 7 }[difficulty];
    const optimal = Math.pow(2, n) - 1;
    const pegs = [[], [], []];
    let moves = 0, selectedPeg = -1;

    // Initialize: all disks on peg 0
    for (let i = n; i >= 1; i--) pegs[0].push(i);

    const colors = ['#ff6b6b','#ffa502','#ffd700','#2ed573','#1e90ff','#a55eea','#ff6584'];

    render();

    function render() {
      const pegWidth = Math.max(140, n * 22);
      const maxH = n * 28 + 40;

      const pegsHtml = pegs.map((peg, pi) => {
        const disksHtml = peg.map((disk, di) => {
          const w = (disk / n) * pegWidth;
          return `<div style="
            width:${w}px;height:24px;background:${colors[disk-1]};
            border-radius:6px;margin:0 auto 2px;
            transition:all 0.2s;
            ${pi === selectedPeg && di === peg.length - 1 ? 'transform:translateY(-10px);' : ''}
          "></div>`;
        }).join('');

        return `
          <div class="game-cell" data-peg="${pi}" style="
            width:${pegWidth + 20}px;height:auto;min-height:${maxH}px;
            flex-direction:column;justify-content:flex-end;padding:8px;
            cursor:pointer;gap:0;
            ${pi === selectedPeg ? 'border-color:var(--accent);background:rgba(108,99,255,0.15);' : ''}
          ">
            <div style="margin-bottom:4px;font-size:0.7em;color:var(--text-dim);">柱 ${pi + 1}</div>
            <div style="width:4px;height:${n*24}px;background:var(--surface2);border-radius:2px;position:absolute;bottom:30px;"></div>
            <div style="display:flex;flex-direction:column-reverse;align-items:center;position:relative;z-index:1;width:100%;">
              ${disksHtml}
            </div>
          </div>`;
      }).join('');

      container.innerHTML = `
        <div style="text-align:center;">
          <div style="margin-bottom:16px;color:var(--text-dim);">
            步数: <b style="color:var(--accent);">${moves}</b> &nbsp;|&nbsp;
            最少步数: <b>${optimal}</b>
          </div>
          <div style="display:flex;gap:20px;justify-content:center;align-items:flex-end;" id="pegContainer">
            ${pegsHtml}
          </div>
          <div style="margin-top:16px;color:var(--text-dim);font-size:0.85em;">
            点击柱子选择 → 再点击目标柱子移动 | R 重置
          </div>
        </div>
      `;

      document.getElementById('pegContainer').onclick = (e) => {
        const pegEl = e.target.closest('[data-peg]');
        if (!pegEl) return;
        clickPeg(+pegEl.dataset.peg);
      };
    }

    function clickPeg(pi) {
      if (selectedPeg === -1) {
        if (pegs[pi].length === 0) return;
        selectedPeg = pi;
        render();
      } else {
        if (selectedPeg === pi) { selectedPeg = -1; render(); return; }

        const src = pegs[selectedPeg];
        const dst = pegs[pi];
        const disk = src[src.length - 1];

        if (dst.length > 0 && dst[dst.length - 1] < disk) {
          // Invalid move: large on small
          selectedPeg = -1;
          render();
          return;
        }

        dst.push(src.pop());
        selectedPeg = -1;
        moves++;
        render();

        // Check win: all disks on peg 2
        if (pegs[2].length === n) {
          const rating = moves <= optimal ? '🏅 完美！' : moves <= optimal * 1.5 ? '👍 不错！' : '😅 还需努力';
          setTimeout(() => onComplete({
            win: true, score: moves,
            title: '🎉 完成！',
            detail: `共用 ${moves} 步（最少 ${optimal} 步） ${rating}`,
          }), 400);
        }
      }
    }

    function onKey(e) {
      if (e.key === 'r' || e.key === 'R') {
        pegs[0] = []; pegs[1] = []; pegs[2] = [];
        for (let i = n; i >= 1; i--) pegs[0].push(i);
        moves = 0; selectedPeg = -1;
        render();
        return;
      }
      if (e.key === '1') clickPeg(0);
      if (e.key === '2') clickPeg(1);
      if (e.key === '3') clickPeg(2);
    }

    document.addEventListener('keydown', onKey);
    container._cleanup = () => document.removeEventListener('keydown', onKey);
  }
});
