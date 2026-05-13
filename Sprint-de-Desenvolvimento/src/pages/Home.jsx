import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getClientes, getPedidos } from "../services/Api.js";
import "../Pages.css";

export default function Home() {
  const [stats, setStats] = useState({
    clientes: 0,
    pedidos: 0,
    pendentes: 0,
    prontos: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [clientesRes, pedidosRes] = await Promise.all([
          getClientes(),
          getPedidos(),
        ]);

        const clientes = clientesRes?.data?.data ?? [];
        const pedidos = pedidosRes?.data?.data ?? [];

        setStats({
          clientes: clientes.length,
          pedidos: pedidos.length,
          pendentes: pedidos.filter((p) => p.status === "pendente").length,
          prontos: pedidos.filter((p) => p.status === "pronto").length,
        });
        setError(null);
      } catch (error) {
        console.error("API offline ou erro:", error.message);
        setError("Não foi possível conectar ao servidor. Certifique-se que o backend está rodando em http://localhost:3000");

        // fallback seguro
        setStats({
          clientes: 0,
          pedidos: 0,
          pendentes: 0,
          prontos: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const cards = [
    {
      label: "Clientes",
      value: stats.clientes,
      link: "/clientes",
    },
    {
      label: "Pedidos",
      value: stats.pedidos,
      link: "/pedidos",
    },
    {
      label: "Pendentes",
      value: stats.pendentes,
      link: "/pedidos",
    },
    {
      label: "Prontos",
      value: stats.prontos,
      link: "/pedidos",
    },
  ];

  return (
    <div>
      <h1>📊 Dashboard</h1>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">Carregando...</div>
      ) : (
        <div className="dashboard-grid">
          {cards.map((card, i) => (
            <Link
              key={i}
              to={card.link}
              className="dashboard-card"
            >
              <h3>{card.label}</h3>
              <p>{card.value}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}