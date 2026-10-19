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

  const OWNER_LOOK = {
    g: 'm', skin: '#fdd8bf', hair: '#7a3e2a', style: 'swept', eye: '#f59e0b',
    top: '#ffffff', bottom: '#2a2a3a', skirt: false, acc: 'chef', accColor: '#ef4444', mouth: 'open',
  };

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

  function inner(l, role) {
    return `<ellipse cx="50" cy="114" rx="20" ry="4" fill="#000" fill-opacity=".22" stroke="none"/>
      <g stroke="${OUT}" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round">
        ${backHair(l)}
        ${body(l, role)}
        <ellipse cx="50" cy="40" rx="30" ry="28" fill="${l.skin}"/>
        ${eye(39, l.eye, l.g === 'f', true)}
        ${eye(61, l.eye, l.g === 'f', false)}
        <g stroke="none"><ellipse cx="36.5" cy="55" rx="4.6" ry="2.3" fill="#fb7185" opacity=".45"/>
        <ellipse cx="63.5" cy="55" rx="4.6" ry="2.3" fill="#fb7185" opacity=".45"/></g>
        ${mouth(l)}
        ${frontHair(l)}
        ${accessory(l)}
      </g>`;
  }

  // 全身
  function svg(l, role) {
    return `<svg viewBox="0 -12 100 128" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner(l, role)}</svg>`;
  }

  // 顔アップ（アイコン用）
  function portrait(l, role) {
    return `<svg viewBox="12 -6 76 76" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner(l, role)}</svg>`;
  }

  return { randomLook, svg, portrait, OWNER_LOOK };
})();
