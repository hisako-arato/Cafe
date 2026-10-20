'use strict';

// ===== 定数 =====
const SAVE_KEY = 'eikyu-cafe-save-v1';
const CONTRACT_SEC = 300;   // アルバイトの契約期間（秒）
const PATIENCE_SEC = 45;    // お客さんが料理を待てる時間（秒）
const EAT_SEC = 4;          // 食事にかかる時間（秒）
const CUST_SPEED = 22;      // お客さんの歩く速さ（%/秒）
const CHEAPEST_RATE = 0.8;  // お客さんが一番安い料理を頼む確率
const MAX_STOVES = 8;        // 全ランクを通しての上限
const MAX_TABLES = 12;
// 体力：★1つにつき1連勤（1日働ける分）。★3でおよそ3連勤、★5でおよそ5連勤。店長は無限
const SHIFT_SEC = 24 * 3600;
const REST_RATE = 10;        // 休憩中は減る速さの10倍で回復
const CHEER_SEC = 3600;      // 激励で1時間分回復
const DRINK_SEC = SHIFT_SEC; // エナジードリンクで1日分回復

// 店舗ランク：上げるとコンロ・テーブル・スタッフ・設備強化の上限が増える
const RANKS = [
// スタッフの上限は店長を含む人数。正社員の条件は、ひとつ前のランクの上限に収まる人数にしてある
  { name: '屋台',             icon: '🛖', stoves: 2, tables: 3,  staff: 3 },
  { name: '喫茶店',           icon: '☕', stoves: 3, tables: 4,  staff: 4,  cost: 600,   need: { level: 3,  served: 40,   perm: 1 } },
  { name: 'カフェ',           icon: '🏠', stoves: 4, tables: 6,  staff: 6,  cost: 2500,  need: { level: 6,  served: 180,  perm: 2 } },
  { name: '人気カフェ',       icon: '🏡', stoves: 5, tables: 8,  staff: 7,  cost: 8000,  need: { level: 10, served: 500,  perm: 4 } },
  { name: '有名店',           icon: '🏛️', stoves: 6, tables: 10, staff: 9,  cost: 25000, need: { level: 15, served: 1200, perm: 5 } },
  { name: '2階席のある名店', icon: '🏰', stoves: 8, tables: 12, staff: 11, cost: 70000, need: { level: 20, served: 3000, perm: 7 } },
];

// 設備強化（上限は店舗ランク + 1、最大 Lv6）
const UPGRADES = {
  stove: { name: 'コンロ強化',   icon: '♨️', base: 300, desc: lv => `調理速度 +${lv * 15}%・1回にできる量 +${lv}人前` },
  table: { name: 'テーブル強化', icon: '🪑', base: 250, desc: lv => `代金 +${lv * 10}%・お客さんが待てる時間 +${lv * 10}%` },
};

const POSTS = { any: '両方', hall: 'ホール', kitchen: '厨房' };

const DISHES = [
  { id: 'coffee',  name: 'コーヒー',       emoji: '☕', time: 5,   cost: 5,   servings: 4, price: 12, xp: 1,  level: 1 },
  { id: 'toast',   name: 'トースト',       emoji: '🍞', time: 15,  cost: 12,  servings: 5, price: 16, xp: 2,  level: 1 },
  { id: 'curry',   name: 'カレーライス',   emoji: '🍛', time: 40,  cost: 35,  servings: 6, price: 28, xp: 5,  level: 2 },
  { id: 'omurice', name: 'オムライス',     emoji: '🍳', time: 60,  cost: 55,  servings: 6, price: 38, xp: 7,  level: 3 },
  { id: 'pasta',   name: 'ナポリタン',     emoji: '🍝', time: 90,  cost: 80,  servings: 7, price: 45, xp: 10, level: 4 },
  { id: 'cake',    name: 'ショートケーキ', emoji: '🍰', time: 150, cost: 130, servings: 8, price: 66, xp: 15, level: 5 },
  { id: 'steak',   name: 'ステーキ',       emoji: '🥩', time: 180, cost: 200, servings: 8, price: 90, xp: 22, level: 7 },
  // ここから下は引き抜き作戦（街のお店）で閃くレシピ
  { id: 'croissant', name: 'クロワッサン',     emoji: '🥐', time: 20,  cost: 18,  servings: 7,  price: 26,  xp: 3,  secret: true },
  { id: 'teishoku',  name: '生姜焼き定食',     emoji: '🍱', time: 45,  cost: 40,  servings: 7,  price: 44,  xp: 6,  secret: true },
  { id: 'burger',    name: 'ハンバーガー',     emoji: '🍔', time: 25,  cost: 35,  servings: 12, price: 30,  xp: 5,  secret: true },
  { id: 'hamburg',   name: 'デミグラスハンバーグ', emoji: '🍖', time: 80, cost: 75, servings: 8, price: 70,  xp: 11, secret: true },
  { id: 'parfait',   name: '季節のパフェ',     emoji: '🍨', time: 70,  cost: 70,  servings: 9,  price: 68,  xp: 12, secret: true },
  { id: 'sushi',     name: '特上にぎり',       emoji: '🍣', time: 120, cost: 160, servings: 8,  price: 125, xp: 20, secret: true },
  { id: 'pizza',     name: 'マルゲリータ',     emoji: '🍕', time: 100, cost: 120, servings: 12, price: 90,  xp: 18, secret: true },
  { id: 'bouilla',   name: 'ブイヤベース',     emoji: '🥘', time: 160, cost: 260, servings: 8,  price: 170, xp: 28, secret: true },
  { id: 'course',    name: '三ツ星のフルコース', emoji: '🦞', time: 240, cost: 420, servings: 8, price: 300, xp: 45, secret: true },
  // ボスの店の固有レシピ
  { id: 'siphon',      name: '漆黒のサイフォンコーヒー', emoji: '🖤', time: 30,  cost: 40,  servings: 12, price: 60,  xp: 10, secret: true, boss: true },
  { id: 'bigburger',   name: '伝説のトリプルバーガー',   emoji: '👑', time: 60,  cost: 110, servings: 14, price: 95,  xp: 18, secret: true, boss: true },
  { id: 'omakase',     name: '大将のおまかせ握り',       emoji: '🎏', time: 150, cost: 260, servings: 10, price: 210, xp: 34, secret: true, boss: true },
  { id: 'souffle',     name: '幻のスフレ',               emoji: '🌠', time: 120, cost: 220, servings: 12, price: 190, xp: 32, secret: true, boss: true },
  { id: 'grandcourse', name: '太陽のグランコース',       emoji: '🌞', time: 300, cost: 700, servings: 10, price: 520, xp: 70, secret: true, boss: true },
];
const DISH = Object.fromEntries(DISHES.map(d => [d.id, d]));
const canCook = d => d.secret ? S.recipes.includes(d.id) : S.level >= d.level;

const DECOR = [
  { id: 'plant',      name: '観葉植物',           emoji: '🪴', price: 80,   pop: 1 },
  { id: 'lamp',       name: 'おしゃれなランプ',   emoji: '💡', price: 200,  pop: 3 },
  { id: 'painting',   name: '絵画',               emoji: '🖼️', price: 450,  pop: 6 },
  { id: 'jukebox',    name: 'レコードプレーヤー', emoji: '📻', price: 900,  pop: 10 },
  { id: 'chandelier', name: 'シャンデリア',       emoji: '✨', price: 2000, pop: 18 },
];

const NATIONS = {
  de: { flag: '🇩🇪', name: 'ドイツ',
    m: ['ルーカス', 'レオン', 'フェリックス', 'マクシミリアン', 'ヨナス', 'パウル', 'ルートヴィヒ', 'エリアス'],
    f: ['ハンナ', 'レナ', 'クララ', 'ミア', 'エマ', 'ゾフィー', 'リーナ', 'グレタ'] },
  it: { flag: '🇮🇹', name: 'イタリア',
    m: ['ロレンツォ', 'マッテオ', 'レオナルド', 'アレッサンドロ', 'ジョヴァンニ', 'ダンテ', 'フランチェスコ'],
    f: ['ジュリア', 'ソフィア', 'キアラ', 'フランチェスカ', 'ビアンカ', 'アウローラ', 'ベアトリーチェ'] },
  gb: { flag: '🇬🇧', name: 'イギリス',
    m: ['オリバー', 'ジョージ', 'アーサー', 'ハリー', 'エドワード', 'ウィリアム', 'セオドア'],
    f: ['アメリア', 'シャーロット', 'イザベラ', 'エミリー', 'グレース', 'アリス', 'フローレンス'] },
  pl: { flag: '🇵🇱', name: 'ポーランド',
    m: ['ヤクプ', 'カツペル', 'フィリプ', 'シモン', 'ミコワイ', 'アントニ', 'ヴォイチェフ'],
    f: ['ズザンナ', 'ユリア', 'ゾフィア', 'マヤ', 'アレクサンドラ', 'アガタ', 'オリヴィア'] },
};

// 床の座標はすべて % 単位（人物は足元の位置）。
// 縦方向は床の縦横比で変わるので、レイアウトは computeLayout() で計算する。
const L = { r: 0.9, ver: 0 };

// 主人公の髪（美容院で変えられる）。髪型にも系統があり、セット効果に数える
const HAIR_STYLES = {
  long: { name: 'ロング', style: 'elegant' }, twin: { name: 'ツインテール', style: 'cute' },
  pony: { name: 'ポニーテール', style: 'casual' }, bob: { name: 'ボブ', style: 'cool' },
};
const HAIR_COLORS = {
  pink: { name: 'ピンク', c: '#f59ac0', c2: '#fde4ef' }, blonde: { name: '金髪', c: '#f6d66b', c2: '#fff4c2' },
  silver: { name: '銀髪', c: '#d9dbe8', c2: '#ffffff' }, black: { name: '黒髪', c: '#2a2238', c2: '#5b4a78' },
  aqua: { name: '水色', c: '#7dd3fc', c2: '#e0f6ff' }, purple: { name: '紫', c: '#a78bfa', c2: '#ede9fe' },
  red: { name: '赤', c: '#ef4444', c2: '#fecaca' },
};
function protagLook(w = S.wardrobe) {
  const h = w.hair;
  return { ...Chara.OWNER_LOOK, style: h.style, hair: HAIR_COLORS[h.color].c, hair2: HAIR_COLORS[h.color].c2 };
}

// ===== 状態 =====
function newGame() {
  const wardrobe = { owned: ['maid'], eq: { body: 'maid', head: null, face: null, item: null }, hair: { style: 'long', color: 'pink' } };
  return {
    money: 150,
    level: 1,
    xp: 0,
    contracts: 1,
    contractsBought: 0,
    rank: 0,
    up: { stove: 0, table: 0 },
    stoves: [newStove(), newStove()],
    tableCount: 2,
    decor: {},
    counter: [],
    staff: [{ id: 1, name: '店長', g: 'f', nation: null, look: protagLook(wardrobe),
      stars: 3, type: 'perm', expireAt: 0, owner: true, post: 'any' }],
    nextId: 2,
    stats: { served: 0, hired: 0, promoted: 0 },
    seenHelp: false,
    savedAt: Date.now(),
    recipes: [],
    wardrobe,
    town: null,
    battles: [],
    spy: null,
    drinks: 0,
    layout: null,
  };
}

function newStove() {
  return { dish: null, progress: 0, duration: 0, cook: null };
}

let S = load();
let tables = [];
let customers = [];
let spawnTimer = 3;
let uid = 1;

function load() {
  let s = newGame();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      s = Object.assign(newGame(), data);
      // 店舗ランク導入前のデータは、今の設備が収まるランクから始める
      if (data.rank == null) s.rank = fitRank(s);
    }
  } catch (e) { /* 保存データが読めなくても新規で始める */ }
  return migrate(s);
}

function fitRank(s) {
  const i = RANKS.findIndex(r => r.stoves >= s.stoves.length && r.tables >= s.tableCount && r.staff >= s.staff.length);
  return i < 0 ? RANKS.length - 1 : i;
}

// 古い保存データを今の形にそろえる
function migrate(s) {
  if (!s.wardrobe.hair) s.wardrobe.hair = { style: 'long', color: 'pink' };
  s.up = Object.assign({ stove: 0, table: 0 }, s.up);
  const now = Date.now();
  s.stoves = s.stoves.map(st => {
    if ('duration' in st) return st;
    if (!st.dish) return newStove();
    const duration = DISH[st.dish].time * 1000;
    return { dish: st.dish, progress: Math.min(duration, now - st.start), duration, cook: null };
  });
  for (const m of s.staff) {
    if (!m.post) m.post = 'any';
    if (!m.owner && !Number.isFinite(m.hp)) { m.hp = m.stars * SHIFT_SEC; m.rest = false; }
    // 主人公（店長）はいつも最新の見た目で
    if (m.owner) { m.look = protagLook(s.wardrobe); m.g = 'f'; continue; }
    // 勝負に出ていない人が出かけたままになっていたら戻す
    if (m.away && !(s.battles || []).some(b => b.members.includes(m.id))) m.away = null;
    if (m.look) continue;
    if (m.owner) continue;
    const p = randomPerson();
    Object.assign(m, { name: p.name, g: p.g, nation: p.nation, look: p.look });
  }
  return s;
}

function save() {
  S.savedAt = Date.now();
  const data = {
    ...S,
    staff: S.staff.map(({ id, name, g, nation, look, stars, type, expireAt, owner, post, away, title, from, boss, hp, rest, abuse }) =>
      ({ id, name, g, nation, look, stars, type, expireAt, owner, post, away: away === 'battle' ? away : null, title, from, boss, hp, rest, abuse })),
  };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) { /* 保存できない環境では無視 */ }
}

// 閉じていた間の進み具合を反映し、「おかえりなさい」用の報告を返す
// 留守中も、カウンターの料理と調理中の料理がある間は営業する。
// 営業しているあいだスタッフの体力は減り、店を閉めている時間は休憩として回復する
function applyOffline(resume = false) {
  const now = Date.now();
  const since = Math.min(now, S.savedAt || now);
  const total = (now - since) / 1000;
  const rep = { away: now - since, done: [], idle: [], quit: [], parts: [], town: [], tired: [],
    served: 0, sales: 0, soldOut: false };
  if (S.spy && !resume) {
    const st = S.town && S.town.stores.find(x => x.id === S.spy.storeId);
    if (st) st.alertAt = since;
    rep.town.push({ text: `🕵️ 店長は「${st ? st.name : '潜入先'}」から無事に帰ってきました`, kind: '' });
    S.spy = null;
  }
  const o = S.staff.find(x => x.owner);
  if (o && !resume) o.away = null;
  for (const b of S.battles) {
    const sec = Math.max(0, (Math.min(now, b.until) - since) / 1000);
    for (const id of b.members) { const m = S.staff.find(x => x.id === id); if (m) tickStamina(m, sec); }
  }
  resolveBattles(rep.town);
  if (total < 1) return rep;

  const start = since;
  const level0 = S.level, contracts0 = S.contracts;
  const progressed = new Set();
  const custPerMin = Math.min(60 / spawnInterval(), S.tableCount * 60 / (EAT_SEC + 20));
  let acc = 0, xp = 0;
  for (let t = 0; t < total; t += 60) {
    const dt = Math.min(60, total - t);
    const at = start + (t + dt) * 1000;
    // アルバイトの契約満了
    for (const s of [...S.staff]) {
      if (s.type !== 'part' || s.expireAt > at) continue;
      rep.quit.push(displayName(s));
      S.stoves.forEach(st => { if (st.cook === s.id) st.cook = null; });
      S.staff.splice(S.staff.indexOf(s), 1);
    }
    const open = S.counter.length > 0 || S.stoves.some(st => st.dish && st.progress < st.duration);
    const busy = new Set();
    // 調理：担当がいなければ、手の空いた人（持ち場がホール以外）が代わりに入る
    S.stoves.forEach((st, i) => {
      if (!st.dish || st.progress >= st.duration) return;
      let cook = S.staff.find(s => s.id === st.cook);
      if (!cook || !onDuty(cook) || busy.has(cook)) {
        cook = S.staff.find(s => onDuty(s) && s.post !== 'hall' && !busy.has(s));
        st.cook = cook ? cook.id : null;
      }
      if (!cook) return;
      busy.add(cook);
      progressed.add(i);
      st.progress = Math.min(st.duration, st.progress + dt * 1000 * cookRate(cook));
      if (st.progress >= st.duration) {
        const d = DISH[st.dish], n = servingsOf(d);
        addToCounter(d.id, n);
        xp += d.xp;
        rep.done.push({ i, dish: d.id, cook: displayName(cook), n });
        Object.assign(st, newStove());
      }
    });
    // 接客：カウンターに料理がある間、お客さんが来て食べていく
    const hall = S.staff.filter(s => onDuty(s) && s.post !== 'kitchen' && !busy.has(s));
    let served = 0;
    if (hall.length && S.counter.length) {
      acc += Math.min(custPerMin, hall.length * 4) * dt / 60;
      while (acc >= 1 && S.counter.length) {
        const dish = takeServing();
        const pay = payFor(dish);
        S.money += pay;
        S.stats.served++;
        rep.served++;
        rep.sales += pay;
        xp++;
        served++;
        acc--;
      }
      if (!S.counter.length) { acc = 0; rep.soldOut = true; }
    }
    // 体力：営業中は減り、閉店中は休んで回復する
    for (const s of S.staff) {
      if (s.owner || s.away) continue;
      if (!open && !s.rest) { s.hp = Math.min(maxHp(s), hpOf(s) + REST_RATE * dt); continue; }
      const r = tickStamina(s, dt);
      if (r === 'out') {
        S.stoves.forEach(st => { if (st.cook === s.id) st.cook = null; });
        s.hp = 0; s.rest = true;
      } else if (r === 'back') {
        s.rest = false;
      }
    }
  }
  quietToasts = true;
  if (xp) addXp(xp);
  quietToasts = false;
  if (S.level > level0) rep.level = [level0, S.level, S.contracts - contracts0];
  S.stoves.forEach((st, i) => { if (st.dish && st.progress < st.duration && !progressed.has(i)) rep.idle.push({ i, dish: st.dish }); });
  for (const s of S.staff) {
    if (s.rest && !s.away) rep.tired.push({ name: displayName(s), left: restLeft(s) });
    if (s.type === 'part') rep.parts.push({ name: displayName(s), left: (s.expireAt - now) / 1000 });
  }
  return rep;
}

function initRuntime() {
  tables = [];
  for (let i = 0; i < S.tableCount; i++) tables.push({ state: 'free', cust: null, cleaner: null });
  customers = [];
  S.staff.forEach((s, i) => {
    const h = homeOf(s, i);
    s.x = h.x; s.y = h.y; s.task = null;
    // 休憩中の人は休憩室の中にいる
    s.inRoom = !!s.rest;
  });
  S.stoves.forEach((st, i) => {
    const cook = st.cook != null && S.staff.find(s => s.id === st.cook);
    if (!cook || cook.task || !onDuty(cook)) { st.cook = null; return; }
    const p = stovePos(i);
    cook.x = p.x; cook.y = p.y;
    cook.task = { type: 'cook', stove: i, phase: 'work' };
  });
}

// ===== 計算 =====
const popularity = () => DECOR.reduce((sum, d) => sum + (S.decor[d.id] || 0) * d.pop, 0);
const rankOf = () => RANKS[S.rank];
const staffCap = () => rankOf().staff;
const stoveCap = () => rankOf().stoves;
const tableCap = () => rankOf().tables;
const upMax = () => Math.min(6, S.rank + 1);
const upPrice = k => Math.round(UPGRADES[k].base * Math.pow(2.2, S.up[k]));
const permCount = () => S.staff.filter(s => s.type === 'perm' && !s.owner).length;
const servingsOf = d => d.servings + S.up.stove;
const patienceSec = () => PATIENCE_SEC * (1 + S.up.table * 0.1);
const xpNeeded = l => Math.round(12 * Math.pow(l, 1.5));
const spawnInterval = () => Math.max(2, 8 - popularity() * 0.06 - S.level * 0.15);
const speedOf = s => 14 + s.stars * 5;
const cleanTime = s => 2.4 - s.stars * 0.3;
const cookRate = s => (0.8 + (s.stars - 1) * 0.1) * (1 + S.up.stove * 0.15);
const scoutFee = stars => 20 + stars * stars * 15;
const stovePrice = () => Math.round(150 * Math.pow(2, S.stoves.length - 2));
const tablePrice = () => Math.round(120 * Math.pow(1.7, S.tableCount - 2));
const decorPrice = d => Math.round(d.price * Math.pow(1.25, S.decor[d.id] || 0));
const contractPrice = () => Math.round(1000 * Math.pow(1.6, S.contractsBought));
// 永久雇用契約はレベル2つごとに1枚もらえる
const contractAtLevel = lv => lv % 2 === 0;
const payFor = dishId => Math.round(DISH[dishId].price * (1 + popularity() * 0.01) * (1 + S.up.table * 0.1));
// ===== 体力 =====
const maxHp = s => s.stars * SHIFT_SEC;
const hpOf = s => s.owner ? Infinity : Number.isFinite(s.hp) ? s.hp : maxHp(s);
const onDuty = s => !s.away && !s.rest;
const drinkPrice = () => 200 * (S.rank + 1);
const days = sec => (sec / SHIFT_SEC).toFixed(1);
// 休憩中の人は体力が満タンになると職場に戻る
const restLeft = s => Math.max(0, (maxHp(s) - hpOf(s)) / REST_RATE);

function exhaust(s) {
  cancelTaskOf(s);
  s.hp = 0;
  s.rest = true;
  s.inRoom = false;
}
function backToWork(s, msg) {
  s.rest = false;
  if (s.inRoom) { s.x = L.rest.x; s.y = L.rest.y; }
  s.inRoom = false;
  if (msg) addLog(msg);
}
// 体力の増減（店長は減らない）
function tickStamina(s, dt) {
  if (s.owner) return;
  // 料理勝負に出ている間も、働いているときと同じように減る（尽きたら帰ってから休む）
  if (s.away === 'battle') { s.hp = Math.max(0, hpOf(s) - dt); return; }
  if (s.away) return;
  if (!Number.isFinite(s.hp)) s.hp = maxHp(s);
  if (s.rest) {
    s.hp = Math.min(maxHp(s), s.hp + REST_RATE * dt);
    if (s.hp >= maxHp(s)) return 'back';
  } else {
    s.hp -= dt;
    if (s.hp <= 0) return 'out';
  }
}

const roleOf = s => s.owner ? 'owner' : s.type;
const displayName = p => p.owner ? p.name : p.name + 'さん';

// 横幅に対する % を、縦の % に直す
const u = v => v / L.r;

function computeLayout() {
  const el = document.getElementById('floor');
  const w = el.clientWidth, h = el.clientHeight;
  if (w && h) L.r = h / w;
  const log = el.querySelector('.log-window');
  const logTop = log && h ? log.offsetTop / h * 100 : 86;
  const cols = L.r >= 1.15 ? 3 : 4;
  const xs = cols === 3 ? [18, 50, 82] : [14, 38, 62, 86];
  const rows = Math.max(1, Math.ceil(S.tableCount / cols));
  const top = L.r >= 1.15 ? u(63) : u(56);
  const bottom = Math.max(top, logTop - u(7));
  const gap = rows > 1 ? (bottom - top) / (rows - 1) : 0;
  L.tables = Array.from({ length: MAX_TABLES }, (_, i) => ({ x: xs[i % cols], y: top + Math.floor(i / cols) * gap }));
  // 客席の下端（メッセージウィンドウの上）。配置の編集はこの範囲に収める
  L.hallBottomV = Math.max(60, logTop * L.r - 6);
  // コンロ（足元＝下端の中央）。奥の壁ぎわに並べる
  const sc = stoveCols();
  L.stoves = Array.from({ length: MAX_STOVES }, (_, i) =>
    ({ x: 58 + 39 * ((i % sc) + 0.5) / sc, y: u(24.5 + Math.floor(i / sc) * 5.5) }));
  L.plants = [[74, 50], [26, 50], [97, 60], [96, 99 * L.r - 15]].map(([x, v]) => ({ x, y: u(v) }));
  L.jukebox = { x: 4.5, y: u(50) };
  // 自分で動かした配置で上書きする
  const lay = S.layout;
  if (lay) {
    const put = (kind, list) => (lay[kind] || []).forEach((p, i) => { if (p && list[i]) list[i] = toFloor(kind, p); });
    put('tables', L.tables);
    put('stoves', L.stoves);
    put('plants', L.plants);
    if (lay.jukebox) L.jukebox = toFloor('jukebox', lay.jukebox);
  }
  // 列の間隔が狭いときは人物・テーブルを縮める
  L.s = rows > 1 ? Math.max(0.62, Math.min(1, gap / u(19))) : 1;
  el.style.setProperty('--s', L.s);
  // 奥が厨房（スタッフ）、カウンターをはさんで手前が客席。行き来は右端のスタッフ出入口から
  L.counter = { x: 40, y: u(36) };
  L.gateK = { x: 87, y: u(36) };
  L.gateH = { x: 87, y: u(46) };
  L.door = { x: 95, y: 99 };
  L.rest = { x: 22.5, y: u(20) };   // 休憩室の扉の前
  el.style.setProperty('--counter-z', 10 + Math.round(u(41)));
  L.ver++;
}

// ===== 配置の編集 =====
// 保存する位置は x：横幅の%、v：横幅を基準にした縦の位置（cqw）。画面の縦横比が変わっても形が崩れない
const LAYOUT_RANGE = {
  tables:  () => ({ x1: 13, x2: 87, v1: 56, v2: L.hallBottomV }),
  stoves:  () => ({ x1: 6, x2: 94, v1: 24, v2: 30 }),
  plants:  () => ({ x1: 3, x2: 97, v1: 50, v2: L.hallBottomV + 6 }),
  jukebox: () => ({ x1: 3, x2: 97, v1: 50, v2: L.hallBottomV + 6 }),
};
// ぶつかったとみなす距離（テーブル同士・コンロ同士）
const LAYOUT_GAP = { tables: { x: 20, v: 13 }, stoves: { x: 10.5, v: 6 } };
function clampLayout(kind, p) {
  const r = LAYOUT_RANGE[kind]();
  const lim = (n, a, b) => Math.max(a, Math.min(b, n));
  return { x: lim(p.x, r.x1, r.x2), v: lim(p.v, r.v1, Math.max(r.v1, r.v2)) };
}
function toFloor(kind, p) {
  const c = clampLayout(kind, p);
  return { x: c.x, y: u(c.v) };
}
const fromFloor = p => ({ x: p.x, v: p.y * L.r });
const layoutCount = kind => kind === 'tables' ? S.tableCount : kind === 'stoves' ? S.stoves.length
  : kind === 'plants' ? Math.min(4, S.decor.plant || 0) : (S.decor.jukebox ? 1 : 0);
function layoutHits(kind, i, p) {
  const g = LAYOUT_GAP[kind];
  if (!g) return false;
  const list = kind === 'tables' ? L.tables : L.stoves;
  for (let j = 0; j < layoutCount(kind); j++) {
    if (j === i) continue;
    const q = fromFloor(list[j]);
    if (Math.abs(q.x - p.x) < g.x && Math.abs(q.v - p.v) < g.v) return true;
  }
  return false;
}
// いまの見た目の配置を、そのまま保存用の形にする（初めて編集するとき）
function snapshotLayout() {
  const pick = (list, n) => list.slice(0, n).map(fromFloor);
  return { tables: pick(L.tables, S.tableCount), stoves: pick(L.stoves, S.stoves.length),
    plants: pick(L.plants, 4), jukebox: fromFloor(L.jukebox) };
}
// テーブルやコンロを買い足したとき、自分で配置していれば空いている場所に置く
function placeNew(kind, i) {
  if (!S.layout) return;
  const r = LAYOUT_RANGE[kind]();
  for (let v = r.v1; v <= r.v2; v += 3) {
    for (let x = r.x1; x <= r.x2; x += 4) {
      if (!layoutHits(kind, i, { x, v })) { S.layout[kind][i] = { x, v }; computeLayout(); return; }
    }
  }
}
const seatPos = ti => ({ x: L.tables[ti].x - 9 * L.s, y: L.tables[ti].y + u(3) * L.s });
const standPos = ti => ({ x: L.tables[ti].x + 9 * L.s, y: L.tables[ti].y + u(3) * L.s });
const stoveCols = () => S.stoves.length > 6 ? 4 : 3;
// 調理する人が立つ場所（コンロの奥。コンロが手前に重なって見える）
function stovePos(i) {
  const k = L.stoves[i];
  return { x: k.x, y: k.y - u(2) };
}
function homeOf(s, idx) {
  const i = idx ?? S.staff.indexOf(s);
  return { x: 5 + (i % 8) * 6.5, y: u(36 - Math.floor(i / 8) * 4.5) };
}

computeLayout();

function stoveInfo(i) {
  const st = S.stoves[i];
  if (!st.dish) return { kind: 'idle' };
  if (st.progress >= st.duration) return { kind: 'ready' };
  const cook = st.cook != null ? S.staff.find(s => s.id === st.cook) : null;
  const working = !!cook && cook.task?.type === 'cook' && cook.task.stove === i && cook.task.phase === 'work';
  return {
    kind: working ? 'cooking' : 'waiting',
    cook,
    ratio: st.progress / st.duration,
    left: (st.duration - st.progress) / 1000 / (cook ? cookRate(cook) : 1),
  };
}

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
const yen = n => '¥' + n.toLocaleString('ja-JP');
const starStr = n => '★'.repeat(n) + '☆'.repeat(5 - n);
function fmtTime(sec) {
  sec = Math.max(0, Math.ceil(sec));
  if (sec < 60) return `${sec}秒`;
  if (sec >= 3600) {
    const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60);
    return m ? `${h}時間${m}分` : `${h}時間`;
  }
  const m = Math.floor(sec / 60), s = sec % 60;
  return s ? `${m}分${s}秒` : `${m}分`;
}
// 野良のお客さんは★1〜2が中心（まれに★3）。強い人材は引き抜き作戦で
function rollStars() {
  const r = Math.random();
  if (r < 0.62) return 1;
  if (r < 0.95) return 2;
  return 3;
}
function randomPerson() {
  const nation = rand(Object.keys(NATIONS));
  const g = Math.random() < 0.5 ? 'm' : 'f';
  return { nation, g, name: rand(NATIONS[nation][g]), look: Chara.randomLook(g) };
}

// ===== カウンター =====
function addToCounter(dishId, n) {
  const st = S.counter.find(c => c.dish === dishId);
  if (st) st.n += n; else S.counter.push({ dish: dishId, n });
}
function takeServing() {
  if (!S.counter.length) return null;
  // お客さんは基本的に安い料理から頼む（たまに別の料理も頼む）
  const byPrice = [...S.counter].sort((a, b) => DISH[a.dish].price - DISH[b.dish].price);
  const st = Math.random() < CHEAPEST_RATE ? byPrice[0] : rand(byPrice);
  st.n--;
  if (st.n <= 0) S.counter.splice(S.counter.indexOf(st), 1);
  return st.dish;
}

// ===== アクション =====
function orderDish(i, dishId) {
  const d = DISH[dishId], st = S.stoves[i];
  if (!d || !st || st.dish || S.level < d.level || S.money < d.cost) return;
  S.money -= d.cost;
  Object.assign(st, { dish: dishId, progress: 0, duration: d.time * 1000, cook: null });
  closeModal();
  save();
}

function collectStove(i) {
  const st = S.stoves[i];
  if (!st || stoveInfo(i).kind !== 'ready') return;
  const d = DISH[st.dish];
  const n = servingsOf(d);
  addToCounter(d.id, n);
  Object.assign(st, newStove());
  toast(`${d.emoji} ${d.name}を${n}人前カウンターに並べました`);
  addXp(d.xp);
  save();
}

function addXp(n) {
  S.xp += n;
  while (S.xp >= xpNeeded(S.level)) {
    S.xp -= xpNeeded(S.level);
    S.level++;
    const gift = contractAtLevel(S.level);
    if (gift) S.contracts++;
    const unlocked = DISHES.filter(d => d.level === S.level).map(d => d.emoji + d.name);
    toast(`🎉 レベル${S.level}になりました！${gift ? ' 永久雇用契約 📜 +1' : ''}`, true);
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
    id: S.nextId++, name: c.name, g: c.g, nation: c.nation, look: c.look, stars: c.stars,
    type: 'part', expireAt: Date.now() + CONTRACT_SEC * 1000, owner: false, post: 'any',
    x: c.x, y: c.y, task: null,
  };
  S.staff.push(s);
  S.stats.hired++;
  toast(`🤝 ${displayName(s)}をアルバイトとして雇いました（契約${fmtTime(CONTRACT_SEC)}）`);
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
  toast(`📜 ${displayName(s)}と永久雇用契約を結びました！ 正社員になりました`, true);
  save();
}

function removeStaff(s, message) {
  cancelTaskOf(s);
  S.staff.splice(S.staff.indexOf(s), 1);
  if (message) toast(message);
  save();
}

function setPost(id, post) {
  const s = S.staff.find(s => s.id === id);
  if (!s || !POSTS[post]) return;
  s.post = post;
  // 持ち場の外の仕事をしていたらやめる（調理の進み具合は残る）
  const k = s.task;
  if (k && ((post === 'hall' && k.type === 'cook') || (post === 'kitchen' && k.type !== 'cook'))) cancelTaskOf(s);
  save();
}

function fire(id) {
  const s = S.staff.find(s => s.id === id);
  if (!s || s.owner) return;
  removeStaff(s, `👋 ${displayName(s)}が退職しました`);
  closeModal();
}

function rankNeeds() {
  const next = RANKS[S.rank + 1];
  if (!next) return [];
  const n = next.need;
  return [
    { label: `レベル ${n.level} 以上`, ok: S.level >= n.level, now: `Lv${S.level}` },
    { label: `接客 ${n.served.toLocaleString('ja-JP')}人`, ok: S.stats.served >= n.served, now: `${S.stats.served.toLocaleString('ja-JP')}人` },
    { label: `正社員 ${n.perm}人`, ok: permCount() >= n.perm, now: `${permCount()}人` },
  ];
}

function rankUp() {
  const next = RANKS[S.rank + 1];
  if (!next || S.money < next.cost || !rankNeeds().every(r => r.ok)) return;
  S.money -= next.cost;
  S.rank++;
  toast(`${next.icon} お店が「${next.name}」にランクアップしました！`, true);
  toast(`コンロ ${next.stoves}台・テーブル ${next.tables}卓・スタッフ ${next.staff}人・強化 Lv${upMax()} まで広げられます`);
  save();
}

function upgrade(k) {
  const p = upPrice(k);
  if (!UPGRADES[k] || S.up[k] >= upMax() || S.money < p) return;
  S.money -= p;
  S.up[k]++;
  toast(`${UPGRADES[k].icon} ${UPGRADES[k].name}が Lv${S.up[k]} になりました（${UPGRADES[k].desc(S.up[k])}）`);
  save();
}

function buy(kind, id) {
  if (kind === 'stove') {
    const p = stovePrice();
    if (S.stoves.length >= stoveCap() || S.money < p) return;
    S.money -= p;
    S.stoves.push(newStove());
    computeLayout();
    placeNew('stoves', S.stoves.length - 1);
    toast('🔥 コンロを増やしました');
  } else if (kind === 'table') {
    const p = tablePrice();
    if (S.tableCount >= tableCap() || S.money < p) return;
    S.money -= p;
    S.tableCount++;
    tables.push({ state: 'free', cust: null, cleaner: null });
    computeLayout();
    placeNew('tables', S.tableCount - 1);
    toast('🪑 テーブルを増やしました');
  } else if (kind === 'decor') {
    const d = DECOR.find(d => d.id === id);
    const p = decorPrice(d);
    if (!d || S.money < p) return;
    S.money -= p;
    S.decor[d.id] = (S.decor[d.id] || 0) + 1;
    toast(`${d.emoji} ${d.name}を飾りました（人気度 +${d.pop}）`);
  } else if (kind === 'drink') {
    if (S.money < drinkPrice()) return;
    S.money -= drinkPrice();
    S.drinks = (S.drinks || 0) + 1;
    toast(`🥤 エナジードリンクを買いました（所持 ${S.drinks}本）`);
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
  computeLayout();
  initRuntime();
  for (const el of floorEls.values()) el.remove();
  floorEls.clear();
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
  if (d <= step || d < 1e-6) { o.x = p.x; o.y = p.y; o.moving = false; return true; }
  o.x += dx / d * step;
  o.y += dy / d * step;
  o.moving = true;
  return false;
}

// 厨房と客席をまたぐときはスタッフ出入口を通る
const zoneOf = y => y <= L.gateK.y + 0.01 ? 0 : y >= L.gateH.y - 0.01 ? 2 : 1;
function walkTo(o, p, step) {
  const zo = zoneOf(o.y), zp = zoneOf(p.y) === 0 ? 0 : 2;
  if (zo === zp) return moveTo(o, p, step);
  const near = zp === 0 ? L.gateK : L.gateH, back = zp === 0 ? L.gateH : L.gateK;
  // 出入口の手前まで来たら、扉を抜けて反対側へ
  const via = zo === 1 || (o.x === back.x && o.y === back.y) ? near : back;
  moveTo(o, via, step);
  return false;
}

function spawnCustomer() {
  const ti = tables.findIndex(t => t.state === 'free');
  if (ti < 0) return false;
  const c = {
    id: uid++, ...randomPerson(), stars: rollStars(),
    x: L.door.x, y: L.door.y, table: ti, state: 'in',
    patience: patienceSec(), maxPatience: patienceSec(), server: null, dish: null, eat: 0, flip: true,
  };
  tables[ti].state = 'occupied';
  tables[ti].cust = c.id;
  customers.push(c);
  addLog(`🚪 ${NATIONS[c.nation].flag} ${displayName(c)}が来店しました${c.stars >= 4 ? '（✨ 仕事ができそう！）' : ''}`);
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
  } else if (k.type === 'cook') {
    const st = S.stoves[k.stove];
    if (st && st.cook === s.id) st.cook = null;
  } else if (k.type === 'clean') {
    if (tables[k.table]) tables[k.table].cleaner = null;
  }
  s.task = null;
}

// 持ち場（ホール／厨房／両方）の範囲で、配膳 → 調理 → 片付け の順に仕事を探す
function findTask(s) {
  const post = s.post || 'any';
  if (post !== 'kitchen' && S.counter.length) {
    const c = customers
      .filter(c => c.state === 'wait' && !c.server)
      .sort((a, b) => a.patience - b.patience)[0];
    if (c) {
      s.task = { type: 'serve', cid: c.id, dish: takeServing(), phase: 'counter' };
      c.server = s.id;
      return;
    }
  }
  const si = post === 'hall' ? -1 : S.stoves.findIndex(st => st.dish && st.cook == null && st.progress < st.duration);
  if (si >= 0) {
    S.stoves[si].cook = s.id;
    s.task = { type: 'cook', stove: si, phase: 'go' };
    return;
  }
  const ti = post === 'kitchen' ? -1 : tables.findIndex(t => t.state === 'dirty' && !t.cleaner);
  if (ti >= 0) {
    tables[ti].cleaner = s.id;
    s.task = { type: 'clean', table: ti, phase: 'go', t: 0 };
  }
}

function update(dt) {
  const now = Date.now();

  for (const s of [...S.staff]) {
    if (s.type === 'part' && now >= s.expireAt) {
      removeStaff(s, `⌛ アルバイトの${displayName(s)}が契約満了で辞めてしまいました`);
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
          floatText('💢', c.x, c.y - 16, true);
          toast(`😠 ${displayName(c)}が待ちきれずに帰ってしまいました`);
        }
      }
    } else if (c.state === 'eat') {
      c.eat -= dt;
      if (c.eat <= 0) {
        const pay = payFor(c.dish);
        S.money += pay;
        S.stats.served++;
        floatText('+' + yen(pay), c.x, c.y - 16);
        addLog(`💰 ${displayName(c)}が${DISH[c.dish].emoji}${DISH[c.dish].name}を食べて ${yen(pay)} 払いました`);
        customerLeave(c, false);
        addXp(1);
      }
    } else if (c.state === 'out') {
      if (moveTo(c, L.door, CUST_SPEED * dt)) c.gone = true;
    }
  }
  customers = customers.filter(c => !c.gone);

  townTick();

  S.staff.forEach((s, i) => {
    if (s.away) {
      tickStamina(s, dt);
      if (s.walkOut && walkTo(s, L.door, speedOf(s) * dt)) s.walkOut = false;
      return;
    }
    if (!Number.isFinite(s.x) || !Number.isFinite(s.y)) {
      const h = homeOf(s, i);
      s.x = h.x; s.y = h.y;
    }
    const tick = tickStamina(s, dt);
    if (tick === 'out') {
      exhaust(s);
      toast(`😪 ${displayName(s)}の体力が尽きました。休憩室で休みます`);
    } else if (tick === 'back') {
      backToWork(s, `☕ ${displayName(s)}が休憩から戻りました`);
    }
    if (s.rest) {
      if (!s.inRoom && walkTo(s, L.rest, speedOf(s) * dt)) s.inRoom = true;
      return;
    }
    if (!s.task) findTask(s);
    const step = speedOf(s) * dt;
    const k = s.task;
    if (!k) {
      if (walkTo(s, homeOf(s, i), step)) s.flip = false;
      return;
    }
    if (k.type === 'serve') {
      const c = customers.find(c => c.id === k.cid);
      if (!c || c.state !== 'wait') { cancelTaskOf(s); return; }
      if (k.phase === 'counter') {
        if (walkTo(s, L.counter, step)) k.phase = 'table';
      } else if (walkTo(s, standPos(c.table), step)) {
        c.state = 'eat';
        c.dish = k.dish;
        c.eat = EAT_SEC;
        c.server = null;
        s.task = null;
      }
    } else if (k.type === 'cook') {
      const st = S.stoves[k.stove];
      if (!st || !st.dish || st.cook !== s.id) { s.task = null; return; }
      if (k.phase === 'go') {
        if (walkTo(s, stovePos(k.stove), step)) { k.phase = 'work'; s.flip = false; }
      } else {
        st.progress = Math.min(st.duration, st.progress + dt * 1000 * cookRate(s));
        if (st.progress >= st.duration) {
          st.cook = null;
          s.task = null;
          toast(`${DISH[st.dish].emoji} ${DISH[st.dish].name}ができあがりました！ タップして並べましょう`);
          save();
        }
      }
    } else if (k.type === 'clean') {
      const t = tables[k.table];
      if (!t || t.state !== 'dirty') { s.task = null; return; }
      if (k.phase === 'go') {
        if (walkTo(s, standPos(k.table), step)) { k.phase = 'work'; k.t = cleanTime(s); }
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

function floorEl(key, cls, html) {
  let el = floorEls.get(key);
  if (!el) {
    el = document.createElement('div');
    el.className = cls;
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

const CHAIR_SVG = `<svg viewBox="0 0 40 52" aria-hidden="true"><g stroke="#2b1d33" stroke-width="2" stroke-linejoin="round">
  <rect x="9" y="38" width="4" height="12" rx="1.5" fill="#5b3a24"/><rect x="27" y="38" width="4" height="12" rx="1.5" fill="#5b3a24"/>
  <rect x="7" y="2" width="26" height="26" rx="9" fill="#7c4a2d"/><rect x="11" y="6" width="18" height="18" rx="6" fill="#c0703c"/>
  <rect x="4" y="28" width="32" height="10" rx="4" fill="#c0703c"/></g></svg>`;

const PERSON_HTML = '<div class="bubble"></div><div class="say"></div><div class="sprite"></div><div class="carry"></div><div class="tag"></div>';

function placePerson(el, p, role) {
  place(el, p.x, p.y);
  el.style.zIndex = 10 + Math.round(p.y);
  el.classList.toggle('flip', !!p.flip);
  el.classList.toggle('walk', !!p.moving);
  // 潜入に出かける店長は身支度した服で歩く
  const outfit = role === 'protag' ? S.wardrobe.eq : null;
  const roleKey = role + (outfit ? JSON.stringify(outfit) : '');
  if (el._role !== roleKey) {
    el._role = roleKey;
    el.querySelector('.sprite').innerHTML = Chara.svg(p.look, role, outfit);
  }
}

function renderFloor() {
  for (const el of floorEls.values()) el._seen = false;

  tables.forEach((t, i) => {
    const el = floorEl('t' + i, 'table', '');
    if (!el._init) { el._init = true; el.dataset.edit = 'tables'; el.dataset.i = i; }
    const chair = floorEl('ch' + i, 'chair', CHAIR_SVG);
    if (el._ver !== L.ver) {
      el._ver = L.ver;
      const p = L.tables[i], sp = seatPos(i);
      place(el, p.x, p.y);
      el.style.zIndex = 10 + Math.round(p.y);
      place(chair, sp.x, sp.y);
      chair.style.zIndex = 9 + Math.round(sp.y);
    }
    const c = t.cust != null ? customers.find(c => c.id === t.cust) : null;
    const content = t.state === 'dirty' ? '🍽️' : (c && c.state === 'eat' ? DISH[c.dish].emoji : '');
    if (el._content !== content) { el._content = content; el.textContent = content; }
    el.classList.toggle('dirty', t.state === 'dirty');
  });

  for (const c of customers) {
    const el = floorEl('c' + c.id, 'person customer' + (c.stars >= 4 ? ' rare' : ''), PERSON_HTML);
    if (!el._init) {
      el._init = true;
      el.dataset.action = 'scout';
      el.dataset.cid = c.id;
    }
    placePerson(el, c, 'customer');
    const bubble = el.querySelector('.bubble');
    let bkey = '';
    if (c.state === 'wait') bkey = c.server ? 'coming' : 'wait';
    else if (c.state === 'eat') bkey = 'eat';
    else if (c.state === 'out' && c.angry) bkey = 'angry';
    if (el._bkey !== bkey) {
      el._bkey = bkey;
      bubble.innerHTML = bkey === 'wait' ? '<span>🍴</span><div class="pbar"><i></i></div>'
        : bkey === 'coming' ? '<span>🎵</span>'
        : bkey === 'eat' ? '<span>😋</span>'
        : bkey === 'angry' ? '<span>💢</span>' : '';
    }
    if (bkey === 'wait') {
      const r = c.patience / c.maxPatience;
      const bar = bubble.querySelector('.pbar');
      bar.classList.toggle('low', r < 0.3);
      bar.firstChild.style.width = (r * 100).toFixed(1) + '%';
    }
  }

  for (const s of S.staff) {
    if ((s.away && !s.walkOut) || s.inRoom) continue;
    const el = floorEl('s' + s.id, 'person staff', PERSON_HTML);
    const role = s.away === 'spy' ? 'protag' : roleOf(s);
    placePerson(el, s, role);
    if (el._tag !== roleOf(s)) {
      el._tag = roleOf(s);
      const tag = el.querySelector('.tag');
      tag.className = 'tag ' + roleOf(s);
      tag.textContent = s.owner ? '店長' : s.type === 'perm' ? '正社員' : 'バイト';
    }
    const k = s.task;
    let carry = '';
    if (k?.type === 'serve' && k.phase === 'table') carry = DISH[k.dish].emoji;
    else if (k?.type === 'clean' && k.phase === 'work') carry = '🧽';
    else if (k?.type === 'cook' && k.phase === 'work') carry = '🍳';
    if (el._carry !== carry) { el._carry = carry; el.querySelector('.carry').textContent = carry; }
    el.classList.toggle('working', !!k && k.phase === 'work');
    const say = s.say && s.say.until > Date.now() ? s.say.text : '';
    if (el._say !== say) { el._say = say; el.querySelector('.say').textContent = say; }
    el.classList.toggle('saying', !!say);
    // 画面の端ではふきだしを内側に寄せる
    el.classList.toggle('say-l', s.x < 25);
    el.classList.toggle('say-r', s.x > 75);
    const b = s.rest ? '😪' : '';
    if (el._sweat !== b) { el._sweat = b; el.querySelector('.bubble').innerHTML = b ? `<span>${b}</span>` : ''; }
  }

  // コンロ（厨房の床に置く。配置の編集で動かせる）
  S.stoves.forEach((st, i) => {
    const el = floorEl('k' + i, 'stove-unit', '');
    if (!el._init) { el._init = true; el.dataset.edit = 'stoves'; el.dataset.i = i; }
    if (el._ver !== L.ver) {
      el._ver = L.ver;
      place(el, L.stoves[i].x, L.stoves[i].y);
      el.style.zIndex = 10 + Math.round(L.stoves[i].y);
    }
    const info = stoveInfo(i);
    const k = info.kind + (st.dish || '');
    if (el._k !== k) {
      el._k = k;
      el.className = 'stove-unit ' + info.kind;
      el.dataset.action = info.kind === 'idle' ? 'pick' : info.kind === 'ready' ? 'collect' : 'screen';
      el.dataset.screen = 'kitchen';
      el.setAttribute('aria-label', `コンロ${i + 1}`);
      el.innerHTML = `<span>${info.kind === 'idle' ? '🔥' : DISH[st.dish].emoji}</span>${info.kind === 'cooking' || info.kind === 'waiting' ? '<i class="fill"></i>' : ''}`;
    }
    if (info.kind === 'cooking' || info.kind === 'waiting') el.querySelector('.fill').style.width = (info.ratio * 100).toFixed(1) + '%';
  });

  for (const [key, el] of floorEls) {
    if (!el._seen) { el.remove(); floorEls.delete(key); }
  }

  // 休憩室の扉（休んでいる人数）
  const resting = S.staff.filter(s => s.rest && !s.away).length;
  setKeyed($('restDoor'), 'restDoor', resting, `<b>休憩室</b>${resting ? `<span class="zz">💤${resting}</span>` : ''}`);

  // スタッフ出入口（通っている人がいれば開く）
  $('staffGate').classList.toggle('open', S.staff.some(s => !s.away && Math.abs(s.x - L.gateK.x) < 6 && s.y > L.gateK.y - u(3) && s.y < L.gateH.y + u(2)));

  // カウンター
  const counterKey = S.counter.map(st => st.dish + st.n).join(',');
  setKeyed($('counter'), 'counter', counterKey,
    '<span class="label">COUNTER</span>' + (S.counter.length
      ? S.counter.map(st => `<span class="stack">${DISH[st.dish].emoji}<small>×${st.n}</small></span>`).join('')
      : '<span class="empty">料理がありません</span>'));

  // 内装（壁と床の決まった場所に飾る）
  const decorKey = DECOR.map(d => S.decor[d.id] || 0).join(',') + '|' + L.ver;
  const n = id => Math.min(4, S.decor[id] || 0);
  const at = (cls, x, y, html = '', edit = '') => `<div class="${cls}" style="left:${x}%;top:${y}%" ${edit}>${html}</div>`;
  setKeyed($('wallDecor'), 'wallDecor', decorKey, [
    ...[11, 26, 72, 88].slice(0, n('lamp')).map(x => at('pendant', x, 0)),
    ...[22.5, 58.5, 84.5, 93].slice(0, n('painting')).map((x, i) => at('frame f' + i, x, u(5.5))),
    ...(n('chandelier') ? [at('chandelier', 60, 0, '<i></i><i></i><i></i>')] : []),
  ].join(''));
  setKeyed($('floorDecor'), 'floorDecor', decorKey, [
    ...L.plants.slice(0, n('plant')).map((p, i) => at('plant', p.x, p.y, '🪴', `data-edit="plants" data-i="${i}"`)),
    ...(n('jukebox') ? [at('record', L.jukebox.x, L.jukebox.y, '📻', 'data-edit="jukebox" data-i="0"')] : []),
  ].join(''));

  // メニュー黒板
  const menu = DISHES.filter(canCook).sort((a, b) => a.price - b.price).slice(-4);
  setKeyed($('board'), 'board', menu.map(d => d.id).join(','),
    '<b>MENU</b>' + menu.map(d => `<span><i>${d.emoji} ${d.name}</i><em>${yen(d.price)}</em></span>`).join(''));
}

// ===== 配置の編集モード（店内でドラッグして動かす）=====
let editing = false;
let drag = null;
function setEditing(on) {
  editing = on;
  if (on && !S.layout) S.layout = snapshotLayout();
  floor.classList.toggle('editing', on);
  $('editBar').hidden = !on;
  $('editBtn').hidden = on;
  if (!on) save();
}
function afterLayoutChange() {
  computeLayout();
  keys.floorDecor = undefined;
  // 座っているお客さん・調理中の人を新しい場所へ
  for (const c of customers) if (c.state === 'wait' || c.state === 'eat') { const p = seatPos(c.table); c.x = p.x; c.y = p.y; }
  for (const s of S.staff) if (s.task?.type === 'cook' && s.task.phase === 'work') { const p = stovePos(s.task.stove); s.x = p.x; s.y = p.y; }
}
function pointerSpot(e) {
  const r = floor.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width * 100, v: (e.clientY - r.top) / r.width * 100 };
}
function layoutItemOf(kind, i) {
  return kind === 'tables' ? L.tables[i] : kind === 'stoves' ? L.stoves[i] : kind === 'plants' ? L.plants[i] : L.jukebox;
}
function setLayoutItem(kind, i, p) {
  if (kind === 'jukebox') S.layout.jukebox = p; else S.layout[kind][i] = p;
}
function dragEl() {
  return drag && floor.querySelector(`[data-edit="${drag.kind}"][data-i="${drag.i}"]`);
}
floor.addEventListener('pointerdown', e => {
  if (!editing) return;
  const el = e.target.closest('[data-edit]');
  if (!el) return;
  e.preventDefault();
  const kind = el.dataset.edit, i = +el.dataset.i;
  const at = fromFloor(layoutItemOf(kind, i)), pt = pointerSpot(e);
  drag = { kind, i, start: at, dx: at.x - pt.x, dv: at.v - pt.v, bad: false };
  floor.setPointerCapture(e.pointerId);
  dragEl()?.classList.add('dragging');
});
floor.addEventListener('pointermove', e => {
  if (!drag) return;
  const pt = pointerSpot(e);
  const p = clampLayout(drag.kind, { x: pt.x + drag.dx, v: pt.v + drag.dv });
  drag.bad = layoutHits(drag.kind, drag.i, p);
  setLayoutItem(drag.kind, drag.i, p);
  afterLayoutChange();
  const el = dragEl();
  if (el) { el.classList.add('dragging'); el.classList.toggle('bad', drag.bad); }
});
function endDrag() {
  if (!drag) return;
  const el = dragEl();
  if (drag.bad) {
    setLayoutItem(drag.kind, drag.i, drag.start);
    toast('ほかの物と重なるので置けません');
  }
  if (el) el.classList.remove('dragging', 'bad');
  drag = null;
  afterLayoutChange();
  save();
}
floor.addEventListener('pointerup', endDrag);
floor.addEventListener('pointercancel', endDrag);
function resetLayout() {
  S.layout = snapshotLayoutDefault();
  afterLayoutChange();
  save();
  toast('配置を最初の状態に戻しました');
}
function snapshotLayoutDefault() {
  const keep = S.layout;
  S.layout = null;
  computeLayout();
  const def = snapshotLayout();
  S.layout = keep;
  return def;
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
let currentScreen = 'cafe';
let kitchenTab = 'cook';

function card(p, role, stars) {
  return `<div class="card r${stars}">${Chara.portrait(p.look, role)}</div>`;
}

function renderHud() {
  $('money').textContent = yen(S.money);
  $('level').textContent = S.level;
  $('xpbar').style.width = Math.min(100, S.xp / xpNeeded(S.level) * 100) + '%';
  $('contracts').textContent = S.contracts;
  $('pop').textContent = popularity();
  $('rankName').textContent = rankOf().icon + ' ' + rankOf().name;
  const ready = S.stoves.some((_, i) => stoveInfo(i).kind === 'ready');
  const rankReady = canRankUp();
  $('kitchenDot').hidden = !ready && !rankReady;
  $('cookDot').hidden = !ready;
  $('rankDot').hidden = !rankReady;
  $('rankName').classList.toggle('ready', rankReady);
}

function renderCook(el) {
  const infos = S.stoves.map((_, i) => stoveInfo(i));
  const key = S.stoves.map((st, i) => [infos[i].kind, st.dish, infos[i].cook?.id].join(':')).join(',');
  const counterKey = S.counter.map(c => c.dish + c.n).join(',');
  setKeyed(el, 'cook', key + '|' + counterKey, `
    <h3>カウンターの料理</h3>
    <div class="counter-line">${S.counter.length
      ? S.counter.map(c => `<span class="chip">${DISH[c.dish].emoji} ${DISH[c.dish].name} ×${c.n}</span>`).join('')
      : '<span class="chip">まだありません</span>'}</div>
    <h3>コンロ（${S.stoves.length}/${stoveCap()}）</h3>
    <p class="note">料理を注文すると、手の空いたスタッフがコンロに入って調理します。調理中のスタッフは配膳できません。
    できあがったらタップしてカウンターに並べましょう。</p>
    <div class="stoves">${S.stoves.map((st, i) => {
      const s = infos[i];
      if (s.kind === 'idle') {
        return `<button class="stove idle" data-action="pick" data-i="${i}">
          <div class="big">🔥</div>コンロ${i + 1}<span>タップして料理を作る</span></button>`;
      }
      const d = DISH[st.dish];
      if (s.kind === 'ready') {
        return `<button class="stove ready" data-action="collect" data-i="${i}">
          <div class="big">${d.emoji}</div>できあがり！<span>タップでカウンターへ（${servingsOf(d)}人前）</span></button>`;
      }
      const who = s.kind === 'cooking' ? `${displayName(s.cook)}が調理中`
        : s.cook ? `${displayName(s.cook)}が向かっています` : '調理スタッフ待ち…';
      return `<div class="stove ${s.kind}">
        <div class="stove-head">${s.cook ? card(s.cook, roleOf(s.cook), s.cook.stars) : ''}<div class="big">${d.emoji}</div></div>
        ${d.name}<div class="bar"><i data-prog="${i}"></i></div>
        <span>${who}</span><span data-left="${i}"></span></div>`;
    }).join('')}</div>`);
  infos.forEach((s, i) => {
    if (s.kind !== 'cooking' && s.kind !== 'waiting') return;
    const bar = el.querySelector(`[data-prog="${i}"]`);
    const left = el.querySelector(`[data-left="${i}"]`);
    if (bar) bar.style.width = (s.ratio * 100).toFixed(1) + '%';
    if (left) left.textContent = `のこり ${fmtTime(s.left)}`;
  });
}

function staffStatus(s) {
  if (s.away === 'spy') return '潜入中';
  if (s.away) return '料理勝負に出撃中';
  if (s.rest) return s.inRoom ? '💤 休憩室で休憩中' : '😪 休憩室へ向かっています';
  const k = s.task;
  if (!k) return '待機中';
  if (k.type === 'serve') return k.phase === 'counter' ? '料理を取りに行っています' : '配膳中';
  if (k.type === 'cook') return k.phase === 'go' ? 'コンロへ移動中' : `コンロ${k.stove + 1}で調理中`;
  return '片付け中';
}

function renderStaff(el) {
  const key = [S.staff.map(s => s.id + s.type + s.post + (s.away || '') + !!s.rest + (hpOf(s) >= maxHp(s))).join(','), S.contracts, staffCap(), S.drinks].join('|');
  setKeyed(el, 'staff', key, `
    <h3>スタッフ（${S.staff.length}/${staffCap()}人）　📜 永久雇用契約 × ${S.contracts}</h3>
    <p class="note">お客さんをタップするとアルバイトとしてスカウトできます。アルバイトは契約期間（${fmtTime(CONTRACT_SEC)}）が過ぎると辞めてしまいます。
    永久雇用契約を結ぶと<b>正社員</b>になり、ずっと働いてくれます。契約はレベル2つごと（偶数レベル）に1枚もらえるほか、ショップで買えます。</p>
    <p class="note"><b>持ち場</b>：「ホール」は配膳と片付けだけ、「厨房」は調理だけ、「両方」は手の空いた仕事を何でもします。</p>
    <p class="note"><b>体力</b>：★1つにつき1連勤（1日働ける分）。尽きると💤休憩室で休み、満タンになると職場に戻ります。🥤 エナジードリンク × ${S.drinks || 0}本</p>
    <div class="staff-list">${S.staff.map(s => `
      <div class="row">
        ${card(s, roleOf(s), s.stars)}
        <div class="info">
          <div class="name">${s.nation ? NATIONS[s.nation].flag + ' ' : ''}${displayName(s)}
            <span class="badge ${roleOf(s)}">${s.owner ? '店長' : s.type === 'perm' ? '正社員' : 'アルバイト'}</span></div>
          ${s.title ? `<div class="sub">${s.boss ? '👑' : '🏷️'} 元「${s.from}」の${s.title}</div>` : ''}
          <div class="sub">速さ <span class="stars">${starStr(s.stars)}</span>　<span data-status="${s.id}"></span></div>
          ${hpBar(s)}
          ${s.type === 'part' ? `<div class="bar contract"><i data-contract="${s.id}"></i></div>
            <div class="sub" data-contract-left="${s.id}"></div>` : ''}
          <div class="posts">${Object.entries(POSTS).map(([p, label]) =>
            `<button class="post-btn ${s.post === p ? 'on' : ''}" data-action="post" data-id="${s.id}" data-post="${p}">${label}</button>`).join('')}</div>
        </div>
        <div class="staff-actions">
          ${s.type === 'part'
            ? `<button class="btn blue small" data-action="promote" data-id="${s.id}" ${S.contracts > 0 ? '' : 'disabled'}>📜 正社員にする</button>`
            : ''}
          ${s.rest && !s.away ? `<button class="btn pink small" data-action="cheer" data-id="${s.id}">💪 激励</button>` : ''}
          ${drinkButton(s)}
          ${s.owner ? '' : `<button class="btn ghost small" data-action="askFire" data-id="${s.id}">解雇</button>`}
        </div>
      </div>`).join('')}</div>`);
  updateHpBars(el);
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

function renderShop(el) {
  const sp = stovePrice(), tp = tablePrice(), cp = contractPrice();
  const stoveMax = S.stoves.length >= stoveCap(), tableMax = S.tableCount >= tableCap();
  const key = [sp, tp, cp, stoveMax, tableMax, S.up.stove, S.up.table, upMax(),
    ...DECOR.map(d => decorPrice(d) + ':' + (S.money >= decorPrice(d))),
    ...Object.keys(UPGRADES).map(k => S.money >= upPrice(k)),
    S.money >= sp, S.money >= tp, S.money >= cp, S.drinks, S.money >= drinkPrice()].join('|');
  const next = RANKS[S.rank + 1];
  setKeyed(el, 'shop', key, `
    <h3>設備</h3>
    <div class="item-list">
      ${itemRow('🔥', 'コンロを増やす', `いま ${S.stoves.length}/${stoveCap()} 台`, sp, 'buy', 'data-kind="stove"',
        stoveMax || S.money < sp, stoveMax ? '上限' : '')}
      ${itemRow('🪑', 'テーブルを増やす', `いま ${S.tableCount}/${tableCap()} 卓`, tp, 'buy', 'data-kind="table"',
        tableMax || S.money < tp, tableMax ? '上限' : '')}
    </div>
    <h3>設備強化</h3>
    <div class="item-list">
      ${Object.entries(UPGRADES).map(([k, u]) => {
        const lv = S.up[k], max = lv >= upMax();
        return itemRow(u.icon, `${u.name} <small>Lv${lv}/${upMax()}</small>`,
          max ? `${u.desc(lv)}<br>${next ? 'ランクを上げると更に強化できます' : '最大まで強化しました'}` : `次：${u.desc(lv + 1)}`,
          upPrice(k), 'upgrade', `data-kind="${k}"`, max || S.money < upPrice(k), max ? '上限' : '');
      }).join('')}
    </div>
    <h3>内装（人気度が上がるとお客さんが増え、代金も上がります）</h3>
    <div class="item-list">
      ${DECOR.map(d => itemRow(d.emoji, d.name, `人気度 +${d.pop}　所持 ${S.decor[d.id] || 0}`,
        decorPrice(d), 'buy', `data-kind="decor" data-id="${d.id}"`, S.money < decorPrice(d))).join('')}
    </div>
    <h3>体力回復</h3>
    <div class="item-list">
      ${itemRow('🥤', 'エナジードリンク', `スタッフの体力を1日分回復（スタッフタブ・休憩室で飲ませる）　所持 ${S.drinks || 0}本`, drinkPrice(), 'buy',
        'data-kind="drink"', S.money < drinkPrice())}
    </div>
    <h3>契約</h3>
    <div class="item-list">
      ${itemRow('📜', '永久雇用契約', 'アルバイトを正社員にできる契約書。買うたびに値上がりします', cp, 'buy',
        'data-kind="contract"', S.money < cp)}
    </div>
`);
}

// 店舗ランク（お店のいちばんの目標なので、ショップとは別のタブ）
const canRankUp = () => { const next = RANKS[S.rank + 1]; return !!next && rankNeeds().every(r => r.ok) && S.money >= next.cost; };
function renderRank(el) {
  const next = RANKS[S.rank + 1];
  const needs = rankNeeds();
  const canRank = !!next && needs.every(r => r.ok);
  const key = [S.rank, needs.map(r => r.ok + r.now).join(','), next && S.money >= next.cost].join('|');
  const r = rankOf();
  setKeyed(el, 'rank', key, `
    <h3>🏆 店舗ランク</h3>
    <p class="note">条件とお金がそろったらランクアップ。コンロ・テーブル・スタッフ・設備強化の上限が増え、街にも格の高い店が現れます。</p>
    <div class="rank-card">
      <div class="rank-now"><span class="rank-icon">${r.icon}</span><div><small>ランク${S.rank + 1}</small><b>${r.name}</b>
        <div class="sub">コンロ ${r.stoves}台・テーブル ${r.tables}卓・スタッフ ${r.staff}人・強化 Lv${upMax()} まで</div></div></div>
      ${next ? `
        <div class="rank-next">次のランク：${next.icon} <b>${next.name}</b>
          <div class="sub">コンロ ${next.stoves}台・テーブル ${next.tables}卓・スタッフ ${next.staff}人・強化 Lv${Math.min(6, S.rank + 2)} まで</div></div>
        <ul class="needs">${needs.map(n => `<li class="${n.ok ? 'ok' : ''}">${n.ok ? '✅' : '⬜'} ${n.label}<span>いま ${n.now}</span></li>`).join('')}</ul>
        <button class="btn wide" data-action="rankup" ${canRank && S.money >= next.cost ? '' : 'disabled'}>
          ${canRank ? `${yen(next.cost)} でランクアップ` : '条件を満たすとランクアップできます'}</button>`
      : '<p class="note">最高ランクです！</p>'}
    </div>
    <h3>ランク一覧</h3>
    <div class="item-list">${RANKS.map((k, i) => `<div class="row ${i === S.rank ? 'on' : ''}">
      <div class="ico">${k.icon}</div>
      <div class="info"><div class="name">ランク${i + 1}　${k.name}${i === S.rank ? ' <span class="badge owner">いまここ</span>' : ''}</div>
        <div class="sub">コンロ ${k.stoves}・テーブル ${k.tables}・スタッフ ${k.staff}${k.cost ? `　${yen(k.cost)}` : ''}</div></div></div>`).join('')}</div>`);
}

// 店長（自分のこと）：ステータス・身支度・記録・設定
function renderOwner() {
  const el = $('owner');
  const st = S.stats;
  const key = [S.rank, S.level, st.served, st.hired, st.promoted, S.staff.length, S.money, charm(), blend(null),
    JSON.stringify(S.wardrobe), S.recipes.length, st.battlesWon, st.poached].join('|');
  setKeyed(el, 'owner', key, `
    <div class="protag-card">
      <div class="protag-fig ${USE_STAND ? 'stand' : ''}">${protagFigure(S.wardrobe.eq, USE_STAND)}</div>
      <div class="info">
        <div class="name">店長 <small>22歳</small></div>
        <div class="closet-stats">💖 魅力 <b>${charm()}</b>　🕶️ 馴染み <b>${blend(null)}</b></div>
        ${setLine()}
        <div class="sub">体力 ∞</div>
      </div>
    </div>
    <p class="note"><b>魅力</b>は店員を口説く成功率（格下の店ではメロメロにも）、<b>馴染み</b>は潜入で失敗したときの警戒の増えにくさに効きます。</p>
    <div class="item-list">
      ${itemRow('👗', '身支度・美容院', '服・頭・顔・小物の着せ替えと、髪型・髪色の変更', 0, 'closet', '', false, '開く')}
    </div>
    <h3>📊 お店の記録</h3>
    <div class="stat-grid">
      <div>店舗ランク<b>${rankOf().icon} ${rankOf().name}</b></div>
      <div>レベル<b>Lv${S.level}</b></div>
      <div>所持金<b>${yen(S.money)}</b></div>
      <div>接客したお客さん<b>${st.served.toLocaleString('ja-JP')}人</b></div>
      <div>スタッフ<b>${S.staff.length}/${staffCap()}人</b></div>
      <div>スカウトした人数<b>${st.hired}人</b></div>
      <div>正社員にした人数<b>${st.promoted}人</b></div>
      <div>引き抜いたレシピ<b>${S.recipes.length}種</b></div>
      <div>料理勝負の勝利<b>${st.battlesWon || 0}回</b></div>
      <div>引き抜いた店員<b>${st.poached || 0}人</b></div>
    </div>
    <h3>⚙️ 設定</h3>
    <div class="item-list">
      ${itemRow('❓', '遊び方', 'ゲームのルールを確認します', 0, 'help', '', false, '見る')}
      ${itemRow('🗑️', 'データを消去', 'お金・スタッフ・設備をすべて最初に戻します', 0, 'askReset', '', false, '消去')}
    </div>
    <p class="note">データはこの端末のブラウザに自動で保存されます。</p>`);
}

function renderUI() {
  renderHud();
  if (modalKind() === 'rest') {
    const top = $('sheet').scrollTop;
    if (restKey() !== restRoomKey) { openRestRoom(); $('sheet').scrollTop = top; }
    updateHpBars($('sheet'));
  }
  if (currentScreen === 'kitchen') ({ cook: renderCook, staff: renderStaff, shop: renderShop, rank: renderRank })[kitchenTab]($('kitchen'));
  if (currentScreen === 'owner') renderOwner();
  if (currentScreen === 'town') { renderTown($('town')); updateTimers($('town')); }
}

function setKitchenTab(tab) {
  kitchenTab = tab;
  document.querySelectorAll('.seg-btn').forEach(b => b.classList.toggle('active', b.dataset.ktab === tab));
  keys.cook = keys.staff = keys.shop = keys.rank = undefined;
  renderUI();
}

function setScreen(name) {
  if (editing && name !== 'cafe') setEditing(false);
  currentScreen = name;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === name));
  document.querySelectorAll('.screen').forEach(sc => sc.classList.toggle('active', sc.id === 'scr-' + name));
  delete keys[name];
  renderUI();
}

// ===== モーダル =====
function openModal(html, kind = '') {
  $('sheet').innerHTML = html;
  $('modal').hidden = false;
  $('modal').dataset.kind = kind;
}
const modalKind = () => $('modal').hidden ? null : $('modal').dataset.kind;
function closeModal() {
  $('modal').hidden = true;
  $('toasts').classList.remove('top');
  $('sheet').innerHTML = '';
}

// ===== 休憩室 =====
function hpBar(s) {
  if (s.owner) return '<div class="sub">体力 ∞</div>';
  const r = hpOf(s) / maxHp(s);
  return `<div class="bar hp ${r < 0.2 ? 'low' : ''}" data-hp="${s.id}"><i style="width:${(r * 100).toFixed(1)}%"></i></div>
    <div class="sub">体力 ${days(hpOf(s))}/${s.stars}日${s.rest ? `　復帰まで ${fmtTime(restLeft(s))}` : ''}</div>`;
}
function drinkButton(s) {
  if (s.owner || s.away || !S.drinks || hpOf(s) >= maxHp(s)) return '';
  return `<button class="btn ghost small" data-action="drink" data-id="${s.id}">🥤 飲ませる</button>`;
}
function useDrink(id) {
  const s = S.staff.find(x => x.id === id);
  if (!s || s.owner || s.away || !S.drinks || hpOf(s) >= maxHp(s)) return;
  S.drinks--;
  // ドリンクは体力を回復するだけ。休憩中の人は満タンになったら職場に戻る
  s.hp = Math.min(maxHp(s), hpOf(s) + DRINK_SEC);
  const wasRest = s.rest;
  if (s.rest && s.hp >= maxHp(s)) backToWork(s, `☕ ${displayName(s)}が体力満タンで職場に戻りました`);
  toast(`🥤 ${displayName(s)}がエナジードリンクを飲みました（体力 ${days(s.hp)}/${s.stars}日）`);
  react(s, !wasRest ? 'drinkWork' : s.rest ? 'drinkRest' : 'drinkFull');
  afterRestChange();
}
function openRestRoom() {
  const list = S.staff.filter(s => s.rest && !s.away);
  restRoomKey = restKey();
  openModal(`<div class="sheet-head"><h2>💤 休憩室</h2>
      <button class="close-x" data-action="close" aria-label="閉じる">✕</button></div>
    <p class="note">体力が尽きたスタッフはここで休み、体力が満タンになると自動で職場に戻ります。
      タップして<b>💪 激励</b>すると体力が1時間分回復して、すぐに働きに戻ります。</p>
    <p class="note">🥤 エナジードリンク × ${S.drinks || 0}本（1日分回復。ショップで買えます）</p>
    <div class="staff-list">${list.length ? list.map(s => `
      <div class="row">
        ${card(s, roleOf(s), s.stars)}
        <div class="info"><div class="name">${displayName(s)} <span class="badge ${roleOf(s)}">${s.type === 'perm' ? '正社員' : 'アルバイト'}</span></div>
          ${hpBar(s)}${s.say && s.say.until > Date.now() ? `<div class="say-line">💬 「${s.say.text}」</div>` : ''}</div>
        <div class="staff-actions">
          <button class="btn pink small" data-action="cheer" data-id="${s.id}">💪 激励</button>
          ${drinkButton(s)}
        </div>
      </div>`).join('') : '<p class="note">いま休んでいるスタッフはいません</p>'}</div>
    <div class="actions"><button class="btn ghost" data-action="close">閉じる</button></div>`, 'rest');
}
let restRoomKey = '';
const restKey = () => S.staff.filter(s => s.rest && !s.away).map(s => s.id).join(',') + '|' + S.drinks;
// ===== 従業員の反応（激励・ドリンク）=====
// 回数を重ねるほど、店のブラックぶりを責める言葉がきつくなる
const REACTIONS = {
  cheer: [
    'え、休憩まだ始まったばかりなんですけど…', '「がんばって」で体力が戻ると思ってます？', '激励って言えば何でも許されると思ってません？',
    'さっき倒れたの、見てましたよね？', '休憩室って、店長が叩き起こしに来る部屋でしたっけ',
  ],
  cheerPhone: [
    '潜入先から電話で激励…どこにいても逃げられないんですね', '店長、いま敵の店にいますよね？ なんで電話してくるんですか', 'スパイ中まで部下の休憩を監視してるんですか…',
  ],
  drinkRest: [
    '寝てる人の口にエナドリを流し込むの、やめてください', '休ませる気、ありませんよね？', '体力は戻っても、心は戻らないんですよ…',
    'これ、点滴の代わりですか？', '目は覚めましたけど、気持ちは冷めました',
  ],
  drinkFull: [
    '満タンにした瞬間に出勤…労基に通報しますよ', '休憩を「飲み物」で終わらせる会社、初めて見ました', 'はいはい、エナドリ注入完了。出勤しますよ…',
  ],
  drinkWork: [
    'まだ働かせる気ですね…', '差し入れのつもりですか？ 燃料補給ですよね、これ', '退勤って言葉、この店の辞書にあります？',
    'エナドリより先に、お給料を上げてください', 'これ飲んだら、あと何日働けばいいんですか…',
  ],
  angry: [
    'この店、36協定って出してます？', '求人票に「アットホームな職場」って書いてありましたよね', '永久雇用契約って、永久に休めない契約のことだったんですね',
    '店長の血の色、何色ですか？', '辞めたいって言ったら、また契約書出てくるんですよね…', 'ブラック企業大賞、狙ってます？',
  ],
};
const SAY_MS = 5000;
function react(s, kind) {
  s.abuse = (s.abuse || 0) + 1;
  const pool = s.abuse >= 4 ? [...REACTIONS[kind], ...REACTIONS.angry, ...REACTIONS.angry] : REACTIONS[kind];
  const line = rand(pool);
  s.say = { text: line, until: Date.now() + SAY_MS };
  toast(`💬 ${displayName(s)}：「${line}」`);
}

const CHEER_LINES = ['「もうひと踏ん張り、お願い！」', '「あなたがいないと始まらないの！」', '「終わったらみんなでケーキ食べよう！」'];
function cheer(id) {
  const s = S.staff.find(x => x.id === id);
  if (!s || !s.rest) return;
  s.hp = Math.min(maxHp(s), s.hp + CHEER_SEC);
  backToWork(s);
  const phone = !!S.staff.find(x => x.owner)?.away;
  toast(`💪 店長${phone ? '（潜入先から電話で）' : ''}：${rand(CHEER_LINES)} ${displayName(s)}が職場へ戻りました`);
  react(s, phone ? 'cheerPhone' : 'cheer');
  afterRestChange();
}
function afterRestChange() {
  if (modalKind() === 'rest') openRestRoom();
  keys.staff = undefined;
  save();
}
// 体力バーの数字だけを書き換える（ボタンは作り直さない）
function updateHpBars(root) {
  for (const el of root.querySelectorAll('[data-hp]')) {
    const s = S.staff.find(x => x.id === +el.dataset.hp);
    if (!s || s.owner) continue;
    const r = hpOf(s) / maxHp(s);
    el.querySelector('i').style.width = (r * 100).toFixed(1) + '%';
    el.classList.toggle('low', r < 0.2);
    el.nextElementSibling.textContent = `体力 ${days(hpOf(s))}/${s.stars}日${s.rest ? `　復帰まで ${fmtTime(restLeft(s))}` : ''}`;
  }
}

// 閉じていた間の報告
function openWelcome(rep) {
  const items = [
    ...(rep.served ? [`<li class="good">🍽️ 留守中も営業して <b>${rep.served.toLocaleString('ja-JP')}人</b>を接客し、<b>${yen(rep.sales)}</b> の売上がありました</li>`] : []),
    ...(rep.level ? [`<li class="good">🎉 レベル${rep.level[0]} → <b>レベル${rep.level[1]}</b>になりました！${rep.level[2] ? ` 永久雇用契約 📜 +${rep.level[2]}` : ''}</li>`] : []),
    ...(rep.soldOut ? ['<li class="bad">🈳 カウンターの料理が売り切れて、途中で閉店しました。出かける前に多めに作っておきましょう</li>'] : []),
    ...rep.done.map(d => `<li class="good">${DISH[d.dish].emoji} コンロ${d.i + 1}：${d.cook}が<b>${DISH[d.dish].name}</b>を作り、${d.n}人前をカウンターに並べました</li>`),
    ...S.stoves.map((st, i) => st.dish && st.progress < st.duration && !rep.idle.some(d => d.i === i)
      ? `<li>${DISH[st.dish].emoji} コンロ${i + 1}：${DISH[st.dish].name}を調理中（<b>${Math.floor(st.progress / st.duration * 100)}%</b>）</li>` : '').filter(Boolean),
    ...rep.idle.map(d => `<li class="bad">${DISH[d.dish].emoji} コンロ${d.i + 1}：${DISH[d.dish].name}は作れる人がいなかったので進んでいません</li>`),
    ...rep.tired.map(t => `<li class="bad">😪 ${t.name}は疲れて休憩室で休んでいます（復帰まで ${fmtTime(t.left)}）</li>`),
    ...rep.quit.map(n => `<li class="bad">⌛ アルバイトの${n}が契約満了で辞めてしまいました</li>`),
    ...rep.parts.map(p => `<li>⏳ アルバイトの${p.name}：契約のこり ${fmtTime(p.left)}</li>`),
    ...rep.town.map(t => `<li class="${t.kind}">${t.text}</li>`),
  ];
  openModal(`<div class="welcome">
      <h2>☕ おかえりなさい！</h2>
      <p class="note">お店を離れていた時間</p>
      <div class="away">${fmtTime(rep.away / 1000)}</div>
    </div>
    <h3>留守中のできごと</h3>
    <ul class="report">${items.length ? items.join('') : '<li>特に変わったことはありませんでした</li>'}</ul>
    <p class="note">留守中も、カウンターの料理と調理中の料理がある間は営業します。営業中はスタッフの体力が減り、閉店している時間は休んで回復します。</p>
    <div class="actions"><button class="btn" data-action="close">営業再開！</button></div>`);
}

function openDishPicker(i) {
  if (S.stoves[i]?.dish) return;
  openModal(`
    <h2>🔥 コンロ${i + 1}：何を作りますか？</h2>
    <p class="note">材料費を払うと、手の空いたスタッフが調理を始めます。</p>
    <div class="dish-list">${DISHES.filter(d => !d.secret || canCook(d)).map(d => {
      const locked = !canCook(d);
      return `<div class="row ${locked ? 'locked' : ''}">
        <div class="ico">${d.emoji}</div>
        <div class="info"><div class="name">${d.name}${d.boss ? ' <span class="badge boss">👑 固有</span>' : d.secret ? ' <span class="badge ace">引き抜き</span>' : ''}</div>
          <div class="sub">${locked ? `レベル${d.level}で解禁` :
            `⏱ ${fmtTime(d.time)}　🍽 ${servingsOf(d)}人前　1人前 ${yen(d.price)}`}</div></div>
        <button class="btn" data-action="cook" data-i="${i}" data-dish="${d.id}"
          ${locked || S.money < d.cost ? 'disabled' : ''}>${locked ? '🔒' : yen(d.cost)}</button>
      </div>`;
    }).join('')}
    ${DISHES.some(d => d.secret && !canCook(d)) ? `<div class="row locked"><div class="ico">❓</div><div class="info"><div class="name">？？？</div>
      <div class="sub">あと ${DISHES.filter(d => d.secret && !canCook(d)).length} 種類のレシピが、🗺️ 街のお店に眠っています</div></div></div>` : ''}</div>
    <div class="actions"><button class="btn ghost" data-action="close">閉じる</button></div>`);
}

function openScout(cid) {
  const c = customers.find(c => c.id === cid);
  if (!c || (c.state !== 'wait' && c.state !== 'eat')) return;
  const fee = scoutFee(c.stars);
  const full = S.staff.length >= staffCap();
  const n = NATIONS[c.nation];
  openModal(`
    <div class="profile">
      <div class="card big r${c.stars}">${Chara.portrait(c.look, 'customer')}</div>
      <div>
        <h2>${displayName(c)}</h2>
        <p class="sub">${n.flag} ${n.name}出身</p>
        <p>仕事の速さ <span class="stars">${starStr(c.stars)}</span></p>
      </div>
    </div>
    <p>アルバイトとしてスカウトしますか？ 契約期間は <b>${fmtTime(CONTRACT_SEC)}</b> です。
    あとで永久雇用契約を結べば正社員になります。</p>
    ${full ? `<p class="warn">スタッフがいっぱいです（${S.staff.length}/${staffCap()}人）。店舗ランクを上げると雇える人数が増えます。</p>` : ''}
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
      <li>下の<b>🏪 お店</b>の「調理」（または店内のコンロ）をタップして料理を注文します。手の空いた<b>スタッフがコンロに入って調理</b>します。できあがったらタップしてカウンターへ並べます。</li>
      <li>スタッフはカウンターの奥の厨房で待機し、右端のスタッフ出入口から客席へ出てカウンターの料理をお客さんへ運び、食べ終わるとお金がもらえます。お客さんは<b>基本的に安い料理から</b>頼みます。</li>
      <li>スタッフの仕事は「配膳 → 調理 → 片付け」の順に優先されます。調理中の人は配膳できないので、「スタッフ」で<b>持ち場（ホール／厨房／両方）</b>を決めておくと安心です。</li>
      <li>料理が届かないまま待たせすぎると、お客さんは怒って帰ってしまいます。</li>
      <li>カフェ画面右上の<b>🛠 配置</b>で、テーブル・コンロ・観葉植物などをドラッグして好きな場所へ動かせます。</li>
      <li>スタッフには<b>体力</b>があります（★1つにつき1連勤＝1日働ける分。店長は無限）。尽きると奥の<b>💤 休憩室</b>で休み、満タンになると自動で職場に戻ります。休憩室をタップして<b>💪 激励</b>すると1時間分回復してすぐ戻ります。ショップの<b>🥤 エナジードリンク</b>は体力を1日分回復します（激励とは別で、休憩中の人は満タンになったら戻ります）。</li>
      <li>アプリを閉じている間も、カウンターの料理と調理中の料理がある間は<b>営業</b>します。出かける前に料理を多めに作っておきましょう。</li>
      <li>お客さんを<b>タップするとスカウト</b>できます。雇った人はまず<b>アルバイト</b>で、契約期間が終わると辞めてしまいます。</li>
      <li><b>📜 永久雇用契約</b>を結ぶと<b>正社員</b>になり、ずっと働いてくれます。契約書はレベル2つごと（偶数レベル）に1枚もらえるほか、ショップで買えます。</li>
      <li>下のメニューは「<b>☕ カフェ</b>（店内の様子）／<b>🏪 お店</b>（調理・スタッフ・ショップ・店舗ランク）／<b>👩‍🍳 店長</b>（ステータス・身支度・記録・設定）／<b>🗺️ 街</b>（ライバル店）」です。「スタッフ」で契約や持ち場、「ショップ」で<b>コンロ・テーブル・設備強化・内装</b>を買えます。</li>
      <li><b>🗺️ 街</b>では<b>引き抜き作戦</b>ができます。格下の店には「⚔️ 料理勝負」でスタッフを送り出し、格上の店には店長が「🕵️ 潜入」してレシピを閃いたり、店員を口説き落としてアルバイトにしたりできます。失敗が続くと警戒ゲージが溜まり、満タンで追い出されます。</li>
      <li>条件を満たすと街に<b>👑 名店（ボス）</b>が現れます。料理勝負で勝つと<b>限定アイテム</b>、潜入や勝負で<b>固有レシピ</b>、口説き落とすと専用の制服を着た<b>エース</b>が手に入ります。3つそろえると制覇です。</li>
      <li>潜入中は客席を自分で歩けます。店員はカウンターの向こうの厨房にいます。床をタップで移動、席に座って注文、カウンターの切れ目のスイングドアの前でのぞく、店員をタップするとカウンター越しに話せます。黄色い扇形は店員の視線。厨房の前にいるところや、うろうろしているところを見られると警戒が上がります。物陰（🪴🗂️🧥）に隠れると見つからず、警戒が下がります。</li>
      <li>うまくいかないときは店員の「💰 買収」。お金で好感度を上げる（心付け）、警戒を下げる（口止め料）、レシピを買う、すぐに引き抜く（引き抜き料）ができます。</li>
      <li>魅力が高いと、格下の店の店員は店長に<b>メロメロ</b>になります（💓ドキドキ→😍メロメロ→💘イチコロ）。イチコロなら魅力だけでその場でスカウトできます。</li>
      <li>「👩‍🍳 店長」の「👗 身支度」で着替えると<b>魅力</b>（口説く成功率）と<b>馴染み</b>（警戒されにくさ）が変わります。お店のドレスコードに合う服だと馴染みやすくなります。</li>
      <li>条件を満たしたら「お店」の<b>🏆 店舗ランク</b>でランクを上げましょう（上の店舗ランクの表示をタップしても開けます）。屋台から始まり、ランクが上がるほどコンロ・テーブル・スタッフ・設備強化の上限が増えます。データは自動で保存されます。</li>
    </ul>
    <div class="actions"><button class="btn" data-action="close">はじめる</button></div>`);
}

// ===== メッセージ =====
const logLines = [];

function addLog(text, big) {
  const d = new Date();
  const time = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  logLines.unshift({ time, text, big });
  if (logLines.length > 60) logLines.pop();
  const box = $('log');
  const p = document.createElement('p');
  if (big) p.className = 'big';
  p.innerHTML = `<time>${time}</time>`;
  p.append(text);
  box.prepend(p);
  while (box.children.length > 60) box.lastChild.remove();
  box.scrollTop = 0;
}

// 大事なことと、カフェ画面以外にいるときはポップアップでも知らせる
let quietToasts = false;   // 留守中の計算ではポップアップを出さない（報告にまとめる）
function toast(text, big) {
  addLog(text, big);
  if (quietToasts) return;
  if (!big && currentScreen === 'cafe' && $('modal').hidden) return;
  showToast(text, big);
}

function showToast(text, big) {
  const el = document.createElement('div');
  el.className = 'toast' + (big ? ' big' : '');
  el.textContent = text;
  const box = $('toasts');
  box.style.setProperty('--toast-bottom', $('bottomNav').offsetHeight + 8 + 'px');
  box.classList.toggle('top', !$('modal').hidden);
  box.appendChild(el);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => el.remove(), big ? 3500 : 2600);
}

// ===== 入力 =====
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) {
    if (e.target === $('modal')) closeModal();
    return;
  }
  // 配置の編集中は、店内の物をタップしても反応しない（ドラッグで動かす）
  if (editing && floor.contains(el) && !['editDone', 'layoutReset'].includes(el.dataset.action)) return;
  const d = el.dataset;
  switch (d.action) {
    case 'editLayout': setEditing(true); break;
    case 'editDone': setEditing(false); break;
    case 'layoutReset': resetLayout(); break;
    case 'screen': closeModal(); setScreen(d.screen); break;
    case 'ktab': setKitchenTab(d.ktab); break;
    case 'pick': openDishPicker(+d.i); break;
    case 'cook': orderDish(+d.i, d.dish); break;
    case 'collect': collectStove(+d.i); break;
    case 'scout': openScout(+d.cid); break;
    case 'hire': hire(+d.cid); break;
    case 'promote': promote(+d.id); break;
    case 'post': setPost(+d.id, d.post); break;
    case 'rankup': rankUp(); break;
    case 'gotoRank': closeModal(); setScreen('kitchen'); setKitchenTab('rank'); break;
    case 'upgrade': upgrade(d.kind); break;
    case 'askFire': {
      const s = S.staff.find(s => s.id === +d.id);
      if (!s) break;
      openModal(`<h2>${displayName(s)}を解雇しますか？</h2>
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
    case 'restRoom': openRestRoom(); break;
    case 'cheer': cheer(+d.id); break;
    case 'drink': useDrink(+d.id); break;
    case 'help': openHelp(); break;
    case 'close': closeModal(); break;
    default: townAction(d);
  }
  renderUI();
});

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
// 長押しでメニューが出ないようにする
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
window.addEventListener('pagehide', save);

// ===== メインループ =====
let last = performance.now();
let uiTimer = 0;
let saveTimer = 0;

function frame(t) {
  // 最初のフレームは t が last より前になることがあるので 0 未満にしない
  const dt = Math.min(0.1, Math.max(0, (t - last) / 1000));
  last = t;
  update(dt);
  renderFloor();
  spyFrame(dt);
  uiTimer += dt;
  if (uiTimer >= 0.2) { uiTimer = 0; renderUI(); }
  saveTimer += dt;
  if (saveTimer >= 5) { saveTimer = 0; save(); }
  requestAnimationFrame(frame);
}

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* 登録できなくてもゲームは遊べる */ });
}

new ResizeObserver(() => computeLayout()).observe(floor);

const worthReport = r => r.away >= 60 * 1000 || r.served || r.done.length || r.quit.length || r.town.length;

// 別のアプリに切り替えていた間も、戻ったときに追いかけて進める
document.addEventListener('visibilitychange', () => {
  if (document.hidden || !S.savedAt || Date.now() - S.savedAt < 30 * 1000) return;
  const rep = applyOffline(true);
  initRuntime();
  last = performance.now();
  if (worthReport(rep)) openWelcome(rep);
  renderUI();
});

// town.js を読み込んだあとに呼ぶ
function boot() {
  const offlineReport = applyOffline();
  initRuntime();
  addLog('☕ 開店しました。いらっしゃいませ！');
  renderUI();
  requestAnimationFrame(frame);
  if (!S.seenHelp) openHelp();
  else if (worthReport(offlineReport)) openWelcome(offlineReport);
}
