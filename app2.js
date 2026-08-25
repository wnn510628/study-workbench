/* =========================================================
   个人 AI 学习工作台 — 应用逻辑 v1.0（第二部分：中文板块 + 公共能力 + 事件绑定）
   ========================================================= */
(function () {
'use strict';
const WB = window.WB;
const $ = WB.$, $$ = WB.$$, esc = WB.esc, uid = WB.uid;
const todayStr = WB.todayStr, addDays = WB.addDays, fmtDate = WB.fmtDate, timeHM = WB.timeHM;
const I = WB.I, toast = WB.toast;
const getDB = WB.getDB, saveDB = WB.saveDB;
const RENDERERS = WB.RENDERERS, navigate = WB.navigate, route = WB.route;
const openModal = WB.openModal, closeModal = WB.closeModal, closeHelp = WB.closeHelp;
const chip = WB.chip, helpBtn = WB.helpBtn, emptyState = WB.emptyState;

/* ================= 工具：语言判定 / 收集箱 ================= */
function guessLang(text) {
  text = String(text || '');
  const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const latin = (text.match(/[a-zA-Z]/g) || []).length;
  if (cjk === 0 && latin > 0) return 'en';
  if (cjk > 0 && latin === 0) return 'zh';
  if (cjk > 0 && latin > 0) return cjk >= latin ? 'zh' : 'en';
  return '';
}

function addInbox(content) {
  content = String(content || '').trim();
  if (!content) { toast('请输入要收集的内容'); return; }
  const db = getDB();
  db.inbox = db.inbox || [];
  db.inbox.push({ id: uid(), content: content, date: todayStr(), time: timeHM(), status: 'pending', lang: guessLang(content) });
  saveDB();
  toast('已收入收集箱');
  route();
}

function applyInboxItem(item, lang, module) {
  const db = getDB();
  const content = String(item.content || '').trim();
  if (!content) return;
  if (module === 'words') {
    db.words = db.words || [];
    db.words.push({ id: uid(), word: content, phonetic: '', pos: '', meaning: '（来自收集箱，待补充）', example: '', date: todayStr(), status: 'new', source: '收集箱' });
  } else if (module === 'quote') {
    db.quotes = db.quotes || [];
    db.quotes.push({ id: uid(), text: content, source: '收集箱', tags: [], feeling: '', language: lang === 'en' ? 'en' : 'zh', date: todayStr() });
  } else if (module === 'inspiration') {
    db.inspirations = db.inspirations || [];
    db.inspirations.push({ id: uid(), text: content, date: todayStr() });
  } else if (module === 'article') {
    db.articles = db.articles || [];
    db.articles.push({ id: uid(), title: content.slice(0, 30) || '未命名', source: '收集箱', level: '', category: '', content: content, status: 'unread', annotations: [], longSentences: [], recite: null });
  }
  db.inbox = (db.inbox || []).filter((x) => x.id !== item.id);
}

function suggestFor(it) {
  const content = String(it.content || '').trim();
  const lang = it.lang || guessLang(content);
  if (lang === 'en') {
    if (!/\s/.test(content) && content.length > 1) return { module: 'words', txt: '建议：英文单词 → 单词本' };
    if (content.split(/\s+/).length > 40) return { module: 'article', txt: '建议：英文长文 → 英文文章' };
    return { module: 'quote', txt: '建议：英文句子 → 佳句摘抄' };
  }
  if (lang === 'zh') {
    if (content.length <= 30) return { module: 'inspiration', txt: '建议：中文短句 → 创作灵感' };
    return { module: 'article', txt: '建议：中文长文 → 中文文章' };
  }
  return { module: 'quote', txt: '建议：手动归类' };
}

/* 归类弹窗（层级：语言 → 模块） */
let CLS = { itemId: '', lang: '', module: '' };
function openClassifyModal(id) {
  const item = (getDB().inbox || []).find((x) => x.id === id);
  if (!item) return;
  CLS = { itemId: id, lang: item.lang || guessLang(item.content) || 'en', module: '' };
  openModal(clsHtml());
}
function clsHtml() {
  const item = (getDB().inbox || []).find((x) => x.id === CLS.itemId) || {};
  const opts = CLS.lang === 'en'
    ? [['words', '单词本'], ['quote', '佳句摘抄'], ['article', '英文文章'], ['inspiration', '创作灵感']]
    : [['quote', '佳句摘抄'], ['inspiration', '创作灵感'], ['article', '中文文章']];
  return '<h2>归类确认</h2>' +
    '<div style="padding:10px 12px;background:var(--bg);border-radius:var(--radius-sm);font-size:14px;line-height:1.7;margin-bottom:4px">' + esc(item.content || '') + '</div>' +
    '<div class="field" style="margin-top:16px"><label>第一步：内容语言</label><div class="classify-row">' +
    ['en', 'zh'].map((l) => '<button class="classify-opt' + (CLS.lang === l ? ' selected' : '') + '" data-cls-lang="' + l + '">' + (l === 'en' ? '英文' : '中文') + '</button>').join('') +
    '</div></div>' +
    '<div class="field"><label>第二步：归入模块</label><div class="classify-row" id="cls-mod-row">' +
    opts.map((o) => '<button class="classify-opt' + (CLS.module === o[0] ? ' selected' : '') + '" data-cls-mod="' + o[0] + '">' + o[1] + '</button>').join('') +
    '</div></div>' +
    '<div class="modal-actions"><button class="btn btn-secondary" data-act="close-modal">取消</button>' +
    '<button class="btn btn-primary" data-act="cls-confirm">确认归类</button></div>';
}
function clsConfirm() {
  const item = (getDB().inbox || []).find((x) => x.id === CLS.itemId);
  if (!item) { closeModal(); return; }
  if (!CLS.module) { toast('请先选择归入模块'); return; }
  applyInboxItem(item, CLS.lang, CLS.module);
  saveDB();
  closeModal();
  toast('已归类');
  route();
}

/* ================= 确认弹窗 ================= */
function confirmDel(msg, fn) {
  window.__confirmFn = fn;
  openModal('<h2>确认操作</h2>' +
    '<p style="font-size:14px;color:var(--text-2);line-height:1.8">' + esc(msg) + '</p>' +
    '<div class="modal-actions"><button class="btn btn-secondary" data-act="close-modal">取消</button>' +
    '<button class="btn btn-danger" data-act="confirm-del-ok">确定</button></div>');
}

/* ================= 视图：读书计划 ================= */
RENDERERS['zh-books'] = function () {
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  const st = q.get('st') || '';
  const db = getDB();
  const stMap = { want: '想读', reading: '在读', read: '已读', paused: '搁置' };
  const ord = { reading: 0, want: 1, paused: 2, read: 3 };
  let list = (db.books || []).slice();
  if (st) list = list.filter((b) => b.status === st);
  list.sort((a, b) => (ord[a.status] || 9) - (ord[b.status] || 9));

  let html = '';
  html += '<div class="card"><div class="card-header"><h2 class="card-title">读书计划</h2>' + helpBtn('help-zh-books') +
    '<button class="btn btn-sm btn-primary" data-act="add-book" style="margin-left:auto">' + I.plus + ' 添加书籍</button></div>' +
    '<div class="article-toolbar">' + ['', 'want', 'reading', 'read', 'paused'].map((s) =>
      '<button class="btn btn-sm ' + (st === s ? 'btn-primary' : 'btn-outline') + '" data-bst="' + s + '">' + (s === '' ? '全部' : stMap[s]) + '</button>').join('') +
    '</div></div>';

  if (!list.length) {
    html += '<div class="card">' + emptyState(I.book, st ? '该状态下没有书籍' : '还没有书', '制定你的阅读书单：想读、在读、已读、搁置，记录进度与笔记。',
      '<button class="btn btn-primary" data-act="add-book">添加第一本书</button>') + '</div>';
  } else {
    list.forEach((b) => {
      const covBg = b.status === 'reading' ? 'var(--accent)' : b.status === 'read' ? 'var(--green)' : 'var(--yellow)';
      html += '<div class="card" style="margin-bottom:12px">' +
        '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
        '<div class="book-cover" style="background:' + covBg + '">' + esc((b.title || '书').slice(0, 1)) + '</div>' +
        '<div style="flex:1;min-width:0"><div style="font-weight:700;font-size:15px">' + esc(b.title) + '</div>' +
        '<div style="font-size:12.5px;color:var(--text-2);margin-top:2px">' + esc(b.author || '') + ' · ' + chip(b.category || '未分类', 'gray') + ' ' +
        chip(stMap[b.status] || b.status, b.status === 'reading' ? 'blue' : b.status === 'read' ? 'green' : 'yellow') + '</div></div>' +
        '<div style="width:140px"><div class="progress-bar"><div class="pb-fill" style="width:' + Math.min(100, b.progress || 0) + '%"></div></div>' +
        '<div style="font-size:11.5px;color:var(--text-2);margin-top:3px;text-align:right">' + (b.progress || 0) + '%</div></div></div>' +
        (b.notes ? '<div style="font-size:13px;color:#3c3f43;margin-top:10px;padding:10px 12px;background:var(--bg);border-radius:var(--radius-sm)">' + esc(b.notes) + '</div>' : '') +
        '<div style="display:flex;gap:8px;margin-top:12px;align-items:center;flex-wrap:wrap">' +
        '<input type="range" min="0" max="100" step="5" value="' + (b.progress || 0) + '" style="flex:1;min-width:140px;accent-color:var(--accent)" data-act="book-progress" data-id="' + b.id + '">' +
        '<select class="select" style="width:auto" data-act="book-status" data-id="' + b.id + '">' +
        Object.keys(stMap).map((k) => '<option value="' + k + '"' + (b.status === k ? ' selected' : '') + '>' + stMap[k] + '</option>').join('') + '</select>' +
        '<button class="btn btn-sm btn-outline" data-act="edit-book" data-id="' + b.id + '">' + I.edit + ' 编辑</button>' +
        '<button class="btn btn-sm btn-outline" style="color:var(--danger)" data-act="del-book" data-id="' + b.id + '">' + I.trash + '</button></div></div>';
    });
  }
  return html;
};

function bookFormHtml(b) {
  b = b || {};
  const stMap = { want: '想读', reading: '在读', read: '已读', paused: '搁置' };
  return '<h2>' + (b.id ? '编辑书籍' : '添加书籍') + '</h2>' +
    '<div class="field"><label>书名 *</label><input class="input" id="f-bk-title" value="' + esc(b.title || '') + '" placeholder="如：红楼梦"></div>' +
    '<div class="field"><label>作者</label><input class="input" id="f-bk-author" value="' + esc(b.author || '') + '" placeholder="如：曹雪芹"></div>' +
    '<div class="field"><label>分类</label><input class="input" id="f-bk-cat" value="' + esc(b.category || '') + '" placeholder="如：小说 / 自我提升"></div>' +
    '<div class="field"><label>状态</label><select class="select" id="f-bk-status">' +
    Object.keys(stMap).map((k) => '<option value="' + k + '"' + (b.status === k ? ' selected' : '') + '>' + stMap[k] + '</option>').join('') + '</select></div>' +
    '<div class="field"><label>进度（%）</label><input class="input" id="f-bk-progress" type="number" min="0" max="100" value="' + (b.progress || 0) + '"></div>' +
    '<div class="field"><label>读书笔记</label><textarea class="textarea" id="f-bk-notes" style="min-height:60px" placeholder="记录你的想法…">' + esc(b.notes || '') + '</textarea></div>' +
    '<div class="modal-actions"><button class="btn btn-secondary" data-act="close-modal">取消</button>' +
    '<button class="btn btn-primary" data-act="save-book" data-id="' + (b.id || '') + '">保存</button></div>';
}

/* ================= 视图：创作板块 ================= */
RENDERERS['zh-creations'] = function () {
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  const tab = q.get('tab') || 'works';
  const db = getDB();
  const stMap = { draft: '草稿', revising: '修改中', done: '已完成' };

  let html = '';
  html += '<div class="card"><div class="card-header"><h2 class="card-title">创作板块</h2>' + helpBtn('help-zh-creations') +
    '<button class="btn btn-sm btn-primary" data-act="' + (tab === 'insp' ? 'add-inspiration' : 'add-creation') + '" style="margin-left:auto">' + I.plus + ' ' + (tab === 'insp' ? '记灵感' : '写新作') + '</button></div>' +
    '<div class="article-toolbar">' +
    '<button class="btn btn-sm ' + (tab === 'works' ? 'btn-primary' : 'btn-outline') + '" data-ctab="works">作品</button>' +
    '<button class="btn btn-sm ' + (tab === 'insp' ? 'btn-primary' : 'btn-outline') + '" data-ctab="insp">灵感（' + (db.inspirations || []).length + '）</button></div></div>';

  if (tab === 'insp') {
    const ins = (db.inspirations || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    html += '<div class="card">';
    if (!ins.length) {
      html += emptyState(I.spark, '还没有灵感', '一句话灵感也可以成为作品的种子。点右上角"记灵感"，或把收集箱的中文短句归入灵感。');
    } else {
      ins.forEach((x) => {
        html += '<div class="inbox-item"><div class="ii-content"><div>' + esc(x.text) + '</div>' +
          '<div class="ii-meta"><span style="font-size:12px;color:var(--text-2)">' + x.date + '</span></div></div>' +
          '<div class="ii-actions"><button class="btn btn-sm btn-primary" data-act="insp-to-work" data-id="' + x.id + '">转为作品</button>' +
          '<button class="btn btn-sm btn-outline" style="color:var(--danger)" data-act="del-inspiration" data-id="' + x.id + '">' + I.trash + '</button></div></div>';
      });
    }
    html += '</div>';
  } else {
    const works = (db.creations || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    if (!works.length) {
      html += '<div class="card">' + emptyState(I.pen, '还没有作品', '开始你的第一篇创作，或从灵感一键转为作品。',
        '<button class="btn btn-primary" data-act="add-creation">开始创作</button>') + '</div>';
    } else {
      works.forEach((c) => {
        html += '<div class="card" style="margin-bottom:12px"><div class="card-header"><h3 style="font-size:15.5px;font-weight:700">' + esc(c.title) + '</h3>' +
          chip(c.category || '未分类', 'gray') + ' ' + chip(stMap[c.status] || c.status, c.status === 'done' ? 'green' : c.status === 'revising' ? 'yellow' : 'blue') + '</div>' +
          '<div class="cc-preview">' + esc((c.content || '').slice(0, 140)) + ((c.content || '').length > 140 ? '…' : '') + '</div>' +
          '<div style="display:flex;gap:8px;margin-top:12px;align-items:center;flex-wrap:wrap">' +
          '<select class="select" style="width:auto" data-act="creation-status" data-id="' + c.id + '">' +
          Object.keys(stMap).map((k) => '<option value="' + k + '"' + (c.status === k ? ' selected' : '') + '>' + stMap[k] + '</option>').join('') + '</select>' +
          '<button class="btn btn-sm btn-outline" data-act="edit-creation" data-id="' + c.id + '">' + I.edit + ' 编辑</button>' +
          '<button class="btn btn-sm btn-outline" style="color:var(--danger)" data-act="del-creation" data-id="' + c.id + '">' + I.trash + '</button>' +
          '<span style="margin-left:auto;font-size:12px;color:var(--text-2)">' + c.date + '</span></div></div>';
      });
    }
  }
  return html;
};

function creationFormHtml(c) {
  c = c || {};
  const cats = ['散文', '诗歌', '故事', '随笔', '小说', '其他'];
  const stMap = { draft: '草稿', revising: '修改中', done: '已完成' };
  return '<h2>' + (c.id ? '编辑作品' : '新作品') + '</h2>' +
    '<div class="field"><label>标题 *</label><input class="input" id="f-cr-title" value="' + esc(c.title || '') + '" placeholder="如：晨光里的湖"></div>' +
    '<div class="field"><label>分类</label><select class="select" id="f-cr-cat">' +
    cats.map((k) => '<option value="' + k + '"' + ((c.category || '随笔') === k ? ' selected' : '') + '>' + k + '</option>').join('') + '</select></div>' +
    '<div class="field"><label>状态</label><select class="select" id="f-cr-status">' +
    Object.keys(stMap).map((k) => '<option value="' + k + '"' + (c.status === k ? ' selected' : '') + '>' + stMap[k] + '</option>').join('') + '</select></div>' +
    '<div class="field"><label>正文</label><textarea class="textarea" id="f-cr-content" style="min-height:160px" placeholder="开始写作…">' + esc(c.content || '') + '</textarea></div>' +
    '<div class="modal-actions"><button class="btn btn-secondary" data-act="close-modal">取消</button>' +
    '<button class="btn btn-primary" data-act="save-creation" data-id="' + (c.id || '') + '">保存</button></div>';
}

/* ================= 视图：收集箱 ================= */
RENDERERS['inbox'] = function () {
  const db = getDB();
  const pending = (db.inbox || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const langTxt = { en: '英文', zh: '中文', '': '待分类' };
  let html = '';
  html += '<div class="card"><div class="card-header"><h2 class="card-title">快速收集</h2>' + helpBtn('help-inbox') + '</div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap"><div class="search-wrap grow"><span class="search-icon">' + I.plus + '</span>' +
    '<input class="input" id="inbox-input" placeholder="粘贴单词、句子、灵感、文章…自动识别中英文"></div>' +
    '<button class="btn btn-primary" data-act="inbox-add">收入</button></div>' +
    '<div style="font-size:12.5px;color:var(--text-2);margin-top:8px">英文内容自动建议归入英语板块，中文内容归入中文板块；不确定时可在归类时手动选择。</div></div>';

  html += '<div class="card"><div class="card-header"><h2 class="card-title">待归类</h2>' + helpBtn('help-inbox') + '</div>';
  if (!pending.length) {
    html += emptyState(I.inbox, '收集箱是空的', '新的内容会先收在这里，归类确认后才进入对应模块。');
  } else {
    pending.forEach((it) => {
      html += '<div class="inbox-item"><div class="ii-content"><div>' + esc(it.content) + '</div>' +
        '<div class="ii-meta">' + chip(langTxt[it.lang] || '待分类', 'gray') +
        '<span style="font-size:12px;color:var(--text-2)">' + it.date + ' ' + (it.time || '') + '</span></div>' +
        (it.lang ? '<div class="ii-suggest">建议：' + (it.lang === 'en' ? '英语板块' : '中文板块') + '</div>' : '<div class="ii-suggest">混合内容，请手动选择</div>') + '</div>' +
        '<div class="ii-actions"><button class="btn btn-sm btn-primary" data-act="cls-open" data-id="' + it.id + '">归类</button>' +
        '<button class="btn btn-sm btn-outline" style="color:var(--danger)" data-act="inbox-del" data-id="' + it.id + '">' + I.trash + '</button></div></div>';
    });
  }
  html += '</div>';
  return html;
};

/* ================= 视图：全局搜索 ================= */
RENDERERS['search'] = function (params) {
  const kw = (params.get('kw') || '').trim();
  let html = '';
  html += '<div class="card"><div class="card-header"><h2 class="card-title">全局搜索</h2>' + helpBtn('help-search') + '</div>' +
    '<div class="search-wrap"><span class="search-icon">' + I.search + '</span>' +
    '<input class="input" id="sr-input" placeholder="搜索单词、文章、摘抄、书籍、创作…" value="' + esc(kw) + '"></div>' +
    '<div style="font-size:12.5px;color:var(--text-2);margin-top:8px">支持：单词（中英文）、文章、佳句、书籍、创作、灵感、收集箱、场景英语、对话</div></div>';

  if (!kw) {
    html += '<div class="card">' + emptyState(I.search, '输入关键词开始搜索', '跨模块搜索，结果按模块分组，点击可跳转。') + '</div>';
    return html;
  }

  const db = getDB();
  const q = kw.toLowerCase();
  const groups = [];
  function add(title, view, items) { if (items.length) groups.push({ title: title, view: view, items: items }); }

  add('单词本', 'en-words', (db.words || []).filter((w) =>
    (w.word || '').toLowerCase().includes(q) || (w.meaning || '').toLowerCase().includes(q) || (w.example || '').toLowerCase().includes(q))
    .slice(0, 8).map((w) => ({ t: w.word, s: w.meaning, p: { kw: kw } })));

  add('英文阅读', 'en-reading', (db.articles || []).filter((a) =>
    (a.title || '').toLowerCase().includes(q) || (a.content || '').toLowerCase().includes(q))
    .slice(0, 5).map((a) => ({ t: a.title, s: a.source || '', p: { id: a.id } })));

  add('佳句摘抄', 'zh-quotes', (db.quotes || []).filter((x) =>
    (x.text || '').toLowerCase().includes(q) || (x.source || '').toLowerCase().includes(q))
    .slice(0, 5).map((x) => ({ t: (x.text || '').length > 40 ? x.text.slice(0, 40) + '…' : x.text, s: x.source || '', p: {} })));

  add('读书计划', 'zh-books', (db.books || []).filter((b) =>
    (b.title || '').toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q) || (b.notes || '').toLowerCase().includes(q))
    .slice(0, 5).map((b) => ({ t: b.title, s: b.author || '', p: {} })));

  add('创作板块', 'zh-creations', (db.creations || []).filter((c) =>
    (c.title || '').toLowerCase().includes(q) || (c.content || '').toLowerCase().includes(q))
    .slice(0, 5).map((c) => ({ t: c.title, s: c.category || '', p: {} })));

  add('创作灵感', 'zh-creations', (db.inspirations || []).filter((x) => (x.text || '').toLowerCase().includes(q))
    .slice(0, 5).map((x) => ({ t: (x.text || '').length > 40 ? x.text.slice(0, 40) + '…' : x.text, s: x.date || '', p: {} })));

  add('收集箱', 'inbox', (db.inbox || []).filter((x) => (x.content || '').toLowerCase().includes(q))
    .slice(0, 5).map((x) => ({ t: (x.content || '').length > 40 ? x.content.slice(0, 40) + '…' : x.content, s: x.date || '', p: {} })));

  const sc = [];
  window.SAMPLE_DATA.scenarios.forEach((s) => {
    (s.phrases || []).forEach((p) => {
      if ((p.en || '').toLowerCase().includes(q) || (p.cn || '').includes(q)) sc.push({ t: p.en + ' / ' + p.cn, s: s.name, p: { id: s.id } });
    });
  });
  add('场景英语', 'en-scenarios', sc.slice(0, 5));

  const dg = [];
  window.SAMPLE_DATA.dialogues.forEach((d) => {
    (d.lines || []).forEach((l) => {
      if ((l.en || '').toLowerCase().includes(q) || (l.cn || '').includes(q)) dg.push({ t: l.en + ' / ' + l.cn, s: d.name, p: { dg: d.id } });
    });
  });
  add('对话练习', 'en-dialogues', dg.slice(0, 5));

  if (!groups.length) {
    html += '<div class="card">' + emptyState(I.search, '没有找到相关内容', '换个关键词试试，例如单词、书名或句子。') + '</div>';
  } else {
    html += '<div class="card search-results">';
    groups.forEach((g) => {
      html += '<div class="sr-group"><div class="sr-group-title">' + g.title + '</div>';
      g.items.forEach((it) => {
        html += '<div class="sr-item" data-go="' + g.view + '"' +
          (it.p && it.p.id ? ' data-id="' + esc(it.p.id) + '"' : '') +
          (it.p && it.p.sec ? ' data-sec="' + esc(it.p.sec) + '"' : '') +
          (it.p && it.p.dg ? ' data-dg="' + esc(it.p.dg) + '"' : '') + '>' +
          '<div class="sr-title">' + esc(it.t) + '</div><div class="sr-sub">' + esc(it.s || '') + '</div></div>';
      });
      html += '</div>';
    });
    html += '</div>';
  }
  return html;
};

/* ================= 视图：AI 帮手 ================= */
RENDERERS['ai'] = function () {
  const db = getDB();
  const cfg = db.settings || {};
  const configured = !!(cfg.aiKey && cfg.aiBaseUrl);
  const pending = (db.inbox || []).filter((x) => x.status === 'pending');
  let html = '';

  html += '<div class="card"><div class="card-header"><h2 class="card-title">AI 帮手</h2>' + helpBtn('help-ai') + '</div>' +
    '<div class="ai-status-bar ' + (configured ? 'on' : 'off') + '"><span class="dot"></span>' +
    (configured ? 'AI 已配置：可对话补充知识、辅助安排' : 'AI 未配置：整理资料用内置规则可用，补充知识/安排任务需配置接口') +
    (configured ? '' : '<button class="btn btn-sm btn-secondary" style="margin-left:auto" data-go="settings">去配置</button>') + '</div>' +
    '<div class="grid grid-3" style="margin-top:16px">' +
    '<div class="ai-card"><div class="ai-ico">' + I.inbox + '</div><div class="sc-name">整理资料</div><div style="font-size:12.5px;color:var(--text-2);margin-top:6px">分析收集箱内容，建议归类去向（内置规则，无需 AI）</div></div>' +
    '<div class="ai-card"><div class="ai-ico">' + I.spark + '</div><div class="sc-name">补充知识</div><div style="font-size:12.5px;color:var(--text-2);margin-top:6px">为单词、概念补充释义与背景知识（需配置 AI）</div></div>' +
    '<div class="ai-card"><div class="ai-ico">' + I.calendar + '</div><div class="sc-name">安排任务</div><div style="font-size:12.5px;color:var(--text-2);margin-top:6px">根据你的数据生成学习计划（v1 使用内置规则）</div></div>' +
    '</div></div>';

  html += '<div class="card"><div class="card-header"><h2 class="card-title">整理资料（收集箱分析）</h2>' + helpBtn('help-ai') + '</div>';
  if (!pending.length) {
    html += '<p style="font-size:13px;color:var(--text-2)">收集箱没有待整理内容。</p>';
  } else {
    html += '<p style="font-size:13px;color:var(--text-2);margin-bottom:12px">以下为内置规则建议，点击"应用"将内容归入对应模块；最终由你确认。</p>';
    pending.forEach((it) => {
      const sug = suggestFor(it);
      html += '<div class="inbox-item"><div class="ii-content"><div>' + esc(it.content) + '</div>' +
        '<div class="ii-meta"><span style="font-size:12px;color:var(--text-2)">' + it.date + '</span>' +
        '<span class="ii-suggest">' + sug.txt + '</span></div></div>' +
        '<div class="ii-actions"><button class="btn btn-sm btn-primary" data-act="ai-apply" data-id="' + it.id + '">应用</button>' +
        '<button class="btn btn-sm btn-outline" data-act="cls-open" data-id="' + it.id + '">手动归类</button></div></div>';
    });
    html += '<div style="margin-top:12px"><button class="btn btn-sm btn-outline" data-act="ai-apply-all">应用全部建议</button></div>';
  }
  html += '</div>';

  html += '<div class="card"><div class="card-header"><h2 class="card-title">补充知识 / 自由提问</h2>' + helpBtn('help-ai') + '</div>';
  if (configured) {
    html += '<div class="chat-box" id="ai-chat">' +
      '<div class="chat-msg ai">你好，我是你的学习助手。可以问我单词释义、背景知识、学习计划建议，或让我整理一段资料。</div></div>' +
      '<div class="chat-input-row"><input class="input" id="ai-chat-input" placeholder="输入问题，如：解释 procrastination 的用法">' +
      '<button class="btn btn-primary" data-act="ai-send">发送</button></div>';
  } else {
    html += '<ul style="font-size:13.5px;color:var(--text-2);padding-left:20px;line-height:1.9">' +
      '<li>在"设置与数据 - AI 配置"填写接口地址（兼容 OpenAI）与 API Key</li>' +
      '<li>配置后可：为单词补充释义与例句、解释概念、给出学习建议</li>' +
      '<li>未配置时不会假装回复；"整理资料"仍可用内置规则</li></ul>';
  }
  html += '</div>';
  return html;
};

/* ================= 视图：设置与数据 ================= */
RENDERERS['settings'] = function () {
  const db = getDB();
  const cfg = db.settings || {};
  const configured = !!(cfg.aiKey && cfg.aiBaseUrl);
  const stats = [
    ['单词本', (db.words || []).length, 'en-words'],
    ['文章', (db.articles || []).length, 'en-reading'],
    ['录音', (db.recordings || []).length, 'en-listening'],
    ['摘抄', (db.quotes || []).length, 'zh-quotes'],
    ['书籍', (db.books || []).length, 'zh-books'],
    ['作品', (db.creations || []).length, 'zh-creations'],
    ['灵感', (db.inspirations || []).length, 'zh-creations'],
    ['待归类', (db.inbox || []).filter((x) => x.status === 'pending').length, 'inbox']
  ];
  let html = '';

  html += '<div class="card"><div class="card-header"><h2 class="card-title">使用说明</h2>' + helpBtn('help-settings') + '</div>' +
    '<div class="usage-section">' +
    '<h3>这是什么</h3><p>个人 AI 学习工作台：英文（单词、阅读、听说、场景、对话、计划）与中文（摘抄、读书、创作）双板块，收集箱统一入口，搜索贯穿所有模块。纯前端应用，数据保存在当前浏览器本地。</p>' +
    '<h3>日常怎么用</h3><ul>' +
    '<li>遇到想记的内容 → 手机底部"收集"或侧边栏"收集箱" → 归类确认</li>' +
    '<li>每天打开"今日" → 完成生成的任务与复习</li>' +
    '<li>英语：单词本记录生词（首字母/中文反查）、阅读划线标注背诵、听说录音、场景对话</li>' +
    '<li>中文：摘抄词句、制定读书计划、创作板块记录灵感与作品</li></ul>' +
    '<h3>数据与隐私</h3><p>所有数据（含录音音频）只存在本机浏览器，不上传任何服务器。请定期在下方"数据备份"导出 JSON，防止误清浏览器数据造成丢失。</p>' +
    '<h3>AI 功能说明</h3><p>AI 帮手为可选功能：在下方配置兼容 OpenAI 的接口后启用对话能力。未配置时，整理资料使用内置规则，其余功能显示说明，不会伪造回复。</p></div></div>';

  html += '<div class="card"><div class="card-header"><h2 class="card-title">工作台</h2>' + helpBtn('help-settings') + '</div>' +
    '<div class="field" style="margin-top:4px"><label>工作台名称</label><input class="input" id="f-wb-title" maxlength="30" value="' + esc(cfg.title || '学习工作台') + '" placeholder="如：我的学习工作台"></div>' +
    '<div class="modal-actions" style="justify-content:flex-start;margin-top:0"><button class="btn btn-primary" data-act="save-wb-title">保存名称</button></div>' +
    '<p style="font-size:12px;color:var(--text-2);margin-top:10px">名称显示在工作台顶端的品牌区（桌面侧边栏顶部 / 手机侧边抽屉顶部）与浏览器标签页，修改后立即生效。</p></div>';

  html += '<div class="card"><div class="card-header"><h2 class="card-title">AI 配置</h2>' + helpBtn('help-ai') + '</div>' +
    '<div class="ai-status-bar ' + (configured ? 'on' : 'off') + '"><span class="dot"></span>' + (configured ? '已配置 · 对话与补充知识可用' : '未配置 · 整理资料仍可用') + '</div>' +
    '<div class="field" style="margin-top:14px"><label>接口地址（Base URL）</label><input class="input" id="f-ai-url" value="' + esc(cfg.aiBaseUrl || '') + '" placeholder="如：https://api.openai.com/v1"></div>' +
    '<div class="field"><label>API Key</label><input class="input" id="f-ai-key" type="password" value="' + esc(cfg.aiKey || '') + '" placeholder="sk-..."></div>' +
    '<div class="field"><label>模型名称</label><input class="input" id="f-ai-model" value="' + esc(cfg.aiModel || 'gpt-4o-mini') + '" placeholder="如：gpt-4o-mini / deepseek-chat"></div>' +
    '<div class="field"><label>每日单词目标</label><input class="input" id="f-ai-goal" type="number" min="1" max="50" value="' + (cfg.dailyWordGoal || 10) + '"></div>' +
    '<div class="modal-actions" style="justify-content:flex-start;margin-top:0"><button class="btn btn-primary" data-act="save-ai-config">保存配置</button></div>' +
    '<p style="font-size:12px;color:var(--text-2);margin-top:10px">API Key 仅保存在本机浏览器（localStorage），不会上传到本应用之外的任何地方。</p></div>';

  html += '<div class="card"><div class="card-header"><h2 class="card-title">数据概况</h2>' + helpBtn('help-settings') + '</div>' +
    '<table class="data-table"><tbody>' + stats.map((s) =>
      '<tr><td>' + s[0] + '</td><td style="text-align:right;font-weight:600">' + s[1] + '</td>' +
      '<td style="text-align:right;width:70px"><button class="btn btn-sm btn-outline" data-go="' + s[2] + '">查看</button></td></tr>').join('') +
    '</tbody></table></div>';

  html += '<div class="card"><div class="card-header"><h2 class="card-title">数据备份与恢复</h2>' + helpBtn('help-settings') + '</div>' +
    '<div class="setting-row"><div class="sr-main"><div class="sr-title">导出备份</div><div class="sr-desc">下载 JSON 文件，包含全部文字数据（不含录音音频本体）。</div></div>' +
    '<button class="btn btn-sm btn-primary" data-act="export-data">' + I.download + ' 导出</button></div>' +
    '<div class="setting-row"><div class="sr-main"><div class="sr-title">导入恢复</div><div class="sr-desc">从备份 JSON 恢复数据（将覆盖当前数据）。</div></div>' +
    '<button class="btn btn-sm btn-outline" data-act="import-data">' + I.upload + ' 导入</button></div>' +
    '<div class="setting-row"><div class="sr-main"><div class="sr-title">重置工作台</div><div class="sr-desc">清空所有数据并恢复内置示例。</div></div>' +
    '<button class="btn btn-sm btn-outline" style="color:var(--danger)" data-act="reset-data">' + I.refresh + ' 重置</button></div>' +
    '<input type="file" id="import-file" accept=".json,application/json" hidden></div>';

  html += '<div class="card"><div class="card-header"><h2 class="card-title">更新日志</h2>' + helpBtn('help-settings') + '</div>' +
    '<div class="log-item"><div class="lg-date">v1.0 · 2026-08-25</div><div class="lg-title">首个版本</div>' +
    '<div class="lg-desc">搭建六大能力：今日 / 英语学习（单词本 · 英文阅读 · 听说训练 · 场景英语 · 对话练习 · 学习计划）/ 中文学习（佳句摘抄 · 读书计划 · 创作板块）/ 收集箱 / 搜索 / AI 帮手（界面预留）/ 设置与数据。三端响应式。</div></div></div>';
  return html;
};

/* ================= 表单保存逻辑 ================= */
function inputVal(id, fallback) {
  const el = $('#' + id);
  return el ? (el.value || '').trim() : fallback;
}

function saveWordForm(id) {
  const db = getDB();
  const word = ($('#f-word').value || '').trim();
  const meaning = ($('#f-meaning').value || '').trim();
  if (!word || !meaning) { toast('单词与中文释义必填'); return; }
  const phonetic = inputVal('f-phonetic', '');
  const pos = inputVal('f-pos', '');
  const example = inputVal('f-example', '');
  if (id) {
    const w = (db.words || []).find((x) => x.id === id);
    if (w) {
      w.word = word; w.phonetic = phonetic;
      if ($('#f-pos')) w.pos = pos;
      w.meaning = meaning;
      if ($('#f-example')) w.example = example;
    }
  } else {
    db.words = db.words || [];
    db.words.push({ id: uid(), word: word, phonetic: phonetic, pos: pos, meaning: meaning, example: example, date: todayStr(), status: 'new', source: '手动' });
  }
  saveDB(); closeModal(); toast('单词已保存'); route();
}

function saveQuoteForm(id) {
  const db = getDB();
  const text = ($('#f-qt-text').value || '').trim();
  if (!text) { toast('句子内容必填'); return; }
  const tags = ($('#f-qt-tags').value || '').split(/[,，]/).map((t) => t.trim()).filter(Boolean);
  const data = { text: text, source: $('#f-qt-source').value.trim(), tags: tags, feeling: $('#f-qt-feeling').value.trim(), language: $('#f-qt-lang').value };
  if (id) {
    const qt = (db.quotes || []).find((x) => x.id === id);
    if (qt) Object.assign(qt, data);
  } else {
    db.quotes = db.quotes || [];
    db.quotes.push(Object.assign({ id: uid(), date: todayStr() }, data));
  }
  saveDB(); closeModal(); toast('摘抄已保存'); route();
}

function openArticleForm() {
  openModal('<h2>添加文章</h2>' +
    '<div class="field"><label>标题 *</label><input class="input" id="f-ar-title" placeholder="文章标题"></div>' +
    '<div class="field"><label>来源</label><input class="input" id="f-ar-source" placeholder="如：某杂志 / 自己粘贴"></div>' +
    '<div class="field"><label>难度</label><select class="select" id="f-ar-level"><option>初阶</option><option selected>中阶</option><option>中高阶</option><option>高阶</option></select></div>' +
    '<div class="field"><label>分类</label><input class="input" id="f-ar-cat" placeholder="如：自我提升 / 记叙短文"></div>' +
    '<div class="field"><label>正文 *</label><textarea class="textarea" id="f-ar-content" style="min-height:200px" placeholder="粘贴文章内容…"></textarea></div>' +
    '<div class="modal-actions"><button class="btn btn-secondary" data-act="close-modal">取消</button>' +
    '<button class="btn btn-primary" data-act="save-article">保存</button></div>');
}

function openSentenceForm(artId, sentId) {
  const a = (getDB().articles || []).find((x) => x.id === artId);
  if (!a) return;
  const s = sentId ? (a.longSentences || []).find((x) => x.id === sentId) : null;
  openModal('<h2>' + (s ? '编辑长难句解析' : '添加长难句') + '</h2>' +
    '<div class="field"><label>原句 *</label><textarea class="textarea" id="f-sent" style="min-height:80px">' + esc(s ? s.sentence : '') + '</textarea></div>' +
    '<div class="field"><label>翻译 / 语法拆解</label><textarea class="textarea" id="f-sent-an" style="min-height:100px" placeholder="句子结构、生词、翻译…">' + esc(s ? s.analysis : '') + '</textarea></div>' +
    '<div class="modal-actions"><button class="btn btn-secondary" data-act="close-modal">取消</button>' +
    '<button class="btn btn-primary" data-act="save-sentence" data-art="' + artId + '" data-id="' + (sentId || '') + '">保存</button></div>');
}

function openTaskForm(kind) {
  openModal('<h2>添加任务</h2>' +
    '<div class="field"><label>任务内容 *</label><input class="input" id="f-task-title" placeholder="如：精读一篇文章"></div>' +
    '<div class="field"><label>所属模块</label><select class="select" id="f-task-module">' +
    ['单词本', '英文阅读', '听说训练', '场景英语', '对话练习', '学习计划', '佳句摘抄', '读书计划', '创作板块', '收集箱', '其他'].map((m) =>
      '<option>' + m + '</option>').join('') + '</select></div>' +
    '<div class="field"><label>日期</label><input class="input" id="f-task-date" type="date" value="' + todayStr() + '"></div>' +
    '<div class="field"><label>类型</label><select class="select" id="f-task-kind"><option value="daily"' + (kind !== 'weekly' ? ' selected' : '') + '>每日任务</option><option value="weekly"' + (kind === 'weekly' ? ' selected' : '') + '>每周任务</option></select></div>' +
    '<div class="modal-actions"><button class="btn btn-secondary" data-act="close-modal">取消</button>' +
    '<button class="btn btn-primary" data-act="save-task">保存</button></div>');
}

function toggleArtStatus(id) {
  const db = getDB();
  const a = (db.articles || []).find((x) => x.id === id);
  if (!a) return;
  a.status = a.status === 'unread' ? 'reading' : a.status === 'reading' ? 'read' : 'unread';
  saveDB(); route();
}
function toggleArtRecite(id) {
  const db = getDB();
  const a = (db.articles || []).find((x) => x.id === id);
  if (!a) return;
  if (a.recite && a.recite.active) { a.recite.active = false; toast('已取消背诵'); }
  else { a.recite = a.recite || {}; a.recite.active = true; toast('已加入背诵计划'); }
  saveDB(); route();
}

function reciteCheck(artId) {
  const a = (getDB().articles || []).find((x) => x.id === artId);
  if (!a) return;
  const input = $('#recite-input');
  const out = $('#recite-result');
  if (!input || !out) return;
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff\s]/g, '').replace(/\s+/g, ' ').trim();
  const mine = norm(input.value), orig = norm(a.content);
  const mineWords = mine ? mine.split(' ') : [];
  const origWords = orig ? orig.split(' ') : [];
  let hit = 0;
  mineWords.forEach((w) => { if (origWords.includes(w)) hit++; });
  const pct = origWords.length ? Math.round(hit / origWords.length * 100) : 0;
  if (mine === orig || pct >= 98) {
    out.style.display = 'block';
    out.innerHTML = '<div style="color:var(--accent);font-weight:700;margin-bottom:8px">完全正确！背写通过。</div>' +
      '<div style="color:var(--text-2)">继续保持，明天再复习一遍效果更好。</div>';
    if (a.recite) { a.recite.count = (a.recite.count || 0) + 1; a.recite.lastDate = todayStr(); }
    saveDB();
  } else {
    out.style.display = 'block';
    out.innerHTML = '<div style="font-weight:700;margin-bottom:8px">背写完成度 ' + pct + '%（词级匹配）。</div>' +
      '<div style="color:var(--text-2);margin-bottom:8px">对照原文，找出遗漏或错误的地方，再试一次。</div>' +
      '<div class="recite-compare">' + esc(a.content) + '</div>';
  }
}

function delAnnot(artId, annotId) {
  const db = getDB();
  const a = (db.articles || []).find((x) => x.id === artId);
  if (!a) return;
  a.annotations = (a.annotations || []).filter((x) => x.id !== annotId);
  saveDB(); closeModal(); toast('已删除标注'); route();
}

function doAnnotAction(type) {
  if (!SEL || !SEL.artId) { toast('请先在正文中选中文字'); return; }
  if (type === 'comment') {
    openModal('<h2>添加标注</h2>' +
      '<div style="padding:10px 12px;background:var(--bg);border-radius:var(--radius-sm);font-size:14px;line-height:1.7;margin-bottom:12px">' + esc(SEL.sel.text) + '</div>' +
      '<div class="field"><label>批注</label><textarea class="textarea" id="f-comment" style="min-height:80px" placeholder="写下你的想法…"></textarea></div>' +
      '<div class="modal-actions"><button class="btn btn-secondary" data-act="close-modal">取消</button>' +
      '<button class="btn btn-primary" data-act="comment-save">保存</button></div>');
  } else {
    WB.addAnnotation(SEL.artId, type, SEL.sel);
  }
  hideSelBar();
}
function saveComment() {
  const text = $('#f-comment').value.trim();
  if (!SEL) { closeModal(); return; }
  WB.addAnnotation(SEL.artId, 'comment', SEL.sel, text);
  closeModal();
}

function viewAnnot(artId, annotId) {
  const a = (getDB().articles || []).find((x) => x.id === artId);
  if (!a) return;
  const an = (a.annotations || []).find((x) => x.id === annotId);
  if (!an) return;
  const typeName = an.type === 'highlight' ? '划线' : an.type === 'quote' ? '摘抄' : an.type === 'sentence' ? '长难句' : '标注';
  openModal('<h2>' + typeName + '</h2>' +
    '<div style="padding:10px 12px;background:var(--bg);border-radius:var(--radius-sm);font-size:14px;line-height:1.7;margin-bottom:12px">' + esc(an.text) + '</div>' +
    (an.comment ? '<div style="font-size:13.5px;color:var(--text-2);margin-bottom:12px;white-space:pre-wrap">' + esc(an.comment) + '</div>' : '') +
    '<div class="modal-actions"><button class="btn btn-secondary" data-act="close-modal">关闭</button>' +
    '<button class="btn btn-danger" data-act="del-annot" data-id="' + an.id + '" data-art="' + artId + '">删除</button></div>');
}

function speakText(txt) {
  if (!('speechSynthesis' in window)) { toast('当前浏览器不支持语音朗读'); return; }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = 'en-US'; u.rate = 0.9;
    window.speechSynthesis.speak(u);
  } catch (e) { toast('朗读失败'); }
}

/* ================= AI 对话 ================= */
function aiSend() {
  const db = getDB();
  const cfg = db.settings || {};
  if (!(cfg.aiKey && cfg.aiBaseUrl)) { toast('请先在设置中配置 AI 接口'); return; }
  const input = $('#ai-chat-input');
  const box = $('#ai-chat');
  if (!input || !box) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  box.insertAdjacentHTML('beforeend', '<div class="chat-msg me">' + esc(text) + '</div>');
  const typing = document.createElement('div');
  typing.className = 'chat-msg ai';
  typing.textContent = '思考中…';
  box.appendChild(typing);
  box.scrollTop = box.scrollHeight;
  const url = (cfg.aiBaseUrl || '').replace(/\/+$/, '') + '/chat/completions';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.aiKey },
    body: JSON.stringify({
      model: cfg.aiModel || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '你是一个耐心的个人学习助手，帮助用户学习英语和中文：解释单词、补充知识、安排学习计划。回答简洁清晰，中文为主，适当使用中英对照。' },
        { role: 'user', content: text }
      ]
    })
  }).then((r) => r.json()).then((data) => {
    typing.remove();
    const reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!reply) throw new Error(data && data.error ? data.error.message : '无返回内容');
    box.insertAdjacentHTML('beforeend', '<div class="chat-msg ai">' + esc(reply) + '</div>');
    box.scrollTop = box.scrollHeight;
  }).catch((err) => {
    typing.remove();
    box.insertAdjacentHTML('beforeend', '<div class="chat-msg ai" style="color:var(--danger)">请求失败：' + esc(err.message || '网络错误') + '。请检查设置中的接口地址与 Key。</div>');
    box.scrollTop = box.scrollHeight;
  });
}

/* ================= 设置：导出 / 导入 / 重置 ================= */
function exportData() {
  const data = { app: 'personal-workbench', version: 1, exportedAt: todayStr() + ' ' + timeHM(), db: getDB() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'workbench-backup-' + todayStr().replace(/-/g, '') + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  toast('已导出备份');
}

function doImport(fileInput) {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const data = parsed && parsed.app === 'personal-workbench' && parsed.db ? parsed.db : parsed;
      if (!data || !data.version) throw new Error('不是有效的工作台备份');
      WB.setDB(data);
      WB.saveDB();
      toast('导入成功');
      route();
    } catch (e) {
      toast('导入失败：' + (e.message || '文件格式不正确'));
    }
    fileInput.value = '';
  };
  reader.readAsText(file);
}

function saveAIConfig() {
  const db = getDB();
  db.settings = db.settings || {};
  db.settings.aiBaseUrl = ($('#f-ai-url').value || '').trim();
  db.settings.aiKey = ($('#f-ai-key').value || '').trim();
  db.settings.aiModel = ($('#f-ai-model').value || '').trim() || 'gpt-4o-mini';
  const g = parseInt($('#f-ai-goal').value, 10);
  db.settings.dailyWordGoal = (g >= 1 && g <= 50) ? g : 10;
  saveDB();
  toast('配置已保存');
  route();
}

/* ================= 工作台名称 ================= */
function applyWbTitle() {
  const t = (((getDB().settings || {}).title || '').trim()) || '学习工作台';
  const bn = document.querySelector('.brand-name');
  if (bn) bn.textContent = t;
  document.title = t;
}

function saveWbTitle() {
  const v = ($('#f-wb-title').value || '').trim();
  if (!v) { toast('名称不能为空'); return; }
  if (v.length > 30) { toast('名称最多 30 字'); return; }
  const db = getDB();
  db.settings = db.settings || {};
  db.settings.title = v;
  saveDB();
  applyWbTitle();
  toast('工作台名称已更新');
}

function editTodayTitle() {
  const s = getDB().settings || {};
  openModal('<h2>自定义今日标题</h2>' +
    '<div class="field"><label>标题</label><input class="input" id="f-today-title" value="' + esc(s.todayTitle || '') + '" placeholder="今日"></div>' +
    '<div class="field"><label>副标题</label><input class="input" id="f-today-subtitle" value="' + esc(s.todaySubtitle || '') + '" placeholder="今天要做什么，都在这里"></div>' +
    '<p style="font-size:12px;color:var(--text-2);margin-top:8px">留空则恢复默认值。</p>' +
    '<div class="modal-actions"><button class="btn btn-secondary" data-act="close-modal">取消</button>' +
    '<button class="btn btn-primary" data-act="save-today-title">保存</button></div>');
}

function saveTodayTitle() {
  const db = getDB();
  db.settings = db.settings || {};
  const title = ($('#f-today-title').value || '').trim();
  const subtitle = ($('#f-today-subtitle').value || '').trim();
  if (title) db.settings.todayTitle = title; else delete db.settings.todayTitle;
  if (subtitle) db.settings.todaySubtitle = subtitle; else delete db.settings.todaySubtitle;
  saveDB(); closeModal(); toast('标题已更新'); route();
}

/* ================= 文章选择操作条 ================= */
let SEL = null;
const selBar = () => $('#sel-bar');
function showSelBar(x, y) {
  const bar = selBar();
  bar.hidden = false;
  const pad = 8;
  let left = Math.max(pad, Math.min(x, window.innerWidth - bar.offsetWidth - pad));
  let top = y + 12;
  if (top + bar.offsetHeight > window.innerHeight) top = y - bar.offsetHeight - 12;
  bar.style.left = left + 'px';
  bar.style.top = top + 'px';
}
function hideSelBar() {
  if (selBar()) selBar().hidden = true;
}

/* ================= 手机端"更多"抽屉 ================= */
function fillMoreDrawer() {
  const groups = [
    { t: '英语学习', items: [['en-words', '单词本', I.book], ['en-reading', '英文阅读', I.book], ['en-listening', '听说训练', I.headphones], ['en-scenarios', '场景英语', I.chat], ['en-dialogues', '对话练习', I.chat], ['en-plan', '学习计划', I.calendar]] },
    { t: '中文学习', items: [['zh-quotes', '佳句摘抄', I.quote], ['zh-books', '读书计划', I.book], ['zh-creations', '创作板块', I.pen]] },
    { t: '公共能力', items: [['inbox', '收集箱', I.inbox], ['search', '搜索', I.search], ['ai', 'AI 帮手', I.spark], ['settings', '设置与数据', I.settings]] }
  ];
  $('#more-drawer-body').innerHTML = groups.map((g) =>
    '<div class="more-group"><div class="more-group-title">' + g.t + '</div>' +
    g.items.map((it) => '<div class="more-item" data-view="' + it[0] + '">' + it[2] + '<span>' + it[1] + '</span></div>').join('') +
    '</div>').join('');
}

function closeDrawers() {
  $('#more-drawer').hidden = true;
  $('#drawer-mask').hidden = true;
  $('#sidebar').classList.remove('sidebar-open');
}

/* ================= 渲染后处理 ================= */
let FOCUS_TARGET = '';
function afterRender() {
  $$('audio[data-audio-key]').forEach((el) => {
    const key = el.getAttribute('data-audio-key');
    if (el._loadedKey === key) return;
    WB.audioGet(key).then((blob) => {
      if (blob && el.getAttribute('data-audio-key') === key) {
        try { el.src = URL.createObjectURL(blob); el._loadedKey = key; } catch (e) { /* ignore */ }
      }
    }).catch(() => { /* no audio */ });
  });
  if (FOCUS_TARGET) {
    const el = document.getElementById(FOCUS_TARGET);
    if (el) { el.focus(); const len = el.value.length; try { el.setSelectionRange(len, len); } catch (e) { /* ignore */ } }
    FOCUS_TARGET = '';
  }
}

/* ================= 全局事件绑定 ================= */
function bindGlobalEvents() {
  /* ---- 点击 ---- */
  document.addEventListener('click', (e) => {
    /* 工具栏 / 关闭按钮 */
    if (e.target.closest('#menu-btn')) {
      const open = $('#sidebar').classList.toggle('sidebar-open');
      $('#drawer-mask').hidden = !open;
      return;
    }
    if (e.target.closest('#bn-more')) { $('#more-drawer').hidden = false; $('#drawer-mask').hidden = false; return; }
    if (e.target.closest('#more-close') || e.target.closest('#drawer-mask')) { closeDrawers(); return; }
    if (e.target.closest('#bn-add')) { navigate('inbox'); closeDrawers(); return; }
    if (e.target.closest('#topbar-search')) { navigate('search'); return; }
    if (e.target.closest('#modal-close')) { closeModal(); return; }
    if (e.target.closest('#help-close')) { closeHelp(); return; }
    if (e.target.id === 'modal-mask') { closeModal(); return; }
    if (e.target.id === 'help-modal') { closeHelp(); return; }

    /* 纯帮助按钮交给帮助系统（带导航/动作角色的 data-help 继续走主流程） */
    const helpOnly = e.target.closest('[data-help]');
    if (helpOnly && !helpOnly.closest('[data-view], [data-act], [data-go], #topbar-search, #bn-add, #bn-more, #menu-btn')) return;

    /* 文章标注编号点击 */
    const am = e.target.closest('.annot-mark');
    if (am) {
      const rv = e.target.closest('.reading-view');
      const artId = rv ? rv.getAttribute('data-art-id') : '';
      if (artId) viewAnnot(artId, am.getAttribute('data-annot'));
      return;
    }

    /* 导航 */
    const nav = e.target.closest('[data-view]');
    if (nav) { e.preventDefault(); navigate(nav.dataset.view); closeDrawers(); return; }

    /* data-go 跳转 */
    const go = e.target.closest('[data-go]');
    if (go) {
      const p = {};
      if (go.dataset.id) p.id = go.dataset.id;
      if (go.dataset.dg) p.dg = go.dataset.dg;
      if (go.dataset.sec) p.sec = go.dataset.sec;
      navigate(go.dataset.go, p);
      return;
    }

    /* data-act 动作 */
    const actEl = e.target.closest('[data-act]');
    if (actEl) { handleAct(actEl); return; }

    /* 筛选按钮 */
    const letterEl = e.target.closest('[data-letter]');
    if (letterEl) { const q = new URLSearchParams(location.hash.split('?')[1] || ''); navigate('en-words', { letter: letterEl.dataset.letter, kw: q.get('kw') || '', st: q.get('st') || '' }); return; }
    const sfEl = e.target.closest('[data-sf]');
    if (sfEl) { navigate('en-reading', { sf: sfEl.dataset.sf }); return; }
    const qlEl = e.target.closest('[data-qlang]');
    if (qlEl) { const q = new URLSearchParams(location.hash.split('?')[1] || ''); navigate('zh-quotes', { lang: qlEl.dataset.qlang, tag: q.get('tag') || '' }); return; }
    const qtEl = e.target.closest('[data-qtag]');
    if (qtEl) { const q = new URLSearchParams(location.hash.split('?')[1] || ''); navigate('zh-quotes', { tag: qtEl.dataset.qtag, lang: q.get('lang') || '' }); return; }
    const catEl = e.target.closest('[data-cat]');
    if (catEl) { navigate('en-scenarios', { cat: catEl.dataset.cat }); return; }
    const bstEl = e.target.closest('[data-bst]');
    if (bstEl) { navigate('zh-books', { st: bstEl.dataset.bst }); return; }
    const ctabEl = e.target.closest('[data-ctab]');
    if (ctabEl) { navigate('zh-creations', { tab: ctabEl.dataset.ctab }); return; }

    /* 归类弹窗内的语言 / 模块选择 */
    const clsLang = e.target.closest('[data-cls-lang]');
    if (clsLang) { CLS.lang = clsLang.dataset.clsLang; CLS.module = ''; openModal(clsHtml()); return; }
    const clsMod = e.target.closest('[data-cls-mod]');
    if (clsMod) { CLS.module = clsMod.dataset.clsMod; const box = $('#modal-body'); if (box) box.innerHTML = clsHtml(); return; }
  });

  /* ---- change ---- */
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'w-status') {
      const q = new URLSearchParams(location.hash.split('?')[1] || '');
      navigate('en-words', { letter: q.get('letter') || '', kw: q.get('kw') || '', st: t.value });
      return;
    }
    if (t.id === 'import-file') { doImport(t); return; }
    const bp = t.closest('[data-act="book-progress"]');
    if (bp) {
      const b = (getDB().books || []).find((x) => x.id === bp.dataset.id);
      if (b) { b.progress = Math.min(100, Math.max(0, parseInt(t.value || '0', 10))); saveDB(); route(); }
      return;
    }
    const bs = t.closest('[data-act="book-status"]');
    if (bs) {
      const b = (getDB().books || []).find((x) => x.id === bs.dataset.id);
      if (b) { b.status = t.value; saveDB(); route(); }
      return;
    }
    const cs = t.closest('[data-act="creation-status"]');
    if (cs) {
      const c = (getDB().creations || []).find((x) => x.id === cs.dataset.id);
      if (c) { c.status = t.value; saveDB(); route(); }
      return;
    }
  });

  /* ---- input（防抖搜索） ---- */
  let deb = null;
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'w-search') {
      clearTimeout(deb);
      deb = setTimeout(() => {
        const q = new URLSearchParams(location.hash.split('?')[1] || '');
        const params = { letter: q.get('letter') || '', st: q.get('st') || '' };
        const v = t.value.trim();
        if (v) params.kw = v;
        navigate('en-words', params);
        FOCUS_TARGET = 'w-search';
      }, 450);
      return;
    }
    if (t.id === 'sr-input') {
      clearTimeout(deb);
      deb = setTimeout(() => {
        const v = t.value.trim();
        navigate('search', v ? { kw: v } : {});
        FOCUS_TARGET = 'sr-input';
      }, 450);
      return;
    }
  });

  /* ---- 键盘 ---- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(); closeHelp(); closeDrawers(); hideSelBar();
      return;
    }
    if (e.key === 'Enter' && e.target && !e.target.closest('textarea')) {
      if (e.target.id === 'inbox-input') { addInbox(e.target.value); return; }
      if (e.target.id === 'ai-chat-input') { aiSend(); return; }
    }
  });

  /* ---- 文章选区 ---- */
  document.addEventListener('mouseup', (e) => onSelect(e));
  document.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      const t = e.changedTouches[0];
      onSelect({ clientX: t.clientX, clientY: t.clientY, target: e.target });
    }
  });
  window.addEventListener('scroll', hideSelBar, true);

  /* 语音朗读跟随设置 */
  window.addEventListener('hashchange', WB.route);
}

function onSelect(e) {
  const rv = e.target.closest ? e.target.closest('.reading-view') : null;
  if (!rv) { if (!(e.target.closest && e.target.closest('#sel-bar'))) hideSelBar(); return; }
  const artId = rv.getAttribute('data-art-id');
  const body = rv.querySelector('.art-body');
  if (!body) return;
  const sel = WB.getSelectionOffsets(body);
  if (!sel) return;
  SEL = { artId: artId, sel: sel };
  showSelBar(e.clientX, e.clientY);
}

/* ================= data-act 分发 ================= */
function handleAct(el) {
  const act = el.dataset.act;
  const id = el.dataset.id;
  const db = getDB();
  switch (act) {
    case 'close-modal': closeModal(); break;
    case 'confirm-del-ok': { const fn = window.__confirmFn; window.__confirmFn = null; closeModal(); if (fn) fn(); break; }

    /* 单词 */
    case 'add-word': openModal(WB.wordFormHtml()); break;
    case 'edit-word': { const w = (db.words || []).find((x) => x.id === id); if (w) openModal(WB.wordFormHtml(w)); break; }
    case 'save-word': saveWordForm(id); break;
    case 'del-word': confirmDel('确定删除这个单词？删除后无法恢复（可从备份导入恢复）。', () => { db.words = (db.words || []).filter((x) => x.id !== id); saveDB(); toast('已删除'); route(); }); break;
    case 'review-word': WB.reviewWord(id); break;

    /* 文章 */
    case 'add-article': openArticleForm(); break;
    case 'save-article': {
      const title = ($('#f-ar-title').value || '').trim(), content = ($('#f-ar-content').value || '').trim();
      if (!title || !content) { toast('标题与正文必填'); break; }
      db.articles = db.articles || [];
      db.articles.push({ id: uid(), title: title, source: $('#f-ar-source').value.trim(), level: $('#f-ar-level').value, category: $('#f-ar-cat').value.trim(), content: content, status: 'unread', annotations: [], longSentences: [], recite: null });
      saveDB(); closeModal(); toast('文章已添加'); route();
      break;
    }
    case 'art-status': toggleArtStatus(id); break;
    case 'art-recite': toggleArtRecite(id); break;
    case 'recite-enter': navigate('en-reading', { id: id, tab: 'recite' }); break;
    case 'recite-exit': navigate('en-reading', { id: id }); break;
    case 'recite-check': reciteCheck(id); break;
    case 'add-sentence': openSentenceForm(id); break;
    case 'edit-sentence': openSentenceForm(el.dataset.art, id); break;
    case 'save-sentence': {
      const artId = el.dataset.art, sentId = el.dataset.id;
      const a = (db.articles || []).find((x) => x.id === artId);
      if (!a) break;
      const sentence = ($('#f-sent').value || '').trim();
      if (!sentence) { toast('原句必填'); break; }
      const analysis = ($('#f-sent-an').value || '').trim();
      if (sentId) {
        const s = (a.longSentences || []).find((x) => x.id === sentId);
        if (s) { s.sentence = sentence; s.analysis = analysis; }
      } else {
        a.longSentences = a.longSentences || [];
        a.longSentences.push({ id: uid(), sentence: sentence, analysis: analysis });
      }
      saveDB(); closeModal(); toast('长难句已保存'); route();
      break;
    }
    case 'del-sentence': {
      const a = (db.articles || []).find((x) => x.id === el.dataset.art);
      if (a) { a.longSentences = (a.longSentences || []).filter((x) => x.id !== id); saveDB(); toast('已删除'); route(); }
      break;
    }
    case 'del-annot': delAnnot(el.dataset.art, id); break;

    /* 录音 */
    case 'toggle-rec': WB.toggleRec(); break;
    case 'del-rec': confirmDel('确定删除这条录音？音频将从本机移除，无法恢复。', async () => {
      const r = (db.recordings || []).find((x) => x.id === id);
      if (r && r.blobKey) { try { await WB.audioDel(r.blobKey); } catch (e) { /* ignore */ } }
      db.recordings = (db.recordings || []).filter((x) => x.id !== id);
      saveDB(); route();
    }); break;

    /* 对话 */
    case 'speak': speakText(el.dataset.txt); break;
    case 'ai-send': aiSend(); break;

    /* 计划任务 */
    case 'gen-today': WB.genTodayPlan(); break;
    case 'toggle-task': {
      const t = (db.tasks || []).find((x) => x.id === id);
      if (t) { t.done = !t.done; saveDB(); route(); }
      break;
    }
    case 'del-task': db.tasks = (db.tasks || []).filter((x) => x.id !== id); saveDB(); route(); break;
    case 'add-task': openTaskForm(el.dataset.kind || 'daily'); break;
    case 'save-task': {
      const title = ($('#f-task-title').value || '').trim();
      if (!title) { toast('任务内容必填'); break; }
      db.tasks = db.tasks || [];
      db.tasks.push({ id: uid(), date: $('#f-task-date').value || todayStr(), title: title, module: $('#f-task-module').value, done: false, kind: $('#f-task-kind').value });
      saveDB(); closeModal(); toast('任务已添加'); route();
      break;
    }

    /* 摘抄 */
    case 'add-quote': openModal(WB.quoteFormHtml()); break;
    case 'edit-quote': { const qt = (db.quotes || []).find((x) => x.id === id); if (qt) openModal(WB.quoteFormHtml(qt)); break; }
    case 'save-quote': saveQuoteForm(id); break;
    case 'del-quote': confirmDel('确定删除这条摘抄？', () => { db.quotes = (db.quotes || []).filter((x) => x.id !== id); saveDB(); route(); }); break;

    /* 收集箱 */
    case 'inbox-add': addInbox($('#inbox-input') ? $('#inbox-input').value : ''); break;
    case 'inbox-del': db.inbox = (db.inbox || []).filter((x) => x.id !== id); saveDB(); route(); break;
    case 'cls-open': openClassifyModal(id); break;
    case 'cls-confirm': clsConfirm(); break;
    case 'ai-apply': {
      const it = (db.inbox || []).find((x) => x.id === id);
      if (it) {
        const sug = suggestFor(it);
        applyInboxItem(it, it.lang || guessLang(it.content), sug.module);
        saveDB(); toast('已应用建议'); route();
      }
      break;
    }
    case 'ai-apply-all': {
      const items = (db.inbox || []).slice();
      items.forEach((it) => { const sug = suggestFor(it); applyInboxItem(it, it.lang || guessLang(it.content), sug.module); });
      saveDB(); toast('已应用全部建议'); route();
      break;
    }

    /* 书籍 */
    case 'add-book': openModal(bookFormHtml()); break;
    case 'edit-book': { const b = (db.books || []).find((x) => x.id === id); if (b) openModal(bookFormHtml(b)); break; }
    case 'save-book': {
      const title = ($('#f-bk-title').value || '').trim();
      if (!title) { toast('书名必填'); break; }
      const data = { title: title, author: $('#f-bk-author').value.trim(), category: $('#f-bk-cat').value.trim(), status: $('#f-bk-status').value, progress: Math.min(100, Math.max(0, parseInt($('#f-bk-progress').value || '0', 10))), notes: $('#f-bk-notes').value.trim() };
      if (id) {
        const b = (db.books || []).find((x) => x.id === id);
        if (b) Object.assign(b, data);
      } else {
        db.books = db.books || [];
        db.books.push(Object.assign({ id: uid(), date: todayStr() }, data));
      }
      saveDB(); closeModal(); toast('书籍已保存'); route();
      break;
    }
    case 'del-book': confirmDel('确定删除这本书？', () => { db.books = (db.books || []).filter((x) => x.id !== id); saveDB(); route(); }); break;

    /* 创作 */
    case 'add-creation': openModal(creationFormHtml()); break;
    case 'edit-creation': { const c = (db.creations || []).find((x) => x.id === id); if (c) openModal(creationFormHtml(c)); break; }
    case 'save-creation': {
      const title = ($('#f-cr-title').value || '').trim();
      if (!title) { toast('标题必填'); break; }
      const content = $('#f-cr-content').value.trim();
      const data = { title: title, category: $('#f-cr-cat').value, status: $('#f-cr-status').value, content: content };
      if (id) {
        const c = (db.creations || []).find((x) => x.id === id);
        if (c) Object.assign(c, data);
      } else {
        db.creations = db.creations || [];
        db.creations.push(Object.assign({ id: uid(), date: todayStr() }, data));
        if (window.__inspPendingId) {
          db.inspirations = (db.inspirations || []).filter((x) => x.id !== window.__inspPendingId);
          window.__inspPendingId = null;
        }
      }
      saveDB(); closeModal(); toast('作品已保存'); route();
      break;
    }
    case 'del-creation': confirmDel('确定删除这篇作品？', () => { db.creations = (db.creations || []).filter((x) => x.id !== id); saveDB(); route(); }); break;
    case 'add-inspiration': {
      const inp = $('#insp-input');
      const text = inp ? inp.value.trim() : '';
      if (!text) { toast('请输入灵感内容'); break; }
      db.inspirations = db.inspirations || [];
      db.inspirations.push({ id: uid(), text: text, date: todayStr() });
      saveDB(); toast('灵感已记录'); route();
      break;
    }
    case 'del-inspiration': db.inspirations = (db.inspirations || []).filter((x) => x.id !== id); saveDB(); route(); break;
    case 'insp-to-work': {
      const x = (db.inspirations || []).find((i) => i.id === id);
      if (!x) break;
      openModal(creationFormHtml({ title: '', category: '随笔', status: 'draft', content: x.text }));
      window.__inspPendingId = id;
      break;
    }

    /* 标注 */
    case 'highlight': case 'comment': case 'quote': case 'sentence': doAnnotAction(act); break;
    case 'comment-save': saveComment(); break;

    /* 设置 */
    case 'save-ai-config': saveAIConfig(); break;
    case 'save-wb-title': saveWbTitle(); break;
    case 'edit-today-title': editTodayTitle(); break;
    case 'save-today-title': saveTodayTitle(); break;
    case 'export-data': exportData(); break;
    case 'import-data': $('#import-file').click(); break;
    case 'reset-data': confirmDel('确定重置工作台？将清空全部数据并恢复内置示例（不可撤销，请先导出备份）。', () => { WB.resetDB(); toast('已重置'); route(); }); break;
    default: break;
  }
}

/* ================= 启动 ================= */
function boot() {
  WB.loadDB();
  applyWbTitle();
  WB.initAudioDB().then(() => {
    fillMoreDrawer();
    WB.bindHelpGlobal();
    bindGlobalEvents();
    if (!location.hash) location.hash = '#/today';
    else WB.route();
  });
}

WB.afterRender = afterRender;
WB.bindGlobalEvents = bindGlobalEvents;
boot();
})();
