import inquirer from "inquirer";
import sqlite from "sqlite3";

const db = new sqlite.Database("cndb.db");
await createTable();
main();

async function main() {
    const menu = [
        {
            type: "list",
            name: "scelta",
            message: "Cosa vuoi fare?",
            choices: [
                "Aggiungi una barzelletta",
                "Elimina una barzelletta",
                "Visualizza tutte le barzellette",
                "Esci"
            ]
        }
    ];

    const option = await inquirer.prompt(menu);

    switch (option.scelta) {
        case "Aggiungi una barzelletta":
            await aggiungiBarzelletta();
            await main();
            break;
        case "Elimina una barzelletta":
            await eliminaBarzelletta();
            await main();
            break;
        case "Visualizza tutte le barzellette":
            await vediBarzellette();
            await main();
            break;
        case "Esci":
            console.log("Goodbye!");
    }
}

async function vediBarzellette() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM Joke`, (err, rows) => {
            if (err)                
                reject(err);
            else {
                rows.forEach(row => {
                    console.log(`ID: ${row.Id}\nDomanda: ${row.question}\nRisposte: ${row.answers}\nRisposta Corretta: ${row.ans}\n`);
                });
                resolve();
            }
        });
    });
}

async function eliminaBarzelletta() {
    const id = await inquirer.prompt({
        type: "input",
        name: "id", 
        message: "Inserisci l'ID della barzelletta da eliminare:",
        validate: (input) => {
            const num = parseInt(input);
            return !isNaN(num) || "Devi inserire un numero valido.";
        }
    });

    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM Joke WHERE Id = ?`, [id.id], function (err) {
            if (err)
                reject(err);
            else {
                if (this.changes > 0) {
                    console.log("Barzelletta eliminata con successo!"); 
                } else {
                    console.log("Nessuna barzelletta trovata con l'ID fornito.");
                }
                resolve();
            }
        });
    });
}

async function aggiungiBarzelletta() {
    const questions = [
        {
            type: "input",
            name: "question",
            message: "Inserisci la domanda della barzelletta:",
            validate: (input) => input.trim() !== "" || "La domanda non può essere vuota."
        },
        {
            type: "input",
            name: "answers",
            message: "Inserisci le risposte (separate da $):",
            validate: (input) => {
                // Le risposte devono essere 4 non vuote
                const answers = input.split("$").map(ans => ans.trim()).filter(ans => ans !== "");
                return answers.length === 4 || "Devi inserire esattamente 4 risposte.";
            }
        },
        {
            type: "input",
            name: "ans",
            message: "Inserisci la risposta corretta (1-4):",
            validate: (input) => {
                const num = parseInt(input);
                return (num >= 1 && num <= 4) || "La risposta corretta deve essere un numero tra 1 e 4.";
            }
        }
    ];

    const answers = await inquirer.prompt(questions);

    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO Joke (question, answers, ans) VALUES (?, ?, ?)`,
            [answers.question, answers.answers, answers.ans],
            function (err) {
                if (err)                    
                    reject(err);
                else {
                    console.log("Barzelletta aggiunta con successo!");
                    resolve();
                }
            });
    });
}

function createTable() {
    return new Promise((resolve, reject) => {
        db.run(`CREATE TABLE IF NOT EXISTS "Joke" (
                    "Id"	INTEGER NOT NULL,
                    "question"	TEXT NOT NULL,
                    "answers"	TEXT NOT NULL,
                    "ans"	INTEGER NOT NULL,
                    PRIMARY KEY("Id" AUTOINCREMENT)
                );`,(err) => {
                        if (err)
                            reject(err);
                        else
                            resolve();
                    });
    });
}
