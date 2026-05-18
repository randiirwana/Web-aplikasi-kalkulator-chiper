# 🔐 KriptoSim — Simulasi Kriptografi Klasik

Aplikasi Web Simulasi Kriptografi Klasik berbasis **Python Flask** yang menampilkan proses enkripsi dan dekripsi secara transparan dan edukatif.

## ✨ Fitur

- **5 Algoritma Kriptografi Klasik**: Caesar, Vigenère, Affine, Hill, Playfair
- **Visualisasi Langkah demi Langkah** untuk setiap algoritma
- **Dark/Light Mode** toggle
- **Riwayat** operasi enkripsi/dekripsi
- **Responsive** (mobile-friendly)
- Validasi input lengkap dengan pesan error yang informatif

## 🚀 Cara Menjalankan

```bash
# Clone repository
git clone https://github.com/username/kriptosim.git
cd kriptosim

# Install dependensi
pip install -r requirements.txt

# Jalankan server
python app.py
```

Buka browser di `http://localhost:5000`

## 📁 Struktur Proyek

```
crypto_app/
├── app.py                  # Flask main app
├── requirements.txt
├── algorithms/
│   ├── __init__.py
│   ├── caesar.py           # Caesar Cipher
│   ├── vigenere.py         # Vigenère Cipher
│   ├── affine.py           # Affine Cipher
│   ├── hill.py             # Hill Cipher
│   └── playfair.py         # Playfair Cipher
└── templates/
    └── index.html          # Frontend (HTML + CSS + JS)
```

## 🔢 Algoritma yang Diimplementasi

| Algoritma | Formula Enkripsi | Key |
|-----------|-----------------|-----|
| Caesar | `C = (P + K) mod 26` | Integer 1-25 |
| Vigenère | `C_i = (P_i + K_i) mod 26` | Kata kunci |
| Affine | `C = (aP + b) mod 26` | Integer a (coprime 26), b |
| Hill | `C = K·P mod 26` | Matriks 2×2 atau 3×3 |
| Playfair | Aturan baris/kolom/persegi | Kata kunci (matriks 5×5) |

## 🛠️ Teknologi

- **Backend**: Python 3, Flask
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Font**: Syne, Space Mono, DM Sans (Google Fonts)
- **No framework CSS** — full custom CSS

## 📸 Screenshot

Aplikasi menampilkan:
- Panel input untuk setiap algoritma
- Tampilan proses per karakter dalam tabel
- Visualisasi matriks untuk Hill dan Playfair
- Tabel pergeseran untuk Caesar
- Tabel Vigenère 26×26
- Riwayat operasi yang dapat diakses ulang
