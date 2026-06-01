const botao = document.getElementById('adicionarTransacao');

botao.addEventListener('click', async (event) => {
    event.preventDefault();
    const tipo = document.getElementById('tipo').value;
    const valor = Number(document.getElementById('valor').value);
    const categoria = document.getElementById('categoria').value;
    const data = document.getElementById('data').value;

    const resposta = await fetch('/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, valor, categoria, data })
    });

    if (!resposta.ok) {
        alert('Erro ao salvar transação');
        return;
    }

    const dados = await resposta.json();
    await carregarTransacoes();
    console.log(dados);
});


async function carregarTransacoes() {
    const respostas = await fetch('/api/transacoes');
    const transacoes = await respostas.json();

    const listaTransacoes = document.getElementById('listaTransacoes');
    listaTransacoes.innerHTML = '';

    transacoes.forEach(transacao => {
        const classe = transacao.tipo === 'receita' ? 'text-success' : 'text-danger';
        const sinal  = transacao.tipo === 'receita' ? '+' : '-';

        listaTransacoes.innerHTML += `
            <li class="list-group-item d-flex justify-content-between">
                <span>${transacao.categoria} <br> <small>${transacao.data}</small></span>
                <span class="${classe}">${sinal} R$ ${Number(transacao.valor).toFixed(2)}</span>
                <button type="button" class="btn btn-outline-danger border-0" id="deletar-${transacao.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </li>
        `;
    });

    // ✅ Listeners adicionados DEPOIS que os novos elementos existem no DOM
    document.querySelectorAll('[id^="deletar-"]').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const id = event.currentTarget.id.split('-')[1];
            deletarTransacao(id);
        });
    });
}


async function deletarTransacao(id) {
    const resposta = await fetch(`/api/transacoes/${id}`, {
        method: 'DELETE'
    });

    if (!resposta.ok) {
        alert('Erro ao excluir transação');
        return;
    }

    await carregarTransacoes();
}

window.onload = carregarTransacoes;