# MyPokedex

Uma Pokedex simples construída em React Native (Expo) com TypeScript. O app consome a PokeAPI para listar pokémons, exibir cards com imagem e tipos, e mostrar um detalhe com atributos como altura, peso, stats e habilidades.

Este README documenta o projeto de forma extensa: arquitetura, como rodar, contratos de API, decisões de implementação, correção aplicada, sugestões de melhoria, testes e fluxos de desenvolvimento.

## Tecnologias

- Expo (~50)
- React 18
- React Native 0.73
- TypeScript (tipos definidos em `src/types`)
- Axios (HTTP)

## Sumário de conteúdo

- Visão geral
- Como rodar (desenvolvimento e emuladores)
- Estrutura do projeto
- Detalhes de implementação por módulo
- Contratos/Types
- Correção aplicada (paginação)
- Boas práticas, testes e CI
- Roadmap e sugestões de melhorias
- Contribuição

## Como rodar

Pré-requisitos:
- Node.js (versão LTS recomendada)
- npm ou yarn
- Expo CLI (opcional, mas útil): `npm install -g expo-cli` ou usar `npx expo`.
- Para rodar no iOS localmente é necessário macOS com Xcode.

Instalar dependências:
y# Rodar no Android
npm run android
# ou
yarn android

# Rodar no iOS
npm run ios
# ou
yarn ios
```

Estrutura do Projeto
A estrutura de pastas segue o essencial solicitado para a atividade de PDM:

mypokedex/
├── App.tsx                     # Componente raiz que renderiza a HomeScreen
├── package.json
├── src/
│   ├── components/
│   │   └── PokemonCard/        # Card de exibição do Pokémon na lista
│   │       ├── index.tsx
+│   │       └── styles.ts
│   ├── config/
│   │   └── env.ts              # Armazena a URL base da API
│   ├── hooks/
│   │   └── usePokemons.ts      # Hook customizado para buscar e paginar
│   ├── screens/
│   │   └── Home/               # Tela principal (lista e modal de detalhe)
│   │       ├── index.tsx
│   │       └── styles.ts
│   ├── services/
│   │   └── api.ts              # Instância configurada do Axios
│   ├── types/
│   │   └── pokemon.d.ts        # Tipos TypeScript da API
│   └── utils/
│       └── translators.ts      # Funções para traduzir tipos, stats, etc.
└── tsconfig.json
Fluxo de Dados e Arquitetura
O App.tsx renderiza a HomeScreen.

HomeScreen utiliza o hook customizado usePokemons para carregar a lista inicial de pokémons.

usePokemons chama o api.ts (Axios) para buscar a lista paginada em /pokemon?limit=20&offset=....

Para cada item da lista (PokemonResult), o hook faz uma requisição individual à url do pokémon para obter o PokemonDetail (sprites, tipos, stats, etc.).

HomeScreen renderiza os dados usando FlatList, onde cada item é um componente PokemonCard.

Ao tocar em um PokemonCard, o estado selectedPokemon na HomeScreen é atualizado.

Quando selectedPokemon não é nulo, um overlay é exibido, renderizando o componente PokemonDetailScreen (definido dentro de HomeScreen/index.tsx) com as informações detalhadas.

Clicar no "X" do modal limpa o estado selectedPokemon, fechando o detalhe.

Decisão de Design: A tela de detalhes foi implementada como um modal condicional dentro da própria HomeScreen, em vez de usar uma biblioteca de navegação (como react-navigation), para manter o projeto focado e simples.

Detalhes de Implementação
src/services/api.ts: Instancia o Axios com a baseURL vinda de config/env.ts.

src/hooks/usePokemons.ts: É o cérebro da aplicação.

Gerencia os estados de pokemons (lista), loading (carregando), error (erro) e offset (paginação).

Controla a paginação com ITEMS_PER_PAGE = 20.

Possui a função fetchPokemonDetails que busca os detalhes de cada pokémon individualmente.

Concatena os novos pokémons ao estado existente, garantindo que não haja duplicatas.

src/components/PokemonCard/index.tsx: Componente de exibição.

Prioriza a imagem official-artwork e usa front_default como fallback.

Exibe o nome capitalizado.

Mapeia os tipos do pokémon, traduzindo-os e aplicando cores dinâmicas (getTypeColor).

src/utils/translators.ts: Funções puras para tradução.

translateType: (ex: 'fire' -> 'Fogo').

translateStatName: (ex: 'special-attack' -> 'Ataque Especial').

translateAbilityName: (ex: 'solar-power' -> 'Solar Power').

src/screens/Home/index.tsx:

Contém a lógica da FlatList (incluindo numColumns={2}) e a renderização do PokemonCard.

Gerencia o estado de selectedPokemon para abrir/fechar o modal de detalhes.

Contém o sub-componente PokemonDetailScreen (o modal).

Contratos / Types
Os tipos TypeScript estão em src/types/pokemon.d.ts e representam o subconjunto da resposta da PokeAPI que o app consome:

PokemonListResponse: A resposta da lista principal (/pokemon).

PokemonResult: Cada item da lista ({ name, url }).

PokemonDetail: A resposta completa do pokémon (id, name, height, weight, sprites, stats, types, abilities).

Lógica de Paginação (Infinite Scroll)
A paginação é implementada no usePokemons e disparada pela FlatList na HomeScreen:

A FlatList usa a prop onEndReached para detectar quando o usuário chega ao fim da rolagem.

onEndReached chama a função fetchNextPage (exposta pelo hook).

fetchNextPage verifica se há mais itens para carregar (hasMore) e se uma busca já não está em andamento (!loading).

Ela então dispara fetchPokemons() (função interna do hook) para buscar os próximos 20 itens.

Os novos pokémons são adicionados ao final da lista no estado, atualizando a FlatList e criando o efeito de "scroll infinito".

Performance e Limitações
Múltiplas Requisições: O hook busca 20 pokémons por página. Para cada um, ele faz uma requisição de detalhe adicional. Isso significa que cada "página" dispara 21 requisições (1 para a lista + 20 para os detalhes).

Sugestões de Performance:

Implementar cache (em memória ou AsyncStorage) para os detalhes dos pokémons, evitando novas requisições para itens já vistos.

Usar React.memo no PokemonCard para evitar re-renderizações desnecessárias.

Otimizar a FlatList com props como initialNumToRender e maxToRenderPerBatch.

Sugestões de Testes
Para aumentar a qualidade do projeto, os próximos passos seriam:

Testes Unitários (Jest):

Testar as funções de src/utils/translators.ts para garantir que todas as traduções estão corretas.

Testes de Integração (React Native Testing Library):

Mockar o axios (via jest.mock) e testar o hook usePokemons, simulando respostas de sucesso e erro da API.

Testar se o PokemonCard renderiza os dados corretamente.

Roadmap / Melhorias Sugeridas
Migrar para React Navigation: Substituir o modal de detalhe pelo Stack Navigator, conforme sugerido na atividade original da disciplina, para uma navegação mais robusta.

Adicionar Testes Unitários: Configurar o Jest e testar as funções de translators.ts.

Campo de Busca: Adicionar um TextInput no topo da HomeScreen para filtrar pokémons por nome.

Refatorar Cores e Estilos: Mover a função getTypeColor para um arquivo em src/theme ou src/utils para ser reutilizada.

Cache de Dados: Implementar uma estratégia de cache simples (ex: React Context ou React Query) para armazenar os detalhes dos pokémons e reduzir requisições.

- `src/components/PokemonCard` — card de pokémon (imagem, nome, tipos).
- `src/types/pokemon.d.ts` — tipos TypeScript que representam as respostas da PokeAPI usadas pelo app.
- `src/utils/translators.ts` — funções utilitárias para traduzir tipos e nomes para Português.
- `assets/` — imagens, fontes, icons, lotties (recursos do projeto).

## Fluxo de dados e arquitetura

1. `HomeScreen` usa o hook `usePokemons` para carregar a lista de pokémons.
2. `usePokemons` chama a API `/pokemon?limit=...&offset=...` para obter uma lista de `results` (cada item com `name` e `url`).
3. Para cada `result`, faz uma requisição para a `url` do pokémon para obter o `PokemonDetail` (sprites, tipos, stats, abilities, etc.).
4. `HomeScreen` renderiza os pokémons com `FlatList` e cada item utiliza `PokemonCard`.
5. Ao tocar em um card, `HomeScreen` abre um overlay com `PokemonDetailScreen` (conteúdo renderizado na mesma tela) exibindo informações detalhadas.

Observação de design: os detalhes são obtidos via múltiplas requisições (uma por pokémon). Isso é simples e direto, porém pode gerar muitas requisições paralelas — veja seção de performance abaixo.

## Detalhes de implementação

- `src/services/api.ts` — instancia o Axios com `baseURL` apontando para `API_BASE_URL`. Recomendações: adicionar `timeout`, interceptors para tratamento global de erros e headers padrão.

- `src/hooks/usePokemons.ts` — responsabilidades:
  - Gerenciar estado: `pokemons`, `loading`, `error`, `offset`, `nextUrl`.
  - `fetchPokemons(offsetToUse)` — busca a lista de `results` e em seguida busca detalhes completos para cada pokemon; concatena no estado garantindo unicidade por `id`.
  - `fetchNextPage()` — calcula o próximo offset e chama `fetchPokemons` explicitamente com o novo offset (fix aplicado para evitar uso de `setState` seguido de leitura do estado anterior).

- `src/components/PokemonCard/index.tsx` — apresenta imagem (tenta `sprites.other['official-artwork'].front_default` com fallback para `sprites.front_default`), nome capitalizado e badges de tipo coloridas. Usa `TouchableOpacity` para interação.

- `src/utils/translators.ts` — contém mapeamentos de strings (tipo → pt-br, stat → pt-br) e utilidades de formatação.

## Contracts / Types

Os tipos relevantes estão em `src/types/pokemon.d.ts`. Eles representam o sub-conjunto da resposta da PokeAPI que o app consome:

- `PokemonListResponse` — `count`, `next`, `previous`, `results`.
- `PokemonResult` — `{ name, url }`.
- `PokemonDetail` — `id, name, height, weight, sprites, stats, types, abilities, species`.

Observação: os tipos são úteis para autocontrole e segurança em tempo de compilação, mas a PokeAPI pode conter campos ausentes; sempre trate campos aninhados com cautela em runtime.

## Correção aplicada (paginação)

Problema detectado originalmente:

- O hook chamava `setOffset(prev => prev + ITEMS_PER_PAGE)` seguido imediatamente por `fetchPokemons()` que usava o estado `offset`. Como `setState` é assíncrono, a requisição podia usar o `offset` antigo, causando repetição de páginas.

Correção aplicada:

- `fetchPokemons` agora aceita um `offsetToUse` explícito e usa esse valor na URL da requisição.
- `fetchNextPage` calcula `newOffset = offset + ITEMS_PER_PAGE` e chama `fetchPokemons(newOffset)`.
- O `offset` só é atualizado (`setOffset`) dentro de `fetchPokemons` depois que a requisição é bem-sucedida.

Benefício: elimina a condição de corrida entre `setState` e leitura subsequente do estado; chamadas subsequentes usam offsets explícitos.

## Performance e limitações

- Por padrão, o hook buscava 100 pokémons por página — isso pode gerar muitas requisições (uma por pokémon) e sobrecarregar a API ou a rede. Alterei o `ITEMS_PER_PAGE` para 40 para reduzir o número de requisições paralelas por página.
- Recomendações:
  - Fazer fetch em chunks (e.g., 10 em 10) com pequenas pausas entre chunks para evitar rate-limiting.
  - Implementar cache de pokémon (em memória, `AsyncStorage` ou solução como React Query) para evitar re-fetch quando navegar.
  - Usar placeholder e lazy-load de imagens.
  - Adotar `React.memo` em `PokemonCard` e otimizações do `FlatList` (`getItemLayout`, `initialNumToRender`, `maxToRenderPerBatch`).

## Testes sugeridos

- Unit tests:
  - `translators.ts` — testar mapeamentos e formatações.
  - Funções puras do hook (extrair lógica de fetch em funções testáveis quando possível).
- Integration:
  - Mock de `axios` (ou usar `msw`) para testar `usePokemons` e `HomeScreen` com respostas simuladas.
- E2E:
  - Detox ou Appium para testes de fluxo (listar pokémons, abrir detalhe).

Sugestões de configuração de testes:

1. Adicionar Jest e React Native Testing Library.
2. Criar testes básicos para o hook e para `PokemonCard`.

## Lint, formatação e CI

- É recomendável adicionar ESLint (com plugin react-native), Prettier e configurar hooks de pre-commit (husky) para garantir qualidade.
- Sugestão de pipeline (GitHub Actions): rodar `npm ci`, `npm run lint`, `npm test` em PRs.

## Boas práticas de desenvolvimento

- Evite comitar chaves e segredos; use variáveis de ambiente.
- Extraia lógica complexa para funções puras para facilitar testes.
- Prefira tipar entradas/saídas das funções e APIs com interfaces bem definidas.
- Manter o uso de `ActivityIndicator` / placeholders para melhores feedbacks de loading.

## Roadmap / Melhorias sugeridas

1. Cache dos detalhes dos pokémons (React Query / AsyncStorage).
2. Throttling/batching de requisições em `usePokemons`.
3. Adicionar testes automatizados (Jest + RN Testing Library).
4. Configurar ESLint, Prettier e husky.
5. Internacionalização (i18n) com suporte multi-idioma.
6. Animações e melhorias no modal de detalhe.
7. CI/CD com GitHub Actions e builds EAS para publicar na loja.

## Como contribuir

1. Abra uma issue descrevendo o que você quer implementar ou corrigir.
2. Crie um branch com um nome descritivo: `feature/{descricao}` ou `fix/{descricao}`.
3. Adicione testes quando possível.
4. Abra um Pull Request com descrição clara e screenshots se aplicável.

## Comandos úteis

- Instalar dependências:

```bash
npm install
# ou
yarn
```

- Rodar o app:

```bash
npm run start
npm run android
npm run ios
```

## Notas finais

Criei `config/env.ts` com a `API_BASE_URL` apontando para a PokeAPI pública. Também corrigi a lógica de paginação em `src/hooks/usePokemons.ts` para evitar comportamento inconsistente ao paginar.

Se quiser, posso também:

- Implementar chunked fetching para reduzir impacto em redes lentas.
- Adicionar testes iniciais (Jest) e um pipeline simples de CI.
- Adicionar ESLint/Prettier config e scripts de lint.

Diga qual item prefere que eu faça a seguir e eu prosseguirei com as mudanças e validações.
