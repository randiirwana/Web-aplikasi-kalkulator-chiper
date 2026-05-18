from math import gcd

def mod_inverse(a, m):
    for i in range(1, m):
        if (a * i) % m == 1:
            return i
    return None

def affine_encrypt(text, a, b):
    steps = []
    
    steps.append({
        'title': 'Formula Enkripsi',
        'content': f'C = (a·P + b) mod 26, dimana a={a}, b={b}'
    })
    steps.append({
        'title': 'Validasi Key',
        'content': f'GCD({a}, 26) = {gcd(a, 26)} ✓ (harus = 1 agar invertible)'
    })
    
    char_steps = []
    output = ''
    for char in text:
        if char.isalpha():
            is_upper = char.isupper()
            p = ord(char.upper()) - ord('A')
            c = (a * p + b) % 26
            enc_char = chr(c + ord('A'))
            if not is_upper:
                enc_char = enc_char.lower()
            output += enc_char
            char_steps.append({
                'original': char,
                'p_val': p,
                'c_val': c,
                'result': enc_char,
                'formula': f"({a}×{p} + {b}) mod 26 = {a*p+b} mod 26 = {c} → '{enc_char}'"
            })
        else:
            output += char
            char_steps.append({
                'original': char,
                'p_val': '-',
                'c_val': '-',
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
        'a': a,
        'b': b,
        'mode': 'encrypt',
        'formula': f'C = ({a}·P + {b}) mod 26',
        'steps': steps
    }

def affine_decrypt(text, a, b):
    steps = []
    a_inv = mod_inverse(a, 26)
    
    steps.append({
        'title': 'Formula Dekripsi',
        'content': f'P = a⁻¹·(C - b) mod 26, dimana a={a}, b={b}, a⁻¹={a_inv}'
    })
    steps.append({
        'title': 'Menghitung Invers Modular',
        'content': f'a⁻¹ = {a_inv} karena ({a} × {a_inv}) mod 26 = {(a * a_inv) % 26}'
    })
    
    char_steps = []
    output = ''
    for char in text:
        if char.isalpha():
            is_upper = char.isupper()
            c = ord(char.upper()) - ord('A')
            p = (a_inv * (c - b + 26)) % 26
            dec_char = chr(p + ord('A'))
            if not is_upper:
                dec_char = dec_char.lower()
            output += dec_char
            char_steps.append({
                'original': char,
                'c_val': c,
                'p_val': p,
                'result': dec_char,
                'formula': f"{a_inv}×({c} - {b} + 26) mod 26 = {a_inv*(c-b+26)} mod 26 = {p} → '{dec_char}'"
            })
        else:
            output += char
            char_steps.append({
                'original': char,
                'c_val': '-',
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
        'a': a,
        'b': b,
        'a_inv': a_inv,
        'mode': 'decrypt',
        'formula': f'P = {a_inv}·(C - {b}) mod 26',
        'steps': steps
    }
