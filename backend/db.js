const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'stamp_borrow.db');

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
    CREATE TABLE IF NOT EXISTS stamps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inscription TEXT NOT NULL,
      material TEXT NOT NULL,
      carve_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS borrow_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stamp_id INTEGER NOT NULL,
      borrower_name TEXT NOT NULL,
      borrow_date TEXT NOT NULL,
      expected_return_date TEXT NOT NULL,
      actual_return_date TEXT,
      status TEXT NOT NULL DEFAULT 'borrowed',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);
  persist();
}

function seedStampData() {
  const { total } = queryOne('SELECT COUNT(*) AS total FROM stamps');
  if (total > 0) {
    return;
  }

  const stampSeeds = [
    { inscription: '书香门第', material: '寿山石', carve_date: '2020-05-12' },
    { inscription: '宁静致远', material: '青田石', carve_date: '2020-08-23' }
  ];

  for (const item of stampSeeds) {
    db.run(
      `INSERT INTO stamps (inscription, material, carve_date)
       VALUES (?, ?, ?)`,
      [item.inscription, item.material, item.carve_date]
    );
  }

  persist();
}

function seedBorrowRecordData() {
  const { total } = queryOne('SELECT COUNT(*) AS total FROM borrow_records');
  if (total > 0) {
    return;
  }

  const stamps = queryAll('SELECT id FROM stamps ORDER BY id ASC LIMIT 2');
  if (stamps.length < 2) return;

  const borrowSeeds = [
    {
      stamp_id: stamps[0].id,
      borrower_name: '张三',
      borrow_date: '2026-06-01',
      expected_return_date: '2026-06-15',
      actual_return_date: null,
      status: 'borrowed'
    },
    {
      stamp_id: stamps[1].id,
      borrower_name: '李四',
      borrow_date: '2026-05-20',
      expected_return_date: '2026-06-05',
      actual_return_date: '2026-06-03',
      status: 'returned'
    }
  ];

  for (const item of borrowSeeds) {
    db.run(
      `INSERT INTO borrow_records (stamp_id, borrower_name, borrow_date, expected_return_date, actual_return_date, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [item.stamp_id, item.borrower_name, item.borrow_date, item.expected_return_date, item.actual_return_date, item.status]
    );
  }

  persist();
}

function seedData() {
  seedStampData();
  seedBorrowRecordData();
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
