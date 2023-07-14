
const listaPartidas = document.getElementById("partidasList");


async function carregarDados() {
    const dados = await fetch('http://localhost:3000/api/partidas', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then(res => {
            if (res.success) {
                atualizarListaPartidas()
            }
        })
        .catch(e => {
            console.log(`Ocorreu um erro!`);
        })

}

function criarPartida() {
    document.querySelector("#criarPartidaForm").addEventListener('submit', (e) => {
        e.preventDefault();
    })

    const titulo = document.getElementById('tituloInput').value;
    const local = document.getElementById('localInput').value;
    const data = document.getElementById('dataInput').value;
    const horario = document.getElementById('horarioInput').value;

    const partida = {
        titulo,
        local,
        data,
        horario,
        jogadores: []
    };

    fetch('http://localhost:3000/api/partidas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(partida)
    })
        .then(data => {
            if (data.ok) {
                document.getElementById('tituloInput').value = '';
                document.getElementById('localInput').value = '';
                document.getElementById('dataInput').value = '';
                document.getElementById('horarioInput').value = '';

                atualizarListaPartidas();
            }
        })
        .catch(error => {
            console.error('Erro ao criar partida:', error.message);
        });
}

async function atualizarListaPartidas() {
    await fetch('http://localhost:3000/api/partidas')
        .then(response => response.json())
        .then(data => {
            const partidasList = document.getElementById('partidasList');
            partidasList.innerHTML = '';
            console.log(data);
            data.map(partida => {
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item');

                const title = document.createElement('h4');
                title.textContent = partida.titulo;
                listItem.appendChild(title);


                const verDetalhesButton = document.createElement('button');
                verDetalhesButton.textContent = 'Ver detalhes';
                verDetalhesButton.classList.add('btn', 'btn-primary', 'me-2');
                verDetalhesButton.addEventListener('click', () => {
                    window.location.href = `/partida/${partida.titulo.split(" ").join("")}`;
                });
                
                const excluirPartidaBtn = document.createElement("div");
                excluirPartidaBtn.classList.add("btn", "btn-danger");
                excluirPartidaBtn.innerText = "Excluir";
                excluirPartidaBtn.addEventListener("click", () => {
                    excluirPartida(partida);
                })

                listItem.appendChild(verDetalhesButton);
                listItem.appendChild(excluirPartidaBtn);

                partidasList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Erro ao obter as partidas:', error);
        });
}


function excluirPartida(partida) {
    if (confirm('Tem certeza que deseja excluir esta partida?')) {
        fetch(`/api/partidas/${partida.id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    atualizarListaPartidas();
                }
            })
            .catch(error => {
                console.error('Erro ao excluir partida:', error);
            });
    }
}

const criarPartidaForm = document.getElementById('criarPartidaForm');
criarPartidaForm.addEventListener('submit', criarPartida);

window.addEventListener('load', () => {
    atualizarListaPartidas();
});