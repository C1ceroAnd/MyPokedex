import { useState, useEffect } from 'react';
import api from '../services/api';
import { PokemonListResponse, PokemonResult, PokemonDetail } from '../types/pokemon';

interface UsePokemonsHook {
  pokemons: PokemonDetail[];
  loading: boolean;
  error: string | null;
  fetchNextPage: () => void;
  hasMore: boolean;
}

// Reduzi o page size para evitar muitas requisições paralelas por página.
const ITEMS_PER_PAGE = 40;

export const usePokemons = (): UsePokemonsHook => {
  const [pokemons, setPokemons] = useState<PokemonDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [offset, setOffset] = useState<number>(0);

  const fetchPokemonDetails = async (results: PokemonResult[]): Promise<PokemonDetail[]> => {
    const detailsPromises = results.map((pokemon) => api.get<PokemonDetail>(pokemon.url).then(r => r.data));
    return Promise.all(detailsPromises);
  };

  // fetchPokemons agora recebe explicitamente o offset a ser usado.
  // Isso evita o problema de setState assíncrono quando chamamos setOffset() e em seguida
  // tentamos usar o estado atualizado imediatamente.
  const fetchPokemons = async (offsetToUse = offset) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<PokemonListResponse>(`/pokemon?limit=${ITEMS_PER_PAGE}&offset=${offsetToUse}`);
      const newPokemonsResults = response.data.results;
      const newPokemonsDetails = await fetchPokemonDetails(newPokemonsResults);

      setPokemons((prevPokemons) => {
        const uniqueNewPokemons = newPokemonsDetails.filter(
          (newPokemon) => !prevPokemons.some((prevPokemon) => prevPokemon.id === newPokemon.id)
        );
        return [...prevPokemons, ...uniqueNewPokemons];
      });

      setNextUrl(response.data.next);
      // atualiza o offset apenas quando a requisição for bem sucedida
      setOffset(offsetToUse);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch pokemons:', err);
      setError('Falha ao carregar os pokémons.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch inicial com offset 0
    fetchPokemons(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNextPage = () => {
    if (nextUrl && !loading) {
      const newOffset = offset + ITEMS_PER_PAGE;
      // chamamos fetchPokemons com o novo offset explicitamente
      fetchPokemons(newOffset);
    }
  };

  const hasMore = nextUrl !== null;

  return { pokemons, loading, error, fetchNextPage, hasMore };
};