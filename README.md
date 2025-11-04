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

```bash
npm install
# ou
yarn
```

Executar o Metro (Expo):

```bash
npm run start
# ou
yarn start
```

Rodar no Android:

```bash
npm run android
# ou
yarn android
```

Rodar no iOS (macOS + Xcode):

```bash
npm run ios
# ou
yarn ios
```

Observação: Se preferir, use o app Expo Go no celular para rodar a build de desenvolvimento pelo QR code.

## Configuração de ambiente

O projeto usa um pequeno arquivo de configuração `config/env.ts` com a variável `API_BASE_URL`.

Arquivo criado:

```ts
// config/env.ts
export const API_BASE_URL = 'https://pokeapi.co/api/v2';
```

Em projetos reais, para variar entre dev/prod/CI, recomenda-se usar variáveis de ambiente e/ou bibliotecas como `react-native-config` ou `expo-constants` para injetar valores.

## Estrutura do projeto

Principais arquivos e diretórios:

- `App.tsx` — entrada do app (renderiza `HomeScreen`).
- `index.ts` — registro do root para Expo.
- `src/services/api.ts` — instância do Axios (usa `API_BASE_URL`).
- `src/hooks/usePokemons.ts` — hook custom para fetch/paginação e consolidação dos detalhes dos pokémons.
- `src/screens/Home` — tela principal com `FlatList` e overlay de detalhe.
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