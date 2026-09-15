require('dotenv').config()
const express = require('express')
const app = express()

port = process.env.PORT || 3000;

const db = require('./connect_db');


const autenticado = false;


function SwitchAuth() {

if (!autenticado) {
    app.use(express.static('public/nao-autenticado'))
} else {
    app.use(express.static('public/autenticado'))
}
}

SwitchAuth()

app.use(express.json())

const session = require('express-session');

const path = require('path');

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));


app.get('/astronaut.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'astronaut.js'))
})

app.get('/dialogo.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'dialogo.json'))
})



app.post('/novasubmissao', async (req, res) => {
    const {titulo, autor, idademin, idademax, generos, perguntas } = req.body

    const idLivro = await db.query(
    `INSERT INTO livro (titulo, autor, idademinima, idademaxima) VALUES ($1, $2, $3, $4) RETURNING id;
    `, [
        titulo, autor, idademin, idademax
    ]) 

    let livro_id = idLivro.rows[0].id
    



    for (const genero of generos) {
        const idGen = await db.query(
            `INSERT INTO genero (descr) VALUES ($1)
             ON CONFLICT (descr) DO NOTHING
            RETURNING id;`, [genero]
    )

        await db.query(`INSERT INTO perfil_livro (livro_id, genero_id) VALUES ($1, $2)`, [livro_id, idGen.rows[0].id])
        }




    perguntas.forEach(p => {
            db.query(`INSERT INTO perguntas (enunciado, alternativas, explicacao, livro_id) VALUES ($1, $2, $3, $4)`, [p.enunciado, p.explicacao, p.alternativas, p, livro_id])
    }
    
    )


})



//Mostrar opções de gen

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


app.listen(port, () => {
    console.log(`rodando bd na porta ${port}`)
})