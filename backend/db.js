const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'stamp_materials.db');

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
    CREATE TABLE IF NOT EXISTS stamp_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      origin TEXT NOT NULL,
      hardness TEXT NOT NULL,
      color TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

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
  persist();
}

function seedMaterialData() {
  const { total } = queryOne('SELECT COUNT(*) AS total FROM stamp_materials');
  if (total > 0) {
    return;
  }

  const seeds = [
    {
      name: '寿山石',
      origin: '福建省福州市寿山乡',
      hardness: '摩氏硬度2-3，质地温润细腻',
      color: '色彩丰富，有红、黄、白、黑、灰、绿等色',
      description: '寿山石是中国传统四大印章石之首，被誉为"石中之王"。其质地温润细腻，色彩斑斓，纹理奇特，尤以田黄、芙蓉、鸡血等品种最为珍贵。寿山石印章文化源远流长，是篆刻艺术的最佳载体之一。',
      image_url: 'https://picsum.photos/seed/shoushan-stone/400/400'
    },
    {
      name: '青田石',
      origin: '浙江省青田县',
      hardness: '摩氏硬度1.5-2，质地细腻脆爽',
      color: '以青色为主，兼有黄、白、绿、蓝等色',
      description: '青田石是中国四大印章石之一，以其质地细腻、脆爽适中、易于镌刻而闻名于世。青田石颜色丰富，其中以"封门青"最为珍贵，色如碧玉，温润细腻，是篆刻家最喜爱的印材之一。',
      image_url: 'https://picsum.photos/seed/qingtian-stone/400/400'
    },
    {
      name: '昌化石',
      origin: '浙江省临安市昌化镇',
      hardness: '摩氏硬度2-3，质地坚韧细腻',
      color: '多为灰白色，以含有鲜红色辰砂的鸡血石最为名贵',
      description: '昌化石是中国四大印章石之一，尤以"鸡血石"闻名天下。鸡血石因含有鲜红色的辰砂（硫化汞）而得名，其红如鸡血，艳丽夺目，被誉为"印石皇后"。昌化石质地坚韧，适合镌刻，是收藏级印章的首选材料。',
      image_url: 'https://picsum.photos/seed/changhua-stone/400/400'
    },
    {
      name: '巴林石',
      origin: '内蒙古自治区赤峰市巴林右旗',
      hardness: '摩氏硬度2-3，质地温润细腻',
      color: '色彩丰富，有红、黄、蓝、绿、紫、白、黑等多种颜色',
      description: '巴林石是中国四大印章石之一，产自内蒙古草原。其质地温润细腻，色彩绚丽多姿，尤以"巴林鸡血"和"福黄石"最为珍贵。巴林石品种繁多，纹理奇特，是篆刻和收藏的极佳选择。',
      image_url: 'https://picsum.photos/seed/balin-stone/400/400'
    },
    {
      name: '和田玉',
      origin: '新疆和田地区',
      hardness: '摩氏硬度6-6.5，质地致密坚硬',
      color: '以白色为主，兼有青、黄、碧、墨等色',
      description: '和田玉是中国四大名玉之首，被誉为"玉中之王"。其质地致密细腻，温润如脂，尤以羊脂白玉最为珍贵。和田玉印章高贵典雅，质地坚硬耐磨，能够保存千年，是权力和身份的象征。',
      image_url: 'https://picsum.photos/seed/hetian-jade/400/400'
    }
  ];

  for (const item of seeds) {
    db.run(
      `INSERT INTO stamp_materials (name, origin, hardness, color, description, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [item.name, item.origin, item.hardness, item.color, item.description, item.image_url]
    );
  }

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
    { inscription: '厚德载物', material: '寿山石', carve_date: '2021-03-15' },
    { inscription: '上善若水', material: '巴林石', carve_date: '2021-06-30' },
    { inscription: '道法自然', material: '昌化石', carve_date: '2021-11-08' },
    { inscription: '海纳百川', material: '和田玉', carve_date: '2022-01-20' },
    { inscription: '自强不息', material: '寿山石', carve_date: '2022-04-12' },
    { inscription: '志存高远', material: '青田石', carve_date: '2022-07-25' },
    { inscription: '知行合一', material: '寿山石', carve_date: '2022-09-18' },
    { inscription: '虚怀若谷', material: '巴林石', carve_date: '2023-02-14' },
    { inscription: '温故知新', material: '昌化石', carve_date: '2023-05-06' },
    { inscription: '业精于勤', material: '寿山石', carve_date: '2023-08-30' },
    { inscription: '行胜于言', material: '和田玉', carve_date: '2023-12-01' },
    { inscription: '精益求精', material: '青田石', carve_date: '2024-03-22' },
    { inscription: '学而不厌', material: '寿山石', carve_date: '2024-06-15' },
    { inscription: '金石为开', material: '巴林石', carve_date: '2024-09-08' },
    { inscription: '锲而不舍', material: '寿山石', carve_date: '2024-11-27' },
    { inscription: '书为心画', material: '昌化石', carve_date: '2025-01-19' },
    { inscription: '翰墨飘香', material: '和田玉', carve_date: '2025-04-03' },
    { inscription: '藏书之印', material: '寿山石', carve_date: '2025-07-22' },
    { inscription: '百读不厌', material: '青田石', carve_date: '2025-10-11' },
    { inscription: '开卷有益', material: '寿山石', carve_date: '2026-02-14' },
    { inscription: '学无止境', material: '巴林石', carve_date: '2026-05-01' },
    { inscription: '博览群书', material: '寿山石', carve_date: '2026-06-10' }
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

function seedData() {
  seedMaterialData();
  seedStampData();
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
