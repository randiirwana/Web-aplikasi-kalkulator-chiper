const { caesarEncrypt, caesarDecrypt } = require('./utils');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diperbolehkan' });
  }

  const body = req.body || {};
  const text = body.text || '';
  const key = Number(body.key) || 3;
  const mode = body.mode === 'decrypt' ? 'decrypt' : 'encrypt';

  if (!Number.isInteger(key) || key < 1 || key > 25) {
    return res.status(400).json({ error: 'Key harus antara 1 dan 25' });
  }

  try {
    const result = mode === 'encrypt' ? caesarEncrypt(text, key) : caesarDecrypt(text, key);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
