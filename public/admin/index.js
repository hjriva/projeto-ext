let geninput = window.document.getElementById('gen')
let genEscolhidos = window.document.getElementById('generos-escolhidos')
let generos = []

let alternativaLetras = 'abcdefghijklmnopqrstuvwxyz'


function ClickAddPergunta() {

        let perguntaAtual = Array.from(document.querySelectorAll('.add-alternativa')).indexOf(event.target) + 1


        //console.log('pergunta numero ' +  perguntaAtual)
        

        let alternativa = window.document.querySelectorAll('.alternativa')[0]
        console.log(alternativa)
        let container = event.target.parentElement.querySelectorAll('.alternativas')[0]

        let letraPos = container.querySelectorAll('.alternativa').length
        console.log(letraPos)

        let letraatual = alternativaLetras[letraPos]
        

        const novoform = alternativa.cloneNode(true)

        let label = novoform.querySelector('label')
        console.log(label)
        label.textContent = letraatual + ') '
        //label.id = `alt-${letraatual}-${perguntaAtual}`
        label.setAttribute('for', `alt-${letraatual}-${perguntaAtual}`)

        let inputTexto = novoform.querySelector('input[type="text"]');
        inputTexto.id = `alt-${letraatual}-${perguntaAtual}`
        inputTexto.className = `alt-${letraatual}`
        

        let inputRadio = novoform.querySelector('input[type="radio"]');
        inputRadio.value = letraatual
        inputRadio.name = `radio-alternativa-${perguntaAtual}` 

        container.appendChild(novoform)
        
        }



function addDelete(span, gen) {

    let botao = document.createElement('span')
    botao.classList.add("material-symbols-outlined");
    botao.textContent = 'close'
    botao.classList.add('excluir-novo')
   
    span.appendChild(botao)

    

    botao.addEventListener('click', () => {
        let e = botao.previousElementSibling.textContent
        generos = generos.filter(itens => itens != e)
        botao.parentElement.remove()
    })
}



let formModelo = window.document.getElementById("form_1");
let numPerguntas = 1;


geninput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        if (!generos.includes(`${geninput.value}`)) {
        event.preventDefault()
        let novogenero = geninput.value
        generos.push(novogenero)
        let ngcontainer = document.createElement('span')
        let textcont = document.createElement('div')
        ngcontainer.classList.add('novo')
        textcont.textContent = novogenero 
        ngcontainer.appendChild(textcont)
        addDelete(ngcontainer, novogenero)
        genEscolhidos.appendChild(ngcontainer)
        
        
        } else {
            alert('já adicionado')
        }


        geninput.value = ""
    }
} ) 


 function NovaQuestao() {
      numPerguntas++;
      const novoForm = formModelo.cloneNode(true);
      novoForm.id = `form-pergunta-${numPerguntas}`;
      novoForm
        .querySelectorAll("label")[0]
        .setAttribute("for", `enunciado-${numPerguntas}`);
      novoForm.querySelector(".numero-pergunta").textContent = numPerguntas + ")";

      const inputPergunta = novoForm.querySelectorAll("input")[0];
      inputPergunta.id = `enunciado-${numPerguntas}`;
      inputPergunta.value = "";

      let inputAlternativas = novoForm.querySelectorAll("input[type=text]");
      let inputRadios = novoForm.querySelectorAll("input[type=radio]");

      for (
        let inicioInput = 1, inicioRadio = 0;
        inicioInput < inputAlternativas.length;
        inicioInput++, inicioRadio++
      ) {
        inputAlternativas[inicioInput].id =
          `alt-${String.fromCharCode(65 + inicioInput)}-${numPerguntas}`;
        inputAlternativas[inicioInput].value = "";
        novoForm
          .querySelectorAll("label")
          [
            inicioInput
          ].setAttribute("for", `alt-${String.fromCharCode(65 + inicioInput)}-${numPerguntas}`);
        inputRadios[inicioRadio].id =
          `radio-${String.fromCharCode(65 + inicioInput)}-${numPerguntas}`;
          inputRadios[inicioRadio].name = `radio-alternativa-${numPerguntas}`;
        inputRadios[inicioRadio].checked = false;
        
      }


     

      novoForm.querySelector(".explicacao-text").value = "";
      novoForm.querySelector(".explicacao-text").id = `explicacao-${numPerguntas}`;
       //novoForm.querySelector(".forminterno").id = `formin-${numPerguntas}`

      novoForm.querySelector('.add-alternativa').addEventListener('click', ClickAddPergunta)

      document.getElementById("lista-de-perguntas").appendChild(novoForm);
    }


    class Pergunta {
        constructor(enunciado, explicacao, alternativas) {
            this.enunciado = enunciado;
            this.explicacao = explicacao;
            this.alternativas = alternativas
        }
    }

    class Alternativa {
        constructor(texto, correta) {
            this.texto = texto;
            this.correta = correta
        }
    }

    window.document.getElementById('salvar-bd').addEventListener('click', () => {
        let tituloLivro = window.document.getElementById('titulo').value
        let autorLivro = window.document.getElementById('autor').value
        let idademin = window.document.getElementById('idademin').value
        let idademax = window.document.getElementById('idademax').value 
        
        //generos




        let perguntas = []

        document.querySelectorAll('.form_pergunta').forEach(pergunta => {
            console.log(pergunta)


            let enunciado = pergunta.querySelector('.input_enunciado').value
            let explicacao = pergunta.querySelector('.explicacao-text').value

            let perguntaCurrent = new Pergunta(enunciado, explicacao, [])

            pergunta.querySelectorAll('.alternativa').forEach(alternativa => {
                let textoInput = alternativa.querySelector('input[type=text]')
                let radioInput = alternativa.querySelector('input[type=radio]')
    
                let texto = textoInput.value
                let ehCorreta = radioInput.checked

                let alt = new Alternativa(texto, ehCorreta)
                perguntaCurrent.alternativas.push(alt)
            })

            perguntas.push(perguntaCurrent)
        })

        console.log(perguntas)

       // perguntas.forEach(q => {console.log(q); q.alternativas.forEach(a => console.log(a))})

        //let PerguntasBd = JSON.stringify(perguntas)


        fetch("/novasubmissao", {
            method: "POST",
            body: JSON.stringify({
                titulo: tituloLivro,
                autor: autorLivro,
                idademin: idademin,
                idademax: idademax,
                generos: generos,
                perguntas: perguntas
            }),
            headers: { "Content-type": "application/json; charset=UTF-8" }
        })
    })




    window.document.getElementById('add-pergunta').addEventListener('click', () => {
      NovaQuestao()
    })

    window.document.querySelector('.add-alternativa').addEventListener('click', ClickAddPergunta)
