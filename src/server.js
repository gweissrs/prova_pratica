import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'
import { prisma } from './lib/prisma.ts'

const app = express()
const PORT = 3000
const SALT = await bcrypt.genSalt(10)
const JWT_SECRET = process.env.JWT_SECRET

app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(express.static('public'))

// Verifica se o token JWT no cookie é válido antes de liberar acesso às rotas protegidas
function autenticarToken(req, res, next) {
    const token = req.cookies.token
    if (!token) {
        return res.status(401).json({ erro: "Acesso negado." })
    }
    try {
        const usuarioJWT = jwt.verify(token, JWT_SECRET)
        req.usuarioJWT = usuarioJWT
        next()
    } catch (err) {
        return res.status(403).json({ erro: "Token inválido." })
    }
}

// Recebe nome, email e senha, salva o usuário no banco com a senha criptografada
app.post('/registro', async (req, res) => {
    const { nome, email, senha } = req.body
    try {
        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: "Preencha todos os campos." })
        }

        const senhaHashed = await bcrypt.hash(senha, SALT)

        const novoUsuario = await prisma.user.create({
            data: { nome, email, senha: senhaHashed }
        })

        return res.status(201).json({ id: novoUsuario.id, nome: novoUsuario.nome })
    } catch (err) {
        return res.status(400).json({ erro: "Erro ao criar usuário." })
    }
})

// Confere email e senha, e se estiver tudo certo grava um token JWT num cookie
app.post('/login', async (req, res) => {
    const { email, senha } = req.body
    try {
        const usuario = await prisma.user.findUnique({
            where: { email }
        })

        if (!usuario) {
            return res.status(401).json({ erro: "Credenciais inválidas." })
        }

        const senhaCerta = await bcrypt.compare(senha, usuario.senha)
        if (!senhaCerta) {
            return res.status(401).json({ erro: "Credenciais inválidas." })
        }

        const token = jwt.sign(
            { id: usuario.id },
            JWT_SECRET,
            { expiresIn: "1h" }
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // local
            sameSite: "lax",
            maxAge: 3600000
        })

        return res.status(200).json({
            mensagem: "Login realizado.",
            usuario: { nome: usuario.nome }
        })
    } catch (err) {
        return res.status(400).json({ erro: "Erro ao fazer login." })
    }
})

// Apaga o cookie do token, encerrando a sessão do usuário
app.post('/logout', (req, res) => {
    res.clearCookie("token")
    return res.status(200).json({ mensagem: "Logout realizado." })
})

// Retorna todos os quadrados do usuário logado
app.get('/quadrado', autenticarToken, async (req, res) => {
    try {
        const quadrados = await prisma.quadrado.findMany({
            where: { userId: req.usuarioJWT.id }
        })
        return res.status(200).json(quadrados)
    } catch (err) {
        return res.status(400).json({ erro: "Erro ao listar quadrados." })
    }
})

// Cria um novo quadrado vinculado ao usuário logado
app.post('/quadrado', autenticarToken, async (req, res) => {
    const { titulo, descricao } = req.body
    try {
        if (!titulo) {
            return res.status(400).json({ erro: "Título obrigatório." })
        }

        const novoQuadrado = await prisma.quadrado.create({
            data: { titulo, descricao, userId: req.usuarioJWT.id }
        })
        return res.status(201).json(novoQuadrado)
    } catch (err) {
        return res.status(400).json({ erro: "Erro ao criar quadrado." })
    }
})

// Atualiza o título e descrição de um quadrado existente pelo ID
app.put('/quadrado/:id', autenticarToken, async (req, res) => {
    const { id } = req.params
    const { titulo, descricao } = req.body
    try {
        const attQuadrado = await prisma.quadrado.update({
            where: { id: Number(id) },
            data: { titulo, descricao }
        })
        return res.status(200).json(attQuadrado)
    } catch (err) {
        return res.status(400).json({ erro: "Erro ao atualizar quadrado." })
    }
})

// Deleta um quadrado do banco pelo ID
app.delete('/quadrado/:id', autenticarToken, async (req, res) => {
    const { id } = req.params
    try {
        await prisma.quadrado.delete({
            where: { id: Number(id) }
        })
        return res.status(200).json({ mensagem: "Quadrado removido." })
    } catch (err) {
        return res.status(400).json({ erro: "Erro ao remover quadrado." })
    }
})

app.listen(PORT, () => {
    console.log(`Servidor rodando lisinho na porta: ${PORT}`)
})
