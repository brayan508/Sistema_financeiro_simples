require('dotenv').config();

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
});

const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();


app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

if (!process.env.JWT_SECRET) {
    console.error('ERRO: JWT_SECRET não definido no .env');
    process.exit(1);
}


// ✅ Definida antes das rotas
function autenticar(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Não autorizado.' });
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = payload;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Sessão expirada. Faça login novamente.' });
        }
        return res.status(401).json({ success: false, message: 'Token inválido.' });
    }
}

app.get("/api/categorias", autenticar, async (req, res) => {
    const id_usuario = req.usuario.id; // vem do token JWT

    try {
        const [rows] = await pool.query(
            "SELECT * FROM categorias WHERE id_usuario = ?",
            [id_usuario]
        );
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar categorias:', error.message);
        res.status(500).json({ success: false, message: 'Erro interno.' });
    }
});

app.post("/api/login",  async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ success: false, message: 'Preencha todos os campos.' });
    }

    try {
        // 1. Busca o usuário
        const [rows] = await pool.query(
            "SELECT * FROM usuarios WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Email ou senha incorretos.' });
        }

        const usuario = rows[0];

        // 2. Verifica a senha
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ success: false, message: 'Email ou senha incorretos.' });
        }

        // 3. Gera o token JWT
        const token = jwt.sign(
            { id: usuario.id_usuario, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 4. Envia o cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,    // ⚠️ mude para true quando for para produção com HTTPS
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24
        });

        return res.json({ success: true });

    } catch (error) {
        console.error('Erro no login:', error.message);
        return res.status(500).json({ success: false, message: 'Erro interno.' });
    }
});

app.post("/api/transacoes", autenticar, async (req, res) => {
    const { tipo, valor, id_categoria, data } = req.body; // ✅ id_categoria

    try {
        await pool.query(
            "INSERT INTO transacoes (tipo, valor, id_categoria, data_transacao, id_usuario) VALUES (?, ?, ?, ?, ?)",
            [tipo, valor, id_categoria, data, req.usuario.id] // ✅ id_usuario do token
        );
        res.json({ sucesso: true });
    } catch (error) {
        console.error('Erro ao salvar transação:', error.message);
        res.status(500).json({ success: false, message: 'Erro interno.' });
    }
});

app.post("/api/criar_conta", async (req, res) => {
    const { nome_usuario, email, senha } = req.body;

    // Validação no backend (nunca confie só no frontend)
    if (!nome_usuario || !email || !senha) {
        return res.status(400).json({ success: false, message: 'Preencha todos os campos.' });
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValido) {
        return res.status(400).json({ success: false, message: 'Email inválido.' });
    }

    if (senha.length < 8) {
        return res.status(400).json({ success: false, message: 'A senha deve ter pelo menos 8 caracteres.' });
    }

    try {
        // Verifica se email já existe
        const [rows] = await pool.query(
            "SELECT id_usuario FROM usuarios WHERE email = ?",  // SELECT só do necessário, não SELECT *
            [email]
        );

        if (rows.length > 0) {
            return res.status(409).json({ success: false, message: 'Email já cadastrado.' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        await pool.query(
            "INSERT INTO usuarios (nome_usuario, email, senha) VALUES (?, ?, ?)",
            [nome_usuario, email, hashedPassword]
            // data_criacao removido: use DEFAULT CURRENT_TIMESTAMP no banco
        );

        return res.status(201).json({ success: true, message: 'Conta criada com sucesso!' });

    } catch (error) {
    console.error('Erro detalhado:', error.message);
    return res.status(500).json({ success: false, message: error.message });
}
});

app.get("/api/receitas", autenticar, async (req, res) => {
  const [rows] = await pool.query("SELECT SUM(valor) as total FROM transacoes WHERE tipo = 'receita' AND id_usuario = ?", [req.usuario.id]);
  res.json(rows);
});

app.get("/api/despesas", autenticar, async (req, res) => {
  const [rows] = await pool.query("SELECT SUM(valor) as total FROM transacoes WHERE tipo = 'despesa' AND id_usuario = ?", [req.usuario.id]);
  res.json(rows);
});

app.get("/api/transacoes", autenticar, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM transacoes ORDER BY data_transacao DESC");
  res.json(rows);
});

app.delete("/api/transacoes/:id", autenticar, async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query(
            "DELETE FROM transacoes WHERE id_transacao = ? AND id_usuario = ?",
            [id, req.usuario.id] // ✅ garante que só deleta transação do próprio usuário
        );
        res.json({ sucesso: true });
    } catch (error) {
        console.error('Erro ao deletar transação:', error.message);
        res.status(500).json({ success: false, message: 'Erro interno.' });
    }
});




app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
