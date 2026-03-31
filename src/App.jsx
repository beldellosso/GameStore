import { Suspense, use, useState, useTransition } from 'react';
import capaFixa from './capa-fixa.png'; 

const API_URL = "http://localhost:3000/games";

const fetchGames = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Erro ao carregar vitrine.");
  return response.json();
};

const saveGame = async (gameData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameData)
  });
  return response.json();
};

const updateGame = async (id, updatedData) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData)
  });
};

const deleteGame = async (id) => {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
};

// ... (Navbar e GameCard permanecem iguais)

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10 px-10 py-5 flex items-center justify-between shadow-2xl">
      <div className="flex items-center gap-10">
        <span className="text-2xl font-black tracking-tighter text-purple-500 uppercase italic">Game Store</span>
        <div className="hidden md:flex gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          <a href="#" className="hover:text-white transition">Lançamentos</a>
          <a href="#" className="hover:text-white transition">Categorias</a>
          <a href="#" className="hover:text-white transition">Suporte</a>
        </div>
      </div>
      <div className="flex gap-4 items-center">
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold text-xs italic">GS</div>
      </div>
    </nav>
  );
}

function GameCard({ game, onDelete, onEdit, isDeleting }) {
  return (
    <div className={`bg-slate-900 border border-white/5 rounded-2xl overflow-hidden transition-all group hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col relative ${isDeleting ? 'opacity-40 scale-95' : ''}`}>
      {isDeleting && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
          <div className="text-red-500 font-black animate-pulse tracking-widest text-center uppercase">REMOVENDO...</div>
        </div>
      )}
      <div className="aspect-[3/4] overflow-hidden bg-slate-800 relative">
        <img src={capaFixa} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
      </div>
      <div className="p-6 flex-grow flex flex-col z-10">
        <h3 className="text-xl font-black uppercase italic text-white mb-1 truncate group-hover:text-purple-400 transition">{game.title}</h3>
        <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-4">R$ {game.price}</p>
        <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
          <button onClick={() => onEdit(game)} className="text-[10px] font-black text-slate-400 hover:text-blue-400 uppercase transition tracking-widest">Editar</button>
          <button onClick={() => onDelete(game.id, game.title)} className="text-[10px] font-black text-slate-600 hover:text-red-500 uppercase transition tracking-widest" disabled={isDeleting}>Remover</button>
        </div>
      </div>
    </div>
  );
}

function StoreCatalog({ gamesPromise, onDelete, onEdit, deletingId }) {
  const games = use(gamesPromise);
  if (games.length === 0) return <div className="col-span-full py-20 text-center text-slate-500 uppercase font-bold tracking-widest border-2 border-dashed border-white/5 rounded-3xl">Estoque zerado</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {games.map(game => (
        <GameCard key={game.id} game={game} onDelete={onDelete} onEdit={onEdit} isDeleting={game.id === deletingId} />
      ))}
    </div>
  );
}

export default function App() {
  const [gamesPromise, setGamesPromise] = useState(() => fetchGames());
  const [isPending, startTransition] = useTransition(); 
  const [deletingId, setDeletingId] = useState(null); 

  const refreshStore = () => setGamesPromise(fetchGames()); 

  const handleAdd = () => {
    const title = prompt("Nome do jogo:");
    const price = prompt("Preço (apenas números):");
    if (!title || !price) return;

    startTransition(async () => {
      try {
        await saveGame({ title, price: Number(price) }); // Removi a letra 'r' que causava o erro
        refreshStore();
      } catch (err) {
        alert("Erro ao adicionar: " + err.message);
      }
    });
  };

  const handleEdit = (game) => {
    const newTitle = prompt("Novo nome:", game.title);
    const newPrice = prompt("Novo preço:", game.price);
    if (!newTitle || !newPrice) return;

    startTransition(async () => {
      try {
        await updateGame(game.id, { title: newTitle, price: Number(newPrice) });
        refreshStore();
      } catch (err) {
        alert("Erro ao editar: " + err.message);
      }
    });
  };

  const handleDelete = (id, title) => {
    if (!confirm(`Remover "${title}"?`)) return;
    setDeletingId(id); 
    startTransition(async () => {
      try {
        await deleteGame(id);
        refreshStore();
      } catch (err) {
        alert("Erro ao remover: " + err.message);
      } finally {
        setDeletingId(null); 
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-32 px-10 pb-20 font-sans selection:bg-purple-500">
      <Navbar />
      <main className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] mb-2">Vitrine Storefront</h2>
            <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">Catálogo <span className="text-slate-800">Oficial</span></h1>
          </div>
          <button onClick={handleAdd} disabled={isPending} className="bg-white text-black px-10 py-5 rounded-sm font-black uppercase italic text-xs hover:bg-purple-600 hover:text-white transition-all shadow-xl disabled:opacity-50">
            {isPending ? "Processando..." : "+ Novo Produto"}
          </button>
        </header>

        <Suspense fallback={<div className="text-center py-20 text-purple-500 animate-pulse font-black uppercase tracking-widest">Carregando Vitrine...</div>}>
          <StoreCatalog gamesPromise={gamesPromise} onDelete={handleDelete} onEdit={handleEdit} deletingId={deletingId} />
        </Suspense>
      </main>
      <footer className="mt-28 pt-10 border-t border-white/5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
        &copy; 2026 Game Store - CRUD Fullstack
      </footer>
    </div>
  );
}