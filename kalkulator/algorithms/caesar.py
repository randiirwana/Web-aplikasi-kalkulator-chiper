def caesar_encrypt(text, key):
    steps = []
    result = []
    formula = f"C = (P + {key}) mod 26"
    
    steps.append({
        'title': 'Formula Enkripsi',
        'content': f'C = (P + K) mod 26, dimana K = {key}'
    })
    
    char_steps = []
    output = ''
    for char in text:
        if char.isalpha():
            is_upper = char.isupper()
            p = ord(char.upper()) - ord('A')
            c = (p + key) % 26
            enc_char = chr(c + ord('A'))
            if not is_upper:
                enc_char = enc_char.lower()
            output += enc_char
            char_steps.append({
                'original': char,
                'p_val': p,
                'c_val': c,
                'encrypted': enc_char,
                'formula': f"({p} + {key}) mod 26 = {p+key} mod 26 = {c} → '{enc_char}'"
            })
        else:
            output += char
            char_steps.append({
                'original': char,
                'p_val': '-',
                'c_val': '-',
                'encrypted': char,
                'formula': 'Karakter non-huruf, tidak diubah'
            })
    
    steps.append({
        'title': 'Proses Per Karakter',
        'char_steps': char_steps
    })
    
    steps.append({
        'title': 'Tabel Pergeseran Caesar',
        'shift_table': generate_shift_table(key)
    })
    
    return {
        'input': text,
        'output': output,
        'key': key,
        'mode': 'encrypt',
        'formula': formula,
        'steps': steps
    }

def caesar_decrypt(text, key):
    steps = []
    formula = f"P = (C - {key} + 26) mod 26"
    
    steps.append({
        'title': 'Formula Dekripsi',
        'content': f'P = (C - K + 26) mod 26, dimana K = {key}'
    })
    
    char_steps = []
    output = ''
    for char in text:
        if char.isalpha():
            is_upper = char.isupper()
            c = ord(char.upper()) - ord('A')
            p = (c - key + 26) % 26
            dec_char = chr(p + ord('A'))
            if not is_upper:
                dec_char = dec_char.lower()
            output += dec_char
            char_steps.append({
                'original': char,
                'c_val': c,
                'p_val': p,
                'decrypted': dec_char,
                'formula': f"({c} - {key} + 26) mod 26 = {c - key + 26} mod 26 = {p} → '{dec_char}'"
            })
        else:
            output += char
            char_steps.append({
                'original': char,
                'c_val': '-',
                'p_val': '-',
                'decrypted': char,
                'formula': 'Karakter non-huruf, tidak diubah'
            })
    
    steps.append({
        'title': 'Proses Per Karakter',
        'char_steps': char_steps
    })
    
    steps.append({
        'title': 'Tabel Pergeseran Caesar',
        'shift_table': generate_shift_table(key)
    })
    
    return {
        'input': text,
        'output': output,
        'key': key,
        'mode': 'decrypt',
        'formula': formula,
        'steps': steps
    }

def generate_shift_table(key):
    alphabet = [chr(i + ord('A')) for i in range(26)]
    shifted = [chr((i + key) % 26 + ord('A')) for i in range(26)]
    return {'plain': alphabet, 'cipher': shifted}
