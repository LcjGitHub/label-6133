const express = require('express');
const { queryAll, queryOne, run, lastInsertRowId } = require('../db');

const router = express.Router();

/**
 * 校验印章请求体
 * @param {object} body
 * @returns {string|null} 错误信息，无错误返回 null
 */
function validateSealBody(body) {
  const required = ['inscription', 'material', 'size', 'carved_date', 'purpose'];
  for (const field of required) {
    if (!body[field] || String(body[field]).trim() === '') {
      return `字段 ${field} 不能为空`;
    }
  }
  return null;
}

/**
 * GET /api/seals - 获取全部印章
 */
router.get('/', (req, res) => {
  const seals = queryAll('SELECT * FROM seals ORDER BY id DESC');
  res.json({ data: seals });
});

/**
 * GET /api/seals/:id - 获取单条印章
 */
router.get('/:id', (req, res) => {
  const seal = queryOne('SELECT * FROM seals WHERE id = ?', [req.params.id]);
  if (!seal) {
    return res.status(404).json({ message: '印章不存在' });
  }
  res.json({ data: seal });
});

/**
 * POST /api/seals - 新增印章
 */
router.post('/', (req, res) => {
  const error = validateSealBody(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { inscription, material, size, carved_date, purpose, image_url = '' } = req.body;
  run(
    `INSERT INTO seals (inscription, material, size, carved_date, purpose, image_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [inscription, material, size, carved_date, purpose, image_url]
  );

  const seal = queryOne('SELECT * FROM seals WHERE id = ?', [lastInsertRowId()]);
  res.status(201).json({ data: seal });
});

/**
 * PUT /api/seals/:id - 更新印章
 */
router.put('/:id', (req, res) => {
  const existing = queryOne('SELECT * FROM seals WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ message: '印章不存在' });
  }

  const error = validateSealBody(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { inscription, material, size, carved_date, purpose, image_url = '' } = req.body;
  run(
    `UPDATE seals
     SET inscription = ?, material = ?, size = ?, carved_date = ?,
         purpose = ?, image_url = ?, updated_at = datetime('now', 'localtime')
     WHERE id = ?`,
    [inscription, material, size, carved_date, purpose, image_url, req.params.id]
  );

  const seal = queryOne('SELECT * FROM seals WHERE id = ?', [req.params.id]);
  res.json({ data: seal });
});

/**
 * DELETE /api/seals/:id - 删除印章
 */
router.delete('/:id', (req, res) => {
  const existing = queryOne('SELECT * FROM seals WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ message: '印章不存在' });
  }

  run('DELETE FROM seals WHERE id = ?', [req.params.id]);
  res.json({ message: '删除成功' });
});

module.exports = router;
