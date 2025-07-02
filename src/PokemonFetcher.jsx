import React, { useState, useEffect } from 'react';
import './PokemonFetcher.css';

const PokemonFetcher = () => {
  const [pokemones, setPokemones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('todos');
  const [tiposDisponibles, setTiposDisponibles] = useState([]);

  useEffect(() => {
    const fetchPokemones = async () => {
      try {
        setCargando(true);
        setError(null);

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=691`);
        const data = await response.json();

        const pokemonData = await Promise.all(
          data.results.map(async (pokemon) => {
            const res = await fetch(pokemon.url);
            const pokeInfo = await res.json();
            return {
              id: pokeInfo.id,
              nombre: pokeInfo.name,
              imagen: pokeInfo.sprites.front_default,
              tipos: pokeInfo.types.map(t => t.type.name),
            };
          })
        );

        setPokemones(pokemonData);

        // Extraer tipos únicos
        const tiposUnicos = new Set();
        pokemonData.forEach(p => p.tipos.forEach(t => tiposUnicos.add(t)));
        setTiposDisponibles(['todos', ...Array.from(tiposUnicos)]);
      } catch (err) {
        setError('Error al obtener los Pokémon: ' + err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchPokemones();
  }, []);

  const pokemonesFiltrados =
    tipoSeleccionado === 'todos'
      ? pokemones
      : pokemones.filter(p => p.tipos.includes(tipoSeleccionado));

  if (cargando) return <div className="pokemon-container">Cargando Pokémon...</div>;
  if (error) return <div className="pokemon-container error">{error}</div>;

  return (
    <div className="pokemon-container">
      <h2>Pokémon disponibles</h2>

      <div className="filtro-tipos">
        <label htmlFor="tipo-select">Filtrar por tipo:</label>
        <select
          id="tipo-select"
          value={tipoSeleccionado}
          onChange={(e) => setTipoSeleccionado(e.target.value)}
        >
          {tiposDisponibles.map(tipo => (
            <option key={tipo} value={tipo}>
              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="pokemon-list">
        {pokemonesFiltrados.map(pokemon => (
          <div key={pokemon.id} className="pokemon-card">
            <h3>{pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
            <img src={pokemon.imagen} alt={pokemon.nombre} />
            <p>
              <strong>Tipos:</strong>{' '}
              {pokemon.tipos.map(tipo => tipo.charAt(0).toUpperCase() + tipo.slice(1)).join(', ')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokemonFetcher;
