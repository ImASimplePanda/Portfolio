import "./estilo.css";
import { Barra } from "./componentes/Barra";
import { Cubierta } from "./componentes/Cubierta";
import { Indice } from "./componentes/Indice";
import { Laminas } from "./componentes/Laminas";
import { Notas, Colofon, Pie } from "./componentes/Cierre";

export default function App() {
  return (
    <>
      <a className="skip" href="#indice">
        Saltar al índice
      </a>
      <Barra />
      <main>
        <Cubierta />
        <Indice />
        <Laminas />
        <Notas />
        <Colofon />
      </main>
      <Pie />
    </>
  );
}
