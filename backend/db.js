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

  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stamp_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      write_date TEXT NOT NULL,
      mood_tag TEXT NOT NULL,
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
    { inscription: '宁静致远', material: '青田石', carve_date: '2020-08-23' },
    { inscription: '厚德载物', material: '巴林石', carve_date: '2021-03-15' },
    { inscription: '墨趣', material: '昌化石', carve_date: '2021-11-08' },
    { inscription: '耕读传家', material: '寿山石', carve_date: '2022-06-20' }
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

function seedNoteData() {
  const { total } = queryOne('SELECT COUNT(*) AS total FROM notes');
  if (total > 0) {
    return;
  }

  const stamps = queryAll('SELECT id FROM stamps ORDER BY id ASC LIMIT 5');
  if (stamps.length < 3) return;

  const noteSeeds = [
    {
      stamp_id: stamps[0].id,
      title: '「书香门第」初赏有感',
      content: '此印为寿山石质，色泽温润，印文「书香门第」四字布局疏密得当，刀法沉稳有力。细观笔画转折处，可见篆刻家深厚功底，线条流畅而不失劲道。尤喜「香」字结体，空灵飘逸，书卷气扑面而来。钤于藏书扉页，顿生雅趣，实为案头佳物。',
      write_date: '2026-04-15',
      mood_tag: '精赏'
    },
    {
      stamp_id: stamps[1].id,
      title: '「宁静致远」日常使用记',
      content: '此方青田石印是我常用的藏书印之一。青田石质细腻，铃印清晰不粘连。「宁静致远」四字取法汉印，方正端庄，与我所读的古籍风格颇为契合。每日读书完毕，以此印钤于卷末，既是标记，也是一种心境的沉淀。印面使用痕迹明显，包浆渐生，更觉古朴。',
      write_date: '2026-05-20',
      mood_tag: '常用'
    },
    {
      stamp_id: stamps[2].id,
      title: '「厚德载物」闲章偶拾',
      content: '此方巴林石印入手多时，近来较少使用。印文「厚德载物」气象宏阔，然我近期多读清人小品，此印风格与书风不甚协调，故暂置匣中。巴林石色彩斑斓，印钮雕刻亦精，闲时取出摩挲把玩，亦是一乐。待日后读大部头著作时，再请出此方印章。',
      write_date: '2026-06-01',
      mood_tag: '闲置'
    },
    {
      stamp_id: stamps[3].id,
      title: '「墨趣」小印品题',
      content: '昌化石小印「墨趣」，乃案头清玩。印面仅二字，然章法奇崛，「墨」字稳重，「趣」字灵动，相映成趣。昌化石多有鸡血，此印虽无血色，然石质细腻温润，易于落墨。近日读帖论画，每有所得，便以此印钤之，甚合「墨趣」之意。',
      write_date: '2026-06-08',
      mood_tag: '精赏'
    },
    {
      stamp_id: stamps[4].id,
      title: '「耕读传家」印文琐谈',
      content: '寿山石「耕读传家」印，是我最珍爱的一方藏书印。印文四字寓意深远，既是家风传承，亦是读书人的理想。篆刻家以浙派刀法出之，线条刚健，字字挺拔。尤其「传」字单人旁与「专」部的呼应处理，匠心独运。此印专用于家族传承的古籍，每钤一次，便感责任在肩。',
      write_date: '2026-06-10',
      mood_tag: '常用'
    }
  ];

  for (const item of noteSeeds) {
    db.run(
      `INSERT INTO notes (stamp_id, title, content, write_date, mood_tag)
       VALUES (?, ?, ?, ?, ?)`,
      [item.stamp_id, item.title, item.content, item.write_date, item.mood_tag]
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
  seedNoteData();
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
