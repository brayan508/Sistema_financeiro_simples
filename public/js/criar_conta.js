
const botao = document.getElementById('CriarContaButton');

botao.addEventListener('click', async (event) => {
    event.preventDefault();
    const nome_usuario = document.getElementById('nome_usuario').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmar_senha = document.getElementById('confirmar_senha').value;

    if (!nome_usuario || !email || !senha || !confirmar_senha) {
        Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Por favor, preencha todos os campos!'
    });
    return;
} else if (senha !== confirmar_senha) {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'As senhas não coincidem!'
    });
    return;
}
    
    // Bloqueia o botão durante a requisição
    botao.disabled = true;
    botao.textContent = 'Criando conta...';

try {
const resposta = await fetch('/api/criar_conta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome_usuario, email, senha })
        });

        const dados = await resposta.json();

      // ✅ Deixa o backend decidir o que mostrar
if (dados.success) {
    await Swal.fire({ icon: 'success', title: 'Conta criada com sucesso!', text: 'Você pode agora fazer login.' });
    // window.location.href = '/login';
} else {
    Swal.fire({ icon: 'error', title: 'Oops...', text: dados.message });
}


        if (dados.success) {
            await Swal.fire({ icon: 'success', title: 'Conta criada com sucesso!', text: 'Você pode agora fazer login.' });
            // window.location.href = '/login'; // redirecionar após criar conta
        } else {
            Swal.fire({ icon: 'error', title: 'Oops...', text: dados.message });
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Oops...', text: 'Ocorreu um erro ao criar a conta. Tente novamente.' });
        console.error('Erro:', error);
    } finally {
        // Reabilita o botão independente do resultado
        botao.disabled = false;
        botao.textContent = 'Criar Conta';
    }
});


