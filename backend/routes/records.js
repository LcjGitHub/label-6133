const express = require('express');
const { queryAll, queryOne, run, runAndGetLastId } = require('../db');

const router = express.Router();

const fieldLabels = {
  name: '印材名称',
  origin: '产地',
  hardness: '硬度描述',
  color: '参考颜色',
  description: '简介文字',
  image_url: '示意图片链接'
};

function validateRecordBody(body) {
  const required = ['name', 'origin', 'hardness', 'color', 'description', 'image_url'];
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || String(body[field]).trim() === '') {
      return `${fieldLabels[field]}不能为空`;
    }
  }
  return null;
}

router.get('/', (req, res) => {
  const records = queryAll('SELECT * FROM stamp_materials ORDER BY id DESC');
  res.json({ data: records });
});

router.get('/:id', (req, res) => {
  const record = queryOne('SELECT * FROM stamp_materials WHERE id = ?', [req.params.id]);
  if (!record) {
    return res.status(404).json({ message: '印材不存在' });
  }
  res.json({ data: record });
});

router.post('/', (req, res) => {
  const error = validateRecordBody(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { name, origin, hardness, color, description, image_url } = req.body;
  const newId = runAndGetLastId(
    `INSERT INTO stamp_materials (name, origin, hardness, color, description, image_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, origin, hardness, color, description, image_url]
  );

  const record = queryOne('SELECT * FROM stamp_materials WHERE id = ?', [newId]);
  res.status(201).json({ data: record });
});

router.put('/:id', (req, res) => {
  const existing = queryOne('SELECT * FROM stamp_materials WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ message: '印材不存在' });
  }

  const error = validateRecordBody(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { name, origin, hardness, color, description, image_url } = req.body;
  run(
    `UPDATE stamp_materials
     SET name = ?, origin = ?, hardness = ?, color = ?,
         description = ?, image_url = ?, updated_at = datetime('now', 'localtime')
     WHERE id = ?`,
    [name, origin, hardness, color, description, image_url, req.params.id]
  );

  const record = queryOne('SELECT * FROM stamp_materials WHERE id = ?', [req.params.id]);
  res.json({ data: record });
});

router.delete('/:id', (req, res) => {
  const existing = queryOne('SELECT * FROM stamp_materials WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ message: '印材不存在' });
  }

  run('DELETE FROM stamp_materials WHERE id = ?', [req.params.id]);
  res.json({ message: '删除成功' });
});

module.exports = router;
