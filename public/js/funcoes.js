const mensagem = document.getElementById('mensagem')
const lista = document.getElementById('listaQuadrados')

// Nome salvo no login
document.getElementById('nomeUsuario').textContent = localStorage.getItem('nome')

// Lista chamadas
async function carregarQuadrados() {
    const res = await fetch('/quadrado', {
        credentials: 'include'
    })

    if (res.status === 401 || res.status === 403) {
        window.location.href = 'index.html'
        return
    }

    const quadrados = await res.json()

    lista.innerHTML = ''
    quadrados.forEach((q) => {
        lista.innerHTML += `
            <div>
                <p>${q.titulo}</p>
                <p>${q.descricao || ''}</p>
                <small>${new Date(q.criadoEm).toLocaleString('pt-BR')}</small>
                <br>
                <button onclick="editarQuadrado(${q.id})">Editar</button>
                <button onclick="excluirQuadrado(${q.id})">Excluir</button>
                <hr>
            </div>
        `
    })
}

// Cria quadrado
document.getElementById('formQuadrado').addEventListener('submit', async (e) => {
    e.preventDefault()
    const titulo = document.getElementById('titulo').value
    const descricao = document.getElementById('descricao').value

    const res = await fetch('/quadrado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ titulo, descricao })
    })
    const dados = await res.json()

    if (!res.ok) {
        mensagem.textContent = dados.erro
        return
    }
    mensagem.textContent = 'Quadrado adicionado.'
    e.target.reset()
    carregarQuadrados()
})

// Edita quadrado
async function editarQuadrado(id) {
    const titulo = prompt('Título:')
    const descricao = prompt('Descrição:')

    const res = await fetch(`/quadrado/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ titulo, descricao })
    })

    if (res.ok) {
        mensagem.textContent = 'Quadrado atualizado.'
        carregarQuadrados()
    }
}

// Exclui quadrado
async function excluirQuadrado(id) {
    const res = await fetch(`/quadrado/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    })

    if (res.ok) {
        mensagem.textContent = 'Quadrado removido.'
        carregarQuadrados()
    }
}

// Logout
document.getElementById('btnSair').addEventListener('click', async () => {
    await fetch('/logout', {
        method: 'POST',
        credentials: 'include'
    })
    localStorage.removeItem('nome')
    window.location.href = 'index.html'
})

carregarQuadrados()
