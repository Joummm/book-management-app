# 🚀 Sugestões e Roadmap para o BookManager

Aqui estão algumas sugestões e ideias de features que podem levar o BookManager para o próximo nível, organizadas por categorias:

## 1. 📊 Análise e Estatísticas Avançadas (Dashboard)
- **Metas de Leitura Anuais:** Permitir ao utilizador definir "Quero ler X livros / Y páginas em 2026" e mostrar uma barra de progresso no dashboard estilo Goodreads.
- **Gráfico de Velocidade de Leitura:** Mostrar a média de dias que o utilizador demora a ler um livro (cruzando *data de início* e *data de conclusão* com o *número de páginas*).
- **Mapa Mundo de Autores:** Um pequeno mapa interativo no Dashboard a mostrar a nacionalidade dos autores mais lidos.
- **Páginas Lidas por Mês:** Um gráfico em área por baixo do gráfico anual, detalhando os meses mais produtivos do ano atual.

## 2. 🗃️ Feature "Organização" (Coleções e Listas)
- **Coleções Inteligentes (Smart Lists):** Coleções geradas através de filtros dinâmicos, por exemplo: "Todos os livros 5 estrelas", "Livros com mais de 500 páginas lidos este ano", "Livros começados mas não terminados".
- **Wishlist Integrada:** Adicionar um campo na base de dados (e um ícone na interface) para distinguir livros lidos/na biblioteca dos livros *"Quero Comprar / Wishlist"*.
- **Empréstimos de Livros:** Um pequeno sistema para registar: "Emprestei o livro X ao amigo Y no dia Z".

## 3. 🌐 Integrações e APIs (Importação de Dados)
- **Integração com Google Books API ou OpenLibrary:** Quando o utilizador vai adicionar um livro e digita o Título + Autor, a app pesquisa na API e preenche automaticamente a Capa, Sinopse, Editora, Nº Páginas e Gêneros.
- **Importação Goodreads / StoryGraph:** Permitir importar o ficheiro CSV dessas plataformas para que novos utilizadores tragam o histórico facilmente.

## 4. 🎨 Design & UI Sensorial (App Mobile Feel)
- **Deteção Automática de Cores da Capa (Color Extraction):** Ao abrir um detalhe de um livro, o fundo/cabeçalho adota um gradiente suave baseado na cor predominante da capa do livro.
- **Infinite Scrolling ou Virtualization na página de Livros:** Substituir a paginação simples por Infinite Scroll usando a lib TanStack Virtual se a biblioteca ficar gigante (com 500+ livros).
- **Dark Mode Avançado (OLED Mode):** No tema escuro, opção para alternar entre "Dark Navy" e "Pitch Black" puro para dispositivos OLED.

## 5. 👥 Feature Social e de Descoberta
- **Quotes (Citações):** Extrair as citações (`quotes`) da ficha do livro e criar uma página/aba separada apenas para explorar e guardar as melhores frases no formato "cartão".
- **Partilha Perfil Público (Opcional):** Opção de tornar o link de perfil/biblioteca público para enviar amigos (um link de leitura tipo `bookmanager.app/u/joao-nunes`).

## 6. ⚙️ Technical Debt & Performance
- **Image Optimization:** Em vez de usar as imagens originais que os utilizadores fazem upload ou enviam em base64 (se for o caso), convertê-las para `WebP` no servidor/cloudflare e mostrá-las geridas pelo componente `<Image>` nativo do Next.js.
- **Offline Support (PWA - Progressive Web App):** Configurar o manifest do next para que a app possa ser *"instalável"* no telemóvel e guardar uma cache local dos livros usando `IndexedDB`.
- **Pesquisa Full-Text:** Mudar o `LIKE %...%` padrão para Postgres Full-Text Search (ou integrar ttsvector) para poder procurar palavras no meio das revies ou descrições dos livros de forma ultra rápida.

---
*Podes consultar este ficheiro diretamente no projeto.*
