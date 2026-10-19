'use strict';

// ===== 街と引き抜き作戦（料理勝負・潜入）・身支度 =====

const STYLES = { casual: 'カジュアル', elegant: 'エレガント', cool: 'クール', cute: 'キュート', wild: 'ワイルド' };
const SLOTS = { body: '服', head: '頭', face: '顔', item: '小物' };

// 着せ替えアイテム。魅力は口説く成功率、馴染みは失敗したときの警戒の増えにくさ
const OUTFITS = [
  { id: 'maid',       slot: 'body', name: 'いつものメイド服',   style: 'cute',    charm: 10, blend: -6, price: 0 },
  { id: 'hoodie',     slot: 'body', name: 'パーカー',           style: 'casual',  charm: 4,  blend: 12, price: 400 },
  { id: 'suit',       slot: 'body', name: 'パンツスーツ',       style: 'cool',    charm: 12, blend: 6,  price: 1500 },
  { id: 'lolita',     slot: 'body', name: 'フリルワンピース',   style: 'cute',    charm: 16, blend: 0,  price: 2200 },
  { id: 'leather',    slot: 'body', name: '革ジャン',           style: 'wild',    charm: 14, blend: 2,  price: 2800 },
  { id: 'dress',      slot: 'body', name: 'イブニングドレス',   style: 'elegant', charm: 24, blend: -2, price: 5000 },
  { id: 'kimono',     slot: 'body', name: '振袖',               style: 'elegant', charm: 20, blend: 4,  price: 6500 },
  { id: 'cap',        slot: 'head', name: 'キャップ',           style: 'casual',  charm: 2,  blend: 6,  price: 200 },
  { id: 'beret',      slot: 'head', name: 'ベレー帽',           style: 'cute',    charm: 5,  blend: 3,  price: 350 },
  { id: 'ribbon',     slot: 'head', name: '大きなリボン',       style: 'cute',    charm: 7,  blend: 0,  price: 600 },
  { id: 'fedora',     slot: 'head', name: '中折れ帽',           style: 'cool',    charm: 7,  blend: 4,  price: 900 },
  { id: 'tiara',      slot: 'head', name: 'ティアラ',           style: 'elegant', charm: 14, blend: -5, price: 3500 },
  { id: 'glasses',    slot: 'face', name: 'だてメガネ',         style: 'casual',  charm: 2,  blend: 7,  price: 250 },
  { id: 'sunglasses', slot: 'face', name: 'サングラス',         style: 'cool',    charm: 4,  blend: 9,  price: 700 },
  { id: 'mustache',   slot: 'face', name: 'つけ髭',             style: 'wild',    charm: -6, blend: 16, price: 450 },
  { id: 'monocle',    slot: 'face', name: '片眼鏡',             style: 'elegant', charm: 7,  blend: 4,  price: 1600 },
  { id: 'newspaper',  slot: 'item', name: '新聞',               style: 'casual',  charm: 0,  blend: 10, price: 100 },
  { id: 'plush',      slot: 'item', name: 'くまのぬいぐるみ',   style: 'cute',    charm: 6,  blend: 0,  price: 650 },
  { id: 'bouquet',    slot: 'item', name: '花束',               style: 'elegant', charm: 9,  blend: -2, price: 800 },
  { id: 'guitar',     slot: 'item', name: 'ギター',             style: 'wild',    charm: 9,  blend: -4, price: 1900 },
  { id: 'bag',        slot: 'item', name: 'ブランドバッグ',     style: 'elegant', charm: 12, blend: 2,  price: 3000 },
];
// ボスの店でしか手に入らない限定アイテム
OUTFITS.push(
  { id: 'garcon',    slot: 'body', name: '漆黒のギャルソン服', style: 'cool',    charm: 22, blend: 14, limited: 'noir' },
  { id: 'starcap',   slot: 'head', name: '金のスターキャップ', style: 'casual',  charm: 14, blend: 10, limited: 'burger' },
  { id: 'kappo',     slot: 'body', name: '大将の割烹着',       style: 'casual',  charm: 18, blend: 22, limited: 'ginrei' },
  { id: 'patissier', slot: 'body', name: '天才のパティシエ服', style: 'cute',    charm: 26, blend: 12, limited: 'etoile' },
  { id: 'gown',      slot: 'body', name: '星空のドレス',       style: 'elegant', charm: 38, blend: 6,  limited: 'soleil' },
);
const OUTFIT = Object.fromEntries(OUTFITS.map(o => [o.id, o]));

// ライバル店の種類（すべて架空の NPC 店）。g が格（1〜10）
const STORE_TYPES = [
  { g: 1,  type: 'ボロいカフェ',     emoji: '🏚️', style: 'casual',  recipes: [],           names: ['喫茶ひだまり', 'カフェ・オンボロ', '純喫茶こもれび', '喫茶ノスタルジア'], ace: '看板娘' },
  { g: 2,  type: '街のパン屋',       emoji: '🥖', style: 'cute',    recipes: ['croissant'], names: ['ベーカリー麦の穂', 'パン工房こむぎ', 'ブーランジェリー・ミニョン'], ace: 'パン職人' },
  { g: 3,  type: '大衆食堂',         emoji: '🍱', style: 'casual',  recipes: ['teishoku'],  names: ['まんぷく亭', 'ごはん処いろは', '大衆食堂みやこ'], ace: '若女将' },
  { g: 4,  type: 'ファストフード',   emoji: '🍔', style: 'casual',  recipes: ['burger'],    names: ['ワールドバーガー', 'バーガーキャッスル', 'クイックバーガー'], ace: '最速の店員' },
  { g: 5,  type: '老舗の洋食屋',     emoji: '🍖', style: 'elegant', recipes: ['hamburg'],   names: ['洋食グリルつばめ', 'レストラン明星軒', 'キッチン・ローズ'], ace: '二代目シェフ' },
  { g: 6,  type: '人気パティスリー', emoji: '🍰', style: 'cute',    recipes: ['parfait'],   names: ['パティスリー・リュミエール', 'スイーツ工房ミエル', 'ラ・ポム・ダムール'], ace: '天才パティシエ' },
  { g: 7,  type: '高級寿司店',       emoji: '🍣', style: 'elegant', recipes: ['sushi'],     names: ['鮨みなと', '寿司処銀嶺', 'すし匠あおい'], ace: '若き板前' },
  { g: 8,  type: '本格イタリアン',   emoji: '🍕', style: 'cool',    recipes: ['pizza'],     names: ['トラットリア・ソーレ', 'リストランテ・ルーナ', 'オステリア・ベッロ'], ace: 'ピッツァ職人' },
  { g: 9,  type: '高級フレンチ',     emoji: '🍷', style: 'elegant', recipes: ['bouilla'],   names: ['ビストロ・エトワール', 'メゾン・ルミエール', 'ラ・ベル・エポック'], ace: 'スーシェフ' },
  { g: 10, type: '三ツ星フレンチ',   emoji: '🌟', style: 'elegant', recipes: ['course'],    names: ['ル・ソレイユ', 'グラン・メゾン・オーロラ'], ace: '伝説のシェフ' },
];
const NPC_TITLES = ['ホール係', 'キッチン担当', 'アルバイト', '皿洗い', '新人'];

// 店ごとの制服（引き抜いた店員は、うちの店でもこの制服で働く）
const STORE_UNIFORMS = {
  1: { body: 'cafeapron' }, 2: { body: 'baker', head: 'bandana' }, 3: { body: 'kappo', head: 'bandana' },
  4: { body: 'fastfood', head: 'cap' }, 5: { body: 'chefcoat', head: 'chefhat' }, 6: { body: 'patissier' },
  7: { body: 'kappo', head: 'hachimaki' }, 8: { body: 'trattoria' }, 9: { body: 'garcon' }, 10: { body: 'chefcoat', head: 'chefhat' },
};

// ボスの店（名店）。格の条件を満たすと街に現れ、制覇するまで残り続ける
const BOSSES = [
  { id: 'noir', g: 3, name: '純喫茶ノワール', type: '伝説の純喫茶', emoji: '🖤', style: 'cool', recipe: 'siphon', item: 'garcon',
    ace: { name: 'クラウディア', nation: 'de', g: 'f', title: '伝説のバリスタ', stars: 5, ideal: 64, persona: 'cool', style: 'cool',
      look: { hair: '#22223a', style: 'bob', eye: '#e11d48', skin: '#ffe6d5', mouth: 'smile', uniform: { body: 'garcon', face: 'monocle' } } } },
  { id: 'burger', g: 5, name: 'ワールドバーガー本店', type: '巨大チェーンの本店', emoji: '👑', style: 'casual', recipe: 'bigburger', item: 'starcap',
    ace: { name: 'ジョージ', nation: 'gb', g: 'm', title: '最速の店長代理', stars: 5, ideal: 80, persona: 'passion', style: 'casual',
      look: { hair: '#eab04a', style: 'spiky', eye: '#2f7cf6', skin: '#fdd8bf', mouth: 'open', uniform: { body: 'fastfood', head: 'starcap' } } } },
  { id: 'ginrei', g: 7, name: '鮨 銀嶺 本店', type: '老舗の名店', emoji: '🎏', style: 'elegant', recipe: 'omakase', item: 'kappo',
    ace: { name: 'ミコワイ', nation: 'pl', g: 'm', title: '若き天才板前', stars: 5, ideal: 96, persona: 'struggle', style: 'casual',
      look: { hair: '#3a2a2a', style: 'short', eye: '#14b8a6', skin: '#f7c9a6', mouth: 'smile', uniform: { body: 'kappo', head: 'hachimaki' } } } },
  { id: 'etoile', g: 9, name: 'パティスリー・エトワール', type: '星付きパティスリー', emoji: '🌠', style: 'cute', recipe: 'souffle', item: 'patissier',
    ace: { name: 'アメリア', nation: 'gb', g: 'f', title: '天才パティシエール', stars: 5, ideal: 112, persona: 'dreamer', style: 'cute',
      look: { hair: '#f6d66b', style: 'twin', eye: '#a855f7', skin: '#ffe6d5', mouth: 'cat', accColor: '#f472b6', uniform: { body: 'patissier', head: 'ribbon' } } } },
  { id: 'soleil', g: 10, name: '三ツ星 ル・ソレイユ', type: '三ツ星フレンチ', emoji: '🌞', style: 'elegant', recipe: 'grandcourse', item: 'gown',
    ace: { name: 'ジョヴァンニ', nation: 'it', g: 'm', title: '伝説のシェフ', stars: 5, ideal: 128, persona: 'gentle', style: 'elegant',
      look: { hair: '#e3e3f0', style: 'swept', eye: '#f59e0b', skin: '#eab48c', mouth: 'smile', uniform: { body: 'chefcoat', head: 'chefhat' } } } },
];
const BOSS = Object.fromEntries(BOSSES.map(b => [b.id, b]));
const BOSS_POWER = 4;      // ボスの店は同じ格の店より強い
const BOSS_ALERT = 1.3;    // ボスの店は警戒されやすい

// ボスの攻略状況（限定アイテム・固有レシピ・エース）
function bossProgress(b) {
  return { item: S.wardrobe.owned.includes(b.item), recipe: S.recipes.includes(b.recipe), ace: !!(S.bossAces || {})[b.id] };
}
const bossCleared = b => Object.values(bossProgress(b)).every(Boolean);

// 口説き落としの会話：話題・転職の動機・性格
const TOPICS = { cooking: '🍳 料理の腕', money: '💰 お給料', dream: '🌈 将来の夢', holiday: '🏖️ 休日の過ごし方', complaint: '😤 職場の不満', fashion: '👗 おしゃれ' };
const MOTIVES = {
  skill: { label: '腕を磨きたい',   line: '「あなたの腕を、うちの看板にさせて！」' },
  money: { label: 'お金がほしい',   line: '「お給料、今のお店より弾むよ！（支度金つき）」' },
  env:   { label: '楽しく働きたい', line: '「うちは毎日笑いの絶えない職場だよ」' },
  dream: { label: '夢を叶えたい',   line: '「あなたの夢、うちの店で一緒に叶えよう」' },
};
const PERSONAS = {
  passion:  { name: '熱血',     likes: ['cooking', 'dream'],   dislike: 'complaint', motive: 'skill' },
  cool:     { name: 'クール',   likes: ['fashion', 'money'],   dislike: 'dream',     motive: 'money' },
  gentle:   { name: 'おっとり', likes: ['holiday', 'cooking'], dislike: 'money',     motive: 'env' },
  dreamer:  { name: '夢見がち', likes: ['dream', 'fashion'],   dislike: 'money',     motive: 'dream' },
  struggle: { name: '苦労人',   likes: ['complaint', 'money'], dislike: 'fashion',   motive: 'env' },
  trendy:   { name: 'ミーハー', likes: ['fashion', 'holiday'], dislike: 'cooking',   motive: 'money' },
};
const TOPIC_LINES = {
  cooking:   { ok: '「わかります！ 火加減って奥が深いですよね！」', ng: '「料理の話は…仕事中だけで十分です」' },
  money:     { ok: '「そうなんです、もうちょっとお給料がほしくて…」', ng: '「お金の話ってちょっと苦手で…」' },
  dream:     { ok: '「いつか自分の看板メニューを作るのが夢なんです！」', ng: '「夢とか、そういうのはちょっと…」' },
  holiday:   { ok: '「休みの日は公園でのんびりするのが好きで〜」', ng: '「休日？ 寝てるだけですけど…」' },
  complaint: { ok: '「聞いてください！ うちの店長ったら…」', ng: '「職場の悪口は言いたくないです」' },
  fashion:   { ok: '「その服かわいい！ どこで買ったんですか？」', ng: '「服とか、あんまり興味なくて…」' },
};
const MOTIVE_REVEAL = {
  skill: '「実は…もっと腕を磨ける場所を探してるんです」',
  money: '「実は…正直、今のお給料じゃやっていけなくて」',
  env:   '「実は…今の職場、ちょっとギスギスしてて」',
  dream: '「実は…ずっと叶えたい夢があるんです」',
};

const TOWN_SIZE = 6;
const TOWN_REFRESH_MS = 15 * 60 * 1000;
const BAN_MS = 20 * 60 * 1000;
const BATTLE_CD_MS = 5 * 60 * 1000;
const ALERT_DECAY_PER_MIN = 10;

const gradeLabel = g => g <= 2 ? 'E' : g <= 4 ? 'D' : g <= 6 ? 'C' : g <= 8 ? 'B' : g === 9 ? 'A' : 'S';
const storeType = st => st.boss ? BOSS[st.boss] : STORE_TYPES.find(t => t.g === st.g);
const storeById = id => S.town.stores.find(st => st.id === id);
const maxGrade = () => Math.min(10, Math.floor(3 + S.rank * 1.5));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ===== 主人公の魅力・馴染み =====
function equipped() {
  return Object.values(S.wardrobe.eq).filter(Boolean).map(id => OUTFIT[id]);
}
// 同じ系統でそろえるとセット効果（髪型の系統も数える）
function setBonus() {
  const counts = {};
  for (const o of equipped()) counts[o.style] = (counts[o.style] || 0) + 1;
  const hs = HAIR_STYLES[S.wardrobe.hair.style].style;
  counts[hs] = (counts[hs] || 0) + 1;
  const [style, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (n >= 5) return { style, n, charm: 22, blend: 6 };
  if (n >= 4) return { style, n, charm: 15, blend: 3 };
  if (n >= 3) return { style, n, charm: 8, blend: 0 };
  return { style, n, charm: 0, blend: 0 };
}
function charm() {
  return 20 + Math.floor(S.level / 2) + equipped().reduce((a, o) => a + o.charm, 0) + setBonus().charm;
}
function blend(store) {
  let b = 10 + equipped().reduce((a, o) => a + o.blend, 0) + setBonus().blend;
  if (store) {
    // その店の雰囲気（ドレスコード）に合っていると馴染みやすい
    const style = storeType(store).style;
    for (const o of equipped()) if (o.style === style) b += o.slot === 'body' ? 15 : 3;
  }
  return b;
}
// 相手の好きな系統の服を着ていると、その人にだけ魅力が上がる
function charmFor(npc) {
  let c = charm();
  for (const o of equipped()) if (o.style === npc.style) c += o.slot === 'body' ? 15 : 5;
  return c;
}

// 失敗したときの警戒の増え方（馴染みが高いほど小さい）
const alertMult = store => clamp(1 - blend(store) / 120, 0.3, 1.3);

// ===== 街のお店 =====
function genNpc(g, ace, type) {
  const p = randomPerson();
  p.look.uniform = STORE_UNIFORMS[g];
  const stars = Math.min(5, 2 + Math.floor((g - 1) / 3) + (Math.random() < 0.4 ? 1 : 0) + (ace ? 1 : 0));
  return {
    id: S.town.nextId++, ...p, stars, ace,
    title: ace ? type.ace : rand(NPC_TITLES),
    ideal: 12 + g * 10 + Math.round(Math.random() * 8 - 4) + (ace ? 8 : 0),
    aff: 0,
    ...genPersona(),
  };
}

function genPersona() {
  return { persona: rand(Object.keys(PERSONAS)), style: rand(Object.keys(STYLES)), known: {} };
}
const personaOf = n => PERSONAS[n.persona];

function genStore(g) {
  const type = STORE_TYPES.find(t => t.g === g);
  const used = new Set(S.town.stores.map(st => st.name));
  let name = rand(type.names);
  for (let n = 2; used.has(name); n++) name = `${rand(type.names)} ${n}号店`;
  return {
    id: S.town.nextId++, g, name,
    recipes: [...type.recipes],
    npcs: [genNpc(g, true, type), genNpc(g, false, type), genNpc(g, false, type)],
    alert: 0, alertAt: Date.now(), bannedUntil: 0, battleCd: 0,
  };
}

// 好感度・出禁・勝負中などの店は残して、ほかを入れ替える
function genBossStore(b) {
  const a = b.ace;
  const look = { ...Chara.randomLook(a.g), ...a.look };
  const ace = {
    id: S.town.nextId++, name: a.name, nation: a.nation, g: a.g, look, stars: a.stars, ace: true, bossAce: b.id,
    title: a.title, ideal: a.ideal, aff: 0, persona: a.persona, style: a.style, known: {},
  };
  const type = { ace: a.title };
  return {
    id: S.town.nextId++, g: b.g, boss: b.id, name: b.name,
    recipes: [b.recipe, ...(STORE_TYPES.find(t => t.g === b.g).recipes)],
    npcs: [ace, genNpc(b.g, false, type), genNpc(b.g, false, type)],
    alert: 0, alertAt: Date.now(), bannedUntil: 0, battleCd: 0,
  };
}

function storePinned(st) {
  const now = Date.now();
  if (st.boss) return !bossCleared(BOSS[st.boss]);
  return st.npcs.some(n => n.aff > 0) || st.bannedUntil > now || st.battleCd > now ||
    S.battles.some(b => b.storeId === st.id) || (S.spy && S.spy.storeId === st.id);
}

function refreshTown() {
  const keep = S.town.stores.filter(storePinned);
  S.town.stores = keep;
  const mg = maxGrade();
  addBossStores();
  // 一番上の格の店を必ず1軒、残りは少し下の格から
  const want = [mg];
  while (want.length + S.town.stores.filter(st => !st.boss).length < TOWN_SIZE) want.push(Math.max(1, mg - Math.floor(Math.random() * 5)));
  for (const g of want) S.town.stores.push(genStore(g));
  S.town.stores.sort((a, b) => (b.boss ? 1 : 0) - (a.boss ? 1 : 0) || a.g - b.g);
  S.town.refreshAt = Date.now() + TOWN_REFRESH_MS;
}

// 条件を満たした、まだ制覇していないボスの店を並べる（入れ替えの枠には数えない）
function addBossStores() {
  for (const b of BOSSES) {
    if (b.g > maxGrade() || bossCleared(b) || S.town.stores.some(st => st.boss === b.id)) continue;
    S.town.stores.unshift(genBossStore(b));
  }
}

function ensureTown() {
  if (!S.town) S.town = { stores: [], refreshAt: 0, nextId: 1 };
  for (const st of S.town.stores) {
    for (const n of st.npcs) {
      if (!n.persona) Object.assign(n, genPersona());
      if (!st.boss && n.look && !n.look.uniform) n.look.uniform = STORE_UNIFORMS[st.g];
    }
  }
  if (!S.town.stores.length || Date.now() >= S.town.refreshAt) refreshTown();
  else addBossStores();
}

function currentAlert(st) {
  if (S.spy && S.spy.storeId === st.id) return st.alert;
  const decay = (Date.now() - st.alertAt) / 60000 * ALERT_DECAY_PER_MIN;
  return Math.max(0, st.alert - decay);
}
function settleAlert(st) {
  st.alert = currentAlert(st);
  st.alertAt = Date.now();
}

// ===== 料理勝負（メンバーを送り出して結果を待つ）=====
const secretCount = () => S.recipes.length;
const storePower = st => 1 + st.g * 2.2 + (st.boss ? BOSS_POWER : 0);
const teamPower = members => members.reduce((a, s) => a + s.stars, 0) + secretCount() + S.up.stove * 0.5;
const winChance = (members, st) => clamp(1 / (1 + Math.exp(-(teamPower(members) - storePower(st)) / 1.5)), 0.03, 0.97);
const battleSec = st => 30 + st.g * 20;
const availableForBattle = () => S.staff.filter(s => !s.owner && !s.away);

// おすすめメンバー（★の高い順に3人）で見た相手との差
function difficulty(st) {
  const best = [...availableForBattle()].sort((a, b) => b.stars - a.stars).slice(0, 3);
  const diff = teamPower(best) - storePower(st);
  if (diff >= 2) return { label: '格下', cls: 'easy' };
  if (diff > -2) return { label: '同格', cls: 'even' };
  return { label: '格上', cls: 'hard' };
}

let dispatchSel = [];

function openDispatch(storeId) {
  const st = storeById(storeId);
  if (!st) return;
  const pool = availableForBattle();
  dispatchSel = dispatchSel.filter(id => pool.some(s => s.id === id));
  const members = pool.filter(s => dispatchSel.includes(s.id));
  const p = members.length ? winChance(members, st) : 0;
  const type = storeType(st);
  openModal(`<div class="sheet-head"><h2>⚔️ 料理勝負：${st.name}</h2>
      <button class="close-x" data-action="close" aria-label="閉じる">✕</button></div>
    <p class="note">${type.emoji} ${type.type}（格 ${gradeLabel(st.g)}）に、スタッフを最大3人送り出します。勝負には ${fmtTime(battleSec(st))} かかり、その間は店で働けません。</p>
    <div class="power-line">
      <span>チーム力 <b>${teamPower(members).toFixed(1)}</b></span>
      <span>相手 <b>${storePower(st).toFixed(1)}</b></span>
      <span>勝率 <b class="${p >= .7 ? 'good' : p >= .4 ? '' : 'bad'}">${Math.round(p * 100)}%</b></span>
    </div>
    <p class="note">チーム力 ＝ メンバーの★の合計 ＋ 引き抜いたレシピの数 ＋ コンロ強化</p>
    <div class="pick-list">${pool.length ? pool.map(s => `
      <button class="pick ${dispatchSel.includes(s.id) ? 'on' : ''}" data-action="pickMember" data-store="${st.id}" data-id="${s.id}">
        ${card(s, roleOf(s), s.stars)}<span>${displayName(s)}<small class="stars">${starStr(s.stars)}</small></span></button>`).join('')
      : '<p class="note">送り出せるスタッフがいません。</p>'}</div>
    <div class="actions"><button class="btn ghost" data-action="close">やめる</button>
      <button class="btn" data-action="startBattle" data-store="${st.id}" ${members.length ? '' : 'disabled'}>出撃！</button></div>`);
}

function pickMember(storeId, id) {
  if (dispatchSel.includes(id)) dispatchSel = dispatchSel.filter(x => x !== id);
  else if (dispatchSel.length < 3) dispatchSel.push(id);
  openDispatch(storeId);
}

function startBattle(storeId) {
  const st = storeById(storeId);
  const members = availableForBattle().filter(s => dispatchSel.includes(s.id));
  if (!st || !members.length || st.battleCd > Date.now() || S.battles.some(b => b.storeId === st.id)) return;
  for (const s of members) { cancelTaskOf(s); s.away = 'battle'; s.walkOut = true; }
  S.battles.push({ storeId: st.id, members: members.map(s => s.id), chance: winChance(members, st),
    until: Date.now() + battleSec(st) * 1000 });
  addLog(`⚔️ ${members.map(displayName).join('・')}が「${st.name}」へ料理勝負に出かけました`);
  dispatchSel = [];
  closeModal();
  save();
}

// 終わった勝負の結果を出す（閉じていた間の分も）。報告の文を返す
function resolveBattles(report) {
  const now = Date.now();
  const done = S.battles.filter(b => now >= b.until);
  if (!done.length) return;
  S.battles = S.battles.filter(b => now < b.until);
  for (const b of done) {
    const st = storeById(b.storeId);
    const members = b.members.map(id => S.staff.find(s => s.id === id)).filter(Boolean);
    for (const s of members) { s.away = null; s.walkOut = false; s.x = L.door.x; s.y = L.door.y; }
    if (!st) continue;
    st.battleCd = now + BATTLE_CD_MS;
    const roll = Math.random();
    const great = roll < b.chance * 0.3, win = roll < b.chance;
    const lines = [];
    if (win) {
      const money = (100 + st.g * st.g * 40) * (great ? 2 : 1);
      S.money += money;
      S.stats.battlesWon = (S.stats.battlesWon || 0) + 1;
      addXp(st.g * 4);
      lines.push(`${great ? '🌟 大成功！' : '🏆 勝利！'}「${st.name}」との料理勝負に勝ちました（${yen(money)}）`);
      if (st.boss) {
        const b = BOSS[st.boss];
        if (!S.wardrobe.owned.includes(b.item)) {
          S.wardrobe.owned.push(b.item);
          lines.push(`👑 ボスに勝利！ 限定アイテム「${OUTFIT[b.item].name}」を手に入れました（身支度で着られます）`);
          afterBossProgress(b);
        }
      }
      const recipe = st.recipes.find(r => !S.recipes.includes(r));
      if (recipe && (great || Math.random() < (st.boss ? 0.6 : 0.4))) lines.push(learnRecipe(recipe, st));
      const npc = st.npcs.filter(n => !n.ace)[0];
      if (npc && Math.random() < (great ? 0.6 : 0.25)) lines.push(joinFromStore(st, npc, '負けを認めて'));
    } else {
      addXp(1);
      lines.push(`😣「${st.name}」との料理勝負に負けてしまいました…`);
    }
    for (const t of lines) {
      if (report) report.push({ text: t, kind: win ? 'good' : 'bad' });
      else toast(t, win);
    }
  }
  save();
}

// ボスを制覇したら知らせ、街から外す
function afterBossProgress(b) {
  if (!bossCleared(b)) return;
  toast(`👑 「${b.name}」を完全制覇しました！`, true);
  S.stats.bosses = (S.stats.bosses || 0) + 1;
}

function learnRecipe(id, st) {
  if (S.recipes.includes(id)) return '';
  S.recipes.push(id);
  st.recipes = st.recipes.filter(r => r !== id);
  S.stats.recipes = (S.stats.recipes || 0) + 1;
  const d = DISH[id];
  const b = BOSSES.find(x => x.recipe === id);
  if (b) afterBossProgress(b);
  return `💡 ${b ? '固有' : ''}レシピ「${d.emoji} ${d.name}」を閃きました！ 厨房で作れます`;
}

// ライバル店の店員がアルバイトとして加入する
function joinFromStore(st, npc, how) {
  st.npcs = st.npcs.filter(n => n !== npc);
  if (S.staff.length >= staffCap()) {
    const money = st.g * 100;
    S.money += money;
    return `🙇 ${npc.name}さんは来たがっていましたが、スタッフがいっぱいでした（代わりに ${yen(money)}）`;
  }
  S.staff.push({
    id: S.nextId++, name: npc.name, g: npc.g, nation: npc.nation, look: npc.look, stars: npc.stars,
    title: npc.title, from: st.name, type: 'part', expireAt: Date.now() + CONTRACT_SEC * 1000,
    owner: false, post: 'any', x: L.door.x, y: L.door.y, task: null, boss: npc.bossAce || null,
  });
  S.stats.poached = (S.stats.poached || 0) + 1;
  if (npc.bossAce) {
    S.bossAces = { ...(S.bossAces || {}), [npc.bossAce]: true };
    afterBossProgress(BOSS[npc.bossAce]);
  }
  return `🤝 ${how}「${st.name}」の${npc.title}・${npc.name}さん（${starStr(npc.stars)}）がアルバイトとして加入しました！`;
}

// ===== 潜入（店長が客のふりをして入り込む）=====
const SPY_LINES = {
  eatOk: ['ひと口で隠し味がわかった…！', 'この香り、あのスパイスね！', '舌が覚えた。家でも作れそう！'],
  eatNg: ['…普通においしいだけだった', 'うーん、何が入ってるのかわからない', '食べるのに夢中で観察を忘れた…'],
  peekOk: ['厨房の壁にレシピのメモが！', '仕込みの手順をしっかり見た！', '調味料の配合をこっそりメモした！'],
  peekNg: ['「お客様、そちらは厨房です」', '扉を開けたら店長と目が合った…', '鍋をひっくり返しそうになった！'],
  talkNg: ['「…ご注文はお決まりですか？」', '「仕事中なので…」', '「店長に呼ばれちゃうので失礼します」', '（少し警戒されたみたい…）'],
  invite: ['「…あなたのお店、行ってみたいです！」', '「決めました。お世話になります！」', '「ずっとこんなお店で働きたかったんです」'],
};
const eatCost = st => 20 + st.g * 25;
const eatChance = st => clamp(0.22 + blend(st) / 300 - (st.g - maxGrade()) * 0.02, 0.05, 0.6);
const peekChance = st => clamp(0.45 + blend(st) / 250 - st.g * 0.02, 0.1, 0.8);
function topicKind(npc, topic) {
  const p = personaOf(npc);
  return p.likes.includes(topic) ? 'like' : p.dislike === topic ? 'dislike' : '';
}
function talkChance(npc, topic) {
  const k = topic ? topicKind(npc, topic) : '';
  const base = 0.4 + (charmFor(npc) - npc.ideal) / 80 + (k === 'like' ? 0.25 : k === 'dislike' ? -0.3 : 0);
  return clamp(base, 0.05, 0.95);
}
const inviteCost = st => st.g * 150;

function spyStore() { return S.spy && storeById(S.spy.storeId); }
const owner = () => S.staff.find(s => s.owner);

function startSpy(storeId) {
  const st = storeById(storeId);
  if (!st || S.spy || st.bannedUntil > Date.now()) return;
  settleAlert(st);
  const o = owner();
  cancelTaskOf(o);
  o.away = 'spy';
  o.walkOut = true;
  S.spy = { storeId, msg: `${storeType(st).emoji} 「${st.name}」に客のふりをして入りました。床をタップして歩き、席・厨房の扉・店員をタップしてみよう`, kind: 'info', seq: 0 };
  spyInit(st);
  addLog(`🕵️ 店長が「${st.name}」へ潜入しに出かけました`);
  closeModal();
  setScreen('town');
  $('town').scrollTop = 0;
  save();
}

function endSpy(msg) {
  const st = spyStore();
  if (st) st.alertAt = Date.now();
  const o = owner();
  if (o) { o.away = null; o.walkOut = false; o.x = L.door.x; o.y = L.door.y; }
  S.spy = null;
  SPY = null;
  if (msg) toast(msg, true);
  keys.town = keys.spyStatic = keys.spyPanel = undefined;
  $('town').scrollTop = 0;
  save();
}

function spySay(text, kind) {
  S.spy.msg = text;
  S.spy.kind = kind;
  S.spy.seq++;
}

function raiseAlert(st, base) {
  st.alert = Math.min(100, st.alert + base * alertMult(st) * (st.boss ? BOSS_ALERT : 1));
  if (st.alert >= 100) {
    st.bannedUntil = Date.now() + BAN_MS;
    st.alert = 0;
    endSpy(`🚨 怪しまれて「${st.name}」を追い出されました！ ${fmtTime(BAN_MS / 1000)}は入店できません`);
    return true;
  }
  return false;
}

function spyEat() {
  const st = spyStore();
  if (!st || !SPY?.sitting || S.money < eatCost(st)) return;
  S.money -= eatCost(st);
  const recipe = st.recipes.find(r => !S.recipes.includes(r));
  if (!recipe) {
    addXp(st.g);
    spySay('🍽️ ごちそうさま。この店のレシピはもう閃き済みだけど、勉強になった！', 'info');
  } else if (Math.random() < eatChance(st)) {
    spySay(`🍽️ ${rand(SPY_LINES.eatOk)}\n${learnRecipe(recipe, st)}`, 'good');
    addLog(`💡 潜入先でレシピ「${DISH[recipe].name}」を閃きました`, true);
  } else {
    spySay(`🍽️ ${rand(SPY_LINES.eatNg)}`, 'bad');
    if (raiseAlert(st, 10)) return;
  }
  save();
}

function spyPeek() {
  const st = spyStore();
  const recipe = st && st.recipes.find(r => !S.recipes.includes(r));
  if (!recipe || SPY?.ctx?.type !== 'door') return;
  if (Math.random() < peekChanceNow(st)) {
    spySay(`🔍 ${rand(SPY_LINES.peekOk)}\n${learnRecipe(recipe, st)}`, 'good');
    addLog(`💡 潜入先でレシピ「${DISH[recipe].name}」を閃きました`, true);
  } else {
    spySay(`🔍 ${rand(SPY_LINES.peekNg)}`, 'bad');
    if (raiseAlert(st, 30)) return;
  }
  save();
}

// 話しかける相手を選ぶ（話題・誘い文句の選択肢を開く）
function spyFocus(npcId, mode) {
  if (!S.spy) return;
  S.spy.focus = S.spy.focus && S.spy.focus.id === npcId && S.spy.focus.mode === mode ? null : { id: npcId, mode };
  S.spy.seq++;
}

function reveal(npc, key) {
  if (npc.known[key]) return '';
  npc.known[key] = true;
  const p = personaOf(npc);
  if (key === 'persona') return `（${npc.name}さんは「${p.name}」タイプみたい）`;
  if (key === 'style') return `（${npc.name}さんは${STYLES[npc.style]}系の服が好きみたい）`;
  if (key === 'dislike') return `（${TOPICS[p.dislike]}の話は苦手みたい）`;
  if (key === 'motive') return `（転職するなら「${MOTIVES[p.motive].label}」が決め手になりそう）`;
  if (key.startsWith('like:')) return `（${TOPICS[key.slice(5)]}の話が好きみたい！）`;
  return '';
}

function spyTalk(npcId, topic) {
  if (SPY?.ctx?.type !== 'npc' || SPY.ctx.id !== npcId) return;
  const st = spyStore();
  const npc = st && st.npcs.find(n => n.id === npcId);
  if (!npc || npc.aff >= 100 || !TOPICS[topic]) return;
  const kind = topicKind(npc, topic);
  const line = TOPIC_LINES[topic];
  if (Math.random() < talkChance(npc, topic)) {
    const gain = kind === 'dislike' ? 5
      : Math.round(12 + Math.random() * 8 + (kind === 'like' ? 16 : 0) + Math.max(0, (charmFor(npc) - npc.ideal) / 5));
    const before = npc.aff;
    npc.aff = Math.min(100, npc.aff + gain);
    let hint = kind === 'like' ? reveal(npc, 'like:' + topic) : '';
    if (before < 60 && npc.aff >= 60 && !npc.known.motive) hint += `\n${npc.name}：${MOTIVE_REVEAL[personaOf(npc).motive]}${reveal(npc, 'motive')}`;
    spySay(`💬 ${npc.name}：${kind === 'dislike' ? '「…はあ」' : line.ok}\n（好感度 +${gain}${npc.aff >= 100 ? '・誘えそう！' : ''}）${hint}`, 'good');
  } else {
    if (kind === 'dislike') npc.aff = Math.max(0, npc.aff - 3);
    const hint = kind === 'dislike' ? reveal(npc, 'dislike') : '';
    spySay(`💬 ${npc.name}：${kind === 'dislike' ? line.ng : rand(SPY_LINES.talkNg)}${hint ? '\n' + hint : ''}`, 'bad');
    if (raiseAlert(st, kind === 'dislike' ? 24 : 14)) return;
  }
  save();
}

// 様子を見て、性格や好みのヒントを探る
function spyObserve(npcId) {
  if (SPY?.ctx?.type !== 'npc' || SPY.ctx.id !== npcId) return;
  const st = spyStore();
  const npc = st && st.npcs.find(n => n.id === npcId);
  if (!npc) return;
  const p = personaOf(npc);
  const unknown = ['persona', 'style', 'dislike', ...p.likes.map(t => 'like:' + t)].filter(k => !npc.known[k]);
  if (!unknown.length) {
    spySay(`👀 ${npc.name}さんのことは、もう十分わかった気がする`, 'info');
  } else if (Math.random() < clamp(0.65 + blend(st) / 400, 0.3, 0.9)) {
    spySay(`👀 ${npc.name}さんの様子をそっと観察した…\n${reveal(npc, rand(unknown))}`, 'good');
  } else {
    spySay(`👀 ${npc.name}：「…あの、何か？」（じっと見すぎた！）`, 'bad');
    if (raiseAlert(st, 8)) return;
  }
  save();
}

// 誘い文句を選んで誘う。相手の動機に合っていれば加入
function spyInvite(npcId, motive) {
  if (SPY?.ctx?.type !== 'npc' || SPY.ctx.id !== npcId) return;
  const st = spyStore();
  const npc = st && st.npcs.find(n => n.id === npcId);
  if (!npc || npc.aff < 100 || S.staff.length >= staffCap() || !MOTIVES[motive]) return;
  if (motive === 'money') {
    if (S.money < inviteCost(st)) return;
    S.money -= inviteCost(st);
  }
  if (personaOf(npc).motive === motive) {
    const msg = joinFromStore(st, npc, '口説き落とされて');
    spySay(`💖 ${npc.name}：${rand(SPY_LINES.invite)}\n${msg}`, 'good');
    addLog(msg, true);
    addXp(st.g * 3);
    S.spy.focus = null;
  } else {
    npc.aff = 70;
    spySay(`💔 ${npc.name}：「…そういうことじゃ、ないんです」\n（誘い文句が響かなかった。好感度が下がった）`, 'bad');
    S.spy.focus = null;
    if (raiseAlert(st, 18)) return;
  }
  save();
}

// ===== 身支度（クローゼット）=====
function openCloset(storeId) {
  const st = storeId ? storeById(storeId) : null;
  const eq = S.wardrobe.eq;
  const prevScroll = $('sheet').scrollTop;
  openModal(`<div class="sheet-head"><h2>👗 身支度</h2>
      <button class="close-x" data-action="close" aria-label="閉じる">✕</button></div>
    <div class="closet-top">
      <div class="closet-fig">${Stand.svg(protagStandLook(), eq)}</div>
      <div>
        <b>店長（22歳）</b>
        <div class="closet-stats">💖 魅力 <b>${charm()}</b>　🕶️ 馴染み <b>${blend(st)}</b></div>
        ${setLine()}
        ${st ? `<p class="note">行き先：${storeType(st).emoji} ${st.name}<br>ドレスコード：<b>${STYLES[storeType(st).style]}</b>（合う服だと馴染みやすい）</p>` : ''}
        <p class="note">魅力は店員を口説く成功率、馴染みは失敗したときの警戒の増えにくさに効きます。
        同じ系統を3つ以上（髪型も含む）そろえるとセット効果。相手の好きな系統の服だと、その人にはさらに魅力的に見えます。</p>
      </div>
    </div>
    <h3>💇 美容院 <small class="note">変えるたびに ${yen(SALON_PRICE)}</small></h3>
    <div class="outfit-list">${Object.entries(HAIR_STYLES).map(([id, h]) => `
      <button class="outfit ${S.wardrobe.hair.style === id ? 'on' : ''}" data-action="hair" data-kind="style" data-id="${id}" data-store="${storeId || ''}"
        ${S.wardrobe.hair.style !== id && S.money < SALON_PRICE ? 'disabled' : ''}><b>${h.name}</b><small>${STYLES[h.style]}</small></button>`).join('')}
    </div>
    <div class="hair-colors">${Object.entries(HAIR_COLORS).map(([id, h]) => `
      <button class="hair-color ${S.wardrobe.hair.color === id ? 'on' : ''}" style="background:${h.c}" title="${h.name}" aria-label="${h.name}"
        data-action="hair" data-kind="color" data-id="${id}" data-store="${storeId || ''}"
        ${S.wardrobe.hair.color !== id && S.money < SALON_PRICE ? 'disabled' : ''}></button>`).join('')}
    </div>
    ${Object.entries(SLOTS).map(([slot, label]) => `
      <h3>${label}</h3>
      <div class="outfit-list">
        ${slot !== 'body' ? `<button class="outfit ${!eq[slot] ? 'on' : ''}" data-action="equip" data-slot="${slot}" data-id="" data-store="${storeId || ''}"><b>なし</b></button>` : ''}
        ${OUTFITS.filter(o => o.slot === slot).map(o => {
          const owned = S.wardrobe.owned.includes(o.id);
          if (o.limited && !owned) {
            return `<div class="outfit locked limited"><b>👑 ？？？</b><small>${BOSS[o.limited].name}に勝つと手に入る</small></div>`;
          }
          const on = eq[slot] === o.id;
          return `<button class="outfit ${on ? 'on' : ''} ${owned ? '' : 'shop'} ${st && o.style === storeType(st).style ? 'match' : ''}"
            data-action="${owned ? 'equip' : 'buyOutfit'}" data-slot="${slot}" data-id="${o.id}" data-store="${storeId || ''}"
            ${!owned && S.money < o.price ? 'disabled' : ''}>
            <b>${o.limited ? '👑 ' : ''}${o.name}</b><small>${STYLES[o.style]}</small>
            <span>💖${o.charm >= 0 ? '+' : ''}${o.charm} 🕶️${o.blend >= 0 ? '+' : ''}${o.blend}</span>
            ${owned ? (on ? '<em>着用中</em>' : '') : `<em>${yen(o.price)}</em>`}
          </button>`;
        }).join('')}
      </div>`).join('')}
    <div class="actions">
      ${st ? `<button class="btn ghost" data-action="close">やめる</button>
        <button class="btn" data-action="startSpy" data-store="${st.id}" ${st.bannedUntil > Date.now() ? 'disabled' : ''}>🕵️ この服で潜入する</button>`
      : '<button class="btn" data-action="close">決定</button>'}
    </div>`);
  $('sheet').scrollTop = prevScroll;
}

const SALON_PRICE = 500;

// 立ち絵用の見た目（髪の色 ID も渡して、PNG 差し替えのキーに使う）
const protagStandLook = () => ({ ...protagLook(), hairColorId: S.wardrobe.hair.color });

function setLine() {
  const b = setBonus();
  return b.charm ? `<div class="set-line">✨ ${STYLES[b.style]}セット（${b.n}点）：魅力 +${b.charm}${b.blend ? `・馴染み +${b.blend}` : ''}</div>`
    : '<div class="sub">同じ系統を3つそろえるとセット効果</div>';
}

function changeHair(kind, id, storeId) {
  const h = S.wardrobe.hair;
  const table = kind === 'style' ? HAIR_STYLES : HAIR_COLORS;
  if (!table[id] || h[kind] === id || S.money < SALON_PRICE) return;
  S.money -= SALON_PRICE;
  h[kind] = id;
  owner().look = protagLook();
  toast(`💇 美容院で${kind === 'style' ? '髪型' : '髪色'}を「${table[id].name}」にしました`);
  save();
  openCloset(storeId);
}

function equip(slot, id, storeId) {
  if (id && !S.wardrobe.owned.includes(id)) return;
  if (slot === 'body' && !id) return;
  S.wardrobe.eq[slot] = id || null;
  save();
  openCloset(storeId);
}

function buyOutfit(slot, id, storeId) {
  const o = OUTFIT[id];
  if (!o || S.wardrobe.owned.includes(id) || S.money < o.price) return;
  S.money -= o.price;
  S.wardrobe.owned.push(id);
  S.wardrobe.eq[slot] = id;
  toast(`👗 「${o.name}」を買いました`);
  save();
  openCloset(storeId);
}

// ===== 描画 =====
function hintChips(n) {
  const p = personaOf(n), k = n.known;
  const chip = (on, text) => `<span class="hint ${on ? '' : 'unknown'}">${on ? text : text.replace(/：.*/, '：？')}</span>`;
  return `<div class="hints">
    ${chip(k.persona, `性格：${p.name}`)}
    ${chip(k.style, `好きな服：${STYLES[n.style]}`)}
    ${p.likes.map(t => chip(k['like:' + t], `好き：${TOPICS[t]}`)).join('')}
    ${chip(k.dislike, `苦手：${TOPICS[p.dislike]}`)}
    ${chip(k.motive, `動機：${MOTIVES[p.motive].label}`)}
  </div>`;
}

function npcRow(n, spying, st) {
  const focus = spying && S.spy.focus && S.spy.focus.id === n.id ? S.spy.focus.mode : null;
  const full = S.staff.length >= staffCap();
  return `<div class="npc-card ${focus ? 'open' : ''}">
    <div class="row npc">
      ${card(n, 'customer', n.stars)}
      <div class="info">
        <div class="name">${NATIONS[n.nation].flag} ${n.name}さん ${n.ace ? '<span class="badge ace">エース</span>' : ''}</div>
        <div class="sub">${n.title}　<span class="stars">${starStr(n.stars)}</span>　理想の高さ ${n.ideal}</div>
        <div class="bar aff"><i style="width:${n.aff}%"></i></div>
        <div class="sub">好感度 ${Math.round(n.aff)}/100</div>
      </div>
      ${spying ? `<div class="staff-actions">
        ${n.aff >= 100
          ? `<button class="btn pink small" data-action="spyFocus" data-mode="invite" data-id="${n.id}" ${full ? 'disabled' : ''}>💖 誘う</button>`
          : `<button class="btn small" data-action="spyFocus" data-mode="talk" data-id="${n.id}">💬 話す</button>`}
        <button class="btn ghost small" data-action="spyObserve" data-id="${n.id}">👀 観察</button>
      </div>` : ''}
    </div>
    ${hintChips(n)}
    ${focus === 'talk' ? `<div class="choices">${Object.entries(TOPICS).map(([t, label]) => {
      const kind = n.known['like:' + t] ? 'like' : n.known.dislike && personaOf(n).dislike === t ? 'dislike' : '';
      return `<button class="choice ${kind}" data-action="spyTalk" data-id="${n.id}" data-topic="${t}">${label}<small>${Math.round(talkChance(n, kind ? t : null) * 100)}%</small></button>`;
    }).join('')}</div><p class="note">好きな話題は成功しやすく好感度も大きく上がります。苦手な話題は逆効果。</p>` : ''}
    ${focus === 'invite' ? `<div class="choices invite">${Object.entries(MOTIVES).map(([m, mv]) => `
      <button class="choice ${n.known.motive && personaOf(n).motive === m ? 'like' : ''}" data-action="spyInvite" data-id="${n.id}" data-motive="${m}"
        ${m === 'money' && S.money < inviteCost(st) ? 'disabled' : ''}>${mv.line}${m === 'money' ? `<small>支度金 ${yen(inviteCost(st))}</small>` : ''}</button>`).join('')}
      </div><p class="note">相手の「動機」に合った誘い文句でないと断られます。</p>` : ''}
  </div>`;
}

// ===== 潜入：ライバル店の店内マップ（店長を操作する）=====
// 座標は % 単位（マップは正方形）。人物は足元の位置
const SPY_MAP = {
  door: { x: 84, y: 31 },           // 厨房の扉の前
  entrance: { x: 92, y: 97 },
  tables: [{ x: 24, y: 52 }, { x: 60, y: 57 }, { x: 26, y: 80 }, { x: 64, y: 85 }],
  route: [{ x: 18, y: 35 }, { x: 46, y: 37 }, { x: 72, y: 42 }, { x: 42, y: 66 }, { x: 80, y: 68 }, { x: 48, y: 92 }, { x: 84, y: 32 }],
  bounds: { x1: 4, x2: 96, y1: 31, y2: 98 },
  speed: 26, npcSpeed: 13, reach: 12,
};
const spySeat = i => ({ x: SPY_MAP.tables[i].x - 8, y: SPY_MAP.tables[i].y + 3 });
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

let SPY = null;  // 店内での位置など（保存しない）

function spyInit(st) {
  const free = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
  SPY = {
    storeId: st.id,
    p: { ...SPY_MAP.entrance, flip: true },
    target: null, pending: null, ctx: null, sitting: false,
    npcs: Object.fromEntries(st.npcs.map((n, i) => {
      const w = SPY_MAP.route[(i * 2) % SPY_MAP.route.length];
      return [n.id, { x: w.x, y: w.y, tx: w.x, ty: w.y, wait: 1 + Math.random() * 2 }];
    })),
    // 雰囲気づくりのお客さん（2卓に座っている）
    patrons: free.slice(0, 2).map(i => ({ table: i, look: Chara.randomLook(Math.random() < 0.5 ? 'm' : 'f') })),
  };
}

// 床・席・扉・店員をタップしたときの移動先
function spyGo(target, id) {
  if (!SPY) return;
  SPY.sitting = false;
  SPY.ctx = null;
  if (S.spy) S.spy.focus = null;
  if (target === 'seat') {
    if (SPY.patrons.some(p => p.table === id)) { spySay('そこは他のお客さんが座っている…', 'info'); return; }
    SPY.target = spySeat(id);
    SPY.pending = { type: 'seat', i: id };
  } else if (target === 'door') {
    SPY.target = { ...SPY_MAP.door };
    SPY.pending = { type: 'door' };
  } else if (target === 'npc') {
    const n = SPY.npcs[id];
    if (!n) return;
    SPY.target = { x: n.x + 7, y: n.y };
    SPY.pending = { type: 'npc', id };
  }
  keys.spyPanel = undefined;
}

function spyMoveTo(x, y) {
  if (!SPY) return;
  const b = SPY_MAP.bounds;
  SPY.target = { x: clamp(x, b.x1, b.x2), y: clamp(y, b.y1, b.y2) };
  SPY.pending = null;
  SPY.ctx = null;
  SPY.sitting = false;
  if (S.spy) S.spy.focus = null;
  keys.spyPanel = undefined;
}

// 店員が近くにいると厨房をのぞきにくい
const doorWatchers = () => Object.values(SPY?.npcs || {}).filter(n => dist(n, SPY_MAP.door) < 24).length;
const peekChanceNow = st => clamp(peekChance(st) + (doorWatchers() ? -0.15 * doorWatchers() : 0.1), 0.05, 0.9);

function spyFrame(dt) {
  if (!S.spy || !SPY) return;
  const st = spyStore();
  if (!st) return;
  // 店長の移動
  const P = SPY.p;
  if (SPY.pending?.type === 'npc') {
    const n = SPY.npcs[SPY.pending.id];
    if (n) SPY.target = { x: n.x + 7, y: n.y };
  }
  if (SPY.target) {
    if (moveTo(P, SPY.target, SPY_MAP.speed * dt)) {
      SPY.target = null;
      if (SPY.pending) {
        SPY.ctx = SPY.pending;
        SPY.sitting = SPY.pending.type === 'seat';
        if (SPY.pending.type === 'npc') S.spy.focus = null;
        SPY.pending = null;
        keys.spyPanel = undefined;
      }
    }
  } else P.moving = false;
  // 店員の見回り（話している相手は立ち止まる）
  for (const npc of st.npcs) {
    const n = SPY.npcs[npc.id];
    if (!n) continue;
    const talking = SPY.ctx?.type === 'npc' && SPY.ctx.id === npc.id;
    if (talking) { n.moving = false; n.flip = P.x < n.x; continue; }
    if (n.wait > 0) { n.wait -= dt; n.moving = false; continue; }
    if (moveTo(n, { x: n.tx, y: n.ty }, SPY_MAP.npcSpeed * dt)) {
      const w = rand(SPY_MAP.route);
      n.tx = w.x; n.ty = w.y;
      n.wait = 1.5 + Math.random() * 3;
    }
  }
  // 話している相手から離れたら会話をやめる
  if (SPY.ctx?.type === 'npc') {
    const n = SPY.npcs[SPY.ctx.id];
    if (!n || dist(n, P) > SPY_MAP.reach + 6) { SPY.ctx = null; S.spy.focus = null; keys.spyPanel = undefined; }
  }
  if (currentScreen === 'town') renderSpyMap(st);
}

const spyEls = new Map();
function spyEl(map, key, cls, html) {
  let el = spyEls.get(key);
  if (!el || !el.isConnected) {
    el = document.createElement('div');
    el.className = cls;
    el.innerHTML = html;
    map.appendChild(el);
    spyEls.set(key, el);
  }
  el._seen = true;
  return el;
}

function renderSpyMap(st) {
  const map = $('spyMap');
  if (!map) return;
  for (const el of spyEls.values()) el._seen = false;
  const P = SPY.p;
  const me = spyEl(map, 'me', 'person staff me', PERSON_HTML);
  placePerson(me, { ...P, look: protagLook() }, 'protag');
  me.classList.toggle('sitting', SPY.sitting);
  for (const npc of st.npcs) {
    const n = SPY.npcs[npc.id];
    if (!n) continue;
    const el = spyEl(map, 'n' + npc.id, 'person npc', PERSON_HTML);
    if (!el._init) { el._init = true; el.dataset.action = 'spyGo'; el.dataset.target = 'npc'; el.dataset.id = npc.id; }
    placePerson(el, { ...n, look: npc.look }, 'customer');
    const tag = el.querySelector('.tag');
    const label = `${npc.ace ? '★' : ''}${npc.name}`;
    if (tag.textContent !== label) { tag.textContent = label; tag.className = 'tag ' + (npc.ace ? 'owner' : 'perm'); }
    const bubble = el.querySelector('.bubble');
    const b = npc.aff >= 100 ? '💖' : SPY.ctx?.type === 'npc' && SPY.ctx.id === npc.id ? '💬' : '';
    if (bubble.textContent !== b) bubble.textContent = b;
  }
  SPY.patrons.forEach((p, i) => {
    const el = spyEl(map, 'p' + i, 'person patron', PERSON_HTML);
    if (!el._init) { el._init = true; placePerson(el, { ...spySeat(p.table), look: p.look }, 'customer'); }
  });
  for (const [k, el] of spyEls) if (!el._seen) { el.remove(); spyEls.delete(k); }
}

function spyStaticHTML(st) {
  const type = storeType(st);
  return `
    <div class="spy-wall"><div class="window w1"></div><div class="spy-sign">${type.emoji} ${st.name}</div><div class="window w2"></div></div>
    <div class="spy-counter">${st.recipes.slice(0, 2).map(r => `<span>${DISH[r].emoji}</span>`).join('')}</div>
    <button class="spy-door" data-action="spyGo" data-target="door" aria-label="厨房の扉"><span>STAFF<br>ONLY</span></button>
    <div class="spy-entrance">🚪</div>
    ${SPY_MAP.tables.map((t, i) => `
      <div class="chair" style="left:${spySeat(i).x}%;top:${spySeat(i).y}%;z-index:${9 + Math.round(spySeat(i).y)}">${CHAIR_SVG}</div>
      <button class="table spy-table" data-action="spyGo" data-target="seat" data-id="${i}" aria-label="席${i + 1}"
        style="left:${t.x}%;top:${t.y}%;z-index:${10 + t.y}"></button>`).join('')}`;
}

function spyPanelHTML(st) {
  const ctx = SPY.ctx;
  const recipeLeft = st.recipes.some(r => !S.recipes.includes(r));
  let body = '<p class="note">💡 床をタップして歩く／🪑 席に座って注文／🚪 厨房の扉を調べる／🧑 店員に近づいて話す</p>';
  if (SPY.pending) body = '<p class="note">移動中…</p>';
  if (ctx?.type === 'seat') {
    body = `<div class="spy-actions one">
      <button class="act" data-action="spyEat" ${S.money >= eatCost(st) ? '' : 'disabled'}>
        <b>🍽️ 注文して食べる</b><small>${yen(eatCost(st))}・${recipeLeft ? `レシピを閃く ${Math.round(eatChance(st) * 100)}%` : 'レシピは閃き済み'}</small></button></div>`;
  } else if (ctx?.type === 'door') {
    const w = doorWatchers();
    body = `<p class="note ${w ? 'warn' : 'ok'}">${w ? `👀 近くに店員が${w}人いる…見られているかも` : '✨ 今なら誰も見ていない！'}</p>
      <div class="spy-actions one">
      <button class="act risky" data-action="spyPeek" ${recipeLeft ? '' : 'disabled'}>
        <b>🔍 厨房をのぞく</b><small>${recipeLeft ? `レシピを閃く ${Math.round(peekChanceNow(st) * 100)}%・失敗すると警戒大` : 'レシピは閃き済み'}</small></button></div>`;
  } else if (ctx?.type === 'npc') {
    const n = st.npcs.find(x => x.id === ctx.id);
    if (n) body = `<div class="staff-list">${npcRow(n, true, st)}</div>
      ${S.staff.length >= staffCap() ? '<p class="note warn">スタッフがいっぱいなので、今は誘えません。</p>' : ''}`;
  }
  return `<div class="spy-talk">
      <div class="spy-bust">${Stand.svg(protagStandLook(), S.wardrobe.eq, 'bust')}</div>
      <div class="spy-msg ${S.spy.kind}">${S.spy.msg.replace(/\n/g, '<br>')}</div>
    </div>
    ${body}`;
}

function renderSpy() {
  const st = spyStore();
  const view = $('spyView');
  if (!SPY || SPY.storeId !== st.id) spyInit(st);
  const rebuilt = setKeyed(view, 'spyStatic', 'spy' + st.id, `
    <div class="spy-top">
      <div class="spy-title"><small>潜入中 🕵️ ${storeType(st).type}</small><b>${st.name}</b><span class="grade g${gradeLabel(st.g)}">${gradeLabel(st.g)}</span></div>
      <button class="btn ghost small" data-action="spyLeave">🚪 撤収</button>
    </div>
    <div class="alert-box">
      <div class="alert-label"><span>🚨 警戒ゲージ</span><b id="spyAlertNum"></b></div>
      <div class="bar alert"><i id="spyAlertBar"></i></div>
    </div>
    <div class="spy-map-box"><div id="spyMap" class="spy-map style-${storeType(st).style}">${spyStaticHTML(st)}</div></div>
    <div class="spy-stats" id="spyStats"></div>
    <div id="spyPanel" class="spy-panel"></div>`);
  // 店内を作り直したときだけ、人物の表示を作り直す
  if (rebuilt) { spyEls.clear(); keys.spyPanel = undefined; }
  $('spyAlertNum').textContent = `${Math.round(st.alert)}/100`;
  $('spyAlertBar').style.width = st.alert + '%';
  $('spyStats').textContent = `💖 魅力 ${charm()}　🕶️ 馴染み ${blend(st)}（ドレスコード：${STYLES[storeType(st).style]}）`;
  const ctx = SPY.ctx;
  const key = [S.spy.seq, ctx ? ctx.type + (ctx.id ?? ctx.i ?? '') : '', !!SPY.pending, ctx?.type === 'door' ? doorWatchers() : '',
    st.npcs.map(n => n.id + ':' + n.aff + ':' + Object.keys(n.known).length).join(','), S.spy.focus ? S.spy.focus.id + S.spy.focus.mode : '',
    S.money >= eatCost(st), S.staff.length >= staffCap()].join('|');
  setKeyed($('spyPanel'), 'spyPanel', key, spyPanelHTML(st));
}

function storeCard(st) {
  const now = Date.now();
  const type = storeType(st);
  const d = difficulty(st);
  const battle = S.battles.find(b => b.storeId === st.id);
  const banned = st.bannedUntil > now;
  const cd = st.battleCd > now;
  const alert = Math.round(currentAlert(st));
  const bp = st.boss && bossProgress(BOSS[st.boss]);
  return `<div class="store-card g${gradeLabel(st.g)} ${st.boss ? 'boss' : ''}">
    ${st.boss ? '<div class="boss-label">👑 名店（ボス）</div>' : ''}
    <div class="store-top">
      <span class="store-emoji">${type.emoji}</span>
      <div class="info">
        <div class="name">${st.name}</div>
        <div class="sub">${type.type}・ドレスコード ${STYLES[type.style]}</div>
      </div>
      <span class="grade g${gradeLabel(st.g)}">${gradeLabel(st.g)}</span>
    </div>
    ${bp ? `<div class="chips boss-goals">
      <span class="chip ${bp.item ? 'done' : ''}">${bp.item ? '✅' : '🎁'} 限定アイテム（料理勝負で勝つ）</span>
      <span class="chip ${bp.recipe ? 'done' : ''}">${bp.recipe ? '✅' : '📖'} 固有レシピ</span>
      <span class="chip ${bp.ace ? 'done' : ''}">${bp.ace ? '✅' : '💖'} エースを口説き落とす</span>
    </div>` : ''}
    <div class="chips">
      <span class="chip diff ${d.cls}">${d.label}</span>
      ${st.recipes.filter(r => !S.recipes.includes(r)).map(r => `<span class="chip">📖 ${DISH[r].emoji} ${DISH[r].name}</span>`).join('')}
      ${alert > 0 ? `<span class="chip bad">🚨 警戒 ${alert}</span>` : ''}
      ${banned ? `<span class="chip bad">🚫 出禁 あと<span data-until="${st.bannedUntil}"></span></span>` : ''}
    </div>
    <div class="npc-faces">${st.npcs.map(n => `<div class="face-mini" title="${n.name}">${card(n, 'customer', n.stars)}
      <i style="width:${n.aff}%"></i></div>`).join('')}</div>
    ${battle ? `<div class="battle-line">⚔️ 料理勝負中…あと <span data-until="${battle.until}"></span></div>` : ''}
    <div class="store-btns">
      <button class="btn small" data-action="dispatch" data-store="${st.id}" ${battle || cd ? 'disabled' : ''}>
        ⚔️ 料理勝負${cd && !battle ? `（<span data-until="${st.battleCd}"></span>）` : ''}</button>
      <button class="btn blue small" data-action="closet" data-store="${st.id}" ${banned || S.spy ? 'disabled' : ''}>🕵️ 潜入</button>
    </div>
  </div>`;
}

function renderTown(el) {
  ensureTown();
  const spying = !!spyStore();
  el.hidden = spying;
  $('spyView').hidden = !spying;
  if (spying) return renderSpy();
  const now = Date.now();
  const key = ['town', S.town.stores.map(st => [st.id, st.npcs.length, st.npcs.map(n => n.aff).join('/'), st.recipes.join('/'),
    st.bannedUntil > now, st.battleCd > now, Math.round(currentAlert(st) / 5)].join(':')).join(','),
    S.battles.map(b => b.storeId).join(','), availableForBattle().map(s => s.id + ':' + s.stars).join(','),
    charm(), S.recipes.length, S.money >= refreshCost(), S.rank, S.spy ? 1 : 0,
    BOSSES.map(b => Object.values(bossProgress(b)).join('')).join(',')].join('|');
  setKeyed(el, 'town', key, `
    <div class="protag-card">
      <div class="protag-fig">${Stand.svg(protagStandLook(), S.wardrobe.eq, 'bust')}</div>
      <div class="info">
        <div class="name">店長 <small>22歳</small></div>
        <div class="closet-stats">💖 魅力 <b>${charm()}</b>　🕶️ 馴染み <b>${blend(null)}</b></div>
        <div class="sub">📖 引き抜いたレシピ ${S.recipes.length}種　⚔️ 勝利 ${S.stats.battlesWon || 0}回　🤝 引き抜き ${S.stats.poached || 0}人</div>
        <button class="btn small" data-action="closet">👗 身支度</button>
      </div>
    </div>
    ${bossBoard()}
    <h3>🗺️ 引き抜き作戦</h3>
    <p class="note"><b>格下</b>の店には「⚔️ 料理勝負」（スタッフを送り出して勝負）、<b>格上</b>の店には店長が「🕵️ 潜入」してレシピを閃いたり、店員を口説き落としたりしましょう。
    店舗ランクを上げると、もっと格の高い店（いまは最大 ${gradeLabel(maxGrade())}）が現れます。</p>
    <div class="town-bar">
      <span>お店の入れ替わりまで <b data-until="${S.town.refreshAt}"></b></span>
      <button class="btn ghost small" data-action="refreshTown" ${S.money >= refreshCost() ? '' : 'disabled'}>🔄 ${yen(refreshCost())}で入れ替え</button>
    </div>
    <div class="store-list">${S.town.stores.map(storeCard).join('')}</div>
    <p class="note">好感度や警戒があるお店、出禁中・勝負中のお店は入れ替わりません。</p>`);
}

const refreshCost = () => 50 * maxGrade();

// ボスの一覧（攻略状況）
function bossBoard() {
  return `<h3>👑 名店の攻略</h3>
    <div class="boss-board">${BOSSES.map(b => {
      const p = bossProgress(b);
      const open = b.g <= maxGrade();
      const n = Object.values(p).filter(Boolean).length;
      return `<div class="boss-cell ${bossCleared(b) ? 'cleared' : open ? '' : 'locked'}">
        <span class="be">${open ? b.emoji : '🔒'}</span>
        <b>${open ? b.name : '？？？'}</b>
        <small>${bossCleared(b) ? '👑 制覇！' : open ? `攻略 ${n}/3` : `格 ${gradeLabel(b.g)} の店が現れると挑戦できます`}</small>
      </div>`;
    }).join('')}</div>`;
}

// 残り時間の表示（data-until）を更新する
function updateTimers(root) {
  const now = Date.now();
  root.querySelectorAll('[data-until]').forEach(e => { e.textContent = fmtTime((+e.dataset.until - now) / 1000); });
}

// 毎フレーム：勝負の決着・お店の入れ替え
function townTick() {
  if (S.battles.length && S.battles.some(b => Date.now() >= b.until)) { resolveBattles(); keys.town = undefined; }
  if (S.town && Date.now() >= S.town.refreshAt && !S.spy) { refreshTown(); keys.town = undefined; save(); }
}

document.addEventListener('click', e => {
  const map = e.target.closest('#spyMap');
  if (!map || e.target.closest('[data-action]')) return;
  const r = map.getBoundingClientRect();
  spyMoveTo((e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100);
});

function townAction(d) {
  switch (d.action) {
    case 'spyGo': spyGo(d.target, +d.id); break;
    case 'dispatch': dispatchSel = []; openDispatch(+d.store); break;
    case 'pickMember': pickMember(+d.store, +d.id); break;
    case 'startBattle': startBattle(+d.store); break;
    case 'closet': openCloset(d.store ? +d.store : null); break;
    case 'equip': equip(d.slot, d.id, d.store ? +d.store : null); break;
    case 'buyOutfit': buyOutfit(d.slot, d.id, d.store ? +d.store : null); break;
    case 'startSpy': startSpy(+d.store); break;
    case 'spyEat': spyEat(); break;
    case 'spyPeek': spyPeek(); break;
    case 'spyFocus': spyFocus(+d.id, d.mode); break;
    case 'spyTalk': spyTalk(+d.id, d.topic); break;
    case 'spyObserve': spyObserve(+d.id); break;
    case 'spyInvite': spyInvite(+d.id, d.motive); break;
    case 'hair': changeHair(d.kind, d.id, d.store ? +d.store : null); break;
    case 'spyLeave': endSpy(`🚪 「${spyStore()?.name}」から撤収しました。好感度は次回に持ち越せます`); break;
    case 'refreshTown':
      if (S.money < refreshCost()) break;
      S.money -= refreshCost();
      refreshTown();
      keys.town = undefined;
      save();
      break;
  }
}

boot();
