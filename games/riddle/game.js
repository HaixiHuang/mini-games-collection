// ===== 脑筋急转弯 =====
GameRegistry.register({
  id: 'riddle',
  name: '脑筋急转弯',
  icon: '🤔',
  desc: '100个有趣急转弯！换个角度想问题，别被套路了！',
  difficulties: [
    { id: 'easy', name: '经典', icon: '🌱', desc: '耳熟能详的经典急转弯' },
    { id: 'medium', name: '进阶', icon: '🔥', desc: '需要多想一步' },
    { id: 'hard', name: '烧脑', icon: '💀', desc: '真·脑筋急转弯' },
  ],

  init(container, difficulty, onComplete) {
    const pool = RIDDLES[difficulty];
    const total = 5;
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, total);
    let index = 0, correct = 0;

    showQuestion();

    function showQuestion() {
      if (index >= total) { finish(); return; }
      const q = shuffled[index];
      container.innerHTML = `
        <div style="max-width:500px;width:100%;" class="animate-in">
          <div style="color:var(--text-dim);margin-bottom:12px;">
            第 ${index+1}/${total} 题 | ✅ ${correct}
          </div>
          <div style="font-size:1.15em;font-weight:600;margin-bottom:20px;line-height:1.7;background:var(--surface);padding:20px;border-radius:var(--radius);">
            🤔 ${q.question}
          </div>
          <div class="flex-col" id="optionsContainer">
            ${q.options.map((opt, i) => `
              <button class="btn btn-secondary" data-idx="${i}" style="text-align:left;justify-content:flex-start;width:100%;">
                ${String.fromCharCode(65+i)}. ${opt}
              </button>
            `).join('')}
          </div>
          <div id="riddleFeedback" style="margin-top:10px;min-height:28px;font-weight:700;"></div>
        </div>
      `;

      document.getElementById('optionsContainer').onclick = (e) => {
        const btn = e.target.closest('[data-idx]');
        if (!btn) return;
        const chosen = +btn.dataset.idx;
        const fb = document.getElementById('riddleFeedback');
        if (chosen === q.answer) {
          correct++;
          fb.innerHTML = '<div class="game-feedback success pop">✅ 正确！'+(q.joke||'')+'</div>';
        } else {
          fb.innerHTML = '<div class="game-feedback info">❌ 不对哦～正确答案是：<b>'+q.options[q.answer]+'</b>'+(q.joke||'')+'</div>';
        }
        index++;
        setTimeout(showQuestion, 1200);
      };
    }

    function finish() {
      const star = correct===5?'⭐⭐⭐⭐⭐':correct>=4?'⭐⭐⭐⭐':correct>=3?'⭐⭐⭐':correct>=2?'⭐⭐':'⭐';
      container.innerHTML = `<div class="result-card animate-in">
        <div class="result-icon">${correct>=4?'🎉':correct>=3?'👍':'🤔'}</div>
        <div class="result-title">${correct>=4?'脑筋急转弯达人！':correct>=3?'还不错！':'多练练！'}</div>
        <div class="result-detail">${total}题答对<b style="color:var(--accent);">${correct}</b>题<br>${star}</div>
      </div>`;
      setTimeout(() => onComplete({
        win: correct>=3, score: total-correct,
        title: correct>=4?'太聪明了！':'挑战完成！',
        detail: `${total}题答对${correct}题`,
      }), 1500);
    }
  }
});

// ===== 题库（100题）=====
const RIDDLES = {
  // ---- 经典（33题）----
  easy: [
    {question:'什么东西越洗越脏？',options:['衣服','水','毛巾','手'],answer:1,joke:' 😂 水越洗越脏！'},
    {question:'什么东西天气越热它爬得越高？',options:['温度计','太阳','气球','爬山的人'],answer:0},
    {question:'什么东西你越打它它越变越大？',options:['气球','脾气','面团','雪球'],answer:2},
    {question:'一年中哪个月有28天？',options:['2月','每个月都有','只有闰年2月','1月'],answer:1,joke:' 😂 每个月都至少有28天！'},
    {question:'什么东西不剪不断，越剪越长？',options:['头发','指甲','纸','布'],answer:1},
    {question:'两个人掉进井里，重的那个先上来，为什么？',options:['他力气大','轻的摔死了','重的沉下去了','他在上面'],answer:1,joke:' 😂 轻的那个摔死了！'},
    {question:'什么东西只能加不能减？',options:['年龄','工资','体重','知识'],answer:0},
    {question:'黑人为什么不喜欢吃黑巧克力？',options:['怕咬到手','不好吃','太甜','怕过敏'],answer:0,joke:' 😂 怕咬到手指！'},
    {question:'一个人从10层楼跳下来却没有受伤，为什么？',options:['有气垫','从一楼窗户跳的','在做梦','他是猫'],answer:1,joke:' 😂 从一楼窗户往外跳！'},
    {question:'什么时候太阳从西边升起？',options:['永远不可能','在地球另一边','镜子里的倒影','在话里'],answer:3,joke:' 😂 当人们"说话"的时候！'},
    {question:'什么东西你一旦说出来就"破"了？',options:['气球','泡泡','沉默','秘密'],answer:2},
    {question:'一张桌子有四个角，砍掉一个角还有几个？',options:['3个','4个','5个','6个'],answer:2,joke:' 😂 砍掉一个角会多出两个角，共5个！'},
    {question:'什么东西越晒越湿？',options:['衣服','冰','雪糕','冰块'],answer:2},
    {question:'什么人整天去医院但是从不看病？',options:['医生','护士','病人','清洁工'],answer:0},
    {question:'什么书书店里买不到？',options:['禁书','说明书','绝版书','秘书'],answer:3,joke:' 😂 秘书不是书！'},
    {question:'什么东西有头无脚？',options:['鱼','蛇','钉子','以上都是'],answer:3},
    {question:'什么球不能踢？',options:['地球','眼球','铅球','以上都是'],answer:3},
    {question:'什么东西不用的时候是干的，用的时候就变湿？',options:['毛巾','海绵','水龙头','肥皂'],answer:0},
    {question:'什么情况下5大于0，0大于2，2大于5？',options:['数学错了','做梦','猜拳','打牌'],answer:2,joke:' 😂 石头剪刀布！'},
    {question:'什么东西从这边看是圆的，从那边看是方的？',options:['镜子','窗户','门','柱子'],answer:3},
    {question:'上课铃响了，为什么教室里一个人也没有？',options:['都请假了','是自习课','是体育课','放假了'],answer:2},
    {question:'一只鸡一只鹅放冰箱，鸡冻死了鹅没死，为什么？',options:['鹅不怕冷','企鹅','鹅穿了衣服','鸡太弱'],answer:1,joke:' 😂 那只鹅是企鹅！'},
    {question:'什么东西有眼不能看？',options:['针','盲人','死人','画像'],answer:0},
    {question:'桥下没有水，为什么叫桥？',options:['因为在天上','因为那是天桥/立交桥','名字叫桥而已','以前有水'],answer:1},
    {question:'什么柴不能烧？',options:['湿柴','人才','废柴','骨头'],answer:1},
    {question:'什么花不能摘？',options:['火花','水花','泪花','以上都是'],answer:3},
    {question:'世界上最长的车是什么车？',options:['火车','塞车','卡车','公交车'],answer:1,joke:' 😂 堵车/塞车！'},
    {question:'什么人不敢洗澡？',options:['泥人','病人','怕水的人','猫'],answer:0,joke:' 😂 泥人一洗就化了！'},
    {question:'什么东西放在火里不会烧着？',options:['石头','水','冰','火本身'],answer:1},
    {question:'小明每次都拿第一，为什么爸爸不夸他？',options:['爸爸很严格','小明是倒数的','小明作弊','爸爸不在家'],answer:1,joke:' 😂 倒数第一！'},
    {question:'什么桶永远装不满？',options:['马桶','饭桶','水桶','破桶'],answer:0},
    {question:'猫见了老鼠为什么拔腿就跑？',options:['猫胆小','那是玩具鼠','跑去追老鼠','猫在做梦'],answer:2,joke:' 😂 跑去追啊！'},
    {question:'什么东西越擦越小？',options:['铅笔','橡皮','粉笔','黑板'],answer:1},
  ],

  // ---- 进阶（33题）----
  medium: [
    {question:'什么动物可以贴在墙上？',options:['壁虎','海豹','蜘蛛','蜥蜴'],answer:1,joke:' 😂 海豹（海报）！'},
    {question:'为什么自由女神像一直站在纽约港口？',options:['因为她没地方坐','因为她是雕像','因为她在等人','因为她喜欢站着'],answer:0},
    {question:'什么东西明明是你的，但是别人用的比你多？',options:['手机','名字','钱','时间'],answer:1},
    {question:'一个人在海边散步，回头却看不到自己的脚印，为什么？',options:['他倒着走','涨潮了','他在做梦','他是盲人'],answer:0},
    {question:'拿鸡蛋扔石头，为什么鸡蛋没破？',options:['鸡蛋是熟的','石头是软的','一只手拿鸡蛋，另一只手扔石头','鸡蛋是假的'],answer:2,joke:' 😂 左手拿鸡蛋，右手扔石头！'},
    {question:'把8分成两半是多少？',options:['4','0','两个0','两个3'],answer:2,joke:' 😂 竖着切是两个0！'},
    {question:'铁放在外面会生锈，金子放在外面会怎样？',options:['被偷','发光','生金锈','不变'],answer:0},
    {question:'你能以最快的速度把冰变成水吗？',options:['加热','放盐','把"冰"字的两点去掉','放太阳下'],answer:2,joke:' 😂 去掉两点水就是"水"！'},
    {question:'什么话经常在书里出现？',options:['情话','笑话','童话','中国话'],answer:3},
    {question:'哪里的海不产鱼？',options:['死海','辞海','脑海','以上都是'],answer:3},
    {question:'什么东西可以解开所有的谜？',options:['钥匙','时间','答案','智慧'],answer:2},
    {question:'一个人被关在房间里，房间只有一扇门但他拉不开，为什么？',options:['门是推的','门锁了','他力气太小','门是假的'],answer:0,joke:' 😂 门应该推开！'},
    {question:'什么杯不能用来喝水？',options:['奖杯','世界杯','圣杯','以上都是'],answer:3},
    {question:'什么地方进去容易出来难？',options:['监狱','考场','迷宫','以上都是'],answer:3},
    {question:'什么东西一边走一边撒？',options:['播种机','盐罐','谎言','年迈的老人'],answer:0},
    {question:'哪种比赛赢的人得不到奖品？',options:['跑步','考试','比赛','以上都不是'],answer:1,joke:' 😂 考试不是比赛！'},
    {question:'什么时候做事情不需要费力气？',options:['做梦的时候','躺着的时候','偷懒的时候','没有这种时候'],answer:0},
    {question:'动物园里大象鼻子最长，第二长的是谁？',options:['长颈鹿','河马','小象','鳄鱼'],answer:2},
    {question:'什么马不吃草？',options:['河马','海马','斑马','以上都是'],answer:3},
    {question:'用什么拖地最干净？',options:['拖把','抹布','用力','拼命'],answer:2,joke:' 😂 "用力"拖地！'},
    {question:'什么事每个人都在做，但从来没有真正做完？',options:['做梦','呼吸','活着','工作'],answer:1},
    {question:'什么东西破了比没破好？',options:['记录','衣服','鸡蛋','秘密'],answer:0},
    {question:'什么飞机不载客？',options:['战斗机','纸飞机','直升机','以上都是'],answer:3},
    {question:'什么东西比天还高？',options:['太阳','心','飞机','宇宙'],answer:1,joke:' 😂 心比天高！'},
    {question:'什么时候说话要付钱？',options:['打电话','微信','当面说','永远不需要'],answer:0,joke:' 😂 打电话要话费！'},
    {question:'中国的哪个地方的东西最贵？',options:['北京','上海','贵州','深圳'],answer:2,joke:' 😂 贵州（"贵"州）！'},
    {question:'什么人生病从来不看医生？',options:['医生自己','穷人','盲人','死人'],answer:2,joke:' 😂 盲人看不见医生！'},
    {question:'一只蚂蚁居然从北京爬到了上海，可能吗？',options:['不可能','可能,在地图上爬','可能,坐飞机','蚂蚁可以爬很远'],answer:1},
    {question:'什么角量不出度数？',options:['直角','钝角','牛角','死角'],answer:2},
    {question:'梁山伯和祝英台变成蝴蝶后飞到哪里去了？',options:['天上','花园','坟里','不知道'],answer:1},
    {question:'什么线能穿越时空？',options:['电线','毛线','地平线','故事线'],answer:3},
    {question:'什么事天不知地知，你不知我知？',options:['秘密','鞋底破了','梦','心跳'],answer:1,joke:' 😂 鞋底破了天看不到地知道，我不知道你知道！'},
    {question:'什么东西只进不出？',options:['貔貅','黑洞','坟墓','以上都有'],answer:2},
  ],

  // ---- 烧脑（34题）----
  hard: [
    {question:'三个"人"叫"众"，三个"木"叫"森"，三个"鬼"叫什么？',options:['魑魅魍魉','叫救命','魔鬼','魂魄'],answer:1,joke:' 😂 三个鬼当然叫"救命"啊！'},
    {question:'世界上什么最大？',options:['天','宇宙','眼皮','地球'],answer:2,joke:' 😂 眼皮一闭，整个世界都消失了！'},
    {question:'有一个人，他是你父母生的，但不是你的兄弟姐妹，他是谁？',options:['你的朋友','你自己','你的表亲','不存在'],answer:1},
    {question:'一个人走进酒吧，向服务员要了一杯水。服务员拿出一把枪指着他。那人说了声谢谢就走了。为什么？',options:['他打嗝','他要自杀','他有病','在拍电影'],answer:0,joke:' 😂 他打嗝，被枪吓了一下就好了！'},
    {question:'医生给病人三颗药，半小时吃一颗，能吃多久？',options:['1.5小时','1小时','2小时','半小时'],answer:1,joke:' 😂 第一颗现在吃，半小时后第二颗，再半小时后第三颗，共1小时！'},
    {question:'32+81=？',options:['113','三十二+八十一=一百一十三','3213','没有正确答案'],answer:1,joke:' 😂 把汉字拼起来就是答案！'},
    {question:'偷什么不犯法？',options:['偷懒','偷笑','偷看','以上都是'],answer:3},
    {question:'世界上哪里的海最大？',options:['太平洋','学海','脑海','苦海'],answer:1,joke:' 😂 学海无涯！'},
    {question:'A和B可以变成C，C和D可以变成E。那么E和什么可以变成A？',options:['B','C','D','F'],answer:0,joke:' 😂 E和B可以变成A（EB=亿B=1B≈A... 开玩笑的）'},
    {question:'什么东西有五个头，但人们不觉得它奇怪？',options:['手指','脚趾','怪兽','五头蛇'],answer:1},
    {question:'什么东西一个月来一次，来的时候不用打招呼？',options:['工资','账单','月经','快递'],answer:1},
    {question:'你能做，我能做，大家都能做；一个人能做，两个人不能一起做。这是什么？',options:['做梦','睡觉','吃饭','说话'],answer:0},
    {question:'小明被关在一间没有窗户的房间里，门被锁了，他怎么出去？',options:['撞门','喊救命','从门出去','不用出去'],answer:2,joke:' 😂 既然是"被关在"房间里，说明有门，打开门出去啊！'},
    {question:'什么东西别人请你吃，但你自己从来不想吃？',options:['药','亏','屎','苦瓜'],answer:1,joke:' 😂 吃亏！'},
    {question:'如何用一支笔写出红字和蓝字？',options:['用红蓝笔','先蘸红墨水再蘸蓝墨水','随便写','直接写"红"和"蓝"'],answer:3,joke:' 😂 直接写"红"字和"蓝"字！'},
    {question:'爸爸、妈妈和儿子三人去餐厅吃饭，每人点了一碗面，服务员端来两碗。为什么？',options:['服务员数错了','儿子和爸爸共吃一碗','爷爷爸爸儿子','妈妈不饿'],answer:2,joke:' 😂 爸爸、妈妈和儿子 = 爷爷（爸爸的爸爸）、爸爸、儿子！'},
    {question:'为什么小明考试考了100分还要挨打？',options:['爸爸要求高','三门加起来100分','他作弊了','满分是150'],answer:1,joke:' 😂 三门课加起来100分！'},
    {question:'世界上什么人最穷？',options:['乞丐','我自己','穷人','没有'],answer:3},
    {question:'一个人被从5楼扔下来，为什么没受伤？',options:['掉在气垫上','在做梦','他是被"从5楼扔下来"这句话扔的','他穿了降落伞'],answer:2,joke:' 😂 只是说了这句话而已！'},
    {question:'什么东西你每天都会读到，但从来看不到？',options:['空气','时间','温度','盲文（对盲人来说）'],answer:1},
    {question:'一对健康的夫妇，为什么生出的孩子只有一只左眼？',options:['基因突变','手术拿掉了','每个人本来就只有一只左眼','近亲结婚'],answer:2,joke:' 😂 谁有两只左眼？'},
    {question:'一天，一块三分熟的牛排和一块五分熟的牛排在路上相遇，它们为什么不打招呼？',options:['因为它们不熟','因为不能说话','因为它们都是牛排','因为正在吵架'],answer:0,joke:' 😂 因为它们不熟！'},
    {question:'什么时候有人敲门你绝不会说请进？',options:['你在别人家','在上厕所','在睡觉','你不想见人'],answer:1},
    {question:'地球上什么东西每天要转两圈？',options:['地球','时针','月亮','太阳'],answer:1,joke:' 😂 时针每天转两圈！'},
    {question:'一个黑人和一个白人生了一个婴儿，婴儿的牙齿是什么颜色？',options:['白色','黑色','灰色','婴儿没有牙齿'],answer:3,joke:' 😂 婴儿还没长牙！'},
    {question:'为什么飞机飞那么高还不会撞到星星？',options:['星星很远','星星会躲','飞机晚上不飞','因为星星会闪'],answer:1,joke:' 😂 星星会"闪"啊！'},
    {question:'身份证掉了怎么办？',options:['报警','挂失补办','捡起来','重新办'],answer:2,joke:' 😂 掉了就捡起来啊！'},
    {question:'一只公鹿越跑越快，最后变成了什么？',options:['高速公鹿','跑车','神鹿','飞鹿'],answer:0,joke:' 😂 高速公路（公鹿）！'},
    {question:'什么东西放在太阳底下是干的，放在阴凉处反而湿了？',options:['湿衣服','水','冰','雪'],answer:1,joke:' 😂 冰在阴凉处融化变水就湿了！'},
    {question:'小明说："我前面有5个人，后面有3个人。"一共有几个人？',options:['8个','9个','10个','不知道'],answer:1,joke:' 😂 5+3+小明自己=9个！'},
    {question:'什么东西你拿起来就会变轻？',options:['气球','羽毛','气泡','没有这种东西'],answer:0},
    {question:'什么样的水不能喝？',options:['盐水','泪水','薪水','以上都是'],answer:3},
    {question:'什么问题永远无法回答"是"？',options:['你睡着了吗','你死了吗','你聋了吗','以上都是'],answer:3,joke:' 😂 睡着了就没法回答，死了更不行，聋了听不到问题！'},
    {question:'有一种东西，买的人知道，卖的人知道，只有用的人不知道。是什么？',options:['棺材','药','毒品','礼物'],answer:0,joke:' 😂 棺材——买的人卖的人都知道，只有躺进去的人不知道！'},
  ],
};
