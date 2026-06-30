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

    let solved = false;

    render();

    function render() {
      container.innerHTML = `
        <div style="text-align:center;max-width:420px;width:100%;">
          <div style="font-size:1.1em;color:var(--text-dim);margin-bottom:16px;">
            使用这四个数字和 + - × ÷ ( ) 运算，使结果等于 <b style="color:var(--accent);">24</b>
          </div>
          <div style="display:flex;gap:16px;justify-content:center;margin-bottom:24px;">
            ${numbers.map((n, i) => `
              <div class="game-cell" style="font-size:2em;width:80px;height:80px;cursor:default;border-color:var(--accent);">${n}</div>
            `).join('')}
          </div>
          <div style="display:flex;gap:8px;margin-bottom:16px;">
            <input type="text" class="game-input" id="exprInput"
              placeholder="例如: (3+5)×(8-5)" style="flex:1;font-size:1.2em;text-align:left;" autocomplete="off">
            <button class="btn btn-primary" id="btnCheck">验证</button>
          </div>
          <div id="feedback24"></div>
          <div style="margin-top:12px;">
            <button class="btn btn-secondary" id="btnNew24">🔄 换一题</button>
            <button class="btn btn-secondary" id="btnHint24" style="margin-left:8px;">💡 提示</button>
          </div>
        </div>
      `;

      document.getElementById('btnCheck').onclick = checkAnswer;
      document.getElementById('btnNew24').onclick = () => {
        do { numbers = Array.from({ length: 4 }, () => randInt(1, range)); }
        while (!solve24(numbers).length);
        solved = false;
        render();
      };
      document.getElementById('btnHint24').onclick = showHint;
      const inp = document.getElementById('exprInput');
      inp.onkeydown = (e) => { if (e.key === 'Enter') checkAnswer(); };
      inp.focus();
    }

    function checkAnswer() {
      if (solved) return;
      const expr = document.getElementById('exprInput').value.trim();
      if (!expr) return;

      // 提取表达式中的数字
      const used = expr.match(/\d+/g);
      if (!used || used.length !== 4 || !used.every(n => numbers.includes(+n)) ||
          used.map(Number).sort().join() !== [...numbers].sort().join()) {
        document.getElementById('feedback24').innerHTML =
          `<div class="game-feedback info">请恰好使用给出的4个数字各一次</div>`;
        return;
      }

      // 安全检查：只允许数字、运算符、括号、空格
      if (!/^[\d+\-*/×÷xX()（）.\s]+$/.test(expr)) {
        document.getElementById('feedback24').innerHTML =
          `<div class="game-feedback info">表达式包含无效字符</div>`;
        return;
      }

      try {
        const normalized = expr.replace(/[×xX]/g, '*').replace(/[÷]/g, '/').replace(/（）/g, (m) => m === '（' ? '(' : ')');
        const val = new Function(`return (${normalized})`)();
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
