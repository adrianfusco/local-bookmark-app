const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create bookmarks table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT
    )`);
});

// API endpoint to get all bookmarks
app.get('/api/bookmarks', (req, res) => {
    db.all('SELECT * FROM bookmarks', (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(rows);
    });
});

// API endpoint to add a bookmark
app.post('/api/bookmarks', (req, res) => {
    const { url, name, description } = req.body;
    const sql = 'INSERT INTO bookmarks (url, name, description) VALUES (?, ?, ?)';
    db.run(sql, [url, name, description], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json({ id: this.lastID });
    });
});

// API endpoint to delete a bookmark by ID
app.delete('/api/bookmarks/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM bookmarks WHERE id = ?';

    db.run(sql, id, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json({ message: 'Bookmark deleted successfully' });
    });
});

app.put('/api/bookmarks/:id', (req, res) => {
    const id = req.params.id;
    const { url, name, description } = req.body;
    const sql = 'UPDATE bookmarks SET url = ?, name = ?, description = ? WHERE id = ?';

    db.run(sql, [url, name, description, id], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json({ message: 'Bookmark updated successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
