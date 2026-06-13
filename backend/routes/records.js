const express = require('express');
const { queryAll, queryOne, run, lastInsertRowId } = require('../db');

const router = express.Router();

function validateRecordBody(body) {
  const required = ['seal_id', 'book_title', 'author', 'page_number', 'stamp_date'];
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || String(body[field]).trim() === '') {
      return `字段 ${field} 不能为空`;
    }
  }
  const page = Number(body.page_number);
  if (isNaN(page) || !Number.isInteger(page) || page <= 0) {
    return '字段 page_number 必须是正整数';
  }
  return null;
}

router.get('/', (req, res) => {
  const records = queryAll('SELECT * FROM stamp_records ORDER BY stamp_date DESC, id DESC');
  res.json({ data: records });
});

router.get('/:id', (req, res) => {
  const record = queryOne('SELECT * FROM stamp_records WHERE id = ?', [req.params.id]);
  if (!record) {
    return res.status(404).json({ message: '钤印记录不存在' });
  }
  res.json({ data: record });
});

router.post('/', (req, res) => {
  const error = validateRecordBody(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { seal_id, book_title, author, page_number, stamp_date, remark = '' } = req.body;
  run(
    `INSERT INTO stamp_records (seal_id, book_title, author, page_number, stamp_date, remark)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [seal_id, book_title, author, Number(page_number), stamp_date, remark]
  );

  const record = queryOne('SELECT * FROM stamp_records WHERE id = ?', [lastInsertRowId()]);
  res.status(201).json({ data: record });
});

router.put('/:id', (req, res) => {
  const existing = queryOne('SELECT * FROM stamp_records WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ message: '钤印记录不存在' });
  }

  const error = validateRecordBody(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { seal_id, book_title, author, page_number, stamp_date, remark = '' } = req.body;
  run(
    `UPDATE stamp_records
     SET seal_id = ?, book_title = ?, author = ?, page_number = ?,
         stamp_date = ?, remark = ?, updated_at = datetime('now', 'localtime')
     WHERE id = ?`,
    [seal_id, book_title, author, Number(page_number), stamp_date, remark, req.params.id]
  );

  const record = queryOne('SELECT * FROM stamp_records WHERE id = ?', [req.params.id]);
  res.json({ data: record });
});

router.delete('/:id', (req, res) => {
  const existing = queryOne('SELECT * FROM stamp_records WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ message: '钤印记录不存在' });
  }

  run('DELETE FROM stamp_records WHERE id = ?', [req.params.id]);
  res.json({ message: '删除成功' });
});

module.exports = router;
