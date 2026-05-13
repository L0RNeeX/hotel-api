const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Підключення до SQLite
const db = new sqlite3.Database('./variant_13.db', (err) => {
    if (err) {
        console.log('Помилка підключення до БД:', err.message);
    } else {
        console.log('Підключено до SQLite бази даних');
    }
});


// GET - отримати всі кімнати

app.get('/rooms', (req, res) => {
    const sql = 'SELECT * FROM rooms';

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
});

// GET - отримати всіх гостей

app.get('/guests', (req, res) => {
    const sql = 'SELECT * FROM guests';

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
});

// GET - отримати бронювання з JOIN

app.get('/bookings', (req, res) => {
    const sql = `
        SELECT
            bookings.id,
            guests.full_name AS guest_name,
            rooms.room_number,
            bookings.check_in_date,
            bookings.check_out_date,
            bookings.booking_status,
            bookings.total_amount
        FROM bookings
        INNER JOIN guests
            ON bookings.guest_id = guests.id
        INNER JOIN rooms
            ON bookings.room_id = rooms.id
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
});

// POST - додати нового гостя
app.post('/guests', (req, res) => {
    const {
        full_name,
        phone,
        email,
        passport_number,
        loyalty_tier,
        registration_date
    } = req.body;

const sql = `
        INSERT INTO guests
        (
            full_name,
            phone,
            email,
            passport_number,
            loyalty_tier,
            registration_date
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

db.run(
    sql,
    [
        full_name,
        phone,
        email,
        passport_number,
        loyalty_tier,
        registration_date
    ],
    function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({
            message: 'Гість успішно доданий',
            id: this.lastID
        });
    }
);
});

// PUT - оновити дані гостя

app.put('/guests/:id', (req, res) => {
    const { id } = req.params;

    const {
        full_name,
        phone,
        email,
        passport_number,
        loyalty_tier
    } = req.body;

    const sql = `
        UPDATE guests
        SET
            full_name = ?,
            phone = ?,
            email = ?,
            passport_number = ?,
            loyalty_tier = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [
            full_name,
            phone,
            email,
            passport_number,
            loyalty_tier,
            id
        ],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                message: 'Дані гостя оновлено'
            });
        }
    );
});

// DELETE - видалити гостя

app.delete('/guests/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM guests WHERE id = ?';

    db.run(sql, [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({
            message: 'Гість видалений'
        });
    });
});

// GET - послуги готелю

app.get('/services', (req, res) => {
    const sql = 'SELECT * FROM services';

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
});

// Обробка помилки маршруту

app.use((req, res) => {
    res.status(404).json({
        error: 'Маршрут не знайдено'
    });
});

// Запуск сервера

app.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
}});