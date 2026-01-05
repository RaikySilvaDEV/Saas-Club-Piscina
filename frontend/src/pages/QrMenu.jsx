import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../services/api.js";

export default function QrMenu() {
  const { code } = useParams();
  const [categorias, setCategorias] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    apiFetch(`/public/menu/${code}`)
      .then((data) => setCategorias(data.categorias || []))
      .catch(() => setStatus("Comanda nao encontrada."));
  }, [code]);

  async function handleAdd(produtoId) {
    try {
      await apiFetch(`/public/order/${code}`, {
        method: "POST",
        body: JSON.stringify({ items: [{ produtoId, quantity: 1 }] }),
      });
      setStatus("Pedido enviado para o bar.");
    } catch (err) {
      setStatus("Nao foi possivel enviar o pedido.");
    }
  }

  return (
    <div className="min-h-screen app-shell px-6 py-10">
      <div className="max-w-lg mx-auto">
        <div className="card-glass rounded-3xl p-6">
          <p className="text-sand-300 text-xs uppercase tracking-[0.4em]">Comanda</p>
          <h1 className="font-display text-3xl text-white mt-2">#{code}</h1>
          <p className="text-slate-400 mt-2">Escolha seus pedidos e acompanhe em tempo real.</p>
        </div>

        <div className="mt-6 space-y-4">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="space-y-3">
              <h2 className="text-slate-200 uppercase tracking-[0.3em] text-xs">{categoria.name}</h2>
              {categoria.produtos.map((item) => (
                <div key={item.id} className="card-glass rounded-3xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                    </div>
                    <span className="text-sand-300 font-semibold">
                      R$ {Number(item.price).toFixed(2)}
                    </span>
                  </div>
                  <button className="btn-outline w-full mt-4" onClick={() => handleAdd(item.id)}>
                    Adicionar a comanda
                  </button>
                </div>
              ))}
            </div>
          ))}
          {status && <p className="text-slate-300 text-sm">{status}</p>}
        </div>
      </div>
    </div>
  );
}
