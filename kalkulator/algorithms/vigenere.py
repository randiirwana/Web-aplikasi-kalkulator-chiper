def vigenere_encrypt(text, key):
    key = key.upper()
    steps = []
    
    steps.append({
        'title': 'Formula Enkripsi',
        'content': f'C_i = (P_i + K_i) mod 26, Key = "{key}"'
    })
    
    key_stream = generate_key_stream(text, key)
    
    steps.append({
        'title': 'Key Stream',
        'content': f'Key "{key}" diperluas menjadi: "{key_stream}"'
    })
    
    char_steps = []
    output = ''
    key_idx = 0
    
    for i, char in enumerate(text):
        if char.isalpha():
            is_upper = char.isupper()
            p = ord(char.upper()) - ord('A')
            k = ord(key[key_idx % len(key)]) - ord('A')
            c = (p + k) % 26
            enc_char = chr(c + ord('A'))
            if not is_upper:
                enc_char = enc_char.lower()
            output += enc_char
            char_steps.append({
                'index': i,
                'original': char,
                'key_char': key[key_idx % len(key)],
                'p_val': p,
                'k_val': k,
                'c_val': c,
                'result': enc_char,
                'formula': f"({p} + {k}) mod 26 = {p+k} mod 26 = {c} → '{enc_char}'"
            })
            key_idx += 1
        else:
            output += char
            char_steps.append({
                'index': i,
                'original': char,
                'key_char': '-',
                'p_val': '-',
                'k_val': '-',
                'c_val': '-',
                'result': char,
                'formula': 'Bukan huruf, dilewati'
            })
    
    steps.append({
        'title': 'Proses Per Karakter',
        'char_steps': char_steps
    })
    
    # Vigenere square snippet
    steps.append({
        'title': 'Tabel Vigenère (Sebagian)',
        'vigenere_square': generate_vigenere_square()
    })
    
    return {
        'input': text,
        'output': output,
        'key': key,
        'mode': 'encrypt',
        'formula': 'C_i = (P_i + K_i) mod 26',
        'steps': steps
    }

def vigenere_decrypt(text, key):
    key = key.upper()
    steps = []
    
    steps.append({
        'title': 'Formula Dekripsi',
        'content': f'P_i = (C_i - K_i + 26) mod 26, Key = "{key}"'
    })
    
    key_stream = generate_key_stream(text, key)
    steps.append({
        'title': 'Key Stream',
        'content': f'Key "{key}" diperluas menjadi: "{key_stream}"'
    })
    
    char_steps = []
    output = ''
    key_idx = 0
    
    for i, char in enumerate(text):
        if char.isalpha():
            is_upper = char.isupper()
            c = ord(char.upper()) - ord('A')
            k = ord(key[key_idx % len(key)]) - ord('A')
            p = (c - k + 26) % 26
            dec_char = chr(p + ord('A'))
            if not is_upper:
                dec_char = dec_char.lower()
            output += dec_char
            char_steps.append({
                'index': i,
                'original': char,
                'key_char': key[key_idx % len(key)],
                'c_val': c,
                'k_val': k,
                'p_val': p,
                'result': dec_char,
                'formula': f"({c} - {k} + 26) mod 26 = {c-k+26} mod 26 = {p} → '{dec_char}'"
            })
            key_idx += 1
        else:
            output += char
            char_steps.append({
                'index': i,
                'original': char,
                'key_char': '-',
                'c_val': '-',
                'k_val': '-',
                'p_val': '-',
                'result': char,
                'formula': 'Bukan huruf, dilewati'
            })
    
    steps.append({
        'title': 'Proses Per Karakter',
        'char_steps': char_steps
    })
    
    return {
        'input': text,
        'output': output,
        'key': key,
        'mode': 'decrypt',
        'formula': 'P_i = (C_i - K_i + 26) mod 26',
        'steps': steps
    }

def generate_key_stream(text, key):
    result = ''
    key_idx = 0
    for char in text:
        if char.isalpha():
            result += key[key_idx % len(key)]
            key_idx += 1
        else:
            result += ' '
    return result

def generate_vigenere_square():
    square = []
    for i in range(26):
        row = []
        for j in range(26):
            row.append(chr((i + j) % 26 + ord('A')))
        square.append(row)
    return square
