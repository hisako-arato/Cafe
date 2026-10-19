'use strict';

// 2頭身キャラクターを SVG で組み立てる
const Chara = (() => {
  const OUT = '#2b1d33';
  const SKIN = ['#ffe6d5', '#fdd8bf', '#f7c9a6', '#eab48c', '#c98d68'];
  const HAIR = ['#f6d66b', '#eab04a', '#c0703c', '#7a3e2a', '#3a2a2a', '#22223a',
    '#e3e3f0', '#e8615a', '#9466e0', '#4fa8f0', '#45c08a', '#f28dbd'];
  const EYES = ['#2f7cf6', '#16a34a', '#a855f7', '#e11d48', '#f59e0b', '#0ea5e9', '#8b5a2b', '#14b8a6'];
  const TOPS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#0f766e'];
  const BOTTOMS = ['#2d3a5c', '#3b2f2f', '#4b5563', '#1e3a8a', '#7c2d12', '#312e81'];
  const ACC = ['#ef4444', '#3b82f6', '#facc15', '#10b981', '#a855f7', '#f472b6', '#111827'];
  const M_HAIR = ['spiky', 'short', 'swept'];
  const F_HAIR = ['long', 'bob', 'twin', 'pony'];
  const MOUTHS = ['open', 'smile', 'cat', 'open'];

  const pick = a => a[Math.floor(Math.random() * a.length)];

  function randomLook(g) {
    const roll = Math.random();
    let acc = 'none';
    if (roll < 0.15) acc = 'glasses';
    else if (roll < 0.27) acc = 'beret';
    else if (roll < 0.37) acc = g === 'm' ? 'cap' : 'ribbon';
    else if (roll < 0.45) acc = 'headphones';
    return {
      g,
      skin: pick(SKIN),
      hair: pick(HAIR),
      style: pick(g === 'm' ? M_HAIR : F_HAIR),
      eye: pick(EYES),
      top: pick(TOPS),
      bottom: pick(BOTTOMS),
      skirt: g === 'f' && Math.random() < 0.6,
      acc,
      accColor: pick(ACC),
      mouth: pick(MOUTHS),
    };
  }

  // 主人公（店長・22歳）：ピンクの長い髪にアホ毛と×の髪留め、灰青の瞳
  const OWNER_LOOK = {
    g: 'f', skin: '#ffe8dc', hair: '#f59ac0', hair2: '#fde4ef', style: 'long', eye: '#8ea6d4',
    top: '#ffffff', bottom: '#2b2233', skirt: true, acc: 'none', accColor: '#ec4899', mouth: 'open',
    ahoge: true, clip: true,
  };

  // 主人公の服（着せ替え）。arm/top などの色と、追加の飾り（extra）で描き分ける
  const BARE = 'skin';  // 素肌の色を使う印
  const OUTFIT_BODIES = {
    maid:    { arm: '#2b2233', hand: '#2b2233', top: '#ffffff', legs: '#2a2235', skirt: { c: '#2b2233', len: 'mid', frill: '#ffffff', peti: '#a8d8f0' } },
    hoodie:  { arm: '#9aa7ba', top: '#9aa7ba', pants: '#3b5b8c' },
    suit:    { arm: '#1e293b', top: '#1e293b', pants: '#1e293b' },
    dress:   { arm: BARE, top: '#b91c1c', skirt: { c: '#b91c1c', len: 'long' } },
    leather: { arm: '#1f1f1f', top: '#1f1f1f', pants: '#3a3a48' },
    kimono:  { arm: '#db2777', top: '#db2777', skirt: { c: '#db2777', len: 'long' } },
    lolita:  { arm: '#f9a8d4', top: '#f9a8d4', legs: '#ffffff', skirt: { c: '#f9a8d4', len: 'mid', frill: '#ffffff' } },
  };
  const HAND_ITEMS = { bouquet: '💐', bag: '👜', newspaper: '📰', guitar: '🎸', plush: '🧸' };

  // 後ろ髪
  function backHair(l) {
    const h = l.hair;
    switch (l.style) {
      case 'long': return `<path d="M21 40 Q13 86 30 98 L70 98 Q87 86 79 40 Z" fill="${h}"/>`;
      case 'bob': return `<path d="M19 40 Q17 72 31 74 L69 74 Q83 72 81 40 Z" fill="${h}"/>`;
      case 'twin': return `<path d="M25 34 Q2 54 11 94 Q23 86 27 58 Z" fill="${h}"/><path d="M75 34 Q98 54 89 94 Q77 86 73 58 Z" fill="${h}"/>`;
      case 'pony': return `<path d="M64 16 Q98 22 90 76 Q80 60 70 40 Z" fill="${h}"/>`;
      default: return '';
    }
  }

  // 前髪
  function frontHair(l) {
    const h = l.hair;
    let s = '';
    if (l.g === 'm') {
      if (l.style === 'spiky') {
        s += `<path d="M48 10 Q50 -6 64 -5 Q55 0 57 10 Z" fill="${h}"/>`;
        s += `<path d="M19 47 Q15 10 50 8 Q85 10 81 47 L77 34 L73 43 L67 28 L61 39 L55 27 L49 38 L42 27 L36 40 L30 30 L25 43 Z" fill="${h}"/>`;
      } else if (l.style === 'short') {
        s += `<path d="M20 45 Q16 9 50 8 Q84 9 80 45 Q78 34 72 31 Q66 39 58 30 Q52 39 44 30 Q36 39 30 32 Q24 37 20 45 Z" fill="${h}"/>`;
      } else {
        s += `<path d="M19 47 Q13 6 53 7 Q87 12 81 46 L79 32 Q66 37 48 24 Q45 37 34 40 Q38 31 36 26 Q28 35 24 47 Z" fill="${h}"/>`;
      }
    } else {
      s += `<path d="M20 38 Q13 58 20 72 Q27 63 27 44 Z" fill="${h}"/><path d="M80 38 Q87 58 80 72 Q73 63 73 44 Z" fill="${h}"/>`;
      s += `<path d="M19 50 Q14 9 50 8 Q86 9 81 50 L78 38 Q72 30 68 38 L63 27 Q57 37 50 30 Q43 37 37 27 L32 38 Q28 30 22 39 Z" fill="${h}"/>`;
      if (l.style === 'twin') s += `<circle cx="24" cy="36" r="3.4" fill="${l.accColor}"/><circle cx="76" cy="36" r="3.4" fill="${l.accColor}"/>`;
      if (l.style === 'pony') s += `<path d="M68 18 L60 11 L60 25 Z M68 18 L76 11 L76 25 Z" fill="${l.accColor}"/>`;
    }
    if (l.hair2) {
      s += `<path d="M58 12 Q70 22 72 40 Q66 30 60 26 Z M38 12 Q30 20 30 34 Q34 26 40 22 Z" fill="${l.hair2}" stroke="none"/>`;
    }
    if (l.ahoge) s += `<path d="M49 10 Q44 -8 60 -6 Q50 -3 55 10 Z" fill="${h}"/>`;
    if (l.clip) s += `<path d="M28 27 L35 34 M35 27 L28 34" fill="none" stroke="#ec4899" stroke-width="2.8"/>`;
    // ツヤ
    s += `<path d="M32 21 Q44 13 59 15" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3"/>`;
    return s;
  }

  function eye(x, color, female, left) {
    const out = left ? -1 : 1;
    return `<g stroke="none">
      <ellipse cx="${x}" cy="46" rx="6.2" ry="8" fill="#fff"/>
      <ellipse cx="${x}" cy="47" rx="5.3" ry="7" fill="${color}"/>
      <ellipse cx="${x}" cy="47.5" rx="2.7" ry="3.9" fill="#1b1030"/>
      <ellipse cx="${x}" cy="51.5" rx="3.6" ry="1.8" fill="#fff" opacity=".35"/>
      <circle cx="${x - 2}" cy="43.6" r="2.1" fill="#fff"/>
      <circle cx="${x + 2.2}" cy="50" r="1" fill="#fff"/>
    </g>
    <path d="M${x - 7} 41.5 Q${x} 35.5 ${x + 7} 41" fill="none" stroke-width="2.8"/>
    ${female ? `<path d="M${x + out * 6} ${41} L${x + out * 9.5} ${38.5}" fill="none" stroke-width="2"/>` : ''}`;
  }

  function mouth(l) {
    switch (l.mouth) {
      case 'smile': return '<path d="M46 57 Q50 60.5 54 57" fill="none" stroke-width="1.6"/>';
      case 'cat': return '<path d="M45 56.5 Q47.5 59.5 50 56.5 Q52.5 59.5 55 56.5" fill="none" stroke-width="1.5"/>';
      default: return '<path d="M45.5 56 Q50 63 54.5 56 Z" fill="#c2414b" stroke-width="1.4"/>';
    }
  }

  function accessory(l) {
    const c = l.accColor;
    switch (l.acc) {
      case 'glasses':
        return `<g fill="#fff" fill-opacity=".18" stroke="#3b2a4a" stroke-width="1.8">
          <rect x="31.5" y="39.5" width="15" height="12" rx="4"/><rect x="53.5" y="39.5" width="15" height="12" rx="4"/>
          <path d="M46.5 45 L53.5 45" fill="none"/></g>`;
      case 'beret':
        return `<ellipse cx="45" cy="12" rx="25" ry="9" fill="${c}" transform="rotate(-12 45 12)"/><circle cx="44" cy="2.5" r="2.6" fill="${c}"/>`;
      case 'cap':
        return `<path d="M21 24 Q23 1 50 1 Q77 1 79 24 Z" fill="${c}"/><path d="M52 21 Q76 16 94 25 Q78 30 54 27 Z" fill="${c}"/>`;
      case 'ribbon':
        return `<path d="M27 15 L16 8 L16 22 Z M27 15 L38 8 L38 22 Z" fill="${c}"/><circle cx="27" cy="15" r="2.8" fill="${c}"/>`;
      case 'headphones':
        return `<path d="M17 42 Q17 2 50 2 Q83 2 83 42" fill="none" stroke-width="6.5"/>
          <path d="M17 42 Q17 2 50 2 Q83 2 83 42" fill="none" stroke="${c}" stroke-width="3.2"/>
          <rect x="12" y="35" width="10" height="16" rx="4" fill="${c}"/><rect x="78" y="35" width="10" height="16" rx="4" fill="${c}"/>`;
      case 'chef':
        return `<path d="M29 19 Q20 1 37 -2 Q43 -11 54 -7 Q68 -11 71 2 Q81 7 71 19 Z" fill="#fff"/>
          <rect x="29" y="14" width="42" height="9" rx="2.5" fill="#fff"/>
          <path d="M40 4 Q42 10 41 14 M55 2 Q57 9 56 14" fill="none" stroke-width="1.2" stroke-opacity=".5"/>`;
      default: return '';
    }
  }

  function headItem(id, body) {
    switch (id) {
      case 'beret':
        return `<ellipse cx="45" cy="12" rx="25" ry="9" fill="#7c3aed" transform="rotate(-12 45 12)"/><circle cx="44" cy="2.5" r="2.6" fill="#7c3aed"/>`;
      case 'cap':
        return `<path d="M21 24 Q23 1 50 1 Q77 1 79 24 Z" fill="#ef4444"/><path d="M52 21 Q76 16 94 25 Q78 30 54 27 Z" fill="#ef4444"/>`;
      case 'fedora':
        return `<path d="M32 21 Q31 3 50 3 Q69 3 68 21 Z" fill="#1f2937"/><rect x="32" y="15" width="36" height="5" fill="#b91c1c" stroke-width="1.4"/>
          <path d="M18 22 Q50 13 82 22 Q84 27 78 27 L22 27 Q16 27 18 22 Z" fill="#1f2937"/>`;
      case 'tiara':
        return `<path d="M33 17 L37 6 L43 13 L50 1 L57 13 L63 6 L67 17 Z" fill="#fde047"/>
          <g stroke="none"><circle cx="50" cy="9" r="2.4" fill="#ec4899"/><circle cx="38.5" cy="12" r="1.6" fill="#60a5fa"/><circle cx="61.5" cy="12" r="1.6" fill="#60a5fa"/></g>`;
      case 'ribbon':
        return `<path d="M50 9 L36 1 L36 17 Z M50 9 L64 1 L64 17 Z" fill="#ec4899"/><circle cx="50" cy="9" r="3.4" fill="#ec4899"/>`;
      default:
        // メイド服のときはヘッドドレス
        return body === 'maid' ? `<path d="M26 22 Q50 6 74 22 Q50 14 26 22 Z" fill="#fff"/>
          <path d="M27 20 q3 -6 7 -3 q3 -6 7 -3 q3 -6 7 -3 q3 -6 7 -3 q3 -6 7 -3 q3 -6 5 2" fill="#fff" stroke-width="1.6"/>
          <path d="M66 17 L72 12 L73 20 Z" fill="#2b2233" stroke-width="1.4"/>` : '';
    }
  }

  function faceItem(id) {
    switch (id) {
      case 'glasses':
        return accessory({ acc: 'glasses' });
      case 'sunglasses':
        return `<g stroke-width="1.8"><rect x="30.5" y="40" width="17" height="11" rx="4" fill="#111827"/><rect x="52.5" y="40" width="17" height="11" rx="4" fill="#111827"/>
          <path d="M47.5 44 L52.5 44" fill="none"/></g><g stroke="none" fill="#fff" opacity=".55"><rect x="33" y="42" width="5" height="2.4" rx="1"/><rect x="55" y="42" width="5" height="2.4" rx="1"/></g>`;
      case 'mustache':
        return `<path d="M41 56 Q45 51 50 54.5 Q55 51 59 56 Q55 58.5 50 56.5 Q45 58.5 41 56 Z" fill="#4a2f1f" stroke-width="1.4"/>`;
      case 'monocle':
        return `<circle cx="61" cy="46" r="8" fill="#fff" fill-opacity=".15" stroke="#c8963e" stroke-width="2"/>
          <path d="M68 50 Q74 62 70 74" fill="none" stroke="#c8963e" stroke-width="1.2"/>`;
      default: return '';
    }
  }

  // 主人公の体（服ごとに描き分ける）
  function outfitBody(l, id) {
    const o = OUTFIT_BODIES[id] || OUTFIT_BODIES.maid;
    const col = c => c === BARE ? l.skin : c;
    const sk = o.skirt;
    let s = '';
    // 脚と靴
    if (!sk || sk.len !== 'long') {
      const legs = o.pants || o.legs || l.skin;
      const w = o.pants ? 8 : 6, x1 = o.pants ? 41 : 42, x2 = o.pants ? 51 : 52;
      s += `<rect x="${x1}" y="94" width="${w}" height="16" rx="3" fill="${legs}"/><rect x="${x2}" y="94" width="${w}" height="16" rx="3" fill="${legs}"/>`;
    }
    const shoe = id === 'maid' ? '#2b2233' : '#3b2a2a';
    s += `<path d="M37.5 112 Q37.5 106.5 44.5 106.5 Q49.5 106.5 49.5 112 Z" fill="${shoe}"/>`;
    s += `<path d="M50.5 112 Q50.5 106.5 55.5 106.5 Q62.5 106.5 62.5 112 Z" fill="${shoe}"/>`;
    if (id === 'maid') s += `<path d="M38 112 L49 112 M51 112 L62 112" fill="none" stroke="#ec4899" stroke-width="1.8"/>`;
    // 腕
    for (const d of ['M37 70 Q26 76 26 88', 'M63 70 Q74 76 74 88']) {
      s += `<path d="${d}" fill="none" stroke-width="10"/><path d="${d}" fill="none" stroke="${col(o.arm)}" stroke-width="5.6"/>`;
    }
    s += `<circle cx="26" cy="89.5" r="4.4" fill="${col(o.hand || BARE)}"/><circle cx="74" cy="89.5" r="4.4" fill="${col(o.hand || BARE)}"/>`;
    // 胴体
    s += `<path d="M34 99 Q31 76 38 66 Q50 62 62 66 Q69 76 66 99 Z" fill="${col(o.top)}"/>`;
    if (o.pants) s += `<path d="M34.6 91 L65.4 91 L66 99 L34 99 Z" fill="${o.pants}"/>`;
    // スカート
    if (sk) {
      if (sk.len === 'long') {
        s += `<path d="M35 86 L65 86 L72 111 Q50 115 28 111 Z" fill="${sk.c}"/>`;
      } else {
        if (sk.peti) s += `<path d="M25 103 Q50 112 75 103 L76 106 Q50 115 24 106 Z" fill="${sk.peti}"/>`;
        s += `<path d="M34 86 L66 86 L76 103 Q50 110 24 103 Z" fill="${sk.c}"/>`;
        if (sk.frill) s += `<path d="M24 103 q3.25 5 6.5 0 q3.25 5 6.5 0 q3.25 5 6.5 0 q3.25 5 6.5 0 q3.25 5 6.5 0 q3.25 5 6.5 0 q3.25 5 6.5 0 q3.25 5 6.5 0" fill="${sk.frill}" stroke-width="1.6"/>`;
      }
    }
    // 飾り
    switch (id) {
      case 'maid':
        s += `<circle cx="37" cy="70" r="4.6" fill="#fff"/><circle cx="63" cy="70" r="4.6" fill="#fff"/>`;
        s += `<path d="M36.5 77 L63.5 77 L64.5 90 L35.5 90 Z" fill="#2b2233"/>`;
        s += `<path d="M45 79 L55 88 M55 79 L45 88" fill="none" stroke="#ec4899" stroke-width="1.8"/>`;
        s += `<path d="M46.5 67.5 L53.5 74 M53.5 67.5 L46.5 74" fill="none" stroke="#ec4899" stroke-width="2"/>`;
        s += `<path d="M42 65 q2 3 4 0 q2 3 4 0 q2 3 4 0 q2 3 4 0" fill="#fff" stroke-width="1.4"/>`;
        break;
      case 'hoodie':
        s += `<path d="M35 67 Q50 76 65 67 Q63 62 50 62 Q37 62 35 67 Z" fill="#7d8aa0"/>`;
        s += `<path d="M47 70 L46 80 M53 70 L54 80" fill="none" stroke-width="1.4"/><rect x="41" y="82" width="18" height="7" rx="3" fill="#8794a8" stroke-width="1.4"/>`;
        break;
      case 'suit':
        s += `<path d="M44 66 L50 79 L56 66 Z" fill="#fff" stroke-width="1.6"/>`;
        s += `<path d="M42 66 L48 82 M58 66 L52 82" fill="none" stroke="#475569" stroke-width="2"/><g stroke="none" fill="#cbd5e1"><circle cx="50" cy="86" r="1.4"/><circle cx="50" cy="92" r="1.4"/></g>`;
        break;
      case 'dress':
        s += `<path d="M38 66 Q50 72 62 66" fill="none" stroke="#fff" stroke-width="2.2" stroke-dasharray="0.1 3.2"/>`;
        s += `<path d="M36 86 Q50 90 64 86" fill="none" stroke="#7f1d1d" stroke-width="1.6"/>`;
        break;
      case 'leather':
        s += `<path d="M45 66 L50 76 L55 66 Z" fill="#dc2626" stroke-width="1.6"/><path d="M50 76 L50 99" fill="none" stroke="#9ca3af" stroke-width="1.6"/>`;
        s += `<g stroke="none" fill="#d1d5db"><circle cx="40" cy="72" r="1.2"/><circle cx="60" cy="72" r="1.2"/><circle cx="39" cy="78" r="1.2"/><circle cx="61" cy="78" r="1.2"/></g>`;
        break;
      case 'kimono':
        s += `<path d="M43 65 L56 82 M57 65 L49 75" fill="none" stroke="#fff" stroke-width="2.6"/>`;
        s += `<rect x="35" y="80" width="30" height="8" fill="#facc15" stroke-width="1.6"/><path d="M48 80 L52 88" fill="none" stroke="#b45309" stroke-width="1.4"/>`;
        s += `<g stroke="none" fill="#fbcfe8"><circle cx="42" cy="96" r="2"/><circle cx="58" cy="102" r="2"/><circle cx="46" cy="106" r="1.6"/></g>`;
        break;
      case 'lolita':
        s += `<path d="M42 65 q2 3 4 0 q2 3 4 0 q2 3 4 0 q2 3 4 0" fill="#fff" stroke-width="1.4"/>`;
        s += `<path d="M50 72 L42 67 L42 77 Z M50 72 L58 67 L58 77 Z" fill="#ec4899" stroke-width="1.6"/><circle cx="50" cy="72" r="2.2" fill="#ec4899"/>`;
        break;
    }
    return s;
  }

  // 体（役職で服が変わる）
  function body(l, role) {
    const isCustomer = role === 'customer';
    const top = isCustomer ? l.top : '#f8fafc';
    const bottom = isCustomer ? l.bottom : '#2a2a3a';
    let s = '';
    // 脚と靴
    if (l.skirt) {
      s += `<rect x="42" y="96" width="6" height="14" rx="3" fill="${l.skin}"/><rect x="52" y="96" width="6" height="14" rx="3" fill="${l.skin}"/>`;
    } else {
      s += `<rect x="41" y="94" width="8" height="16" rx="3" fill="${bottom}"/><rect x="51" y="94" width="8" height="16" rx="3" fill="${bottom}"/>`;
    }
    s += `<path d="M37.5 112 Q37.5 106.5 44.5 106.5 Q49.5 106.5 49.5 112 Z" fill="#3b2a2a"/>`;
    s += `<path d="M50.5 112 Q50.5 106.5 55.5 106.5 Q62.5 106.5 62.5 112 Z" fill="#3b2a2a"/>`;
    // 腕（太い線で縁取り）
    for (const d of ['M37 70 Q26 76 26 88', 'M63 70 Q74 76 74 88']) {
      s += `<path d="${d}" fill="none" stroke-width="10"/><path d="${d}" fill="none" stroke="${top}" stroke-width="5.6"/>`;
    }
    s += `<circle cx="26" cy="89.5" r="4.4" fill="${l.skin}"/><circle cx="74" cy="89.5" r="4.4" fill="${l.skin}"/>`;
    // 胴体
    s += `<path d="M34 99 Q31 76 38 66 Q50 62 62 66 Q69 76 66 99 Z" fill="${top}"/>`;
    if (l.skirt) s += `<path d="M34.5 89 L65.5 89 L71 102 Q50 107 29 102 Z" fill="${bottom}"/>`;
    else s += `<path d="M34.6 91 L65.4 91 L66 99 L34 99 Z" fill="${bottom}"/>`;

    if (isCustomer) {
      s += `<path d="M43 66 L50 74 L57 66" fill="#fff" stroke-width="1.8"/>`;
      s += `<path d="M37 80 Q50 84 63 80" fill="none" stroke-width="1.2" stroke-opacity=".35"/>`;
    } else if (role === 'part') {
      s += `<path d="M44 66 L39 75 M56 66 L61 75" fill="none" stroke-width="1.8"/>`;
      s += `<path d="M38.5 75 L61.5 75 L65 101 L35 101 Z" fill="#fb923c"/>`;
      s += `<rect x="44.5" y="85" width="11" height="7" rx="2" fill="#fdba74" stroke-width="1.4"/>`;
    } else if (role === 'perm') {
      s += `<path d="M38 67 L47 82 L47 99 L34.5 99 Q31.5 78 38 67 Z" fill="#1f2937"/>`;
      s += `<path d="M62 67 L53 82 L53 99 L65.5 99 Q68.5 78 62 67 Z" fill="#1f2937"/>`;
      s += `<path d="M50 70 L43 66 L43 74.5 Z M50 70 L57 66 L57 74.5 Z" fill="#e11d48" stroke-width="1.6"/>`;
      s += `<rect x="55.5" y="80" width="7" height="4.5" rx="1" fill="#facc15" stroke-width="1.2"/>`;
    } else if (role === 'owner') {
      s += `<path d="M42 66 L58 66 L50 76 Z" fill="#ef4444" stroke-width="1.6"/>`;
      s += `<g stroke="none" fill="${OUT}"><circle cx="45" cy="81" r="1.5"/><circle cx="55" cy="81" r="1.5"/>
        <circle cx="45" cy="89" r="1.5"/><circle cx="55" cy="89" r="1.5"/></g>`;
    }
    return s;
  }

  // role が 'owner'（店内のメイド服）か 'protag'（着せ替え中）なら主人公として描く
  function inner(l, role, outfit) {
    const o = role === 'owner' ? { body: 'maid' } : role === 'protag' ? (outfit || { body: 'maid' }) : null;
    return `<ellipse cx="50" cy="114" rx="20" ry="4" fill="#000" fill-opacity=".22" stroke="none"/>
      <g stroke="${OUT}" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round">
        ${backHair(l)}
        ${o ? outfitBody(l, o.body) : body(l, role)}
        <ellipse cx="50" cy="40" rx="30" ry="28" fill="${l.skin}"/>
        ${eye(39, l.eye, l.g === 'f', true)}
        ${eye(61, l.eye, l.g === 'f', false)}
        <g stroke="none"><ellipse cx="36.5" cy="55" rx="4.6" ry="2.3" fill="#fb7185" opacity=".45"/>
        <ellipse cx="63.5" cy="55" rx="4.6" ry="2.3" fill="#fb7185" opacity=".45"/></g>
        ${mouth(l)}
        ${frontHair(l)}
        ${o ? faceItem(o.face) + headItem(o.head, o.body) : accessory(l)}
        ${o && HAND_ITEMS[o.item] ? `<text x="68" y="99" font-size="15" stroke="none">${HAND_ITEMS[o.item]}</text>` : ''}
      </g>`;
  }

  // 全身
  function svg(l, role, outfit) {
    return `<svg viewBox="0 -12 100 128" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner(l, role, outfit)}</svg>`;
  }

  // 顔アップ（アイコン用）
  function portrait(l, role, outfit) {
    return `<svg viewBox="12 -6 76 76" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner(l, role, outfit)}</svg>`;
  }

  return { randomLook, svg, portrait, OWNER_LOOK };
})();
