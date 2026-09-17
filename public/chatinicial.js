import AstronautCh from '/astronaut.js';

let enviarIcon = window.document.getElementById('send-icon')
let bubbleUsuario = window.document.getElementById('send-message')
let chatTotal = window.document.getElementById('caixa-chat')

document.addEventListener('DOMContentLoaded', async () => {

  const usuarioSalvo = localStorage.getItem('usuarioSalvo');

  if (usuarioSalvo !== null) {

    console.log('Usuário encontrado:', usuarioSalvo);
    await AstronautCh.retomarSessao(usuarioSalvo);

  } else {

    AstronautCh.iniciar_seq('seq-inicial')

  }

})

const observador = new MutationObserver(() => {

  chatTotal.scrollTop = chatTotal.scrollHeight;

});

observador.observe(chatTotal, { childList: true, subtree: true });