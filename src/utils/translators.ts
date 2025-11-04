export const translateType = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    normal: 'Normal',
    fire: 'Fogo',
    water: 'Água',
    electric: 'Elétrico',
    grass: 'Grama',
    ice: 'Gelo',
    fighting: 'Lutador',
    poison: 'Veneno',
    ground: 'Terra',
    flying: 'Voador',
    psychic: 'Psíquico',
    bug: 'Inseto',
    rock: 'Pedra',
    ghost: 'Fantasma',
    dragon: 'Dragão',
    dark: 'Sombrio',
    steel: 'Aço',
    fairy: 'Fada',
  };
  return typeMap[type] || (type.charAt(0).toUpperCase() + type.slice(1));
};

export const translateStatName = (statName: string): string => {
  const statMap: { [key: string]: string } = {
    hp: 'HP',
    attack: 'Ataque',
    defense: 'Defesa',
    'special-attack': 'Ataque Especial',
    'special-defense': 'Defesa Especial',
    speed: 'Velocidade',
  };
  return statMap[statName] || (statName.charAt(0).toUpperCase() + statName.slice(1));
};

export const translateAbilityName = (abilityName: string): string => {
  return abilityName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};