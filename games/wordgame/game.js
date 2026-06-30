// ===== 填字母 Fill Letters =====
GameRegistry.register({
  id: 'wordfill', name: '填字母', icon: '🔤',
  desc: '看中文，把不完整的英文单词补全！60秒限时挑战！',
  difficulties: [
    { id: 'easy', name: '小学', icon: '🌱', desc: '小学全阶段 ~650词' },
    { id: 'medium', name: '初中基础', icon: '🔥', desc: '七八年级 ~650词' },
    { id: 'hard', name: '中考核心', icon: '💀', desc: '九年级+中考 ~700词' },
  ],
  init(container, difficulty, onComplete) {
    const DURATION = 60, pool = WORDS[difficulty];
    let correct = 0, wrong = 0, timeLeft = DURATION, timer = null, currentQ = null;
    nextQuestion(); startTimer(); render();

    function nextQuestion() {
      const word = pool[Math.floor(Math.random() * pool.length)];
      const fullAnswer = word.en.split('/')[0].trim();
      currentQ = { word, answer: word.en, hint: maskWord(fullAnswer), fullAnswer };
    }
    function maskWord(w) {
      const chars = w.split(''), letterIdx = [];
      chars.forEach((ch, i) => { if (/[a-zA-Z]/.test(ch)) letterIdx.push(i); });
      const showCount = Math.max(1, Math.floor(letterIdx.length / 2));
      const show = new Set([...letterIdx].sort(() => Math.random() - 0.5).slice(0, showCount));
      return chars.map((ch, i) => {
        if (!/[a-zA-Z]/.test(ch)) return { ch, given: true, sep: true };
        return { ch: show.has(i) ? ch : '', given: show.has(i), sep: false };
      });
    }
    function startTimer() {
      timer = setInterval(() => {
        timeLeft--;
        const bar = document.getElementById('timerBar'), txt = document.getElementById('timerText');
        if (bar) bar.style.width = `${(timeLeft/DURATION)*100}%`;
        if (txt) txt.textContent = `${timeLeft}秒`;
        if (timeLeft <= 10 && bar) bar.style.background = '#ff4757';
        if (timeLeft <= 0) endGame();
      }, 1000);
    }
    function render() {
      const barColor = timeLeft > 10 ? 'var(--accent)' : '#ff4757';
      const cells = currentQ.hint, blankCount = cells.filter(c => !c.given).length;
      const cellHtml = cells.map((c, i) => {
        if (c.sep) return '<div style="width:14px;flex-shrink:0;"></div>';
        if (c.given) return `<div style="width:36px;height:44px;display:flex;align-items:center;justify-content:center;font-size:1.4em;font-weight:700;font-family:monospace;background:rgba(108,99,255,0.2);border-radius:6px;color:var(--accent);">${c.ch}</div>`;
        return '<input class="blank-cell" maxlength="1" autocomplete="off" style="width:36px;height:44px;text-align:center;font-size:1.4em;font-weight:700;font-family:monospace;border:2px solid var(--accent);border-radius:6px;background:var(--surface2);color:var(--text);outline:none;">';
      }).join('');
      container.innerHTML = `<div style="text-align:center;max-width:460px;width:100%;" class="animate-in">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <span style="color:#27ae60;font-weight:700;min-width:50px;">✅ ${correct}</span>
          <span style="flex:1;"><div style="height:6px;background:var(--surface2);border-radius:3px;overflow:hidden;"><div id="timerBar" style="height:100%;width:${(timeLeft/DURATION)*100}%;background:${barColor};border-radius:3px;transition:width 1s linear,background 0.3s;"></div></div></span>
          <span style="color:#ff4757;font-weight:700;min-width:50px;">❌ ${wrong}</span>
          <span id="timerText" style="font-weight:700;min-width:40px;">${timeLeft}秒</span>
        </div>
        <div style="font-size:2em;font-weight:700;margin:16px 0;padding:24px;background:var(--surface);border-radius:var(--radius);">${currentQ.word.cn}</div>
        <div style="display:flex;gap:6px;justify-content:center;align-items:center;flex-wrap:wrap;margin:16px 0;" id="cellRow">${cellHtml}</div>
        <div style="color:var(--text-dim);font-size:0.8em;margin-bottom:8px;">${blankCount}个空 · 填完自动验证 · 填错不扣分</div>
        <div style="display:flex;gap:8px;justify-content:center;">
          <button class="btn btn-secondary" id="btnSkip" disabled style="font-size:0.9em;">⏳ 跳过(3秒)</button>
          <button class="btn btn-primary" id="btnSubmit" style="font-size:1em;">✓ 确认</button>
        </div>
        <div id="quickFeedback" style="margin-top:10px;min-height:28px;font-weight:700;font-size:0.95em;"></div>
      </div>`;
      const blanks = container.querySelectorAll('.blank-cell');
      if (blanks.length > 0) blanks[0].focus();
      const btnSkip = document.getElementById('btnSkip');
      let skipCountdown = 3;
      const skipTimer = setInterval(() => {
        skipCountdown--;
        if (skipCountdown <= 0) { clearInterval(skipTimer); btnSkip.disabled = false; btnSkip.textContent = '⏭ 跳过(算错)'; }
        else btnSkip.textContent = `⏳ 跳过(${skipCountdown}秒)`;
      }, 1000);
      btnSkip.onclick = () => { clearInterval(skipTimer); handleSkip(); };
      const prevCleanup = container._cleanup;
      container._cleanup = () => { clearInterval(skipTimer); if (prevCleanup) prevCleanup(); };
      function allFilled() { return Array.from(container.querySelectorAll('.blank-cell')).every(b => b.value.trim()); }
      function findNextBlank(el) { let s = el.nextElementSibling; while (s) { if (s.classList.contains('blank-cell')) return s; s = s.nextElementSibling; } return null; }
      function findPrevBlank(el) { let s = el.previousElementSibling; while (s) { if (s.classList.contains('blank-cell')) return s; s = s.previousElementSibling; } return null; }

      container.querySelector('#cellRow').oninput = (e) => {
        const inp = e.target;
        if (!inp.classList.contains('blank-cell')) return;
        if (inp.value.length > 1) inp.value = inp.value[inp.value.length - 1];
        if (inp.value) { const next = findNextBlank(inp); if (next) next.focus(); else if (allFilled()) handleSpell(true); }
      };
      container.querySelector('#cellRow').onkeydown = (e) => {
        const inp = e.target;
        if (!inp.classList.contains('blank-cell')) return;
        if (e.key === 'Backspace' && !inp.value) { e.preventDefault(); const prev = findPrevBlank(inp); if (prev) { prev.focus(); prev.value = ''; } }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); const prev = findPrevBlank(inp); if (prev) prev.focus(); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); const next = findNextBlank(inp); if (next) next.focus(); }
        else if (e.key === 'Enter') handleSpell(false);
      };
      document.getElementById('btnSubmit').onclick = () => handleSpell(false);
    }
    function handleSpell(autoMode) {
      if (timeLeft <= 0) return;
      const cells = currentQ.hint, blanks = container.querySelectorAll('.blank-cell');
      let bi = 0;
      const result = cells.map(c => { if (c.sep) return c.ch; if (c.given) return c.ch; const val = blanks[bi] ? blanks[bi].value.toLowerCase().trim() : ''; bi++; return val || '?'; }).join('');
      const expected = currentQ.answer, a = result.toLowerCase().trim(), b = expected.toLowerCase().trim();
      const isCorrect = a === b || (b.includes('/') && b.split('/').map(s => s.trim()).includes(a));
      if (isCorrect) { correct++; showMsg('✅ 正确！', '#27ae60'); nextQuestion(); render(); }
      else if (autoMode) { const bs = container.querySelectorAll('.blank-cell'); bs.forEach(x => x.value = ''); if (bs.length > 0) bs[0].focus(); showMsg('🔄 不对哦，再试一次～', '#ffa502'); }
      else { wrong++; showMsg('❌ 正确答案: <b>'+expected+'</b>', '#ff4757'); nextQuestion(); render(); }
    }
    function handleSkip() { if (timeLeft <= 0) return; wrong++; showMsg('❌ 正确答案: <b>'+currentQ.answer+'</b>', '#ff4757'); nextQuestion(); render(); }
    function showMsg(msg, color) { document.getElementById('quickFeedback').innerHTML = '<span style="color:'+color+';">'+msg+'</span>'; }
    function endGame() { clearInterval(timer); finish(); }
    function finish() {
      const total = correct + wrong, rate = total > 0 ? Math.round(correct / total * 100) : 0;
      const star = correct >= 30 ? '⭐⭐⭐⭐⭐' : correct >= 20 ? '⭐⭐⭐⭐' : correct >= 10 ? '⭐⭐⭐' : correct >= 5 ? '⭐⭐' : '⭐';
      container.innerHTML = '<div class="result-card animate-in"><div class="result-icon">'+(correct>=25?'🏆':correct>=15?'🎉':correct>=8?'👍':'📚')+'</div><div class="result-title">'+(correct>=25?'单词达人！':correct>=15?'非常棒！':'继续加油！')+'</div><div class="result-detail">60秒内答对 <b style="color:#27ae60;font-size:1.3em;">'+correct+'</b> 题<br>答错 <span style="color:#ff4757;">'+wrong+'</span> 题 | 正确率 <b>'+rate+'%</b><br>'+star+'</div></div>';
      setTimeout(() => onComplete({ win: correct >= 8, score: Math.max(0, 100 - correct), title: correct >= 25 ? '单词达人！' : '挑战完成！', detail: '60秒答对 '+correct+' 题，正确率 '+rate+'%' }), 1500);
    }
  }
});

// ===== 选意思 Pick Meaning =====
GameRegistry.register({
  id: 'wordpick', name: '选意思', icon: '📝',
  desc: '看英文单词，选出正确的中文意思！60秒限时！',
  difficulties: [
    { id: 'easy', name: '小学', icon: '🌱', desc: '小学全阶段 ~650词' },
    { id: 'medium', name: '初中基础', icon: '🔥', desc: '七八年级 ~650词' },
    { id: 'hard', name: '中考核心', icon: '💀', desc: '九年级+中考 ~700词' },
  ],
  init(container, difficulty, onComplete) {
    const DURATION = 60, pool = WORDS[difficulty];
    let correct = 0, wrong = 0, timeLeft = DURATION, timer = null, currentQ = null;
    nextQuestion(); startTimer(); render();

    function nextQuestion() {
      const word = pool[Math.floor(Math.random() * pool.length)];
      const others = pool.filter(w => w.cn !== word.cn).sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.cn);
      currentQ = { word, options: [...others, word.cn].sort(() => Math.random() - 0.5), answer: word.cn };
    }
    function startTimer() {
      timer = setInterval(() => {
        timeLeft--;
        const bar = document.getElementById('timerBar'), txt = document.getElementById('timerText');
        if (bar) bar.style.width = `${(timeLeft/DURATION)*100}%`;
        if (txt) txt.textContent = `${timeLeft}秒`;
        if (timeLeft <= 10 && bar) bar.style.background = '#ff4757';
        if (timeLeft <= 0) endGame();
      }, 1000);
    }
    function render() {
      const barColor = timeLeft > 10 ? 'var(--accent)' : '#ff4757';
      container.innerHTML = `<div style="text-align:center;max-width:460px;width:100%;" class="animate-in">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <span style="color:#27ae60;font-weight:700;min-width:50px;">✅ ${correct}</span>
          <span style="flex:1;"><div style="height:6px;background:var(--surface2);border-radius:3px;overflow:hidden;"><div id="timerBar" style="height:100%;width:${(timeLeft/DURATION)*100}%;background:${barColor};border-radius:3px;transition:width 1s linear,background 0.3s;"></div></div></span>
          <span style="color:#ff4757;font-weight:700;min-width:50px;">❌ ${wrong}</span>
          <span id="timerText" style="font-weight:700;min-width:40px;">${timeLeft}秒</span>
        </div>
        <div style="font-size:2em;font-weight:700;margin:16px 0;padding:24px;background:var(--surface);border-radius:var(--radius);">${currentQ.word.en}</div>
        <div style="color:var(--text-dim);font-size:0.85em;margin-bottom:12px;">选择正确的中文意思 →</div>
        <div class="flex-col" id="optionsContainer">${currentQ.options.map((opt, i) => '<button class="btn btn-secondary" data-idx="'+i+'" style="text-align:left;width:100%;font-size:1.05em;">'+String.fromCharCode(65+i)+'. '+opt+'</button>').join('')}</div>
        <div id="quickFeedback" style="margin-top:10px;min-height:28px;font-weight:700;font-size:0.95em;"></div>
      </div>`;
      document.getElementById('optionsContainer').onclick = (e) => {
        const btn = e.target.closest('[data-idx]');
        if (!btn || timeLeft <= 0) return;
        const isCorrect = currentQ.options[+btn.dataset.idx] === currentQ.answer;
        if (isCorrect) correct++; else wrong++;
        document.getElementById('quickFeedback').innerHTML = isCorrect ? '<span style="color:#27ae60;" class="pop">✅ 正确！</span>' : '<span style="color:#ff4757;">❌ 正确答案: <b>'+currentQ.answer+'</b></span>';
        nextQuestion(); render();
      };
    }
    function endGame() { clearInterval(timer); finish(); }
    function finish() {
      const total = correct + wrong, rate = total > 0 ? Math.round(correct / total * 100) : 0;
      container.innerHTML = '<div class="result-card animate-in"><div class="result-icon">'+(correct>=25?'🏆':correct>=15?'🎉':correct>=8?'👍':'📚')+'</div><div class="result-title">'+(correct>=25?'单词达人！':correct>=15?'非常棒！':'继续加油！')+'</div><div class="result-detail">60秒内答对 <b style="color:#27ae60;font-size:1.3em;">'+correct+'</b> 题<br>答错 <span style="color:#ff4757;">'+wrong+'</span> 题 | 正确率 <b>'+rate+'%</b><br></div></div>';
      setTimeout(() => onComplete({ win: correct >= 8, score: Math.max(0, 100 - correct), title: correct >= 25 ? '单词达人！' : '挑战完成！', detail: '60秒答对 '+correct+' 题，正确率 '+rate+'%' }), 1500);
    }
  }
});

// ===== 单词学习（闪卡+间隔复习）=====
GameRegistry.register({
  id: 'wordstudy',
  name: '单词学习',
  icon: '📚',
  desc: '每日闪卡学习+科学间隔复习，稳步积累词汇量！',
  difficulties: [
    { id: 'easy', name: '小学', icon: '🌱', desc: '小学全阶段 ~460词' },
    { id: 'medium', name: '初中基础', icon: '🔥', desc: '七八年级 ~460词' },
    { id: 'hard', name: '中考核心', icon: '💀', desc: '九年级+中考 ~460词' },
  ],

  init(container, difficulty, onComplete) {
    const pool = WORDS[difficulty];
    const STORAGE_KEY = 'cg_study_' + difficulty;
    const SETTINGS_KEY = 'cg_study_settings';
    let settings = loadSettings();
    let progress = loadProgress();
    let sessionWords = [];
    let sessionIndex = 0;
    let displayTimer = null;

    function loadSettings() {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? JSON.parse(raw) : { dailyNew: 50, maxReview: 50, secondsPerWord: 10 };
    }
    function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
    function loadProgress() {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    }
    function saveProgress() { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }

    // 间隔复习算法：level 0=新词,1=1天后,2=3天后,3=7天后,4=30天后,5=已掌握
    function getNextInterval(level) { return [1, 1, 3, 7, 30, 9999][level] || 1; }
    function getToday() { return new Date().toISOString().slice(0, 10); }

    // 收集今日需要复习的词 + 新词
    function buildSession() {
      const today = getToday();
      const reviewWords = [];
      const newWords = [];
      const mastered = new Set();

      pool.forEach((w, i) => {
        const key = 'w' + i;
        const p = progress[key];
        if (p && p.level >= 5) { mastered.add(i); return; }
        if (p && p.reviewAt && p.reviewAt <= today) {
          reviewWords.push({ ...w, idx: i, isReview: true });
        } else if (!p) {
          newWords.push({ ...w, idx: i, isReview: false });
        }
      });

      // 随机打乱，限制数量
      const shuffledReview = reviewWords.sort(() => Math.random() - 0.5).slice(0, settings.maxReview);
      const shuffledNew = newWords.sort(() => Math.random() - 0.5).slice(0, settings.dailyNew);

      return { review: shuffledReview, new: shuffledNew, totalLearned: pool.length - newWords.length - mastered.size, mastered: mastered.size };
    }

    showOverview();

    function showOverview() {
      const today = getToday();
      const dueReview = Object.values(progress).filter(p => p.reviewAt && p.reviewAt <= today && p.level < 5).length;
      const learned = Object.keys(progress).filter(k => progress[k].level > 0).length;
      const mastered = Object.values(progress).filter(p => p.level >= 5).length;

      container.innerHTML = `<div style="max-width:460px;width:100%;" class="animate-in">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:3em;margin-bottom:8px;">📚</div>
          <div style="font-size:1.3em;font-weight:700;">单词学习中心</div>
          <div style="color:var(--text-dim);font-size:0.9em;">科学间隔复习 · 稳步积累</div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
          <div style="background:var(--surface);padding:16px;border-radius:var(--radius);text-align:center;">
            <div style="font-size:1.8em;color:var(--accent);font-weight:700;">${learned}</div>
            <div style="font-size:0.8em;color:var(--text-dim);">已学习</div>
          </div>
          <div style="background:var(--surface);padding:16px;border-radius:var(--radius);text-align:center;">
            <div style="font-size:1.8em;color:#27ae60;font-weight:700;">${mastered}</div>
            <div style="font-size:0.8em;color:var(--text-dim);">已掌握</div>
          </div>
          <div style="background:var(--surface);padding:16px;border-radius:var(--radius);text-align:center;">
            <div style="font-size:1.8em;color:#ffa502;font-weight:700;">${dueReview}</div>
            <div style="font-size:0.8em;color:var(--text-dim);">待复习</div>
          </div>
          <div style="background:var(--surface);padding:16px;border-radius:var(--radius);text-align:center;">
            <div style="font-size:1.8em;color:var(--text-dim);font-weight:700;">${pool.length - learned}</div>
            <div style="font-size:0.8em;color:var(--text-dim);">未学习</div>
          </div>
        </div>

        <div style="background:var(--surface);padding:16px;border-radius:var(--radius);margin-bottom:16px;">
          <div style="font-weight:700;margin-bottom:12px;">⚙️ 学习计划</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.9em;">
            <div>每日新词: <b id="setNew">${settings.dailyNew}</b>个 <input type="range" id="rangeNew" min="5" max="100" value="${settings.dailyNew}" style="width:80px;vertical-align:middle;"></div>
            <div>最大复习: <b id="setReview">${settings.maxReview}</b>个 <input type="range" id="rangeReview" min="10" max="100" value="${settings.maxReview}" style="width:80px;vertical-align:middle;"></div>
            <div>展示时间: <b id="setSec">${settings.secondsPerWord}</b>秒 <input type="range" id="rangeSec" min="2" max="20" value="${settings.secondsPerWord}" style="width:80px;vertical-align:middle;"></div>
          </div>
        </div>

        <button class="btn btn-primary btn-block" id="btnStartStudy">▶ 开始学习</button>
        <div style="text-align:center;margin-top:8px;">
          <button class="btn btn-secondary" id="btnResetProgress" style="font-size:0.8em;">🗑 重置学习进度</button>
        </div>
      </div>`;

      ['rangeNew','rangeReview','rangeSec'].forEach(id => {
        document.getElementById(id).oninput = function() {
          const field = id === 'rangeNew' ? 'dailyNew' : id === 'rangeReview' ? 'maxReview' : 'secondsPerWord';
          settings[field] = +this.value;
          saveSettings();
          document.getElementById(id === 'rangeNew' ? 'setNew' : id === 'rangeReview' ? 'setReview' : 'setSec').textContent = this.value;
        };
      });

      document.getElementById('btnStartStudy').onclick = () => {
        const session = buildSession();
        sessionWords = [...session.review, ...session.new];
        if (!sessionWords.length) {
          alert('今天没有需要学习的单词啦！🎉\n所有单词都已掌握或等待复习中。');
          return;
        }
        sessionIndex = 0;
        showWord();
      };

      document.getElementById('btnResetProgress').onclick = () => {
        if (confirm('确定要重置所有学习进度吗？此操作不可恢复。')) {
          localStorage.removeItem(STORAGE_KEY);
          progress = {};
          showOverview();
        }
      };
    }

    function showWord() {
      if (sessionIndex >= sessionWords.length) {
        sessionComplete();
        return;
      }

      const sw = sessionWords[sessionIndex];
      const isReview = sw.isReview;
      const label = isReview ? '🔄 复习' : '🆕 新词';
      const color = isReview ? '#ffa502' : 'var(--accent)';
      let timeLeft = settings.secondsPerWord;

      container.innerHTML = `<div style="text-align:center;max-width:460px;width:100%;" class="animate-in">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="color:${color};font-weight:700;font-size:0.85em;">${label}</span>
          <span style="color:var(--text-dim);font-size:0.85em;">${sessionIndex + 1} / ${sessionWords.length}</span>
        </div>
        <div style="height:4px;background:var(--surface2);border-radius:2px;overflow:hidden;margin-bottom:20px;">
          <div id="wordTimerBar" style="height:100%;width:100%;background:${color};border-radius:2px;transition:width 1s linear;"></div>
        </div>
        <div style="font-size:2.5em;font-weight:700;margin:16px 0;padding:24px;background:var(--surface);border-radius:var(--radius);">${sw.en}</div>
        <div style="font-size:1.4em;color:var(--accent);margin-bottom:20px;font-weight:600;">${sw.cn}</div>
        <div id="studyActions" style="display:flex;gap:10px;justify-content:center;">
          <button class="btn btn-primary" id="btnKnow" style="flex:1;">✅ 认识</button>
          <button class="btn btn-secondary" id="btnDunno" style="flex:1;">❌ 不认识</button>
        </div>
        <div style="color:var(--text-dim);font-size:0.75em;margin-top:12px;">${timeLeft}秒后自动跳过</div>
      </div>`;

      // 倒计时
      const bar = document.getElementById('wordTimerBar');
      displayTimer = setInterval(() => {
        timeLeft--;
        bar.style.width = `${(timeLeft/settings.secondsPerWord)*100}%`;
        if (timeLeft <= 0) {
          clearInterval(displayTimer);
          markWord(1); // 超时算"不认识"
        }
      }, 1000);

      document.getElementById('btnKnow').onclick = () => {
        clearInterval(displayTimer);
        markWord(2); // 认识：升级
      };
      document.getElementById('btnDunno').onclick = () => {
        clearInterval(displayTimer);
        markWord(1); // 不认识：重置
      };
    }

    function markWord(result) {
      // result: 1=不认识/超时, 2=认识
      const sw = sessionWords[sessionIndex];
      const key = 'w' + sw.idx;
      const old = progress[key] || { level: 0, reviewCount: 0 };
      let newLevel;

      if (result === 2) {
        newLevel = Math.min(old.level + 1, 5);
      } else {
        newLevel = Math.max(old.level - 1, 0);
      }

      const interval = getNextInterval(newLevel);
      const today = getToday();
      const reviewAt = new Date();
      reviewAt.setDate(reviewAt.getDate() + interval);

      progress[key] = {
        level: newLevel,
        learnedAt: old.learnedAt || today,
        reviewAt: reviewAt.toISOString().slice(0, 10),
        reviewCount: old.reviewCount + 1,
      };
      saveProgress();

      sessionIndex++;
      showWord();
    }

    function sessionComplete() {
      const today = getToday();
      const learned = Object.keys(progress).filter(k => progress[k].level > 0).length;
      const mastered = Object.values(progress).filter(p => p.level >= 5).length;
      const dueTomorrow = Object.values(progress).filter(p => p.reviewAt && p.reviewAt <= new Date(Date.now()+86400000).toISOString().slice(0,10) && p.level < 5).length;

      container.innerHTML = `<div class="result-card animate-in">
        <div class="result-icon">🎉</div>
        <div class="result-title">今日学习完成！</div>
        <div class="result-detail">
          本次学习 <b>${sessionWords.length}</b> 个单词<br>
          累计学习 <b style="color:var(--accent);">${learned}</b> 个 |
          已掌握 <b style="color:#27ae60;">${mastered}</b> 个<br>
          明天预计复习 <b style="color:#ffa502;">${dueTomorrow}</b> 个
        </div>
        <div class="flex-center mt-16">
          <button class="btn btn-primary" onclick="startGame('wordstudy','${difficulty}')">📚 查看进度</button>
        </div>
      </div>`;
      onComplete({ win: true, score: sessionWords.length, title: '学习完成！', detail: `学习了 ${sessionWords.length} 个单词` });
    }
  }
});

// ===== 共享词库（~2000词）=====
const WORDS = {
  // ---- 小学全阶段 ----
  easy: [
    // 数字
    {cn:'一',en:'one'},{cn:'二',en:'two'},{cn:'三',en:'three'},{cn:'四',en:'four'},{cn:'五',en:'five'},{cn:'六',en:'six'},{cn:'七',en:'seven'},{cn:'八',en:'eight'},{cn:'九',en:'nine'},{cn:'十',en:'ten'},{cn:'十一',en:'eleven'},{cn:'十二',en:'twelve'},{cn:'十三',en:'thirteen'},{cn:'十五',en:'fifteen'},{cn:'二十',en:'twenty'},{cn:'三十',en:'thirty'},{cn:'四十',en:'forty'},{cn:'五十',en:'fifty'},{cn:'百',en:'hundred'},{cn:'第一',en:'first'},{cn:'第二',en:'second'},{cn:'第三',en:'third'},
    // 颜色
    {cn:'红色',en:'red'},{cn:'蓝色',en:'blue'},{cn:'绿色',en:'green'},{cn:'黄色',en:'yellow'},{cn:'白色',en:'white'},{cn:'黑色',en:'black'},{cn:'粉色',en:'pink'},{cn:'紫色',en:'purple'},{cn:'橙色',en:'orange'},{cn:'灰色',en:'gray/grey'},{cn:'棕色',en:'brown'},{cn:'金色',en:'gold'},{cn:'银色',en:'silver'},
    // 星期月份
    {cn:'星期一',en:'Monday'},{cn:'星期二',en:'Tuesday'},{cn:'星期三',en:'Wednesday'},{cn:'星期四',en:'Thursday'},{cn:'星期五',en:'Friday'},{cn:'星期六',en:'Saturday'},{cn:'星期日',en:'Sunday'},{cn:'一月',en:'January'},{cn:'二月',en:'February'},{cn:'三月',en:'March'},{cn:'四月',en:'April'},{cn:'五月',en:'May'},{cn:'六月',en:'June'},{cn:'七月',en:'July'},{cn:'八月',en:'August'},{cn:'九月',en:'September'},{cn:'十月',en:'October'},{cn:'十一月',en:'November'},{cn:'十二月',en:'December'},
    // 家庭
    {cn:'妈妈',en:'mother/mom'},{cn:'爸爸',en:'father/dad'},{cn:'兄弟',en:'brother'},{cn:'姐妹',en:'sister'},{cn:'爷爷',en:'grandfather/grandpa'},{cn:'奶奶',en:'grandmother/grandma'},{cn:'叔叔',en:'uncle'},{cn:'阿姨',en:'aunt'},{cn:'家庭',en:'family'},{cn:'父母',en:'parent'},{cn:'儿子',en:'son'},{cn:'女儿',en:'daughter'},{cn:'堂兄弟',en:'cousin'},{cn:'婴儿',en:'baby'},{cn:'孩子',en:'child/kid'},{cn:'丈夫',en:'husband'},{cn:'妻子',en:'wife'},
    // 身体
    {cn:'头',en:'head'},{cn:'眼睛',en:'eye'},{cn:'耳朵',en:'ear'},{cn:'鼻子',en:'nose'},{cn:'嘴巴',en:'mouth'},{cn:'脸',en:'face'},{cn:'手',en:'hand'},{cn:'脚',en:'foot'},{cn:'腿',en:'leg'},{cn:'胳膊',en:'arm'},{cn:'头发',en:'hair'},{cn:'牙齿',en:'tooth/teeth'},{cn:'手指',en:'finger'},{cn:'脚趾',en:'toe'},{cn:'膝盖',en:'knee'},{cn:'肩膀',en:'shoulder'},{cn:'脖子',en:'neck'},{cn:'背部',en:'back'},{cn:'肚子',en:'stomach'},{cn:'舌头',en:'tongue'},{cn:'皮肤',en:'skin'},{cn:'心脏',en:'heart'},
    // 动物
    {cn:'猫',en:'cat'},{cn:'狗',en:'dog'},{cn:'鸟',en:'bird'},{cn:'鱼',en:'fish'},{cn:'马',en:'horse'},{cn:'猪',en:'pig'},{cn:'牛',en:'cow'},{cn:'羊',en:'sheep'},{cn:'鸡',en:'chicken'},{cn:'鸭',en:'duck'},{cn:'兔子',en:'rabbit'},{cn:'猴子',en:'monkey'},{cn:'老虎',en:'tiger'},{cn:'狮子',en:'lion'},{cn:'大象',en:'elephant'},{cn:'熊猫',en:'panda'},{cn:'蛇',en:'snake'},{cn:'老鼠',en:'mouse'},{cn:'熊',en:'bear'},{cn:'青蛙',en:'frog'},{cn:'狼',en:'wolf'},{cn:'狐狸',en:'fox'},{cn:'鹿',en:'deer'},{cn:'骆驼',en:'camel'},{cn:'海豚',en:'dolphin'},{cn:'鲸鱼',en:'whale'},{cn:'鲨鱼',en:'shark'},{cn:'乌龟',en:'turtle'},{cn:'螃蟹',en:'crab'},{cn:'蝴蝶',en:'butterfly'},{cn:'蜜蜂',en:'bee'},{cn:'蚂蚁',en:'ant'},{cn:'蜘蛛',en:'spider'},{cn:'老鹰',en:'eagle'},{cn:'猫头鹰',en:'owl'},{cn:'鹦鹉',en:'parrot'},{cn:'企鹅',en:'penguin'},{cn:'天鹅',en:'swan'},{cn:'鹅',en:'goose/geese'},{cn:'长颈鹿',en:'giraffe'},{cn:'斑马',en:'zebra'},{cn:'袋鼠',en:'kangaroo'},{cn:'鳄鱼',en:'crocodile'},
    // 食物
    {cn:'苹果',en:'apple'},{cn:'香蕉',en:'banana'},{cn:'橙子',en:'orange'},{cn:'葡萄',en:'grape'},{cn:'西瓜',en:'watermelon'},{cn:'草莓',en:'strawberry'},{cn:'桃子',en:'peach'},{cn:'梨',en:'pear'},{cn:'樱桃',en:'cherry'},{cn:'芒果',en:'mango'},{cn:'菠萝',en:'pineapple'},{cn:'柠檬',en:'lemon'},{cn:'米饭',en:'rice'},{cn:'面条',en:'noodle'},{cn:'面包',en:'bread'},{cn:'蛋糕',en:'cake'},{cn:'鸡蛋',en:'egg'},{cn:'牛奶',en:'milk'},{cn:'水',en:'water'},{cn:'果汁',en:'juice'},{cn:'茶',en:'tea'},{cn:'咖啡',en:'coffee'},{cn:'鸡肉',en:'chicken'},{cn:'牛肉',en:'beef'},{cn:'猪肉',en:'pork'},{cn:'鱼',en:'fish'},{cn:'蔬菜',en:'vegetable'},{cn:'水果',en:'fruit'},{cn:'糖果',en:'candy'},{cn:'土豆',en:'potato'},{cn:'番茄',en:'tomato'},{cn:'胡萝卜',en:'carrot'},{cn:'洋葱',en:'onion'},{cn:'黄瓜',en:'cucumber'},{cn:'玉米',en:'corn'},{cn:'豆子',en:'bean'},{cn:'豌豆',en:'pea'},{cn:'香肠',en:'sausage'},{cn:'奶酪',en:'cheese'},{cn:'黄油',en:'butter'},{cn:'果酱',en:'jam'},{cn:'盐',en:'salt'},{cn:'糖',en:'sugar'},{cn:'汤',en:'soup'},{cn:'沙拉',en:'salad'},{cn:'披萨',en:'pizza'},{cn:'汉堡',en:'hamburger'},{cn:'三明治',en:'sandwich'},{cn:'饼干',en:'cookie/biscuit'},{cn:'巧克力',en:'chocolate'},{cn:'冰淇淋',en:'ice cream'},
    // 饮料零食
    {cn:'可乐',en:'cola'},{cn:'汽水',en:'soda'},{cn:'酸奶',en:'yogurt'},{cn:'爆米花',en:'popcorn'},{cn:'薯片',en:'chips'},{cn:'坚果',en:'nut'},
    // 学校
    {cn:'学校',en:'school'},{cn:'老师',en:'teacher'},{cn:'学生',en:'student'},{cn:'教室',en:'classroom'},{cn:'书',en:'book'},{cn:'笔',en:'pen'},{cn:'铅笔',en:'pencil'},{cn:'尺子',en:'ruler'},{cn:'橡皮',en:'eraser'},{cn:'书包',en:'schoolbag'},{cn:'桌子',en:'desk'},{cn:'椅子',en:'chair'},{cn:'黑板',en:'blackboard'},{cn:'作业',en:'homework'},{cn:'考试',en:'exam/test'},{cn:'同学',en:'classmate'},{cn:'班级',en:'class'},{cn:'操场',en:'playground'},{cn:'笔记本',en:'notebook'},{cn:'课本',en:'textbook'},{cn:'课程',en:'lesson'},{cn:'年级',en:'grade'},{cn:'图书馆',en:'library'},{cn:'校长',en:'principal'},{cn:'办公室',en:'office'},
    // 衣服
    {cn:'衬衫',en:'shirt'},{cn:'裙子',en:'skirt'},{cn:'裤子',en:'pants/trousers'},{cn:'鞋子',en:'shoe'},{cn:'帽子',en:'hat/cap'},{cn:'外套',en:'coat'},{cn:'袜子',en:'sock'},{cn:'毛衣',en:'sweater'},{cn:'连衣裙',en:'dress'},{cn:'夹克',en:'jacket'},{cn:'短裤',en:'shorts'},{cn:'牛仔裤',en:'jeans'},{cn:'围巾',en:'scarf'},{cn:'手套',en:'glove'},{cn:'腰带',en:'belt'},{cn:'口袋',en:'pocket'},{cn:'纽扣',en:'button'},{cn:'T恤',en:'T-shirt'},{cn:'运动鞋',en:'sneaker'},{cn:'靴子',en:'boot'},
    // 地点
    {cn:'家',en:'home'},{cn:'公园',en:'park'},{cn:'医院',en:'hospital'},{cn:'商店',en:'shop/store'},{cn:'动物园',en:'zoo'},{cn:'超市',en:'supermarket'},{cn:'电影院',en:'cinema'},{cn:'银行',en:'bank'},{cn:'邮局',en:'post office'},{cn:'餐厅',en:'restaurant'},{cn:'博物馆',en:'museum'},{cn:'机场',en:'airport'},{cn:'车站',en:'station'},{cn:'桥',en:'bridge'},{cn:'街道',en:'street'},{cn:'路',en:'road'},{cn:'农场',en:'farm'},{cn:'村庄',en:'village'},{cn:'城镇',en:'town'},{cn:'旅馆',en:'hotel'},{cn:'教堂',en:'church'},
    // 交通
    {cn:'汽车',en:'car'},{cn:'公共汽车',en:'bus'},{cn:'自行车',en:'bike/bicycle'},{cn:'火车',en:'train'},{cn:'飞机',en:'plane/airplane'},{cn:'船',en:'boat/ship'},{cn:'出租车',en:'taxi'},{cn:'地铁',en:'subway'},{cn:'摩托车',en:'motorcycle'},{cn:'卡车',en:'truck'},{cn:'直升飞机',en:'helicopter'},
    // 时间
    {cn:'早上',en:'morning'},{cn:'下午',en:'afternoon'},{cn:'晚上',en:'evening'},{cn:'夜晚',en:'night'},{cn:'今天',en:'today'},{cn:'明天',en:'tomorrow'},{cn:'昨天',en:'yesterday'},{cn:'星期',en:'week'},{cn:'月份',en:'month'},{cn:'年',en:'year'},{cn:'小时',en:'hour'},{cn:'分钟',en:'minute'},{cn:'秒钟',en:'second'},{cn:'中午',en:'noon'},{cn:'午夜',en:'midnight'},
    // 天气季节
    {cn:'春天',en:'spring'},{cn:'夏天',en:'summer'},{cn:'秋天',en:'autumn/fall'},{cn:'冬天',en:'winter'},{cn:'天气',en:'weather'},{cn:'太阳',en:'sun'},{cn:'月亮',en:'moon'},{cn:'星星',en:'star'},{cn:'雨',en:'rain'},{cn:'雪',en:'snow'},{cn:'风',en:'wind'},{cn:'云',en:'cloud'},{cn:'彩虹',en:'rainbow'},{cn:'暴风雨',en:'storm'},{cn:'闪电',en:'lightning'},{cn:'台风',en:'typhoon'},{cn:'地震',en:'earthquake'},
    // 自然界
    {cn:'花',en:'flower'},{cn:'树',en:'tree'},{cn:'草',en:'grass'},{cn:'河',en:'river'},{cn:'山',en:'mountain'},{cn:'海',en:'sea'},{cn:'天空',en:'sky'},{cn:'地球',en:'earth'},{cn:'森林',en:'forest'},{cn:'海洋',en:'ocean'},{cn:'湖泊',en:'lake'},{cn:'岛屿',en:'island'},{cn:'沙漠',en:'desert'},{cn:'石头',en:'stone/rock'},{cn:'沙子',en:'sand'},{cn:'火',en:'fire'},{cn:'冰',en:'ice'},{cn:'空气',en:'air'},{cn:'植物',en:'plant'},{cn:'叶子',en:'leaf/leaves'},
    // 形状
    {cn:'圆形',en:'circle'},{cn:'正方形',en:'square'},{cn:'三角形',en:'triangle'},{cn:'长方形',en:'rectangle'},{cn:'星星',en:'star'},
    // 形容词
    {cn:'大',en:'big'},{cn:'小',en:'small'},{cn:'长',en:'long'},{cn:'短',en:'short'},{cn:'高',en:'tall/high'},{cn:'矮',en:'short'},{cn:'快',en:'fast'},{cn:'慢',en:'slow'},{cn:'新',en:'new'},{cn:'旧',en:'old'},{cn:'快乐',en:'happy'},{cn:'伤心',en:'sad'},{cn:'生气',en:'angry'},{cn:'累',en:'tired'},{cn:'饿',en:'hungry'},{cn:'渴',en:'thirsty'},{cn:'热',en:'hot'},{cn:'冷',en:'cold'},{cn:'暖和',en:'warm'},{cn:'凉快',en:'cool'},{cn:'好',en:'good'},{cn:'坏',en:'bad'},{cn:'美丽',en:'beautiful'},{cn:'可爱',en:'cute/lovely'},{cn:'聪明',en:'clever/smart'},{cn:'有趣',en:'interesting/fun'},{cn:'忙',en:'busy'},{cn:'干净',en:'clean'},{cn:'脏',en:'dirty'},{cn:'强壮',en:'strong'},{cn:'弱',en:'weak'},{cn:'胖',en:'fat'},{cn:'瘦',en:'thin'},{cn:'湿',en:'wet'},{cn:'干',en:'dry'},{cn:'软',en:'soft'},{cn:'硬',en:'hard'},{cn:'轻',en:'light'},{cn:'重',en:'heavy'},{cn:'暗',en:'dark'},{cn:'亮',en:'bright'},{cn:'吵闹',en:'noisy'},{cn:'安静',en:'quiet'},{cn:'对',en:'right/correct'},{cn:'错',en:'wrong'},{cn:'容易',en:'easy'},{cn:'困难',en:'difficult/hard'},{cn:'便宜',en:'cheap'},{cn:'昂贵',en:'expensive'},{cn:'满',en:'full'},{cn:'空',en:'empty'},{cn:'开',en:'open'},{cn:'关',en:'closed'},{cn:'年轻',en:'young'},{cn:'老',en:'old'},
    // 动词
    {cn:'跑',en:'run'},{cn:'走',en:'walk'},{cn:'跳',en:'jump'},{cn:'游泳',en:'swim'},{cn:'飞',en:'fly'},{cn:'吃',en:'eat'},{cn:'喝',en:'drink'},{cn:'睡觉',en:'sleep'},{cn:'看',en:'look/see/watch'},{cn:'听',en:'listen/hear'},{cn:'说',en:'say/speak'},{cn:'读',en:'read'},{cn:'写',en:'write'},{cn:'画',en:'draw'},{cn:'唱歌',en:'sing'},{cn:'跳舞',en:'dance'},{cn:'玩',en:'play'},{cn:'学习',en:'study/learn'},{cn:'做',en:'do/make'},{cn:'买',en:'buy'},{cn:'卖',en:'sell'},{cn:'开',en:'open'},{cn:'关',en:'close/shut'},{cn:'给',en:'give'},{cn:'拿',en:'take'},{cn:'喜欢',en:'like/love'},{cn:'爱',en:'love'},{cn:'恨',en:'hate'},{cn:'帮助',en:'help'},{cn:'洗',en:'wash'},{cn:'穿',en:'wear'},{cn:'烹饪',en:'cook'},{cn:'打扫',en:'clean'},{cn:'切',en:'cut'},{cn:'扔',en:'throw'},{cn:'接住',en:'catch'},{cn:'踢',en:'kick'},{cn:'坐',en:'sit'},{cn:'站',en:'stand'},{cn:'微笑',en:'smile'},{cn:'哭',en:'cry'},{cn:'笑',en:'laugh'},{cn:'思考',en:'think'},{cn:'知道',en:'know'},{cn:'忘记',en:'forget'},{cn:'记得',en:'remember'},{cn:'开始',en:'start/begin'},{cn:'停止',en:'stop'},{cn:'带来',en:'bring'},{cn:'找到',en:'find'},{cn:'放',en:'put'},{cn:'告诉',en:'tell'},{cn:'问',en:'ask'},{cn:'回答',en:'answer'},{cn:'工作',en:'work'},{cn:'休息',en:'rest'},{cn:'住',en:'live'},{cn:'等',en:'wait'},{cn:'遇见',en:'meet'},{cn:'感觉',en:'feel'},{cn:'变成',en:'become'},{cn:'需要',en:'need'},{cn:'想要',en:'want'},
    // 家居物品
    {cn:'桌子',en:'table'},{cn:'床',en:'bed'},{cn:'镜子',en:'mirror'},{cn:'钟',en:'clock'},{cn:'灯',en:'lamp/light'},{cn:'钥匙',en:'key'},{cn:'盒子',en:'box'},{cn:'包',en:'bag'},{cn:'瓶子',en:'bottle'},{cn:'杯子',en:'cup'},{cn:'盘子',en:'plate'},{cn:'碗',en:'bowl'},{cn:'刀',en:'knife'},{cn:'叉子',en:'fork'},{cn:'勺子',en:'spoon'},{cn:'雨伞',en:'umbrella'},{cn:'毛巾',en:'towel'},{cn:'肥皂',en:'soap'},{cn:'牙刷',en:'toothbrush'},{cn:'梳子',en:'comb'},{cn:'玩具',en:'toy'},{cn:'球',en:'ball'},{cn:'娃娃',en:'doll'},{cn:'风筝',en:'kite'},
    // 学科职业
    {cn:'音乐',en:'music'},{cn:'体育',en:'sports/PE'},{cn:'美术',en:'art'},{cn:'数学',en:'math/maths'},{cn:'科学',en:'science'},{cn:'英语',en:'English'},{cn:'语文',en:'Chinese'},{cn:'医生',en:'doctor'},{cn:'护士',en:'nurse'},{cn:'警察',en:'police'},{cn:'司机',en:'driver'},{cn:'厨师',en:'cook/chef'},{cn:'农民',en:'farmer'},{cn:'工人',en:'worker'},{cn:'老师',en:'teacher'},{cn:'歌手',en:'singer'},
    // 其他
    {cn:'生日',en:'birthday'},{cn:'礼物',en:'gift/present'},{cn:'朋友',en:'friend'},{cn:'名字',en:'name'},{cn:'年龄',en:'age'},{cn:'电话',en:'telephone/phone'},{cn:'电脑',en:'computer'},{cn:'电视',en:'television/TV'},{cn:'收音机',en:'radio'},{cn:'相机',en:'camera'},{cn:'电影',en:'movie/film'},{cn:'故事',en:'story'},{cn:'歌',en:'song'},{cn:'游戏',en:'game'},{cn:'运动',en:'sport'},{cn:'颜色',en:'color'},{cn:'图画',en:'picture'},{cn:'地图',en:'map'},{cn:'国家',en:'country'},{cn:'世界',en:'world'},{cn:'男孩',en:'boy'},{cn:'女孩',en:'girl'},{cn:'男人',en:'man'},{cn:'女人',en:'woman'},{cn:'人',en:'person/people'},
    // 节日
    {cn:'新年',en:'New Year'},{cn:'春节',en:'Spring Festival'},{cn:'圣诞节',en:'Christmas'},{cn:'教师节',en:"Teachers' Day"},{cn:'儿童节',en:"Children's Day"},
    // 更多动词
    {cn:'尝试',en:'try'},{cn:'使用',en:'use'},{cn:'展示',en:'show'},{cn:'移动',en:'move'},{cn:'转动',en:'turn'},{cn:'掉落',en:'fall/drop'},{cn:'拾起',en:'pick up'},{cn:'挂',en:'hang'},{cn:'藏',en:'hide'},{cn:'搜索',en:'search'},{cn:'数数',en:'count'},{cn:'称呼',en:'call'},{cn:'种植',en:'grow/plant'},{cn:'喂养',en:'feed'},{cn:'打架',en:'fight'},{cn:'梦想',en:'dream'},{cn:'许愿',en:'wish'},{cn:'担心',en:'worry'},{cn:'享受',en:'enjoy'},{cn:'旅行',en:'travel'},{cn:'访问',en:'visit'},{cn:'邮寄',en:'mail/post'},
    // 更多名词
    {cn:'动物',en:'animal'},{cn:'宠物',en:'pet'},{cn:'声音',en:'sound'},{cn:'嗓音',en:'voice'},{cn:'单词',en:'word'},{cn:'信件',en:'letter'},{cn:'数字',en:'number'},{cn:'问题',en:'question'},{cn:'答案',en:'answer'},{cn:'笑话',en:'joke'},{cn:'秘密',en:'secret'},{cn:'惊喜',en:'surprise'},{cn:'错误',en:'mistake'},{cn:'一半',en:'half'},{cn:'部分',en:'part'},{cn:'组',en:'group'},{cn:'双',en:'pair'},{cn:'种类',en:'kind/type'},{cn:'顶部',en:'top'},{cn:'底部',en:'bottom'},{cn:'前面',en:'front'},{cn:'后面',en:'back/behind'},{cn:'旁边',en:'side'},{cn:'中间',en:'middle'},{cn:'角落',en:'corner'},{cn:'末端',en:'end'},
    // 更多形容词
    {cn:'甜',en:'sweet'},{cn:'酸',en:'sour'},{cn:'咸',en:'salty'},{cn:'苦',en:'bitter'},{cn:'辣',en:'spicy'},{cn:'新鲜',en:'fresh'},{cn:'健康',en:'healthy'},{cn:'生病',en:'sick/ill'},{cn:'幸运',en:'lucky'},{cn:'特别',en:'special'},{cn:'不同',en:'different'},{cn:'相同',en:'same'},{cn:'真实',en:'real/true'},{cn:'假',en:'false/fake'},{cn:'安全',en:'safe'},{cn:'危险',en:'dangerous'},{cn:'著名',en:'famous'},{cn:'重要',en:'important'},{cn:'普通',en:'common/ordinary'},{cn:'自由',en:'free'},{cn:'忙碌',en:'busy'},{cn:'空闲',en:'free'},{cn:'准备',en:'ready'},
    // 天气自然
    {cn:'雾',en:'fog'},{cn:'冰雹',en:'hail'},{cn:'霜',en:'frost'},{cn:'露水',en:'dew'},{cn:'土壤',en:'soil'},{cn:'田野',en:'field'},{cn:'小山',en:'hill'},{cn:'山谷',en:'valley'},{cn:'悬崖',en:'cliff'},{cn:'洞穴',en:'cave'},{cn:'瀑布',en:'waterfall'},
    // 方位介词
    {cn:'上面',en:'on/above'},{cn:'下面',en:'under/below'},{cn:'里面',en:'in/inside'},{cn:'外面',en:'out/outside'},{cn:'附近',en:'near'},{cn:'远',en:'far'},{cn:'左',en:'left'},{cn:'右',en:'right'},{cn:'之间',en:'between'},{cn:'对面',en:'opposite'},
  ],

  // ---- 初中基础 ----
  medium: [
    // 学科
    {cn:'历史',en:'history'},{cn:'地理',en:'geography'},{cn:'物理',en:'physics'},{cn:'化学',en:'chemistry'},{cn:'生物',en:'biology'},{cn:'政治',en:'politics'},{cn:'科目',en:'subject'},{cn:'代数',en:'algebra'},{cn:'几何',en:'geometry'},
    // 学习用品
    {cn:'笔记',en:'note'},{cn:'字典',en:'dictionary'},{cn:'杂志',en:'magazine'},{cn:'报纸',en:'newspaper'},{cn:'信息',en:'information'},{cn:'知识',en:'knowledge'},{cn:'错误',en:'mistake/error'},{cn:'成绩',en:'grade/score'},{cn:'学期',en:'term/semester'},{cn:'假期',en:'holiday/vacation'},{cn:'大学',en:'university/college'},{cn:'奖学金',en:'scholarship'},{cn:'文凭',en:'diploma'},
    // 饮食
    {cn:'早餐',en:'breakfast'},{cn:'午餐',en:'lunch'},{cn:'晚餐',en:'dinner/supper'},
    // 健康
    {cn:'健康',en:'health'},{cn:'药',en:'medicine'},{cn:'锻炼',en:'exercise'},{cn:'医院',en:'hospital'},{cn:'体重',en:'weight'},{cn:'身高',en:'height'},{cn:'发烧',en:'fever'},{cn:'咳嗽',en:'cough'},{cn:'头疼',en:'headache'},{cn:'牙疼',en:'toothache'},
    // 运动
    {cn:'足球',en:'football/soccer'},{cn:'篮球',en:'basketball'},{cn:'网球',en:'tennis'},{cn:'排球',en:'volleyball'},{cn:'乒乓球',en:'table tennis/ping-pong'},{cn:'羽毛球',en:'badminton'},{cn:'棒球',en:'baseball'},{cn:'高尔夫',en:'golf'},{cn:'跑步',en:'running'},{cn:'滑冰',en:'skating'},{cn:'滑雪',en:'skiing'},{cn:'骑自行车',en:'cycling'},{cn:'钓鱼',en:'fishing'},{cn:'登山',en:'climbing'},{cn:'比赛',en:'match/competition'},{cn:'赢',en:'win'},{cn:'输',en:'lose'},{cn:'得分',en:'score'},{cn:'教练',en:'coach'},{cn:'队',en:'team'},
    // 爱好
    {cn:'爱好',en:'hobby'},{cn:'收集',en:'collect'},{cn:'摄影',en:'photography'},{cn:'旅行',en:'travel'},{cn:'野餐',en:'picnic'},{cn:'聚会',en:'party'},{cn:'下棋',en:'chess'},
    // 职业
    {cn:'工程师',en:'engineer'},{cn:'科学家',en:'scientist'},{cn:'演员',en:'actor/actress'},{cn:'画家',en:'painter/artist'},{cn:'飞行员',en:'pilot'},{cn:'记者',en:'reporter/journalist'},{cn:'经理',en:'manager'},{cn:'秘书',en:'secretary'},{cn:'商人',en:'businessman'},{cn:'律师',en:'lawyer'},{cn:'牙医',en:'dentist'},{cn:'建筑师',en:'architect'},{cn:'会计',en:'accountant'},{cn:'程序员',en:'programmer'},{cn:'作家',en:'writer'},{cn:'导演',en:'director'},
    // 国家语言
    {cn:'中国',en:'China'},{cn:'美国',en:'America/USA'},{cn:'英国',en:'England/UK'},{cn:'日本',en:'Japan'},{cn:'法国',en:'France'},{cn:'加拿大',en:'Canada'},{cn:'澳大利亚',en:'Australia'},{cn:'德国',en:'Germany'},{cn:'俄罗斯',en:'Russia'},{cn:'印度',en:'India'},{cn:'巴西',en:'Brazil'},{cn:'韩国',en:'Korea'},{cn:'意大利',en:'Italy'},{cn:'西班牙',en:'Spain'},{cn:'语言',en:'language'},{cn:'中文',en:'Chinese'},{cn:'法语',en:'French'},{cn:'日语',en:'Japanese'},{cn:'德语',en:'German'},{cn:'城市',en:'city'},{cn:'首都',en:'capital'},
    // 自然
    {cn:'自然',en:'nature'},{cn:'环境',en:'environment'},{cn:'污染',en:'pollution'},{cn:'保护',en:'protect'},{cn:'能源',en:'energy'},{cn:'气候',en:'climate'},{cn:'温度',en:'temperature'},{cn:'灾难',en:'disaster'},{cn:'洪水',en:'flood'},{cn:'干旱',en:'drought'},
    // 野生动物
    {cn:'昆虫',en:'insect'},{cn:'蚊子',en:'mosquito'},{cn:'苍蝇',en:'fly'},{cn:'恐龙',en:'dinosaur'},
    // 情感性格
    {cn:'兴奋',en:'excited'},{cn:'担心',en:'worried'},{cn:'害怕',en:'afraid/scared'},{cn:'惊讶',en:'surprised'},{cn:'无聊',en:'bored'},{cn:'紧张',en:'nervous'},{cn:'骄傲',en:'proud'},{cn:'害羞',en:'shy'},{cn:'友好',en:'friendly'},{cn:'勇敢',en:'brave'},{cn:'耐心',en:'patient'},{cn:'严格',en:'strict'},{cn:'诚实',en:'honest'},{cn:'善良',en:'kind'},{cn:'幽默',en:'humorous/funny'},{cn:'认真',en:'serious'},{cn:'失望',en:'disappointed'},{cn:'困惑',en:'confused'},{cn:'感激',en:'grateful'},{cn:'嫉妒',en:'jealous'},{cn:'孤独',en:'lonely'},{cn:'满意',en:'satisfied'},{cn:'尴尬',en:'embarrassed'},{cn:'自信',en:'confident'},{cn:'好奇',en:'curious'},
    // 形容词
    {cn:'重要',en:'important'},{cn:'不同',en:'different'},{cn:'相同',en:'same'},{cn:'特别',en:'special'},{cn:'普通',en:'common/ordinary'},{cn:'可能',en:'possible'},{cn:'必要',en:'necessary'},{cn:'流行',en:'popular'},{cn:'安全',en:'safe'},{cn:'危险',en:'dangerous'},{cn:'舒服',en:'comfortable'},{cn:'富有',en:'rich'},{cn:'贫穷',en:'poor'},{cn:'厚',en:'thick'},{cn:'薄',en:'thin'},{cn:'宽',en:'wide'},{cn:'窄',en:'narrow'},{cn:'著名',en:'famous'},{cn:'方便',en:'convenient'},{cn:'可用',en:'available'},{cn:'负责',en:'responsible'},{cn:'独立',en:'independent'},{cn:'国际',en:'international'},{cn:'各种',en:'various'},{cn:'某些',en:'certain'},{cn:'整个',en:'whole/entire'},{cn:'私人的',en:'private'},{cn:'公共的',en:'public'},{cn:'当地的',en:'local'},{cn:'外国的',en:'foreign'},{cn:'现代的',en:'modern'},{cn:'传统的',en:'traditional'},{cn:'正常的',en:'normal'},{cn:'奇怪的',en:'strange'},{cn:'可怕的',en:'terrible'},{cn:'极好的',en:'wonderful/excellent'},{cn:'巨大的',en:'huge/enormous'},{cn:'微小的',en:'tiny'},
    // 动词
    {cn:'到达',en:'arrive/reach'},{cn:'离开',en:'leave'},{cn:'完成',en:'finish/complete'},{cn:'继续',en:'continue'},{cn:'练习',en:'practice'},{cn:'相信',en:'believe'},{cn:'希望',en:'hope/wish'},{cn:'决定',en:'decide'},{cn:'选择',en:'choose'},{cn:'改变',en:'change'},{cn:'分享',en:'share'},{cn:'花费',en:'spend/cost'},{cn:'发送',en:'send'},{cn:'收到',en:'receive'},{cn:'教',en:'teach'},{cn:'讨论',en:'discuss'},{cn:'解释',en:'explain'},{cn:'描述',en:'describe'},{cn:'比较',en:'compare'},{cn:'发现',en:'find/discover'},{cn:'发明',en:'invent'},{cn:'建造',en:'build'},{cn:'破坏',en:'destroy'},{cn:'修理',en:'repair/fix'},{cn:'移动',en:'move'},{cn:'推',en:'push'},{cn:'拉',en:'pull'},{cn:'加入',en:'join'},{cn:'同意',en:'agree'},{cn:'拒绝',en:'refuse'},{cn:'允许',en:'allow'},{cn:'避免',en:'avoid'},{cn:'考虑',en:'consider'},{cn:'建议',en:'suggest/advise'},{cn:'提供',en:'provide/offer'},{cn:'接受',en:'accept'},{cn:'支持',en:'support'},{cn:'鼓励',en:'encourage'},{cn:'阻止',en:'prevent/stop'},{cn:'实现',en:'achieve/realize'},{cn:'包含',en:'include/contain'},{cn:'影响',en:'influence/affect'},{cn:'发展',en:'develop'},{cn:'提高',en:'improve'},{cn:'增加',en:'increase'},{cn:'减少',en:'decrease/reduce'},{cn:'要求',en:'require'},{cn:'导致',en:'cause/lead to'},{cn:'表达',en:'express'},{cn:'管理',en:'manage'},{cn:'控制',en:'control'},{cn:'组织',en:'organize'},{cn:'准备',en:'prepare'},{cn:'期待',en:'expect'},{cn:'出现',en:'appear'},{cn:'消失',en:'disappear'},
    // 名词
    {cn:'机会',en:'chance/opportunity'},{cn:'问题',en:'question/problem'},{cn:'答案',en:'answer'},{cn:'原因',en:'reason'},{cn:'结果',en:'result'},{cn:'例子',en:'example'},{cn:'事实',en:'fact'},{cn:'想法',en:'idea'},{cn:'意见',en:'opinion'},{cn:'方法',en:'method/way'},{cn:'习惯',en:'habit'},{cn:'规则',en:'rule'},{cn:'梦想',en:'dream'},{cn:'目标',en:'goal'},{cn:'进步',en:'progress'},{cn:'交通',en:'traffic/transportation'},{cn:'噪音',en:'noise'},{cn:'声音',en:'sound/voice'},{cn:'价格',en:'price'},{cn:'大小',en:'size'},{cn:'形状',en:'shape'},{cn:'重量',en:'weight'},{cn:'速度',en:'speed'},{cn:'力量',en:'power/strength'},{cn:'消息',en:'message/news'},{cn:'未来',en:'future'},{cn:'过去',en:'past'},{cn:'记忆',en:'memory'},
    // 副词连词
    {cn:'总是',en:'always'},{cn:'通常',en:'usually'},{cn:'有时',en:'sometimes'},{cn:'从不',en:'never'},{cn:'几乎',en:'almost'},{cn:'已经',en:'already'},{cn:'仍然',en:'still'},{cn:'仅仅',en:'only/just'},{cn:'甚至',en:'even'},{cn:'尤其',en:'especially'},{cn:'在一起',en:'together'},{cn:'独自',en:'alone'},{cn:'真正',en:'really/truly'},{cn:'突然',en:'suddenly'},{cn:'立刻',en:'immediately'},{cn:'因为',en:'because'},{cn:'所以',en:'so/therefore'},{cn:'但是',en:'but/however'},{cn:'或者',en:'or'},{cn:'如果',en:'if'},{cn:'虽然',en:'although/though'},{cn:'除非',en:'unless'},{cn:'直到',en:'until'},
    // 购物
    {cn:'购物',en:'shopping'},{cn:'品牌',en:'brand'},{cn:'时尚',en:'fashion'},{cn:'折扣',en:'discount'},{cn:'收据',en:'receipt'},{cn:'顾客',en:'customer'},{cn:'质量',en:'quality'},
    // 媒体
    {cn:'节目',en:'program'},{cn:'频道',en:'channel'},{cn:'广告',en:'advertisement/ad'},{cn:'新闻',en:'news'},{cn:'互联网',en:'Internet'},{cn:'网站',en:'website'},
    // 旅行
    {cn:'护照',en:'passport'},{cn:'行李',en:'luggage'},{cn:'地图',en:'map'},{cn:'导游',en:'guide'},{cn:'票',en:'ticket'},{cn:'高速公路',en:'highway'},{cn:'交通堵塞',en:'traffic jam'},
    // 建筑
    {cn:'医院',en:'hospital'},{cn:'大学',en:'university'},{cn:'寺庙',en:'temple'},{cn:'宫殿',en:'palace'},
    // 更多动词
    {cn:'假装',en:'pretend'},{cn:'警告',en:'warn'},{cn:'提醒',en:'remind'},{cn:'取消',en:'cancel'},{cn:'预订',en:'book/reserve'},{cn:'安排',en:'arrange'},{cn:'检查',en:'check/examine'},{cn:'测试',en:'test'},{cn:'复制',en:'copy'},{cn:'打印',en:'print'},{cn:'打字',en:'type'},{cn:'保存',en:'save'},{cn:'删除',en:'delete'},{cn:'下载',en:'download'},{cn:'上传',en:'upload'},{cn:'安装',en:'install'},{cn:'驾驶',en:'drive'},{cn:'停车',en:'park'},{cn:'起飞',en:'take off'},{cn:'降落',en:'land'},{cn:'伤害',en:'hurt/injure'},{cn:'治愈',en:'heal/cure'},{cn:'死',en:'die'},{cn:'存活',en:'survive'},
    // 更多形容词
    {cn:'礼貌',en:'polite'},{cn:'粗鲁',en:'rude'},{cn:'慷慨',en:'generous'},{cn:'自私',en:'selfish'},{cn:'勤奋',en:'hardworking'},{cn:'懒惰',en:'lazy'},{cn:'聪明',en:'clever'},{cn:'愚蠢',en:'stupid/foolish'},{cn:'平静',en:'calm'},{cn:'疯狂',en:'crazy/mad'},{cn:'温柔',en:'gentle'},{cn:'暴力',en:'violent'},{cn:'富有',en:'rich/wealthy'},{cn:'贫穷',en:'poor'},{cn:'幸运',en:'lucky/fortunate'},{cn:'不幸',en:'unlucky/unfortunate'},{cn:'公平',en:'fair'},{cn:'不公平',en:'unfair'},{cn:'合法',en:'legal'},{cn:'非法',en:'illegal'},{cn:'准确',en:'accurate/exact'},{cn:'模糊',en:'vague/unclear'},
    // 更多名词
    {cn:'申请',en:'application'},{cn:'面试',en:'interview'},{cn:'简历',en:'resume/CV'},{cn:'工资',en:'salary/wage'},{cn:'税',en:'tax'},{cn:'账单',en:'bill'},{cn:'硬币',en:'coin'},{cn:'现金',en:'cash'},{cn:'信用卡',en:'credit card'},{cn:'账户',en:'account'},{cn:'密码',en:'password'},{cn:'信号',en:'signal'},{cn:'电池',en:'battery'},{cn:'屏幕',en:'screen'},{cn:'键盘',en:'keyboard'},{cn:'鼠标',en:'mouse'},{cn:'风俗',en:'custom'},{cn:'节日',en:'festival'},{cn:'仪式',en:'ceremony'},{cn:'展览',en:'exhibition'},{cn:'演出',en:'performance/show'},{cn:'观众',en:'audience'},{cn:'角色',en:'role/character'},{cn:'场景',en:'scene'},
    // 健康医疗
    {cn:'疼痛',en:'pain'},{cn:'伤口',en:'wound'},{cn:'手术',en:'surgery/operation'},{cn:'救护车',en:'ambulance'},{cn:'药店',en:'pharmacy'},{cn:'处方',en:'prescription'},
    // 犯罪安全
    {cn:'小偷',en:'thief'},{cn:'犯罪',en:'crime'},{cn:'监狱',en:'prison/jail'},{cn:'武器',en:'weapon'},
  ],

  // ---- 中考核心 ----
  hard: [
    // 社会文化
    {cn:'社会',en:'society'},{cn:'文化',en:'culture'},{cn:'传统',en:'tradition'},{cn:'现代',en:'modern'},{cn:'教育',en:'education'},{cn:'政府',en:'government'},{cn:'法律',en:'law'},{cn:'权利',en:'right'},{cn:'责任',en:'responsibility/duty'},{cn:'自由',en:'freedom'},{cn:'平等',en:'equality'},{cn:'公平',en:'fair'},{cn:'和平',en:'peace'},{cn:'战争',en:'war'},{cn:'交流',en:'communication'},{cn:'关系',en:'relationship'},{cn:'社区',en:'community'},{cn:'公共',en:'public'},{cn:'私人',en:'private'},{cn:'个人',en:'personal/individual'},{cn:'民主',en:'democracy'},{cn:'正义',en:'justice'},{cn:'人权',en:'human rights'},{cn:'全球化',en:'globalization'},{cn:'移民',en:'immigration'},{cn:'种族',en:'race'},{cn:'性别',en:'gender'},
    // 经济科技
    {cn:'经济',en:'economy'},{cn:'科技',en:'technology'},{cn:'工业',en:'industry'},{cn:'农业',en:'agriculture'},{cn:'贸易',en:'trade'},{cn:'商业',en:'business'},{cn:'公司',en:'company'},{cn:'产品',en:'product'},{cn:'服务',en:'service'},{cn:'顾客',en:'customer'},{cn:'市场',en:'market'},{cn:'广告',en:'advertisement/ad'},{cn:'互联网',en:'Internet'},{cn:'网站',en:'website'},{cn:'机器人',en:'robot'},{cn:'发明',en:'invention'},{cn:'人口',en:'population'},{cn:'发展',en:'development'},{cn:'增加',en:'increase'},{cn:'减少',en:'decrease/reduce'},{cn:'投资',en:'investment'},{cn:'利润',en:'profit'},{cn:'策略',en:'strategy'},{cn:'竞争',en:'competition'},{cn:'企业',en:'enterprise/corporation'},{cn:'品牌',en:'brand'},{cn:'消费',en:'consumption'},{cn:'生产',en:'production'},
    // 品质抽象
    {cn:'成功',en:'success'},{cn:'失败',en:'failure'},{cn:'经验',en:'experience'},{cn:'技能',en:'skill'},{cn:'勇气',en:'courage'},{cn:'信心',en:'confidence'},{cn:'独立',en:'independent'},{cn:'耐心',en:'patience'},{cn:'礼貌',en:'polite/manners'},{cn:'尊重',en:'respect'},{cn:'信任',en:'trust'},{cn:'友谊',en:'friendship'},{cn:'幸福',en:'happiness'},{cn:'压力',en:'pressure/stress'},{cn:'态度',en:'attitude'},{cn:'精神',en:'spirit'},{cn:'价值',en:'value'},{cn:'意义',en:'meaning'},{cn:'目的',en:'purpose'},{cn:'优势',en:'advantage'},{cn:'劣势',en:'disadvantage'},{cn:'特点',en:'feature/characteristic'},{cn:'品质',en:'quality'},{cn:'荣誉',en:'honor'},{cn:'智慧',en:'wisdom'},{cn:'同情',en:'sympathy'},{cn:'慷慨',en:'generosity'},
    // 形容词高级
    {cn:'积极',en:'positive/active'},{cn:'消极',en:'negative'},{cn:'创造',en:'creative'},{cn:'有效',en:'effective'},{cn:'基本',en:'basic'},{cn:'主要',en:'main/major'},{cn:'全部',en:'whole/entire'},{cn:'部分',en:'part/partial'},{cn:'足够',en:'enough'},{cn:'缺少',en:'lack/short'},{cn:'相似',en:'similar'},{cn:'相反',en:'opposite'},{cn:'直接',en:'direct'},{cn:'间接',en:'indirect'},{cn:'具体',en:'specific/concrete'},{cn:'抽象',en:'abstract'},{cn:'实际',en:'actual/real'},{cn:'理想',en:'ideal'},{cn:'完美',en:'perfect'},{cn:'严重',en:'serious/severe'},{cn:'暂时',en:'temporary'},{cn:'永久',en:'permanent'},{cn:'自然',en:'natural'},{cn:'人工',en:'artificial/man-made'},{cn:'正式',en:'formal'},{cn:'随意',en:'casual'},{cn:'复杂',en:'complicated/complex'},{cn:'简单',en:'simple'},{cn:'巨大',en:'huge/enormous'},{cn:'微小',en:'tiny'},{cn:'迅速',en:'rapid/quick'},{cn:'逐渐',en:'gradual'},{cn:'重要',en:'significant'},{cn:'足够',en:'sufficient'},{cn:'适当',en:'appropriate'},{cn:'不可避免',en:'inevitable'},{cn:'有争议',en:'controversial'},{cn:'明显',en:'obvious'},{cn:'潜在',en:'potential'},{cn:'相关',en:'relevant'},{cn:'独特',en:'unique'},{cn:'普遍',en:'universal'},{cn:'灵活',en:'flexible'},{cn:'可靠',en:'reliable'},
    // 动词高级
    {cn:'实现',en:'achieve/realize'},{cn:'克服',en:'overcome'},{cn:'承认',en:'admit'},{cn:'否认',en:'deny'},{cn:'表达',en:'express'},{cn:'包含',en:'include/contain'},{cn:'涉及',en:'involve'},{cn:'影响',en:'influence/affect'},{cn:'支持',en:'support'},{cn:'反对',en:'oppose'},{cn:'鼓励',en:'encourage'},{cn:'阻止',en:'prevent/stop'},{cn:'吸引',en:'attract'},{cn:'导致',en:'cause/lead to'},{cn:'证明',en:'prove'},{cn:'怀疑',en:'doubt/suspect'},{cn:'代表',en:'represent/stand for'},{cn:'组成',en:'form/make up'},{cn:'属于',en:'belong to'},{cn:'管理',en:'manage'},{cn:'控制',en:'control'},{cn:'组织',en:'organize'},{cn:'准备',en:'prepare'},{cn:'期待',en:'expect/look forward to'},{cn:'认识',en:'recognize'},{cn:'意识到',en:'realize'},{cn:'欣赏',en:'appreciate/enjoy'},{cn:'抱怨',en:'complain'},{cn:'道歉',en:'apologize'},{cn:'表扬',en:'praise'},{cn:'惩罚',en:'punish'},{cn:'奖励',en:'reward'},{cn:'贡献',en:'contribute'},{cn:'捐赠',en:'donate'},{cn:'自愿',en:'volunteer'},{cn:'依靠',en:'depend/rely on'},{cn:'属于',en:'belong'},{cn:'存在',en:'exist'},{cn:'消失',en:'disappear'},{cn:'出现',en:'appear'},{cn:'传播',en:'spread'},{cn:'连接',en:'connect/link'},{cn:'翻译',en:'translate'},{cn:'报道',en:'report'},{cn:'建立',en:'establish'},{cn:'维持',en:'maintain'},{cn:'获得',en:'obtain'},{cn:'参加',en:'participate'},{cn:'推荐',en:'recommend'},{cn:'注册',en:'register'},{cn:'解决',en:'solve/resolve'},{cn:'调查',en:'investigate'},{cn:'反应',en:'react/respond'},{cn:'强调',en:'emphasize/stress'},{cn:'集中',en:'concentrate/focus'},
    // 名词高级
    {cn:'情况',en:'situation'},{cn:'条件',en:'condition'},{cn:'背景',en:'background'},{cn:'过程',en:'process'},{cn:'系统',en:'system'},{cn:'结构',en:'structure'},{cn:'水平',en:'level'},{cn:'标准',en:'standard'},{cn:'细节',en:'detail'},{cn:'材料',en:'material'},{cn:'资源',en:'resource'},{cn:'设备',en:'equipment'},{cn:'工具',en:'tool'},{cn:'物品',en:'item/object'},{cn:'事件',en:'event'},{cn:'活动',en:'activity'},{cn:'会议',en:'meeting/conference'},{cn:'项目',en:'project'},{cn:'计划',en:'plan'},{cn:'任务',en:'task/mission'},{cn:'困难',en:'difficulty'},{cn:'挑战',en:'challenge'},{cn:'解决方案',en:'solution'},{cn:'可能性',en:'possibility'},{cn:'注意力',en:'attention'},{cn:'记忆力',en:'memory'},{cn:'想象力',en:'imagination'},{cn:'创造力',en:'creativity'},{cn:'成就',en:'achievement'},{cn:'奖励',en:'award/prize'},{cn:'记录',en:'record'},{cn:'符号',en:'symbol/sign'},{cn:'感情',en:'feeling/emotion'},{cn:'幽默',en:'humor'},{cn:'后悔',en:'regret'},{cn:'满足',en:'satisfaction'},{cn:'实验',en:'experiment'},{cn:'理论',en:'theory'},{cn:'研究',en:'research'},{cn:'数据',en:'data'},{cn:'证据',en:'evidence'},{cn:'分析',en:'analysis'},{cn:'现象',en:'phenomenon'},{cn:'趋势',en:'trend'},
    // 健康环境
    {cn:'疾病',en:'disease/illness'},{cn:'治疗',en:'treatment'},{cn:'预防',en:'prevent/prevention'},{cn:'饮食',en:'diet'},{cn:'营养',en:'nutrition'},{cn:'疫苗',en:'vaccine'},{cn:'气候',en:'climate'},{cn:'全球',en:'global'},{cn:'温度',en:'temperature'},{cn:'灾难',en:'disaster'},{cn:'回收',en:'recycle'},{cn:'浪费',en:'waste'},{cn:'节约',en:'save'},{cn:'可持续',en:'sustainable'},{cn:'生态',en:'ecology'},{cn:'物种',en:'species'},
    // 短语
    {cn:'参加',en:'take part in/join'},{cn:'处理',en:'deal with/handle'},{cn:'寻找',en:'look for/search'},{cn:'照顾',en:'take care of/look after'},{cn:'放弃',en:'give up'},{cn:'坚持',en:'stick to/insist on'},{cn:'发生',en:'happen/take place'},{cn:'成长',en:'grow up'},{cn:'建立',en:'set up/establish'},{cn:'执行',en:'carry out'},{cn:'结果是',en:'turn out'},{cn:'提出',en:'come up with/put forward'},{cn:'注意',en:'pay attention to'},{cn:'利用',en:'make use of/take advantage of'},{cn:'由……组成',en:'consist of/be made up of'},{cn:'与……有关',en:'be related to/have to do with'},{cn:'分解',en:'break down'},{cn:'偶遇',en:'come across'},{cn:'弄清楚',en:'figure out'},{cn:'相处',en:'get along'},{cn:'期待',en:'look forward to'},{cn:'结果是',en:'turn out'},{cn:'用完',en:'run out of'},{cn:'推迟',en:'put off'},
    // 作文连接词
    {cn:'首先',en:'first of all/firstly'},{cn:'其次',en:'secondly/besides'},{cn:'最后',en:'finally/last but not least'},{cn:'总之',en:'in conclusion/in a word'},{cn:'在我看来',en:'in my opinion'},{cn:'事实上',en:'in fact/as a matter of fact'},{cn:'换句话说',en:'in other words'},{cn:'而且',en:'moreover/furthermore'},{cn:'然而',en:'however/nevertheless'},{cn:'因此',en:'therefore/thus'},{cn:'同时',en:'meanwhile/at the same time'},{cn:'结果',en:'as a result'},{cn:'例如',en:'for example/for instance'},{cn:'除……之外',en:'besides/except/apart from'},{cn:'相比之下',en:'in comparison'},{cn:'另一方面',en:'on the other hand'},{cn:'毫无疑问',en:'without doubt/undoubtedly'},{cn:'一般来说',en:'generally speaking'},{cn:'据我所知',en:'as far as I know'},
    // 中考高频
    {cn:'志愿者',en:'volunteer'},{cn:'独立',en:'independent'},{cn:'描述',en:'describe/description'},{cn:'解释',en:'explain/explanation'},{cn:'比较',en:'compare/comparison'},{cn:'创造',en:'create'},{cn:'影响',en:'influence/affect'},{cn:'提高',en:'improve'},{cn:'包括',en:'include'},{cn:'提供',en:'provide/offer'},{cn:'接受',en:'accept'},{cn:'拒绝',en:'refuse/reject'},{cn:'支持',en:'support'},{cn:'反对',en:'oppose/against'},{cn:'尊重',en:'respect'},{cn:'自由',en:'freedom'},{cn:'健康',en:'health'},{cn:'能源',en:'energy'},{cn:'自然',en:'nature'},{cn:'安全',en:'safety/security'},{cn:'未来',en:'future'},
    // 额外抽象词汇
    {cn:'意识',en:'awareness/consciousness'},{cn:'动机',en:'motivation'},{cn:'灵感',en:'inspiration'},{cn:'视角',en:'perspective'},{cn:'热情',en:'enthusiasm/passion'},{cn:'决心',en:'determination'},{cn:'奉献',en:'dedication/devotion'},{cn:'承诺',en:'commitment/promise'},{cn:'平衡',en:'balance'},{cn:'和谐',en:'harmony'},{cn:'冲突',en:'conflict'},{cn:'合作',en:'cooperation'},{cn:'多样性',en:'diversity'},{cn:'效率',en:'efficiency'},
    // 科学与学术
    {cn:'假设',en:'hypothesis'},{cn:'结论',en:'conclusion'},{cn:'定义',en:'definition'},{cn:'概念',en:'concept'},{cn:'原理',en:'principle'},{cn:'公式',en:'formula'},{cn:'统计',en:'statistics'},{cn:'基因',en:'gene'},{cn:'细胞',en:'cell'},{cn:'原子',en:'atom'},{cn:'分子',en:'molecule'},{cn:'重力',en:'gravity'},{cn:'轨道',en:'orbit'},{cn:'卫星',en:'satellite'},{cn:'望远镜',en:'telescope'},{cn:'显微镜',en:'microscope'},
    // 更多抽象
    {cn:'偏见',en:'prejudice/bias'},{cn:'歧视',en:'discrimination'},{cn:'暴力',en:'violence'},{cn:'贫穷',en:'poverty'},{cn:'财富',en:'wealth'},{cn:'地位',en:'status'},{cn:'声誉',en:'reputation'},{cn:'隐私',en:'privacy'},{cn:'版权',en:'copyright'},{cn:'专利',en:'patent'},
    // 高频动词补充
    {cn:'适应',en:'adapt/adjust'},{cn:'评估',en:'evaluate/assess'},{cn:'估计',en:'estimate'},{cn:'计算',en:'calculate'},{cn:'区分',en:'distinguish'},{cn:'确认',en:'confirm'},{cn:'宣布',en:'announce/declare'},{cn:'申请',en:'apply'},{cn:'促进',en:'promote'},{cn:'限制',en:'limit/restrict'},{cn:'消耗',en:'consume'},{cn:'分配',en:'distribute/allocate'},{cn:'投资',en:'invest'},{cn:'出口',en:'export'},{cn:'进口',en:'import'},
    // 形容词补充
    {cn:'绝对',en:'absolute'},{cn:'相对',en:'relative'},{cn:'主观',en:'subjective'},{cn:'客观',en:'objective'},{cn:'理论',en:'theoretical'},{cn:'实践',en:'practical'},{cn:'关键',en:'crucial/critical'},{cn:'根本',en:'fundamental'},{cn:'紧急',en:'urgent/emergency'},{cn:'极端',en:'extreme'},{cn:'温和',en:'moderate/mild'},{cn:'精确',en:'precise'},{cn:'粗略',en:'rough/approximate'},{cn:'稳定',en:'stable/steady'},{cn:'脆弱',en:'fragile/vulnerable'},
    // 教育考试
    {cn:'课程',en:'curriculum/course'},{cn:'学费',en:'tuition'},{cn:'毕业',en:'graduate/graduation'},{cn:'学位',en:'degree'},{cn:'专业',en:'major'},{cn:'论文',en:'essay/paper/thesis'},{cn:'演讲',en:'speech/presentation'},{cn:'辩论',en:'debate'},{cn:'家教',en:'tutor'},
    // 媒体与艺术
    {cn:'文学',en:'literature'},{cn:'诗歌',en:'poem/poetry'},{cn:'小说',en:'novel/fiction'},{cn:'戏剧',en:'drama/theater'},{cn:'建筑',en:'architecture'},{cn:'雕塑',en:'sculpture'},{cn:'设计',en:'design'},
  ],
};
