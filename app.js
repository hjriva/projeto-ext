require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()

const port = process.env.PORT || 3000

const db = require('./connect_db')

app.use(express.json())
app.use(express.static('public'))



app.get('/astronaut.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'astronaut.js'))
})

app.get('/dialogo.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'dialogo.json'))
})

app.get('/fb.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'fb.js'))
})


app.post('/novasubmissao', async (req, res) => {
    const { titulo, autor, idademin, idademax, generos, perguntas } = req.body

    try {
        const idLivro = await db.query(
            `INSERT INTO livro (titulo, autor, idademinima, idademaxima) VALUES ($1, $2, $3, $4) RETURNING id;`,
            [titulo, autor, idademin, idademax]
        )

        let livro_id = idLivro.rows[0].id

        for (const genero of generos) {
            const idGen = await db.query(
                `INSERT INTO genero (descr) VALUES ($1)
                 ON CONFLICT (descr) DO UPDATE SET descr = EXCLUDED.descr
                 RETURNING id;`,
                [genero]
            )

            await db.query(
                `INSERT INTO perfil_livro (livro_id, genero_id) VALUES ($1, $2)`,
                [livro_id, idGen.rows[0].id]
            )
        }

        for (const p of perguntas) {
            await db.query(
                `INSERT INTO perguntas (enunciado, explicacao, alternativas, livro_id) VALUES ($1, $2, $3, $4)`,
                [p.enunciado, p.explicacao, JSON.stringify(p.alternativas), livro_id]
            )
        }

        res.json({ sucesso: true, livro_id })
    } catch (err) {
        console.log('erro em /novasubmissao: ' + err)
        res.status(500).json({ sucesso: false, erro: err.message })
    }
})


app.get('/opcoes_gen', async (req, res) => {
    try {
        const generos = await db.query('SELECT id, descr FROM genero;')
        res.json(generos.rows)
    } catch (err) {
        console.log('erro: ' + err)
        res.status(500).json({ erro: err.message })
    }
})


app.get('/sorteio_missao', async (req, res) => {
    const { generos, lidos } = req.query

    const arrayLidos = lidos ? lidos.split(',').map(Number).filter(n => !isNaN(n)) : []
    const arrayGeneros = generos ? generos.split(',').map(Number).filter(n => !isNaN(n)) : []

    try {
        const resultado = await db.query(
            `WITH candidatos AS (
                SELECT 
                    l.id,
                    l.titulo,
                    l.autor,
                    l.capa,
                    CASE 
                        WHEN EXISTS (
                            SELECT 1
                            FROM perfil_livro pl
                            WHERE pl.livro_id = l.id
                              AND pl.genero_id = ANY($2)
                        ) THEN 1
                        ELSE 0
                    END AS prioridade
                FROM livro l
                WHERE l.id != ALL($1)
            )
            SELECT id, titulo, autor, capa
            FROM candidatos
            ORDER BY prioridade DESC, RANDOM()
            LIMIT 1;`,
            [arrayLidos, arrayGeneros]
        )

        if (resultado.rows.length === 0) {
            return res.json(null)
        }

        res.json(resultado.rows[0])
    } catch (err) {
        console.log('erro em /sorteio_missao: ' + err)
        res.status(500).json({ erro: err.message })
    }
})


app.get('/perguntas/:livroId', async (req, res) => {
    const { livroId } = req.params

    try {
        const resultado = await db.query(
            `SELECT id, enunciado, alternativas, explicacao 
             FROM perguntas 
             WHERE livro_id = $1 
             ORDER BY RANDOM() 
             LIMIT 5;`,
            [livroId]
        )
        res.json(resultado.rows)
    } catch (err) {
        console.log('erro em /perguntas: ' + err)
        res.status(500).json({ erro: err.message })
    }
})

app.listen(3000, () => console.log(`Servidor rodando na porta 3000`))