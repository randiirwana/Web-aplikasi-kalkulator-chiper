from math import gcd

def det2x2(m):
    return m[0][0]*m[1][1] - m[0][1]*m[1][0]

def det3x3(m):
    return (m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])
           -m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])
           +m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]))

def mod_inverse(a, m):
    a = a % m
    for i in range(1, m):
        if (a * i) % m == 1:
            return i
    return None

def matrix_mod_inverse_2x2(m):
    det = det2x2(m) % 26
    det_inv = mod_inverse(det, 26)
    if det_inv is None:
        raise ValueError(f"Matriks tidak invertible mod 26. Det={det2x2(m)}, GCD({det%26},26)={gcd(det%26,26)}")
    adj = [[m[1][1], -m[0][1]], [-m[1][0], m[0][0]]]
    inv = [[(det_inv * adj[i][j]) % 26 for j in range(2)] for i in range(2)]
    return inv

def matrix_mod_inverse_3x3(m):
    det = det3x3(m) % 26
    det_inv = mod_inverse(det, 26)
    if det_inv is None:
        raise ValueError(f"Matriks tidak invertible mod 26. Det mod 26 = {det}")
    # Cofactor matrix
    cofactors = []
    for r in range(3):
        row = []
        for c in range(3):
            minor = [[m[i][j] for j in range(3) if j != c] for i in range(3) if i != r]
            d = det2x2(minor)
            row.append(((-1)**(r+c)) * d)
        cofactors.append(row)
    # Adjugate (transpose of cofactor)
    adj = [[cofactors[j][i] for j in range(3)] for i in range(3)]
    inv = [[(det_inv * adj[i][j]) % 26 for j in range(3)] for i in range(3)]
    return inv

def matrix_multiply(a, b_vec):
    n = len(a)
    result = []
    calc_shown = []
    for i in range(n):
        val = sum(a[i][j] * b_vec[j] for j in range(n)) % 26
        calc = ' + '.join([f"{a[i][j]}×{b_vec[j]}" for j in range(n)])
        calc_shown.append(f"[{calc}] mod 26 = {sum(a[i][j]*b_vec[j] for j in range(n))} mod 26 = {val}")
        result.append(val)
    return result, calc_shown

def prepare_text(text, n):
    clean = ''.join(c.upper() for c in text if c.isalpha())
    # Pad if needed
    while len(clean) % n != 0:
        clean += 'X'
    return clean

def hill_encrypt(text, matrix):
    n = len(matrix)
    if n not in [2, 3]:
        raise ValueError("Matriks harus 2x2 atau 3x3")
    for row in matrix:
        if len(row) != n:
            raise ValueError(f"Matriks harus {n}x{n}")
    
    matrix = [[int(x) for x in row] for row in matrix]
    
    steps = []
    steps.append({
        'title': 'Matriks Kunci',
        'matrix': matrix,
        'size': n
    })
    
    if n == 2:
        det = det2x2(matrix)
    else:
        det = det3x3(matrix)
    
    steps.append({
        'title': 'Validasi Matriks',
        'content': f'Determinan = {det}, Determinan mod 26 = {det % 26}, GCD({det%26}, 26) = {gcd(det%26, 26)} (harus = 1)'
    })
    
    if gcd(det % 26, 26) != 1:
        raise ValueError(f"Matriks kunci tidak valid! Det mod 26 = {det%26}, GCD({det%26},26) = {gcd(det%26,26)} ≠ 1")
    
    clean = prepare_text(text, n)
    steps.append({
        'title': 'Persiapan Teks',
        'content': f'Teks bersih: "{clean}" (padding X ditambahkan jika perlu, panjang harus kelipatan {n})'
    })
    
    block_steps = []
    output = ''
    for i in range(0, len(clean), n):
        block = clean[i:i+n]
        vec = [ord(c) - ord('A') for c in block]
        enc_vec, calc = matrix_multiply(matrix, vec)
        enc_chars = [chr(v + ord('A')) for v in enc_vec]
        output += ''.join(enc_chars)
        block_steps.append({
            'block': block,
            'vector': vec,
            'result_vector': enc_vec,
            'result_chars': enc_chars,
            'calculations': calc
        })
    
    steps.append({
        'title': 'Proses Per Blok',
        'block_steps': block_steps,
        'n': n
    })
    
    return {
        'input': text,
        'output': output,
        'matrix': matrix,
        'n': n,
        'mode': 'encrypt',
        'formula': f'C = K·P mod 26 (blok {n} karakter)',
        'steps': steps
    }

def hill_decrypt(text, matrix):
    n = len(matrix)
    if n not in [2, 3]:
        raise ValueError("Matriks harus 2x2 atau 3x3")
    
    matrix = [[int(x) for x in row] for row in matrix]
    
    steps = []
    steps.append({
        'title': 'Matriks Kunci',
        'matrix': matrix,
        'size': n
    })
    
    if n == 2:
        inv_matrix = matrix_mod_inverse_2x2(matrix)
        det = det2x2(matrix)
    else:
        inv_matrix = matrix_mod_inverse_3x3(matrix)
        det = det3x3(matrix)
    
    steps.append({
        'title': 'Matriks Invers',
        'content': f'K⁻¹ (mod 26) = matriks invers dari K',
        'matrix': inv_matrix,
        'size': n,
        'det': det,
        'det_inv': mod_inverse(det % 26, 26)
    })
    
    clean = prepare_text(text, n)
    steps.append({
        'title': 'Persiapan Teks Cipher',
        'content': f'Teks cipher bersih: "{clean}"'
    })
    
    block_steps = []
    output = ''
    for i in range(0, len(clean), n):
        block = clean[i:i+n]
        vec = [ord(c) - ord('A') for c in block]
        dec_vec, calc = matrix_multiply(inv_matrix, vec)
        dec_chars = [chr(v + ord('A')) for v in dec_vec]
        output += ''.join(dec_chars)
        block_steps.append({
            'block': block,
            'vector': vec,
            'result_vector': dec_vec,
            'result_chars': dec_chars,
            'calculations': calc
        })
    
    steps.append({
        'title': 'Proses Per Blok',
        'block_steps': block_steps,
        'n': n
    })
    
    return {
        'input': text,
        'output': output,
        'matrix': matrix,
        'inv_matrix': inv_matrix,
        'n': n,
        'mode': 'decrypt',
        'formula': f'P = K⁻¹·C mod 26 (blok {n} karakter)',
        'steps': steps
    }
