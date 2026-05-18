// ===================================================
//  KriptoSim — main.js
//  Handles: theme, tab switching, form processing,
//           step rendering, history management
// ===================================================

// ===== STATE =====
const modes = {
  caesar: 'encrypt',
  vigenere: 'encrypt',
  affine: 'encrypt',
  hill: 'encrypt',
  playfair: 'encrypt'
};
let historyItems = JSON.parse(localStorage.getItem('cryptoHistory') || '[]');
let hillSize = 2;

// ===== THEME =====
const themeBtn = document.getElementById('themeBtn');
let theme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', theme);
themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';

themeBtn.onclick = () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
};

// ===== ALGO TABS =====
document.querySelectorAll('.algo-tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.algo-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.algo-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.algo).classList.add('active');
  };
});

// ===== MODE TOGGLE =====
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.onclick = () => {
    const algo = btn.dataset.algo;
    btn.closest('.mode-toggle').querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    modes[algo] = btn.dataset.mode;
  };
});

// ===== AFFINE a VALIDATION =====
const validA = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

document.getElementById('affine-a').addEventListener('input', function () {
  const v = parseInt(this.value);
  const hint = document.getElementById('affine-a-hint');
  const g = gcd(v, 26);
  if (validA.includes(v)) {
    hint.textContent = `Valid: GCD(${v},26)=1 ✓`;
    hint.className = 'input-hint valid';
  } else {
    hint.textContent = `Tidak valid: GCD(${v},26)=${g} ≠ 1`;
    hint.className = 'input-hint error';
  }
});

function gcd(a, b) {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

// ===== HILL MATRIX SIZE =====
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    hillSize = parseInt(btn.dataset.size);
    renderHillMatrix(hillSize);
  };
});

function renderHillMatrix(n) {
  const defaults2 = [[3, 3], [2, 5]];
  const defaults3 = [[1, 2, 3], [0, 1, 4], [5, 6, 0]];
  const def = n === 2 ? defaults2 : defaults3;

  const container = document.getElementById('hill-matrix');
  container.className = `matrix-grid size-${n}`;
  container.innerHTML = '';

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.className = 'matrix-input';
      inp.dataset.r = r;
      inp.dataset.c = c;
      inp.value = def[r][c];
      container.appendChild(inp);
    }
  }
}

function fillMatrix(mat) {
  const n = mat.length;
  const sizeBtn = document.querySelector(`.size-btn[data-size="${n}"]`);
  if (sizeBtn) sizeBtn.click();
  setTimeout(() => {
    document.querySelectorAll('.matrix-input').forEach(inp => {
      const r = parseInt(inp.dataset.r);
      const c = parseInt(inp.dataset.c);
      if (mat[r] && mat[r][c] !== undefined) inp.value = mat[r][c];
    });
  }, 50);
}

function getHillMatrix() {
  const mat = Array.from({ length: hillSize }, () => Array(hillSize).fill(0));
  document.querySelectorAll('.matrix-input').forEach(inp => {
    mat[inp.dataset.r][inp.dataset.c] = parseInt(inp.value) || 0;
  });
  return mat;
}

// ===== COPY RESULT =====
function copyResult(id) {
  const text = document.getElementById(id).textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector(`#${id} ~ .result-copy`);
    if (btn) {
      btn.textContent = '✅ Disalin!';
      setTimeout(() => btn.textContent = '📋 Salin', 1500);
    }
  });
}

// ===== MAIN PROCESS FUNCTION =====
async function process(algo) {
  const btn = document.getElementById(`${algo}-btn`);
  const errorBox = document.getElementById(`${algo}-error`);
  const resultBox = document.getElementById(`${algo}-result`);
  const outputEl = document.getElementById(`${algo}-output`);
  const stepsPanel = document.getElementById(`${algo}-steps`);

  // Reset state
  errorBox.className = 'error-box';
  resultBox.className = 'result-box';
  stepsPanel.className = 'steps-panel';
  btn.classList.add('loading');
  btn.textContent = '';

  const text = document.getElementById(`${algo}-text`).value;
  if (!text.trim()) {
    showError(algo, 'Teks tidak boleh kosong!');
    resetBtn(algo);
    return;
  }

  // Build payload
  let payload = { text, mode: modes[algo] };

  if (algo === 'caesar') {
    payload.key = parseInt(document.getElementById('caesar-key').value);
  } else if (algo === 'vigenere') {
    payload.key = document.getElementById('vigenere-key').value;
    if (!payload.key) { showError(algo, 'Key tidak boleh kosong!'); resetBtn(algo); return; }
  } else if (algo === 'affine') {
    payload.a = parseInt(document.getElementById('affine-a').value);
    payload.b = parseInt(document.getElementById('affine-b').value);
  } else if (algo === 'hill') {
    payload.matrix = getHillMatrix();
  } else if (algo === 'playfair') {
    payload.key = document.getElementById('playfair-key').value;
    if (!payload.key) { showError(algo, 'Key tidak boleh kosong!'); resetBtn(algo); return; }
  }

  // Send to Flask API
  try {
    const resp = await fetch(`/api/${algo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await resp.json();

    if (!resp.ok || data.error) {
      showError(algo, data.error || 'Terjadi kesalahan');
      resetBtn(algo);
      return;
    }

    outputEl.textContent = data.output;
    resultBox.className = 'result-box show';
    renderSteps(algo, data);
    addHistory(algo, data);
  } catch (e) {
    showError(algo, 'Gagal terhubung ke server: ' + e.message);
  }

  resetBtn(algo);
}

function showError(algo, msg) {
  const box = document.getElementById(`${algo}-error`);
  box.textContent = '⚠️ ' + msg;
  box.className = 'error-box show';
}

function resetBtn(algo) {
  const btn = document.getElementById(`${algo}-btn`);
  btn.classList.remove('loading');
  const names = {
    caesar: 'Caesar', vigenere: 'Vigenère',
    affine: 'Affine', hill: 'Hill', playfair: 'Playfair'
  };
  btn.textContent = `Proses ${names[algo]} Cipher`;
}

// ===== BUTTON EVENTS =====
['caesar', 'vigenere', 'affine', 'hill', 'playfair'].forEach(a => {
  document.getElementById(`${a}-btn`).onclick = () => process(a);
});

// ===== Ctrl+Enter SHORTCUT =====
document.querySelectorAll('textarea').forEach(ta => {
  ta.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') {
      const algo = ta.id.split('-')[0];
      process(algo);
    }
  });
});

// ===================================================
//  STEP RENDERING
// ===================================================

function renderSteps(algo, data) {
  const panel = document.getElementById(`${algo}-steps`);
  panel.innerHTML = '';
  panel.className = 'steps-panel show';

  const modeLabel = modes[algo] === 'encrypt' ? 'Enkripsi' : 'Dekripsi';
  const algoName = algo.charAt(0).toUpperCase() + algo.slice(1);

  let html = `<div class="steps-header">
    <span>📊 Proses ${modeLabel} — ${algoName} Cipher</span>
    <span class="formula-badge">${data.formula || ''}</span>
  </div>`;

  let stepNum = 1;
  for (const step of data.steps) {
    html += `<div class="step-item">
      <div class="step-title">
        <span class="step-badge">${stepNum++}</span>${step.title}
      </div>`;

    if (step.content)       html += `<div class="step-content">${escHtml(step.content)}</div>`;
    if (step.rules)         html += renderRules(step.rules);
    if (step.char_steps)    html += renderCharTable(step.char_steps, data.mode);
    if (step.shift_table)   html += renderShiftTable(step.shift_table);
    if (step.vigenere_square) html += renderVigenereSquare(step.vigenere_square);
    if (step.matrix && step.size !== undefined && !step.block_steps)
                            html += renderMatrix(step.matrix, step.size, step.det, step.det_inv);
    if (step.block_steps)   html += renderBlockSteps(step.block_steps);
    if (step.pair_steps)    html += renderPairSteps(step.pair_steps);
    if (step.matrix && step.key) html += renderPlayfairMatrix(step.matrix);

    html += `</div>`;
  }

  panel.innerHTML = html;
}

// ===== HTML ESCAPE =====
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ===== RENDER HELPERS =====

function renderRules(rules) {
  return `<div class="step-content">` +
    rules.map(r => `<div>• ${escHtml(r)}</div>`).join('') +
    `</div>`;
}

function renderCharTable(steps, mode) {
  const isEnc = mode === 'encrypt';
  let html = `<div style="overflow-x:auto; margin-top:0.5rem">
    <table class="char-table"><thead><tr>
      <th>Karakter Asal</th>
      <th>${isEnc ? 'P (posisi)' : 'C (posisi)'}</th>
      <th>${isEnc ? 'C (posisi)' : 'P (posisi)'}</th>
      <th>Hasil</th><th>Formula</th>
    </tr></thead><tbody>`;

  for (const s of steps) {
    const pv  = isEnc ? s.p_val : s.c_val;
    const cv  = isEnc ? s.c_val : s.p_val;
    const res = isEnc ? (s.encrypted || s.result) : (s.decrypted || s.result);
    html += `<tr>
      <td class="char-original">${escHtml(s.original)}</td>
      <td>${escHtml(String(pv))}</td>
      <td>${escHtml(String(cv))}</td>
      <td class="char-result">${escHtml(res)}</td>
      <td class="char-formula">${escHtml(s.formula)}</td>
    </tr>`;
  }
  return html + '</tbody></table></div>';
}

function renderShiftTable(t) {
  return `<div style="margin-top:0.5rem; overflow-x:auto">
    <div style="font-size:0.72rem; color:var(--text2); margin-bottom:0.3rem">
      Alfabet asli → Alfabet tergeser
    </div>
    <div class="shift-table">
      <div class="shift-row">
        ${t.plain.map(c => `<div class="shift-cell shift-plain">${c}</div>`).join('')}
      </div>
      <div class="shift-row">
        ${t.cipher.map(c => `<div class="shift-cell shift-cipher">${c}</div>`).join('')}
      </div>
    </div>
  </div>`;
}

function renderVigenereSquare(sq) {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  let html = `<div class="vigenere-container" style="margin-top:0.5rem">
    <div style="font-size:0.72rem; color:var(--text2); margin-bottom:0.3rem">
      Tabel Vigenère (baris = key, kolom = plaintext)
    </div>
    <table class="vigenere-table"><thead><tr>
      <td class="header-cell"> </td>
      ${alpha.map(c => `<td class="header-cell">${c}</td>`).join('')}
    </tr></thead><tbody>`;

  for (let i = 0; i < 26; i++) {
    html += `<tr><td class="header-cell">${alpha[i]}</td>`;
    for (let j = 0; j < 26; j++) {
      const cls = i === j ? ' diag' : '';
      html += `<td class="${cls}">${sq[i][j]}</td>`;
    }
    html += '</tr>';
  }
  return html + '</tbody></table></div>';
}

function renderMatrix(mat, n, det, detInv) {
  let cells = '';
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      cells += `<div class="matrix-cell">${mat[r][c]}</div>`;

  let info = '';
  if (det !== undefined) {
    info = `<div style="font-family:'Space Mono',monospace; font-size:0.78rem; color:var(--text2); padding-top:0.5rem">
      <div>det = <span style="color:var(--accent)">${det}</span></div>
      ${detInv !== undefined
        ? `<div>det⁻¹ mod 26 = <span style="color:var(--green)">${detInv}</span></div>`
        : ''}
    </div>`;
  }

  return `<div style="margin-top:0.5rem; display:flex; align-items:flex-start; gap:1.5rem; flex-wrap:wrap">
    <div><div class="matrix-display size-${n}">${cells}</div></div>
    ${info}
  </div>`;
}

function renderBlockSteps(blocks) {
  let html = `<div style="display:flex; flex-direction:column; gap:0.8rem; margin-top:0.5rem">`;
  for (const b of blocks) {
    let calcs = b.calculations.map(c =>
      `<div style="color:var(--text2); margin-top:0.2rem">  ${escHtml(c)}</div>`
    ).join('');

    html += `<div style="padding:0.8rem; background:var(--bg2); border:1px solid var(--border); border-radius:8px; font-family:'Space Mono',monospace; font-size:0.76rem">
      <div style="display:flex; align-items:center; gap:0.8rem; margin-bottom:0.4rem">
        <span style="color:var(--yellow); font-weight:700">Blok: ${escHtml(b.block)}</span>
        <span style="color:var(--text2)">→ vektor: [${b.vector.join(', ')}]</span>
      </div>
      ${calcs}
      <div style="margin-top:0.4rem; color:var(--green); font-weight:700">
        Hasil: ${b.result_chars.join('')} [${b.result_vector.join(', ')}]
      </div>
    </div>`;
  }
  return html + '</div>';
}

function renderPairSteps(pairs) {
  let html = `<div class="pair-grid" style="margin-top:0.5rem">`;
  for (const p of pairs) {
    const posA  = p.pos_a  ? `[${p.pos_a[0]},${p.pos_a[1]}]`   : '';
    const posB  = p.pos_b  ? ` [${p.pos_b[0]},${p.pos_b[1]}]`  : '';
    const posEA = p.pos_ea ? ` → [${p.pos_ea[0]},${p.pos_ea[1]}]` : '';
    const posEB = p.pos_eb ? ` [${p.pos_eb[0]},${p.pos_eb[1]}]`   : '';

    html += `<div class="pair-item">
      <div>
        <span class="pair-chars">${escHtml(p.pair)}</span>
        <span class="pair-arrow">→</span>
        <span class="pair-result">${escHtml(p.result)}</span>
      </div>
      <div class="pair-rule">${escHtml(p.rule)}</div>
      <div style="font-size:0.66rem; color:var(--text2); font-family:'Space Mono',monospace; margin-top:0.2rem">
        ${posA}${posB}${posEA}${posEB}
      </div>
    </div>`;
  }
  return html + '</div>';
}

function renderPlayfairMatrix(mat) {
  let cells = '';
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 5; c++)
      cells += `<div class="pf-cell">${mat[r][c]}</div>`;

  return `<div style="margin-top:0.5rem">
    <div style="font-size:0.72rem; color:var(--text2); margin-bottom:0.5rem">Matriks 5×5:</div>
    <div class="playfair-matrix">${cells}</div>
  </div>`;
}

// ===================================================
//  HISTORY
// ===================================================

function addHistory(algo, data) {
  const item = {
    id: Date.now(),
    algo,
    mode: data.mode,
    input:  data.input.substring(0, 50)  + (data.input.length  > 50 ? '...' : ''),
    output: data.output.substring(0, 50) + (data.output.length > 50 ? '...' : ''),
    time: new Date().toLocaleTimeString('id-ID'),
    fullData: data
  };
  historyItems.unshift(item);
  if (historyItems.length > 50) historyItems.pop();
  localStorage.setItem('cryptoHistory', JSON.stringify(historyItems));
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('history-list');
  if (!historyItems.length) {
    list.innerHTML = '<div class="history-empty">Belum ada riwayat. Mulai enkripsi atau dekripsi!</div>';
    return;
  }
  list.innerHTML = historyItems.map(item => `
    <div class="history-item" onclick="loadHistory('${item.id}')">
      <span class="history-badge badge-${item.mode}">${item.mode === 'encrypt' ? '🔒' : '🔓'}</span>
      <span class="history-algo">${item.algo.toUpperCase()}</span>
      <div class="history-texts">
        <div class="history-io"><strong>${escHtml(item.input)}</strong></div>
        <div class="history-io" style="color:var(--green)">${escHtml(item.output)}</div>
      </div>
      <span style="color:var(--text2); font-size:0.72rem; flex-shrink:0">${item.time}</span>
    </div>
  `).join('');
}

function loadHistory(id) {
  const item = historyItems.find(h => h.id == id);
  if (!item) return;
  document.querySelector(`.algo-tab[data-algo="${item.algo}"]`).click();
  setTimeout(() => {
    document.getElementById(`${item.algo}-text`).value = item.fullData.input;
    renderSteps(item.algo, item.fullData);
    document.getElementById(`${item.algo}-output`).textContent = item.fullData.output;
    document.getElementById(`${item.algo}-result`).className = 'result-box show';
  }, 100);
}

function clearHistory() {
  historyItems = [];
  localStorage.removeItem('cryptoHistory');
  renderHistory();
}

// ===================================================
//  INIT
// ===================================================
renderHistory();
renderHillMatrix(2);
