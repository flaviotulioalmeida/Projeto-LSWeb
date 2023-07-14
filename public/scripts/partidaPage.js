const tituloPartida = document.URL.split("/")[4];


const carregerPartida = async () => {
  const data = await fetch(`http://localhost:3000/api/partida/${tituloPartida}`)
    .then((res) => {
      if (!res.ok) {
        document.querySelector(".container-md").innerHTML = `
                <h1>Partida não encontrada!</h1>
            `;
      }
      return res.json();
    })
    .then((partida) => {
      const id = partida[0].id;
      document.title = partida[0].titulo;
      document.querySelector("#tituloPartida").innerHTML = partida[0].titulo;
      document.querySelector("#local").innerHTML = partida[0].local;
      document.querySelector("#dataEvento").innerHTML = partida[0].data;
      document.querySelector("#horario").innerHTML = partida[0].horario;
      document
        .querySelector("#adicionarJogadorBtn")
        .addEventListener("click", () => {
          adicionarJogador(id);
        });
      atualizarListaJogadores(id);
    })
    .catch((e) => console.log(`Ocorreu um erro: ${e.message}`));
  return data;
};

function adicionarJogador(id) {
  document
    .querySelector("#adicionarJogadorForm")
    .addEventListener("submit", (e) => {
      e.preventDefault();
    });

  const nome = document.getElementById("nomeJogador").value;
  const telefone = document.getElementById("telefoneJogador").value;

  const partida = {
    nome,
    telefone,
  };

  fetch(`/api/partida/${id}/jogadores/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(partida),
  })
    .then((data) => {
      if (data.ok) {
        document.getElementById("nomeJogador").value = "";
        document.getElementById("telefoneJogador").value = "";

        atualizarListaJogadores(id);
      }
    })
    .catch((error) => {
      console.error("Erro ao adicionar jogador:", error.message);
    });
}

async function atualizarListaJogadores(id) {
  await fetch(`/api/partida/${id}/jogadores/`)
    .then((response) => response.json())
    .then((data) => {
      const jogadores = data;
      const listaJogadores = document.querySelector("#listaJogadores");
      listaJogadores.innerHTML = "";
      if (jogadores.length === 0) {
        listaJogadores.innerHTML = `<p>Nenhum jogador registrado`;
      }

      jogadores.map((jogador) => {
        const li = document.createElement("li");
        li.classList.add(
          "list-group-item",
          "d-flex",
          "justify-content-between"
        );
        li.innerHTML = `
            <div>
                <span class="fw-bold">Nome:</span> ${jogador.nome} -
                <span class="fw-bold">Telefone:</span> ${jogador.telefone} -
                <span class="fw-bold">Presença:</span> ${
                  jogador.presencaConfirmada
                    ? "<span class='text-success'>Confirmada</span>"
                    : "<span class='text-danger'>Não confirmada</span>"
                }
            </div>
        `;

        const confirmarPresencaButton = document.createElement("div");
        if (jogador.presencaConfirmada) {
          confirmarPresencaButton.innerText = "Confirmada";
          confirmarPresencaButton.classList.add("btn", "btn-outline-secondary");
          confirmarPresencaButton.setAttribute("disabled", true);
        } else {
          confirmarPresencaButton.innerText = "Confirmar presença";
          confirmarPresencaButton.classList.add("btn", "btn-success");
          confirmarPresencaButton.addEventListener("click", () => {
            atualizarStatusJogador(id, jogador.id);
          });
        }

        li.appendChild(confirmarPresencaButton);
        listaJogadores.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("Erro ao obter a lista de jogadores:", error);
    });
}

async function atualizarStatusJogador(idPartida, idJogador) {
  fetch(`/api/partida/${idPartida}/jogador/${idJogador}`, {
    method: "POST",
  })
    .then((data) => {
      if (data.ok) {
        atualizarListaJogadores(idPartida);
      }
    })
    .catch((error) => {
      console.error("Erro ao atualizar status do jogador:", error.message);
    });
}

window.onload = () => {
  carregerPartida();
};
