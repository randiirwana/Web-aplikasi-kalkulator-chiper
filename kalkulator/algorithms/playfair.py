def generate_playfair_matrix(key):
    key = key.upper().replace('J', 'I')
    seen = []
    for c in key:
        if c.isalpha() and c not in seen:
            seen.append(c)
    alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'
    for c in alphabet:
        if c not in seen:
            seen.append(c)
    matrix = [seen[i*5:(i+1)*5] for i in range(5)]
    return matrix

def find_position(matrix, char):
    char = char.upper().replace('J', 'I')
    for r in range(5):
        for c in range(5):
            if matrix[r][c] == char:
                return r, c
    return None

def prepare_playfair_text(text):
    text = text.upper().replace('J', 'I')
    clean = ''.join(c for c in text if c.isalpha())
    pairs = []
    i = 0
    while i < len(clean):
        a = clean[i]
        if i + 1 < len(clean):
            b = clean[i+1]
            if a == b:
                pairs.append((a, 'X'))
                i += 1
            else:
                pairs.append((a, b))
                i += 2
        else:
            pairs.append((a, 'X'))
            i += 1
    return pairs

def playfair_encrypt(text, key):
    matrix = generate_playfair_matrix(key)
    steps = []
    
    steps.append({
        'title': 'Matriks Playfair 5×5',
        'matrix': matrix,
        'key': key.upper()
    })
    
    steps.append({
        'title': 'Aturan Enkripsi',
        'rules': [
            'Baris sama → geser kanan 1 posisi (wrap)',
            'Kolom sama → geser bawah 1 posisi (wrap)',
            'Berbeda → ambil pojok persegi (swap kolom)'
        ]
    })
    
    pairs = prepare_playfair_text(text)
    pair_str = ' '.join([f"{a}{b}" for a, b in pairs])
    steps.append({
        'title': 'Pembentukan Pasangan (Digraf)',
        'content': f'Teks dibagi menjadi pasangan: {pair_str}'
    })
    
    pair_steps = []
    output = ''
    for a, b in pairs:
        ra, ca = find_position(matrix, a)
        rb, cb = find_position(matrix, b)
        
        if ra == rb:
            ea = matrix[ra][(ca + 1) % 5]
            eb = matrix[rb][(cb + 1) % 5]
            rule = f"Baris sama (baris {ra}) → geser kanan"
        elif ca == cb:
            ea = matrix[(ra + 1) % 5][ca]
            eb = matrix[(rb + 1) % 5][cb]
            rule = f"Kolom sama (kolom {ca}) → geser bawah"
        else:
            ea = matrix[ra][cb]
            eb = matrix[rb][ca]
            rule = f"Persegi → swap kolom ({ca}↔{cb})"
        
        output += ea + eb
        pair_steps.append({
            'pair': f"{a}{b}",
            'result': f"{ea}{eb}",
            'pos_a': (ra, ca),
            'pos_b': (rb, cb),
            'pos_ea': find_position(matrix, ea),
            'pos_eb': find_position(matrix, eb),
            'rule': rule
        })
    
    steps.append({
        'title': 'Enkripsi Per Pasangan',
        'pair_steps': pair_steps
    })
    
    return {
        'input': text,
        'output': output,
        'key': key.upper(),
        'matrix': matrix,
        'mode': 'encrypt',
        'formula': 'Playfair: Baris/Kolom/Persegi Rule',
        'steps': steps
    }

def playfair_decrypt(text, key):
    matrix = generate_playfair_matrix(key)
    steps = []
    
    steps.append({
        'title': 'Matriks Playfair 5×5',
        'matrix': matrix,
        'key': key.upper()
    })
    
    steps.append({
        'title': 'Aturan Dekripsi',
        'rules': [
            'Baris sama → geser kiri 1 posisi (wrap)',
            'Kolom sama → geser atas 1 posisi (wrap)',
            'Berbeda → ambil pojok persegi (swap kolom) — sama seperti enkripsi'
        ]
    })
    
    clean = ''.join(c.upper() for c in text if c.isalpha())
    if len(clean) % 2 != 0:
        clean += 'X'
    pairs = [(clean[i], clean[i+1]) for i in range(0, len(clean), 2)]
    pair_str = ' '.join([f"{a}{b}" for a, b in pairs])
    steps.append({
        'title': 'Pasangan Cipher',
        'content': f'Pasangan cipher: {pair_str}'
    })
    
    pair_steps = []
    output = ''
    for a, b in pairs:
        ra, ca = find_position(matrix, a)
        rb, cb = find_position(matrix, b)
        
        if ra == rb:
            da = matrix[ra][(ca - 1) % 5]
            db = matrix[rb][(cb - 1) % 5]
            rule = f"Baris sama (baris {ra}) → geser kiri"
        elif ca == cb:
            da = matrix[(ra - 1) % 5][ca]
            db = matrix[(rb - 1) % 5][cb]
            rule = f"Kolom sama (kolom {ca}) → geser atas"
        else:
            da = matrix[ra][cb]
            db = matrix[rb][ca]
            rule = f"Persegi → swap kolom ({ca}↔{cb})"
        
        output += da + db
        pair_steps.append({
            'pair': f"{a}{b}",
            'result': f"{da}{db}",
            'pos_a': (ra, ca),
            'pos_b': (rb, cb),
            'rule': rule
        })
    
    steps.append({
        'title': 'Dekripsi Per Pasangan',
        'pair_steps': pair_steps
    })
    
    return {
        'input': text,
        'output': output,
        'key': key.upper(),
        'matrix': matrix,
        'mode': 'decrypt',
        'formula': 'Playfair Dekripsi: Kebalikan dari Enkripsi',
        'steps': steps
    }
