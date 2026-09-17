import AstronautCh from '/astronaut.js'

let enviarIcon = window.document.getElementById('send-icon')
let bubbleUsuario = window.document.getElementById('send-message')
let chatTotal = window.document.getElementById('caixa-chat')

document.addEventListener('DOMContentLoaded', () => {

    console.log('1 - DOM CARREGADO')

    const usuarioSalvo = localStorage.getItem('usuarioSalvo')

    console.log('2 - USUARIO SALVO:', usuarioSalvo)
    console.log('3 - seqMsgs:', seqMsgs)

    if (usuarioSalvo !== null) {

        console.log('4 - VAI RETOMAR')
        AstronautCh.retomarSessao(usuarioSalvo)

    } else {

        console.log('4 - VAI INICIAR')
        AstronautCh.iniciar_seq('seq-inicial')

    }

})

const observador = new MutationObserver(() => {
    chatTotal.scrollTop = chatTotal.scrollHeight
})

observador.observe(chatTotal, { childList: true, subtree: true })