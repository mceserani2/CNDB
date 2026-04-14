import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const app = express();
const db = new sqlite3.Database('cndb.db');

app.use(express.json());
app.use(cors());

app.get('/jokes',(req, res) => {
    // Ottieni 5 barzellette casuali dal database
    db.all('SELECT * FROM Joke ORDER BY RANDOM() LIMIT 5', (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Errore nel recupero delle barzellette' });
        } else {
            res.json(rows);
        }
    });

});

app.listen(3000);