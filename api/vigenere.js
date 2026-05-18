const { vigenereEncrypt, vigenereDecrypt } = require('./utils');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diperbolehkan' });
  }

  const body = req.body || {};
  const text = body.text || '';
  const key = (body.key || '').toString();
  const mode = body.mode === 'decrypt' ? 'decrypt' : 'encrypt';

  if (!/^[A-Za-z]+$/.test(key)) {
    return res.status(400).json({ error: 'Key hanya boleh mengandung huruf' });
  }

  try {
    const result = mode === 'encrypt' ? vigenereEncrypt(text, key) : vigenereDecrypt(text, key);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
