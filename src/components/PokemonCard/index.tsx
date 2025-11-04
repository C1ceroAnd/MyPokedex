import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { PokemonDetail } from '../../types/pokemon';
import { styles } from './styles';
import { translateType } from '../../utils/translators';

interface PokemonCardProps {
  pokemon: PokemonDetail;
  onPress: (pokemon: PokemonDetail) => void;
}

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

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onPress }) => {
  const imageUrl = pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(pokemon)}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <Text style={styles.name}>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</Text>
      <View style={styles.typesContainer}>
        {pokemon.types.map((typeInfo) => (
          <View key={typeInfo.slot} style={[styles.typeBadge, { backgroundColor: getTypeColor(typeInfo.type.name) }]}>
            <Text style={styles.typeText}>
              {translateType(typeInfo.type.name)}
            </Text>

          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

export default PokemonCard;