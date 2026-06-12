const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'seals.db');

/** @type {import('sql.js').Database | null} */
let db = null;

/**
 * 将查询结果持久化到磁盘
 */
function persist() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

/**
 * 执行查询并返回对象数组
 * @param {string} sql
 * @param {Array<string|number|null>} params
 * @returns {object[]}
 */
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

/**
 * 执行查询并返回单条记录
 * @param {string} sql
 * @param {Array<string|number|null>} params
 * @returns {object|null}
 */
function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

/**
 * 执行写操作并持久化
 * @param {string} sql
 * @param {Array<string|number|null>} params
 */
function run(sql, params = []) {
  db.run(sql, params);
  persist();
}

/**
 * 获取最后插入的行 ID
 * @returns {number}
 */
function lastInsertRowId() {
  const row = queryOne('SELECT last_insert_rowid() AS id');
  return row.id;
}

/**
 * 初始化数据库表结构
 */
function initSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS seals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inscription TEXT NOT NULL,
      material TEXT NOT NULL,
      size TEXT NOT NULL,
      carved_date TEXT NOT NULL,
      purpose TEXT NOT NULL,
      image_url TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);
  persist();
}

/**
 * 插入种子数据（仅当表为空时）
 */
function seedData() {
  const { total } = queryOne('SELECT COUNT(*) AS total FROM seals');
  if (total > 0) {
    return;
  }

  const seeds = [
    {
      inscription: '藏书',
      material: '青田石',
      size: '2.5×2.5 cm',
      carved_date: '2018-03-15',
      purpose: '钤于藏书扉页',
      image_url: 'https://picsum.photos/seed/seal1/400/400'
    },
    {
      inscription: '静读',
      material: '寿山石',
      size: '3.0×3.0 cm',
      carved_date: '2019-07-22',
      purpose: '阅读笔记钤印',
      image_url: 'https://picsum.photos/seed/seal2/400/400'
    },
    {
      inscription: '墨香',
      material: '昌化石',
      size: '2.0×2.0 cm',
      carved_date: '2020-11-08',
      purpose: '线装书收藏印',
      image_url: 'https://picsum.photos/seed/seal3/400/400'
    },
    {
      inscription: '书痴',
      material: '巴林石',
      size: '2.8×2.8 cm',
      carved_date: '2021-05-30',
      purpose: '珍本善本钤印',
      image_url: 'https://picsum.photos/seed/seal4/400/400'
    },
    {
      inscription: '夜读',
      material: '老挝石',
      size: '2.2×2.2 cm',
      carved_date: '2023-01-18',
      purpose: '夜间阅读随手钤印',
      image_url: 'https://picsum.photos/seed/seal5/400/400'
    }
  ];

  for (const item of seeds) {
    db.run(
      `INSERT INTO seals (inscription, material, size, carved_date, purpose, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [item.inscription, item.material, item.size, item.carved_date, item.purpose, item.image_url]
    );
  }
  persist();
}

/**
 * 初始化数据库连接
 */
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
  lastInsertRowId
};
