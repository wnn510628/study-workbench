/* =========================================================
   示例数据（内置示例，可自行扩充）
   ========================================================= */

window.SAMPLE_DATA = {


  /* ---------- 精选短篇文章 ---------- */
  articles: [
    {
      id: "art1",
      title: "The Power of Small Habits",
      source: "Adapted from Atomic Habits · 简易改编",
      level: "中阶",
      category: "自我提升",
      content: "We often think that success requires one big dramatic change. In reality, the small habits we repeat every day shape who we become.\n\nJames Clear, the author of Atomic Habits, points out that a 1% improvement every day makes you 37 times better in a year. The problem is that we are impatient. We want results overnight, and we give up when we do not see them.\n\nThe key is to make the habit so small that it is easy to start. Read one page, write one sentence, practice English for five minutes. When the action is easy, we are more likely to repeat it. And repetition creates momentum.\n\nAnother important idea is to design your environment. If you want to read more, put a book on your pillow. If you want to learn English, keep your notebook on your desk. Good habits become easier when they are the path of least resistance.\n\nFinally, do not break the chain. Even on a busy day, do the smallest version of the habit. The goal is not perfection but consistency. As the saying goes, “we do not rise to the level of our goals; we fall to the level of our systems.”"
    },
    {
      id: "art2",
      title: "Why We Forget and How to Remember",
      source: "Adapted from popular science · 简易改编",
      level: "中高阶",
      category: "学习方法",
      content: "Have you ever read a book and forgotten most of it a week later? This is not your fault. It is how the brain works.\n\nGerman psychologist Hermann Ebbinghaus discovered the forgetting curve over a hundred years ago. He found that we forget about half of new information within an hour, and about 70% within a day, unless we review it.\n\nThe good news is that spaced repetition can flatten this curve. Instead of cramming all at once, review the material after one day, then three days, then a week. Each review strengthens the memory and makes it last longer.\n\nAnother powerful technique is active recall. Instead of rereading the text, close the book and try to remember the key points. This effort of retrieving information strengthens the neural pathways far more than passive reading.\n\nFinally, connect new knowledge to what you already know. The brain stores information in networks. A new fact sticks better when it hooks onto an existing idea. So when you learn a new word, use it in a sentence about your own life. When you read a new concept, explain it to someone in your own words.\n\nRemember: memory is not a container but a muscle. Train it, and it grows."
    },
    {
      id: "art3",
      title: "A Morning by the Lake",
      source: "Original short essay · 简易写作",
      level: "初阶",
      category: "记叙短文",
      content: "The sun rose slowly over the lake, painting the water gold and rose. A thin mist floated above the surface, and the world was quiet.\n\nI sat on an old wooden bench, watching the birds dive and dance. Far away, a fisherman's boat moved like a shadow. The air smelled of wet grass and clean water.\n\nIn the city, my mind was always full of noise. Here, it slowly emptied. I took out my notebook and wrote a few lines about the light on the water. It was not poetry, but it made me happy.\n\nAn hour passed without my notice. When I stood up, the mist was gone and the sun was high. I felt light, as if the lake had washed something heavy out of me.\n\nSometimes we do not need to go far to find peace. We only need to stop, look, and let the moment in."
    },
    {
      id: "art4",
      title: "The Art of Asking Good Questions",
      source: "Adapted from learning science · 简易改编",
      level: "中阶",
      category: "思维方法",
      content: "In school, we are trained to give answers. But in real life, the quality of your questions often matters more than the quality of your answers.\n\nA good question opens a door. Instead of asking “is this right?”, ask “what would make this better?” Instead of “what should I do?”, ask “what are my options and their costs?” Good questions push you to see the situation from a new angle.\n\nExperts suggest replacing “why” with “how” when you want to move forward. “Why did this fail?” can make you defensive. “How can we improve this next time?” keeps the energy positive and practical.\n\nWhen you learn something new, ask yourself: “How is this connected to what I already know?” “Where can I use this in real life?” These two questions turn passive reading into active learning.\n\nAsking questions is also a way to show respect. When you listen carefully and ask a follow-up question, you tell the other person: your idea matters to me. In a world full of noise, a good question is a gift."
    }
  ],

  /* ---------- 场景英语 ---------- */
  scenarios: [
    {
      id: "sc1", category: "生活", name: "日常问候与寒暄", color: "blue",
      phrases: [
        { en: "Long time no see. How have you been?", cn: "好久不见，你最近怎么样？" },
        { en: "I'm doing great, thanks for asking.", cn: "我很好，谢谢关心。" },
        { en: "It's a beautiful day, isn't it?", cn: "今天天气真好，不是吗？" },
        { en: "How's everything going with your work?", cn: "你工作一切顺利吗？" }
      ],
      dialogues: [
        { who: "A", en: "Hey! Long time no see. How have you been?", cn: "嘿！好久不见，你最近怎么样？" },
        { who: "B", en: "Pretty good, thanks. Just busy with work. And you?", cn: "挺好的，谢谢。就是工作有点忙。你呢？" },
        { who: "A", en: "Same here. We should catch up over coffee sometime.", cn: "我也差不多。我们改天一起喝咖啡聊聊吧。" },
        { who: "B", en: "Sounds great! How about this weekend?", cn: "听起来不错！这个周末怎么样？" }
      ]
    },
    {
      id: "sc2", category: "生活", name: "点餐与餐厅", color: "pink",
      phrases: [
        { en: "Could I see the menu, please?", cn: "请给我看一下菜单。" },
        { en: "What do you recommend?", cn: "你有什么推荐的吗？" },
        { en: "I'd like it medium rare, please.", cn: "请做成三分熟。" },
        { en: "Could we have the bill, please?", cn: "请给我们结账。" }
      ],
      dialogues: [
        { who: "A", en: "Good evening! A table for two?", cn: "晚上好！两位吗？" },
        { who: "B", en: "Yes, by the window if possible.", cn: "是的，如果可以的话靠窗。" },
        { who: "A", en: "Of course. Here are the menus. Can I get you something to drink?", cn: "当然。这是菜单。需要喝点什么吗？" },
        { who: "B", en: "Two glasses of water, please. And what's today's special?", cn: "两杯水，谢谢。今天的特色菜是什么？" },
        { who: "A", en: "It's grilled salmon with lemon butter sauce.", cn: "是柠檬黄油酱烤三文鱼。" },
        { who: "B", en: "Sounds delicious. I'll have that.", cn: "听起来不错。我就点这个。" }
      ]
    },
    {
      id: "sc3", category: "生活", name: "问路与出行", color: "green",
      phrases: [
        { en: "Excuse me, how do I get to the station?", cn: "请问，去车站怎么走？" },
        { en: "Is it far from here?", cn: "离这里远吗？" },
        { en: "Go straight and turn left at the corner.", cn: "直走，在拐角处左转。" },
        { en: "It's about ten minutes on foot.", cn: "步行大约十分钟。" }
      ],
      dialogues: [
        { who: "A", en: "Excuse me, I'm looking for the city library.", cn: "打扰一下，我在找市图书馆。" },
        { who: "B", en: "Go straight down this road for two blocks, then turn right.", cn: "沿着这条路直走两个街区，然后右转。" },
        { who: "A", en: "Two blocks then right. Got it. Is it far?", cn: "两个街区然后右转。明白了。远吗？" },
        { who: "B", en: "Not at all, about five minutes' walk. You'll see a big white building.", cn: "不远，大约五分钟路程。你会看到一栋白色大建筑。" },
        { who: "A", en: "Thank you so much!", cn: "太感谢了！" }
      ]
    },
    {
      id: "sc4", category: "生活", name: "购物与超市", color: "yellow",
      phrases: [
        { en: "I'm just looking, thanks.", cn: "我只是随便看看，谢谢。" },
        { en: "How much is this?", cn: "这个多少钱？" },
        { en: "Do you have this in a larger size?", cn: "这个有大一号的吗？" },
        { en: "Can I pay by card?", cn: "可以刷卡吗？" }
      ],
      dialogues: [
        { who: "A", en: "Hi, can I help you find anything?", cn: "您好，需要帮您找什么吗？" },
        { who: "B", en: "Yes, I'm looking for a gift for my friend.", cn: "是的，我在给我朋友挑礼物。" },
        { who: "A", en: "What kind of gift? We have scarves, cups and notebooks.", cn: "什么样的礼物？我们有围巾、杯子和笔记本。" },
        { who: "B", en: "She loves writing. The notebook is perfect. How much is it?", cn: "她喜欢写作。这个笔记本很合适。多少钱？" },
        { who: "A", en: "It's thirty-nine yuan. Would you like it gift-wrapped?", cn: "39元。需要包装成礼物吗？" },
        { who: "B", en: "Yes, please. That would be great.", cn: "好的，谢谢。那太好了。" }
      ]
    },
    {
      id: "sc5", category: "工作", name: "求职面试", color: "blue",
      phrases: [
        { en: "Could you tell me about yourself?", cn: "能介绍一下你自己吗？" },
        { en: "What are your strengths and weaknesses?", cn: "你的优点和缺点是什么？" },
        { en: "Why do you want this job?", cn: "你为什么想要这份工作？" },
        { en: "When can you start?", cn: "你什么时候可以入职？" }
      ],
      dialogues: [
        { who: "A", en: "Good morning. Thanks for coming in. Tell me about yourself.", cn: "早上好。感谢你来面试。介绍一下自己吧。" },
        { who: "B", en: "Sure. I graduated in English and have two years of content experience.", cn: "好的。我英语专业毕业，有两年内容相关经验。" },
        { who: "A", en: "Why are you interested in our company?", cn: "你为什么对我们公司感兴趣？" },
        { who: "B", en: "I love your products and believe my skills fit the role well.", cn: "我很喜欢你们的产品，并且相信我的能力很适合这个岗位。" },
        { who: "A", en: "What's your expected salary?", cn: "你期望的薪资是多少？" },
        { who: "B", en: "I'm flexible, but based on market rates, around ten thousand.", cn: "可以灵活谈，按照市场水平，一万元左右。" }
      ]
    },
    {
      id: "sc6", category: "工作", name: "会议与汇报", color: "green",
      phrases: [
        { en: "Let's get started. First, the agenda.", cn: "我们开始吧。首先是议程。" },
        { en: "Could you elaborate on that point?", cn: "你能详细说一下那一点吗？" },
        { en: "Let me summarize what we've discussed.", cn: "让我总结一下我们讨论的内容。" },
        { en: "We'll follow up by email.", cn: "我们会通过邮件跟进。" }
      ],
      dialogues: [
        { who: "A", en: "Good morning everyone. Let's begin. Any updates on the project?", cn: "大家早上好。我们开始吧。项目有什么进展吗？" },
        { who: "B", en: "Yes, we finished the design phase and are starting development.", cn: "有的，我们完成了设计阶段，开始开发了。" },
        { who: "A", en: "Great. Are we on schedule?", cn: "很好。进度正常吗？" },
        { who: "B", en: "We're two days behind due to a delay in the design review.", cn: "因为设计评审延误，我们落后了两天。" },
        { who: "A", en: "OK. Let's adjust the timeline and review it at Friday's meeting.", cn: "好的。我们调整一下时间表，周五会上再讨论。" }
      ]
    },
    {
      id: "sc7", category: "工作", name: "商务邮件", color: "pink",
      phrases: [
        { en: "I'm writing to follow up on our meeting.", cn: "我写信是想跟进我们上次的会面。" },
        { en: "Please find the attachment for details.", cn: "详情请见附件。" },
        { en: "I look forward to your reply.", cn: "期待您的回复。" },
        { en: "Please don't hesitate to contact me.", cn: "请随时联系我。" }
      ],
      dialogues: [
        { who: "A", en: "Hi, I didn't receive your email yet. Did you send it?", cn: "嗨，我还没收到你的邮件。你发了吗？" },
        { who: "B", en: "I did! Maybe it went to spam. Let me resend it now.", cn: "发了！可能进了垃圾箱。我现在重新发一次。" },
        { who: "A", en: "Got it this time. Thanks for the quick follow-up.", cn: "这次收到了。谢谢快速跟进。" },
        { who: "B", en: "No problem. Let me know if you have any questions.", cn: "不客气。有问题随时告诉我。" }
      ]
    }
  ],

  /* ---------- 内置对话练习（AI 未配置时可用） ---------- */
  dialogues: [
    { id: "dg1", name: "咖啡店点单", desc: "练习点咖啡的常用表达", lines: [
      { who: "A", en: "Welcome! What can I get for you today?", cn: "欢迎光临！今天想喝点什么？" },
      { who: "B", en: "I'd like a latte, please.", cn: "请给我一杯拿铁。" },
      { who: "A", en: "Hot or iced? And any size?", cn: "热的还是冰的？要什么杯型？" },
      { who: "B", en: "Iced, medium, with oat milk.", cn: "冰的，中杯，加燕麦奶。" },
      { who: "A", en: "Great. That'll be 28 yuan. Name for the order?", cn: "好的，28元。请问怎么称呼？" }
    ]},
    { id: "dg2", name: "机场值机", desc: "练习登机、行李相关表达", lines: [
      { who: "A", en: "Good morning. Passport and ticket, please.", cn: "早上好。请出示护照和机票。" },
      { who: "B", en: "Here you are. Is this flight on time?", cn: "给你。这个航班准点吗？" },
      { who: "A", en: "Yes, it's on schedule. Any checked luggage?", cn: "是的，准点。有托运行李吗？" },
      { who: "B", en: "One suitcase, please. And could I have a window seat?", cn: "一个箱子。可以给我靠窗座位吗？" },
      { who: "A", en: "Of course. Here's your boarding pass. Gate 12, boarding at 9:30.", cn: "当然。这是你的登机牌。12号登机口，9:30登机。" }
    ]},
    { id: "dg3", name: "酒店入住", desc: "练习订房、入住表达", lines: [
      { who: "A", en: "Good evening. Do you have a reservation?", cn: "晚上好。您有预订吗？" },
      { who: "B", en: "Yes, under the name Li Ming.", cn: "有，用李明这个名字订的。" },
      { who: "A", en: "Found it. A standard room for two nights. May I see your passport?", cn: "找到了。标准间两晚。可以看一下您的护照吗？" },
      { who: "B", en: "Sure. Is breakfast included?", cn: "好的。含早餐吗？" },
      { who: "A", en: "Yes, breakfast is from 7 to 10 on the second floor.", cn: "含的，早餐7点到10点在二楼。" }
    ]}
  ],

  /* ---------- 佳句摘抄示例 ---------- */
  quotes: [
    { text: "我们读诗写诗，并不是因为它们好玩。我们读诗写诗是因为我们是人类的一分子，而人类是充满激情的。", source: "《死亡诗社》", tags: ["文学", "热爱"], feeling: "真正的热爱源于生命本身。" },
    { text: "我们之所以战无不胜，是因为我们为荣耀而战，为兄弟而战，为生命中最为珍视的东西而战。", source: "《斯巴达三百勇士》", tags: ["勇气", "信念"], feeling: "为珍视之物而战，是最强的动力。" },
    { text: "世界上只有一种真正的英雄主义，那就是认清生活的真相后依然热爱生活。", source: "罗曼·罗兰", tags: ["哲理", "生活"], feeling: "看清真相仍热爱，才是真英雄。" }
  ],

  /* ---------- 读书计划示例 ---------- */
  books: [
    { title: "Atomic Habits 掌控习惯", author: "James Clear", category: "自我提升", status: "reading", progress: 45, notes: "1% 的改进，一年后强大 37 倍。" },
    { title: "你当像鸟飞往你的山", author: "Tara Westover", category: "传记", status: "want", progress: 0, notes: "" },
    { title: "围城", author: "钱锺书", category: "小说", status: "read", progress: 100, notes: "城里的人想出去，城外的人想进来。" }
  ],

  /* ---------- 创作示例 ---------- */
  creations: [
    { title: "晨光里的湖", category: "随笔", status: "draft", date: "2026-08-20", content: "清晨六点，湖面蒙着薄薄的雾。远处的山影在水中微微颤动，像一幅未干的水墨画。\n\n我坐在岸边，看一只白鹭缓缓飞过，翅膀划开寂静，又把它合上。这一刻，时间仿佛慢了半拍，让人想起小时候暑假的清晨——空气里全是青草和露水的气息。" }
  ]
};
