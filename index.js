const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

// ⚠️ ВАЖНО: Используй POOLER адрес, а не IPv6!
const pool = new Pool({
  host: 'aws-0-eu-central-1.pooler.supabase.co', // ← POOLER адрес
  port: 6543, // ← ВАЖНО: порт 6543 для pooler!
  database: 'postgres',
  user: 'postgres.lity.exklemmf', // ← ВАЖНО: добавить .lity.exklemmf
  password: 'W130406007008w_', // ← ТВОЙ ПАРОЛЬ!
  ssl: {
    rejectUnauthorized: false
  }
});

// Тестовые праздники на случай ошибки
const testHolidays = {
  1: "🎉 Сегодня - День снеговика! Постройте снеговика и сделайте фото.",
  2: "🌟 Завтра - День объятий! Обнимите трёх человек и скажите приятные слова."
};

// Проверка подключения
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Ошибка подключения к БД:', err.message);
    console.log('⚠️ Использую тестовые данные при ошибках БД');
  } else {
    console.log('✅ Подключено к базе данных Supabase через Pooler!');
    release();
  }
});

// API endpoint
app.get('/api.php', async (req, res) => {
  try {
    const day = parseInt(req.query.day) || 1;
    
    // Пробуем получить из БД
    try {
      let query;
      if (day === 1) {
        query = "SELECT text FROM holidays WHERE date = CURRENT_DATE";
      } else {
        query = "SELECT text FROM holidays WHERE date = CURRENT_DATE + INTERVAL '1 day'";
      }
      
      const result = await pool.query(query);
      
      if (result.rows.length > 0) {
        // Данные из БД
        res.json({ holiday: result.rows[0].text });
      } else {
        // Нет данных, используем тестовые
        res.json({ holiday: testHolidays[day] });
      }
    } catch (dbError) {
      // Ошибка БД, используем тестовые
      console.log('Использую тестовые данные:', dbError.message);
      res.json({ holiday: testHolidays[day] });
    }
    
  } catch (error) {
    console.error('Ошибка API:', error);
    res.json({ holiday: testHolidays[1] });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`✅ API доступен!`);
  console.log(`👉 https://holiday-api-t0r3.onrender.com/api.php?day=1`);
});
