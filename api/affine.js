const { affineEncrypt, affineDecrypt, gcd } = require('./utils');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diperbolehkan' });
  }

  const body = req.body || {};
  const text = body.text || '';
  const a = Number(body.a);
  const b = Number(body.b);
  const mode = body.mode === 'decrypt' ? 'decrypt' : 'encrypt';

  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    return res.status(400).json({ error: 'Nilai a dan b harus bilangan bulat' });
  }

  if (gcd(a, 26) !== 1) {
    return res.status(400).json({ error: `Nilai a=${a} tidak valid. GCD(a,26) harus = 1. Gunakan: 1,3,5,7,9,11,15,17,19,21,23,25` });
  }

  try {
    const result = mode === 'encrypt' ? affineEncrypt(text, a, b) : affineDecrypt(text, a, b);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
