const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const lockfile = require('proper-lockfile');

const app = express();
const PORT = process.env.PORT || 3001;

// db.json 경로
const DB_PATH = path.join(__dirname, '../data/db.json');

// 초기화: 파일 없으면 생성
function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify({ accounts: [], services: [] }, null, 2));
  }
}

// 락 걸고 쓰기
async function writeDb(data) {
  ensureDb();
  let release;
  try {
    release = await lockfile.lock(DB_PATH, {
      retries: { retries: 5, minTimeout: 100, maxTimeout: 500 }
    });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } finally {
    if (release) await release();
  }
}

// 미들웨어
app.use(cors());
app.use(express.json());

// API: 데이터 읽기
app.get('/api/data', (req, res) => {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  res.json(JSON.parse(raw));
});

// API: 데이터 저장
app.post('/api/data', async (req, res) => {
  const { accounts, services } = req.body;
  try {
    await writeDb({ accounts, services });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'ELOCKED') {
      return res.status(503).json({ error: '다른 사용자가 저장 중입니다. 잠시 후 다시 시도하세요.' });
    }
    res.status(500).json({ error: '저장 중 오류가 발생했습니다.' });
  }
});

// 프로덕션: 정적 파일 서빙
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
