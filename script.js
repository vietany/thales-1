let fixedPtsThales = [
  { x: 123, y: 58 },
  { x: 78, y: 282 },
  { x: 382, y: 282 }
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
  bg.setAttribute('x', b.x - 10);
  bg.setAttribute('y', b.y - 6);
  bg.setAttribute('width', b.width + 20);
  bg.setAttribute('height', b.height + 12);
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

  const pL = 'M';
  const pR = 'N';

  document.getElementById('badgeThales').textContent = `${pL}${pR} // ${vL}${vR}`;

  document.getElementById('nameAM').textContent = `${vTop}${pL}`;
  document.getElementById('nameAB').textContent = `${vTop}${vL}`;
  document.getElementById('nameAN').textContent = `${vTop}${pR}`;
  document.getElementById('nameAC').textContent = `${vTop}${vR}`;

  document.getElementById('nameAM2').textContent = `${vTop}${pL}`;
  document.getElementById('nameBM2').textContent = `${pL}${vL}`;
  document.getElementById('nameAN2').textContent = `${vTop}${pR}`;
  document.getElementById('nameCN2').textContent = `${pR}${vR}`;

  document.getElementById('nameBM3').textContent = `${pL}${vL}`;
  document.getElementById('nameAB3').textContent = `${vTop}${vL}`;
  document.getElementById('nameCN3').textContent = `${pR}${vR}`;
  document.getElementById('nameAC3').textContent = `${vTop}${vR}`;

  document.getElementById('lblM').textContent = pL;
  document.getElementById('lblN').textContent = pR;

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

function applyRatioState(
  calcL, undefL, calcR, undefR, 
  numL, denL, numR, denR, 
  valL, valR, eqL, eqR, 
  strNumL, strDenL, strNumR, strDenR, 
  canonicalRatio
) {
  const vDenL = parseFloat(strDenL);
  const vDenR = parseFloat(strDenR);

  if (vDenL === 0 || isNaN(vDenL) || canonicalRatio === null) {
    calcL.style.display = 'none';
    undefL.style.display = 'inline';
  } else {
    calcL.style.display = 'inline';
    undefL.style.display = 'none';
    numL.textContent = strNumL;
    denL.textContent = strDenL;
    valL.textContent = canonicalRatio.toFixed(2);
    eqL.style.display = '';
  }

  if (vDenR === 0 || isNaN(vDenR) || canonicalRatio === null) {
    calcR.style.display = 'none';
    undefR.style.display = 'inline';
  } else {
    calcR.style.display = 'inline';
    undefR.style.display = 'none';
    numR.textContent = strNumR;
    denR.textContent = strDenR;
    valR.textContent = canonicalRatio.toFixed(2);
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
  setPos('lblA', fixedPtsThales[0], -4, -20, 'A');
  setPos('lblB', fixedPtsThales[1], -24, 20, 'B');
  setPos('lblC', fixedPtsThales[2], 24, 20, 'C');
  setPos('lblM', M, -28, -4, 'M');
  setPos('lblN', N, 28, -4, 'N');

  const dAB_val = Math.round(dist(top, left) / 38 * 10) / 10;
  const dAC_val = Math.round(dist(top, right) / 38 * 10) / 10;

  const dAM_val = Math.round(dAB_val * k * 10) / 10;
  const dMB_val = Math.round((dAB_val - dAM_val) * 10) / 10;

  const dAN_val = Math.round(dAC_val * k * 10) / 10;
  const dNC_val = Math.round((dAC_val - dAN_val) * 10) / 10;

  const dAM = dAM_val.toFixed(1);
  const dMB = dMB_val.toFixed(1);
  const dAN = dAN_val.toFixed(1);
  const dNC = dNC_val.toFixed(1);
  const dAB = dAB_val.toFixed(1);
  const dAC = dAC_val.toFixed(1);

  setTag('txtAM', 'bgAM', dAM, top, M, -26, 0);
  setTag('txtMB', 'bgMB', dMB, M, left, -26, 0);
  setTag('txtAN', 'bgAN', dAN, top, N, 26, 0);
  setTag('txtNC', 'bgNC', dNC, N, right, 26, 0);

  const ratio1 = k;
  const ratio2 = (1 - k) > 0.0001 ? (k / (1 - k)) : null;
  const ratio3 = 1 - k;

  applyRatioState(
    document.getElementById('calcGroup1L'),
    document.getElementById('undef1L'),
    document.getElementById('calcGroup1R'),
    document.getElementById('undef1R'),
    document.getElementById('numAM'),
    document.getElementById('denAB'),
    document.getElementById('numAN'),
    document.getElementById('denAC'),
    document.getElementById('valRatioL'),
    document.getElementById('valRatioR'),
    document.getElementById('eqRatio1L'),
    document.getElementById('eqRatio1R'),
    dAM, dAB, dAN, dAC,
    ratio1
  );

  applyRatioState(
    document.getElementById('calcGroup2L'),
    document.getElementById('undef2L'),
    document.getElementById('calcGroup2R'),
    document.getElementById('undef2R'),
    document.getElementById('numAM2'),
    document.getElementById('denBM2'),
    document.getElementById('numAN2'),
    document.getElementById('denCN2'),
    document.getElementById('valRatio2L'),
    document.getElementById('valRatio2R'),
    document.getElementById('eqRatio2L'),
    document.getElementById('eqRatio2R'),
    dAM, dMB, dAN, dNC,
    ratio2
  );

  applyRatioState(
    document.getElementById('calcGroup3L'),
    document.getElementById('undef3L'),
    document.getElementById('calcGroup3R'),
    document.getElementById('undef3R'),
    document.getElementById('numBM3'),
    document.getElementById('denAB3'),
    document.getElementById('numCN3'),
    document.getElementById('denAC3'),
    document.getElementById('valRatio3L'),
    document.getElementById('valRatio3R'),
    document.getElementById('eqRatio3L'),
    document.getElementById('eqRatio3R'),
    dMB, dAB, dNC, dAC,
    ratio3
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
      pt.setAttribute('r', '8');
    });
    ptsMN.forEach(pt => {
      pt.setAttribute('fill', '#f59e0b');
      pt.setAttribute('r', '8.5');
    });

    lblsABC.forEach(lbl => lbl.setAttribute('fill', '#1e40af'));
    lblsMN.forEach(lbl => lbl.setAttribute('fill', '#b45309'));
  } else {
    poly.setAttribute('fill', '#ffedd5');
    poly.setAttribute('stroke', '#ea580c');
    lineMN.setAttribute('stroke', '#2563eb');

    ptsABC.forEach(pt => {
      pt.setAttribute('fill', '#ea580c');
      pt.setAttribute('r', '10');
    });
    ptsMN.forEach(pt => {
      pt.setAttribute('fill', '#3b82f6');
      pt.setAttribute('r', '8.5');
    });

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
    const minVal = 0;
    const maxVal = 1;
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
  document.getElementById('sliderMN').value = 2 / 3;
  updateThemeColors();
  updateThales();
});