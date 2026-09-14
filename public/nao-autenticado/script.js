let msg = window.document.getElementById('messagebox')
let legenda = window.document.getElementById('legenda')

msg.addEventListener('mouseover', () => {
    legenda.style.display = 'block'

})

msg.addEventListener('mouseleave', () => {
    legenda.style.display = 'none'
})

msg.addEventListener('click', () => {
    window.location.href = 'chatinicial.html'
})