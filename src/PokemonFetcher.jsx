import React, { useState, useEffect } from 'react';
import './PokemonFetcher.css';

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

const obtenerPokemonesPorTipo = async (tipo, cantidad) => {
  const res = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
  const data = await res.json();
  const pokemonsTipo = data.pokemon.map(p => p.pokemon);
  const seleccionados = cantidad === 898 ? pokemonsTipo : pokemonsTipo.slice(0, cantidad);

  return Promise.all(
    seleccionados.map(async (poke) => {
      const resPoke = await fetch(poke.url);
      const dataPoke = await resPoke.json();
      return {
        id: dataPoke.id,
        nombre: dataPoke.name,
        imagen: dataPoke.sprites.front_default,
        tipos: dataPoke.types.map(t => t.type.name),
      };
    })
  );
};

const obtenerPokemonesAleatorios = async (cantidad) => {
  const ids = new Set();
  while (ids.size < cantidad) {
    ids.add(Math.floor(Math.random() * 898) + 1);
  }

  return Promise.all(
    [...ids].map(async (id) => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
      const data = await res.json();
      return {
        id: data.id,
        nombre: data.name,
        imagen: data.sprites.front_default,
        tipos: data.types.map(t => t.type.name),
      };
    })
  );
};

const PokemonFetcher = () => {
  const [pokemones, setPokemones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(6);
  const [tipos, setTipos] = useState([]);
  const [diccionarioTipos, setDiccionarioTipos] = useState({});

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/type');
        const data = await res.json();

        const tiposValidos = data.results.filter(
          tipo => !['shadow', 'unknown'].includes(tipo.name)
        );

        const tiposConNombreEspañol = await Promise.all(
          tiposValidos.map(async (tipo) => {
            const resTipo = await fetch(tipo.url);
            const dataTipo = await resTipo.json();
            const nombreEsp = dataTipo.names.find(n => n.language.name === 'es')?.name || tipo.name;
            return {
              nombre: tipo.name,
              nombreEsp,
            };
          })
        );

        setTipos(tiposConNombreEspañol);

        const diccionario = {};
        tiposConNombreEspañol.forEach(tipo => {
          diccionario[tipo.nombre] = tipo.nombreEsp;
        });
        setDiccionarioTipos(diccionario);
      } catch (err) {
        console.error('Error al cargar tipos:', err);
      }
    };

    fetchTipos();
  }, []);

  useEffect(() => {
    const fetchPokemones = async () => {
      try {
        setCargando(true);
        setError(null);

        const datos =
          tipoSeleccionado
            ? await obtenerPokemonesPorTipo(tipoSeleccionado, cantidad)
            : await obtenerPokemonesAleatorios(cantidad);

        setPokemones(datos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchPokemones();
  }, [tipoSeleccionado, cantidad]);

  return (
    <div className='pokemon-container'>
      <h2>¡Busca tus Pokémon por Tipo!</h2>

      <div className="pokemon-controls">
        <label>
          Tipo:
          <select onChange={(e) => setTipoSeleccionado(e.target.value)} value={tipoSeleccionado}>
            <option value=''>Aleatorio</option>
            {tipos.map(tipo => (
              <option key={tipo.nombre} value={tipo.nombre}>
                {capitalizar(tipo.nombreEsp)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Cantidad:
          <select onChange={(e) => setCantidad(parseInt(e.target.value))} value={cantidad}>
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={18}>18</option>
            <option value={898}>Todos</option>
          </select>
        </label>
      </div>

      <div className="dropdowns">
        {/* Selectores de tipo y cantidad */}
      </div>


      {cargando && <div>Cargando Pokémon...</div>}
      {error && <div className="error">Error: {error}</div>}
      {!cargando && pokemones.length === 0 && <div>No se encontraron Pokémon.</div>}

      <div className="pokemon-list">
        {pokemones.map(pokemon => (
          <div key={pokemon.id} className="pokemon-card">
            <h3>{capitalizar(pokemon.nombre)}</h3>
            <img src={pokemon.imagen} alt={pokemon.nombre} />
            <p><strong>Tipos:</strong> {pokemon.tipos.map(tipo => capitalizar(diccionarioTipos[tipo] || tipo)).join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokemonFetcher;
