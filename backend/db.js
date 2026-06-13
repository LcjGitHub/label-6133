const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'stamp_records.db');

let db = null;

function persist() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

function run(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  persist();
}

function runAndGetLastId(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  const idRow = queryOne('SELECT last_insert_rowid() AS id');
  persist();
  return idRow ? idRow.id : null;
}

function initSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS stamp_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seal_id TEXT NOT NULL,
      book_title TEXT NOT NULL,
      author TEXT NOT NULL,
      page_number INTEGER NOT NULL,
      stamp_date TEXT NOT NULL,
      remark TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);
  persist();
}

function seedData() {
  const { total } = queryOne('SELECT COUNT(*) AS total FROM stamp_records');
  if (total > 0) {
    return;
  }

  const seeds = [
    {
      seal_id: 'SEAL-001',
      book_title: '红楼梦',
      author: '曹雪芹',
      page_number: 37,
      stamp_date: '2024-03-15',
      remark: '钤于第三回扉页'
    },
    {
      seal_id: 'SEAL-002',
      book_title: '百年孤独',
      author: '加西亚·马尔克斯',
      page_number: 128,
      stamp_date: '2024-05-02',
      remark: '重读时标记精彩段落'
    },
    {
      seal_id: 'SEAL-001',
      book_title: '追风筝的人',
      author: '卡勒德·胡赛尼',
      page_number: 1,
      stamp_date: '2024-06-18',
      remark: '藏书章钤于扉页'
    },
    {
      seal_id: 'SEAL-003',
      book_title: '围城',
      author: '钱钟书',
      page_number: 89,
      stamp_date: '2024-09-07',
      remark: '经典语句处钤印留念'
    },
    {
      seal_id: 'SEAL-002',
      book_title: '活着',
      author: '余华',
      page_number: 156,
      stamp_date: '2025-01-22',
      remark: '深夜读完，感慨良多'
    }
  ];

  for (const item of seeds) {
    db.run(
      `INSERT INTO stamp_records (seal_id, book_title, author, page_number, stamp_date, remark)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [item.seal_id, item.book_title, item.author, item.page_number, item.stamp_date, item.remark]
    );
  }
  persist();
}

async function initDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  initSchema();
  seedData();
}

module.exports = {
  initDb,
  queryAll,
  queryOne,
  run,
  runAndGetLastId
};
