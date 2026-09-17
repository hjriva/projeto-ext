console.log('ASTRONAUT.JS FOI CARREGADO')

let modalQuiz = window.document.getElementById('modal-quiz')
let quizProgresso = window.document.getElementById('quiz-progresso')
let quizTentativas = window.document.getElementById('quiz-tentativas')
let quizEnunciado = window.document.getElementById('quiz-enunciado')
let quizForm = window.document.getElementById('quiz-form')
let quizConfirmar = window.document.getElementById('quiz-confirmar')

let msgBox = window.document.getElementById('caixa-msgs')
let enviarBox = window.document.getElementById('caixa-enviar')
let contOptions = window.document.getElementById('container-opcoes')
let seqMsgs = window.document.getElementById('seq-msgs')
let enviarIcon = window.document.getElementById('send-icon')
let bubbleUsuario = window.document.getElementById('send-message')
let chatTotal = window.document.getElementById('caixa-chat')

let alternativaLetras = 'abcdefghijklmnopqrstuvwxyz'


let usuarioAtual = null

function Usuario(nome, age, exp, lvl, lvlPct, pref, lidos, missaoAtual) {
    this.localId = crypto.randomUUID() 
    this.nome = nome
    this.age = age
    this.exp = exp
    this.lvl = lvl
    this.lvlPct = lvlPct
    this.pref = pref 
    this.lidos = lidos 
    this.missaoAtual = missaoAtual 
}

function salvarUsuario(usuario) {
    localStorage.setItem('usuarioSalvo', JSON.stringify(usuario))
}

function MsgUsuario(textoescolhido) {
    let msg = document.createElement('span')
    msg.textContent = textoescolhido
    msg.classList.add('msg-usuario')
    seqMsgs.appendChild(msg)
}


function mostrarMensagemAvulsa(texto, srcImg) {
    let picContainer = document.createElement('div')
    picContainer.classList.add('pic-container')
    let msgsContainer = document.createElement('div')
    msgsContainer.classList.add('msgs-Container')

    let profilepic = document.createElement('img')
    profilepic.setAttribute('src', 'astronauta2.png')
    profilepic.classList.add('profile-pic')

    let novaSequencia = document.createElement('div')
    novaSequencia.classList.add('seq-msg-bubbles')
    picContainer.appendChild(profilepic)
    novaSequencia.appendChild(picContainer)

    let novaMsg = document.createElement('div')
    novaMsg.classList.add('msg-bubble')

    if (srcImg) {
        let imagem = document.createElement('img')
        imagem.setAttribute('src', srcImg)
        imagem.classList.add('imagem-capa')
        novaMsg.appendChild(imagem)
    }

    let textoEl = document.createElement('p')
    textoEl.textContent = texto
    novaMsg.appendChild(textoEl)

    msgsContainer.appendChild(novaMsg)
    novaSequencia.appendChild(msgsContainer)
    seqMsgs.appendChild(novaSequencia)
}


function capturarResposta() {
    return new Promise((resolve) => {
        enviarIcon.addEventListener('click', () => {
            let valor = bubbleUsuario.value.trim().toLowerCase()
            MsgUsuario(valor)
            bubbleUsuario.value = ''
            resolve(valor)
        }, { once: true })
    })
}

const AstronautCh = {
    name: 'Major Tom',
    profilepic: 'public/astronauta2.png',

    iniciar_seq(seq_id) {

        return new Promise((resolve) => {
            let novaSequencia = document.createElement('div')
            novaSequencia.classList.add('seq-msg-bubbles')

            let picContainer = document.createElement('div')
            picContainer.classList.add('pic-container')
            let msgsContainer = document.createElement('div')
            msgsContainer.classList.add('msgs-Container')

            let profilepic = document.createElement('img')
            profilepic.setAttribute('src', 'astronauta2.png')
            profilepic.classList.add('profile-pic')

            picContainer.appendChild(profilepic)
            novaSequencia.appendChild(picContainer)
            novaSequencia.appendChild(msgsContainer)
            seqMsgs.appendChild(novaSequencia)

            fetch('dialogo.json')
                .then(response => response.json())
                .then(dados => {
                    const sequencia = dados.find(s => s.id == seq_id)

                    function mostrarMsg(index) {
                        if (index >= sequencia.msgs.length) {
                            if (sequencia.command) {
                                AstronautCh[sequencia.command]?.(...(sequencia.params || []))
                            } 

                            if (sequencia.options) {
                                bubbleUsuario.readOnly = true
                                sequencia.options.forEach(o => {
                                    let opcao = document.createElement('span')
                                    opcao.textContent = o.texto
                                    opcao.classList.add('opcao-dialogo')
                                    opcao.addEventListener('click', () => {
                                        MsgUsuario(o.texto)
                                        AstronautCh[o.command]?.(...(o.params || []))
                                        window.document.querySelectorAll('.opcao-dialogo').forEach(op => op.remove())
                                        resolve(o)
                                    })
                                    contOptions.appendChild(opcao)
                                })
                            } else {
                                bubbleUsuario.readOnly = false
                                resolve()
                            }
                            return
                        }

                        let m = sequencia.msgs[index]
                        if (m) {
                            let tempo = m.length * 1
                            setTimeout(() => {
                                let novaMsg = document.createElement('div')
                                novaMsg.classList.add('msg-bubble')
                                novaMsg.textContent = m
                                msgsContainer.appendChild(novaMsg)
                                mostrarMsg(index + 1)
                            }, tempo)
                        }
                    }
                    mostrarMsg(0)
                })
                .catch(err => {
                    console.error('Erro ao buscar/parsear dialogo.json:', err)
                    resolve() 
                })
        })
    },



    async cadastrarUsuario() {
        let UsuarioNovo = new Usuario(undefined, undefined, 0, 0, 0, undefined, [], null)

     
        await this.iniciar_seq('inquire-1')
        await this.CapturarValor(UsuarioNovo, 'nome', false)

        await this.iniciar_seq('inquire-2')
        await this.CapturarValor(UsuarioNovo, 'age', true)

        let escolha = await this.iniciar_seq('seq-cadastro1')
        UsuarioNovo['exp'] = escolha.params[0]

        let generosPref = []

        fetch('/opcoes_gen')
            .then(res => res.json())
            .then(data => {
                data.forEach(d => {
                    let opcao = document.createElement('span')
                    opcao.textContent = d.descr
                    opcao.dataset.id = d.id 
                    opcao.classList.add('opcao-dialogo')

                    opcao.addEventListener('click', () => {
                        opcao.classList.toggle('chosen')
                    })

                    contOptions.appendChild(opcao)
                })

                let instr = document.createElement('p')
                instr.id = 'instr_opc'
                instr.textContent = 'Selecione seus favoritos e clique aqui para finalizar!'

                instr.addEventListener('click', async () => {
                    let selecionados = document.querySelectorAll('.chosen')
                    selecionados.forEach(s => {
                        generosPref.push({ id: Number(s.dataset.id), descr: s.textContent })
                    })
                    document.querySelectorAll('.opcao-dialogo').forEach(op => op.remove())
                    instr.remove()
                    MsgUsuario(generosPref.map(g => g.descr).join(', '))

                    UsuarioNovo['pref'] = generosPref
                    await AstronautCh.iniciar_seq('finaliza_cadastro')

                    usuarioAtual = UsuarioNovo
                    salvarUsuario(usuarioAtual)

                    await AstronautCh.iniciarNovaMissao()
                })

                contOptions.appendChild(instr)
            })
    },

    CapturarValor(nomeObjeto, chave, numberOnly) {
        return new Promise((resolve) => {
            enviarIcon.addEventListener('click', async () => {
                let valor = bubbleUsuario.value
                MsgUsuario(valor)
                if (numberOnly && isNaN(Number(valor))) {
                    bubbleUsuario.value = ''
                    await this.iniciar_seq('erro-idade')
                    let resultado = await this.CapturarValor(nomeObjeto, chave, numberOnly)
                    resolve(resultado)
                    return
                }

                nomeObjeto[chave] = valor
                bubbleUsuario.value = ''
                resolve(valor)
            }, { once: true })
        })
    },

    async avaliarEscolha(valor) {
        const mapa = {
            'Não leu': 'seq-cadastro3',
            'Leu pouco': 'seq-cadastro2',
            'Leu bastante': 'seq-cadastro2',
        }
        const destino = mapa[valor]
        if (destino) await this.iniciar_seq(destino)
    },


    async iniciarNovaMissao() {
        const idsGeneros = usuarioAtual.pref.map(p => p.id).join(',')
        const idsLidos = usuarioAtual.lidos.join(',')

        const livro = await fetch(`/sorteio_missao?generos=${idsGeneros}&lidos=${idsLidos}`)
            .then(r => r.json())

        if (!livro) {
            await this.iniciar_seq('sem-livros-disponiveis') 
            return
        }

        usuarioAtual.missaoAtual = { ...livro, tentativas: 0, status: 'em-andamento' }
        salvarUsuario(usuarioAtual)

        mostrarMensagemAvulsa(`${livro.titulo} — ${livro.autor}`, livro.capa)
        await this.iniciar_seq('nova-missao-1')

        await this.verificarMissao()  
    },

  
      async verificarMissao() {
    if (!usuarioAtual.missaoAtual) {
        await this.iniciar_seq('seq-retorno-sem-missao')
        return
    }

    if (usuarioAtual.missaoAtual.quiz) {
        await this.continuarQuiz()
        return
    }

    const escolha = await this.iniciar_seq('missao-em-andamento')

    if (escolha?.params?.[0] === 'terminei') {
        await this.continuarQuiz()
    } else if (escolha?.params?.[0] === 'ainda-lendo') {
        await this.iniciar_seq('aguardando-leitura')
    }
},

    async continuarQuiz() {
        await this.rodarQuiz()

        while (usuarioAtual.missaoAtual.quiz.indiceAtual < usuarioAtual.missaoAtual.quiz.perguntas.length) {
            await this.mostrarPerguntaAtual()
        }

        await this.finalizarQuiz()
    },

       async rodarQuiz() {
        const missao = usuarioAtual.missaoAtual

       
        if (!missao.quiz) {
            const perguntas = await fetch(`/perguntas/${missao.id}`).then(r => r.json())
            missao.quiz = { perguntas, indiceAtual: 0, acertos: 0 }
            salvarUsuario(usuarioAtual)
        }

        modalQuiz.style.display = 'flex'
        await this.mostrarPerguntaAtual()
    },

    mostrarPerguntaAtual() {
        return new Promise((resolve) => {
            const missao = usuarioAtual.missaoAtual
            const quiz = missao.quiz
            const pergunta = quiz.perguntas[quiz.indiceAtual]

            quizProgresso.textContent = `Pergunta ${quiz.indiceAtual + 1} de ${quiz.perguntas.length}`
            quizTentativas.textContent = `Tentativas usadas nessa missão: ${missao.tentativas} de 5`
            quizEnunciado.textContent = pergunta.enunciado

            quizForm.innerHTML = ''
            pergunta.alternativas.forEach((alt, i) => {
                const label = document.createElement('label')
                label.classList.add('quiz-alternativa')

                const input = document.createElement('input')
                input.type = 'radio'
                input.name = 'alternativa-atual'
                input.value = i

                label.appendChild(input)
                label.append(` ${alternativaLetras[i]}) ${alt.texto}`)
                quizForm.appendChild(label)
            })

            const handleConfirmar = () => {
                const selecionado = quizForm.querySelector('input[name="alternativa-atual"]:checked')
                if (!selecionado) {
                    alert('Escolha uma alternativa antes de confirmar.')
                    return
                }

                const indiceEscolhido = Number(selecionado.value)
                const indiceCorreto = pergunta.alternativas.findIndex(a => a.correta)

                if (indiceEscolhido === indiceCorreto) {
                    quiz.acertos++
                }
                quiz.indiceAtual++

               
                salvarUsuario(usuarioAtual)

                quizConfirmar.removeEventListener('click', handleConfirmar)
                resolve()
            }

            quizConfirmar.addEventListener('click', handleConfirmar)
        })
    },

    async finalizarQuiz() {
    const missao = usuarioAtual.missaoAtual
    const quiz = missao.quiz
    const passou = quiz.acertos === quiz.perguntas.length

    modalQuiz.style.display = 'none'

    if (passou) {
        usuarioAtual.lidos.push(missao.id)
        usuarioAtual.exp += 10
        usuarioAtual.missaoAtual = null
        salvarUsuario(usuarioAtual)

        await this.iniciar_seq('missao-terminada-sucesso')
        return
    }

    missao.tentativas++
    missao.quiz = null
    salvarUsuario(usuarioAtual)

    const tentativasRestantes = 5 - missao.tentativas

    if (tentativasRestantes <= 0) {
        usuarioAtual.missaoAtual = null
        salvarUsuario(usuarioAtual)
        await this.iniciar_seq('missao-terminada-esgotada')
        return
    }

    mostrarMensagemAvulsa(`Você ainda tem ${tentativasRestantes} tentativa(s) para essa missão.`)
    const escolha = await this.iniciar_seq('missao-terminada-erro')

    if (escolha?.params?.[0] === 'tentar-de-novo') {
        await this.continuarQuiz()
    }
},


    async retomarSessao(usuarioSalvoJSON) {
    console.log('5 - RETOMAR SESSAO')

    usuarioAtual = JSON.parse(usuarioSalvoJSON)

    console.log('6 - usuarioAtual:', usuarioAtual)

    await this.iniciar_seq('seq-boas-vindas-volta')

    console.log('7 - terminou iniciar_seq')

    await this.verificarMissao()

    console.log('8 - terminou verificarMissao')
},
}

export default AstronautCh