const botao = document.getElementById('adicionarTransacao');

botao.addEventListener('click', async (event) => {
     event.preventDefault();
    const tipo = document.getElementById('tipo').value;
    const valor = Number(document.getElementById('valor').value);
    const id_categoria = document.getElementById('categoria').value;
    const data = document.getElementById('data').value;

    if (!tipo || !valor || !id_categoria || !data) {
        alert('Por favor, preencha todos os campos');
        return;
    } else if (valor <= 0) {
        alert('Valor deve ser maior que zero');
        return;
    } else if (new Date(data) > new Date()) {
        alert('Data não pode ser futura');
        return;
    } 

    const resposta = await fetch('/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, valor, id_categoria, data })
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


    //atualiza o saldo
    let saldo = 0;
    transacoes.forEach(transacao => {
        const valor = Number(transacao.valor);
        saldo += transacao.tipo === 'receita' ? valor : -valor;
    });

    document.getElementById('saldo').textContent = `R$ ${saldo.toFixed(2)}`;

    //atualiza receitas e despesas
    const resposta_receitas = await fetch('/api/receitas');
    const receitas = await resposta_receitas.json();
    document.getElementById('receitas').textContent = `R$ ${Number(receitas[0].total).toFixed(2)}`;

    const resposta_despesas = await fetch('/api/despesas');
    const despesas = await resposta_despesas.json();
    document.getElementById('despesas').textContent = `R$ -${Number(despesas[0].total).toFixed(2)}`;

    const resposta_categorias = await fetch('/api/categorias');
    const categorias = await resposta_categorias.json();


    //atualiza a lista de transações
    const listaTransacoes = document.getElementById('listaTransacoes');
    listaTransacoes.innerHTML = '';

    const ultimastransacoes = transacoes.slice(-6).reverse();


   ultimastransacoes.forEach(transacao => {
    const classe = transacao.tipo === 'receita' ? 'text-success' : 'text-danger';
    const sinal  = transacao.tipo === 'receita' ? '+' : '-';
    const nomeCategoria = categorias.find(c => c.id_categoria === transacao.id_categoria)?.nome_categoria || 'Sem categoria';
    const data = new Date(transacao.data_transacao).toLocaleDateString('pt-BR');

    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between';
    li.innerHTML = `
        <span>${nomeCategoria} <br> <small>${data}</small></span>
        <span class="${classe}">${sinal} R$ ${Number(transacao.valor).toFixed(2)}</span>
        <button type="button" class="btn btn-outline-danger border-0">
            <i class="bi bi-trash"></i>
        </button>
    `;

    // ✅ listener direto no botão, sem depender do id
    li.querySelector('button').addEventListener('click', () => {
        deletarTransacao(transacao.id_transacao);
    });

    listaTransacoes.appendChild(li);
});

    // Listeners adicionados DEPOIS que os novos elementos existem no DOM
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

async function carregarCategorias() {
    const select = document.getElementById('categoria');
    const resposta_carregar_categorias = await fetch('/api/categorias');
    const categorias = await resposta_carregar_categorias.json();

    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id_categoria;
        option.textContent = categoria.nome_categoria;
        select.appendChild(option);
    });
}

window.onload = () => {
    carregarTransacoes();
    carregarCategorias();
};