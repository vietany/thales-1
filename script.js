let fixedPtsThales = [
  { x: 190, y: 55 },
  { x: 70, y: 300 },
  { x: 395, y: 275 }
];
const namesThales = ['A', 'B', 'C'];
let rotThales = 0;

let activeInteractionMode = 'MN';

let curThalesM = null, curThalesN = null;
let animIdThales = null;

function dist(p1, p2) {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

function lerp(p1, p2, t) {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t
  };
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

function setTag(txtId, bgId, textVal, p1, p2, ox, oy) {
  const txt = document.getElementById(txtId);
  const bg = document.getElementById(bgId);
  txt.textContent = textVal;
  const mx = (p1.x + p2.x) / 2 + ox;
  const my = (p1.y + p2.y) / 2 + oy;
  txt.setAttribute('x', mx);
  txt.setAttribute('y', my);
  const b = txt.getBBox();
  bg.setAttribute('x', b.x - 5);
  bg.setAttribute('y', b.y - 3);
  bg.setAttribute('width', b.width + 10);
  bg.setAttribute('height', b.height + 6);
}

function triggerPulse(lineId, p1, p2, activeClass) {
  const el = document.getElementById(lineId);
  el.setAttribute('x1', p1.x);
  el.setAttribute('y1', p1.y);
  el.setAttribute('x2', p2.x);
  el.setAttribute('y2', p2.y);
  
  el.classList.remove(activeClass);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.add(activeClass);
    });
  });
}

function syncCondensedLabels() {
  document.querySelectorAll('.ratio-panel').forEach(panel => {
    const numL = panel.querySelector('.side-tag:first-child .num');
    const denL = panel.querySelector('.side-tag:first-child .den');
    const numR = panel.querySelector('.side-tag:last-child .num');
    const denR = panel.querySelector('.side-tag:last-child .den');

    const condNumL = panel.querySelector('.cond-num-l');
    const condDenL = panel.querySelector('.cond-den-l');
    const condNumR = panel.querySelector('.cond-num-r');
    const condDenR = panel.querySelector('.cond-den-r');

    if (condNumL && numL) condNumL.textContent = numL.textContent;
    if (condDenL && denL) condDenL.textContent = denL.textContent;
    if (condNumR && numR) condNumR.textContent = numR.textContent;
    if (condDenR && denR) condDenR.textContent = denR.textContent;
  });
}

function updateThalesLabels() {
  const vTop = namesThales[rotThales];
  const vL = namesThales[(rotThales + 1) % 3];
  const vR = namesThales[(rotThales + 2) % 3];

  document.getElementById('badgeThales').textContent = `MN // ${vL}${vR}`;

  document.getElementById('nameAM').textContent = `${vTop}M`;
  document.getElementById('nameAB').textContent = `${vTop}${vL}`;
  document.getElementById('nameAN').textContent = `${vTop}N`;
  document.getElementById('nameAC').textContent = `${vTop}${vR}`;

  document.getElementById('nameAM2').textContent = `${vTop}M`;
  document.getElementById('nameBM2').textContent = `M${vL}`;
  document.getElementById('nameAN2').textContent = `${vTop}N`;
  document.getElementById('nameCN2').textContent = `N${vR}`;

  document.getElementById('nameBM3').textContent = `M${vL}`;
  document.getElementById('nameAB3').textContent = `${vTop}${vL}`;
  document.getElementById('nameCN3').textContent = `N${vR}`;
  document.getElementById('nameAC3').textContent = `${vTop}${vR}`;

  syncCondensedLabels();
}

function computeThalesTargets() {
  const top = fixedPtsThales[rotThales];
  const left = fixedPtsThales[(rotThales + 1) % 3];
  const right = fixedPtsThales[(rotThales + 2) % 3];
  const k = parseFloat(document.getElementById('sliderMN').value);
  return {
    top, left, right, k,
    targetM: lerp(top, left, k),
    targetN: lerp(top, right, k)
  };
}

function applyRatioState(panelId, calcL, undefL, calcR, undefR, isUndefL, isUndefR, valL, valR, eqL, eqR, numL, denL, numR, denR, dNumL, dDenL, dNumR, dDenR, trueRatio) {
  const formattedVal = (trueRatio !== null && !isNaN(trueRatio)) ? trueRatio.toFixed(2) : '0.00';

  if (isUndefL) {
    calcL.style.display = 'none';
    undefL.style.display = 'inline';
  } else {
    calcL.style.display = 'inline';
    undefL.style.display = 'none';
    numL.textContent = dNumL;
    denL.textContent = dDenL;
    valL.textContent = formattedVal;
    eqL.style.display = '';
  }

  if (isUndefR) {
    calcR.style.display = 'none';
    undefR.style.display = 'inline';
  } else {
    calcR.style.display = 'inline';
    undefR.style.display = 'none';
    numR.textContent = dNumR;
    denR.textContent = dDenR;
    valR.textContent = formattedVal;
    eqR.style.display = '';
  }
}

function renderThalesGeometry(M, N, top, left, right, k) {
  curThalesM = M;
  curThalesN = N;

  document.getElementById('polyABC').setAttribute(
    'points', 
    `${fixedPtsThales[0].x},${fixedPtsThales[0].y} ${fixedPtsThales[1].x},${fixedPtsThales[1].y} ${fixedPtsThales[2].x},${fixedPtsThales[2].y}`
  );

  const lineMN = document.getElementById('lineMN');
  lineMN.setAttribute('x1', M.x);
  lineMN.setAttribute('y1', M.y);
  lineMN.setAttribute('x2', N.x);
  lineMN.setAttribute('y2', N.y);

  function setPt(id, p) {
    const el = document.getElementById(id);
    el.setAttribute('cx', p.x);
    el.setAttribute('cy', p.y);
  }
  setPt('ptA', fixedPtsThales[0]);
  setPt('ptB', fixedPtsThales[1]);
  setPt('ptC', fixedPtsThales[2]);
  
  setPt('hitA', fixedPtsThales[0]);
  setPt('hitB', fixedPtsThales[1]);
  setPt('hitC', fixedPtsThales[2]);

  setPt('ptM', M);
  setPt('ptN', N);

  function setPos(id, p, dx, dy, text) {
    const el = document.getElementById(id);
    el.setAttribute('x', p.x + dx);
    el.setAttribute('y', p.y + dy);
    if (text) el.textContent = text;
  }
  setPos('lblA', fixedPtsThales[0], -4, -14, 'A');
  setPos('lblB', fixedPtsThales[1], -16, 14, 'B');
  setPos('lblC', fixedPtsThales[2], 14, 12, 'C');
  setPos('lblM', M, -18, -4);
  setPos('lblN', N, 18, -4);

  const dAB_raw = dist(top, left) / 25;
  const dAC_raw = dist(top, right) / 25;

  const dAM_raw = dAB_raw * k;
  const dMB_raw = dAB_raw * (1 - k);
  const dAN_raw = dAC_raw * k;
  const dNC_raw = dAC_raw * (1 - k);

  const dAM = dAM_raw.toFixed(1);
  const dMB = dMB_raw.toFixed(1);
  const dAN = dAN_raw.toFixed(1);
  const dNC = dNC_raw.toFixed(1);
  const dAB = dAB_raw.toFixed(1);
  const dAC = dAC_raw.toFixed(1);

  setTag('txtAM', 'bgAM', dAM, top, M, -20, 0);
  setTag('txtMB', 'bgMB', dMB, M, left, -20, 0);
  setTag('txtAN', 'bgAN', dAN, top, N, 20, 0);
  setTag('txtNC', 'bgNC', dNC, N, right, 20, 0);

  applyRatioState(
    'rowThales1',
    document.getElementById('calcGroup1L'),
    document.getElementById('undef1L'),
    document.getElementById('calcGroup1R'),
    document.getElementById('undef1R'),
    parseFloat(dAB) === 0,
    parseFloat(dAC) === 0,
    document.getElementById('valRatioL'),
    document.getElementById('valRatioR'),
    document.getElementById('eqRatio1L'),
    document.getElementById('eqRatio1R'),
    document.getElementById('numAM'),
    document.getElementById('denAB'),
    document.getElementById('numAN'),
    document.getElementById('denAC'),
    dAM, dAB, dAN, dAC,
    k
  );

  const ratio2 = (1 - k) > 0.0001 ? (k / (1 - k)) : null;
  applyRatioState(
    'rowThales2',
    document.getElementById('calcGroup2L'),
    document.getElementById('undef2L'),
    document.getElementById('calcGroup2R'),
    document.getElementById('undef2R'),
    parseFloat(dMB) === 0 || ratio2 === null,
    parseFloat(dNC) === 0 || ratio2 === null,
    document.getElementById('valRatio2L'),
    document.getElementById('valRatio2R'),
    document.getElementById('eqRatio2L'),
    document.getElementById('eqRatio2R'),
    document.getElementById('numAM2'),
    document.getElementById('denBM2'),
    document.getElementById('numAN2'),
    document.getElementById('denCN2'),
    dAM, dMB, dAN, dNC,
    ratio2
  );

  applyRatioState(
    'rowThales3',
    document.getElementById('calcGroup3L'),
    document.getElementById('undef3L'),
    document.getElementById('calcGroup3R'),
    document.getElementById('undef3R'),
    parseFloat(dAB) === 0,
    parseFloat(dAC) === 0,
    document.getElementById('valRatio3L'),
    document.getElementById('valRatio3R'),
    document.getElementById('eqRatio3L'),
    document.getElementById('eqRatio3R'),
    document.getElementById('numBM3'),
    document.getElementById('denAB3'),
    document.getElementById('numCN3'),
    document.getElementById('denAC3'),
    dMB, dAB, dNC, dAC,
    1 - k
  );
}

function updateThales() {
  if (animIdThales) cancelAnimationFrame(animIdThales);
  updateThalesLabels();
  const { top, left, right, k, targetM, targetN } = computeThalesTargets();
  renderThalesGeometry(targetM, targetN, top, left, right, k);
}

function animateThalesRotate() {
  if (animIdThales) cancelAnimationFrame(animIdThales);
  updateThalesLabels();
  const { top, left, right, k, targetM, targetN } = computeThalesTargets();

  triggerPulse('basePulseThales', left, right, 'pulse-active');

  const startM = curThalesM ? { ...curThalesM } : targetM;
  const startN = curThalesN ? { ...curThalesN } : targetN;
  const startTime = performance.now();
  const duration = 360;

  function frame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const ease = easeOutCubic(progress);

    const currentM = lerp(startM, targetM, ease);
    const currentN = lerp(startN, targetN, ease);
    renderThalesGeometry(currentM, currentN, top, left, right, k);

    if (progress < 1) {
      animIdThales = requestAnimationFrame(frame);
    } else {
      animIdThales = null;
    }
  }
  animIdThales = requestAnimationFrame(frame);
}

function updateThemeColors() {
  const poly = document.getElementById('polyABC');
  const lineMN = document.getElementById('lineMN');
  const ptsABC = document.querySelectorAll('.pt-abc');
  const ptsMN = document.querySelectorAll('.pt-mn');
  const lblsABC = document.querySelectorAll('.lbl-abc');
  const lblsMN = document.querySelectorAll('.lbl-mn');

  if (activeInteractionMode === 'MN') {
    poly.setAttribute('fill', '#dbeafe');
    poly.setAttribute('stroke', '#2563eb');
    lineMN.setAttribute('stroke', '#ea580c');

    ptsABC.forEach(pt => {
      pt.setAttribute('fill', '#2563eb');
      pt.setAttribute('r', '6');
    });
    ptsMN.forEach(pt => pt.setAttribute('fill', '#f59e0b'));

    lblsABC.forEach(lbl => lbl.setAttribute('fill', '#1e40af'));
    lblsMN.forEach(lbl => lbl.setAttribute('fill', '#b45309'));
  } else {
    poly.setAttribute('fill', '#ffedd5');
    poly.setAttribute('stroke', '#ea580c');
    lineMN.setAttribute('stroke', '#2563eb');

    ptsABC.forEach(pt => {
      pt.setAttribute('fill', '#ea580c');
      pt.setAttribute('r', '8');
    });
    ptsMN.forEach(pt => pt.setAttribute('fill', '#3b82f6'));

    lblsABC.forEach(lbl => lbl.setAttribute('fill', '#c2410c'));
    lblsMN.forEach(lbl => lbl.setAttribute('fill', '#1d4ed8'));
  }
}

function setupModeSwitcher() {
  const btnMN = document.getElementById('btnModeMN');
  const btnABC = document.getElementById('btnModeABC');
  const wrap = document.getElementById('wrapThales');

  btnMN.addEventListener('click', () => {
    activeInteractionMode = 'MN';
    btnMN.classList.add('active');
    btnABC.classList.remove('active');
    wrap.classList.remove('mode-abc');
    updateThemeColors();
  });

  btnABC.addEventListener('click', () => {
    activeInteractionMode = 'ABC';
    btnABC.classList.add('active');
    btnMN.classList.remove('active');
    wrap.classList.add('mode-abc');
    updateThemeColors();
  });
}

function setupNormalVectorDrag(wrapId, svgId, sliderId, callback) {
  const wrap = document.getElementById(wrapId);
  const svg = document.getElementById(svgId);
  const slider = document.getElementById(sliderId);
  let isDragging = false;
  let startPoint = { x: 0, y: 0 };
  let startRatio = 0;
  let normalVector = { x: 0, y: 1 };
  let normalLengthSq = 1;

  function getSvgPoint(e) {
    const pt = svg.createSVGPoint();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    pt.x = clientX;
    pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function handleStart(e) {
    if (activeInteractionMode !== 'MN') return;
    if (e.target.classList.contains('vertex-hitbox')) return;

    isDragging = true;
    const pt = getSvgPoint(e);
    startPoint = { x: pt.x, y: pt.y };
    startRatio = parseFloat(slider.value);

    const A = fixedPtsThales[rotThales];
    const B = fixedPtsThales[(rotThales + 1) % 3];
    const C = fixedPtsThales[(rotThales + 2) % 3];

    const bcX = C.x - B.x;
    const bcY = C.y - B.y;
    const bcLenSq = bcX * bcX + bcY * bcY;
    const t = ((A.x - B.x) * bcX + (A.y - B.y) * bcY) / bcLenSq;
    const H = { x: B.x + t * bcX, y: B.y + t * bcY };

    normalVector = { x: H.x - A.x, y: H.y - A.y };
    normalLengthSq = normalVector.x * normalVector.x + normalVector.y * normalVector.y;

    if (e.cancelable) e.preventDefault();
  }

  function handleMove(e) {
    if (!isDragging) return;
    const pt = getSvgPoint(e);
    const deltaVec = { x: pt.x - startPoint.x, y: pt.y - startPoint.y };

    const dotProduct = deltaVec.x * normalVector.x + deltaVec.y * normalVector.y;
    const deltaK = dotProduct / normalLengthSq;

    let ratio = startRatio + deltaK;
    const minVal = parseFloat(slider.min);
    const maxVal = parseFloat(slider.max);
    ratio = Math.max(minVal, Math.min(maxVal, ratio));

    slider.value = ratio;
    callback();
    if (e.cancelable) e.preventDefault();
  }

  function handleEnd() {
    isDragging = false;
  }

  wrap.addEventListener('mousedown', handleStart);
  wrap.addEventListener('touchstart', handleStart, { passive: false });

  window.addEventListener('mousemove', handleMove);
  window.addEventListener('touchmove', handleMove, { passive: false });

  window.addEventListener('mouseup', handleEnd);
  window.addEventListener('touchend', handleEnd);
}

function setupVertexDragging(svgId, callback) {
  const svg = document.getElementById(svgId);
  let draggingVertexIdx = -1;

  function getSvgPoint(e) {
    const pt = svg.createSVGPoint();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    pt.x = clientX;
    pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function onVertexStart(idx, e) {
    if (activeInteractionMode !== 'ABC') return;
    draggingVertexIdx = idx;
    if (e.cancelable) e.preventDefault();
  }

  document.getElementById('hitA').addEventListener('mousedown', (e) => onVertexStart(0, e));
  document.getElementById('hitA').addEventListener('touchstart', (e) => onVertexStart(0, e), { passive: false });

  document.getElementById('hitB').addEventListener('mousedown', (e) => onVertexStart(1, e));
  document.getElementById('hitB').addEventListener('touchstart', (e) => onVertexStart(1, e), { passive: false });

  document.getElementById('hitC').addEventListener('mousedown', (e) => onVertexStart(2, e));
  document.getElementById('hitC').addEventListener('touchstart', (e) => onVertexStart(2, e), { passive: false });

  window.addEventListener('mousemove', (e) => {
    if (draggingVertexIdx === -1) return;
    const pt = getSvgPoint(e);
    fixedPtsThales[draggingVertexIdx].x = Math.max(25, Math.min(435, pt.x));
    fixedPtsThales[draggingVertexIdx].y = Math.max(25, Math.min(315, pt.y));
    callback();
    if (e.cancelable) e.preventDefault();
  });

  window.addEventListener('touchmove', (e) => {
    if (draggingVertexIdx === -1) return;
    const pt = getSvgPoint(e);
    fixedPtsThales[draggingVertexIdx].x = Math.max(25, Math.min(435, pt.x));
    fixedPtsThales[draggingVertexIdx].y = Math.max(25, Math.min(315, pt.y));
    callback();
    if (e.cancelable) e.preventDefault();
  }, { passive: false });

  function onVertexEnd() {
    draggingVertexIdx = -1;
  }

  window.addEventListener('mouseup', onVertexEnd);
  window.addEventListener('touchend', onVertexEnd);
}

document.getElementById('sliderMN').addEventListener('input', updateThales);

document.getElementById('btnRotateThales').addEventListener('click', () => {
  rotThales = (rotThales + 1) % 3;
  animateThalesRotate();
});

setupModeSwitcher();
setupNormalVectorDrag('wrapThales', 'svgThales', 'sliderMN', updateThales);
setupVertexDragging('svgThales', updateThales);

window.addEventListener('DOMContentLoaded', () => {
  updateThemeColors();
  updateThales();
});