import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;


app.use(express.json());
app.use(cors());


let games = [
    { id: 1, title: "Elden Ring", price: 250 },
    { id: 2, title: "Minecraft", price: 100 }
];

// Listar
app.get('/games', (req, res) => {
    res.status(200).json(games);
});

// Adicionar
app.post('/games', (req, res) => {
    const { title, price } = req.body;
    if (!title || !price) {
        return res.status(400).json({ message: "Título e preço são obrigatórios" });
    }
    const newGame = { 
        id: games.length > 0 ? Math.max(...games.map(g => g.id)) + 1 : 1, 
        title, 
        price 
    };
    games.push(newGame);
    res.status(201).json(newGame);
});

// Atualizar
app.put('/games/:id', (req, res) => {
    const { id } = req.params;
    const { title, price } = req.body;
    const index = games.findIndex(g => g.id === parseInt(id));

    if (index === -1) {
        return res.status(404).json({ message: "Jogo não encontrado" });
    }

    games[index] = { ...games[index], title, price };
    res.status(200).json(games[index]);
});

// DELETE 
app.delete('/games/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = games.length;
    games = games.filter(g => g.id !== parseInt(id));

    if (games.length === initialLength) {
        return res.status(404).json({ message: "Jogo não encontrado" });
    }

    res.status(204).send(); 
});

app.listen(PORT, () => {
    console.log(`🚀 Back-end rodando em http://localhost:${PORT}`);
});