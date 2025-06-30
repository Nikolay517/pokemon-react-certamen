// src/App.jsx o cualquier otro componente padre
import {useState} from "react";
import PokemonFetcher from "./PokemonFetcher";

function App() {
  return (
    <>
      
      <h1>¡Buscador por tipos de Pokémon!</h1>
        <PokemonFetcher />
    </>
  )
}

export default App;
