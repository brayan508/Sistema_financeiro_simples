botao = document.getElementById('botao_login');

botao.addEventListener('click', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email_usuario').value.trim();
    const senha = document.getElementById('senha_usuario').value;

    if (!email || !senha) {
        return Swal.fire({ icon: 'error', title: 'Oops...', text: 'Preencha todos os campos.' });
    }

    botao.disabled = true;
    botao.textContent = 'Entrando...';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = '/html/home.html';
        } else {
            Swal.fire({ icon: 'error', title: 'Erro', text: data.message });
        }
    } catch (error) {
        console.error('Erro:', error);
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Ocorreu um erro inesperado. Tente novamente.' });
    } finally {
        botao.disabled = false;
        botao.textContent = 'Entrar';
    }
});