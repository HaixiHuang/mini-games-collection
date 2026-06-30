// ===== 数学智力题 =====
GameRegistry.register({
  id: 'math',
  name: '数学智力题',
  icon: '🧮',
  desc: '各种数学谜题，从四则运算到奥赛级别难题！',
  difficulties: [
    { id: 'easy', name: '简单', icon: '🌱', desc: '四则运算与简单推理' },
    { id: 'medium', name: '中等', icon: '🔥', desc: '应用题与数学趣题' },
    { id: 'hard', name: '困难', icon: '💀', desc: '奥赛级推理题' },
  ],

  init(container, difficulty, onComplete) {
    const pool = QUESTIONS[difficulty];
    // 随机选5题
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
    let index = 0, correct = 0, answers = [];

    showQuestion();

    function showQuestion() {
      if (index >= shuffled.length) {
        finish();
        return;
      }
      const q = shuffled[index];

      container.innerHTML = `
        <div style="max-width:500px;width:100%;" class="animate-in">
          <div style="color:var(--text-dim);margin-bottom:12px;">
            第 ${index + 1} / ${shuffled.length} 题 &nbsp;|&nbsp; 正确: ${correct}
          </div>
          <div style="font-size:1.15em;font-weight:600;margin-bottom:20px;line-height:1.6;background:var(--surface);padding:20px;border-radius:var(--radius);">
            ${q.question}
          </div>
          <div class="flex-col" id="optionsContainer">
            ${q.options.map((opt, i) => `
              <button class="btn btn-secondary" data-idx="${i}" style="text-align:left;justify-content:flex-start;width:100%;">
                ${String.fromCharCode(65 + i)}. ${opt}
              </button>
            `).join('')}
          </div>
        </div>
      `;

      document.getElementById('optionsContainer').onclick = (e) => {
        const btn = e.target.closest('[data-idx]');
        if (!btn) return;
        const chosen = +btn.dataset.idx;
        answers.push({ question: q.question, chosen, correct: q.answer });
        if (chosen === q.answer) correct++;
        index++;
        showQuestion();
      };
    }

    function finish() {
      const score = correct;
      const star = score === 5 ? '⭐⭐⭐⭐⭐' : score >= 4 ? '⭐⭐⭐⭐' : score >= 3 ? '⭐⭐⭐' : score >= 2 ? '⭐⭐' : '⭐';

      container.innerHTML = `
        <div class="result-card animate-in">
          <div class="result-icon">${score >= 4 ? '🎉' : score >= 3 ? '👍' : '📚'}</div>
          <div class="result-title">答题完成！</div>
          <div class="result-detail">
            共 ${shuffled.length} 题，答对 <b style="color:var(--accent);">${correct}</b> 题<br>
            ${star}
          </div>
          <div style="text-align:left;max-width:400px;margin:0 auto;">
            ${answers.map((a, i) => `
              <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.9em;">
                ${i + 1}. ${a.chosen === a.correct ? '✅' : '❌'} ${a.question.slice(0, 30)}...
                ${a.chosen !== a.correct ? `<span style="color:var(--text-dim);"> (正确答案: ${String.fromCharCode(65 + a.correct)})</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;

      setTimeout(() => onComplete({
        win: score >= 3,
        score: shuffled.length - score, // 错误数越少越好
        title: score >= 4 ? '太棒了！' : score >= 3 ? '不错！' : '继续加油！',
        detail: `${shuffled.length} 题答对 ${correct} 题`,
      }), 1500);
    }
  }
});

// ===== 题库 =====
const QUESTIONS = {
  easy: [
    {
      question: '计算：15 + 27 × 2 = ？',
      options: ['84', '69', '57', '72'],
      answer: 1, // 69 = 15 + 54
    },
    {
      question: '一个数加上它的两倍等于36，这个数是多少？',
      options: ['9', '12', '18', '10'],
      answer: 1, // 12
    },
    {
      question: '小明有20元钱，买书花了8元，买笔花了剩下钱的一半，还剩多少钱？',
      options: ['4元', '5元', '6元', '8元'],
      answer: 2, // 6元 = (20-8)/2
    },
    {
      question: '找规律：1, 4, 9, 16, 25, __？',
      options: ['30', '35', '36', '49'],
      answer: 2, // 36 = 6²
    },
    {
      question: '一个长方形的长是8厘米，宽是5厘米，它的面积是多少？',
      options: ['26平方厘米', '40平方厘米', '13平方厘米', '80平方厘米'],
      answer: 1, // 40
    },
    {
      question: '100 ÷ 4 + 6 × 3 = ？',
      options: ['43', '37', '93', '25'],
      answer: 0, // 25 + 18 = 43
    },
    {
      question: '时钟指向3点，时针和分针的夹角是多少度？',
      options: ['60°', '90°', '45°', '30°'],
      answer: 1, // 90°
    },
    {
      question: '有5个连续偶数的和是50，最小的那个是多少？',
      options: ['6', '4', '8', '10'],
      answer: 0, // 6: 6+8+10+12+14=50
    },
  ],

  medium: [
    {
      question: '甲、乙两人同时从A地出发前往B地，甲的速度是6千米/时，乙的速度是4千米/时。甲到达B地后立即返回，在距离B地3千米处遇到乙。A、B两地相距多少千米？',
      options: ['12千米', '15千米', '18千米', '21千米'],
      answer: 1, // 15千米
    },
    {
      question: '一个两位数，十位数是个位数的2倍，如果把十位和个位交换，新数比原数小36。原数是多少？',
      options: ['84', '63', '42', '21'],
      answer: 0, // 84
    },
    {
      question: '鸡兔同笼，共有35个头，94只脚。鸡有多少只？',
      options: ['23只', '12只', '20只', '15只'],
      answer: 0, // 23只鸡，12只兔
    },
    {
      question: '一个水池，单独用甲管注满需要6小时，单独用乙管注满需要8小时。两管同时开，需要几小时注满？',
      options: ['3小时', '24/7小时', '7/2小时', '4小时'],
      answer: 1, // 1/(1/6+1/8) = 24/7
    },
    {
      question: '找规律：2, 3, 5, 9, 17, __？',
      options: ['31', '33', '29', '34'],
      answer: 1, // 33 = 17×2-1
    },
    {
      question: '一个数的1/3比它的1/4多5，这个数是多少？',
      options: ['30', '50', '60', '40'],
      answer: 2, // 60: x/3 - x/4 = x/12 = 5, x = 60
    },
    {
      question: '把一根绳子对折3次后，从中间剪一刀，绳子被剪成几段？',
      options: ['7段', '8段', '9段', '10段'],
      answer: 2, // 9段
    },
    {
      question: '从1到100的自然数中，既不是3的倍数也不是5的倍数的数有多少个？',
      options: ['47个', '53个', '60个', '50个'],
      answer: 1, // 53: 100-33-20+6=53
    },
  ],

  hard: [
    {
      question: '在1到2024的自然数中，有多少个数的各位数字之和能被5整除？',
      options: ['404', '405', '406', '403'],
      answer: 0,
    },
    {
      question: '设 f(n) = 1² + 2² + ... + n²。求 f(10) 的值。',
      options: ['385', '350', '400', '420'],
      answer: 0, // 385
    },
    {
      question: '100个人参加考试，第1题有80人做对，第2题有70人做对，第3题有60人做对。至少有多少人三道题都做对了？',
      options: ['10人', '20人', '30人', '40人'],
      answer: 0, // 至少10人: 100-min(20+30+40)=10
    },
    {
      question: '将1到9填入3×3的九宫格，使每行、每列、每条对角线的和都相等。中间的数是多少？',
      options: ['4', '5', '6', '7'],
      answer: 1, // 5
    },
    {
      question: '有一个自然数，它加上100是完全平方数，它加上168也是完全平方数，这个数最小是多少？',
      options: ['156', '208', '256', '300'],
      answer: 0, // 156: 156+100=256=16², 156+168=324=18²
    },
    {
      question: '甲、乙、丙三人的年龄和为100岁。甲年龄的2倍比乙大5岁，乙年龄的3倍比丙大10岁。问甲多少岁？',
      options: ['25岁', '30岁', '35岁', '40岁'],
      answer: 0, // 25
    },
    {
      question: '一个正整数N，它的所有因数（包括1和N本身）之和等于2N，这样的数叫做完全数。以下哪个是完全数？',
      options: ['24', '28', '32', '36'],
      answer: 1, // 28: 1+2+4+7+14+28=56=2×28
    },
    {
      question: '有10个盒子排成一排，每个盒子里有若干个球。每次操作可以选择连续的3个盒子，每个盒子都放进1个球。最少需要多少次操作，才能使得每个盒子里的球数相等？',
      options: ['不可能', '5次', '10次', '视初始状态而定'],
      answer: 3,
    },
  ],
};
