import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { apiFetch } from "../services/api.js";

export default function Menu() {
  const [categorias, setCategorias] = useState([]);
  const [categoriaForm, setCategoriaForm] = useState({ name: "" });
  const [produtoForm, setProdutoForm] = useState({
    categoriaId: "",
    name: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    apiFetch("/menu/categorias")
      .then((data) => setCategorias(data))
      .catch(() => {});
  }, []);

  async function handleCreateCategoria(event) {
    event.preventDefault();
    if (!categoriaForm.name) {
      return;
    }
    const categoria = await apiFetch("/menu/categorias", {
      method: "POST",
      body: JSON.stringify({ name: categoriaForm.name }),
    });
    setCategorias((prev) => [categoria, ...prev]);
    setCategoriaForm({ name: "" });
  }

  async function handleCreateProduto(event) {
    event.preventDefault();
    if (!produtoForm.categoriaId || !produtoForm.name || !produtoForm.price) {
      return;
    }
    const produto = await apiFetch("/menu/produtos", {
      method: "POST",
      body: JSON.stringify({
        categoriaId: produtoForm.categoriaId,
        name: produtoForm.name,
        description: produtoForm.description || undefined,
        price: Number(produtoForm.price),
      }),
    });
    setCategorias((prev) =>
      prev.map((cat) =>
        cat.id === produto.categoriaId ? { ...cat, produtos: [...cat.produtos, produto] } : cat
      )
    );
    setProdutoForm({ categoriaId: "", name: "", description: "", price: "" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cardapio do clube"
        subtitle="Categorias personalizadas e produtos ativos."
        action={<button className="btn-primary w-full md:w-auto">Novo produto</button>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <form className="card-glass rounded-3xl p-6 space-y-3" onSubmit={handleCreateCategoria}>
          <h3 className="font-display text-xl text-white">Nova categoria</h3>
          <input
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            placeholder="Nome da categoria"
            value={categoriaForm.name}
            onChange={(event) => setCategoriaForm({ name: event.target.value })}
          />
          <button className="btn-outline w-full" type="submit">
            Criar categoria
          </button>
        </form>

        <form className="card-glass rounded-3xl p-6 space-y-3" onSubmit={handleCreateProduto}>
          <h3 className="font-display text-xl text-white">Novo produto</h3>
          <select
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            value={produtoForm.categoriaId}
            onChange={(event) => setProdutoForm({ ...produtoForm, categoriaId: event.target.value })}
          >
            <option value="">Selecione a categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.name}
              </option>
            ))}
          </select>
          <input
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            placeholder="Nome do produto"
            value={produtoForm.name}
            onChange={(event) => setProdutoForm({ ...produtoForm, name: event.target.value })}
          />
          <input
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            placeholder="Descricao"
            value={produtoForm.description}
            onChange={(event) => setProdutoForm({ ...produtoForm, description: event.target.value })}
          />
          <input
            className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-2 text-white"
            placeholder="Preco"
            value={produtoForm.price}
            onChange={(event) => setProdutoForm({ ...produtoForm, price: event.target.value })}
          />
          <button className="btn-primary w-full" type="submit">
            Criar produto
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {categorias.map((categoria) => (
          <div key={categoria.id} className="card-glass rounded-3xl p-6">
            <h3 className="font-display text-xl text-white">{categoria.name}</h3>
            <div className="mt-4 space-y-3">
              {categoria.produtos?.map((item) => (
                <div key={item.id} className="flex items-center justify-between border border-slate-700 rounded-2xl p-4">
                  <div>
                    <p className="text-white font-semibold">{item.name}</p>
                    <p className="text-xs text-slate-400">Ativo</p>
                  </div>
                  <span className="text-sand-300 font-semibold">
                    R$ {Number(item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
