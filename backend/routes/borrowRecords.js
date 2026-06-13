const express = require('express');
const { queryAll, queryOne, run, runAndGetLastId } = require('../db');

const router = express.Router();

const fieldLabels = {
  stamp_id: '印章编号',
  borrower_name: '借用人姓名',
  borrow_date: '借出日期',
  expected_return_date: '预计归还日期'
};

const statusLabels = {
  borrowed: '借出中',
  returned: '已归还'
};

function validateBorrowBody(body, isUpdate = false, recordId = null) {
  if (!isUpdate) {
    const required = ['stamp_id', 'borrower_name', 'borrow_date', 'expected_return_date'];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || String(body[field]).trim() === '') {
        return `${fieldLabels[field]}不能为空`;
      }
    }
  }

  if (body.stamp_id !== undefined) {
    const stamp = queryOne('SELECT id FROM stamps WHERE id = ?', [body.stamp_id]);
    if (!stamp) {
      return '印章不存在';
    }
    const existingBorrow = queryOne(
      `SELECT id FROM borrow_records 
       WHERE stamp_id = ? AND status = 'borrowed' AND id != ?`,
      [body.stamp_id, recordId || 0]
    );
    if (existingBorrow) {
      return '该印章正在借出中，不能重复登记外借';
    }
  }

  if (body.borrower_name !== undefined && String(body.borrower_name).trim() === '') {
    return '借用人姓名不能为空';
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (body.borrow_date !== undefined) {
    if (!dateRegex.test(body.borrow_date)) {
      return '借出日期格式不正确，请使用 YYYY-MM-DD 格式';
    }
    const date = new Date(body.borrow_date);
    if (isNaN(date.getTime())) {
      return '借出日期不是有效日期';
    }
  }

  if (body.expected_return_date !== undefined) {
    if (!dateRegex.test(body.expected_return_date)) {
      return '预计归还日期格式不正确，请使用 YYYY-MM-DD 格式';
    }
    const date = new Date(body.expected_return_date);
    if (isNaN(date.getTime())) {
      return '预计归还日期不是有效日期';
    }
  }

  const borrowDate = body.borrow_date;
  const expectedReturnDate = body.expected_return_date;
  if (borrowDate && expectedReturnDate) {
    const borrow = new Date(borrowDate);
    const expected = new Date(expectedReturnDate);
    if (expected < borrow) {
      return '预计归还日期不得早于借出日期';
    }
  }

  if (body.actual_return_date !== undefined && body.actual_return_date !== null) {
    if (!dateRegex.test(body.actual_return_date)) {
      return '实际归还日期格式不正确，请使用 YYYY-MM-DD 格式';
    }
    const date = new Date(body.actual_return_date);
    if (isNaN(date.getTime())) {
      return '实际归还日期不是有效日期';
    }
  }

  if (body.status !== undefined && !['borrowed', 'returned'].includes(body.status)) {
    return '外借状态不正确';
  }

  return null;
}

function buildListQuery(status) {
  let sql = `
    SELECT br.*, s.inscription, s.material
    FROM borrow_records br
    LEFT JOIN stamps s ON br.stamp_id = s.id
  `;
  const params = [];

  if (status && status !== 'all') {
    sql += ' WHERE br.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY br.borrow_date DESC, br.id DESC';
  return { sql, params };
}

router.get('/', (req, res) => {
  const { status } = req.query;
  const { sql, params } = buildListQuery(status);
  const records = queryAll(sql, params);
  res.json({ data: records });
});

router.get('/:id', (req, res) => {
  const record = queryOne(
    `SELECT br.*, s.inscription, s.material
     FROM borrow_records br
     LEFT JOIN stamps s ON br.stamp_id = s.id
     WHERE br.id = ?`,
    [req.params.id]
  );
  if (!record) {
    return res.status(404).json({ message: '外借记录不存在' });
  }
  res.json({ data: record });
});

router.post('/', (req, res) => {
  const error = validateBorrowBody(req.body, false, null);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const { stamp_id, borrower_name, borrow_date, expected_return_date } = req.body;
  const newId = runAndGetLastId(
    `INSERT INTO borrow_records (stamp_id, borrower_name, borrow_date, expected_return_date, status)
     VALUES (?, ?, ?, ?, 'borrowed')`,
    [stamp_id, borrower_name, borrow_date, expected_return_date]
  );

  const record = queryOne(
    `SELECT br.*, s.inscription, s.material
     FROM borrow_records br
     LEFT JOIN stamps s ON br.stamp_id = s.id
     WHERE br.id = ?`,
    [newId]
  );
  res.status(201).json({ data: record });
});

router.put('/:id', (req, res) => {
  const existing = queryOne('SELECT * FROM borrow_records WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ message: '外借记录不存在' });
  }

  const error = validateBorrowBody(req.body, true, req.params.id);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const fields = [];
  const values = [];
  const allowedFields = ['stamp_id', 'borrower_name', 'borrow_date', 'expected_return_date', 'actual_return_date', 'status'];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: '没有需要更新的字段' });
  }

  fields.push(`updated_at = datetime('now', 'localtime')`);
  values.push(req.params.id);

  run(
    `UPDATE borrow_records SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  const record = queryOne(
    `SELECT br.*, s.inscription, s.material
     FROM borrow_records br
     LEFT JOIN stamps s ON br.stamp_id = s.id
     WHERE br.id = ?`,
    [req.params.id]
  );
  res.json({ data: record });
});

router.put('/:id/return', (req, res) => {
  const existing = queryOne('SELECT * FROM borrow_records WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ message: '外借记录不存在' });
  }

  if (existing.status === 'returned') {
    return res.status(400).json({ message: '该印章已归还' });
  }

  const returnDate = req.body.actual_return_date;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  let actualReturnDate;
  if (returnDate) {
    if (!dateRegex.test(returnDate) || isNaN(new Date(returnDate).getTime())) {
      return res.status(400).json({ message: '归还日期格式不正确' });
    }
    actualReturnDate = returnDate;
  } else {
    actualReturnDate = new Date().toISOString().split('T')[0];
  }

  run(
    `UPDATE borrow_records
     SET status = 'returned', actual_return_date = ?, updated_at = datetime('now', 'localtime')
     WHERE id = ?`,
    [actualReturnDate, req.params.id]
  );

  const record = queryOne(
    `SELECT br.*, s.inscription, s.material
     FROM borrow_records br
     LEFT JOIN stamps s ON br.stamp_id = s.id
     WHERE br.id = ?`,
    [req.params.id]
  );
  res.json({ data: record });
});

router.delete('/:id', (req, res) => {
  const existing = queryOne('SELECT * FROM borrow_records WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ message: '外借记录不存在' });
  }

  run('DELETE FROM borrow_records WHERE id = ?', [req.params.id]);
  res.json({ message: '删除成功' });
});

module.exports = router;
