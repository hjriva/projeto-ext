let msgBox = window.document.getElementById('caixa-msgs')
let enviarBox = window.document.getElementById('caixa-enviar')
let contOptions= window.document.getElementById('container-opcoes')
let seqMsgs = window.document.getElementById('seq-msgs')
let enviarIcon = window.document.getElementById('send-icon')
let bubbleUsuario = window.document.getElementById('send-message')

let chatTotal = window.document.getElementById('caixa-chat')


function Usuario(email, nome, age, exp, lvl, pref) {
    this.email = email,
    this.nome = nome;
    this.age = age,
    this.exp = exp,
    this.lvl = lvl,
    this.pref = pref

}


function Pref() {

}


const AstronautCh = {
    name: 'Major Tom',
    profilepic: 'public/astronauta.png',


iniciar_seq (seq_id) { 
    console.log('dialogo : ' + seq_id)
    
     return new Promise((resolve) => {
    

    
    let novaSequencia = document.createElement('div')
    novaSequencia.classList.add('seq-msg-bubbles')

    let picContainer = document.createElement('div')
    picContainer.classList.add('pic-container')
    let msgsContainer = document.createElement('div')
    msgsContainer.classList.add('msgs-Container')

    let profilepic = document.createElement('img')
    profilepic.setAttribute('src', 'astronauta.png')
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
                   // console.log('index:', index, 'msgs:', sequencia.msgs, 'total:', sequencia.msgs.length)

                if (index >= sequencia.msgs.length) {
                    if (sequencia.command) {
                        console.log(sequencia.command + ' tem comando, sequencia: ' + sequencia.id, sequencia.msgs)
                        AstronautCh[sequencia.command]?.(...(sequencia.params || []))
                    } else if (!sequencia.command) {
                        console.log('sem comando')
                    }

                    if (sequencia.options) {
                        bubbleUsuario.readOnly = true
                    sequencia.options.forEach(o => {
                        console.log(o.texto)
                        let opcao = document.createElement('span')
                        opcao.textContent = o.texto
                        opcao.classList.add('opcao-dialogo')
                        opcao.addEventListener('click', () => {

                            MsgUsuario(o.texto);
                            AstronautCh[o.command]?.(...(o.params || []));
                            window.document.querySelectorAll('.opcao-dialogo').forEach(op => op.remove())
                             resolve(o)
                            })
                        contOptions.appendChild(opcao)
                    }) 
                    
                }
                   else  if (!sequencia.options) {
                    
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
            //chatTotal.scrollHeight;
        })

    })   },
 mail_input () {
    enviarIcon.addEventListener('click', () => {
        let email = bubbleUsuario.value
        MsgUsuario(email)
        //colocar aqui a requisição para o firebase enviar link de cadastro por e-mail
        bubbleUsuario.value = ''
        AstronautCh.iniciar_seq('link-email')
    }, { once: true })
 }, 
 async cadastrarUsuario() {
    //pegar email da requisição do firebase e iniciar objeto
      let UsuarioNovo = new Usuario(undefined, undefined, undefined, undefined, undefined, undefined)
    UsuarioNovo["lvl"] = 0

    await this.iniciar_seq('inquire-1');
    await this.CapturarValor(UsuarioNovo, "nome", false)

   await this.iniciar_seq('inquire-2');
    await this.CapturarValor(UsuarioNovo, "age", true)

    //await this.iniciar_seq("seq-cadastro1")  

    let escolha = await this.iniciar_seq("seq-cadastro1") 
    UsuarioNovo["exp"] = escolha.params[0]   
    
    /*fazer requisição para puxar generos do banco de dados,
    cada um se torna um label clicável, precisa ter uma instrução de 
    "aperte aqui para finalizar",
    cada um clicado faz parte do array 
    e o array sobe para o objeto
    puxa então a seq "finaliza_cadastro",
    que provavelmente vai ter como comando chamar uma função que faz a requisição do 
    sorteio do livro no banco de dados
    monta a div com capa, nome etc, 
    chama o array nova-missao-1, com a informação do livro, 
    altera o status do usuario para missão em andamento

    se o usuario envia algo no chat depois disso e o status é de missão em andamento,
    o chat puxa a missão, pergunta se ele já terminou de ler,
    chama a sequencia missao-em-andamento,
    se o jogador responde que está lendo, chama missao-ongoing, sem comando. se o usuario falar qualquer outra coisa, 
    chama missão-em-andamento
    se o usuario tiver terminado, chama missao-terminada" que provavelmente vai ter como command a
    função de trazer as perguntas, com a requisição que sorteia 5 perguntas sobre aquele livro

    a cada pergunta, o astronauta envia uma mensagem com as perguntas e opções
    o usuario precisa digitar SOMENTE a letra correspondente
    uma pergunta atras da outra, depois verifica se todas estão certas

    se estão, a missão é concluída
    cada vez que uma missão é concluída, puxa uma função para verificar se alguma conquista foi atingida
    uma unidade de livro lido é atribuido ao usuário

    chama sequencia (missao-2), altera status novamente

    
    

    */
    console.log(UsuarioNovo)


 },
    

 CapturarValor(nomeObjeto, chave, numberOnly) {
    return new Promise((resolve) => {
        enviarIcon.addEventListener('click', async () => {
            let valor = bubbleUsuario.value
            MsgUsuario(valor)
            if (numberOnly && isNaN(Number(valor))) {
                bubbleUsuario.value = ''
                await this.iniciar_seq("erro-idade")   
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

 
  
}





function MsgUsuario(textoescolhido) {
    let msg = document.createElement('span')
    msg.textContent = textoescolhido
    msg.classList.add('msg-usuario')
    seqMsgs.appendChild(msg)
    //chatTotal.scrollHeight;
}


export default AstronautCh;