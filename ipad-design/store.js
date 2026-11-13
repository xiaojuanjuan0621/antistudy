/* 知识冒险岛 · 单一数据源
 * 所有页面共用一份状态，存在 localStorage.antistudy.state.v1
 * 任何数值变化都必须走这里，禁止页面里写死数字
 */
(function () {
  var KEY = 'antistudy.state.v1';

  /* 闯关题目来源：默认读内置题库（静态预览用）
   * 接后台后调用 Store.useQuizApi(function(courseId, n){ return [...] })，
   * 后台按「视频 id」返题即可跟上传的视频对应上 */
  var quizApi = null;

  var COURSES = {
    /* 清华数学：讲次内容待后台录入，此处为可运行占位，结构与其他体系一致 */
    series_math_thu: {
      id: 'series_math_thu',
      subject: '数学',
      name: '清华数学 · 四年级',
      attr: '算力',
      lessons: [
        { n: 1, title: '认识更大的数', sub: '万级与亿级的读写', min: 8,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          quiz: [
            { q: '10 个一万是多少？',
              opts: ['十万', '一百万', '一亿'], a: 0,
              why: '10 × 10000 = 100000，也就是十万。' },
            { q: '一个八位数，最高位是什么位？',
              opts: ['百万位', '千万位', '亿位'], a: 1,
              why: '八位数从右往左第八位是千万位。' }
          ] },
        { n: 2, title: '三位数乘两位数', sub: '竖式与进位', min: 9,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          quiz: [
            { q: '竖式计算 123 × 45，第一步算什么？',
              opts: ['123 × 5', '123 × 4', '45 × 5'], a: 0,
              why: '竖式从个位算起，先用 5 乘 123。' },
            { q: '123 × 45 的结果是？',
              opts: ['5535', '55305', '4535'], a: 0,
              why: '123 × 40 + 123 × 5 = 4920 + 615 = 5535。' }
          ] },
        { n: 3, title: '平行与垂直', sub: '同一平面内的位置关系', min: 7,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          quiz: [
            { q: '同一平面内永不相交的两条直线是什么关系？',
              opts: ['平行', '垂直', '重合'], a: 0,
              why: '不相交的两条直线互相平行。' },
            { q: '直角的两条边互相？',
              opts: ['平行', '垂直', '斜交'], a: 1,
              why: '成直角即互相垂直。' }
          ] }
      ]
    },
    series_math_g4: {
      id: 'series_math_g4',
      subject: '数学',
      name: '分数的奥秘全集',
      attr: '算力',
      lessons: [
        { n: 1, title: '分数的初体验', sub: '分披萨与分数的意义', min: 6,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          quiz: [
            { q: '把一个披萨平均分成 4 份，吃掉 1 份，吃掉了几分之几？',
              opts: ['四分之一', '一分之四', '三分之一'], a: 0,
              why: '平均分成 4 份，取其中 1 份，就是四分之一。' },
            { q: '分数 3/4 里，分母 4 表示什么？',
              opts: ['取了几份', '平均分成几份', '一共有几个披萨'], a: 1,
              why: '分母在下面，表示整体被平均分成几份；分子才表示取了几份。' },
            { q: '下面哪个分数比 1 大？',
              opts: ['5/5', '7/4', '3/8'], a: 1,
              why: '分子比分母大，分数就大于 1。7/4 是假分数。' }
          ] },
        { n: 2, title: '等式性质', sub: '真分数与假分数的秘密', min: 7,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          quiz: [
            { q: '下面哪个是真分数？',
              opts: ['9/5', '4/7', '6/6'], a: 1,
              why: '分子小于分母的分数叫真分数，4/7 符合。' },
            { q: '假分数一定大于 1 吗？',
              opts: ['一定大于 1', '一定等于 1', '大于或等于 1'], a: 2,
              why: '分子等于分母时正好等于 1，所以是「大于或等于 1」。' },
            { q: '把 8/4 化成整数是多少？',
              opts: ['2', '4', '8'], a: 0,
              why: '8 除以 4 等于 2，分子能整除分母时就是整数。' }
          ] },
        { n: 3, title: '解方程应用', sub: '分数通分与同分母加减', min: 8,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          quiz: [
            { q: '1/5 + 2/5 等于多少？',
              opts: ['3/10', '3/5', '2/25'], a: 1,
              why: '同分母相加，分母不变，分子相加：1+2=3，所以是 3/5。' },
            { q: '通分的目的是什么？',
              opts: ['把分数变小', '让分母相同好计算', '把分数变成整数'], a: 1,
              why: '分母不同不能直接加减，先通分让分母一样。' },
            { q: '3/4 - 1/4 等于多少？',
              opts: ['2/4', '2/8', '4/4'], a: 0,
              why: '同分母相减，分母不变，分子相减：3-1=2，得 2/4。' }
          ] },
        { n: 4, title: '生活中的分数应用', sub: '分数应用题大通关', min: 9,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          quiz: [
            { q: '一箱牛奶 12 盒，喝掉了 1/4，喝掉几盒？',
              opts: ['3 盒', '4 盒', '8 盒'], a: 0,
              why: '12 平均分成 4 份，每份 3 盒，取 1 份就是 3 盒。' },
            { q: '一根绳子长 8 米，用去 3/8，还剩几米？',
              opts: ['3 米', '5 米', '6 米'], a: 1,
              why: '用去 8×3/8=3 米，还剩 8-3=5 米。' },
            { q: '分数应用题第一步通常做什么？',
              opts: ['直接加减', '找出整体是谁', '先通分'], a: 1,
              why: '先确定「整体」是多少，才知道几分之几对应多少量。' }
          ] }
      ]
    },
    series_bio_g4: {
      id: 'series_bio_g4',
      subject: '探索',
      name: '人体微观细胞与免疫王国',
      attr: '灵感',
      lessons: [
        { n: 1, title: '细胞城堡的司令部', sub: '认识细胞核', min: 7,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          quiz: [
            { q: '细胞里的「司令部」是哪个结构？',
              opts: ['细胞膜', '细胞核', '细胞质'], a: 1,
              why: '细胞核里装着遗传信息，指挥细胞干活。' },
            { q: '细胞的「大门」，控制什么能进出，是哪个结构？',
              opts: ['细胞膜', '细胞核', '线粒体'], a: 0,
              why: '细胞膜包在外面，负责控制物质进出。' },
            { q: '人体大约由多少个细胞组成？',
              opts: ['几百万个', '几十亿个', '几十万亿个'], a: 2,
              why: '成年人体内大约有 30 万亿个细胞。' }
          ] },
        { n: 2, title: '白细胞卫士出动', sub: '人体免疫防线大战', min: 8,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          quiz: [
            { q: '人体里负责「吃掉」病菌的细胞是？',
              opts: ['红细胞', '白细胞', '神经细胞'], a: 1,
              why: '白细胞会包围并吞噬病菌，是免疫主力。' },
            { q: '发烧其实是身体在做什么？',
              opts: ['系统坏了', '升高温度对付病菌', '长个子'], a: 1,
              why: '适度升温能抑制病菌繁殖，是免疫反应的一部分。' },
            { q: '皮肤属于人体的第几道防线？',
              opts: ['第一道', '第二道', '第三道'], a: 0,
              why: '皮肤和黏膜是阻挡病菌的第一道物理防线。' }
          ] }
      ]
    },
    series_chinese_xes: {
      id: 'series_chinese_xes',
      subject: '语文',
      name: '学而思大语文',
      attr: '文心',
      preview: true,
      lessons: [
        { n: 1, title: '古诗里的月亮', sub: '《静夜思》精读', min: 6,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          quiz: [
            { q: '《静夜思》的作者是谁？',
              opts: ['杜甫', '李白', '王维'], a: 1,
              why: '李白，唐代诗人，这首诗写他在异乡夜里想家。' },
            { q: '「疑是地上霜」里的「疑」是什么意思？',
              opts: ['怀疑、好像', '疑问', '决定'], a: 0,
              why: '「疑」在这里是「好像」，月光白得像地上的霜。' },
            { q: '这首诗表达的主要情感是？',
              opts: ['高兴', '思念家乡', '生气'], a: 1,
              why: '「举头望明月，低头思故乡」，核心是想家。' }
          ] },
        { n: 2, title: '阅读题怎么找答案', sub: '关键词定位法', min: 7,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          quiz: [
            { q: '做阅读题时，第一步最该做什么？',
              opts: ['先看答案', '先读题目问什么', '先背全文'], a: 1,
              why: '先看清问题，才知道要在文章里找什么。' },
            { q: '题目里出现的原词，在文中怎么用？',
              opts: ['直接忽略', '当线索去定位段落', '抄下来当答案'], a: 1,
              why: '题目关键词就是路标，帮你快速找到对应段落。' },
            { q: '找到句子后还差一步是什么？',
              opts: ['用自己的话概括回答', '原句照抄', '随便写'], a: 0,
              why: '低年级可以摘抄，高年级要求用完整句子概括，答到点上。' }
          ] }
      ]
    },
    series_english_tbd: {
      id: 'series_english_tbd',
      subject: '英语',
      name: '英语启蒙体系',
      attr: '共鸣',
      preview: true,
      lessons: [
        { n: 1, title: 'Hello! 打招呼', sub: '自我介绍三句话', min: 6,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          quiz: [
            { q: '「我叫小明」用英语怎么说？',
              opts: ['I am Xiaoming', 'My name Xiaoming', 'I Xiaoming'], a: 0,
              why: 'I am + 名字，最简单的自我介绍。' },
            { q: '别人说 How are you? 你可以回答？',
              opts: ["I'm fine, thank you", 'My name is Tom', 'I am nine'], a: 0,
              why: 'How are you 问的是状态，回答 I am fine 就对了。' },
            { q: 'Good morning 适合什么时候说？',
              opts: ['晚上', '早上', '睡前'], a: 1,
              why: 'morning 是早上，下午用 Good afternoon。' }
          ] },
        { n: 2, title: 'Numbers 数字 1-20', sub: '数数与年龄表达', min: 7,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
          quiz: [
            { q: '数字 12 的英文是？',
              opts: ['twelve', 'twelfth', 'twenty'], a: 0,
              why: 'twelve 是 12，twenty 是 20，别记混。' },
            { q: '「我九岁」怎么说？',
              opts: ['I am nine year', 'I am nine years old', 'I have nine'], a: 1,
              why: '年龄固定句型：I am + 数字 + years old。' },
            { q: '13 到 19 的单词都以什么结尾？',
              opts: ['-ty', '-teen', '-th'], a: 1,
              why: 'thirteen、fourteen… 十几都以 -teen 结尾，几十才是 -ty。' }
          ] }
      ]
    }
  };

  /* ---------- 演示数据：乐读数学补到 20 讲 ----------
   * 只用于预览「多讲」时的列表样式（课程页卡片行横向滚动、播放页右侧目录滚动）
   * 接后台真实课程后整段删掉即可，不影响其它逻辑
   */
  (function () {
    var c = COURSES.series_math_g4;
    var clips = c.lessons.map(function (l) { return l.video; });
    var extra = [
      ['分数乘法（一）', '分数 × 整数怎么算', 8],
      ['分数乘法（二）', '分数 × 分数与约分', 9],
      ['分数除法入门', '除以一个数等于乘它的倒数', 8],
      ['分数与小数', '互化方法与大小比较', 7],
      ['混合运算顺序', '先乘除后加减', 9],
      ['简便计算技巧', '乘法分配律的妙用', 8],
      ['求几分之几', '单位「1」怎么找', 10],
      ['分数应用题', '画图分析数量关系', 9],
      ['比的意义', '比、除法与分数的关系', 8],
      ['按比分配', '生活中的分配问题', 9],
      ['百分数初识', '百分数表示什么', 8],
      ['百分数与分数', '互化与比较大小', 9],
      ['折扣与成数', '百分数在购物的应用', 10],
      ['期中复习', '分数与百分数串讲', 11],
      ['综合应用', '生活中的数学问题', 10],
      ['期末挑战', '思维拓展训练', 12]
    ];
    extra.forEach(function (e, i) {
      var n = 5 + i;
      c.lessons.push({
        n: n, title: e[0], sub: e[1], min: e[2],
        video: clips[(n - 1) % clips.length],
        quiz: c.lessons[0].quiz
      });
    });
  })();

  /* 可选年级（后台可配）：课程页右上角下拉的选项，顺序即显示顺序 */
  var GRADES = ['四年级', '五年级', '六年级'];

  /* 学科 → 课程体系（后台可配）
   * 数组顺序即课程页顶部 tab 顺序：增删一项就增删一个 tab，页面代码不用动
   * id 必须对应上面 COURSES 里的键，对不上的会被自动跳过
   * grade 用于年级下拉筛选，省略则按四年级算
   */
  var SERIES = {
    '数学': [
      { id: 'series_math_thu', tab: '清华数学', grade: '四年级' },
      { id: 'series_math_g4', tab: '乐读数学', grade: '四年级' }
    ],
    '语文': [{ id: 'series_chinese_xes', tab: '学而思语文', grade: '四年级' }],
    '英语': [{ id: 'series_english_tbd', tab: '英语启蒙', grade: '四年级' }],
    '探索': [{ id: 'series_bio_g4', tab: '科普合集', grade: '四年级' }]
  };

  var ATTRS = [
    { key: '文心', label: '文心', subject: '语文', color: '#3692FF', desc: '阅读与表达' },
    { key: '算力', label: '算力', subject: '数学', color: '#2FC56E', desc: '逻辑与推理' },
    { key: '共鸣', label: '共鸣', subject: '英语', color: '#FF8C26', desc: '语感与听力' },
    { key: '灵感', label: '灵感', subject: '探索', color: '#A539F3', desc: '好奇与发现' }
  ];

  /* 商城商品：分类统一为 道具 / 装备 / 服装 / 宠物 */
  var ITEMS = [
    { id: 'potion', name: '经验药水', icon: 'assets/mall2-i-potion.png', bagIcon: 'assets/bag2-potion.png',
      cat: '道具', price: 90, kind: 'consume', desc: '使用后经验 +100' },
    { id: 'star', name: '星星卡', icon: 'assets/mall2-i-star.png', bagIcon: 'assets/task-star.png',
      cat: '道具', price: 120, kind: 'consume', desc: '使用后经验 +50' },
    { id: 'scroll', name: '加速卷轴', icon: 'assets/mall2-i-scroll.png', bagIcon: 'assets/mall2-i-scroll.png',
      cat: '道具', price: 380, kind: 'consume', desc: '使用后经验 +80' },
    { id: 'hat', name: '活动帽', icon: 'assets/mall2-i-hat.png', bagIcon: 'assets/mall2-i-hat.png',
      cat: '装备', price: 260, kind: 'own', desc: '宠物头饰 · 永久' },
    { id: 'wings', name: '天使翅膀', icon: 'assets/mall2-i-wings.png', bagIcon: 'assets/mall2-i-wings.png',
      cat: '装备', price: 600, kind: 'own', desc: '出战特效 · 永久' },
    { id: 'wand', name: '魔法棒', icon: 'assets/mall2-i-wand.png', bagIcon: 'assets/mall2-i-wand.png',
      cat: '装备', price: 888, kind: 'own', desc: '战斗加成 · 永久' },
    { id: 'schoolbag', name: '酷炫书包', icon: 'assets/mall2-i-bag.png', bagIcon: 'assets/mall2-i-bag.png',
      cat: '服装', price: 420, kind: 'own', desc: '人物装扮 · 永久' },
    { id: 'egg', name: '神秘宠物蛋', icon: 'assets/bag2-egg.png', bagIcon: 'assets/bag2-egg.png',
      cat: '宠物', price: 850, kind: 'own', desc: '开出一只新伙伴' }
  ];

  /* 背包初始物品（id 与商品 id 打通，买了同类会累加数量） */
  var BASE_INV = [
    { id: 'dragon', name: '小龙', icon: 'assets/bag2-dragon.png', cat: '宠物', count: 1 },
    { id: 'raw_egg', name: '宠物蛋', icon: 'assets/bag2-egg.png', cat: '宠物', count: 1 },
    { id: 'stone_pack', name: '灵石', icon: 'assets/bag2-stone.png', cat: '道具', count: 3 },
    { id: 'potion', name: '经验药水', icon: 'assets/bag2-potion.png', cat: '道具', count: 3 },
    { id: 'dust', name: '星尘碎片', icon: 'assets/bag2-dust.png', cat: '道具', count: 10 },
    { id: 'pet_clothes', name: '宠物服装', icon: 'assets/bag2-clothes.png', cat: '服装', count: 1 }
  ];

  /* ---------- 内容馆数据 ----------
   * 首页三个入口：绘本馆 → 少年阅览室 / 音乐馆 → 有声故事馆 / 动画馆 → 知识冒险岛视频
   * 家长中心「内容馆」可增删改，保存后写进 catalog.json 覆盖这里
   */

  var BOOKS = [
    {
      id: 'book_01',
      title: '昆虫记·神奇的蜣螂与夏日蝉鸣',
      author: '法布尔（法）',
      category: '自然探索',
      cover: 'assets/hall/book_insects.jpg',
      minutes: 10,
      readCount: 36,
      done: true,
      summary: '跟随伟大的昆虫学家法布尔，观察大自然中微小生命的智慧与坚韧。',
      content: '【第一章：聪明的蜣螂工程师】\n\n阳光洒满南法的荒原，微风中夹杂着百里香的气息。在厚厚的泥土下，一个微小的生命正在忙碌。\n\n这就是蜣螂——大自然中最勤勉的清道夫。它们用扁平如铲子的头部和强劲有力的前足，将散落的有机碎屑一点一点聚集起来。在它的灵巧制作下，一个圆滚滚的小球逐渐成型。\n\n这不仅仅是一个小泥球，这是它们精心培育后代的庇护所与粮仓。蜣螂用倒推的方式，在崎岖不平的土地上推动着比自己重数倍的泥球前行。即使遇到陡坡跌落，它也从不放弃，重新爬起继续前行。\n\n【第二章：夏日树梢的歌唱家】\n\n“知了——知了——”，盛夏的阳光把大地烤得滚烫，而在高高的白杨树上，蝉正在不知疲倦地放声高歌。\n\n很多人以为蝉的歌声只是为了热闹，其实这是雄蝉独特的发声器官在振动。在泥土黑暗深处蛰伏了四年甚至更久的蝉蛹，只有在这个夏天短短的几个星期里，才能在阳光下尽情飞翔和歌唱。生命虽短，却绚烂无比！'
    },
    {
      id: 'book_02',
      title: '中国古代神话·后羿射日与女娲补天',
      author: '传统神话整理',
      category: '国学经典',
      cover: 'assets/hall/book_myth.jpg',
      minutes: 8,
      readCount: 24,
      done: false,
      summary: '感受中华上古先民战胜自然、勇于担当的英雄史诗。',
      content: '【上篇：女娲炼石补苍天】\n\n往古之时，四极废，九州裂，天不兼覆，地不周载。烈火炎炎不熄，洪水浩浩不息。\n\n女娲目睹人类受难，心生慈悲。她踏遍三山五岳，寻找五色神石。经过九九八十一天的熔炼，终于将苍天补好。天地重归宁静，万物生机勃勃。\n\n【下篇：后羿神箭挽狂澜】\n\n相传尧帝之时，十日并出，焦禾稼，杀草木，而民无所食。\n\n英雄后羿挺身而出，手持红色的神弓，搭上白色的神箭。他登上昆仑之巅，凝神聚气，“嗖！嗖！嗖！”九支神箭破空而出，九个太阳化作金乌坠落，留下一轮温和的太阳造福人间。百姓欢呼雀跃，大地重现生机！'
    },
    {
      id: 'book_03',
      title: '海底两万里·潜入神秘的鹦鹉螺号',
      author: '儒勒·凡尔纳',
      category: '科幻冒险',
      cover: 'assets/hall/book_sea.jpg',
      minutes: 12,
      readCount: 18,
      done: false,
      summary: '尼摩船长带着阿龙纳斯教授，在深邃莫测的太平洋深处展开了一场壮丽的大冒险。',
      content: '【第一章：来自深海的怪兽】\n\n1866 年，全世界的航海界都被一件不可思议的怪事震惊了。几艘远洋轮船在公海上遇到了一头巨大而神秘的“海怪”，它不仅身形庞大，而且速度极快，甚至能发出奇异的冷光。\n\n阿龙纳斯教授登上了“林肯号”驱逐舰前往探寻真相。然而在一场激烈的遭遇战中，教授与仆人康塞尔不幸落水，意外爬上了这个怪物的脊背——他们惊讶地发现，这根本不是什么海怪，而是一艘由坚硬钢板打造的钢铁巨潜艇！\n\n【第二章：尼摩船长的奇幻世界】\n\n舱门缓缓打开，神秘的尼摩船长出现在他们面前。“欢迎登上鹦鹉螺号，”船长目光深邃而坚定，“在这片广袤无垠的深海之中，我们拥有绝对的自由与宁静！”\n\n透过巨大的水晶舷窗，海底世界如梦如幻：发光的珊瑚林、五彩斑斓的热带鱼群、沉睡千年的古城遗迹……一场震撼心灵的深海科幻之旅正式开启！'
    }
  ];

  /* 有声按「专辑 → 单集」组织，与线上内容一致 */
  var AUDIOS = [
    {
      id: 'album_demo',
      name: '经典故事 · 精选',
      subject: '语文',
      category: '国学经典',
      cover: 'assets/hall/audio_wukong.jpg',
      speaker: '小拓 AI 播音员',
      episodes: [
        {
          id: 'audio_01',
          title: '大闹天宫：齐天大圣勇闯南天门',
          speaker: '小拓 AI 播音员',
          seconds: 240,
          url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3'
        },
        {
          id: 'audio_02',
          title: '宇宙探秘：黑洞到底有多神奇？',
          speaker: '科学探索号',
          seconds: 180,
          url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverending_Story.mp3'
        },
        {
          id: 'audio_03',
          title: '早读古诗：春晓 & 望庐山瀑布',
          speaker: '国学雅韵',
          seconds: 210,
          url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3'
        }
      ]
    }
  ];

  var VIDEOS = [
    {
      id: 'series_math_g4',
      name: '分数的奥秘全集',
      subject: '数学',
      cover: 'assets/hall/series_math.jpg',
      desc: '小学四年级数学 · 从分披萨开始真正理解分数',
      episodes: [
        { n: 1, title: '第1讲：分数的初体验（分披萨的秘密）', sub: '分数的意义与读写', seconds: 360,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
        { n: 2, title: '第2讲：真分数与假分数的秘密', sub: '大于 1 的思考', seconds: 420,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
        { n: 3, title: '第3讲：分数通分与同分母加减法', sub: '通分技巧与计算', seconds: 480,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
        { n: 4, title: '第4讲：生活中的分数应用题大通关', sub: '画图分析数量关系', seconds: 520,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' }
      ]
    },
    {
      id: 'series_bio_g4',
      name: '人体与细胞微观王国',
      subject: '探索',
      cover: 'assets/hall/series_bio.jpg',
      desc: '少年探索课 · 走进身体里的微观世界',
      episodes: [
        { n: 1, title: '第1讲：细胞城堡的司令部', sub: '认识细胞核', seconds: 390,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
        { n: 2, title: '第2讲：白细胞卫士出动！', sub: '人体免疫防线大战', seconds: 450,
          video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' }
      ]
    }
  ];

  /* 新用户真实起点：不再用 demo 数字冒充行为数据
   * stone 是新手礼包（够买一件小道具），打卡/经验从 0 开始 */
  var DEFAULT = {
    v: 1,
    user: { name: '小星星', avatar: 'assets/home2-boy.png' },
    stone: 500,
    exp: 0,
    egg: '',
    pet: { name: '小龙', hatch: 0, attrs: { 文心: 0, 算力: 0, 共鸣: 0, 灵感: 0 } },
    lessons: {},
    tasks: {},
    taskDate: '',
    streak: 0,
    lastCheckin: '',
    lastLesson: '',
    reward: null,
    inventory: {
      dragon: { count: 1, owned: true },
      raw_egg: { count: 1, owned: true },
      stone_pack: { count: 3, owned: false },
      potion: { count: 3, owned: false },
      dust: { count: 10, owned: false },
      pet_clothes: { count: 1, owned: true }
    }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function load() {
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) {}
    if (!raw) {
      var s = clone(DEFAULT);
      try {
        var egg = localStorage.getItem('antistudy.egg');
        if (egg) s.egg = egg;
      } catch (e) {}
      save(s);
      return s;
    }
    try {
      var p = JSON.parse(raw);
      var base = clone(DEFAULT);
      for (var k in p) if (p.hasOwnProperty(k)) base[k] = p[k];
      return base;
    } catch (e) { return clone(DEFAULT); }
  }

  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }

  var state = load();

  /* 统一 YYYY-MM-DD（补零），跨月/跨年比较才不会错 */
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function dayOf(str) {
    var p = String(str || '').split('-');
    if (p.length !== 3) return null;
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d.getTime()) ? null : d;
  }
  /* 上一次打卡是不是「昨天」，用来判断连续打卡要不要断签 */
  function isYesterday(str) {
    var prev = dayOf(str);
    if (!prev) return false;
    var n = new Date();
    var t = new Date(n.getFullYear(), n.getMonth(), n.getDate());
    return Math.round((t - prev) / 86400000) === 1;
  }

  function levelOf(exp) { return Math.floor(exp / 200) + 1; }
  function expOfLevel(exp) { return exp % 200; }

  function attrTotal(s) {
    var t = 0;
    for (var k in s.pet.attrs) t += s.pet.attrs[k];
    return t;
  }

  function stageOf(s) {
    if (s.pet.hatch < 100) return 'egg';
    if (attrTotal(s) < 160) return 'baby';
    return 'grown';
  }

  /* 进化门槛：三条达标 + 短板不低于下限，不要求四维全满 */
  function evolveInfo(s) {
    var a = s.pet.attrs;
    var total = attrTotal(s);
    var min = Math.min(a.文心, a.算力, a.共鸣, a.灵感);
    var passed = 0;
    for (var k in a) if (a[k] >= 40) passed++;
    return {
      total: total,
      min: min,
      needTotal: 200,
      needAttrs: 40,
      needMin: 20,
      passedCount: passed,
      canEvolve: total >= 200 && passed >= 3 && min >= 20
    };
  }

  var Store = {
    ATTRS: ATTRS,
    COURSES: COURSES,
    ITEMS: ITEMS,
    BASE_INV: BASE_INV,
    BOOKS: BOOKS,
    AUDIOS: AUDIOS,
    VIDEOS: VIDEOS,

    get: function () { return state; },
    refresh: function () { state = load(); return state; },
    save: function () { return save(state); },

    level: function () { return levelOf(state.exp); },
    expPct: function () { return Math.round((expOfLevel(state.exp) / 200) * 100); },
    expInLevel: function () { return expOfLevel(state.exp); },

    attrTotal: function () { return attrTotal(state); },
    stage: function () { return stageOf(state); },
    evolveInfo: function () { return evolveInfo(state); },

    getCourse: function (id) { return COURSES[id] || null; },

    /* 取某一讲的闯关题：默认读 COURSES 里的内置题库
     * 接后台后先 useQuizApi(fn)，fn 返回按视频/讲次对应的题目数组 */
    quizOf: function (courseId, n) {
      if (quizApi) {
        try {
          var fromApi = quizApi(courseId, n);
          if (fromApi && fromApi.length) return fromApi;
        } catch (e) {}
      }
      var c = COURSES[courseId];
      if (!c) return [];
      for (var i = 0; i < c.lessons.length; i++) {
        if (c.lessons[i].n === n) return c.lessons[i].quiz || [];
      }
      return [];
    },
    useQuizApi: function (fn) { quizApi = fn; },

    /* 课程页 tab 的数据源：某学科下可切换的课程体系（顺序来自 SERIES 配置） */
    seriesOf: function (subject, grade) {
      return (SERIES[subject] || [])
        .filter(function (s) {
          return !!COURSES[s.id] && (!grade || (s.grade || '四年级') === grade);
        })
        .map(function (s) {
          return {
            id: s.id,
            name: s.tab || COURSES[s.id].name,
            grade: s.grade || '四年级',
            course: COURSES[s.id]
          };
        });
    },
    subjects: function () { return Object.keys(SERIES); },
    grades: function () { return GRADES.slice(); },

    /* 学科 → 宠物/角色属性（语文=文心、数学=算力、英语=共鸣、探索=灵感） */
    attrOf: function (subject) {
      for (var i = 0; i < ATTRS.length; i++) {
        if (ATTRS[i].subject === subject) return ATTRS[i];
      }
      return null;
    },
    allSeries: function () { return SERIES; },

    /* 后台「添加 / 上传课程体系」的入口
     * 后台接口返回 [{ subject, id, tab, course:{...} }] 后调一次：
     *   Store.addSeries(list)
     * 课程页 tab 立刻多出这一项，不需要改任何页面代码
     */
    addSeries: function (list) {
      (list || []).forEach(function (s) {
        if (!s || !s.subject || !s.id) return;
        if (s.course && !COURSES[s.id]) COURSES[s.id] = s.course;
        if (!COURSES[s.id]) return;
        if (!SERIES[s.subject]) SERIES[s.subject] = [];
        var exists = SERIES[s.subject].some(function (x) { return x.id === s.id; });
        if (!exists) {
          SERIES[s.subject].push({ id: s.id, tab: s.tab || COURSES[s.id].name });
        }
      });
      /* 通知页面重渲染 tab，不用刷新 */
      try { window.dispatchEvent(new CustomEvent('store:series')); } catch (e) {}
      return SERIES;
    },

    /* ---------- 商城 / 背包 ---------- */

    getItem: function (id) {
      for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i];
      return null;
    },

    /* 某商品的持有情况 */
    owned: function (id) {
      var inv = state.inventory[id];
      return inv || null;
    },

    /* 能否购买，返回拦截原因 */
    canBuy: function (item) {
      if (!item) return { ok: false, reason: 'none' };
      var inv = state.inventory[item.id];
      if (item.kind === 'own' && inv && inv.owned) return { ok: false, reason: 'owned' };
      if (state.stone < item.price) {
        return { ok: false, reason: 'stone', lack: item.price - state.stone };
      }
      return { ok: true };
    },

    /* 购买：扣灵石 + 入库。返回 { ok, reason, lack, left, count } */
    buyItem: function (id) {
      state = load();
      var item = this.getItem(id);
      var chk = this.canBuy(item);
      if (!chk.ok) return chk;

      state.stone -= item.price;
      var inv = state.inventory[id] || { count: 0, owned: false };
      if (item.kind === 'own') inv.owned = true;
      else inv.count += 1;
      state.inventory[id] = inv;
      save(state);

      return {
        ok: true,
        left: state.stone,
        count: item.kind === 'own' ? 1 : inv.count
      };
    },

    /* 使用消耗品：返回 { ok, msg, gain, left } */
    useItem: function (id) {
      state = load();
      var item = this.getItem(id);
      var inv = state.inventory[id];
      if (!item) return { ok: false, msg: '这是收藏品，不能直接使用' };
      if (item.kind !== 'consume') return { ok: false, msg: '永久装备 · 已经收进背包啦' };
      if (!inv || !inv.count) return { ok: false, msg: '已经用完啦 · 去商城再换一个' };

      var gain = 0;
      if (id === 'potion') { gain = 100; state.exp += gain; }
      else if (id === 'star') { gain = 50; state.exp += gain; }
      else if (id === 'scroll') { gain = 80; state.exp += gain; }

      inv.count -= 1;
      save(state);
      return { ok: true, gain: gain, left: inv.count };
    },

    /* 背包全量列表（初始物品 + 商城购入），按类别过滤 */
    bagList: function (cat) {
      var out = [];
      var seen = {};
      BASE_INV.forEach(function (b) {
        var inv = state.inventory[b.id];
        if (!inv) return;
        out.push({
          id: b.id, name: b.name, icon: b.icon, cat: b.cat,
          count: inv.owned ? 1 : (inv.count || 0), owned: !!inv.owned
        });
        seen[b.id] = true;
      });
      Object.keys(state.inventory).forEach(function (id) {
        if (seen[id]) return;
        var it = null;
        for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) it = ITEMS[i];
        if (!it) return;
        var inv = state.inventory[id];
        out.push({
          id: id, name: it.name, icon: it.bagIcon || it.icon, cat: it.cat,
          count: inv.owned ? 1 : (inv.count || 0), owned: !!inv.owned
        });
      });
      if (cat && cat !== '全部') out = out.filter(function (x) { return x.cat === cat; });
      return out;
    },

    lessonsOf: function (id) {
      var c = COURSES[id];
      return c ? c.lessons : [];
    },

    /* 某讲是否解锁：第 1 讲永远开，后面要前一讲已完成 */
    isUnlocked: function (courseId, n) {
      if (n <= 1) return true;
      var prev = state.lessons[courseId + ':' + (n - 1)];
      return !!(prev && prev.done);
    },

    isDone: function (courseId, n) {
      var r = state.lessons[courseId + ':' + n];
      return !!(r && r.done);
    },

    /* 是否已学过：看完视频（watched）或闯关通过（done）都算
     * 课程列表卡片的「已学完」与进度统计用它；闯关发奖仍只看 done */
    isLearned: function (courseId, n) {
      var r = state.lessons[courseId + ':' + n];
      return !!(r && (r.done || r.watched));
    },

    /* 标记「本讲视频已看完」：只记观看状态，不发奖励、不算闯关通过 */
    markWatched: function (courseId, n) {
      state = load();
      var key = this.lessonKey(courseId, n);
      var rec = state.lessons[key];
      if (rec && (rec.watched || rec.done)) return false;
      rec = rec || {};
      rec.watched = true;
      rec.watchAt = Date.now();
      state.lessons[key] = rec;
      state.lastLesson = key;
      save(state);
      return true;
    },

    /* 当前应该学第几讲（第一个还没学过的） */
    currentLesson: function (courseId) {
      var ls = this.lessonsOf(courseId);
      for (var i = 0; i < ls.length; i++) {
        if (!this.isLearned(courseId, ls[i].n)) return ls[i];
      }
      return ls[ls.length - 1];
    },

    doneCount: function (courseId) {
      var ls = this.lessonsOf(courseId), n = 0;
      for (var i = 0; i < ls.length; i++) if (this.isDone(courseId, ls[i].n)) n++;
      return n;
    },

    /* 已学过（看过视频或闯关通过）的讲次数 */
    learnedCount: function (courseId) {
      var ls = this.lessonsOf(courseId), n = 0;
      for (var i = 0; i < ls.length; i++) if (this.isLearned(courseId, ls[i].n)) n++;
      return n;
    },

    lessonKey: function (courseId, n) { return courseId + ':' + n; },

    /* 完课：唯一发放入口。返回 {stone, exp, first, lesson} */
    completeLesson: function (courseId, n) {
      /* 写之前先拉一次最新状态：避免两个标签页各自拿旧数据判 first、互相覆盖 */
      state = load();
      var key = this.lessonKey(courseId, n);
      var rec = state.lessons[key];
      var first = !(rec && rec.done);
      var ls = this.lessonsOf(courseId);
      var lesson = null;
      for (var i = 0; i < ls.length; i++) if (ls[i].n === n) lesson = ls[i];
      if (!lesson) return null;

      state.lessons[key] = { done: true, at: Date.now() };
      state.lastLesson = key;

      var gainStone = first ? 20 : 0;
      var gainExp = first ? 60 : 0;
      if (first) {
        state.stone += gainStone;
        state.exp += gainExp;
        var attr = (COURSES[courseId] && COURSES[courseId].attr) || '灵感';
        state.pet.attrs[attr] = (state.pet.attrs[attr] || 0) + 2;
        this.markTask(courseId === 'series_bio_g4' ? 'science' : 'math');
      }
      save(state);
      return { stone: gainStone, exp: gainExp, first: first, lesson: lesson };
    },

    /* 每日任务 */
    getTasks: function () {
      if (state.taskDate !== today()) {
        state.taskDate = today();
        state.tasks = {};
        save(state);
      }
      return state.tasks;
    },

    markTask: function (key) {
      if (state.taskDate !== today()) {
        state.taskDate = today();
        state.tasks = {};
      }
      if (state.tasks[key]) return false;
      state.tasks[key] = true;
      save(state);
      return true;
    },

    taskCount: function (total) {
      var t = this.getTasks(), n = 0;
      var KEYS = ['chinese', 'math', 'english', 'science', 'battle'];
      for (var i = 0; i < KEYS.length; i++) if (t[KEYS[i]]) n++;
      return { done: n, total: total || KEYS.length };
    },

    /* 喂养：消耗 20 灵石，指定属性 +1，破壳 +2。最弱属性 1.5 倍（+2） */
    feed: function (attrKey) {
      if (state.stone < 20) return { ok: false, msg: '灵石不够啦 · 去完成课程赚灵石' };
      var a = state.pet.attrs;
      var min = Math.min(a.文心, a.算力, a.共鸣, a.灵感);
      var bonus = (a[attrKey] === min) ? 2 : 1;
      state.stone -= 20;
      a[attrKey] = (a[attrKey] || 0) + bonus;
      state.pet.hatch = Math.min(100, state.pet.hatch + 2);
      save(state);
      return { ok: true, gain: bonus, bonus: bonus > 1, hatch: state.pet.hatch };
    },

    /* 任务是否全部完成：每个学科任意体系学完 1 讲 + 打过一次灵宠挑战 */
    canClaimTasks: function () {
      state = load();
      var subs = Object.keys(SERIES);
      for (var i = 0; i < subs.length; i++) {
        var list = SERIES[subs[i]], okSub = false;
        for (var j = 0; j < list.length; j++) {
          if (this.learnedCount(list[j].id) > 0) { okSub = true; break; }
        }
        if (!okSub) return false;
      }
      return !!state.tasks.battle;
    },

    /* 领取全部任务奖励：只领一次，且必须真的全部完成 */
    claimTasks: function () {
      state = load();
      if (state.tasks.__claimed) return { ok: false, msg: '今天的奖励已经领过啦' };
      if (!this.canClaimTasks()) return { ok: false, msg: '还有任务没完成哦' };
      state.tasks.__claimed = true;
      state.stone += 50;
      state.exp += 100;
      save(state);
      return { ok: true, stone: 50, exp: 100 };
    },

    /* 打卡：断一天就从头算，连续天数才有意义 */
    checkin: function () {
      state = load();
      if (state.lastCheckin === today()) return { ok: false, streak: state.streak };
      state.streak = isYesterday(state.lastCheckin) ? state.streak + 1 : 1;
      state.lastCheckin = today();
      state.stone += 10;
      save(state);
      return { ok: true, streak: state.streak, stone: 10 };
    },

    setEgg: function (id) {
      state = load();
      state.egg = id;
      try { localStorage.setItem('antistudy.egg', id); } catch (e) {}
      save(state);
    },
    hasEgg: function () {
      state = load();
      if (state.egg) return true;
      try { return !!localStorage.getItem('antistudy.egg'); } catch (e) { return false; }
    },

    setReward: function (r) { state = load(); state.reward = r; save(state); },

    /* 答对即到账：奖励只是给用户看的结算单。
     * 这里读而不清空，刷新奖励页也能看到同一组数字；下次闯关会被覆盖 */
    peekReward: function () { state = load(); return state.reward; },

    /* 旧接口保留：读取并清空 */
    takeReward: function () {
      state = load();
      var r = state.reward;
      state.reward = null;
      save(state);
      return r;
    },

    reset: function () {
      state = clone(DEFAULT);
      try { localStorage.removeItem('antistudy.egg'); } catch (e) {}
      save(state);
    },

    fmt: function (n) {
      return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    toast: function (msg) {
      var el = document.getElementById('toast');
      if (!el) return;
      el.textContent = msg;
      el.classList.add('show');
      clearTimeout(el.__tm);
      el.__tm = setTimeout(function () { el.classList.remove('show'); }, 1600);
    },

    /* 通用弹窗：跟随 .stage 缩放，风格全站统一
     * opts: {icon, badge, title, desc, ok, cancel, onOk, onCancel, tone:'warn'|'ok'}
     */
    modal: function (opts) {
      opts = opts || {};
      this._modalCss();
      var host = document.querySelector('.stage') || document.body;
      var old = host.querySelector('.sm-mask');
      if (old && old.parentNode) old.parentNode.removeChild(old);

      var wrap = document.createElement('div');
      wrap.className = 'sm-mask';

      var iconHtml = opts.icon
        ? '<i class="sm-ico' + (opts.tone === 'warn' ? ' warn' : '') + '">' +
          '<img src="' + opts.icon + '" alt="">' +
          (opts.badge ? '<b>' + opts.badge + '</b>' : '') + '</i>'
        : '';

      wrap.innerHTML =
        '<div class="sm-card">' +
        iconHtml +
        '<div class="sm-title">' + (opts.title || '') + '</div>' +
        '<div class="sm-desc">' + (opts.desc || '') + '</div>' +
        '<div class="sm-btns">' +
        (opts.cancel ? '<div class="sm-btn ghost" data-act="cancel">' + opts.cancel + '</div>' : '') +
        '<div class="sm-btn gold" data-act="ok">' + (opts.ok || '知道啦') + '</div>' +
        '</div></div>';

      host.appendChild(wrap);

      var close = function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); };
      wrap.querySelector('[data-act="ok"]').addEventListener('click', function () {
        close();
        if (opts.onOk) opts.onOk();
      });
      var c = wrap.querySelector('[data-act="cancel"]');
      if (c) c.addEventListener('click', function () {
        close();
        if (opts.onCancel) opts.onCancel();
      });
      wrap.addEventListener('click', function (e) {
        if (e.target === wrap) { close(); if (opts.onCancel) opts.onCancel(); }
      });
      return close;
    },

    _modalCss: function () {
      if (document.getElementById('sm-style')) return;
      var st = document.createElement('style');
      st.id = 'sm-style';
      st.textContent = [
        '.sm-mask{left:0;top:0;width:1366px;height:1024px;background:rgba(6,20,52,.58);',
        'display:flex;align-items:center;justify-content:center;z-index:9998}',
        '.sm-card{position:relative;left:auto;top:auto;width:540px;border-radius:36px;',
        'background:#fff;box-shadow:0 24px 70px rgba(4,18,52,.45);padding:44px 44px 38px;',
        'display:flex;flex-direction:column;align-items:center;text-align:center}',
        '.sm-ico{position:relative;left:auto;top:auto;width:92px;height:92px;margin-bottom:20px;',
        'display:flex;align-items:center;justify-content:center;border-radius:26px;background:#EEF5FF}',
        '.sm-ico img{position:static;width:66px;height:66px;object-fit:contain}',
        '.sm-ico.warn{background:#FFF1EE}',
        '.sm-ico b{position:absolute;right:-6px;top:-6px;width:38px;height:38px;border-radius:19px;',
        'background:linear-gradient(180deg,#FF8A5B,#E23B3B);color:#fff;font-size:24px;font-weight:900;',
        'font-style:normal;display:flex;align-items:center;justify-content:center;',
        'border:3px solid #fff;box-shadow:0 4px 10px rgba(226,59,59,.4)}',
        '.sm-title{position:static;font-size:34px;font-weight:900;color:#11284F;line-height:1.2}',
        '.sm-desc{position:static;margin-top:14px;font-size:19px;line-height:1.6;color:#6E86A6}',
        '.sm-desc em{position:static;font-style:normal;font-weight:900;color:#FF7A2F}',
        '.sm-btns{position:static;margin-top:32px;display:flex;gap:16px;width:100%}',
        '.sm-btn{position:static;flex:1;height:88px;border-radius:44px;display:flex;',
        'align-items:center;justify-content:center;font-size:28px;font-weight:900;cursor:pointer;',
        'transition:transform .12s}',
        '.sm-btn:active{transform:scale(.97)}',
        '.sm-btn.ghost{background:#EEF3FB;color:#5C7396}',
        '.sm-btn.gold{background:linear-gradient(180deg,#FFF797 0%,#FFDA2A 45%,#FF9A00 100%);',
        'color:#702500;border:4px solid #FFF4A8;box-shadow:0 5px 0 rgba(237,102,0,.75)}'
      ].join('');
      document.head.appendChild(st);
    },

    /* 统一底部导航 */
    go: function (name) {
      var map = {
        '首页': 'home.html', '任务': 'task.html', '战斗': 'battle.html',
        '储物袋': 'bag.html', '我的': 'me.html'
      };
      if (map[name]) { location.href = map[name]; return; }
      this.toast('「' + name + '」还没做');
    }
  };

  /* ---------------- 家长中心配置覆盖层 ----------------
   * 家长在 parent.html 点保存后，服务会写同目录的 catalog.json / catalog.js。
   * 这里把配置合并进内置数据：
   *   - 同名课程体系：整段替换讲次（家长删掉的就真删掉）
   *   - 同名商品：整段替换商城列表
   * 文件不存在（没部署家长端 / 用 file:// 打开）时静默跳过，行为与原来完全一致。
   */
  function applyCatalog(cat) {
    if (!cat || typeof cat !== 'object') return;

    var series = [];
    for (var i = 0; i < (cat.series || []).length; i++) {
      if (cat.series[i] && cat.series[i].id) series.push(cat.series[i]);
    }

    if (series.length) {
      series.forEach(function (s) {
        var old = COURSES[s.id] || null;
        var lessons = (s.lessons || []).map(function (l) {
          return {
            n: l.n,
            title: l.title || '',
            sub: l.sub || '',
            min: l.min || 0,
            video: l.video || '',
            quiz: l.quiz || []
          };
        });
        COURSES[s.id] = {
          id: s.id,
          subject: s.subject || (old && old.subject) || '数学',
          name: s.name || (old && old.name) || s.id,
          attr: s.attr || (old && old.attr) || '算力',
          lessons: lessons.length ? lessons : ((old && old.lessons) ? old.lessons : [])
        };

        var subj = COURSES[s.id].subject;
        if (!SERIES[subj]) SERIES[subj] = [];
        var ref = null;
        for (var k = 0; k < SERIES[subj].length; k++) {
          if (SERIES[subj][k].id === s.id) { ref = SERIES[subj][k]; break; }
        }
        if (!ref) { ref = { id: s.id }; SERIES[subj].push(ref); }
        ref.tab = s.tab || COURSES[s.id].name;
        ref.grade = s.grade || '四年级';
      });

      /* tab 顺序以家长配置为准，并从各学科里摘掉家长已删除的体系 */
      Object.keys(SERIES).forEach(function (subj) {
        var keep = SERIES[subj].filter(function (x) {
          return series.some(function (s) { return s.id === x.id; });
        });
        if (keep.length) SERIES[subj] = keep;
        else delete SERIES[subj];
      });
    }

    var items = cat.items || [];
    if (items.length) {
      ITEMS.length = 0;
      items.forEach(function (it) {
        if (!it || !it.id) return;
        ITEMS.push({
          id: it.id,
          name: it.name || '',
          icon: it.icon || 'assets/bag2-stone.png',
          bagIcon: it.bagIcon || it.icon || 'assets/bag2-stone.png',
          cat: it.cat || '道具',
          price: parseInt(it.price, 10) || 0,
          kind: it.kind === 'consume' ? 'consume' : 'own',
          desc: it.desc || ''
        });
      });
    }

    /* 内容馆：有声故事 / 少年阅览室 / 动画馆 */
    var books = cat.books || [];
    if (books.length) {
      BOOKS.length = 0;
      books.forEach(function (b) {
        if (!b || !b.id) return;
        BOOKS.push({
          id: b.id, title: b.title || '', author: b.author || '',
          category: b.category || '课外阅读',
          cover: b.cover || 'assets/hall/book_insects.jpg',
          minutes: parseInt(b.minutes, 10) || 0,
          readCount: parseInt(b.readCount, 10) || 0,
          done: !!b.done,
          summary: b.summary || '',
          content: b.content || '',
          pdf: b.pdf || '',
          album: b.album || ''
        });
      });
    }

    /* 有声：专辑 → 单集 */
    var audios = cat.audios || [];
    if (audios.length) {
      AUDIOS.length = 0;
      audios.forEach(function (a) {
        if (!a || !a.id) return;
        var eps = (a.episodes || []).map(function (e, i) {
          return {
            id: e.id || (a.id + '_' + i),
            title: e.title || '',
            speaker: e.speaker || a.speaker || '',
            seconds: parseInt(e.seconds, 10) || (parseInt(e.minutes, 10) || 0) * 60,
            url: e.url || ''
          };
        });
        AUDIOS.push({
          id: a.id,
          name: a.name || a.title || '未命名专辑',
          subject: a.subject || '',
          category: a.category || '故事',
          cover: a.cover || 'assets/hall/audio_wukong.jpg',
          speaker: a.speaker || '',
          episodes: eps
        });
      });
    }

    var videos = cat.videos || [];
    if (videos.length) {
      VIDEOS.length = 0;
      videos.forEach(function (v) {
        if (!v || !v.id) return;
        VIDEOS.push({
          id: v.id, name: v.name || '', subject: v.subject || '探索',
          cover: v.cover || 'assets/hall/series_math.jpg',
          desc: v.desc || '',
          episodes: (v.episodes || []).map(function (e) {
            return {
              n: e.n, title: e.title || '', sub: e.sub || '',
              seconds: parseInt(e.seconds, 10) || (parseInt(e.minutes, 10) || 0) * 60,
              video: e.video || ''
            };
          })
        });
      });
    }
  }

  /* 同步读取配置文件：本地 http 服务下几十 KB，开销可忽略；
   * 任何异常都当作「没有家长配置」，不影响内置数据 */
  function loadCatalog() {
    /* catalog.json 是服务端权威数据，优先读；
     * 读不到（file:// 或没部署家长端）再退到页面已加载的 catalog.js */
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'catalog.json?_=' + Date.now(), false);
      xhr.send(null);
      if (xhr.status === 200 || xhr.status === 0) {
        var txt = xhr.responseText;
        if (txt && txt.charAt(0) === '{') return JSON.parse(txt);
      }
    } catch (e) {}
    if (window.CATALOG && typeof window.CATALOG === 'object') return window.CATALOG;
    return null;
  }

  try { applyCatalog(loadCatalog()); } catch (e) {}

  window.Store = Store;
})();
