'use strict';

// 主人公の立ち絵（約6.5頭身）。部位ごとのレイヤーを重ねて描く「着せ替え人形」。
// 各レイヤーは STAND_ASSETS にPNGを登録すると、その画像に差し替わる（assets/stand/README.md 参照）。
const Stand = (() => {
  const W = 240, H = 640;
  const OUT = '#3b2433';

  // PNG に差し替えるレイヤー。キーは「レイヤー名/ID」（髪は「hairBack/long/pink」のように色まで）
  // 例：'body/maid': 'assets/stand/body/maid.png'
  const STAND_ASSETS = {};

  // 服の描き分け。top：胴の色、sleeve：袖の形と色、bottom：スカートかズボン、legs：脚の装い
  const BODIES = {
    maid:      { top: '#ffffff', sleeve: ['puff', '#ffffff'], gloves: '#2b2233', bottom: { skirt: 'mini', c: '#2b2233', frill: '#ffffff', peti: '#a8d8f0' }, legs: ['thigh', '#2a2235'], shoes: '#2b2233' },
    hoodie:    { top: '#9aa7ba', sleeve: ['long', '#9aa7ba'], bottom: { pants: '#3b5b8c' }, shoes: '#f1f5f9' },
    suit:      { top: '#1e293b', sleeve: ['long', '#1e293b'], bottom: { pants: '#1e293b' }, shoes: '#111827' },
    lolita:    { top: '#f9a8d4', sleeve: ['puff', '#f9a8d4'], bottom: { skirt: 'knee', c: '#f9a8d4', frill: '#ffffff', peti: '#ffffff' }, legs: ['socks', '#ffffff'], shoes: '#7c2d12' },
    leather:   { top: '#1f1f1f', sleeve: ['long', '#1f1f1f'], bottom: { pants: '#2d2d3a' }, shoes: '#111111' },
    dress:     { top: '#b91c1c', neck: 'low', bottom: { skirt: 'long', c: '#b91c1c' }, shoes: '#b91c1c' },
    kimono:    { top: '#db2777', sleeve: ['furisode', '#db2777'], bottom: { skirt: 'long', c: '#db2777' }, shoes: '#7c2d12' },
    garcon:    { top: '#ffffff', sleeve: ['long', '#ffffff'], bottom: { pants: '#1f1f2a' }, shoes: '#111111' },
    kappo:     { top: '#ffffff', sleeve: ['long', '#ffffff'], bottom: { pants: '#334155' }, shoes: '#3b2a2a' },
    patissier: { top: '#ffffff', sleeve: ['long', '#ffffff'], bottom: { skirt: 'mini', c: '#3b2f3f' }, legs: ['tights', '#3b2f3f'], shoes: '#3b2f3f' },
    gown:      { top: '#1e1b4b', neck: 'low', bottom: { skirt: 'long', c: '#1e1b4b' }, shoes: '#fde047' },
  };
  const HAND_ITEMS = { bouquet: '💐', bag: '👜', newspaper: '📰', guitar: '🎸', plush: '🧸' };

  const mirror = d => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${(W - +x).toFixed(1)} ${y}`);
  const both = (d, attrs) => `<path d="${d}" ${attrs}/><path d="${mirror(d)}" ${attrs}/>`;
  // 左右対称の楕円（手・髪留め）
  const bothEllipse = (cx, cy, rx, ry, attrs) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${attrs}/><ellipse cx="${W - cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${attrs}/>`;

  function asset(key) {
    const src = STAND_ASSETS[key];
    return src ? `<image href="${src}" x="0" y="0" width="${W}" height="${H}"/>` : null;
  }
  // レイヤー：画像が登録されていれば画像、なければ SVG で描く
  const layer = (key, draw) => asset(key) ?? draw();

  // ===== 髪 =====
  function hairBack(l) {
    const h = l.hair;
    switch (l.style) {
      case 'bob':
        return `<path d="M76 72 Q70 30 120 26 Q170 30 164 72 Q172 122 160 156 Q140 150 120 152 Q100 150 80 156 Q68 122 76 72 Z" fill="${h}"/>`;
      case 'twin':
        return `<path d="M78 72 Q72 30 120 26 Q168 30 162 72 Q166 112 156 140 L84 140 Q74 112 78 72 Z" fill="${h}"/>`
          + both('M82 62 Q46 90 52 170 Q58 240 44 300 Q40 340 58 372 Q62 330 74 300 Q90 240 84 170 Q82 110 92 70 Z', `fill="${h}"`)
          + bothEllipse(84, 66, 7, 7, `fill="${l.accColor || '#ec4899'}"`);
      case 'pony':
        return `<path d="M78 72 Q72 30 120 26 Q168 30 162 72 Q166 112 156 140 L84 140 Q74 112 78 72 Z" fill="${h}"/>
          <path d="M140 40 Q196 40 188 140 Q184 220 196 300 Q170 270 166 200 Q160 120 150 70 Z" fill="${h}"/>`;
      default: // long
        return `<path d="M76 72 Q68 28 120 24 Q172 28 164 72 Q180 160 174 250 Q170 300 160 336 Q150 300 148 262 L92 262 Q90 300 80 336 Q70 300 66 250 Q60 160 76 72 Z" fill="${h}"/>`;
    }
  }

  function hairFront(l) {
    const h = l.hair;
    let s = `<path d="M80 96 Q76 34 120 30 Q164 34 160 96 L152 74 L147 98 L139 68 L131 96 L121 64 L110 96 L102 68 L94 98 L88 74 Z" fill="${h}"/>`;
    if (l.style !== 'bob') s += both('M82 78 Q70 132 80 186 Q88 156 90 104 Z', `fill="${h}"`);
    else s += both('M80 80 Q72 124 82 156 Q90 136 90 100 Z', `fill="${h}"`);
    if (l.hair2) s += `<path d="M136 38 Q156 52 156 84 Q148 64 134 54 Z M100 40 Q86 52 86 80 Q94 62 104 54 Z" fill="${l.hair2}" stroke="none"/>`;
    if (l.ahoge) s += `<path d="M116 32 Q104 2 134 6 Q116 12 126 32 Z" fill="${h}"/>`;
    if (l.clip) s += `<path d="M88 58 L100 70 M100 58 L88 70" fill="none" stroke="#ec4899" stroke-width="4"/>`;
    s += `<path d="M98 44 Q118 34 142 40" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="4"/>`;
    return s;
  }

  // ===== 顔 =====
  function eye(cx, color, left) {
    const o = left ? -1 : 1;
    return `<g stroke="none">
        <path d="M${cx - 12} 101 Q${cx} 84 ${cx + 12} 100 Q${cx} 118 ${cx - 12} 101 Z" fill="#fff"/>
        <ellipse cx="${cx}" cy="103" rx="8.5" ry="11" fill="${color}"/>
        <ellipse cx="${cx}" cy="97" rx="8.5" ry="5" fill="#000" opacity=".22"/>
        <ellipse cx="${cx}" cy="104" rx="4" ry="5.6" fill="#1b1030"/>
        <ellipse cx="${cx}" cy="110" rx="5.5" ry="2.6" fill="#fff" opacity=".35"/>
        <circle cx="${cx - 3}" cy="97" r="3" fill="#fff"/><circle cx="${cx + 3.5}" cy="107" r="1.5" fill="#fff"/>
      </g>
      <path d="M${cx - 13} 97 Q${cx} 83 ${cx + 13} 95" fill="none" stroke="${OUT}" stroke-width="4"/>
      <path d="M${cx + o * 12} 96 L${cx + o * 17} 92" fill="none" stroke="${OUT}" stroke-width="2.4"/>
      <path d="M${cx - 6} 115 Q${cx} 117 ${cx + 6} 115" fill="none" stroke="${OUT}" stroke-width="1.2" stroke-opacity=".6"/>`;
  }

  function face(l) {
    const mouth = l.mouth === 'smile' ? '<path d="M114 127 Q120 131 126 127" fill="none" stroke-width="1.8"/>'
      : l.mouth === 'cat' ? '<path d="M113 126 Q116.5 130 120 126 Q123.5 130 127 126" fill="none" stroke-width="1.8"/>'
      : '<path d="M114 125 Q120 134 126 125 Z" fill="#c2414b" stroke-width="1.6"/>';
    return `<path d="M82 80 Q82 124 120 142 Q158 124 158 80 Q158 40 120 40 Q82 40 82 80 Z" fill="${l.skin}"/>
      <path d="M100 82 Q104 79 110 81 M130 81 Q136 79 140 82" fill="none" stroke-width="1.8" stroke-opacity=".7"/>
      ${eye(104, l.eye, true)}${eye(136, l.eye, false)}
      <path d="M120 113 L119 116" fill="none" stroke-width="1.4" stroke-opacity=".5"/>
      <g stroke="none"><ellipse cx="97" cy="118" rx="7" ry="3.4" fill="#fb7185" opacity=".38"/><ellipse cx="143" cy="118" rx="7" ry="3.4" fill="#fb7185" opacity=".38"/></g>
      ${mouth}`;
  }

  // ===== 体 =====
  const ARM = 'M90 166 Q76 176 74 210 L70 262 Q68 296 70 318 L82 318 Q84 296 86 264 L92 214 Q94 190 100 178 Z';
  const ARM_UPPER = 'M90 166 Q76 176 74 210 L72 234 L90 236 L92 214 Q94 190 100 178 Z';
  const ARM_LOWER = 'M72 234 L70 262 Q68 296 70 318 L82 318 Q84 296 86 264 L90 236 Z';
  const LEG = 'M98 296 Q94 380 99 452 Q101 520 103 588 L117 588 Q118 520 118 452 Q120 380 121 300 Z';
  const LEG_LOW = 'M96 382 Q96 420 99 452 Q101 520 103 588 L117 588 Q118 520 118 452 Q119 416 119 384 Z';
  const LEG_SOCK = 'M99 462 Q101 520 103 588 L117 588 Q118 520 118 462 Z';
  const TORSO = 'M86 160 Q120 150 154 160 Q162 172 158 204 Q152 236 150 262 L90 262 Q88 236 82 204 Q78 172 86 160 Z';
  const TORSO_LOW = 'M84 180 Q120 172 156 180 Q156 206 152 236 L150 262 L90 262 L88 236 Q84 206 84 180 Z';
  const SHOE = 'M100 584 L119 584 L120 602 Q110 610 96 606 Q94 594 100 584 Z';

  function skinBase(l) {
    const sk = `fill="${l.skin}"`;
    return both(ARM, sk)
      + bothEllipse(76, 326, 8, 10, sk)
      + both(LEG, sk)
      + `<path d="M111 126 L111 158 Q120 164 129 158 L129 126 Z" ${sk}/>`
      + `<path d="${TORSO}" ${sk}/>`;
  }

  function skirtPath(len) {
    const end = len === 'long' ? 598 : len === 'knee' ? 430 : 356;
    const spread = len === 'long' ? 64 : len === 'knee' ? 58 : 52;
    return { end, spread, d: `M92 254 L148 254 Q166 300 ${120 + spread} ${end} Q120 ${end + 14} ${120 - spread} ${end} Q74 300 92 254 Z` };
  }
  function frillPath(end, spread, h = 9) {
    const x0 = 120 - spread, n = 10, w = spread * 2 / n;
    let d = `M${x0} ${end}`;
    for (let i = 0; i < n; i++) d += ` q${(w / 2).toFixed(1)} ${h} ${w.toFixed(1)} 0`;
    return d;
  }

  function outfit(id, l) {
    const o = BODIES[id] || BODIES.maid;
    let s = '';
    // 脚の装い
    if (o.legs?.[0] === 'thigh') s += both(LEG_LOW, `fill="${o.legs[1]}"`) + both('M96 382 Q108 388 119 384 L119 392 Q108 396 96 390 Z', `fill="${o.legs[1]}" stroke-width="1.6"`);
    if (o.legs?.[0] === 'socks') s += both(LEG_SOCK, `fill="${o.legs[1]}"`);
    if (o.legs?.[0] === 'tights') s += both(LEG, `fill="${o.legs[1]}"`);
    // ズボン
    if (o.bottom.pants) s += `<path d="M90 254 L150 254 L152 304 L141 592 L123 592 L120 314 L117 592 L99 592 L88 304 Z" fill="${o.bottom.pants}"/>`;
    // 靴
    s += both(SHOE, `fill="${o.shoes}"`);
    if (id === 'maid') s += both('M98 600 L120 600', 'fill="none" stroke="#ec4899" stroke-width="3"');
    // 胴
    s += `<path d="${o.neck === 'low' ? TORSO_LOW : TORSO}" fill="${o.top}"/>`;
    // 袖
    const [sleeve, sc] = o.sleeve || [];
    if (sleeve === 'long') s += both(ARM, `fill="${sc}"`) + both('M68 304 L84 306 L83 318 L69 318 Z', `fill="${sc}" stroke-width="1.6"`);
    if (sleeve === 'puff') s += both('M90 164 Q70 168 72 196 Q84 206 98 192 Z', `fill="${sc}"`);
    if (sleeve === 'furisode') s += both('M90 166 Q74 176 72 212 L58 330 Q72 350 92 334 L94 214 Q96 190 100 178 Z', `fill="${sc}"`);
    if (o.gloves) s += both(ARM_LOWER, `fill="${o.gloves}"`) + bothEllipse(76, 326, 8, 10, `fill="${o.gloves}"`);
    // スカート
    const sk = o.bottom.skirt && skirtPath(o.bottom.skirt);
    if (sk) {
      if (o.bottom.peti) s += `<path d="M${120 - sk.spread - 4} ${sk.end - 6} Q120 ${sk.end + 22} ${120 + sk.spread + 4} ${sk.end - 6} L${120 + sk.spread + 6} ${sk.end + 6} Q120 ${sk.end + 30} ${120 - sk.spread - 6} ${sk.end + 6} Z" fill="${o.bottom.peti}"/>`;
      s += `<path d="${sk.d}" fill="${o.bottom.c}"/>`;
      if (o.bottom.frill) s += `<path d="${frillPath(sk.end, sk.spread)}" fill="${o.bottom.frill}" stroke-width="1.8"/>`;
    }
    // 飾り
    switch (id) {
      case 'maid':
        s += `<path d="M88 214 L152 214 L152 258 L88 258 Z" fill="#2b2233"/>`;
        s += `<path d="M110 220 L130 252 M130 220 L110 252 M110 236 L130 236" fill="none" stroke="#ec4899" stroke-width="2.6"/>`;
        s += `<path d="M112 172 L128 188 M128 172 L112 188" fill="none" stroke="#ec4899" stroke-width="4"/>`;
        s += `<path d="M104 158 q4 6 8 0 q4 6 8 0 q4 6 8 0 q4 6 8 0" fill="#fff" stroke-width="1.8"/>`;
        s += `<path d="M116 156 L120 166 L124 156" fill="#2b2233" stroke-width="1.6"/>`;
        break;
      case 'hoodie':
        s += `<path d="M88 162 Q120 186 152 162 Q146 144 120 144 Q94 144 88 162 Z" fill="#7d8aa0"/>`;
        s += `<path d="M112 170 L110 200 M128 170 L130 200" fill="none" stroke-width="2"/><rect x="98" y="220" width="44" height="24" rx="8" fill="#8794a8" stroke-width="1.8"/>`;
        break;
      case 'suit':
        s += `<path d="M106 158 L120 200 L134 158 Z" fill="#fff" stroke-width="1.8"/>`;
        s += `<path d="M104 158 L118 214 M136 158 L122 214" fill="none" stroke="#475569" stroke-width="3"/>`;
        s += `<g stroke="none" fill="#cbd5e1"><circle cx="120" cy="226" r="3"/><circle cx="120" cy="244" r="3"/></g>`;
        break;
      case 'lolita':
        s += `<path d="M100 160 q5 7 10 0 q5 7 10 0 q5 7 10 0 q5 7 10 0" fill="#fff" stroke-width="1.8"/>`;
        s += `<path d="M120 180 L100 168 L100 192 Z M120 180 L140 168 L140 192 Z" fill="#ec4899" stroke-width="1.8"/><circle cx="120" cy="180" r="5" fill="#ec4899"/>`;
        s += `<path d="M70 380 Q120 396 170 380" fill="none" stroke="#ec4899" stroke-width="3"/>`;
        break;
      case 'leather':
        s += `<path d="M108 158 L120 186 L132 158 Z" fill="#dc2626" stroke-width="1.8"/><path d="M120 186 L120 262" fill="none" stroke="#9ca3af" stroke-width="2.4"/>`;
        s += `<path d="M86 160 L104 156 L112 182 Z M154 160 L136 156 L128 182 Z" fill="#2a2a2a" stroke-width="1.6"/>`;
        s += `<g stroke="none" fill="#d1d5db"><circle cx="96" cy="190" r="2"/><circle cx="144" cy="190" r="2"/><circle cx="94" cy="206" r="2"/><circle cx="146" cy="206" r="2"/></g>`;
        break;
      case 'dress':
        s += `<path d="M98 172 Q120 186 142 172" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="0.1 7"/>`;
        s += `<path d="M90 252 Q120 260 150 252" fill="none" stroke="#7f1d1d" stroke-width="2.4"/><path d="M140 300 Q146 420 150 594" fill="none" stroke="#7f1d1d" stroke-width="1.8"/>`;
        break;
      case 'kimono':
        s += `<path d="M104 156 L136 210 M136 156 L116 190" fill="none" stroke="#fff" stroke-width="5"/>`;
        s += `<path d="M86 222 L154 222 L152 258 L88 258 Z" fill="#facc15"/><path d="M114 222 L126 258" fill="none" stroke="#b45309" stroke-width="2"/>`;
        s += `<g stroke="none" fill="#fbcfe8"><circle cx="96" cy="330" r="5"/><circle cx="148" cy="400" r="6"/><circle cx="108" cy="470" r="4"/><circle cx="140" cy="540" r="5"/><circle cx="64" cy="300" r="4"/><circle cx="176" cy="300" r="4"/></g>`;
        break;
      case 'garcon':
        s += `<path d="M90 160 L114 200 L114 254 L88 254 Q84 210 90 160 Z M150 160 L126 200 L126 254 L152 254 Q156 210 150 160 Z" fill="#1f1f2a"/>`;
        s += `<path d="M86 252 L154 252 L160 440 L80 440 Z" fill="#111118"/>`;
        s += `<path d="M120 166 L106 158 L106 174 Z M120 166 L134 158 L134 174 Z" fill="#111118" stroke-width="1.6"/>`;
        break;
      case 'kappo':
        s += `<path d="M108 156 L120 178 L132 156" fill="#cbd5e1" stroke-width="1.8"/>`;
        s += `<path d="M84 250 Q120 262 156 250 L160 330 Q120 344 80 330 Z" fill="#fff"/>`;
        s += both('M70 290 L86 292', 'fill="none" stroke-width="2"');
        break;
      case 'patissier':
        s += `<path d="M104 156 L136 156 L120 176 Z" fill="#f472b6" stroke-width="1.8"/>`;
        s += `<path d="M86 250 L154 250 L162 310 Q120 322 78 310 Z" fill="#fff"/>`;
        s += `<g stroke="none" fill="${OUT}"><circle cx="108" cy="200" r="3"/><circle cx="132" cy="200" r="3"/><circle cx="108" cy="228" r="3"/><circle cx="132" cy="228" r="3"/></g>`;
        break;
      case 'gown':
        s += `<path d="M98 176 Q120 190 142 176" fill="none" stroke="#fde047" stroke-width="4" stroke-dasharray="0.1 7"/>`;
        s += `<g stroke="none" fill="#fde047"><circle cx="100" cy="320" r="2.4"/><circle cx="144" cy="360" r="3"/><circle cx="116" cy="420" r="2"/><circle cx="150" cy="480" r="2.4"/>
          <circle cx="86" cy="500" r="2.4"/><circle cx="130" cy="540" r="3"/><circle cx="72" cy="580" r="2"/><circle cx="166" cy="580" r="2"/><circle cx="120" cy="230" r="2"/></g>`;
        break;
    }
    return s;
  }

  // ===== 頭・顔・手の装備 =====
  function headItem(id, body) {
    switch (id) {
      case 'beret': return `<ellipse cx="108" cy="36" rx="50" ry="16" fill="#7c3aed" transform="rotate(-12 108 36)"/><circle cx="104" cy="18" r="5" fill="#7c3aed"/>`;
      case 'cap': return `<path d="M76 56 Q78 8 120 8 Q162 8 164 56 Z" fill="#ef4444"/><path d="M122 50 Q170 40 204 58 Q172 68 126 62 Z" fill="#ef4444"/>`;
      case 'starcap': return `<path d="M76 56 Q78 8 120 8 Q162 8 164 56 Z" fill="#facc15"/><path d="M122 50 Q170 40 204 58 Q172 68 126 62 Z" fill="#eab308"/>
        <path d="M120 16 L124.5 26 L135 27 L127 34 L129.5 44.5 L120 39 L110.5 44.5 L113 34 L105 27 L115.5 26 Z" fill="#fff" stroke-width="1.6"/>`;
      case 'fedora': return `<path d="M86 50 Q84 12 120 12 Q156 12 154 50 Z" fill="#1f2937"/><rect x="86" y="38" width="68" height="10" fill="#b91c1c" stroke-width="1.6"/>
        <path d="M56 52 Q120 34 184 52 Q188 62 176 62 L64 62 Q52 62 56 52 Z" fill="#1f2937"/>`;
      case 'tiara': return `<path d="M92 40 L98 18 L110 32 L120 8 L130 32 L142 18 L148 40 Z" fill="#fde047"/>
        <g stroke="none"><circle cx="120" cy="24" r="4.4" fill="#ec4899"/><circle cx="101" cy="30" r="3" fill="#60a5fa"/><circle cx="139" cy="30" r="3" fill="#60a5fa"/></g>`;
      case 'ribbon': return `<path d="M120 24 L88 6 L88 42 Z M120 24 L152 6 L152 42 Z" fill="#ec4899"/><circle cx="120" cy="24" r="7" fill="#ec4899"/>`;
      default:
        return body === 'maid' ? `<path d="M80 50 Q120 18 160 50 Q120 34 80 50 Z" fill="#fff"/>
          <path d="M82 46 q5 -12 12 -5 q5 -12 12 -5 q5 -12 12 -5 q5 -12 12 -5 q5 -12 12 -5 q5 -12 12 -5 q4 -10 6 4" fill="#fff" stroke-width="2"/>
          <path d="M150 40 L162 30 L164 46 Z" fill="#2b2233" stroke-width="1.6"/>` : '';
    }
  }
  function faceItem(id) {
    switch (id) {
      case 'glasses': return `<g fill="#fff" fill-opacity=".15" stroke="#3b2a4a" stroke-width="2.6"><rect x="88" y="88" width="32" height="26" rx="9"/><rect x="120" y="88" width="32" height="26" rx="9"/></g>`;
      case 'sunglasses': return `<g stroke-width="2.4"><rect x="86" y="88" width="33" height="24" rx="9" fill="#111827"/><rect x="121" y="88" width="33" height="24" rx="9" fill="#111827"/></g>
        <g stroke="none" fill="#fff" opacity=".5"><rect x="92" y="92" width="10" height="4" rx="2"/><rect x="127" y="92" width="10" height="4" rx="2"/></g>`;
      case 'mustache': return `<path d="M104 121 Q112 112 120 119 Q128 112 136 121 Q128 126 120 122 Q112 126 104 121 Z" fill="#4a2f1f" stroke-width="1.8"/>`;
      case 'monocle': return `<circle cx="136" cy="102" r="16" fill="#fff" fill-opacity=".14" stroke="#c8963e" stroke-width="3"/><path d="M150 110 Q162 140 154 170" fill="none" stroke="#c8963e" stroke-width="1.8"/>`;
      default: return '';
    }
  }

  // 全身の立ち絵。crop を指定すると上半身などに切り抜ける
  function svg(l, o = {}, crop) {
    const body = o.body || 'maid';
    const hairKey = `${l.style}/${l.hairColorId || 'custom'}`;
    const vb = crop === 'bust' ? '40 0 160 240' : `0 0 ${W} ${H}`;
    return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="120" cy="606" rx="52" ry="9" fill="#000" fill-opacity=".18"/>
      <g stroke="${OUT}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
        ${layer('hairBack/' + hairKey, () => hairBack(l))}
        ${layer('base', () => skinBase(l))}
        ${layer('body/' + body, () => outfit(body, l))}
        ${layer('face', () => face(l))}
        ${layer('hairFront/' + hairKey, () => hairFront(l))}
        ${o.face ? layer('face/' + o.face, () => faceItem(o.face)) : ''}
        ${layer('head/' + (o.head || 'none') + (body === 'maid' && !o.head ? '-maid' : ''), () => headItem(o.head, body))}
        ${o.item ? layer('item/' + o.item, () => HAND_ITEMS[o.item] ? `<text x="140" y="352" font-size="42" stroke="none">${HAND_ITEMS[o.item]}</text>` : '') : ''}
      </g>
    </svg>`;
  }

  return { svg, STAND_ASSETS };
})();
