const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');

const cors = require('cors');
const app = express();
const port = 3000;

// إنشاء اتصال بقاعدة البيانات
const db = new sqlite3.Database('users.db');

// إنشاء جدول المستخدمين إذا لم يكن موجوداً
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT
        )`
    );
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Middleware لتحليل طلبات JSON
app.use(bodyParser.json());

app.options('*', (req, res) => {
    res.sendStatus(200);
});

// أضف هذا المسار للصفحة الرئيسية
app.get('/', (req, res) => {
    res.send("Hello From Joo");
});

// راوت لتسجيل المستخدم
app.post('/login', (req, res) => {
const { username, password } = req.body;

if (!username || !password) {
    return res.status(400).json({ error: 'يجب إدخال اسم المستخدم وكلمة المرور' });
}

  // إدخال البيانات في قاعدة البيانات
db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, password],
    function (err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ error: 'اسم المستخدم موجود مسبقاً' });
            }
            return res.status(500).json({ error: 'خطأ في السيرفر' });
        }
        return res.status(201).json({ message: 'تم تسجيل المستخدم بنجاح' });
    }
);
});

app.listen(port, () => {
    console.log(`السيرفر يعمل على المنفذ ${port}`);
});