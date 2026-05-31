const botao = document.getElementById('adicionarTransacao');

botao.addEventListener('click', async () => {
    const descricao = document.getElementById('tipo').value;
    const valor = document.getElementById('valor').value;
    const categoria = document.getElementById('categoria').value;
    const data = document.getElementById('data').value;

    const resposta = await fetch('/api/transacoes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ descricao, valor, categoria, data })
    });
    const dados = await resposta.json();
    console.log(dados);
});