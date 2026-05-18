function isAlpha(char) {
  return /^[A-Za-z]$/.test(char);
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function generateShiftTable(key) {
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const shifted = alphabet.map((_, i) => String.fromCharCode(65 + mod(i + key, 26)));
  return { plain: alphabet, cipher: shifted };
}

function caesarEncrypt(text, key) {
  const steps = [{
    title: 'Formula Enkripsi',
    content: `C = (P + ${key}) mod 26, dimana K = ${key}`
  }];

  const char_steps = [];
  let output = '';

  for (const char of text) {
    if (isAlpha(char)) {
      const isUpper = char === char.toUpperCase();
      const p = char.toUpperCase().charCodeAt(0) - 65;
      const c = mod(p + key, 26);
      let enc = String.fromCharCode(65 + c);
      if (!isUpper) enc = enc.toLowerCase();
      output += enc;
      char_steps.push({
        original: char,
        p_val: p,
        c_val: c,
        encrypted: enc,
        formula: `(${p} + ${key}) mod 26 = ${p + key} mod 26 = ${c} → '${enc}'`
      });
    } else {
      output += char;
      char_steps.push({
        original: char,
        p_val: '-',
        c_val: '-',
        encrypted: char,
        formula: 'Karakter non-huruf, tidak diubah'
      });
    }
  }

  steps.push({ title: 'Proses Per Karakter', char_steps });
  steps.push({ title: 'Tabel Pergeseran Caesar', shift_table: generateShiftTable(key) });

  return {
    input: text,
    output,
    key,
    mode: 'encrypt',
    formula: `C = (P + ${key}) mod 26`,
    steps
  };
}

function caesarDecrypt(text, key) {
  const steps = [{
    title: 'Formula Dekripsi',
    content: `P = (C - ${key} + 26) mod 26, dimana K = ${key}`
  }];

  const char_steps = [];
  let output = '';

  for (const char of text) {
    if (isAlpha(char)) {
      const isUpper = char === char.toUpperCase();
      const c = char.toUpperCase().charCodeAt(0) - 65;
      const p = mod(c - key + 26, 26);
      let dec = String.fromCharCode(65 + p);
      if (!isUpper) dec = dec.toLowerCase();
      output += dec;
      char_steps.push({
        original: char,
        c_val: c,
        p_val: p,
        decrypted: dec,
        formula: `(${c} - ${key} + 26) mod 26 = ${c - key + 26} mod 26 = ${p} → '${dec}'`
      });
    } else {
      output += char;
      char_steps.push({
        original: char,
        c_val: '-',
        p_val: '-',
        decrypted: char,
        formula: 'Karakter non-huruf, tidak diubah'
      });
    }
  }

  steps.push({ title: 'Proses Per Karakter', char_steps });
  steps.push({ title: 'Tabel Pergeseran Caesar', shift_table: generateShiftTable(key) });

  return {
    input: text,
    output,
    key,
    mode: 'decrypt',
    formula: `P = (C - ${key} + 26) mod 26`,
    steps
  };
}

function generateKeyStream(text, key) {
  let result = '';
  let keyIdx = 0;
  const upperKey = key.toUpperCase();
  for (const char of text) {
    if (isAlpha(char)) {
      result += upperKey[keyIdx % upperKey.length];
      keyIdx += 1;
    } else {
      result += ' ';
    }
  }
  return result;
}

function generateVigenereSquare() {
  const square = [];
  for (let i = 0; i < 26; i++) {
    const row = [];
    for (let j = 0; j < 26; j++) {
      row.push(String.fromCharCode(65 + mod(i + j, 26)));
    }
    square.push(row);
  }
  return square;
}

function vigenereEncrypt(text, key) {
  const upperKey = key.toUpperCase();
  const steps = [{
    title: 'Formula Enkripsi',
    content: `C_i = (P_i + K_i) mod 26, Key = "${upperKey}"`
  }];
  const keyStream = generateKeyStream(text, key);
  steps.push({ title: 'Key Stream', content: `Key "${upperKey}" diperluas menjadi: "${keyStream}"` });

  const char_steps = [];
  let output = '';
  let keyIdx = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (isAlpha(char)) {
      const isUpper = char === char.toUpperCase();
      const p = char.toUpperCase().charCodeAt(0) - 65;
      const k = upperKey[keyIdx % upperKey.length].charCodeAt(0) - 65;
      const c = mod(p + k, 26);
      let enc = String.fromCharCode(65 + c);
      if (!isUpper) enc = enc.toLowerCase();
      output += enc;
      char_steps.push({
        index: i,
        original: char,
        key_char: upperKey[keyIdx % upperKey.length],
        p_val: p,
        k_val: k,
        c_val: c,
        result: enc,
        formula: `(${p} + ${k}) mod 26 = ${p + k} mod 26 = ${c} → '${enc}'`
      });
      keyIdx += 1;
    } else {
      output += char;
      char_steps.push({
        index: i,
        original: char,
        key_char: '-',
        p_val: '-',
        k_val: '-',
        c_val: '-',
        result: char,
        formula: 'Bukan huruf, dilewati'
      });
    }
  }

  steps.push({ title: 'Proses Per Karakter', char_steps });
  steps.push({ title: 'Tabel Vigenère (Sebagian)', vigenere_square: generateVigenereSquare() });

  return {
    input: text,
    output,
    key: upperKey,
    mode: 'encrypt',
    formula: 'C_i = (P_i + K_i) mod 26',
    steps
  };
}

function vigenereDecrypt(text, key) {
  const upperKey = key.toUpperCase();
  const steps = [{
    title: 'Formula Dekripsi',
    content: `P_i = (C_i - K_i + 26) mod 26, Key = "${upperKey}"`
  }];
  const keyStream = generateKeyStream(text, key);
  steps.push({ title: 'Key Stream', content: `Key "${upperKey}" diperluas menjadi: "${keyStream}"` });

  const char_steps = [];
  let output = '';
  let keyIdx = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (isAlpha(char)) {
      const isUpper = char === char.toUpperCase();
      const c = char.toUpperCase().charCodeAt(0) - 65;
      const k = upperKey[keyIdx % upperKey.length].charCodeAt(0) - 65;
      const p = mod(c - k + 26, 26);
      let dec = String.fromCharCode(65 + p);
      if (!isUpper) dec = dec.toLowerCase();
      output += dec;
      char_steps.push({
        index: i,
        original: char,
        key_char: upperKey[keyIdx % upperKey.length],
        c_val: c,
        k_val: k,
        p_val: p,
        result: dec,
        formula: `(${c} - ${k} + 26) mod 26 = ${c - k + 26} mod 26 = ${p} → '${dec}'`
      });
      keyIdx += 1;
    } else {
      output += char;
      char_steps.push({
        index: i,
        original: char,
        key_char: '-',
        c_val: '-',
        k_val: '-',
        p_val: '-',
        result: char,
        formula: 'Bukan huruf, dilewati'
      });
    }
  }

  steps.push({ title: 'Proses Per Karakter', char_steps });

  return {
    input: text,
    output,
    key: upperKey,
    mode: 'decrypt',
    formula: 'P_i = (C_i - K_i + 26) mod 26',
    steps
  };
}

function modInverse(a, m) {
  a = mod(a, m);
  for (let i = 1; i < m; i += 1) {
    if (mod(a * i, m) === 1) {
      return i;
    }
  }
  return null;
}

function affineEncrypt(text, a, b) {
  const steps = [{
    title: 'Formula Enkripsi',
    content: `C = (a·P + b) mod 26, dimana a=${a}, b=${b}`
  }, {
    title: 'Validasi Key',
    content: `GCD(${a}, 26) = ${gcd(a, 26)} ✓ (harus = 1 agar invertible)`
  }];

  const char_steps = [];
  let output = '';

  for (const char of text) {
    if (isAlpha(char)) {
      const isUpper = char === char.toUpperCase();
      const p = char.toUpperCase().charCodeAt(0) - 65;
      const c = mod(a * p + b, 26);
      let enc = String.fromCharCode(65 + c);
      if (!isUpper) enc = enc.toLowerCase();
      output += enc;
      char_steps.push({
        original: char,
        p_val: p,
        c_val: c,
        result: enc,
        formula: `(${a}×${p} + ${b}) mod 26 = ${a * p + b} mod 26 = ${c} → '${enc}'`
      });
    } else {
      output += char;
      char_steps.push({
        original: char,
        p_val: '-',
        c_val: '-',
        result: char,
        formula: 'Bukan huruf, dilewati'
      });
    }
  }

  steps.push({ title: 'Proses Per Karakter', char_steps });

  return {
    input: text,
    output,
    a,
    b,
    mode: 'encrypt',
    formula: `C = (${a}·P + ${b}) mod 26`,
    steps
  };
}

function affineDecrypt(text, a, b) {
  const aInv = modInverse(a, 26);
  const steps = [{
    title: 'Formula Dekripsi',
    content: `P = a⁻¹·(C - b) mod 26, dimana a=${a}, b=${b}, a⁻¹=${aInv}`
  }, {
    title: 'Menghitung Invers Modular',
    content: `a⁻¹ = ${aInv} karena (${a} × ${aInv}) mod 26 = ${mod(a * aInv, 26)}`
  }];

  const char_steps = [];
  let output = '';

  for (const char of text) {
    if (isAlpha(char)) {
      const isUpper = char === char.toUpperCase();
      const c = char.toUpperCase().charCodeAt(0) - 65;
      const p = mod(aInv * (c - b + 26), 26);
      let dec = String.fromCharCode(65 + p);
      if (!isUpper) dec = dec.toLowerCase();
      output += dec;
      char_steps.push({
        original: char,
        c_val: c,
        p_val: p,
        result: dec,
        formula: `${aInv}×(${c} - ${b} + 26) mod 26 = ${aInv * (c - b + 26)} mod 26 = ${p} → '${dec}'`
      });
    } else {
      output += char;
      char_steps.push({
        original: char,
        c_val: '-',
        p_val: '-',
        result: char,
        formula: 'Bukan huruf, dilewati'
      });
    }
  }

  steps.push({ title: 'Proses Per Karakter', char_steps });

  return {
    input: text,
    output,
    a,
    b,
    a_inv: aInv,
    mode: 'decrypt',
    formula: `P = ${aInv}·(C - ${b}) mod 26`,
    steps
  };
}

function det2x2(m) {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

function det3x3(m) {
  return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
    - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
    + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
}

function matrixMultiply(a, vec) {
  const n = a.length;
  const result = [];
  const calcShown = [];
  for (let i = 0; i < n; i++) {
    const row = a[i];
    const value = mod(row.reduce((sum, val, j) => sum + val * vec[j], 0), 26);
    const calc = row.map((val, j) => `${val}×${vec[j]}`).join(' + ');
    const raw = row.reduce((sum, val, j) => sum + val * vec[j], 0);
    calcShown.push(`[${calc}] mod 26 = ${raw} mod 26 = ${value}`);
    result.push(value);
  }
  return { result, calcShown };
}

function matrixInverse2x2(m) {
  const det = mod(det2x2(m), 26);
  const invDet = modInverse(det, 26);
  if (invDet === null) return null;
  return [
    [mod(invDet * m[1][1], 26), mod(-invDet * m[0][1], 26)],
    [mod(-invDet * m[1][0], 26), mod(invDet * m[0][0], 26)]
  ];
}

function matrixInverse3x3(m) {
  const det = mod(det3x3(m), 26);
  const invDet = modInverse(det, 26);
  if (invDet === null) return null;

  const cofactors = [];
  for (let r = 0; r < 3; r++) {
    const row = [];
    for (let c = 0; c < 3; c++) {
      const minor = [];
      for (let i = 0; i < 3; i++) {
        if (i === r) continue;
        const minorRow = [];
        for (let j = 0; j < 3; j++) {
          if (j === c) continue;
          minorRow.push(m[i][j]);
        }
        minor.push(minorRow);
      }
      row.push(mod(((-1) ** (r + c)) * det2x2(minor), 26));
    }
    cofactors.push(row);
  }

  const adj = [
    [cofactors[0][0], cofactors[1][0], cofactors[2][0]],
    [cofactors[0][1], cofactors[1][1], cofactors[2][1]],
    [cofactors[0][2], cofactors[1][2], cofactors[2][2]]
  ];

  return adj.map(row => row.map(val => mod(invDet * val, 26)));
}

function prepareHillText(text, n) {
  let clean = '';
  for (const char of text) {
    if (isAlpha(char)) {
      clean += char.toUpperCase();
    }
  }
  while (clean.length % n !== 0) {
    clean += 'X';
  }
  return clean;
}

function hillEncrypt(text, matrixInput) {
  const matrix = matrixInput.map(row => row.map(Number));
  const n = matrix.length;
  if (![2, 3].includes(n) || matrix.some(row => row.length !== n)) {
    throw new Error('Matriks harus 2x2 atau 3x3');
  }

  const det = n === 2 ? det2x2(matrix) : det3x3(matrix);
  const detMod = mod(det, 26);
  if (gcd(detMod, 26) !== 1) {
    throw new Error(`Matriks kunci tidak valid! Det mod 26 = ${detMod}, GCD(${detMod},26) ≠ 1`);
  }

  const steps = [
    { title: 'Matriks Kunci', matrix, size: n },
    { title: 'Validasi Matriks', content: `Determinan = ${det}, Determinan mod 26 = ${detMod}, GCD(${detMod}, 26) = ${gcd(detMod, 26)} (harus = 1)` },
    { title: 'Persiapan Teks', content: `Teks bersih: "${prepareHillText(text, n)}" (padding X ditambahkan jika perlu, panjang harus kelipatan ${n})` }
  ];

  const clean = prepareHillText(text, n);
  const block_steps = [];
  let output = '';

  for (let i = 0; i < clean.length; i += n) {
    const block = clean.slice(i, i + n);
    const vec = Array.from(block).map(ch => ch.charCodeAt(0) - 65);
    const { result, calcShown } = matrixMultiply(matrix, vec);
    const encChars = result.map(v => String.fromCharCode(65 + v));
    output += encChars.join('');
    block_steps.push({ block, vector: vec, result_vector: result, result_chars: encChars, calculations: calcShown });
  }

  steps.push({ title: 'Proses Per Blok', block_steps, n });

  return {
    input: text,
    output,
    matrix,
    n,
    mode: 'encrypt',
    formula: `C = K·P mod 26 (blok ${n} karakter)`,
    steps
  };
}

function hillDecrypt(text, matrixInput) {
  const matrix = matrixInput.map(row => row.map(Number));
  const n = matrix.length;
  if (![2, 3].includes(n) || matrix.some(row => row.length !== n)) {
    throw new Error('Matriks harus 2x2 atau 3x3');
  }

  const invMatrix = n === 2 ? matrixInverse2x2(matrix) : matrixInverse3x3(matrix);
  if (!invMatrix) {
    throw new Error('Matriks tidak invertible mod 26');
  }

  const det = n === 2 ? det2x2(matrix) : det3x3(matrix);
  const invDet = modInverse(mod(det, 26), 26);
  const steps = [
    { title: 'Matriks Kunci', matrix, size: n },
    { title: 'Matriks Invers', content: 'K⁻¹ (mod 26) = matriks invers dari K', matrix: invMatrix, size: n, det, det_inv: invDet },
    { title: 'Persiapan Teks Cipher', content: `Teks cipher bersih: "${prepareHillText(text, n)}"` }
  ];

  const clean = prepareHillText(text, n);
  const block_steps = [];
  let output = '';

  for (let i = 0; i < clean.length; i += n) {
    const block = clean.slice(i, i + n);
    const vec = Array.from(block).map(ch => ch.charCodeAt(0) - 65);
    const { result, calcShown } = matrixMultiply(invMatrix, vec);
    const decChars = result.map(v => String.fromCharCode(65 + v));
    output += decChars.join('');
    block_steps.push({ block, vector: vec, result_vector: result, result_chars: decChars, calculations: calcShown });
  }

  steps.push({ title: 'Proses Per Blok', block_steps, n });

  return {
    input: text,
    output,
    matrix,
    inv_matrix: invMatrix,
    n,
    mode: 'decrypt',
    formula: `P = K⁻¹·C mod 26 (blok ${n} karakter)`,
    steps
  };
}

function normalizePlayfairKey(key) {
  return key.toUpperCase().replace(/J/g, 'I');
}

function generatePlayfairMatrix(key) {
  const normalized = normalizePlayfairKey(key);
  const seen = [];
  for (const char of normalized) {
    if (isAlpha(char) && !seen.includes(char)) {
      seen.push(char);
    }
  }

  for (const char of 'ABCDEFGHIKLMNOPQRSTUVWXYZ') {
    if (!seen.includes(char)) {
      seen.push(char);
    }
  }

  const matrix = [];
  for (let i = 0; i < 5; i++) {
    matrix.push(seen.slice(i * 5, i * 5 + 5));
  }
  return matrix;
}

function findPosition(matrix, char) {
  const normalized = normalizePlayfairKey(char);
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (matrix[r][c] === normalized) {
        return [r, c];
      }
    }
  }
  return null;
}

function preparePlayfairText(text) {
  const clean = Array.from(text.toUpperCase().replace(/J/g, 'I')).filter(isAlpha).join('');
  const pairs = [];
  let i = 0;
  while (i < clean.length) {
    const a = clean[i];
    const b = clean[i + 1];
    if (b && a === b) {
      pairs.push([a, 'X']);
      i += 1;
    } else if (b) {
      pairs.push([a, b]);
      i += 2;
    } else {
      pairs.push([a, 'X']);
      i += 1;
    }
  }
  return pairs;
}

function playfairEncrypt(text, key) {
  const matrix = generatePlayfairMatrix(key);
  const steps = [
    { title: 'Matriks Playfair 5×5', matrix, key: normalizePlayfairKey(key) },
    { title: 'Aturan Enkripsi', rules: [
      'Baris sama → geser kanan 1 posisi (wrap)',
      'Kolom sama → geser bawah 1 posisi (wrap)',
      'Berbeda → ambil pojok persegi (swap kolom)'
    ] }
  ];

  const pairs = preparePlayfairText(text);
  steps.push({ title: 'Pembentukan Pasangan (Digraf)', content: `Teks dibagi menjadi pasangan: ${pairs.map(([a, b]) => `${a}${b}`).join(' ')}` });

  const pair_steps = [];
  let output = '';
  for (const [a, b] of pairs) {
    const [ra, ca] = findPosition(matrix, a);
    const [rb, cb] = findPosition(matrix, b);
    let ea, eb, rule;

    if (ra === rb) {
      ea = matrix[ra][mod(ca + 1, 5)];
      eb = matrix[rb][mod(cb + 1, 5)];
      rule = `Baris sama (baris ${ra}) → geser kanan`;
    } else if (ca === cb) {
      ea = matrix[mod(ra + 1, 5)][ca];
      eb = matrix[mod(rb + 1, 5)][cb];
      rule = `Kolom sama (kolom ${ca}) → geser bawah`;
    } else {
      ea = matrix[ra][cb];
      eb = matrix[rb][ca];
      rule = `Persegi → swap kolom (${ca}↔${cb})`;
    }

    output += ea + eb;
    pair_steps.push({
      pair: `${a}${b}`,
      result: `${ea}${eb}`,
      pos_a: [ra, ca],
      pos_b: [rb, cb],
      pos_ea: findPosition(matrix, ea),
      pos_eb: findPosition(matrix, eb),
      rule
    });
  }

  steps.push({ title: 'Enkripsi Per Pasangan', pair_steps });

  return {
    input: text,
    output,
    key: normalizePlayfairKey(key),
    matrix,
    mode: 'encrypt',
    formula: 'Playfair: Baris/Kolom/Persegi Rule',
    steps
  };
}

function playfairDecrypt(text, key) {
  const matrix = generatePlayfairMatrix(key);
  const steps = [
    { title: 'Matriks Playfair 5×5', matrix, key: normalizePlayfairKey(key) },
    { title: 'Aturan Dekripsi', rules: [
      'Baris sama → geser kiri 1 posisi (wrap)',
      'Kolom sama → geser atas 1 posisi (wrap)',
      'Berbeda → ambil pojok persegi (swap kolom) — sama seperti enkripsi'
    ] }
  ];

  const clean = Array.from(text.toUpperCase().replace(/J/g, 'I')).filter(isAlpha).join('');
  const pairs = [];
  for (let i = 0; i < clean.length; i += 2) {
    const a = clean[i];
    const b = clean[i + 1] || 'X';
    pairs.push([a, b]);
  }

  steps.push({ title: 'Pasangan Cipher', content: `Pasangan cipher: ${pairs.map(([a, b]) => `${a}${b}`).join(' ')}` });

  const pair_steps = [];
  let output = '';

  for (const [a, b] of pairs) {
    const [ra, ca] = findPosition(matrix, a);
    const [rb, cb] = findPosition(matrix, b);
    let da, db, rule;

    if (ra === rb) {
      da = matrix[ra][mod(ca - 1, 5)];
      db = matrix[rb][mod(cb - 1, 5)];
      rule = `Baris sama (baris ${ra}) → geser kiri`;
    } else if (ca === cb) {
      da = matrix[mod(ra - 1, 5)][ca];
      db = matrix[mod(rb - 1, 5)][cb];
      rule = `Kolom sama (kolom ${ca}) → geser atas`;
    } else {
      da = matrix[ra][cb];
      db = matrix[rb][ca];
      rule = `Persegi → swap kolom (${ca}↔${cb})`;
    }

    output += da + db;
    pair_steps.push({
      pair: `${a}${b}`,
      result: `${da}${db}`,
      pos_a: [ra, ca],
      pos_b: [rb, cb],
      rule
    });
  }

  steps.push({ title: 'Dekripsi Per Pasangan', pair_steps });

  return {
    input: text,
    output,
    key: normalizePlayfairKey(key),
    matrix,
    mode: 'decrypt',
    formula: 'Playfair Dekripsi: Kebalikan dari Enkripsi',
    steps
  };
}

module.exports = {
  caesarEncrypt,
  caesarDecrypt,
  vigenereEncrypt,
  vigenereDecrypt,
  affineEncrypt,
  affineDecrypt,
  hillEncrypt,
  hillDecrypt,
  playfairEncrypt,
  playfairDecrypt,
  gcd,
  modInverse
};
