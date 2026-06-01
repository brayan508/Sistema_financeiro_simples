const express = require("express");

const app = express();

const pool = require("./databese/db.js");

app.use(express.static("public"));
app.use(express.json());





app.post("/api/transacoes", async (req, res) => {
  const { tipo, valor, categoria, data } = req.body;

  const [result] = await pool.query(
    "INSERT INTO transacoes (tipo, valor, categoria, data_transacao) VALUES (?, ?, ?, ?)",
    [tipo, 
    valor, 
    categoria, 
    data]
  );

  res.json({ sucesso: true });
});

app.get("/api/transacoes", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM transacoes ORDER BY data_transacao DESC");
  res.json(rows);
});

app.delete("/api/transacoes/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM transacoes WHERE id = ?", [id]);
  res.json({ sucesso: true });
});




app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
