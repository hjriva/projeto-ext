

require('dotenv').config()
const express = require('express')
const session = require('express-session');
const path = require('path');
const app = express()

const port = process.env.PORT || 3000;

const db = require('./connect_db');

app.use(express.json())


app.use(express.static('public'))


//rotas para arquivos

app.get('/astronaut.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'astronaut.js'))
})

app.get('/dialogo.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'dialogo.json'))
})

app.get('/fb.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'fb.js'))
})

//rotas para banco de dados interno

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



//Mostrar opções de genero - cadastro

app.get('/opcoes_gen', async (req, res) => {

   

    try {
     const generos = await db.query('SELECT * from genero;');

     res.json(generos.rows)
} catch (err) {
    console.log('erro: '+  err)
}
} )






app.post('/criandousuario', (req, res) => {
    const {age: idade, email, exp, lvl, lvlPct, nome, pref} = req.body
    try {
        db.query('INSERT INTO usuario (id, nome, idade, lvl, lvlComplete, exp) VALUES ($1, $2, $3, $4, $5, $6)', [email, nome, idade, lvl, lvlPct, exp])


        pref.forEach(p => {
            db.query(`INSERT INTO PREFERENCIAS_POR_USUARIO (usuario_pref, genero_pref) VALUES ($1, $2)`, [email, p])
        })

    } catch (err) {
        console.log('erro: '+  err)
    }

})


app.get('/sorteio_missão', async (req, res) => {

    const { usuario, lidos } = req.query

    const arrayX = lidos ? lidos.split(',').map(Number) : []

    try {
        const prefs = await db.query(
            'SELECT genero_pref FROM PREFERENCIAS_POR_USUARIO WHERE usuario_pref = $1',
            [usuario]
        )

        const arrayY = prefs.rows.map(r => r.genero_pref)

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
            [arrayX, arrayY]
        )

        if (resultado.rows.length === 0) {
            return res.json(null)
        }

        res.json(resultado.rows[0])

    } catch (err) {
        console.log('erro em /sorteio_missão: ' + err)
        res.status(500).json({ sucesso: false, erro: err.message })
    }
})


app.listen(3000, () => console.log('Servidor rodando na porta 3000'));


