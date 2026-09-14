import AstronautCh from '/astronaut.js';


let enviarIcon = window.document.getElementById('send-icon')
let bubbleUsuario = window.document.getElementById('send-message')
let chatTotal = window.document.getElementById('caixa-chat')




document.addEventListener('DOMContentLoaded', ()=> {
AstronautCh.iniciar_seq('seq-inicial')
})




const observador = new MutationObserver(() => {
  chatTotal.scrollTop = chatTotal.scrollHeight;
});

// Ativa a observação para mudanças no conteúdo
observador.observe(chatTotal, { childList: true, subtree: true });