import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import ClientesPage from "./pages/ClientesPage.jsx";
import PedidosPage from "./pages/PedidosPage.jsx";

import "./styles/Global.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="pedidos" element={<PedidosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);