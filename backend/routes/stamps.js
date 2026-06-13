const express = require('express');
const { queryAll, queryOne, run, runAndGetLastId } = require('../db');

const router = express.Router();

const fieldLabels = {
  inscription: '印文',
  material: '材质',
  carve_date: '刻制日期'
};

function validateStampBody(body) {
  const required = ['inscription', 'material', 'carve_date'];
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || String(body[field]).trim() === '') {
      return `${fieldLabels[field]}不能为空`;
    }
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(body.carve_date)) {
    return '刻制日期格式不正确，请使用 YYYY-MM-DD 格式';
  }
  const date = new Date(body.carve_date);
  if (isNaN(date.getTime())) {
    return '刻制日期不是有效日期';
  }
  return null;
}

router.get('/', (req, res) => {
  const records = queryAll('SELECT * FROM stamps ORDER BY carve_date DESC, id DESC');
  res.json({ data: records });
});

router.get('/:id', (req, res) => {
  const record = queryOne('SELECT * FROM stamps WHERE id = ?', [req.params.id]);
  if (!record) {
    return res.status(404).json({ message: '印章不存在' });
  }
  res.json({ data: record });
});

router.post('/', (req, res) => {
  const error = validateStampBody(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { inscription, material, carve_date } = req.body;
  const newId = runAndGetLastId(
    `INSERT INTO stamps (inscription, material, carve_date)
     VALUES (?, ?, ?)`,
    [inscription, material, carve_date]
  );

  const record = queryOne('SELECT * FROM stamps WHERE id = ?', [newId]);
  res.status(201).json({ data: record });
});

router.put('/:id', (req, res) => {
  const existing = queryOne('SELECT * FROM stamps WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ message: '印章不存在' });
  }

  const error = validateStampBody(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { inscription, material, carve_date } = req.body;
  run(
    `UPDATE stamps
     SET inscription = ?, material = ?, carve_date = ?, updated_at = datetime('now', 'localtime')
     WHERE id = ?`,
    [inscription, material, carve_date, req.params.id]
  );

  const record = queryOne('SELECT * FROM stamps WHERE id = ?', [req.params.id]);
  res.json({ data: record });
});

router.delete('/:id', (req, res) => {
  const existing = queryOne('SELECT * FROM stamps WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ message: '印章不存在' });
  }

  run('DELETE FROM stamps WHERE id = ?', [req.params.id]);
  res.json({ message: '删除成功' });
});

module.exports = router;
