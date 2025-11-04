import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { usePokemons } from '../../hooks/usePokemons';
import PokemonCard from '../../components/PokemonCard';
import { PokemonDetail } from '../../types/pokemon';
import { styles } from './styles';
import { translateType, translateStatName, translateAbilityName } from '../../utils/translators';

const PokemonDetailScreen: React.FC<{ pokemon: PokemonDetail | null; onClose: () => void }> = ({ pokemon, onClose }) => {
  if (!pokemon) {
    return null;
  }

  const imageUrl = pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;

  return (
    <View style={styles.detailScreenContainer}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>
      <Text style={styles.detailName}>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</Text>
      <Image source={{ uri: imageUrl }} style={styles.detailImage} />
      <Text style={styles.detailText}>ID: #{pokemon.id}</Text>
      <Text style={styles.detailText}>Altura: {pokemon.height / 10} m</Text>
      <Text style={styles.detailText}>Peso: {pokemon.weight / 10} kg</Text>

      <Text style={styles.detailSectionTitle}>Tipos:</Text>
      <View style={styles.detailTypesContainer}>
        {pokemon.types.map((typeInfo) => (
          <View key={typeInfo.slot} style={[styles.detailTypeBadge, { backgroundColor: getTypeColor(typeInfo.type.name) }]}>
            <Text style={styles.detailTypeText}>
              {translateType(typeInfo.type.name)}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.detailSectionTitle}>Atributos:</Text>
      {pokemon.stats.map((statInfo) => (
        <Text key={statInfo.stat.name} style={styles.detailText}>
          {translateStatName(statInfo.stat.name)}: {statInfo.base_stat}
        </Text>
      ))}

      <Text style={styles.detailSectionTitle}>Habilidades:</Text>
      {pokemon.abilities.map((abilityInfo) => (
        <Text key={abilityInfo.ability.name} style={styles.detailText}>
          {translateAbilityName(abilityInfo.ability.name)}
          {abilityInfo.is_hidden && ' (oculta)'}
        </Text>
      ))}
    </View>
  );
};


const HomeScreen: React.FC = () => {
  const { pokemons, loading, error, fetchNextPage, hasMore } = usePokemons();
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetail | null>(null);

  const handleCardPress = useCallback((pokemon: PokemonDetail) => {
    setSelectedPokemon(pokemon);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedPokemon(null);
  }, []);

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokedex</Text>
      <FlatList
        data={pokemons}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PokemonCard pokemon={item} onPress={handleCardPress} />
        )}
        onEndReached={({ distanceFromEnd }) => {
          if (distanceFromEnd < 100 && !loading && hasMore) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
      {selectedPokemon && (
        <View style={styles.overlay}>
          <PokemonDetailScreen pokemon={selectedPokemon} onClose={handleCloseDetail} />
        </View>
      )}
    </View>
  );
};

const getTypeColor = (type: string) => {
    switch (type) {
      case 'grass': return '#78C850';
      case 'fire': return '#F08030';
      case 'water': return '#6890F0';
      case 'bug': return '#A8B820';
      case 'normal': return '#A8A878';
      case 'poison': return '#A040A0';
      case 'electric': return '#F8D030';
      case 'ground': return '#E0C068';
      case 'fairy': return '#EE99AC';
      case 'fighting': return '#C03028';
      case 'psychic': return '#F85888';
      case 'rock': return '#B8A038';
      case 'ghost': return '#705898';
      case 'ice': return '#98D8D8';
      case 'dragon': return '#7038F8';
      case 'steel': return '#B8B8D0';
      case 'dark': return '#705848';
      case 'flying': return '#A890F0';
      default: return '#777';
    }
  };


export default HomeScreen;