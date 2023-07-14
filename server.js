import express from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const app = express();

let partidas = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.get("/partida/:titulo", (req, res) => {
  res.sendFile("/pages/partida.html", { root: "./public" });
});

app.get("/api/partidas", (req, res) => {
  fs.readFile("./data.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Erro ao ler as partidas:", err);
      return res.status(500).json({ message: "Erro ao obter as partidas" });
    }

    partidas = JSON.parse(data);
    res.send(partidas);
  });
});

app.get("/api/partida/:titulo", (req, res) => {
  const { titulo } = req.params;
  const tituloPartida = titulo.replace(/([A-Z])/g, " $1").slice(1);
  const data = fs.readFileSync("./data.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Erro ao ler as partidas:", err);
      return res.status(500).json({ message: "Erro ao obter as partidas" });
    }

    const obj = JSON.parse(data);
    return obj;
  });

  const partida = JSON.parse(data).filter(
    (partida) => partida.titulo === tituloPartida
  );

  if (partida.length === 0) {
    res.status(404).send(`<h1>Not Found</h1>`);
  }
  res.status(200).send(partida);
});

app.post("/api/partidas", (req, res) => {
  const { titulo, local, data, horario } = req.body;

  const partida = {
    titulo,
    id: uuidv4(),
    local,
    data,
    horario,
    jogadores: [],
  };

  fs.readFile("./data.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Erro ao ler as partidas:", err);
      return res.status(500).json({ message: "Erro ao criar a partida" });
    }

    partidas = JSON.parse(data);
    partidas.push(partida);

    fs.writeFile("./data.json", JSON.stringify(partidas), (err) => {
      if (err) {
        console.error("Erro ao salvar as partidas:", err);
        return res.status(500).json({ message: "Erro ao criar a partida" });
      }

      res.status(201).redirect("/");
    });
  });
});

app.delete("/api/partidas/:id", (req, res) => {
  const partidaId = req.params.id;

  fs.readFile("./data.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Erro ao ler as partidas:", err);
      return res.status(500).json({ message: "Erro ao excluir a partida" });
    }

    partidas = JSON.parse(data);

    const partidaIndex = partidas.findIndex((p) => p.id === partidaId);

    if (partidaIndex === -1) {
      return res.status(404).json({ message: "Partida não encontrada" });
    }

    partidas.splice(partidaIndex, 1);

    fs.writeFile("./data.json", JSON.stringify(partidas), (err) => {
      if (err) {
        console.error("Erro ao salvar as partidas:", err);
        return res.status(500).json({ message: "Erro ao excluir a partida" });
      }

      res.json({ success: true, message: "Partida excluída com sucesso" });
    });
  });
});

app.get("/api/partida/:id/jogadores/", (req, res) => {
  const partidaId = req.params.id;

  fs.readFile("./data.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Erro ao ler as partidas:", err);
      return res
        .status(500)
        .json({ message: "Erro ao obter a lista de presença" });
    }

    partidas = JSON.parse(data);

    const partida = partidas.find((p) => p.id === partidaId);

    if (!partida) {
      return res.status(404).json({ message: "Partida não encontrada" });
    }

    res.json(partida.jogadores);
  });
});

app.post("/api/partida/:id/jogadores/", (req, res) => {
  const partidaId = req.params.id;
  const { nome, telefone } = req.body;

  const jogador = {
    nome,
    telefone,
    presencaConfirmada: false,
    id: uuidv4(),
    createdAt: new Date(),
  };

  fs.readFile("./data.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Erro ao ler as partidas:", err);
      return res
        .status(500)
        .json({ message: "Erro ao obter a lista de presença" });
    }

    let partidas = JSON.parse(data);

    const partida = partidas.find((partida) => partida.id === partidaId);

    if (!partida) {
      return res.status(404).json({ message: "Partida não encontrada" });
    }

    partida.jogadores.push(jogador);

    fs.writeFile("./data.json", JSON.stringify(partidas), (err) => {
      if (err) {
        console.error("Erro ao gravar os dados:", err);
        return res
          .status(500)
          .json({ message: "Erro ao adicionar o jogador à partida" });
      }

      return res
        .status(201)
        .json({ message: "Jogador adicionado com sucesso" });
    });
  });
});

app.post("/api/partida/:partidaId/jogador/:jogadorId", (req, res) => {
  const { partidaId, jogadorId } = req.params;

  fs.readFile("./data.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Erro ao ler as partidas:", err);
      return res.status(500).json({ message: "Erro ao obter a lista de presença" });
    }

    let partidas = JSON.parse(data);

    const partidaIndex = partidas.findIndex((partida) => partida.id === partidaId);

    if (partidaIndex === -1) {
      return res.status(404).json({ message: "Partida não encontrada" });
    }

    const partida = partidas[partidaIndex];

    const jogadorIndex = partida.jogadores.findIndex((jogador) => jogador.id === jogadorId);

    if (jogadorIndex === -1) {
      return res.status(404).json({ message: "Jogador não encontrado" });
    }

    const jogador = partida.jogadores[jogadorIndex];
    jogador.presencaConfirmada = true;

    fs.writeFile("./data.json", JSON.stringify(partidas), (err) => {
      if (err) {
        console.error("Erro ao gravar os dados:", err);
        return res.status(500).json({ message: "Erro ao atualizar o status de presença" });
      }

      return res.status(200).json({ message: "Status de presença atualizado com sucesso" });
    });
  });
});



app.listen(3000, () =>
  console.log("O servidor está rodando em http://localhost:3000")
);
