from flask import Flask, render_template, request, jsonify
from .algorithms.caesar import caesar_encrypt, caesar_decrypt
from .algorithms.vigenere import vigenere_encrypt, vigenere_decrypt
from .algorithms.affine import affine_encrypt, affine_decrypt
from .algorithms.hill import hill_encrypt, hill_decrypt
from .algorithms.playfair import playfair_encrypt, playfair_decrypt

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/caesar', methods=['POST'])
def api_caesar():
    data = request.json
    text = data.get('text', '')
    key = data.get('key', 3)
    mode = data.get('mode', 'encrypt')
    try:
        key = int(key)
        if not 1 <= key <= 25:
            return jsonify({'error': 'Key harus antara 1 dan 25'}), 400
        if mode == 'encrypt':
            result = caesar_encrypt(text, key)
        else:
            result = caesar_decrypt(text, key)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/vigenere', methods=['POST'])
def api_vigenere():
    data = request.json
    text = data.get('text', '')
    key = data.get('key', '')
    mode = data.get('mode', 'encrypt')
    try:
        if not key.isalpha():
            return jsonify({'error': 'Key hanya boleh mengandung huruf'}), 400
        if mode == 'encrypt':
            result = vigenere_encrypt(text, key)
        else:
            result = vigenere_decrypt(text, key)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/affine', methods=['POST'])
def api_affine():
    data = request.json
    text = data.get('text', '')
    a = data.get('a', 1)
    b = data.get('b', 0)
    mode = data.get('mode', 'encrypt')
    try:
        a, b = int(a), int(b)
        from math import gcd
        if gcd(a, 26) != 1:
            return jsonify({'error': f'Nilai a={a} tidak valid. GCD(a,26) harus = 1. Gunakan: 1,3,5,7,9,11,15,17,19,21,23,25'}), 400
        if mode == 'encrypt':
            result = affine_encrypt(text, a, b)
        else:
            result = affine_decrypt(text, a, b)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/hill', methods=['POST'])
def api_hill():
    data = request.json
    text = data.get('text', '')
    matrix = data.get('matrix', [])
    mode = data.get('mode', 'encrypt')
    try:
        if mode == 'encrypt':
            result = hill_encrypt(text, matrix)
        else:
            result = hill_decrypt(text, matrix)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/playfair', methods=['POST'])
def api_playfair():
    data = request.json
    text = data.get('text', '')
    key = data.get('key', '')
    mode = data.get('mode', 'encrypt')
    try:
        if not key.replace(' ', '').isalpha():
            return jsonify({'error': 'Key hanya boleh mengandung huruf'}), 400
        if mode == 'encrypt':
            result = playfair_encrypt(text, key)
        else:
            result = playfair_decrypt(text, key)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
