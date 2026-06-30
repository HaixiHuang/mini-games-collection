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

// ===== 题库（100题）=====
const QUESTIONS = {
  // ---- 简单：四则运算与基础推理（33题）----
  easy: [
    // 四则运算
    {question:'15 + 27 × 2 = ？',options:['84','69','57','72'],answer:1},
    {question:'100 ÷ 4 + 6 × 3 = ？',options:['43','37','93','25'],answer:0},
    {question:'(36 - 12) × 5 + 8 = ？',options:['128','120','132','118'],answer:0},
    {question:'125 × 8 ÷ 4 = ？',options:['200','250','300','150'],answer:1},
    {question:'99 + 101 + 102 = ？',options:['300','302','299','303'],answer:1},
    {question:'最大的两位数和最小的三位数之和是多少？',options:['199','200','189','201'],answer:0},
    {question:'从1加到10的和是多少？',options:['50','55','60','45'],answer:1},
    // 基础应用题
    {question:'小明有20元，买书花8元，买笔花剩下的一半，还剩多少？',options:['4元','5元','6元','8元'],answer:2},
    {question:'一个数加上它的两倍等于36，这个数是多少？',options:['9','12','18','10'],answer:1},
    {question:'有5个连续偶数的和是50，最小的那个是多少？',options:['6','4','8','10'],answer:0},
    {question:'妈妈买了3千克苹果和2千克梨，苹果每千克8元，梨每千克6元，一共花了多少？',options:['32元','36元','38元','40元'],answer:1},
    {question:'一根绳子长24米，剪成3段，第一段比第二段长2米，第二段比第三段长2米。最短的一段多长？',options:['4米','6米','8米','10米'],answer:1},
    {question:'班上有男生18人，女生比男生少4人，全班共多少人？',options:['30人','32人','34人','28人'],answer:1},
    {question:'一箱苹果有48个，平均分给6个小朋友，每人几个？',options:['6个','7个','8个','9个'],answer:2},
    // 找规律
    {question:'找规律：1, 4, 9, 16, 25, __？',options:['30','35','36','49'],answer:2},
    {question:'找规律：2, 4, 8, 16, 32, __？',options:['48','64','60','56'],answer:1},
    {question:'找规律：1, 1, 2, 3, 5, 8, __？',options:['11','12','13','14'],answer:2},
    {question:'找规律：3, 6, 12, 24, __？',options:['30','36','48','42'],answer:2},
    // 几何
    {question:'长方形长8厘米宽5厘米，面积是多少？',options:['26cm²','40cm²','13cm²','80cm²'],answer:1},
    {question:'正方形边长6厘米，周长是多少？',options:['12cm','18cm','24cm','36cm'],answer:2},
    {question:'一个三角形三个角分别是30°、60°和多少度？',options:['70°','80°','90°','100°'],answer:2},
    {question:'圆形的钟表，时针指向3，分针指向12，夹角多少度？',options:['60°','90°','45°','30°'],answer:1},
    // 逻辑
    {question:'小明比小红大2岁，小红比小刚大3岁。小明比小刚大几岁？',options:['3岁','4岁','5岁','6岁'],answer:2},
    {question:'5个小朋友互相握手，每两人握一次，一共握几次？',options:['8次','9次','10次','12次'],answer:2},
    {question:'一个两位数，十位是个位的3倍，且十位比个位大6。这个数是多少？',options:['93','62','31','93'],answer:0},
    {question:'笼子里有鸡和兔共10只，数脚共28只。鸡有几只？',options:['4只','5只','6只','7只'],answer:2},
    {question:'3个苹果和4个梨共重1千克，1个苹果和2个梨共重400克。1个苹果重多少克？',options:['100克','120克','150克','200克'],answer:3},
    {question:'从1到100，数字9出现了多少次？',options:['18次','19次','20次','21次'],answer:2},
    {question:'把"＋－×÷"填入 8__4__2__1=5 中（按顺序），正确的运算符是？',options:['÷ ＋ －','－ ＋ ×','× ÷ ＋','÷ × －'],answer:0},
    {question:'时钟在3点整敲3下用了6秒，6点整敲6下用几秒？',options:['12秒','15秒','18秒','10秒'],answer:1},
    {question:'一个水池，进水管3小时注满，出水管5小时排空。两管同开，几小时注满？',options:['6小时','7.5小时','8小时','5小时'],answer:1},
    {question:'能被3整除的最小三位数是多少？',options:['100','101','102','99'],answer:2},
    {question:'把12个糖分给3个小朋友，每人至少3个，有几种分法？',options:['5种','10种','6种','8种'],answer:1},
  ],

  // ---- 中等：应用题与数学趣题（34题）----
  medium: [
    // 行程问题
    {question:'甲从A到B速度6km/h，到后立即返回，距B地3km处遇乙。乙速度4km/h，AB相距？',options:['12km','15km','18km','21km'],answer:1},
    {question:'两城相距300km，两车同时从两城相向而行，甲车60km/h，乙车40km/h。几小时后相遇？',options:['2小时','2.5小时','3小时','4小时'],answer:2},
    {question:'小明跑步上学速度8km/h，骑车回家速度12km/h，来回共1小时。家到学校多远？',options:['4km','4.8km','5km','6km'],answer:1},
    // 数字谜题
    {question:'一个两位数，十位是个位的2倍，交换后新数比原数小36。原数？',options:['84','63','42','21'],answer:0},
    {question:'有一个自然数，加100是完全平方数，加168也是完全平方数。最小是？',options:['156','208','256','300'],answer:0},
    {question:'将1到9填入3×3九宫格，使行列对角线之和相等。中间数是？',options:['4','5','6','7'],answer:1},
    {question:'100以内，是3的倍数但不是5的倍数的数有多少个？',options:['27个','33个','26个','30个'],answer:2},
    // 工程问题
    {question:'甲管注满水池需6小时，乙管需8小时。两管同开需几小时？',options:['3小时','24/7小时','7/2小时','4小时'],answer:1},
    {question:'甲乙合作一项工程需10天，甲单独做需15天。乙单独做需几天？',options:['25天','30天','20天','35天'],answer:1},
    {question:'5台机器5分钟生产5个零件，100台机器生产100个零件需几分钟？',options:['5分钟','10分钟','20分钟','100分钟'],answer:0},
    // 分数百分数
    {question:'一个数的1/3比它的1/4多5，这个数是多少？',options:['30','50','60','40'],answer:2},
    {question:'含盐15%的盐水200克，要变成含盐20%，需加盐多少克？',options:['10克','12.5克','15克','20克'],answer:1},
    {question:'一本书第一天看全书的1/4，第二天看剩下的2/3，还剩40页。全书多少页？',options:['120页','160页','200页','240页'],answer:1},
    // 鸡兔同笼
    {question:'鸡兔同笼，35头94脚。鸡有几只？',options:['23只','12只','20只','15只'],answer:0},
    {question:'5元和10元纸币共20张，共值130元。10元有几张？',options:['5张','6张','7张','8张'],answer:1},
    // 年龄问题
    {question:'父子年龄和50岁，5年前父亲年龄是儿子的3倍。父亲现在几岁？',options:['35岁','38岁','40岁','42岁'],answer:0},
    {question:'姐姐比妹妹大6岁，4年后姐姐是妹妹的2倍。妹妹现在几岁？',options:['2岁','4岁','6岁','8岁'],answer:0},
    // 几何
    {question:'三角形三边长分别是3、4、5，它的面积是多少？',options:['6','7.5','10','12'],answer:0},
    {question:'圆的半径增加1倍，面积增加几倍？',options:['1倍','2倍','3倍','4倍'],answer:2},
    {question:'一个梯形的上底4cm、下底8cm、高6cm，面积？',options:['24cm²','36cm²','48cm²','72cm²'],answer:1},
    // 逻辑推理
    {question:'甲乙丙三人中一人是医生一人是教师一人是警察。甲说：我不是医生。乙说：我不是教师。丙说：我不是警察。三人各说对一句，甲是？',options:['医生','教师','警察','无法确定'],answer:2},
    {question:'5个人比赛，A不是第1也不是第5，B在C前面，D在E后面。第1是谁？',options:['C','D','E','无法确定'],answer:2},
    {question:'袋子有红蓝球各5个，闭眼摸，至少摸几个保证有2个同色？',options:['2个','3个','6个','11个'],answer:1},
    // 找规律
    {question:'找规律：2, 3, 5, 9, 17, __？',options:['31','33','29','34'],answer:1},
    {question:'找规律：1, 2, 6, 24, 120, __？',options:['240','360','600','720'],answer:3},
    // 应用题
    {question:'绳子对折3次后从中间剪一刀，剪成几段？',options:['7段','8段','9段','10段'],answer:2},
    {question:'一条船顺水速度20km/h，逆水速度12km/h。静水速度多少？',options:['14km/h','15km/h','16km/h','18km/h'],answer:2},
    {question:'用1、2、3、4四个数字能组成多少个不重复的三位数？',options:['18个','20个','24个','30个'],answer:2},
    {question:'一件商品先涨价10%再降价10%，现价是原价的？',options:['100%','99%','101%','98%'],answer:1},
    {question:'1到100的自然数中，既不是2的倍数也不是3的倍数的有多少？',options:['33个','34个','35个','36个'],answer:0},
    {question:'等差数列：5, 8, 11, 14, ... 第20项是多少？',options:['59','62','65','68'],answer:1},
    {question:'甲乙各有若干元，甲给乙10元后两人相等，原来甲比乙多？',options:['10元','15元','20元','5元'],answer:2},
    {question:'一个数去掉个位的4后，新数比原数小4，这个数是？',options:['24','34','44','54'],answer:2},
    {question:'3个连续自然数的积是120，这三个数的和是多少？',options:['12','15','18','21'],answer:1},
  ],

  // ---- 困难：奥赛级推理题（33题）----
  hard: [
    // 数论
    {question:'1²+2²+3²+...+10² = ？',options:['385','350','400','420'],answer:0},
    {question:'一个完全数，其所有真因数之和等于它本身。以下哪个是完全数？',options:['24','28','32','36'],answer:1},
    {question:'11¹⁰除以100的余数是多少？',options:['1','11','21','81'],answer:0},
    {question:'1×2×3×...×100的末尾有多少个连续的零？',options:['20个','21个','24个','25个'],answer:2},
    {question:'在200到500之间，能被7整除但不能被3整除的数有多少个？',options:['26个','25个','24个','27个'],answer:0},
    // 组合数学
    {question:'平面上10个点，任意3点不共线，能连成多少条不同的线段？',options:['40条','45条','50条','90条'],answer:1},
    {question:'6本不同的书分给3个人，每人至少1本，有几种分法？',options:['540种','720种','600种','480种'],answer:0},
    {question:'把8个相同的球放入3个不同的盒子，允许空盒，有几种放法？',options:['36种','45种','56种','120种'],answer:1},
    {question:'5对夫妇围圆桌坐，每对夫妇相邻，有几种坐法？',options:['384种','768种','120种','240种'],answer:1},
    // 逻辑
    {question:'100人考试，第1题80人对，第2题70人对，第3题60人对。至少多少人三题全对？',options:['10人','20人','30人','40人'],answer:0},
    {question:'甲乙丙丁四人赛跑。甲说：我第一。乙说：我不是最后。丙说：我在甲后面。丁说：我不是第三。只有一人说谎。谁第一？',options:['甲','乙','丙','丁'],answer:1},
    {question:'五个海盗分100枚金币，从大到小提议，半数以上（含）通过则执行，否则提议者被扔下海。老大最多能拿多少？',options:['96枚','97枚','98枚','99枚'],answer:2},
    // 几何
    {question:'正十二边形的内角和是多少度？',options:['1800°','1440°','2160°','1080°'],answer:0},
    {question:'直角三角形斜边10，一条直角边6，内切圆半径？',options:['2','2.5','3','4'],answer:0},
    {question:'正方体棱长增加1倍，体积增加几倍？',options:['1倍','3倍','7倍','8倍'],answer:2},
    {question:'一个圆内接正方形面积为50，圆的面积约是多少？',options:['78.5','100','157','314'],answer:0},
    // 代数
    {question:'已知a+b=5，ab=6。a²+b²=？',options:['13','19','25','37'],answer:0},
    {question:'方程 x²-5x+6=0 两根之和与两根之积的和是多少？',options:['10','11','12','9'],answer:1},
    {question:'甲年龄2倍比乙大5岁，乙年龄3倍比丙大10岁，三人年龄和100。甲几岁？',options:['25岁','30岁','35岁','40岁'],answer:0},
    // 应用
    {question:'容积5升和3升的两个空桶，如何用最少步骤得到4升水？最少几步？',options:['4步','5步','6步','7步'],answer:2},
    {question:'小明上楼梯，每次跨1级或2级。上到第10级有几种不同走法？',options:['55种','89种','144种','100种'],answer:1},
    {question:'甲完成工作需要12天，乙需18天。甲先做3天后乙加入，还需几天完成？',options:['5天','6天','7天','8天'],answer:1},
    // 数论进阶
    {question:'三个连续自然数，最小的是a。三数之积除以3的余数是多少？',options:['0','1','2','不确定'],answer:0},
    {question:'3¹⁰⁰的个位数字是多少？',options:['1','3','7','9'],answer:0},
    {question:'一个质数p，p+10和p+14也都是质数。p最小是多少？',options:['2','3','5','7'],answer:1},
    // 概率与统计
    {question:'抛两枚硬币，一正一反的概率是多少？',options:['1/4','1/3','1/2','2/3'],answer:2},
    {question:'从1到10中任选两个不同的数，和为偶数的概率？',options:['4/9','1/2','5/9','2/3'],answer:0},
    // 杂题
    {question:'有10盒球排一排，每次选连续3盒各放1个球。能否使各盒球数相等？',options:['不可能','可以','取决于初始状态','需要恰好10次'],answer:2},
    {question:'一个数，除以3余2，除以5余3，除以7余2。这个数最小是？',options:['23','37','53','65'],answer:0},
    {question:'把2019表示为连续自然数之和，共有几种表示方法？',options:['3种','4种','5种','6种'],answer:1},
    {question:'666...666（100个6）除以7的余数是？',options:['0','2','4','6'],answer:1},
    {question:'一列数: 1,11,21,1211,111221,... 第六项的数字之和？',options:['8','10','12','6'],answer:0},
    {question:'在所有的三位数中，各位数字之和等于15的数有多少个？',options:['69个','73个','75个','77个'],answer:0},
  ],
};
