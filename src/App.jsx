// src/App.jsx o cualquier otro componente padre
import {useState} from "react";
import PokemonFetcher from "./PokemonFetcher";

function App() {
  return (
    <>
      
      <h1>¡Conoce a tus Pokémon!</h1>
        <PokemonFetcher />
    </>
  )
}

export default App;
