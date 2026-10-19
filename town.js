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

const TOWN_SIZE = 6;
const TOWN_REFRESH_MS = 15 * 60 * 1000;
const BAN_MS = 20 * 60 * 1000;
const BATTLE_CD_MS = 5 * 60 * 1000;
const ALERT_DECAY_PER_MIN = 10;

const gradeLabel = g => g <= 2 ? 'E' : g <= 4 ? 'D' : g <= 6 ? 'C' : g <= 8 ? 'B' : g === 9 ? 'A' : 'S';
const storeType = st => STORE_TYPES.find(t => t.g === st.g);
const storeById = id => S.town.stores.find(st => st.id === id);
const maxGrade = () => Math.min(10, Math.floor(3 + S.rank * 1.5));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ===== 主人公の魅力・馴染み =====
function equipped() {
  return Object.values(S.wardrobe.eq).filter(Boolean).map(id => OUTFIT[id]);
}
function charm() {
  return 20 + Math.floor(S.level / 2) + equipped().reduce((a, o) => a + o.charm, 0);
}
function blend(store) {
  let b = 10 + equipped().reduce((a, o) => a + o.blend, 0);
  if (store) {
    // その店の雰囲気（ドレスコード）に合っていると馴染みやすい
    const style = storeType(store).style;
    for (const o of equipped()) if (o.style === style) b += o.slot === 'body' ? 15 : 3;
  }
  return b;
}
// 失敗したときの警戒の増え方（馴染みが高いほど小さい）
const alertMult = store => clamp(1 - blend(store) / 120, 0.3, 1.3);

// ===== 街のお店 =====
function genNpc(g, ace, type) {
  const p = randomPerson();
  const stars = Math.min(5, 2 + Math.floor((g - 1) / 3) + (Math.random() < 0.4 ? 1 : 0) + (ace ? 1 : 0));
  return {
    id: S.town.nextId++, ...p, stars, ace,
    title: ace ? type.ace : rand(NPC_TITLES),
    ideal: 12 + g * 10 + Math.round(Math.random() * 8 - 4) + (ace ? 8 : 0),
    aff: 0,
  };
}

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
function storePinned(st) {
  const now = Date.now();
  return st.npcs.some(n => n.aff > 0) || st.bannedUntil > now || st.battleCd > now ||
    S.battles.some(b => b.storeId === st.id) || (S.spy && S.spy.storeId === st.id);
}

function refreshTown() {
  const keep = S.town.stores.filter(storePinned);
  S.town.stores = keep;
  const mg = maxGrade();
  // 一番上の格の店を必ず1軒、残りは少し下の格から
  const want = [mg];
  while (want.length + keep.length < TOWN_SIZE) want.push(Math.max(1, mg - Math.floor(Math.random() * 5)));
  for (const g of want) S.town.stores.push(genStore(g));
  S.town.stores.sort((a, b) => a.g - b.g);
  S.town.refreshAt = Date.now() + TOWN_REFRESH_MS;
}

function ensureTown() {
  if (!S.town) S.town = { stores: [], refreshAt: 0, nextId: 1 };
  if (!S.town.stores.length || Date.now() >= S.town.refreshAt) refreshTown();
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
const storePower = st => 1 + st.g * 2.2;
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
      const recipe = st.recipes.find(r => !S.recipes.includes(r));
      if (recipe && (great || Math.random() < 0.4)) lines.push(learnRecipe(recipe, st));
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

function learnRecipe(id, st) {
  if (S.recipes.includes(id)) return '';
  S.recipes.push(id);
  st.recipes = st.recipes.filter(r => r !== id);
  S.stats.recipes = (S.stats.recipes || 0) + 1;
  const d = DISH[id];
  return `💡 レシピ「${d.emoji} ${d.name}」を閃きました！ 厨房で作れます`;
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
    owner: false, post: 'any', x: L.door.x, y: L.door.y, task: null,
  });
  S.stats.poached = (S.stats.poached || 0) + 1;
  return `🤝 ${how}「${st.name}」の${npc.title}・${npc.name}さん（${starStr(npc.stars)}）がアルバイトとして加入しました！`;
}

// ===== 潜入（店長が客のふりをして入り込む）=====
const SPY_LINES = {
  eatOk: ['ひと口で隠し味がわかった…！', 'この香り、あのスパイスね！', '舌が覚えた。家でも作れそう！'],
  eatNg: ['…普通においしいだけだった', 'うーん、何が入ってるのかわからない', '食べるのに夢中で観察を忘れた…'],
  peekOk: ['厨房の壁にレシピのメモが！', '仕込みの手順をしっかり見た！', '調味料の配合をこっそりメモした！'],
  peekNg: ['「お客様、そちらは厨房です」', '扉を開けたら店長と目が合った…', '鍋をひっくり返しそうになった！'],
  talkOk: ['「えっ、そんなふうに言われたの初めてです…」', '「ふふ、お客さん面白い人ですね」', '「また来てくれたら嬉しいな」', '「実は、今のお店ちょっと大変で…」'],
  talkNg: ['「…ご注文はお決まりですか？」', '「仕事中なので…」', '「店長に呼ばれちゃうので失礼します」', '（少し警戒されたみたい…）'],
  invite: ['「…あなたのお店、行ってみたいです！」', '「決めました。お世話になります！」', '「ずっとこんなお店で働きたかったんです」'],
};
const eatCost = st => 20 + st.g * 25;
const eatChance = st => clamp(0.22 + blend(st) / 300 - (st.g - maxGrade()) * 0.02, 0.05, 0.6);
const peekChance = st => clamp(0.45 + blend(st) / 250 - st.g * 0.02, 0.1, 0.8);
const talkChance = npc => clamp(0.4 + (charm() - npc.ideal) / 80, 0.06, 0.92);

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
  S.spy = { storeId, msg: `${storeType(st).emoji} 「${st.name}」に客のふりをして入りました。怪しまれないように…`, kind: 'info', seq: 0 };
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
  if (msg) toast(msg, true);
  keys.town = undefined;
  $('town').scrollTop = 0;
  save();
}

function spySay(text, kind) {
  S.spy.msg = text;
  S.spy.kind = kind;
  S.spy.seq++;
}

function raiseAlert(st, base) {
  st.alert = Math.min(100, st.alert + base * alertMult(st));
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
  if (!st || S.money < eatCost(st)) return;
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
  if (!recipe) return;
  if (Math.random() < peekChance(st)) {
    spySay(`🔍 ${rand(SPY_LINES.peekOk)}\n${learnRecipe(recipe, st)}`, 'good');
    addLog(`💡 潜入先でレシピ「${DISH[recipe].name}」を閃きました`, true);
  } else {
    spySay(`🔍 ${rand(SPY_LINES.peekNg)}`, 'bad');
    if (raiseAlert(st, 30)) return;
  }
  save();
}

function spyTalk(npcId) {
  const st = spyStore();
  const npc = st && st.npcs.find(n => n.id === npcId);
  if (!npc || npc.aff >= 100) return;
  if (Math.random() < talkChance(npc)) {
    const gain = Math.round(18 + Math.random() * 14 + Math.max(0, (charm() - npc.ideal) / 5));
    npc.aff = Math.min(100, npc.aff + gain);
    spySay(`💬 ${npc.name}：${rand(SPY_LINES.talkOk)}\n（好感度 +${gain}${npc.aff >= 100 ? '・誘えそう！' : ''}）`, 'good');
  } else {
    npc.aff = Math.min(100, npc.aff + 2);
    spySay(`💬 ${npc.name}：${rand(SPY_LINES.talkNg)}`, 'bad');
    if (raiseAlert(st, 16)) return;
  }
  save();
}

function spyInvite(npcId) {
  const st = spyStore();
  const npc = st && st.npcs.find(n => n.id === npcId);
  if (!npc || npc.aff < 100 || S.staff.length >= staffCap()) return;
  const line = rand(SPY_LINES.invite);
  const msg = joinFromStore(st, npc, '口説き落とされて');
  spySay(`💖 ${npc.name}：${line}\n${msg}`, 'good');
  addLog(msg, true);
  addXp(st.g * 3);
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
      <div class="closet-fig">${Chara.svg(Chara.OWNER_LOOK, 'protag', eq)}</div>
      <div>
        <b>店長（22歳）</b>
        <div class="closet-stats">💖 魅力 <b>${charm()}</b>　🕶️ 馴染み <b>${blend(st)}</b></div>
        ${st ? `<p class="note">行き先：${storeType(st).emoji} ${st.name}<br>ドレスコード：<b>${STYLES[storeType(st).style]}</b>（合う服だと馴染みやすい）</p>` : ''}
        <p class="note">魅力は店員を口説く成功率、馴染みは失敗したときの警戒の増えにくさに効きます。</p>
      </div>
    </div>
    ${Object.entries(SLOTS).map(([slot, label]) => `
      <h3>${label}</h3>
      <div class="outfit-list">
        ${slot !== 'body' ? `<button class="outfit ${!eq[slot] ? 'on' : ''}" data-action="equip" data-slot="${slot}" data-id="" data-store="${storeId || ''}"><b>なし</b></button>` : ''}
        ${OUTFITS.filter(o => o.slot === slot).map(o => {
          const owned = S.wardrobe.owned.includes(o.id);
          const on = eq[slot] === o.id;
          return `<button class="outfit ${on ? 'on' : ''} ${owned ? '' : 'shop'} ${st && o.style === storeType(st).style ? 'match' : ''}"
            data-action="${owned ? 'equip' : 'buyOutfit'}" data-slot="${slot}" data-id="${o.id}" data-store="${storeId || ''}"
            ${!owned && S.money < o.price ? 'disabled' : ''}>
            <b>${o.name}</b><small>${STYLES[o.style]}</small>
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
function npcRow(n, spying) {
  const p = Math.round(talkChance(n) * 100);
  return `<div class="row npc">
    ${card(n, 'customer', n.stars)}
    <div class="info">
      <div class="name">${NATIONS[n.nation].flag} ${n.name}さん ${n.ace ? '<span class="badge ace">エース</span>' : ''}</div>
      <div class="sub">${n.title}　<span class="stars">${starStr(n.stars)}</span>　理想の高さ ${n.ideal}</div>
      <div class="bar aff"><i style="width:${n.aff}%"></i></div>
      <div class="sub">好感度 ${Math.round(n.aff)}/100${spying ? `　口説ける確率 ${p}%` : ''}</div>
    </div>
    ${spying ? (n.aff >= 100
      ? `<button class="btn pink small" data-action="spyInvite" data-id="${n.id}" ${S.staff.length >= staffCap() ? 'disabled' : ''}>💖 誘う</button>`
      : `<button class="btn small" data-action="spyTalk" data-id="${n.id}">💬 話す</button>`) : ''}
  </div>`;
}

function renderSpy(el) {
  const st = spyStore();
  const type = storeType(st);
  const recipeLeft = st.recipes.some(r => !S.recipes.includes(r));
  const key = ['spy', st.id, Math.round(st.alert), S.spy.seq, st.npcs.map(n => n.id + ':' + n.aff).join(','),
    recipeLeft, S.money >= eatCost(st), S.staff.length >= staffCap(), charm()].join('|');
  setKeyed(el, 'town', key, `
    <div class="spy-head">
      <div><small>潜入中 🕵️</small><b>${type.emoji} ${st.name}</b><span class="grade g${gradeLabel(st.g)}">${gradeLabel(st.g)}</span></div>
      <button class="btn ghost small" data-action="spyLeave">🚪 撤収</button>
    </div>
    <div class="alert-box">
      <div class="alert-label"><span>🚨 警戒ゲージ</span><b>${Math.round(st.alert)}/100</b></div>
      <div class="bar alert"><i style="width:${st.alert}%"></i></div>
      <p class="note">失敗すると溜まり、満タンになると追い出されます。撤収すれば好感度は次回に持ち越せます。</p>
    </div>
    <div class="spy-scene">
      <div class="spy-fig">${Chara.svg(Chara.OWNER_LOOK, 'protag', S.wardrobe.eq)}</div>
      <div class="spy-msg ${S.spy.kind}">${S.spy.msg.replace(/\n/g, '<br>')}</div>
    </div>
    <div class="closet-stats center">💖 魅力 <b>${charm()}</b>　🕶️ 馴染み <b>${blend(st)}</b>（ドレスコード：${STYLES[type.style]}）</div>
    <h3>行動</h3>
    <div class="spy-actions">
      <button class="act" data-action="spyEat" ${S.money >= eatCost(st) ? '' : 'disabled'}>
        <b>🍽️ 料理を食べる</b><small>${yen(eatCost(st))}・${recipeLeft ? `レシピを閃く ${Math.round(eatChance(st) * 100)}%` : 'レシピは閃き済み'}</small></button>
      <button class="act risky" data-action="spyPeek" ${recipeLeft ? '' : 'disabled'}>
        <b>🔍 キッチンを調べる</b><small>${recipeLeft ? `レシピを閃く ${Math.round(peekChance(st) * 100)}%・失敗すると警戒大` : 'レシピは閃き済み'}</small></button>
    </div>
    <h3>店員に話しかける</h3>
    <div class="staff-list">${st.npcs.length ? st.npcs.map(n => npcRow(n, true)).join('') : '<p class="note">この店にはもう引き抜ける店員がいません。</p>'}</div>
    ${S.staff.length >= staffCap() ? '<p class="note warn">スタッフがいっぱいなので、今は誘えません。</p>' : ''}`);
}

function storeCard(st) {
  const now = Date.now();
  const type = storeType(st);
  const d = difficulty(st);
  const battle = S.battles.find(b => b.storeId === st.id);
  const banned = st.bannedUntil > now;
  const cd = st.battleCd > now;
  const alert = Math.round(currentAlert(st));
  return `<div class="store-card g${gradeLabel(st.g)}">
    <div class="store-top">
      <span class="store-emoji">${type.emoji}</span>
      <div class="info">
        <div class="name">${st.name}</div>
        <div class="sub">${type.type}・ドレスコード ${STYLES[type.style]}</div>
      </div>
      <span class="grade g${gradeLabel(st.g)}">${gradeLabel(st.g)}</span>
    </div>
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
  if (spyStore()) return renderSpy(el);
  const now = Date.now();
  const key = ['town', S.town.stores.map(st => [st.id, st.npcs.length, st.npcs.map(n => n.aff).join('/'), st.recipes.join('/'),
    st.bannedUntil > now, st.battleCd > now, Math.round(currentAlert(st) / 5)].join(':')).join(','),
    S.battles.map(b => b.storeId).join(','), availableForBattle().map(s => s.id + ':' + s.stars).join(','),
    charm(), S.recipes.length, S.money >= refreshCost(), S.rank, S.spy ? 1 : 0].join('|');
  setKeyed(el, 'town', key, `
    <div class="protag-card">
      <div class="protag-fig">${Chara.svg(Chara.OWNER_LOOK, 'protag', S.wardrobe.eq)}</div>
      <div class="info">
        <div class="name">店長 <small>22歳</small></div>
        <div class="closet-stats">💖 魅力 <b>${charm()}</b>　🕶️ 馴染み <b>${blend(null)}</b></div>
        <div class="sub">📖 引き抜いたレシピ ${S.recipes.length}種　⚔️ 勝利 ${S.stats.battlesWon || 0}回　🤝 引き抜き ${S.stats.poached || 0}人</div>
        <button class="btn small" data-action="closet">👗 身支度</button>
      </div>
    </div>
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

function townAction(d) {
  switch (d.action) {
    case 'dispatch': dispatchSel = []; openDispatch(+d.store); break;
    case 'pickMember': pickMember(+d.store, +d.id); break;
    case 'startBattle': startBattle(+d.store); break;
    case 'closet': openCloset(d.store ? +d.store : null); break;
    case 'equip': equip(d.slot, d.id, d.store ? +d.store : null); break;
    case 'buyOutfit': buyOutfit(d.slot, d.id, d.store ? +d.store : null); break;
    case 'startSpy': startSpy(+d.store); break;
    case 'spyEat': spyEat(); break;
    case 'spyPeek': spyPeek(); break;
    case 'spyTalk': spyTalk(+d.id); break;
    case 'spyInvite': spyInvite(+d.id); break;
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
