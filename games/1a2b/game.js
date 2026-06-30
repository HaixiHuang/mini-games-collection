// ===== 1A2B 猜数字 =====
GameRegistry.register({
  id: '1a2b',
  name: '1A2B',
  icon: '🔢',
  desc: '经典的猜数字推理游戏。根据提示找出隐藏的数字组合！',
  difficulties: [
    { id: 'easy', name: '简单', icon: '🌱', desc: '3位数字 (0-5)' },
    { id: 'medium', name: '中等', icon: '🔥', desc: '4位数字 (0-7)' },
    { id: 'hard', name: '困难', icon: '💀', desc: '4位数字 (0-9)' },
  ],

  init(container, difficulty, onComplete) {
    const config = { easy: { digits: 3, max: 5 }, medium: { digits: 4, max: 7 }, hard: { digits: 4, max: 9 } };
    const { digits, max } = config[difficulty];
    const answer = generateAnswer(digits, max);
    let guesses = [];

    // debug
    console.log('Answer:', answer.join(''));

    render();

    function generateAnswer(n, m) {
      const pool = Array.from({ length: m + 1 }, (_, i) => i);
      const result = [];
      for (let i = 0; i < n; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        result.push(pool.splice(idx, 1)[0]);
      }
      return result;
    }

    function check(guess) {
      let a = 0, b = 0;
      for (let i = 0; i < digits; i++) {
        if (guess[i] === answer[i]) a++;
        else if (answer.includes(guess[i])) b++;
      }
      return { a, b };
    }

    function render() {
      const historyHtml = guesses.map((g, i) => `
        <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
          <span style="color:var(--text-dim);min-width:24px;">#${i + 1}</span>
          <span style="font-size:1.3em;font-weight:700;letter-spacing:4px;">${g.guess.join(' ')}</span>
          <span style="font-weight:700;color:var(--accent);">${g.a}A</span>
          <span style="font-weight:700;color:var(--accent2);">${g.b}B</span>
        </div>
      `).join('');

      container.innerHTML = `
        <div style="max-width:400px;width:100%;">
          <div style="margin-bottom:20px;color:var(--text-dim);text-align:center;">
            猜一个 ${digits} 位数字，每位不重复 (0-${max})
          </div>
          <div style="display:flex;gap:8px;margin-bottom:16px;">
            <input type="text" class="game-input" id="guessInput" maxlength="${digits}"
              placeholder="输入${digits}位数字" style="flex:1;text-align:center;font-size:1.3em;letter-spacing:6px;" autocomplete="off">
            <button class="btn btn-primary" id="btnGuess">猜测</button>
          </div>
          <div id="feedback"></div>
          <div style="max-height:350px;overflow-y:auto;margin-top:12px;" id="history"></div>
        </div>
      `;

      document.getElementById('btnGuess').onclick = doGuess;
      const inp = document.getElementById('guessInput');
      inp.onkeydown = (e) => { if (e.key === 'Enter') doGuess(); };
      inp.focus();

      if (guesses.length) {
        document.getElementById('history').innerHTML = historyHtml;
      }
    }

    function doGuess() {
      const inp = document.getElementById('guessInput');
      const raw = inp.value.trim();
      if (raw.length !== digits || !/^\d+$/.test(raw)) {
        document.getElementById('feedback').innerHTML =
          `<div class="game-feedback info">请输入 ${digits} 位数字</div>`;
        return;
      }
      const guess = raw.split('').map(Number);
      if (guess.some(d => d < 0 || d > max)) {
        document.getElementById('feedback').innerHTML =
          `<div class="game-feedback info">每位数字必须在 0-${max} 范围内哦</div>`;
        return;
      }
      if (new Set(guess).size !== digits) {
        document.getElementById('feedback').innerHTML =
          `<div class="game-feedback info">数字不能重复哦</div>`;
        return;
      }

      const { a, b } = check(guess);
      guesses.push({ guess, a, b });
      inp.value = '';

      if (a === digits) {
        document.getElementById('feedback').innerHTML =
          `<div class="game-feedback success">🎉 恭喜！答案是 ${answer.join('')}，用了 ${guesses.length} 次猜测</div>`;
        document.getElementById('btnGuess').disabled = true;
        inp.disabled = true;
        setTimeout(() => onComplete({
          win: true,
          score: guesses.length,
          title: '猜对了！',
          detail: `答案是 ${answer.join('')}，共 ${guesses.length} 次猜测`,
        }), 800);
      } else {
        render();
        document.getElementById('guessInput').focus();
      }
    }
  }
});
