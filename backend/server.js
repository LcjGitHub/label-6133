const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const recordsRouter = require('./routes/records');
const stampsRouter = require('./routes/stamps');
const statisticsRouter = require('./routes/statistics');
const borrowRecordsRouter = require('./routes/borrowRecords');
const notesRouter = require('./routes/notes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/records', recordsRouter);
app.use('/api/stamps', stampsRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/borrow-records', borrowRecordsRouter);
app.use('/api/notes', notesRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: '服务器内部错误' });
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`印材图鉴 API 运行于 http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('服务启动失败:', err);
  process.exit(1);
});
