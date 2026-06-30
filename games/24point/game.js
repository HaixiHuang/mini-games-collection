// ===== 24点 =====
GameRegistry.register({
  id: '24point',
  name: '24点',
  icon: '🃏',
  desc: '用给出的4个数字，通过加减乘除运算得到24！',
  difficulties: [
    { id: 'easy', name: '简单', icon: '🌱', desc: '数字范围 1-9' },
    { id: 'medium', name: '中等', icon: '🔥', desc: '数字范围 1-13' },
    { id: 'hard', name: '困难', icon: '💀', desc: '含分数解，范围 1-13' },
  ],

  init(container, difficulty, onComplete) {
    const range = difficulty === 'easy' ? 9 : 13;
    let numbers;

    do { numbers = Array.from({ length: 4 }, () => randInt(1, range)); }
    while (!solve24(numbers).length);

    let numbers, expr;
    solved = false;

    render();

    function render() {
      container.innerHTML = `
        <div style="text-align:center;max-width:420px;width:100%;">
          <div style="font-size:1.1em;color:var(--text-dim);margin-bottom:16px;">
            使用这四个数字和 + − × ÷ ( ) 运算，使结果等于 <b style="color:var(--accent);">24</b>
          </div>
          <div style="display:flex;gap:12px;justify-content:center;margin-bottom:16px;">
            ${numbers.map((n, i) => `
              <button class="game-cell" id="btnNum${i}" style="font-size:1.8em;width:70px;height:70px;border-color:var(--accent);">${n}</button>
            `).join('')}
          </div>
          <div style="display:flex;gap:6px;align-items:center;margin-bottom:12px;">
            <div id="exprDisplay" style="flex:1;min-height:44px;padding:10px 14px;background:var(--surface2);border-radius:8px;font-size:1.3em;font-family:monospace;text-align:left;color:var(--text);word-break:break-all;">&nbsp;</div>
            <button class="btn btn-primary" id="btnCheck">验证</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:8px;">
            <button class="btn btn-secondary pad-btn" data-key="(">(</button>
            <button class="btn btn-secondary pad-btn" data-key=")">)</button>
            <button class="btn btn-secondary pad-btn" data-key="+">+</button>
            <button class="btn btn-secondary pad-btn" data-key="-">−</button>
            <button class="btn btn-secondary pad-btn" data-key="*">×</button>
            <button class="btn btn-secondary pad-btn" data-key="/">÷</button>
            <button class="btn btn-secondary pad-btn" id="btnUndo">⌫</button>
            <button class="btn btn-danger pad-btn" id="btnClear">C</button>
            <button class="btn btn-secondary" id="btnNew24">🔄</button>
            <button class="btn btn-secondary" id="btnHint24">💡</button>
          </div>
          <div id="feedback24"></div>
        </div>
      `;

      // 表达式构建
      expr = '';
      const display = document.getElementById('exprDisplay');

      function updateDisplay() {
        display.textContent = expr || ' ';
      }

      // 四个数字按钮
      numbers.forEach((n, i) => {
        document.getElementById('btnNum'+i).onclick = () => { expr += n; updateDisplay(); };
      });

      // 运算符按钮
      container.querySelectorAll('.pad-btn').forEach(btn => {
        btn.onclick = () => { expr += btn.dataset.key; updateDisplay(); };
      });

      // 撤销
      document.getElementById('btnUndo').onclick = () => { expr = expr.slice(0, -1); updateDisplay(); };
      // 清除
      document.getElementById('btnClear').onclick = () => { expr = ''; updateDisplay(); };

      document.getElementById('btnCheck').onclick = () => { if (!solved) checkAnswer(); };
      document.getElementById('btnNew24').onclick = () => {
        do { numbers = Array.from({ length: 4 }, () => randInt(1, range)); }
        while (!solve24(numbers).length);
        solved = false;
        render();
      };
      document.getElementById('btnHint24').onclick = showHint;

      // 键盘输入支持
      function onKeyDown(e) {
        if (solved) return;
        if (e.key === 'Enter') { e.preventDefault(); checkAnswer(); return; }
        if (e.key === 'Backspace') { e.preventDefault(); expr = expr.slice(0, -1); updateDisplay(); return; }
        if (/^\d$/.test(e.key)) { expr += e.key; updateDisplay(); return; }
        if (['+','-','*','/','(',')'].includes(e.key)) { expr += e.key; updateDisplay(); return; }
      }
      document.addEventListener('keydown', onKeyDown);
      const prevCleanup = container._cleanup;
      container._cleanup = () => { document.removeEventListener('keydown', onKeyDown); if (prevCleanup) prevCleanup(); };
    }

    function checkAnswer() {
      if (solved) return;
      if (!expr.trim()) return;

      // 提取表达式中的数字
      const used = expr.match(/\d+/g);
      if (!used || used.length !== 4 || !used.every(n => numbers.includes(+n)) ||
          used.map(Number).sort().join() !== [...numbers].sort().join()) {
        document.getElementById('feedback24').innerHTML =
          `<div class="game-feedback info">请恰好使用给出的4个数字各一次</div>`;
        return;
      }

      // 安全检查
      if (!/^[\d+\-*/()\s]+$/.test(expr)) {
        document.getElementById('feedback24').innerHTML =
          `<div class="game-feedback info">表达式包含无效字符</div>`;
        return;
      }

      try {
        const val = new Function(`return (${expr})`)();
        if (Math.abs(val - 24) < 1e-9) {
          solved = true;
          document.getElementById('feedback24').innerHTML =
            `<div class="game-feedback success">🎉 正确！${expr} = 24</div>`;
          setTimeout(() => onComplete({
            win: true, score: 1,
            title: '解答正确！',
            detail: `${expr} = 24`,
          }), 600);
        } else {
          document.getElementById('feedback24').innerHTML =
            `<div class="game-feedback info">${expr} = ${val}，不等于24哦</div>`;
        }
      } catch (e) {
        document.getElementById('feedback24').innerHTML =
          `<div class="game-feedback info">表达式格式有误</div>`;
      }
    }

    function showHint() {
      const solutions = solve24(numbers);
      if (solutions.length) {
        document.getElementById('feedback24').innerHTML =
          `<div class="game-feedback info">💡 提示：存在 ${solutions.length} 种解法，试试看！</div>`;
      }
    }
  }
});

// 24点求解器
function solve24(nums) {
  const ops = ['+', '-', '*', '/'];
  const results = [];

  function calc(a, op, b) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return Math.abs(b) < 1e-9 ? NaN : a / b;
    }
  }

  function permute(arr) {
    if (arr.length <= 1) return [arr];
    const res = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = permute([...arr.slice(0, i), ...arr.slice(i + 1)]);
      rest.forEach(r => res.push([arr[i], ...r]));
    }
    return res;
  }

  // 5种括号模式
  // ((a op b) op c) op d
  function eval1(a, b, c, d, o1, o2, o3) { return calc(calc(calc(a, o1, b), o2, c), o3, d); }
  // (a op (b op c)) op d
  function eval2(a, b, c, d, o1, o2, o3) { return calc(calc(a, o1, calc(b, o2, c)), o3, d); }
  // (a op b) op (c op d)
  function eval3(a, b, c, d, o1, o2, o3) { return calc(calc(a, o1, b), o2, calc(c, o3, d)); }
  // a op ((b op c) op d)
  function eval4(a, b, c, d, o1, o2, o3) { return calc(a, o1, calc(calc(b, o2, c), o3, d)); }
  // a op (b op (c op d))
  function eval5(a, b, c, d, o1, o2, o3) { return calc(a, o1, calc(b, o2, calc(c, o3, d))); }

  const evals = [eval1, eval2, eval3, eval4, eval5];

  const perms = permute(nums);
  for (const [a, b, c, d] of perms) {
    for (const o1 of ops) {
      for (const o2 of ops) {
        for (const o3 of ops) {
          for (const fn of evals) {
            const val = fn(a, b, c, d, o1, o2, o3);
            if (!isNaN(val) && Math.abs(val - 24) < 1e-9) {
              results.push({ a, b, c, d, o1, o2, o3 });
            }
          }
        }
      }
    }
  }
  return results;
}

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
