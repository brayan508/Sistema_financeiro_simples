const express = require("express");

const app = express();

const transacoes = [];

app.use(express.static("public"));
app.use(express.json());





app.post("/api/transacoes", (req, res) => {
  transacoes.push(req.body);
  console.log(transacoes);
  res.json({
    sucesso: true,
    transacoes
  });
});


app.get("/api/teste", (req, res) => {
  res.json({ 
    message: "Teste de API bem-sucedido!" 
  });
});


app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
