const { hillEncrypt, hillDecrypt } = require('./utils');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diperbolehkan' });
  }

  const body = req.body || {};
  const text = body.text || '';
  const matrix = Array.isArray(body.matrix) ? body.matrix : [];
  const mode = body.mode === 'decrypt' ? 'decrypt' : 'encrypt';

  try {
    const result = mode === 'encrypt' ? hillEncrypt(text, matrix) : hillDecrypt(text, matrix);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
