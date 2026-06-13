const express = require('express');
const { queryAll, queryOne, run, runAndGetLastId } = require('../db');

const router = express.Router();

const fieldLabels = {
  stamp_id: '关联印章编号',
  title: '笔记标题',
  content: '鉴赏正文',
  write_date: '撰写日期',
  mood_tag: '心情标签'
};

const validMoodTags = ['精赏', '常用', '闲置'];

function validateNoteBody(body) {
  const required = ['stamp_id', 'title', 'content', 'write_date', 'mood_tag'];
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || String(body[field]).trim() === '') {
      return `${fieldLabels[field]}不能为空`;
    }
  }
  const stampId = Number(body.stamp_id);
  if (isNaN(stampId) || stampId <= 0) {
    return '关联印章编号必须是正整数';
  }
  const stamp = queryOne('SELECT id FROM stamps WHERE id = ?', [stampId]);
  if (!stamp) {
    return '关联印章不存在';
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(body.write_date)) {
    return '撰写日期格式不正确，请使用 YYYY-MM-DD 格式';
  }
  const date = new Date(body.write_date);
  if (isNaN(date.getTime())) {
    return '撰写日期不是有效日期';
  }
  if (!validMoodTags.includes(body.mood_tag)) {
    return `心情标签必须是以下值之一：${validMoodTags.join('、')}`;
  }
  return null;
}

function getNoteWithStamp(noteId) {
  return queryOne(`
    SELECT n.*, s.inscription AS stamp_inscription, s.material AS stamp_material
    FROM notes n
    LEFT JOIN stamps s ON n.stamp_id = s.id
    WHERE n.id = ?
  `, [noteId]);
}

router.get('/', (req, res) => {
  const notes = queryAll(`
    SELECT n.*, s.inscription AS stamp_inscription, s.material AS stamp_material
    FROM notes n
    LEFT JOIN stamps s ON n.stamp_id = s.id
    ORDER BY n.write_date DESC, n.id DESC
  `);
  res.json({ data: notes });
});

router.get('/stamp/:stampId', (req, res) => {
  const stampId = Number(req.params.stampId);
  if (isNaN(stampId) || stampId <= 0) {
    return res.status(400).json({ message: '印章编号必须是正整数' });
  }
  const notes = queryAll(`
    SELECT n.*, s.inscription AS stamp_inscription, s.material AS stamp_material
    FROM notes n
    LEFT JOIN stamps s ON n.stamp_id = s.id
    WHERE n.stamp_id = ?
    ORDER BY n.write_date DESC, n.id DESC
  `, [stampId]);
  res.json({ data: notes });
});

router.get('/:id', (req, res) => {
  const note = getNoteWithStamp(req.params.id);
  if (!note) {
    return res.status(404).json({ message: '笔记不存在' });
  }
  res.json({ data: note });
});

router.post('/', (req, res) => {
  const error = validateNoteBody(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { stamp_id, title, content, write_date, mood_tag } = req.body;
  const newId = runAndGetLastId(
    `INSERT INTO notes (stamp_id, title, content, write_date, mood_tag)
     VALUES (?, ?, ?, ?, ?)`,
    [Number(stamp_id), title, content, write_date, mood_tag]
  );

  const note = getNoteWithStamp(newId);
  res.status(201).json({ data: note });
});

router.put('/:id', (req, res) => {
  const existing = queryOne('SELECT * FROM notes WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ message: '笔记不存在' });
  }

  const error = validateNoteBody(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { stamp_id, title, content, write_date, mood_tag } = req.body;
  run(
    `UPDATE notes
     SET stamp_id = ?, title = ?, content = ?, write_date = ?, mood_tag = ?, updated_at = datetime('now', 'localtime')
     WHERE id = ?`,
    [Number(stamp_id), title, content, write_date, mood_tag, req.params.id]
  );

  const note = getNoteWithStamp(req.params.id);
  res.json({ data: note });
});

router.delete('/:id', (req, res) => {
  const existing = queryOne('SELECT * FROM notes WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ message: '笔记不存在' });
  }

  run('DELETE FROM notes WHERE id = ?', [req.params.id]);
  res.json({ message: '删除成功' });
});

module.exports = router;
