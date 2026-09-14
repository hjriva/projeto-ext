let msgBox = window.document.getElementById('caixa-msgs')
let enviarBox = window.document.getElementById('caixa-enviar')
let contOptions= window.document.getElementById('container-opcoes')
let seqMsgs = window.document.getElementById('seq-msgs')


const AstronautCh = {
    name: 'Major Tom',
    profilepic: 'public/astronauta-profilepic.jpg',


iniciar_seq (seq_id) {
    let novaSequencia = document.createElement('div')
    novaSequencia.classList.add('seq-msg-bubbles')

    let picContainer = document.createElement('div')
    picContainer.classList.add('pic-container')
    let msgsContainer = document.createElement('div')
    msgsContainer.classList.add('msgs-Container')

    let profilepic = document.createElement('img')
    profilepic.setAttribute('src', 'astronauta-profilepic.jpg')
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
                    
                    sequencia.options.forEach(o => {
                        console.log(o.texto)
                        let opcao = document.createElement('span')
                        opcao.textContent = o.texto
                        opcao.classList.add('opcao-dialogo')
                        opcao.addEventListener('click', () => {
                            MsgUsuario(o.texto)
                            AstronautCh[o.command]?.(...(o.params || []))
                            })
                        contOptions.appendChild(opcao)
                    })
                    return
                }

                let m = sequencia.msgs[index]
                let tempo = m.length * 0 

                setTimeout(() => {
                    
                    let novaMsg = document.createElement('div')
                    novaMsg.classList.add('msg-bubble')
                    novaMsg.textContent = m
                    msgsContainer.appendChild(novaMsg)

                    mostrarMsg(index + 1) 
                }, tempo)
            }

            mostrarMsg(0)
        })
},

 
  
}


function MsgUsuario(textoescolhido) {
    let msg = document.createElement('span')
    msg.textContent = textoescolhido
    msg.classList.add('msg-usuario')
    seqMsgs.appendChild(msg)
}


export default AstronautCh;