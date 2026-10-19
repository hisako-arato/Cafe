'use strict';

// ===== 定数 =====
const SAVE_KEY = 'eikyu-cafe-save-v1';
const CONTRACT_SEC = 300;   // アルバイトの契約期間（秒）
const PATIENCE_SEC = 45;    // お客さんが料理を待てる時間（秒）
const EAT_SEC = 4;          // 食事にかかる時間（秒）
const CUST_SPEED = 22;      // お客さんの歩く速さ（%/秒）
const MAX_STOVES = 6;
const MAX_TABLES = 8;

const DISHES = [
  { id: 'coffee',  name: 'コーヒー',       emoji: '☕', time: 5,   cost: 5,   servings: 4, price: 12, xp: 1,  level: 1 },
  { id: 'toast',   name: 'トースト',       emoji: '🍞', time: 15,  cost: 12,  servings: 5, price: 16, xp: 2,  level: 1 },
  { id: 'curry',   name: 'カレーライス',   emoji: '🍛', time: 40,  cost: 35,  servings: 6, price: 28, xp: 5,  level: 2 },
  { id: 'omurice', name: 'オムライス',     emoji: '🍳', time: 60,  cost: 55,  servings: 6, price: 38, xp: 7,  level: 3 },
  { id: 'pasta',   name: 'ナポリタン',     emoji: '🍝', time: 90,  cost: 80,  servings: 7, price: 45, xp: 10, level: 4 },
  { id: 'cake',    name: 'ショートケーキ', emoji: '🍰', time: 150, cost: 130, servings: 8, price: 66, xp: 15, level: 5 },
  { id: 'steak',   name: 'ステーキ',       emoji: '🥩', time: 180, cost: 200, servings: 8, price: 90, xp: 22, level: 7 },
];
const DISH = Object.fromEntries(DISHES.map(d => [d.id, d]));

const DECOR = [
  { id: 'plant',      name: '観葉植物',         emoji: '🪴', price: 80,   pop: 1 },
  { id: 'lamp',       name: 'おしゃれなランプ', emoji: '💡', price: 200,  pop: 3 },
  { id: 'painting',   name: '絵画',             emoji: '🖼️', price: 450,  pop: 6 },
  { id: 'jukebox',    name: 'レコードプレーヤー', emoji: '📻', price: 900, pop: 10 },
  { id: 'chandelier', name: 'シャンデリア',     emoji: '✨', price: 2000, pop: 18 },
];

const SURNAMES = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤',
  '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '斎藤', '清水', '比嘉', '金城', '新垣', '荒戸'];
const FACES = ['🧑', '👩', '👨', '🧓', '👵', '👴', '👩‍🦰', '👨‍🦱', '👱‍♀️', '🧔', '👩‍🎓', '🧑‍💼', '👨‍🦳', '👩‍🦱'];

// 床の座標はすべて % 単位
const TABLE_POS = [
  { x: 15, y: 44 }, { x: 38, y: 44 }, { x: 61, y: 44 }, { x: 84, y: 44 },
  { x: 15, y: 74 }, { x: 38, y: 74 }, { x: 61, y: 74 }, { x: 84, y: 74 },
];
const COUNTER_SPOT = { x: 30, y: 22 };
const DOOR = { x: 95, y: 97 };

// ===== 状態 =====
function newGame() {
  return {
    money: 150,
    level: 1,
    xp: 0,
    contracts: 1,
    contractsBought: 0,
    stoves: [{ dish: null, start: 0 }, { dish: null, start: 0 }],
    tableCount: 2,
    decor: {},
    counter: [],
    staff: [{ id: 1, name: '店長', emoji: '🧑‍🍳', stars: 3, type: 'perm', expireAt: 0, owner: true }],
    nextId: 2,
    stats: { served: 0, hired: 0, promoted: 0 },
    seenHelp: false,
  };
}

let S = load();
let tables = [];
let customers = [];
let spawnTimer = 3;
let uid = 1;

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return Object.assign(newGame(), JSON.parse(raw));
  } catch (e) { /* 保存データが読めなくても新規で始める */ }
  return newGame();
}

function save() {
  const data = {
    ...S,
    staff: S.staff.map(({ id, name, emoji, stars, type, expireAt, owner }) =>
      ({ id, name, emoji, stars, type, expireAt, owner })),
  };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) { /* 保存できない環境では無視 */ }
}

function initRuntime() {
  tables = [];
  for (let i = 0; i < S.tableCount; i++) tables.push({ state: 'free', cust: null, cleaner: null });
  customers = [];
  S.staff.forEach((s, i) => {
    const h = homeOf(s, i);
    s.x = h.x; s.y = h.y; s.task = null;
  });
}

// ===== 計算 =====
const popularity = () => DECOR.reduce((sum, d) => sum + (S.decor[d.id] || 0) * d.pop, 0);
const staffCap = () => Math.min(12, 2 + S.level);
const xpNeeded = l => Math.round(12 * Math.pow(l, 1.5));
const spawnInterval = () => Math.max(2, 8 - popularity() * 0.06 - S.level * 0.15);
const speedOf = s => 14 + s.stars * 5;
const cleanTime = s => 2.4 - s.stars * 0.3;
const scoutFee = stars => 20 + stars * stars * 15;
const stovePrice = () => Math.round(150 * Math.pow(2, S.stoves.length - 2));
const tablePrice = () => Math.round(120 * Math.pow(1.7, S.tableCount - 2));
const decorPrice = d => Math.round(d.price * Math.pow(1.25, S.decor[d.id] || 0));
const contractPrice = () => Math.round(800 * Math.pow(1.5, S.contractsBought));
const payFor = dishId => Math.round(DISH[dishId].price * (1 + popularity() * 0.01));

const seatPos = ti => ({ x: TABLE_POS[ti].x - 8, y: TABLE_POS[ti].y - 2 });
const standPos = ti => ({ x: TABLE_POS[ti].x + 7, y: TABLE_POS[ti].y - 1 });
function homeOf(s, idx) {
  const i = idx ?? S.staff.indexOf(s);
  return { x: 6 + (i % 7) * 8, y: 28 + Math.floor(i / 7) * 5 };
}

function stoveState(st, now = Date.now()) {
  if (!st.dish) return { kind: 'idle' };
  const total = DISH[st.dish].time * 1000;
  const elapsed = now - st.start;
  if (elapsed >= total) return { kind: 'ready' };
  return { kind: 'cooking', ratio: elapsed / total, left: Math.ceil((total - elapsed) / 1000) };
}

const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const yen = n => '¥' + n.toLocaleString('ja-JP');
const starStr = n => '★'.repeat(n) + '☆'.repeat(5 - n);
function fmtTime(sec) {
  sec = Math.max(0, Math.ceil(sec));
  if (sec < 60) return `${sec}秒`;
  const m = Math.floor(sec / 60), s = sec % 60;
  return s ? `${m}分${s}秒` : `${m}分`;
}
function rollStars() {
  const r = Math.random();
  if (r < 0.45) return 1;
  if (r < 0.78) return 2;
  if (r < 0.93) return 3;
  if (r < 0.985) return 4;
  return 5;
}

// ===== カウンター =====
function addToCounter(dishId, n) {
  const st = S.counter.find(c => c.dish === dishId);
  if (st) st.n += n; else S.counter.push({ dish: dishId, n });
}
function takeServing() {
  // 一番高い料理から出す
  let best = null;
  for (const st of S.counter) if (!best || DISH[st.dish].price > DISH[best.dish].price) best = st;
  if (!best) return null;
  best.n--;
  if (best.n <= 0) S.counter.splice(S.counter.indexOf(best), 1);
  return best.dish;
}

// ===== アクション =====
function startCooking(i, dishId) {
  const d = DISH[dishId], st = S.stoves[i];
  if (!d || !st || st.dish || S.level < d.level || S.money < d.cost) return;
  S.money -= d.cost;
  st.dish = dishId;
  st.start = Date.now();
  closeModal();
  save();
}

function collectStove(i) {
  const st = S.stoves[i];
  if (!st || stoveState(st).kind !== 'ready') return;
  const d = DISH[st.dish];
  addToCounter(d.id, d.servings);
  st.dish = null;
  st.start = 0;
  toast(`${d.emoji} ${d.name}が${d.servings}人前できあがりました`);
  addXp(d.xp);
  save();
}

function addXp(n) {
  S.xp += n;
  while (S.xp >= xpNeeded(S.level)) {
    S.xp -= xpNeeded(S.level);
    S.level++;
    S.contracts++;
    const unlocked = DISHES.filter(d => d.level === S.level).map(d => d.emoji + d.name);
    toast(`🎉 レベル${S.level}になりました！ 永久雇用契約 📜 +1`, true);
    if (unlocked.length) toast(`新メニュー解禁：${unlocked.join('、')}`);
  }
}

function hire(cid) {
  const c = customers.find(c => c.id === cid);
  if (!c || (c.state !== 'wait' && c.state !== 'eat')) { closeModal(); return; }
  const fee = scoutFee(c.stars);
  if (S.money < fee || S.staff.length >= staffCap()) return;
  S.money -= fee;
  if (c.server) cancelTaskOf(S.staff.find(s => s.id === c.server));
  const t = tables[c.table];
  t.state = c.state === 'eat' ? 'dirty' : 'free';
  t.cust = null;
  customers.splice(customers.indexOf(c), 1);
  const s = {
    id: S.nextId++, name: c.name, emoji: c.emoji, stars: c.stars,
    type: 'part', expireAt: Date.now() + CONTRACT_SEC * 1000, owner: false,
    x: c.x, y: c.y, task: null,
  };
  S.staff.push(s);
  S.stats.hired++;
  toast(`🤝 ${s.name}さんをアルバイトとして雇いました（契約${fmtTime(CONTRACT_SEC)}）`);
  closeModal();
  save();
}

function promote(id) {
  const s = S.staff.find(s => s.id === id);
  if (!s || s.type !== 'part' || S.contracts <= 0) return;
  S.contracts--;
  s.type = 'perm';
  s.expireAt = 0;
  S.stats.promoted++;
  toast(`📜 ${s.name}さんと永久雇用契約を結びました！ 正社員になりました`, true);
  save();
}

function removeStaff(s, message) {
  cancelTaskOf(s);
  S.staff.splice(S.staff.indexOf(s), 1);
  if (message) toast(message);
  save();
}

function fire(id) {
  const s = S.staff.find(s => s.id === id);
  if (!s || s.owner) return;
  removeStaff(s, `👋 ${s.name}さんが退職しました`);
  closeModal();
}

function buy(kind, id) {
  if (kind === 'stove') {
    const p = stovePrice();
    if (S.stoves.length >= MAX_STOVES || S.money < p) return;
    S.money -= p;
    S.stoves.push({ dish: null, start: 0 });
    toast('🔥 コンロを増やしました');
  } else if (kind === 'table') {
    const p = tablePrice();
    if (S.tableCount >= MAX_TABLES || S.money < p) return;
    S.money -= p;
    S.tableCount++;
    tables.push({ state: 'free', cust: null, cleaner: null });
    toast('🪑 テーブルを増やしました');
  } else if (kind === 'decor') {
    const d = DECOR.find(d => d.id === id);
    const p = decorPrice(d);
    if (!d || S.money < p) return;
    S.money -= p;
    S.decor[d.id] = (S.decor[d.id] || 0) + 1;
    toast(`${d.emoji} ${d.name}を飾りました（人気度 +${d.pop}）`);
  } else if (kind === 'contract') {
    const p = contractPrice();
    if (S.money < p) return;
    S.money -= p;
    S.contractsBought++;
    S.contracts++;
    toast('📜 永久雇用契約を1枚手に入れました');
  }
  save();
}

function resetGame() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* 無視 */ }
  S = newGame();
  S.seenHelp = true;
  initRuntime();
  floorEls.clear();
  document.querySelectorAll('#floor .person, #floor .table').forEach(el => el.remove());
  keys = {};
  closeModal();
  save();
  toast('データを消去して最初からはじめます');
}

// ===== シミュレーション =====
function moveTo(o, p, step) {
  const dx = p.x - o.x, dy = p.y - o.y;
  const d = Math.hypot(dx, dy);
  if (Math.abs(dx) > 0.5) o.flip = dx < 0;
  if (d <= step) { o.x = p.x; o.y = p.y; return true; }
  o.x += dx / d * step;
  o.y += dy / d * step;
  return false;
}

function spawnCustomer() {
  const ti = tables.findIndex(t => t.state === 'free');
  if (ti < 0) return false;
  const c = {
    id: uid++, name: rand(SURNAMES), emoji: rand(FACES), stars: rollStars(),
    x: DOOR.x, y: DOOR.y, table: ti, state: 'in',
    patience: PATIENCE_SEC, server: null, dish: null, eat: 0, flip: true,
  };
  tables[ti].state = 'occupied';
  tables[ti].cust = c.id;
  customers.push(c);
  return true;
}

function customerLeave(c, angry) {
  const t = tables[c.table];
  t.state = angry ? 'free' : 'dirty';
  t.cust = null;
  c.state = 'out';
  c.angry = angry;
}

function cancelTaskOf(s) {
  if (!s || !s.task) return;
  const k = s.task;
  if (k.type === 'serve') {
    if (k.dish) addToCounter(k.dish, 1);
    const c = customers.find(c => c.id === k.cid);
    if (c) c.server = null;
  } else if (k.type === 'clean') {
    if (tables[k.table]) tables[k.table].cleaner = null;
  }
  s.task = null;
}

function findTask(s) {
  if (S.counter.length) {
    const c = customers
      .filter(c => c.state === 'wait' && !c.server)
      .sort((a, b) => a.patience - b.patience)[0];
    if (c) {
      s.task = { type: 'serve', cid: c.id, dish: takeServing(), phase: 'counter' };
      c.server = s.id;
      return;
    }
  }
  const ti = tables.findIndex(t => t.state === 'dirty' && !t.cleaner);
  if (ti >= 0) {
    tables[ti].cleaner = s.id;
    s.task = { type: 'clean', table: ti, phase: 'go', t: 0 };
  }
}

function update(dt) {
  const now = Date.now();

  for (const s of [...S.staff]) {
    if (s.type === 'part' && now >= s.expireAt) {
      removeStaff(s, `⌛ アルバイトの${s.name}さんが契約満了で辞めてしまいました`);
    }
  }

  spawnTimer += dt;
  if (spawnTimer >= spawnInterval()) {
    spawnTimer = spawnCustomer() ? 0 : spawnInterval() - 1.5;
  }

  for (const c of customers) {
    if (c.state === 'in') {
      if (moveTo(c, seatPos(c.table), CUST_SPEED * dt)) { c.state = 'wait'; c.flip = false; }
    } else if (c.state === 'wait') {
      if (!c.server) {
        c.patience -= dt;
        if (c.patience <= 0) {
          customerLeave(c, true);
          floatText('💢', c.x, c.y - 6, true);
          toast(`😠 ${c.name}さんが待ちきれずに帰ってしまいました`);
        }
      }
    } else if (c.state === 'eat') {
      c.eat -= dt;
      if (c.eat <= 0) {
        const pay = payFor(c.dish);
        S.money += pay;
        S.stats.served++;
        floatText('+' + yen(pay), c.x, c.y - 8);
        customerLeave(c, false);
        addXp(1);
      }
    } else if (c.state === 'out') {
      if (moveTo(c, DOOR, CUST_SPEED * dt)) c.gone = true;
    }
  }
  customers = customers.filter(c => !c.gone);

  S.staff.forEach((s, i) => {
    if (!s.task) findTask(s);
    const step = speedOf(s) * dt;
    const k = s.task;
    if (!k) {
      if (moveTo(s, homeOf(s, i), step)) s.flip = false;
      return;
    }
    if (k.type === 'serve') {
      const c = customers.find(c => c.id === k.cid);
      if (!c || c.state !== 'wait') { cancelTaskOf(s); return; }
      if (k.phase === 'counter') {
        if (moveTo(s, COUNTER_SPOT, step)) k.phase = 'table';
      } else if (moveTo(s, standPos(c.table), step)) {
        c.state = 'eat';
        c.dish = k.dish;
        c.eat = EAT_SEC;
        c.server = null;
        s.task = null;
      }
    } else if (k.type === 'clean') {
      const t = tables[k.table];
      if (!t || t.state !== 'dirty') { s.task = null; return; }
      if (k.phase === 'go') {
        if (moveTo(s, standPos(k.table), step)) { k.phase = 'work'; k.t = cleanTime(s); }
      } else {
        k.t -= dt;
        if (k.t <= 0) { t.state = 'free'; t.cleaner = null; s.task = null; }
      }
    }
  });
}

// ===== 描画：フロア =====
const $ = id => document.getElementById(id);
const floor = $('floor');
const floorEls = new Map();
let keys = {};

function setKeyed(el, name, key, html) {
  if (keys[name] === key) return false;
  keys[name] = key;
  el.innerHTML = html;
  return true;
}

function personEl(key, cls, html) {
  let el = floorEls.get(key);
  if (!el) {
    el = document.createElement('div');
    el.className = 'person ' + cls;
    el.innerHTML = html;
    floor.appendChild(el);
    floorEls.set(key, el);
  }
  el._seen = true;
  return el;
}

function place(el, x, y) {
  el.style.left = x + '%';
  el.style.top = y + '%';
}

function renderFloor() {
  for (const el of floorEls.values()) el._seen = false;

  tables.forEach((t, i) => {
    const el = personEl('t' + i, '', '');
    if (!el.classList.contains('table')) {
      el.className = 'table';
      place(el, TABLE_POS[i].x, TABLE_POS[i].y);
    }
    const c = t.cust != null ? customers.find(c => c.id === t.cust) : null;
    const content = t.state === 'dirty' ? '🍽️' : (c && c.state === 'eat' ? DISH[c.dish].emoji : '');
    if (el._content !== content) { el._content = content; el.textContent = content; }
    el.classList.toggle('dirty', t.state === 'dirty');
  });

  for (const c of customers) {
    const el = personEl('c' + c.id, 'customer' + (c.stars >= 4 ? ' rare' : ''),
      '<div class="bubble"></div><div class="face"></div>');
    if (!el._init) {
      el._init = true;
      el.dataset.action = 'scout';
      el.dataset.cid = c.id;
      el.querySelector('.face').textContent = c.emoji;
    }
    place(el, c.x, c.y);
    el.classList.toggle('flip', !!c.flip);
    const bubble = el.querySelector('.bubble');
    let bkey = '';
    if (c.state === 'wait') bkey = c.server ? 'coming' : 'wait';
    else if (c.state === 'eat') bkey = 'eat';
    else if (c.state === 'out' && c.angry) bkey = 'angry';
    if (el._bkey !== bkey) {
      el._bkey = bkey;
      bubble.innerHTML = bkey === 'wait' ? '<span>🍴</span><div class="pbar"><i></i></div>'
        : bkey === 'coming' ? '<span>😊</span>'
        : bkey === 'eat' ? '<span>😋</span>'
        : bkey === 'angry' ? '<span>💢</span>' : '';
    }
    if (bkey === 'wait') {
      const r = c.patience / PATIENCE_SEC;
      const bar = bubble.querySelector('.pbar');
      bar.classList.toggle('low', r < 0.3);
      bar.firstChild.style.width = (r * 100).toFixed(1) + '%';
    }
  }

  for (const s of S.staff) {
    const el = personEl('s' + s.id, 'staff',
      '<div class="carry"></div><div class="face"></div><div class="tag"></div>');
    if (el._emoji !== s.emoji) { el._emoji = s.emoji; el.querySelector('.face').textContent = s.emoji; }
    const tagKey = s.owner ? 'owner' : s.type;
    if (el._tag !== tagKey) {
      el._tag = tagKey;
      const tag = el.querySelector('.tag');
      tag.className = 'tag ' + tagKey;
      tag.textContent = s.owner ? '店長' : s.type === 'perm' ? '正社員' : 'バイト';
    }
    place(el, s.x, s.y);
    el.classList.toggle('flip', !!s.flip);
    const k = s.task;
    const carry = !k ? '' : k.type === 'serve' ? (k.phase === 'table' ? DISH[k.dish].emoji : '')
      : k.phase === 'work' ? '🧽' : '';
    if (el._carry !== carry) { el._carry = carry; el.querySelector('.carry').textContent = carry; }
  }

  for (const [key, el] of floorEls) {
    if (!el._seen) { el.remove(); floorEls.delete(key); }
  }

  // カウンター
  const counterKey = S.counter.map(st => st.dish + st.n).join(',');
  setKeyed($('counter'), 'counter', counterKey,
    '<span class="label">カウンター</span>' + (S.counter.length
      ? S.counter.map(st => `<span class="stack">${DISH[st.dish].emoji}<small>×${st.n}</small></span>`).join('')
      : '<span class="empty">料理がありません…キッチンで作りましょう</span>'));

  // ミニコンロ
  const now = Date.now();
  const states = S.stoves.map(st => stoveState(st, now));
  const stoveKey = S.stoves.map((st, i) => states[i].kind + st.dish).join(',');
  setKeyed($('miniStoves'), 'mini', stoveKey, S.stoves.map((st, i) => {
    const k = states[i].kind;
    if (k === 'idle') return `<button class="mini-stove idle" data-action="pick" data-i="${i}" aria-label="コンロ${i + 1}">🔥</button>`;
    if (k === 'ready') return `<button class="mini-stove ready" data-action="collect" data-i="${i}" aria-label="できあがり">${DISH[st.dish].emoji}</button>`;
    return `<button class="mini-stove cooking" data-action="tab" data-tab="kitchen"><span>${DISH[st.dish].emoji}</span><i class="fill" data-mini="${i}"></i></button>`;
  }).join(''));
  states.forEach((s, i) => {
    if (s.kind !== 'cooking') return;
    const f = floor.querySelector(`[data-mini="${i}"]`);
    if (f) f.style.width = (s.ratio * 100).toFixed(1) + '%';
  });

  // 内装
  const decorKey = DECOR.map(d => S.decor[d.id] || 0).join(',');
  setKeyed($('decorRow'), 'decor', decorKey,
    DECOR.flatMap(d => Array(Math.min(4, S.decor[d.id] || 0)).fill(`<span>${d.emoji}</span>`)).join(''));
}

function floatText(text, x, y, bad) {
  const el = document.createElement('div');
  el.className = 'float' + (bad ? ' bad' : '');
  el.textContent = text;
  place(el, x, y);
  floor.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

// ===== 描画：HUD とパネル =====
let currentTab = 'kitchen';

function renderHud() {
  $('money').textContent = yen(S.money);
  $('level').textContent = S.level;
  $('xpbar').style.width = Math.min(100, S.xp / xpNeeded(S.level) * 100) + '%';
  $('contracts').textContent = S.contracts;
  $('pop').textContent = popularity();
}

function renderKitchen() {
  const el = $('kitchen');
  const now = Date.now();
  const states = S.stoves.map(st => stoveState(st, now));
  const key = S.stoves.map((st, i) => states[i].kind + st.dish).join(',');
  setKeyed(el, 'kitchen', key, `
    <h3>コンロ（${S.stoves.length}/${MAX_STOVES}）</h3>
    <p class="note">料理を作ってカウンターに並べると、スタッフがお客さんに運びます。</p>
    <div class="stoves">${S.stoves.map((st, i) => {
      const s = states[i];
      if (s.kind === 'idle') {
        return `<button class="stove idle" data-action="pick" data-i="${i}">
          <div class="big">🔥</div>コンロ${i + 1}<span>タップして料理を作る</span></button>`;
      }
      const d = DISH[st.dish];
      if (s.kind === 'ready') {
        return `<button class="stove ready" data-action="collect" data-i="${i}">
          <div class="big">${d.emoji}</div>できあがり！<span>タップでカウンターへ（${d.servings}人前）</span></button>`;
      }
      return `<div class="stove cooking"><div class="big">${d.emoji}</div>${d.name}
        <div class="bar"><i data-prog="${i}"></i></div><span data-left="${i}"></span></div>`;
    }).join('')}</div>`);
  states.forEach((s, i) => {
    if (s.kind !== 'cooking') return;
    const bar = el.querySelector(`[data-prog="${i}"]`);
    const left = el.querySelector(`[data-left="${i}"]`);
    if (bar) bar.style.width = (s.ratio * 100).toFixed(1) + '%';
    if (left) left.textContent = `のこり ${fmtTime(s.left)}`;
  });
}

function staffStatus(s) {
  const k = s.task;
  if (!k) return '待機中';
  if (k.type === 'serve') return k.phase === 'counter' ? '料理を取りに行っています' : '配膳中';
  return '片付け中';
}

function renderStaff() {
  const el = $('staff');
  const key = [S.staff.map(s => s.id + s.type).join(','), S.contracts, staffCap()].join('|');
  setKeyed(el, 'staff', key, `
    <h3>スタッフ（${S.staff.length}/${staffCap()}人）　📜 永久雇用契約 × ${S.contracts}</h3>
    <p class="note">お客さんをタップするとアルバイトとしてスカウトできます。アルバイトは契約期間（${fmtTime(CONTRACT_SEC)}）が過ぎると辞めてしまいます。
    永久雇用契約を結ぶと<b>正社員</b>になり、ずっと働いてくれます。契約はレベルアップかショップで手に入ります。</p>
    <div class="staff-list">${S.staff.map(s => `
      <div class="row">
        <div class="ico">${s.emoji}</div>
        <div class="info">
          <div class="name">${s.name}${s.owner ? '' : 'さん'}
            <span class="badge ${s.owner ? 'owner' : s.type}">${s.owner ? '店長' : s.type === 'perm' ? '正社員' : 'アルバイト'}</span></div>
          <div class="sub">速さ <span class="stars">${starStr(s.stars)}</span>　<span data-status="${s.id}"></span></div>
          ${s.type === 'part' ? `<div class="bar contract"><i data-contract="${s.id}"></i></div>
            <div class="sub" data-contract-left="${s.id}"></div>` : ''}
        </div>
        <div class="staff-actions">
          ${s.type === 'part'
            ? `<button class="btn blue small" data-action="promote" data-id="${s.id}" ${S.contracts > 0 ? '' : 'disabled'}>📜 正社員にする</button>`
            : ''}
          ${s.owner ? '' : `<button class="btn ghost small" data-action="askFire" data-id="${s.id}">解雇</button>`}
        </div>
      </div>`).join('')}</div>`);
  const now = Date.now();
  for (const s of S.staff) {
    const st = el.querySelector(`[data-status="${s.id}"]`);
    if (st) st.textContent = staffStatus(s);
    if (s.type !== 'part') continue;
    const left = (s.expireAt - now) / 1000;
    const bar = el.querySelector(`[data-contract="${s.id}"]`);
    const txt = el.querySelector(`[data-contract-left="${s.id}"]`);
    if (bar) bar.style.width = Math.max(0, left / CONTRACT_SEC * 100).toFixed(1) + '%';
    if (txt) txt.textContent = `契約のこり ${fmtTime(left)}`;
  }
}

function itemRow(ico, name, sub, price, action, extra, disabled, label) {
  return `<div class="row">
    <div class="ico">${ico}</div>
    <div class="info"><div class="name">${name}</div><div class="sub">${sub}</div></div>
    <button class="btn" data-action="${action}" ${extra} ${disabled ? 'disabled' : ''}>${label || yen(price)}</button>
  </div>`;
}

function renderShop() {
  const el = $('shop');
  const sp = stovePrice(), tp = tablePrice(), cp = contractPrice();
  const stoveMax = S.stoves.length >= MAX_STOVES, tableMax = S.tableCount >= MAX_TABLES;
  const key = [sp, tp, cp, stoveMax, tableMax,
    ...DECOR.map(d => decorPrice(d) + ':' + (S.money >= decorPrice(d))),
    S.money >= sp, S.money >= tp, S.money >= cp].join('|');
  setKeyed(el, 'shop', key, `
    <h3>設備</h3>
    <div class="item-list">
      ${itemRow('🔥', 'コンロを増やす', `いま ${S.stoves.length}/${MAX_STOVES} 台`, sp, 'buy', 'data-kind="stove"',
        stoveMax || S.money < sp, stoveMax ? '最大' : '')}
      ${itemRow('🪑', 'テーブルを増やす', `いま ${S.tableCount}/${MAX_TABLES} 卓`, tp, 'buy', 'data-kind="table"',
        tableMax || S.money < tp, tableMax ? '最大' : '')}
    </div>
    <h3>内装（人気度が上がるとお客さんが増え、代金も上がります）</h3>
    <div class="item-list">
      ${DECOR.map(d => itemRow(d.emoji, d.name, `人気度 +${d.pop}　所持 ${S.decor[d.id] || 0}`,
        decorPrice(d), 'buy', `data-kind="decor" data-id="${d.id}"`, S.money < decorPrice(d))).join('')}
    </div>
    <h3>契約</h3>
    <div class="item-list">
      ${itemRow('📜', '永久雇用契約', 'アルバイトを正社員にできる契約書。買うたびに値上がりします', cp, 'buy',
        'data-kind="contract"', S.money < cp)}
    </div>
    <h3>その他</h3>
    <div class="item-list">
      ${itemRow('🗑️', 'データを消去', '最初からやり直します', 0, 'askReset', '', false, '消去')}
    </div>`);
}

function renderUI() {
  renderHud();
  if (currentTab === 'kitchen') renderKitchen();
  if (currentTab === 'staff') renderStaff();
  if (currentTab === 'shop') renderShop();
}

function setTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  ['kitchen', 'staff', 'shop'].forEach(t => { $(t).hidden = t !== tab; });
  delete keys[tab];
  renderUI();
}

// ===== モーダル =====
function openModal(html) {
  $('sheet').innerHTML = html;
  $('modal').hidden = false;
}
function closeModal() {
  $('modal').hidden = true;
  $('sheet').innerHTML = '';
}

function openDishPicker(i) {
  if (S.stoves[i]?.dish) return;
  openModal(`
    <h2>🔥 コンロ${i + 1}：何を作りますか？</h2>
    <div class="dish-list">${DISHES.map(d => {
      const locked = S.level < d.level;
      return `<div class="row ${locked ? 'locked' : ''}">
        <div class="ico">${d.emoji}</div>
        <div class="info"><div class="name">${d.name}</div>
          <div class="sub">${locked ? `レベル${d.level}で解禁` :
            `⏱ ${fmtTime(d.time)}　🍽 ${d.servings}人前　1人前 ${yen(d.price)}`}</div></div>
        <button class="btn" data-action="cook" data-i="${i}" data-dish="${d.id}"
          ${locked || S.money < d.cost ? 'disabled' : ''}>${locked ? '🔒' : yen(d.cost)}</button>
      </div>`;
    }).join('')}</div>
    <div class="actions"><button class="btn ghost" data-action="close">閉じる</button></div>`);
}

function openScout(cid) {
  const c = customers.find(c => c.id === cid);
  if (!c || (c.state !== 'wait' && c.state !== 'eat')) return;
  const fee = scoutFee(c.stars);
  const full = S.staff.length >= staffCap();
  openModal(`
    <h2>${c.emoji} ${c.name}さん</h2>
    <p>仕事の速さ <span class="stars">${starStr(c.stars)}</span></p>
    <p>アルバイトとしてスカウトしますか？ 契約期間は <b>${fmtTime(CONTRACT_SEC)}</b> です。
    あとで永久雇用契約を結べば正社員になります。</p>
    ${full ? `<p style="color:var(--warn)">スタッフがいっぱいです（${S.staff.length}/${staffCap()}人）。レベルを上げると雇える人数が増えます。</p>` : ''}
    <div class="actions">
      <button class="btn ghost" data-action="close">やめる</button>
      <button class="btn" data-action="hire" data-cid="${c.id}" ${full || S.money < fee ? 'disabled' : ''}>${yen(fee)} でスカウト</button>
    </div>`);
}

function openHelp() {
  S.seenHelp = true;
  save();
  openModal(`
    <h2>☕ 永久雇用カフェの遊び方</h2>
    <ul>
      <li><b>キッチン</b>でコンロをタップして料理を作ります。できあがったらタップしてカウンターへ並べます。</li>
      <li>スタッフがカウンターの料理をお客さんへ運び、食べ終わるとお金がもらえます。汚れたテーブルもスタッフが片付けます。</li>
      <li>料理が届かないまま待たせすぎると、お客さんは怒って帰ってしまいます。</li>
      <li>お客さんを<b>タップするとスカウト</b>できます。雇った人はまず<b>アルバイト</b>で、契約期間が終わると辞めてしまいます。</li>
      <li><b>📜 永久雇用契約</b>を結ぶと<b>正社員</b>になり、ずっと働いてくれます。契約書はレベルアップかショップで手に入ります。</li>
      <li>お金で<b>コンロ・テーブル・内装</b>を増やしてお店を大きくしましょう。データは自動で保存されます。</li>
    </ul>
    <div class="actions"><button class="btn" data-action="close">はじめる</button></div>`);
}

// ===== トースト =====
function toast(text, big) {
  const el = document.createElement('div');
  el.className = 'toast' + (big ? ' big' : '');
  el.textContent = text;
  const box = $('toasts');
  box.appendChild(el);
  while (box.children.length > 4) box.firstChild.remove();
  setTimeout(() => el.remove(), big ? 3500 : 2600);
}

// ===== 入力 =====
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) {
    if (e.target === $('modal')) closeModal();
    return;
  }
  const d = el.dataset;
  switch (d.action) {
    case 'tab': setTab(d.tab); break;
    case 'pick': openDishPicker(+d.i); break;
    case 'cook': startCooking(+d.i, d.dish); break;
    case 'collect': collectStove(+d.i); break;
    case 'scout': openScout(+d.cid); break;
    case 'hire': hire(+d.cid); break;
    case 'promote': promote(+d.id); break;
    case 'askFire': {
      const s = S.staff.find(s => s.id === +d.id);
      if (!s) break;
      openModal(`<h2>${s.emoji} ${s.name}さんを解雇しますか？</h2>
        <p>${s.type === 'perm' ? '正社員を解雇すると、使った永久雇用契約は戻りません。' : 'アルバイトの契約を打ち切ります。'}</p>
        <div class="actions"><button class="btn ghost" data-action="close">やめる</button>
        <button class="btn danger" data-action="fire" data-id="${s.id}">解雇する</button></div>`);
      break;
    }
    case 'fire': fire(+d.id); break;
    case 'buy': buy(d.kind, d.id); break;
    case 'askReset':
      openModal(`<h2>データを消去しますか？</h2><p>お金・スタッフ・設備がすべて最初の状態に戻ります。</p>
        <div class="actions"><button class="btn ghost" data-action="close">やめる</button>
        <button class="btn danger" data-action="reset">消去する</button></div>`);
      break;
    case 'reset': resetGame(); break;
    case 'help': openHelp(); break;
    case 'close': closeModal(); break;
  }
  renderUI();
});

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
window.addEventListener('pagehide', save);

// ===== メインループ =====
let last = performance.now();
let uiTimer = 0;
let saveTimer = 0;

function frame(t) {
  const dt = Math.min(0.1, (t - last) / 1000);
  last = t;
  update(dt);
  renderFloor();
  uiTimer += dt;
  if (uiTimer >= 0.2) { uiTimer = 0; renderUI(); }
  saveTimer += dt;
  if (saveTimer >= 5) { saveTimer = 0; save(); }
  requestAnimationFrame(frame);
}

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* 登録できなくてもゲームは遊べる */ });
}

initRuntime();
renderUI();
requestAnimationFrame(frame);
if (!S.seenHelp) openHelp();
