const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());


const pool = new Pool({
  host: '2a05:d014:1c96:5f19:8c72:479d:9b73:2e9',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'W130406007008w_',
  ssl: {
    rejectUnauthorized: false
  }
});

// Проверка подключения
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Ошибка подключения к БД:', err.message);
  } else {
    console.log('✅ Подключено к базе данных!');
    release();
  }
});

// API endpoint
app.get('/api.php', async (req, res) => {
  try {
    const day = parseInt(req.query.day) || 1;
    
    let query;
    if (day === 1) {
      query = "SELECT text FROM holidays WHERE date = CURRENT_DATE";
    } else {
      query = "SELECT text FROM holidays WHERE date = CURRENT_DATE + INTERVAL '1 day'";
    }
    
    const result = await pool.query(query);
    
    if (result.rows.length > 0) {
      res.json({ holiday: result.rows[0].text });
    } else {
      res.json({ holiday: "На этот день праздников нет." });
    }
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ holiday: "Ошибка сервера: " + error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
