const mensagem = document.getElementById('mensagem')

// Login
document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('loginEmail').value
    const senha = document.getElementById('loginSenha').value

    const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, senha })
    })
    const dados = await res.json()

    if (!res.ok) {
        mensagem.textContent = dados.erro
        return
    }
    localStorage.setItem('nome', dados.usuario.nome)
    window.location.href = 'painel.html'
})

// Cadastro
document.getElementById('formRegistro').addEventListener('submit', async (e) => {
    e.preventDefault()
    const nome = document.getElementById('regNome').value
    const email = document.getElementById('regEmail').value
    const senha = document.getElementById('regSenha').value

    const res = await fetch('/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
    })
    const dados = await res.json()

    if (!res.ok) {
        mensagem.textContent = dados.erro
        return
    }
    mensagem.textContent = 'Cadastro feito. Faça login.'
    e.target.reset()
})
