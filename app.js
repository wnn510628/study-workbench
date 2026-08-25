/* =========================================================
   个人 AI 学习工作台 — 应用逻辑 v1.0（第一部分：核心 + 英语模块）
   ========================================================= */
(function () {
'use strict';

/* ================= 工具函数 ================= */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function weekStart(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return (d.getMonth() + 1) + '月' + d.getDate() + '日';
}
function timeHM() {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.hidden = true; }, 2200);
}

/* ================= 图标库（统一线性 SVG） ================= */
const I = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  stop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  word: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
  quote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3"/><path d="M20 11h-4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3"/></svg>',
  note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.7L19.6 10l-5.7 1.9L12 17.6l-1.9-5.7L4.4 10l5.7-1.9z"/><path d="M19 15l.9 2.6L22.5 18.5l-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  headphones: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
  trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>'
};
function chevron() { return I.chevron; }

/* ================= 数据层 ================= */
const STORE_KEY = 'wb_data_v1';
let DB = null;
let AUDIO_DB = null;

function defaultDB() {
  const S = window.SAMPLE_DATA;
  return {
    version: 1,
    settings: { name: '', aiBaseUrl: '', aiKey: '', aiModel: 'gpt-4o-mini', dailyWordGoal: 10 },
    words: [],
    articles: S.articles.map((a) => ({
      id: a.id, title: a.title, source: a.source, level: a.level,
      category: a.category, content: a.content,
      status: 'unread', annotations: [], longSentences: [], recite: null
    })),
    recordings: [],
    quotes: S.quotes.map((q) => Object.assign({ id: uid(), language: 'zh', date: todayStr() }, q)),
    books: S.books.map((b) => Object.assign({ id: uid(), date: todayStr() }, b)),
    creations: S.creations.map((c) => Object.assign({ id: uid() }, c)),
    inspirations: [],
    inbox: [],
    tasks: [],
    speechLog: []
  };
}

function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { DB = null; }
  if (!DB || !DB.version) { DB = defaultDB(); saveDB(); }
}
function saveDB() { localStorage.setItem(STORE_KEY, JSON.stringify(DB)); }
function resetDB() {
  localStorage.removeItem(STORE_KEY);
  DB = defaultDB(); saveDB();
}

function initAudioDB() {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('wb_audio', 1);
      req.onupgradeneeded = () => { req.result.createObjectStore('audio'); };
      req.onsuccess = () => { AUDIO_DB = req.result; resolve(true); };
      req.onerror = () => { AUDIO_DB = null; resolve(false); };
    } catch (e) { AUDIO_DB = null; resolve(false); }
  });
}
function audioPut(key, blob) {
  return new Promise((res, rej) => {
    if (!AUDIO_DB) return rej(new Error('no db'));
    const tx = AUDIO_DB.transaction('audio', 'readwrite');
    tx.objectStore('audio').put(blob, key);
    tx.oncomplete = res; tx.onerror = () => rej(tx.error);
  });
}
function audioGet(key) {
  return new Promise((res, rej) => {
    if (!AUDIO_DB) return rej(new Error('no db'));
    const tx = AUDIO_DB.transaction('audio', 'readonly');
    const r = tx.objectStore('audio').get(key);
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
function audioDel(key) {
  return new Promise((res, rej) => {
    if (!AUDIO_DB) return rej(new Error('no db'));
    const tx = AUDIO_DB.transaction('audio', 'readwrite');
    tx.objectStore('audio').delete(key);
    tx.oncomplete = res; tx.onerror = () => rej(tx.error);
  });
}

/* ================= 帮助系统 ================= */
const HELP = {
  'help-today': {
    brief: '今日聚合所有待办：任务、复习、阅读、背诵，一屏掌握。',
    html: '<p><span class="hx">今日</span>是你的每日工作台首页，永远第一优先级。</p><p class="hx-block">这里显示什么？</p><ul><li>待确认的收集箱内容</li><li>今日学习任务（来自学习计划）</li><li>到期待复习的单词</li><li>继续阅读的文章与背诵内容</li><li>进行中的读书进度</li></ul><p class="hx-block">怎么操作？</p><p>点击任务前的方框可标记完成；点单词右侧"复习"完成一次复习；点"生成今日计划"自动生成任务。</p>'
  },
  'help-en-words': {
    brief: '记录新单词，支持首字母检索和中文意思反查。',
    html: '<p><span class="hx">单词本</span>记录你所有"不认识的英文单词"。</p><p class="hx-block">核心能力</p><ul><li><b>首字母检索</b>：点击上方 A–Z 字母条，筛选对应首字母的单词</li><li><b>中文意思反查</b>：在搜索框输入中文（如"美丽"），显示所有含此释义的单词</li><li>英文单词直接输入可精确/模糊查找</li><li>按状态筛选：生词 / 复习中 / 已掌握</li></ul><p class="hx-block">怎么操作</p><p>右上角"添加单词"打开表单。每条单词可编辑、删除、复习。收集箱中的内容也可一键归入单词本。</p><p class="hx-block">出错怎么办</p><p>误删可在"设置与数据"中从备份恢复；误添加直接删除即可。</p>'
  },
  'help-en-reading': {
    brief: '精选文章阅读，可划线、标注、摘抄、解析长难句、背诵背写。',
    html: '<p><span class="hx">英文阅读</span>用于精读文章。</p><p class="hx-block">核心能力</p><ul><li><b>划线</b>：选中文章文字，点"划线"（黄色下划线）</li><li><b>标注</b>：选中文字，点"标注"，写下批注（蓝色高亮+编号）</li><li><b>摘抄</b>：选中文字，点"摘抄"，存入佳句摘抄</li><li><b>长难句</b>：选中句子点"长难句"，加入解析列表，可写翻译和语法拆解</li><li><b>背诵背写</b>：点"进入背写模式"隐藏原文凭记忆默写</li></ul><p class="hx-block">如何撤销</p><p>点击蓝色标注编号可查看/删除批注；文章底部"标注清单"可管理全部标记。</p>'
  },
  'help-en-listening': {
    brief: '麦克风录音保存到本地，练习听力和口语。',
    html: '<p><span class="hx">听说训练</span>用浏览器麦克风录音，音频保存在<b>本机浏览器</b>中。</p><p class="hx-block">怎么操作</p><ol><li>点击圆形录音按钮，授权麦克风后开始录音</li><li>再次点击停止，输入标题保存</li><li>录音出现在下方列表，可播放、删除</li></ol><p class="hx-block">说明</p><p>录音存于本机浏览器 IndexedDB，不经过服务器。JSON 备份只包含录音元数据，不含音频本体。</p><p class="hx-block">出错怎么办</p><p>若未授权麦克风，请检查浏览器地址栏权限设置；录音失败请重试或换用 Chrome/Edge。</p>'
  },
  'help-en-scenarios': {
    brief: '按生活/工作场景划分的实用英语，即学即用。',
    html: '<p><span class="hx">场景英语</span>以实用为主，按<b>生活</b>与<b>工作</b>两类场景组织。</p><p class="hx-block">每个场景包含</p><ul><li>常用句型（英文+中文对照）</li><li>场景对话示例，可逐句跟读</li></ul><p class="hx-block">建议用法</p><p>每天选一个场景：先读句型，再跟读对话，最后到"对话练习"模拟真实对话。</p>'
  },
  'help-en-dialogues': {
    brief: '内置场景对话跟读练习 + AI 自由对话（需配置 AI）。',
    html: '<p><span class="hx">对话练习</span>包含两部分：</p><p class="hx-block">1. 内置对话</p><p>咖啡店、机场、酒店等生活场景对话，逐句跟读。</p><p class="hx-block">2. AI 对话（界面已就绪）</p><p>与 AI 进行自由英语对话练习。当前版本为<b>界面预留</b>：在"设置与数据 - AI 配置"填写接口地址、API Key 和模型后即可使用。未配置时不会假装回复。</p>'
  },
  'help-en-plan': {
    brief: '每日学习计划 + 每周复习计划，自动从各模块聚合。',
    html: '<p><span class="hx">学习计划</span>帮你把零散学习变成固定节奏。</p><p class="hx-block">每日学习计划</p><p>点"生成今日计划"，自动根据当前数据生成：复习生词、精读文章、背诵、场景练习等。任务可在"今日"页完成勾选。</p><p class="hx-block">每周复习计划</p><p>自动汇总本周到期的复习单词、待续读文章、背诵任务；也可手动添加每周任务。</p><p class="hx-block">原理</p><p>单词复习遵循间隔重复：复习一次后下次到期 +3 天，再复习 +7 天，累计 3 次标记为已掌握。</p>'
  },
  'help-zh-quotes': {
    brief: '记录中文优美词句，分类打标签，随时回顾。',
    html: '<p><span class="hx">佳句摘抄</span>保存你喜欢的中文词句和读书中的优美表达。</p><p class="hx-block">功能</p><ul><li>记录原文、出处、标签、个人感悟</li><li>英文阅读中"摘抄"的内容也会存入这里（标记语言为英文）</li><li>按语言、标签筛选</li></ul><p class="hx-block">与创作的关系</p><p>摘抄的句子可以作为创作素材，随时引用。</p>'
  },
  'help-zh-books': {
    brief: '制定读书计划，跟踪阅读进度，写读书笔记。',
    html: '<p><span class="hx">读书计划</span>管理你的书单。</p><p class="hx-block">功能</p><ul><li>添加书籍：书名、作者、分类、状态（想读/在读/已读/搁置）</li><li>调整阅读进度百分比</li><li>记录读书笔记</li><li>进行中的书籍会出现在"今日"页提醒继续阅读</li></ul>'
  },
  'help-zh-creations': {
    brief: '独立创作板块：灵感收集 + 作品管理，与读书计划分开。',
    html: '<p><span class="hx">创作板块</span>独立于读书计划，专用于你的创作。</p><p class="hx-block">两块内容</p><ul><li><b>灵感收集</b>：随时记录一句话灵感，可一键"转为作品"</li><li><b>作品管理</b>：完整创作，含标题、正文、分类（散文/诗歌/故事/随笔等）、状态（草稿/修改中/已完成）</li></ul><p class="hx-block">关联</p><p>收集箱中的素材可归入创作板块；佳句摘抄可作为创作素材引用。</p>'
  },
  'help-inbox': {
    brief: '统一收集箱：文字、链接、临时任务都先收进来，再归类确认。',
    html: '<p><span class="hx">收集箱</span>是统一入口，接收所有想记录的内容：单词、句子、文章链接、灵感、临时任务。</p><p class="hx-block">怎么归类</p><ul><li>英文内容 → 建议归入英语学习板块</li><li>中文内容 → 建议归入中文学习板块</li><li>混合或不确定 → 手动选择中/英文板块</li></ul><p>然后选择具体模块，<b>确认后</b>内容才会写入对应模块，可随时调整或放弃。</p><p class="hx-block">重要</p><p>所有建议都只是建议，最终由你确认。</p>'
  },
  'help-search': {
    brief: '跨模块全局搜索：单词、文章、摘抄、书籍、创作等。',
    html: '<p><span class="hx">搜索</span>在工作台所有模块中查找内容。</p><p class="hx-block">支持</p><ul><li>单词本：英文单词、中文释义</li><li>英文阅读：标题与正文</li><li>佳句摘抄、读书计划、创作板块、收集箱、场景英语、对话</li></ul><p>输入关键词即搜，结果按模块分组，点击可跳转。</p>'
  },
  'help-ai': {
    brief: 'AI 帮手：整理资料、补充知识、安排任务（需先配置 AI 接口）。',
    html: '<p><span class="hx">AI 帮手</span>提供三类能力：</p><ul><li><b>整理资料</b>：分析收集箱内容，建议归类去向</li><li><b>补充知识</b>：为单词/概念补充释义、例句、背景知识</li><li><b>安排任务</b>：根据你的数据自动生成学习计划</li></ul><p class="hx-block">配置要求</p><p>本版本 AI 为<b>界面预留</b>：在"设置与数据 - AI 配置"填写兼容 OpenAI 的接口地址、API Key 与模型名后即启用。未配置时，整理资料使用内置规则给出建议（不联网、不伪造 AI 回复），其余能力显示使用说明。</p><p class="hx-block">重要修改</p><p>AI 的建议（如归类、计划）都会先展示预览，由你确认后才写入。</p>'
  },
  'help-settings': {
    brief: '使用说明、AI 配置、数据导出/导入/恢复、更新日志都在这里。',
    html: '<p><span class="hx">设置与数据</span>管理整个工作台。</p><p class="hx-block">包含</p><ul><li><b>使用说明</b>：完整的操作指南</li><li><b>AI 配置</b>：接口地址、API Key、模型（可选）</li><li><b>数据</b>：导出 JSON 备份、导入恢复、重置</li><li><b>更新日志</b>：每次版本更新记录</li></ul><p class="hx-block">数据安全</p><p>所有数据默认保存在<b>当前浏览器本地</b>（localStorage）。更换设备/浏览器后数据不会自动同步，请定期导出备份。</p>'
  },
  'help-more': {
    brief: '"更多"包含全部功能入口：未放入底部导航的模块、搜索、AI、设置等。',
    html: '<p><span class="hx">更多</span>是手机端的功能总入口，列出底部导航之外的所有模块：英文阅读、听说训练、场景英语、对话练习、学习计划、佳句摘抄、读书计划、创作板块、收集箱、搜索、AI 帮手、设置与数据、使用说明、更新日志。</p><p>每个入口都能打开对应页面，不会出现空白页。</p>'
  },
  'help-annot': {
    brief: '划线=黄色下划线；标注=蓝色批注；摘抄=存入佳句；长难句=加入解析。',
    html: '<p><span class="hx">文章标记说明</span></p><ul><li><b>划线</b>：黄色下划线，标记重点句</li><li><b>标注</b>：蓝色高亮带编号，可写批注，点击编号查看/删除</li><li><b>摘抄</b>：绿色标记，句子存入"佳句摘抄"</li><li><b>长难句</b>：粉色下划线，加入长难句解析列表</li></ul><p>所有标记在文章底部"标注清单"中统一管理，可删除。</p>'
  },
  'help-current': {
    brief: '点击查看当前页面的功能说明。',
    html: '<p>这是当前页面的帮助说明。每个模块和关键操作都带有圆圈问号入口：电脑端鼠标悬浮显示简短说明，手机/平板端点击打开说明，内容包括这个功能做什么、怎么操作、完成后会发生什么、如何撤销、出错怎么办。</p>'
  }
};

function helpKeyForView(view) {
  const map = {
    'today': 'help-today', 'en-words': 'help-en-words',
    'en-reading': 'help-en-reading', 'en-listening': 'help-en-listening',
    'en-scenarios': 'help-en-scenarios', 'en-dialogues': 'help-en-dialogues',
    'en-plan': 'help-en-plan', 'zh-quotes': 'help-zh-quotes', 'zh-books': 'help-zh-books',
    'zh-creations': 'help-zh-creations', 'inbox': 'help-inbox', 'search': 'help-search',
    'ai': 'help-ai', 'settings': 'help-settings'
  };
  return map[view] || 'help-current';
}

/* ================= 弹窗 / 帮助 UI ================= */
let CURRENT_VIEW = 'today';

function openModal(html, maxWidth) {
  const box = $('#modal-box');
  $('#modal-body').innerHTML = html;
  box.style.maxWidth = maxWidth || '';
  $('#modal-mask').hidden = false;
}
function closeModal() {
  $('#modal-mask').hidden = true;
  $('#modal-body').innerHTML = '';
}
function openHelp(key) {
  const h = HELP[key] || HELP['help-current'];
  $('#help-title').textContent = '帮助';
  $('#help-content').innerHTML = h.html;
  $('#help-modal').hidden = false;
}
function closeHelp() { $('#help-modal').hidden = true; }

function bindHelpGlobal() {
  const tip = document.createElement('div');
  tip.id = 'h-tooltip';
  tip.style.cssText = 'position:fixed;z-index:300;background:#202124;color:#fff;font-size:12.5px;padding:7px 12px;border-radius:8px;max-width:280px;line-height:1.5;pointer-events:none;display:none;box-shadow:0 4px 14px rgba(0,0,0,.25)';
  document.body.appendChild(tip);

  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest('[data-help]');
    if (!el || window.matchMedia('(max-width: 820px)').matches) return;
    const h = HELP[el.getAttribute('data-help')];
    if (!h) return;
    tip.textContent = h.brief;
    tip.style.display = 'block';
    const r = el.getBoundingClientRect();
    tip.style.left = Math.min(r.left, window.innerWidth - 300) + 'px';
    tip.style.top = (r.bottom + 8) + 'px';
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('[data-help]')) tip.style.display = 'none';
  });
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-help]');
    if (!el) return;
    /* 导航/动作按钮上的 data-help 仅用于悬浮提示，点击交给主事件处理（避免弹帮助遮挡页面） */
    if (el.closest('[data-view], [data-act], [data-go], #topbar-search, #bn-add, #bn-more, #menu-btn, #help-close, #modal-close')) return;
    e.stopPropagation();
    openHelp(el.getAttribute('data-help'));
  });
}

/* ================= 路由与渲染 ================= */
const VIEW_META = {
  'today': ['今日', '今天要做什么，都在这里'],
  'en-words': ['单词本', '我的单词 · 首字母检索 · 中文反查'],
  'en-reading': ['英文阅读', '精选文章 · 标注解析 · 背诵背写'],
  'en-listening': ['听说训练', '听力口语 · 麦克风录音'],
  'en-scenarios': ['场景英语', '生活 / 工作场景 · 实用英语'],
  'en-dialogues': ['对话练习', '场景跟读 · AI 对话'],
  'en-plan': ['学习计划', '每日计划 · 每周复习'],
  'zh-quotes': ['佳句摘抄', '优美词句 · 分类回顾'],
  'zh-books': ['读书计划', '书单 · 进度 · 笔记'],
  'zh-creations': ['创作板块', '灵感收集 · 作品管理'],
  'inbox': ['收集箱', '统一收集 · 归类确认'],
  'search': ['搜索', '跨模块查找'],
  'ai': ['AI 帮手', '整理 · 补充 · 安排'],
  'settings': ['设置与数据', '说明 · 配置 · 备份']
};

function navigate(view, params) {
  let h = '#/' + view;
  if (params) h += '?' + new URLSearchParams(params).toString();
  if (location.hash === h) route();
  else location.hash = h;
}

function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  const parts = hash.split('?');
  const view = parts[0] || 'today';
  const params = new URLSearchParams(parts[1] || '');
  renderView(view, params);
}

const RENDERERS = {};

function renderView(view, params) {
  if (!VIEW_META[view]) view = 'today';
  CURRENT_VIEW = view;
  const meta = VIEW_META[view];
  let title = meta[0], subtitle = meta[1];

  /* 今日页标题/副标题支持自定义 */
  $$('.title-edit-btn').forEach((el) => el.remove());
  if (view === 'today') {
    const s = DB.settings || {};
    if (s.todayTitle) title = s.todayTitle;
    if (s.todaySubtitle) subtitle = s.todaySubtitle;
    $('#page-subtitle').insertAdjacentHTML('afterend', '<button class="title-edit-btn" data-act="edit-today-title" aria-label="编辑标题">' + I.edit + '</button>');
  }
  $('#page-title').textContent = title;
  $('#page-subtitle').textContent = subtitle;

  $$('.nav-item').forEach((n) => n.classList.toggle('active', n.dataset.view === view));
  $$('.bn-item').forEach((n) => n.classList.toggle('active', n.dataset.view === view));
  $('#topbar-help').setAttribute('data-help', helpKeyForView(view));

  const content = $('#content');
  content.innerHTML = RENDERERS[view] ? RENDERERS[view](params) : '<div class="empty"><h3>页面加载中</h3></div>';
  renderInboxBadge();
  if (window.WB.afterRender) window.WB.afterRender(view, params);
  window.scrollTo(0, 0);
  $('#more-drawer').hidden = true;
  $('#drawer-mask').hidden = true;
  $('#sidebar').classList.remove('sidebar-open');
}

function renderInboxBadge() {
  const n = (DB.inbox || []).filter((x) => x.status === 'pending').length;
  const b = $('#nav-badge-inbox');
  if (n > 0) { b.textContent = n; b.hidden = false; } else { b.hidden = true; }
}

function chip(text, cls) {
  return '<span class="chip ' + cls + '">' + esc(text) + '</span>';
}
function helpBtn(key) {
  return '<button class="help-btn" data-help="' + key + '" aria-label="帮助">' + I.help + '</button>';
}
function emptyState(icon, title, desc, actionHtml) {
  return '<div class="empty"><div class="empty-icon">' + icon + '</div><h3>' + esc(title) + '</h3><p>' + esc(desc) + '</p>' + (actionHtml || '') + '</div>';
}

/* ================= 今日视图 ================= */
RENDERERS['today'] = function () {
  const pending = (DB.inbox || []).filter((x) => x.status === 'pending');
  const today = todayStr();
  const tasks = (DB.tasks || []).filter((t) => t.date === today);
  const dueWords = dueWordsList();
  const recitingArts = (DB.articles || []).filter((a) => a.recite && a.recite.active);
  const readingArts = (DB.articles || []).filter((a) => a.status === 'reading');
  const readingBooks = (DB.books || []).filter((b) => b.status === 'reading');

  const hour = new Date().getHours();
  const greet = hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';

  let html = '';
  html += '<div class="today-hero"><div><h2>' + greet + '，继续你的学习</h2><p>' + fmtDate(today) + ' · 学而时习之，不亦说乎</p></div>' +
    '<div class="today-stats">' +
    '<div><div class="num">' + tasks.length + '</div><div class="lbl">今日任务</div></div>' +
    '<div><div class="num">' + dueWords.length + '</div><div class="lbl">待复习</div></div>' +
    '<div><div class="num">' + pending.length + '</div><div class="lbl">待确认</div></div>' +
    '</div></div>';

  html += '<div class="card"><div class="card-header"><h2 class="card-title">待确认的收集</h2>' + helpBtn('help-inbox') + '</div>';
  if (!pending.length) {
    html += '<p style="font-size:13px;color:var(--text-2)">收集箱没有待确认内容。</p>';
  } else {
    pending.slice(0, 3).forEach((it) => {
      const langTxt = it.lang === 'en' ? '英文' : it.lang === 'zh' ? '中文' : '待分类';
      html += '<div class="inbox-item"><div class="ii-content"><div>' + esc(it.content) + '</div>' +
        '<div class="ii-meta">' + chip(langTxt, 'gray') + '<span style="font-size:12px;color:var(--text-2)">' + it.date + '</span></div></div>' +
        '<div class="ii-actions"><button class="btn btn-sm btn-primary" data-go="inbox">去归类</button></div></div>';
    });
    if (pending.length > 3) html += '<p style="font-size:12.5px;color:var(--text-2);margin-top:8px">还有 ' + (pending.length - 3) + ' 条待处理，<a href="#/inbox" style="color:var(--accent)">前往收集箱</a></p>';
  }
  html += '</div>';

  html += '<div class="card"><div class="card-header"><h2 class="card-title">今日任务</h2>' + helpBtn('help-en-plan') + '</div>';
  if (!tasks.length) {
    html += emptyState(I.calendar, '今天还没有任务', '点"生成今日计划"，自动从单词、阅读、背诵等模块生成任务。',
      '<button class="btn btn-primary" data-act="gen-today">生成今日计划</button>');
  } else {
    tasks.forEach((t) => {
      html += '<div class="todo-item' + (t.done ? ' done' : '') + '">' +
        '<button class="todo-check" data-act="toggle-task" data-id="' + t.id + '" aria-label="完成">' + I.check + '</button>' +
        '<div class="todo-text">' + esc(t.title) + '<div class="todo-meta">' + esc(t.module || '') + '</div></div>' +
        '<button class="icon-btn" data-act="del-task" data-id="' + t.id + '" aria-label="删除">' + I.trash + '</button></div>';
    });
    html += '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">' +
      '<button class="btn btn-sm btn-outline" data-act="gen-today">重新生成</button>' +
      '<button class="btn btn-sm btn-outline" data-act="add-task">手动添加</button></div>';
  }
  html += '</div>';

  html += '<div class="card"><div class="card-header"><h2 class="card-title">待复习单词</h2>' + helpBtn('help-en-words') + '</div>';
  if (!dueWords.length) {
    html += emptyState(I.word, '没有到期的单词', '复习遵循间隔重复：复习一次，3 天后再次到期；累计 3 次标记为已掌握。');
  } else {
    dueWords.slice(0, 6).forEach((w) => {
      html += '<div class="review-word"><div class="w">' + esc(w.word) + '</div><div class="m">' + esc(w.meaning) + '</div>' +
        '<button class="btn btn-sm btn-primary" data-act="review-word" data-id="' + w.id + '">复习</button></div>';
    });
    if (dueWords.length > 6) html += '<p style="font-size:12.5px;color:var(--text-2);margin-top:6px">还有 ' + (dueWords.length - 6) + ' 个单词待复习，<a href="#/en-words" style="color:var(--accent)">前往单词本</a></p>';
  }
  html += '</div>';

  html += '<div class="card"><div class="card-header"><h2 class="card-title">继续阅读</h2>' + helpBtn('help-en-reading') + '</div>';
  const actArts = readingArts.concat(recitingArts);
  if (!actArts.length) {
    html += emptyState(I.book, '暂无阅读中的文章', '去英文阅读挑选一篇精选文章开始精读吧。',
      '<button class="btn btn-primary" data-go="en-reading">去阅读</button>');
  } else {
    actArts.forEach((a) => {
      const st = (a.recite && a.recite.active) ? '背诵中' : '阅读中';
      html += '<div class="list-item"><div class="li-icon" style="background:var(--blue-soft);color:#2c5683">' + I.book + '</div>' +
        '<div class="li-main"><div class="li-title">' + esc(a.title) + '</div><div class="li-sub">' + st + ' · ' + esc(a.source || '') + '</div></div>' +
        '<div class="li-actions"><button class="btn btn-sm btn-outline" data-go="en-reading" data-id="' + a.id + '">继续</button></div></div>';
    });
  }
  html += '</div>';

  html += '<div class="card"><div class="card-header"><h2 class="card-title">读书进度</h2>' + helpBtn('help-zh-books') + '</div>';
  if (!readingBooks.length) {
    html += emptyState(I.trend, '没有进行中的书', '在读书计划中添加书籍并设为"在读"状态。',
      '<button class="btn btn-primary" data-go="zh-books">去读书计划</button>');
  } else {
    readingBooks.forEach((b) => {
      html += '<div class="list-item"><div class="li-icon" style="background:var(--green-soft);color:#4a5f2e">' + I.book + '</div>' +
        '<div class="li-main"><div class="li-title">' + esc(b.title) + '</div><div class="li-sub">' + esc(b.author || '') + '</div></div>' +
        '<div style="width:120px"><div class="progress-bar"><div class="pb-fill" style="width:' + Math.min(100, b.progress || 0) + '%"></div></div>' +
        '<div style="font-size:11.5px;color:var(--text-2);margin-top:3px;text-align:right">' + (b.progress || 0) + '%</div></div></div>';
    });
  }
  html += '</div>';
  return html;
};

function dueWordsList() {
  const today = todayStr();
  return (DB.words || []).filter((w) => {
    if (w.status === 'mastered') return false;
    if (w.nextReview && w.nextReview <= today) return true;
    if (!w.nextReview) return true;
    return false;
  });
}
function reviewWord(id) {
  const w = (DB.words || []).find((x) => x.id === id);
  if (!w) return;
  w.reviewCount = (w.reviewCount || 0) + 1;
  if (w.reviewCount >= 3) {
    w.status = 'mastered';
    w.nextReview = null;
    toast('已掌握：' + w.word);
  } else {
    w.status = 'reviewing';
    w.nextReview = addDays(todayStr(), w.reviewCount === 1 ? 3 : 7);
    toast('已复习，下次到期 ' + fmtDate(w.nextReview));
  }
  saveDB();
  route();
}

function genTodayPlan() {
  const today = todayStr();
  DB.tasks = (DB.tasks || []).filter((t) => t.date !== today);
  const goal = (DB.settings && DB.settings.dailyWordGoal) || 10;
  const due = dueWordsList().slice(0, goal);
  due.forEach((w) => {
    DB.tasks.push({ id: uid(), date: today, title: '复习单词：' + w.word + '（' + w.meaning + '）', module: '单词本', done: false, kind: 'daily' });
  });
  const reading = (DB.articles || []).find((a) => a.status === 'reading');
  if (reading) DB.tasks.push({ id: uid(), date: today, title: '精读文章：' + reading.title, module: '英文阅读', done: false, kind: 'daily' });
  const reciting = (DB.articles || []).find((a) => a.recite && a.recite.active);
  if (reciting) DB.tasks.push({ id: uid(), date: today, title: '背诵练习：' + reciting.title, module: '英文阅读', done: false, kind: 'daily' });
  if (!due.length && !reading && !reciting) {
    DB.tasks.push({ id: uid(), date: today, title: '为收集箱添加一条新内容（单词/句子/灵感）', module: '收集箱', done: false, kind: 'daily' });
    DB.tasks.push({ id: uid(), date: today, title: '浏览一组生活场景英语句型', module: '场景英语', done: false, kind: 'daily' });
  }
  saveDB();
  toast('今日计划已生成');
  route();
}

/* ================= 单词本 ================= */
RENDERERS['en-words'] = function () {
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  const letter = q.get('letter') || '';
  const kw = q.get('kw') || '';
  const st = q.get('st') || '';
  let words = (DB.words || []).slice();

  let html = '';
  html += '<div class="card">' +
    '<div class="card-header"><h2 class="card-title">我的单词本</h2>' + helpBtn('help-en-words') +
    '<button class="btn btn-sm btn-primary" data-act="add-word" style="margin-left:auto">' + I.plus + ' 添加单词</button></div>' +
    '<div class="word-search-row">' +
    '<div class="search-wrap grow"><span class="search-icon">' + I.search + '</span>' +
    '<input class="input" id="w-search" placeholder="输入英文单词，或输入中文意思反查（如：美丽）" value="' + esc(kw) + '"></div>' +
    '<select class="select" id="w-status" style="width:130px">' +
    '<option value="">全部状态</option><option value="new" ' + (st === 'new' ? 'selected' : '') + '>生词</option>' +
    '<option value="reviewing" ' + (st === 'reviewing' ? 'selected' : '') + '>复习中</option>' +
    '<option value="mastered" ' + (st === 'mastered' ? 'selected' : '') + '>已掌握</option></select></div>' +
    '<div class="letter-strip">' +
    '<button class="letter ' + (!letter ? 'active' : '') + '" data-letter="">全部</button>' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((L) =>
      '<button class="letter ' + (letter === L ? 'active' : '') + '" data-letter="' + L + '">' + L + '</button>'
    ).join('') + '</div></div>';

  if (letter) words = words.filter((w) => (w.word || '')[0].toUpperCase() === letter);
  if (kw) {
    const isCJK = /[\u4e00-\u9fff]/.test(kw);
    words = words.filter((w) => {
      if (!isCJK) return (w.word || '').toLowerCase().includes(kw.toLowerCase());
      return (w.meaning || '').includes(kw);
    });
  }
  if (st) words = words.filter((w) => w.status === st);
  words.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  if (!words.length) {
    html += '<div class="card">' + emptyState(I.word, (kw || letter) ? '没有匹配的单词' : '单词本还是空的', '遇到不认识的英文单词就记下来，之后用首字母或中文意思都能快速找到。',
      '<button class="btn btn-primary" data-act="add-word">记录第一个单词</button>') + '</div>';
  } else {
    html += '<div class="card"><div style="font-size:12.5px;color:var(--text-2);margin-bottom:12px">共 ' + words.length + ' 个单词</div>';
    words.forEach((w) => {
      const stChip = w.status === 'mastered' ? chip('已掌握', 'green') : w.status === 'reviewing' ? chip('复习中', 'yellow') : chip('生词', 'blue');
      const due = w.nextReview && w.nextReview <= todayStr() ? '<span style="color:var(--danger);font-size:12px">到期</span>' : '';
      html += '<div class="word-card" style="margin-bottom:12px">' +
        '<div class="w-head"><span class="w-word">' + esc(w.word) + '</span>' +
        '<span class="w-phonetic">' + esc(w.phonetic || '') + '</span>' +
        '<span class="w-pos">' + esc(w.pos || '') + '</span>' +
        '<span style="margin-left:auto">' + stChip + ' ' + due + '</span></div>' +
        '<div class="w-meaning">' + esc(w.meaning) + '</div>' +
        (w.example ? '<div class="w-example">' + esc(w.example) + '</div>' : '') +
        '<div class="w-foot">' +
        '<button class="btn btn-sm btn-outline" data-act="edit-word" data-id="' + w.id + '">' + I.edit + ' 编辑</button>' +
        (w.status !== 'mastered' ? '<button class="btn btn-sm btn-primary" data-act="review-word" data-id="' + w.id + '">复习</button>' : '') +
        '<button class="btn btn-sm btn-outline" style="color:var(--danger)" data-act="del-word" data-id="' + w.id + '">' + I.trash + ' 删除</button>' +
        '<span style="margin-left:auto;font-size:12px;color:var(--text-2)">' + w.date + (w.source ? ' · ' + esc(w.source) : '') + '</span></div></div>';
    });
    html += '</div>';
  }
  return html;
};

function isNarrow() { return window.innerWidth <= 820; }

function wordFormHtml(w) {
  w = w || {};
  const id = w.id || '';
  /* 移动端：字典式紧凑呈现，只保留单词、音标、释义（多行），不单独展示词性/例句输入框 */
  if (isNarrow()) {
    const meaningLines = esc((w.meaning || '').replace(/；/g, '\n'));
    return '<div class="word-form-mobile"><h2 style="font-size:13px;color:var(--text-2);font-weight:600;margin-bottom:12px">' + (id ? '编辑单词' : '添加单词') + '</h2>' +
      '<input class="wf-word" id="f-word" value="' + esc(w.word || '') + '" placeholder="单词" autocomplete="off">' +
      '<input class="wf-phonetic" id="f-phonetic" value="' + esc(w.phonetic || '') + '" placeholder="音标  /.../" autocomplete="off">' +
      '<label class="wf-label">释义</label>' +
      '<textarea class="wf-meanings" id="f-meaning" placeholder="每行一条释义，如：\nadj. 非常沮丧的\nv. 损毁……的内部">' + meaningLines + '</textarea>' +
      '<div class="modal-actions">' +
      '<button class="btn btn-secondary" data-act="close-modal">取消</button>' +
      '<button class="btn btn-primary" data-act="save-word" data-id="' + id + '">保存</button></div></div>';
  }
  return '<h2>' + (id ? '编辑单词' : '添加单词') + '</h2>' +
    '<div class="field"><label>单词 *</label><input class="input" id="f-word" value="' + esc(w.word || '') + '" placeholder="如：serendipity"></div>' +
    '<div class="field"><label>音标</label><input class="input" id="f-phonetic" value="' + esc(w.phonetic || '') + '" placeholder="如：/ˌserənˈdɪpəti/"></div>' +
    '<div class="field"><label>词性</label><input class="input" id="f-pos" value="' + esc(w.pos || '') + '" placeholder="如：n. 名词"></div>' +
    '<div class="field"><label>中文释义 *</label><input class="input" id="f-meaning" value="' + esc(w.meaning || '') + '" placeholder="如：n. 意外发现珍宝的运气"></div>' +
    '<div class="field"><label>例句</label><textarea class="textarea" id="f-example" placeholder="英文例句，可附中文">' + esc(w.example || '') + '</textarea></div>' +
    '<div class="modal-actions">' +
    '<button class="btn btn-secondary" data-act="close-modal">取消</button>' +
    '<button class="btn btn-primary" data-act="save-word" data-id="' + id + '">保存</button></div>';
}


/* ================= 英文阅读 ================= */
RENDERERS['en-reading'] = function () {
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  const id = q.get('id');
  const arts = DB.articles || [];
  if (id) {
    const a = arts.find((x) => x.id === id);
    if (a) return renderArticleDetail(a, q.get('tab') || 'read');
  }
  return renderArticleList(arts, q.get('sf') || '');
};

function renderArticleList(arts, statusFilter) {
  let html = '';
  html += '<div class="card"><div class="card-header"><h2 class="card-title">精选文章</h2>' + helpBtn('help-en-reading') +
    '<button class="btn btn-sm btn-primary" data-act="add-article" style="margin-left:auto">' + I.plus + ' 添加文章</button></div>' +
    '<div class="article-toolbar">' +
    ['', 'unread', 'reading', 'read', 'reciting'].map((s) => {
      const lbl = s === '' ? '全部' : s === 'unread' ? '未读' : s === 'reading' ? '阅读中' : s === 'read' ? '已读完' : '背诵中';
      return '<button class="btn btn-sm ' + (statusFilter === s ? 'btn-primary' : 'btn-outline') + '" data-sf="' + s + '">' + lbl + '</button>';
    }).join('') + '</div></div>';

  let list = arts.slice();
  if (statusFilter) list = list.filter((a) => (statusFilter === 'reciting' ? (a.recite && a.recite.active) : a.status === statusFilter));

  if (!list.length) {
    html += '<div class="card">' + emptyState(I.book, (statusFilter ? '该状态下暂无文章' : '还没有文章'), '内置了精选短文，也可以"添加文章"粘贴自己的阅读材料。',
      statusFilter ? '' : '<button class="btn btn-primary" data-act="add-article">添加文章</button>') + '</div>';
  } else {
    list.forEach((a) => {
      const reciting = a.recite && a.recite.active;
      const st = reciting ? '背诵中' : a.status === 'reading' ? '阅读中' : a.status === 'read' ? '已读完' : '未读';
      const stCls = reciting ? 'pink' : a.status === 'reading' ? 'blue' : a.status === 'read' ? 'green' : 'gray';
      const annCount = (a.annotations || []).length + (a.longSentences || []).length;
      html += '<div class="list-item"><div class="li-icon" style="background:var(--' + (reciting ? 'pink' : stCls) + '-soft);color:' + (reciting ? '#8c3a63' : stCls === 'blue' ? '#2c5683' : stCls === 'green' ? '#4a5f2e' : '#6F7277') + '">' + I.book + '</div>' +
        '<div class="li-main"><div class="li-title">' + esc(a.title) + '</div>' +
        '<div class="li-sub">' + chip(st, stCls) + ' ' + esc(a.level || '') + ' · ' + esc(a.category || '') + (annCount ? ' · 标记 ' + annCount + ' 处' : '') + '</div></div>' +
        '<div class="li-actions"><button class="btn btn-sm btn-primary" data-go="en-reading" data-id="' + a.id + '">' + (a.status === 'unread' ? '开始阅读' : '继续') + '</button></div></div>';
    });
  }
  return html;
}

function renderArticleDetail(a, tab) {
  const reciting = a.recite && a.recite.active;
  let html = '';
  html += '<div style="margin-bottom:14px"><button class="btn btn-sm btn-outline" data-go="en-reading">' + I.back + ' 返回列表</button></div>';

  html += '<div class="reading-view" data-art-id="' + a.id + '">';
  if (reciting && tab === 'recite') {
    html += '<div class="card-header"><h2 class="card-title">背写模式：' + esc(a.title) + '</h2>' + helpBtn('help-en-reading') + '</div>' +
      '<div class="recite-mode"><div class="rm-hint">凭记忆默写这篇文章。写完后点"对照原文"检查。</div>' +
      '<textarea class="textarea" id="recite-input" placeholder="在这里默写…"></textarea>' +
      '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">' +
      '<button class="btn btn-primary" data-act="recite-check">对照原文</button>' +
      '<button class="btn btn-outline" data-act="recite-exit">退出背写</button></div>' +
      '<div id="recite-result" style="display:none" class="recite-compare"></div></div>';
  } else {
    html += '<h2>' + esc(a.title) + '</h2>' +
      '<div class="art-meta">' + esc(a.source || '') + ' · ' + esc(a.level || '') + ' · ' + esc(a.category || '') + ' · ' + chip(
        reciting ? '背诵中' : a.status === 'reading' ? '阅读中' : a.status === 'read' ? '已读完' : '未读',
        reciting ? 'pink' : a.status === 'reading' ? 'blue' : a.status === 'read' ? 'green' : 'gray') + '</div>' +
      '<div class="art-body">' + renderArticleContent(a) + '</div>' +
      '<div class="art-legend"><span class="lg"><span class="sw" style="background:var(--yellow)"></span>划线</span>' +
      '<span class="lg"><span class="sw" style="background:var(--blue)"></span>标注</span>' +
      '<span class="lg"><span class="sw" style="background:var(--green)"></span>摘抄</span>' +
      '<span class="lg"><span class="sw" style="background:var(--pink)"></span>长难句</span></div>' +
      '<div class="art-actions">' +
      '<button class="btn btn-sm btn-outline" data-act="art-status" data-id="' + a.id + '">' + (a.status === 'read' ? '标记未读完' : a.status === 'reading' ? '标记已读完' : '标记开始阅读') + '</button>' +
      '<button class="btn btn-sm ' + (reciting ? 'btn-secondary' : 'btn-outline') + '" data-act="art-recite" data-id="' + a.id + '">' + (reciting ? '取消背诵' : '加入背诵') + '</button>' +
      '<button class="btn btn-sm btn-primary" data-act="recite-enter" data-id="' + a.id + '">进入背写模式</button>' +
      '</div>';
  }
  html += '</div>';

  if (!(reciting && tab === 'recite')) {
    html += '<div class="card"><div class="card-header"><h2 class="card-title">长难句解析</h2>' + helpBtn('help-en-reading') +
      '<button class="btn btn-sm btn-outline" data-act="add-sentence" data-id="' + a.id + '" style="margin-left:auto">' + I.plus + ' 手动添加</button></div>';
    const ls = a.longSentences || [];
    if (!ls.length) {
      html += '<p style="font-size:13px;color:var(--text-2)">暂无长难句。在正文中选中一个句子，点"长难句"即可加入。</p>';
    } else {
      ls.forEach((s, i) => {
        html += '<div class="annot-list-item"><div class="al-type" style="color:#8c3a63">长难句 ' + (i + 1) + '</div>' +
          '<div class="al-text">' + esc(s.sentence) + '</div>' +
          (s.analysis ? '<div class="al-comment">' + esc(s.analysis) + '</div>' : '') +
          '<div style="display:flex;gap:6px;margin-top:6px"><button class="btn btn-sm btn-outline" data-act="edit-sentence" data-id="' + s.id + '" data-art="' + a.id + '">编辑解析</button>' +
          '<button class="btn btn-sm btn-outline" style="color:var(--danger)" data-act="del-sentence" data-id="' + s.id + '" data-art="' + a.id + '">删除</button></div></div>';
      });
    }
    html += '</div>';

    html += '<div class="card"><div class="card-header"><h2 class="card-title">标注清单</h2>' + helpBtn('help-annot') + '</div>';
    const anns = (a.annotations || []).slice().sort((x, y) => x.start - y.start);
    if (!anns.length) {
      html += '<p style="font-size:13px;color:var(--text-2)">暂无标注。在正文中选中文字，即可划线、标注、摘抄。</p>';
    } else {
      anns.forEach((an, i) => {
        const typeName = an.type === 'highlight' ? '划线' : an.type === 'quote' ? '摘抄' : an.type === 'sentence' ? '长难句' : '标注';
        const tCls = an.type === 'highlight' ? 'yellow' : an.type === 'quote' ? 'green' : an.type === 'sentence' ? 'pink' : 'blue';
        html += '<div class="annot-list-item"><div class="al-type" style="color:var(--text-2)">' + chip(typeName, tCls) + ' · 第' + (i + 1) + '处</div>' +
          '<div class="al-text">' + esc(an.text) + '</div>' +
          (an.comment ? '<div class="al-comment">' + esc(an.comment) + '</div>' : '') +
          '<div style="display:flex;gap:6px;margin-top:6px"><button class="btn btn-sm btn-outline" style="color:var(--danger)" data-act="del-annot" data-id="' + an.id + '" data-art="' + a.id + '">删除</button></div></div>';
      });
    }
    html += '</div>';
  }
  return html;
}

function renderArticleContent(a) {
  const anns = (a.annotations || []).slice().sort((x, y) => x.start - y.start);
  const content = a.content || '';
  if (!anns.length) return esc(content);
  let html = '', pos = 0, cmtNo = 0;
  anns.forEach((an) => {
    const s = Math.max(pos, Math.min(an.start, content.length));
    const e = Math.min(an.end, content.length);
    if (s > pos) html += esc(content.slice(pos, s));
    if (e > s) {
      const text = esc(content.slice(s, e));
      if (an.type === 'highlight') html += '<mark>' + text + '</mark>';
      else if (an.type === 'quote') html += '<span class="quote-mark">' + text + '</span>';
      else if (an.type === 'sentence') html += '<mark style="border-bottom-color:var(--pink)">' + text + '</mark>';
      else {
        cmtNo++;
        html += '<span class="annot-mark" data-annot="' + an.id + '" data-num="' + cmtNo + '">' + text + '<span class="annot-no">' + cmtNo + '</span></span>';
      }
    }
    pos = Math.max(pos, e);
  });
  html += esc(content.slice(pos));
  return html;
}

function getSelectionOffsets(container) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) return null;
  const pre = range.cloneRange();
  pre.selectNodeContents(container);
  pre.setEnd(range.startContainer, range.startOffset);
  const start = pre.toString().length;
  const text = range.toString();
  if (!text.trim()) return null;
  return { start: start, end: start + text.length, text: text };
}

function addAnnotation(artId, type, sel, comment) {
  const a = (DB.articles || []).find((x) => x.id === artId);
  if (!a) return;
  const conflict = (a.annotations || []).some((an) => !(sel.end <= an.start || sel.start >= an.end));
  if (conflict) { toast('该区域已有标记，请选择其他位置'); return; }
  a.annotations = a.annotations || [];
  a.annotations.push({ id: uid(), type: type, start: sel.start, end: sel.end, text: sel.text, comment: comment || '', date: todayStr() });
  if (type === 'quote') {
    DB.quotes = DB.quotes || [];
    DB.quotes.push({ id: uid(), text: sel.text, source: a.title, tags: ['阅读摘抄'], feeling: '', language: 'en', date: todayStr() });
  }
  saveDB();
  route();
  toast(type === 'highlight' ? '已划线' : type === 'quote' ? '已存入佳句摘抄' : '已标注');
}

/* ================= 听说训练 ================= */
RENDERERS['en-listening'] = function () {
  let html = '';
  html += '<div class="card"><div class="card-header"><h2 class="card-title">录音练习</h2>' + helpBtn('help-en-listening') + '</div>' +
    '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">' +
    '<button class="rec-btn" id="rec-btn" data-act="toggle-rec" aria-label="录音">' + I.mic + '</button>' +
    '<div class="rec-timer" id="rec-timer">00:00</div>' +
    '<div style="flex:1;min-width:200px">' +
    '<input class="input" id="rec-title" placeholder="录音标题，如：朗读《A Morning by the Lake》">' +
    '<div style="font-size:12px;color:var(--text-2);margin-top:6px">录音保存在本机浏览器，不经过服务器。听力和口语都可以录。</div></div></div>' +
    '<div id="rec-status" style="margin-top:10px;font-size:13px;color:var(--text-2)"></div></div>';

  const recs = (DB.recordings || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  html += '<div class="card"><div class="card-header"><h2 class="card-title">录音列表</h2>' + helpBtn('help-en-listening') + '</div>';
  if (!recs.length) {
    html += emptyState(I.headphones, '还没有录音', '点上方圆形按钮开始第一次录音。');
  } else {
    recs.forEach((r) => {
      html += '<div class="list-item"><div class="li-icon" style="background:var(--pink-soft);color:#8c3a63">' + I.headphones + '</div>' +
        '<div class="li-main"><div class="li-title">' + esc(r.title) + '</div>' +
        '<div class="li-sub">' + r.date + ' ' + (r.time || '') + ' · ' + r.duration + '</div>' +
        '<audio controls preload="none" data-audio-key="' + r.blobKey + '" style="margin-top:6px"></audio></div>' +
        '<div class="li-actions"><button class="btn btn-sm btn-outline" style="color:var(--danger)" data-act="del-rec" data-id="' + r.id + '">' + I.trash + '</button></div></div>';
    });
    html += '<p style="font-size:12px;color:var(--text-2);margin-top:10px">音频保存在本机浏览器（IndexedDB）。JSON 备份只包含录音元数据，不含音频本体。</p>';
  }
  html += '</div>';
  return html;
};

let REC = { media: null, rec: null, chunks: [], timer: null, sec: 0, startTs: 0, mime: '' };
async function toggleRec() {
  const btn = $('#rec-btn');
  if (REC.rec && REC.rec.state === 'recording') {
    REC.rec.stop();
    REC.media.getTracks().forEach((t) => t.stop());
    clearInterval(REC.timer);
    $('#rec-timer').textContent = '00:00';
    btn.classList.remove('recording');
    btn.innerHTML = I.mic;
    const title = ($('#rec-title').value || '').trim() || '录音 ' + todayStr() + ' ' + timeHM();
    const dur = fmtDur(REC.sec);
    if (REC.chunks.length) {
      const blob = new Blob(REC.chunks, { type: REC.mime || 'audio/webm' });
      const key = uid();
      try {
        await audioPut(key, blob);
        DB.recordings = DB.recordings || [];
        DB.recordings.push({ id: uid(), title: title, date: todayStr(), time: timeHM(), duration: dur, blobKey: key });
        saveDB();
        toast('录音已保存：' + title);
        route();
      } catch (e) {
        toast('录音保存失败，请重试');
      }
    }
    REC = { media: null, rec: null, chunks: [], timer: null, sec: 0, startTs: 0, mime: '' };
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
    const rec = new MediaRecorder(stream, { mimeType: mime });
    REC = { media: stream, rec: rec, chunks: [], timer: null, sec: 0, startTs: Date.now(), mime: mime };
    rec.ondataavailable = (e) => { if (e.data.size) REC.chunks.push(e.data); };
    rec.start();
    btn.classList.add('recording');
    btn.innerHTML = I.stop;
    REC.timer = setInterval(() => {
      REC.sec = Math.floor((Date.now() - REC.startTs) / 1000);
      $('#rec-timer').textContent = fmtDur(REC.sec);
    }, 500);
    $('#rec-status').textContent = '正在录音…再次点击圆形按钮停止并保存。';
  } catch (e) {
    toast('无法访问麦克风，请检查浏览器权限');
  }
}
function fmtDur(sec) {
  return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
}

/* ================= 场景英语 ================= */
RENDERERS['en-scenarios'] = function () {
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  const cat = q.get('cat') || '';
  const id = q.get('id');
  const list = window.SAMPLE_DATA.scenarios;
  const one = list.find((s) => s.id === id);

  if (one) {
    const c = scColor(one.color);
    let html = '';
    html += '<div style="margin-bottom:14px"><button class="btn btn-sm btn-outline" data-go="en-scenarios">' + I.back + ' 返回场景列表</button></div>';
    html += '<div class="card"><div class="card-header"><h2 class="card-title">' + esc(one.name) + '</h2>' + helpBtn('help-en-scenarios') + '</div>';
    html += '<h3 style="font-size:14px;color:var(--text-2);margin-bottom:10px">常用句型</h3>';
    one.phrases.forEach((p) => {
      html += '<div class="phrase-row"><div class="en">' + esc(p.en) + '</div><div class="cn">' + esc(p.cn) + '</div></div>';
    });
    html += '<h3 style="font-size:14px;color:var(--text-2);margin:18px 0 10px">场景对话</h3>';
    one.dialogues.forEach((d) => {
      html += '<div class="dialog-line"><div class="dl-who">' + esc(d.who) + '</div>' +
        '<div class="dl-body"><div class="dl-en">' + esc(d.en) + '</div><div class="dl-cn">' + esc(d.cn) + '</div></div></div>';
    });
    html += '<div style="margin-top:14px"><button class="btn btn-primary" data-go="en-dialogues">去对话练习</button></div>';
    html += '</div>';
    return html;
  }

  let html = '';
  html += '<div class="card"><div class="card-header"><h2 class="card-title">场景英语</h2>' + helpBtn('help-en-scenarios') + '</div>' +
    '<div class="article-toolbar">' +
    ['', '生活', '工作'].map((c) => '<button class="btn btn-sm ' + (cat === c ? 'btn-primary' : 'btn-outline') + '" data-cat="' + c + '">' + (c === '' ? '全部' : c) + '</button>').join('') +
    '</div></div>';
  let items = list.filter((s) => !cat || s.category === cat);
  html += '<div class="grid grid-2">';
  items.forEach((s) => {
    const c = scColor(s.color);
    html += '<div class="card scenario-card" data-go="en-scenarios" data-id="' + s.id + '">' +
      '<div class="sc-icon" style="background:' + c[0] + ';color:' + c[1] + '">' + I.chat + '</div>' +
      '<div class="sc-name">' + esc(s.name) + '</div>' +
      '<div class="sc-desc">' + esc(s.category) + ' · ' + s.phrases.length + ' 句型 · ' + s.dialogues.length + ' 组对话</div></div>';
  });
  html += '</div>';
  return html;
};
function scColor(name) {
  const m = {
    blue: ['var(--blue-soft)', '#2c5683'], pink: ['var(--pink-soft)', '#8c3a63'],
    green: ['var(--green-soft)', '#4a5f2e'], yellow: ['var(--yellow-soft)', '#8a6d00']
  };
  return m[name] || m.blue;
}

/* ================= 对话练习 ================= */
RENDERERS['en-dialogues'] = function () {
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  const dg = q.get('dg');
  const list = window.SAMPLE_DATA.dialogues;
  const one = list.find((d) => d.id === dg);

  let html = '';
  html += '<div class="card"><div class="card-header"><h2 class="card-title">内置场景对话</h2>' + helpBtn('help-en-dialogues') + '</div>';
  if (one) {
    html += '<div style="margin-bottom:12px"><button class="btn btn-sm btn-outline" data-go="en-dialogues">' + I.back + ' 返回</button></div>';
    html += '<h3>' + esc(one.name) + '</h3><p style="font-size:13px;color:var(--text-2);margin:4px 0 14px">' + esc(one.desc) + '</p>';
    one.lines.forEach((d) => {
      html += '<div class="dialog-line"><div class="dl-who">' + esc(d.who) + '</div>' +
        '<div class="dl-body"><div class="dl-en">' + esc(d.en) + '</div><div class="dl-cn">' + esc(d.cn) + '</div></div>' +
        '<button class="btn btn-sm btn-outline" data-act="speak" data-txt="' + esc(d.en) + '" style="flex-shrink:0">' + I.headphones + ' 跟读</button></div>';
    });
    return html + '</div>';
  }
  list.forEach((d) => {
    html += '<div class="list-item" data-go="en-dialogues" data-dg="' + d.id + '" style="cursor:pointer"><div class="li-icon" style="background:var(--blue-soft);color:#2c5683">' + I.chat + '</div>' +
      '<div class="li-main"><div class="li-title">' + esc(d.name) + '</div><div class="li-sub">' + esc(d.desc) + ' · ' + d.lines.length + ' 句</div></div>' +
      '<div class="li-actions" style="color:var(--text-2)">' + I.chevron + '</div></div>';
  });
  html += '</div>';

  const cfg = DB.settings || {};
  const configured = !!(cfg.aiKey && cfg.aiBaseUrl);
  html += '<div class="card"><div class="card-header"><h2 class="card-title">AI 英语对话</h2>' + helpBtn('help-en-dialogues') + '</div>';
  html += '<div class="ai-status-bar ' + (configured ? 'on' : 'off') + '"><span class="dot"></span>' +
    (configured ? 'AI 已配置，可以开始对话' : 'AI 未配置：本版本为界面预留，配置后可用') +
    (configured ? '' : '<button class="btn btn-sm btn-secondary" style="margin-left:auto" data-go="settings">去配置</button>') + '</div>';
  if (configured) {
    html += '<div class="chat-box" id="ai-chat">' +
      '<div class="chat-msg ai">Hello! Let us practice English together. You can talk about daily life, ordering food, traveling, or anything you like. 你可以用英语和我对话，我会帮你纠正表达。</div></div>' +
      '<div class="chat-input-row"><input class="input" id="ai-chat-input" placeholder="用英语输入，开始练习…">' +
      '<button class="btn btn-primary" data-act="ai-send">发送</button></div>';
  } else {
    html += '<ul style="font-size:13.5px;color:var(--text-2);padding-left:20px;line-height:1.9">' +
      '<li>在"设置与数据 - AI 配置"填写兼容 OpenAI 的接口地址与 API Key</li>' +
      '<li>配置后此处可自由英语对话，AI 扮演对话伙伴并纠正表达</li>' +
      '<li>未配置时系统不会假装回复</li></ul>';
  }
  html += '</div>';
  return html;
};

/* ================= 学习计划 ================= */
RENDERERS['en-plan'] = function () {
  const today = todayStr();
  const tasks = (DB.tasks || []).filter((t) => t.date === today);
  const done = tasks.filter((t) => t.done).length;

  let html = '';
  html += '<div class="card"><div class="card-header"><h2 class="card-title">今日计划</h2>' + helpBtn('help-en-plan') +
    '<button class="btn btn-sm btn-primary" data-act="gen-today" style="margin-left:auto">' + I.refresh + ' 生成今日计划</button></div>' +
    '<p style="font-size:13px;color:var(--text-2);margin-bottom:12px">已完成 ' + done + ' / ' + tasks.length + ' 项</p>';
  if (!tasks.length) {
    html += emptyState(I.calendar, '今天还没有任务', '点"生成今日计划"自动从各模块聚合任务。');
  } else {
    tasks.forEach((t) => {
      html += '<div class="todo-item' + (t.done ? ' done' : '') + '">' +
        '<button class="todo-check" data-act="toggle-task" data-id="' + t.id + '">' + I.check + '</button>' +
        '<div class="todo-text">' + esc(t.title) + '<div class="todo-meta">' + esc(t.module || '') + '</div></div>' +
        '<button class="icon-btn" data-act="del-task" data-id="' + t.id + '">' + I.trash + '</button></div>';
    });
  }
  html += '<div style="margin-top:10px"><button class="btn btn-sm btn-outline" data-act="add-task">' + I.plus + ' 手动添加任务</button></div></div>';

  html += '<div class="card"><div class="card-header"><h2 class="card-title">每周复习计划</h2>' + helpBtn('help-en-plan') + '</div>';
  const ws = weekStart(today);
  const weekDays = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(ws, i));
  const weekWords = (DB.words || []).filter((w) => w.nextReview && w.nextReview >= ws && w.nextReview <= addDays(ws, 6) && w.status !== 'mastered');
  const weekArts = (DB.articles || []).filter((a) => a.recite && a.recite.active);

  html += '<div class="plan-grid">' + weekDays.map((d) => {
    const isToday = d === today;
    const cnt = weekWords.filter((w) => w.nextReview === d).length;
    return '<div class="pd ' + (isToday ? 'today' : '') + (cnt ? ' has' : '') + '"><span class="pd-d">' + d.slice(8, 10) + '</span>' + (isToday ? '今天' : '') + (cnt ? ' · ' + cnt + '词' : '') + '</div>';
  }).join('') + '</div>';

  html += '<h3 style="font-size:14px;margin:16px 0 8px">本周复习清单</h3>';
  const weekItems = [];
  weekWords.forEach((w) => weekItems.push({ d: w.nextReview, txt: '复习单词：' + w.word, mod: '单词本' }));
  weekArts.forEach((a) => weekItems.push({ d: today, txt: '背诵练习：' + a.title, mod: '英文阅读' }));
  weekItems.sort((a, b) => a.d.localeCompare(b.d));
  if (!weekItems.length) {
    html += '<p style="font-size:13px;color:var(--text-2)">本周暂无到期复习项。新收录的单词将在 3 天后进入复习计划。</p>';
  } else {
    weekItems.forEach((it) => {
      html += '<div class="list-item" style="margin-bottom:8px"><div class="li-main"><div class="li-title">' + esc(it.txt) + '</div><div class="li-sub">' + fmtDate(it.d) + ' · ' + esc(it.mod) + '</div></div></div>';
    });
  }

  const weekTasks = (DB.tasks || []).filter((t) => t.kind === 'weekly' && t.date >= ws && t.date <= addDays(ws, 6));
  html += '<h3 style="font-size:14px;margin:18px 0 8px">手动每周任务</h3>';
  if (!weekTasks.length) {
    html += '<p style="font-size:13px;color:var(--text-2)">没有手动任务。</p>';
  } else {
    weekTasks.forEach((t) => {
      html += '<div class="todo-item' + (t.done ? ' done' : '') + '">' +
        '<button class="todo-check" data-act="toggle-task" data-id="' + t.id + '">' + I.check + '</button>' +
        '<div class="todo-text">' + esc(t.title) + '<div class="todo-meta">' + fmtDate(t.date) + ' · ' + esc(t.module || '') + '</div></div>' +
        '<button class="icon-btn" data-act="del-task" data-id="' + t.id + '">' + I.trash + '</button></div>';
    });
  }
  html += '<div style="margin-top:10px"><button class="btn btn-sm btn-outline" data-act="add-task" data-kind="weekly">' + I.plus + ' 添加每周任务</button></div>';
  html += '</div>';
  return html;
};

/* ================= 中文板块：佳句摘抄 ================= */
RENDERERS['zh-quotes'] = function () {
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  const tag = q.get('tag') || '';
  const lang = q.get('lang') || '';
  let list = (DB.quotes || []).slice();
  const allTags = Array.from(new Set(list.flatMap((x) => (x.tags || []))));
  if (tag) list = list.filter((x) => (x.tags || []).includes(tag));
  if (lang) list = list.filter((x) => x.language === lang);

  let html = '';
  html += '<div class="card"><div class="card-header"><h2 class="card-title">佳句摘抄</h2>' + helpBtn('help-zh-quotes') +
    '<button class="btn btn-sm btn-primary" data-act="add-quote" style="margin-left:auto">' + I.plus + ' 添加摘抄</button></div>' +
    '<div class="article-toolbar">' +
    ['', 'zh', 'en'].map((l) => '<button class="btn btn-sm ' + (lang === l ? 'btn-primary' : 'btn-outline') + '" data-qlang="' + l + '">' + (l === '' ? '全部语言' : l === 'zh' ? '中文' : '英文') + '</button>').join('') +
    '</div>' +
    (allTags.length ? '<div class="article-toolbar">' + allTags.map((t) =>
      '<button class="btn btn-sm ' + (tag === t ? 'btn-primary' : 'btn-outline') + '" data-qtag="' + t + '">' + esc(t) + '</button>').join('') +
      (tag ? '<button class="btn btn-sm btn-outline" data-qtag="">清除筛选</button>' : '') + '</div>' : '') +
    '</div>';

  if (!list.length) {
    html += '<div class="card">' + emptyState(I.quote, (tag || lang) ? '没有匹配的摘抄' : '还没有摘抄', '遇到优美的中文词句就记下来；英文阅读里"摘抄"的内容也会自动存入。',
      '<button class="btn btn-primary" data-act="add-quote">记录第一句</button>') + '</div>';
  } else {
    list.forEach((qt) => {
      html += '<div class="card quote-card" style="margin-bottom:12px">' +
        '<div class="qc-text' + (qt.language === 'en' ? '' : ' large') + '">' + esc(qt.text) + '</div>' +
        '<div class="qc-meta">' + (qt.source ? '<span>' + esc(qt.source) + '</span>' : '') +
        (qt.language === 'en' ? chip('英文', 'blue') : chip('中文', 'green')) +
        (qt.tags && qt.tags.length ? '<span class="qc-tags">' + qt.tags.map((t) => chip(t, 'gray')).join('') + '</span>' : '') +
        '<span>' + qt.date + '</span>' +
        '<span style="margin-left:auto;display:inline-flex;gap:4px">' +
        '<button class="icon-btn" style="width:32px;height:32px" data-act="edit-quote" data-id="' + qt.id + '">' + I.edit + '</button>' +
        '<button class="icon-btn" style="width:32px;height:32px;color:var(--danger)" data-act="del-quote" data-id="' + qt.id + '">' + I.trash + '</button></span></div></div>';
    });
  }
  return html;
};

function quoteFormHtml(qt) {
  qt = qt || {};
  return '<h2>' + (qt.id ? '编辑摘抄' : '添加摘抄') + '</h2>' +
    '<div class="field"><label>句子内容 *</label><textarea class="textarea" id="f-qt-text">' + esc(qt.text || '') + '</textarea></div>' +
    '<div class="field"><label>出处</label><input class="input" id="f-qt-source" value="' + esc(qt.source || '') + '" placeholder="如：《围城》 / 某篇文章"></div>' +
    '<div class="field"><label>标签（逗号分隔）</label><input class="input" id="f-qt-tags" value="' + esc((qt.tags || []).join('，')) + '" placeholder="如：哲理，生活"></div>' +
    '<div class="field"><label>个人感悟</label><textarea class="textarea" id="f-qt-feeling" style="min-height:60px">' + esc(qt.feeling || '') + '</textarea></div>' +
    '<div class="field"><label>语言</label><select class="select" id="f-qt-lang"><option value="zh" ' + (qt.language !== 'en' ? 'selected' : '') + '>中文</option><option value="en" ' + (qt.language === 'en' ? 'selected' : '') + '>英文</option></select></div>' +
    '<div class="modal-actions"><button class="btn btn-secondary" data-act="close-modal">取消</button>' +
    '<button class="btn btn-primary" data-act="save-quote" data-id="' + (qt.id || '') + '">保存</button></div>';
}

/* 暴露给第二部分使用 */
window.WB = { $, $$, esc, uid, todayStr, addDays, weekStart, fmtDate, timeHM, toast,
  I, DB, getDB: () => DB, setDB: (d) => { DB = d; }, loadDB, saveDB, resetDB, initAudioDB, audioPut, audioGet, audioDel,
  HELP, helpKeyForView, openModal, closeModal, openHelp, closeHelp, bindHelpGlobal,
  VIEW_META, navigate, route, RENDERERS, renderView, renderInboxBadge, chip, helpBtn, emptyState,
  dueWordsList, reviewWord, genTodayPlan, wordFormHtml, quoteFormHtml, renderArticleContent,
  getSelectionOffsets, addAnnotation, toggleRec, fmtDur, scColor,
  bindGlobalEvents: null };
})();
