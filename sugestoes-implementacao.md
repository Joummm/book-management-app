# 📚 BookManager — Sugestões Completas de Implementação

> Documento vivo com todas as ideias e funcionalidades a considerar para o projeto.
> Organizado por categorias e prioridade estimada. Atualizado em: Abril 2026.

---

## Índice

1. [📊 Dashboard & Estatísticas](#1-dashboard--estatísticas)
2. [📖 Gestão de Livros](#2-gestão-de-livros)
3. [🗃️ Coleções & Organização](#3-coleções--organização)
4. [👤 Perfil & Gamificação](#4-perfil--gamificação)
5. [🌐 Integrações & APIs Externas](#5-integrações--apis-externas)
6. [📱 PWA & Mobile Experience](#6-pwa--mobile-experience)
7. [🎨 UI/UX & Design](#7-uiux--design)
8. [🔍 Pesquisa & Filtros Avançados](#8-pesquisa--filtros-avançados)
9. [👥 Social & Comunidade](#9-social--comunidade)
10. [🔔 Notificações & Lembretes](#10-notificações--lembretes)
11. [📥 Import / Export](#11-import--export)
12. [⚙️ Settings & Personalização](#12-settings--personalização)
13. [🔐 Segurança & Privacidade](#13-segurança--privacidade)
14. [🚀 Performance & Infraestrutura](#14-performance--infraestrutura)
15. [🤖 Inteligência Artificial](#15-inteligência-artificial)

---

## 1. 📊 Dashboard & Estatísticas

### Métricas Principais
- **Metas de Leitura Anuais:** Campo para definir "Quero ler X livros / Y páginas em 2026" com barra de progresso animada estilo Goodreads.
- **Streak de Leitura:** Contador de dias consecutivos a registar progresso (ex: "🔥 12 dias seguidos!"), com histórico de melhor streak.
- **Velocidade de Leitura:** Média de páginas/hora e dias por livro, calculada a partir das datas de início/fim e número de páginas.
- **Previsão de Conclusão:** Para o livro atualmente a ler, calcular com base na velocidade média a data prevista de conclusão.
- **Horas Estimadas de Leitura:** Converter páginas lidas em horas estimadas (usando uma média de 250 palavras/página e 200 palavras/minuto).
- **Livro Mais Longo vs. Mais Curto:** Destacar recordes pessoais de leitura no dashboard.
- **Taxa de Conclusão:** Percentagem de livros iniciados que são efetivamente concluídos.
- **Autor Mais Lido:** Ranking dos 5 autores com mais livros lidos.
- **Género Dominante:** Gráfico de pizza ou donut com a distribuição de géneros da biblioteca.
- **Mês mais produtivo:** Destaque do mês com mais páginas/livros lidos no ano.

### Gráficos
- **Gráfico de Páginas por Mês:** Gráfico de área (Recharts AreaChart) mostrando evolução ao longo do ano, com tooltip detalhado por dia.
- **Heatmap de Atividade (GitHub-style):** Calendário anual com "quadradinhos" coloridos por intensidade de leitura diária.
- **Gráfico de Ratings:** Distribuição das estrelas dadas (1 a 5) em barras horizontais.
- **Timeline de Leitura:** Linha do tempo visual com todos os livros lidos, ordenados cronologicamente com capa e rating.
- **Mapa de Autores por Nacionalidade:** Mapa-múndi interativo com pins nos países de origem dos autores lidos.
- **Comparativo Anual:** Gráfico de barras agrupadas comparando o ano atual vs. anos anteriores.
- **Tendências Semanais:** Mini gráfico de sparkline nas KPI cards para ver a tendência das últimas 4 semanas.

---

## 2. 📖 Gestão de Livros

### Campos Novos no Livro
- **ISBN:** Campo para guardar o ISBN-10/13 do livro (útil para pesquisas em APIs externas).
- **Língua Original:** Idioma original do livro e, se aplicável, idioma da edição lida.
- **Tradutores:** Campo para registar o nome do tradutor(es).
- **Série/Saga:** Associar um livro a uma série (ex: "O Senhor dos Anéis - Livro 1") e mostrar todos os volumes da saga na ficha do livro.
- **Edição:** Campo para a edição específica (1ª edição, edição especial, etc.).
- **Localização Física:** Para livros físicos, saber em que prateleira/sala está guardado o livro.
- **Preço Pago:** Opcional, para calcular o "custo por hora" de leitura ou investimento total em livros.
- **Notas Privadas:** Campo de notas livres separado da review pública, para apontamentos pessoais.
- **Estado de Aquisição:** "Tenho", "Wishlist", "Emprestado a...", "Emprestado de...", "Perdido", "Vendido".
- **Data de Aquisição:** Quando o livro foi comprado/recebido.
- **Fonte de Aquisição:** Onde foi comprado (Livraria X, Amazon, Wook, Sebenta, Offer, etc.).
- **Capítulos:** Campo para registar o número total de capítulos e o capítulo atual (alternativa ao tracking por páginas).

### UX de Adicionar/Editar Livros
- **Wizard de Adição em Múltiplos Passos:** Dividir o formulário de adição em 3 passos: (1) Info básica, (2) Detalhes de leitura, (3) Review e extras.
- **Scan de Código de Barras (PWA):** Usar a câmara do telemóvel para ler o ISBN e preencher automaticamente via API.
- **Duplicados Automáticos:** Detetar e alertar se o utilizador está a adicionar um livro que já existe na biblioteca.
- **Capa por URL:** Além de upload, permitir colar diretamente uma URL de imagem de capa.
- **Preview em Tempo Real:** Ao preencher o formulário, mostrar um card preview do livro ao lado.
- **Templates de Livro:** Guardar templates pré-preenchidos (ex: template "Manga" com formato digital, género manga, etc.).

### Vistas da Biblioteca
- **Vista em Grade (Grid):** Cards com capa em destaque — já existente.
- **Vista em Lista (List):** Linha compacta com título, autor, rating e status — modo denso.
- **Vista em Prateleira (Bookshelf):** Render visual de livros "em pé" como numa estante real, com as capas exibidas de lado como lombadas.
- **Vista Timeline:** Cronologia visual baseada nas datas de leitura.
- **Modo Foco:** Mostrar apenas o livro atual a ler em fullscreen com capa grande e progresso.

---

## 3. 🗃️ Coleções & Organização

- **Coleções Inteligentes (Smart Lists):** Coleções dinâmicas geradas por regras, ex: "Livros 5⭐ não relidos", "Lidos em 2026", "Mais de 500 páginas".
- **Drag & Drop entre Coleções:** Arrastar um livro de uma coleção para outra visualmente.
- **Coleções com Capa Personalizada:** Escolher uma capa/cor/emoji para cada coleção.
- **Coleções Colaborativas:** Partilhar uma coleção com outros utilizadores para lerem juntos (Book Club).
- **Ordem Personalizada:** Arrastar e reordenar os livros dentro de uma coleção manualmente (drag-and-drop).
- **Sub-coleções:** Suporte a coleções dentro de coleções (ex: "Ficção Científica > Clássicos").
- **Tags/Etiquetas:** Sistema de tags livres para organização transversal (independente de coleções).
- **Séries Automáticas:** Agrupar livros da mesma saga automaticamente e mostrar progresso na série.
- **Wishlist Dedicada:** Separador ou coleção especial "Quero Ler" com prioridade e preço estimado.

---

## 4. 👤 Perfil & Gamificação

### Perfil
- **Avatar Personalizado:** Upload de foto de perfil ou seleção de avatar gerado por IA.
- **Bio do Leitor:** Campo de bio curta visível no perfil público.
- **Género Favorito:** Tag automática gerada com base nos géneros mais lidos.
- **Livro Favorito de Sempre:** Destaque especial de 1 livro no perfil.
- **Estatísticas de Topo:** Mostrar "X livros lidos em Y anos" no perfil.
- **Histórico de Atividade:** Feed de atividade (adicionou livro, completou livro, fez review...).

### Gamificação & Conquistas
- **Sistema de Conquistas/Badges:** Medalhas desbloqueáveis por marcos de leitura:
  - 🥇 "Primeiro Livro" — leu o primeiro livro
  - 📚 "Devorador" — 10, 25, 50, 100 livros lidos
  - ⚡ "Relâmpago" — leu um livro em menos de 2 dias
  - 🌍 "Viajante" — leu autores de 10 países diferentes
  - ⭐ "Crítico Literário" — fez 20 reviews completas
  - 🔥 "Constante" — streak de 30 dias
  - 📖 "Maratonista" — leu um livro com mais de 800 páginas
  - 🌙 "Leitor Noturno" — registou sessão após meia-noite
- **Nível de Leitor:** Sistema de XP baseado em páginas lidas, reviews escritas e streaks.
- **Leaderboard Pessoal:** Comparar ano atual vs. anos anteriores gamificado.

---

## 5. 🌐 Integrações & APIs Externas

- **Google Books API:** Autocompletar titulo/autor, e preencher automaticamente capa, sinopse, editora, nº páginas, ISBN, géneros.
- **Open Library API:** Alternativa open-source ao Google Books para dados de livros.
- **WorldCat API:** Para encontrar edições específicas e detalhes bibliográficos avançados.
- **Goodreads Import:** Importar CSV do Goodreads (histórico de leitura completo para novos utilizadores).
- **StoryGraph Import:** Importar dados da plataforma StoryGraph.
- **Amazon / Wook Links:** Associar link de compra rápida ao livro.
- **Spotify/Deezer API:** Sugestão de playlists para acompanhar a leitura do livro (baseado no género/humor do livro).
- **Biblioteca Pública (OpenLibrary):** Verificar se o livro está disponível na biblioteca pública mais próxima.
- **Webhooks / Zapier:** Possibilidade de integrar com ferramentas externas via webhook (ex: notificar Discord quando termina um livro).
- **IFTTT / Make.com:** Triggers automáticos baseados em eventos da app.

---

## 6. 📱 PWA & Mobile Experience

- **Install Prompt Personalizado:** Banner personalizado "Instala o BookManager no teu telemóvel" com animação apelativa.
- **Offline-First Completo:** Cache de todos os livros no IndexedDB (já iniciado com `idb.ts`) com sincronização automática quando online.
- **Sync em Background (Background Sync API):** Registar sessões de leitura offline e sincronizar automaticamente quando voltar a ter internet.
- **Push Notifications (Web Push API):** Notificações push para lembretes de leitura diária mesmo com a app fechada.
- **Shortcut no Home Screen (Shortcuts API):** Atalhos na app instalada (ex: "Registar Sessão" direto do ícone).
- **Badging API:** Mostrar número de livros não concluídos como badge no ícone da app instalada.
- **Share Target (Web Share Target):** Permitir partilhar links de livros diretamente para o BookManager a partir do browser.
- **Gestos de Swipe:** Deslizar para a esquerda/direita num card para ações rápidas (ex: swipe right = marcar como favorito, swipe left = adicionar nota).
- **Vibração Haptica:** Feedback táctil (vibração) nas interações rápidas (marcar como lido, adicionar à wishlist).
- **File System Access API:** Exportar/importar backup JSON/CSV diretamente para/do sistema de ficheiros do dispositivo.

---

## 7. 🎨 UI/UX & Design

### Animações & Transições
- **Page Transitions:** Transições suaves entre páginas usando Framer Motion (já disponível no projeto).
- **Book Flip Animation:** Animação de virar página ao marcar um livro como concluído.
- **Card Hover 3D:** Efeito de perspetiva 3D suave nos BookCards ao fazer hover (transform perspective).
- **Celebração ao Concluir um Livro:** Animação de confetti (usando `canvas-confetti`) ao marcar um livro como lido.
- **Skeleton Loaders:** Substituir spinners por skeletons realistas com a forma exata dos cards.
- **Stagger Animations:** Cards a aparecer sequencialmente com delay em cascata ao carregar a lista.
- **Parallax na Capa:** Efeito parallax suave na capa do livro ao fazer scroll na página de detalhe.

### Temas & Aparência
- **Dark Mode OLED (Pitch Black):** Opção para fundo 100% preto puro em dispositivos OLED.
- **Temas de Cor Personalizados:** Paletas de cores selecionáveis pelo utilizador (ex: Midnight Blue, Forest Green, Warm Amber, Rose Gold).
- **Color Extraction da Capa:** Ao abrir o detalhe do livro, extrair a cor dominante da capa e aplicar como gradiente de fundo (similar ao Apple Music).
- **Fonte Personalizável:** Opção de alternar entre 3-4 fontes (Outfit, Inter, Merriweather, Georgia) nas preferências.
- **Modo de Alto Contraste (Acessibilidade):** Tema com contraste máximo para utilizadores com baixa visão.
- **Densidade do Layout:** Opção Compacto / Normal / Espaçado para a densidade dos cards.
- **Custom CSS (Power Users):** Campo de CSS personalizado nas settings para tweaks avançados.

### Componentes Novos
- **Command Palette (⌘K):** Atalho de teclado global para pesquisar livros, navegar entre páginas, executar ações.
- **Book Spine View:** Vista de prateleira onde as lombadas são geradas proceduralmente (cor + título + autor).
- **Reading Timer:** Timer Pomodoro integrado para sessões de leitura cronometradas.
- **Quick Add Float Button:** Botão flutuante (FAB) no mobile para adicionar livro rapidamente.
- **Tooltips Ricos:** Tooltips com preview do livro ao passar o rato sobre títulos em listas.

---

## 8. 🔍 Pesquisa & Filtros Avançados

- **Full-Text Search (Postgres FTS):** Pesquisa por palavras dentro de reviews e sinopses usando `tsvector` + `tsquery`.
- **Filtros Combinados com AND/OR:** Interface avançada para combinar múltiplos filtros com lógica booleana.
- **Filtro por Intervalo de Datas:** Selecionar período de leitura com date range picker.
- **Filtro por Rating:** Slider de 1 a 5 estrelas para filtrar por nota dada.
- **Filtro por Número de Páginas:** Range slider de páginas (ex: 100–500 páginas).
- **Filtro por Formato:** Físico vs. Digital.
- **Filtro por Língua:** Filtrar por idioma do livro.
- **Filtro por Série:** Mostrar todos os livros de uma saga.
- **Filtro por Lido/Relido:** Distinguir primeira leitura de releituras.
- **Ordenação Avançada:** Ordenar por título, autor, data de leitura, rating, nº páginas, data de adição.
- **Busca Fonética:** Encontrar livros mesmo com erros de ortografia no título/autor (usando algoritmos de similaridade).
- **Histórico de Pesquisas:** Guardar as últimas pesquisas realizadas com acesso rápido.
- **Filtros Guardados:** Salvar combinações de filtros favoritas para acesso futuro.

---

## 9. 👥 Social & Comunidade

- **Perfil Público Partilhável:** Página pública com URL `bookmanager.app/u/[username]` com biblioteca e estatísticas do leitor.
- **Seguir Outros Leitores:** Sistema de follows para ver o que os amigos estão a ler.
- **Feed de Atividade Social:** Timeline com atividade recente dos leitores que segues.
- **Book Clubs:** Grupos privados ou públicos para leitura coletiva de um livro com discussão integrada.
- **Challenges de Leitura:** Desafios mensais/anuais públicos (ex: "Lê 1 livro de um autor português em Maio").
- **Reviews Públicas:** Opção de tornar a review de um livro pública para outros leitores lerem.
- **Likes e Comentários em Reviews:** Interação social com as reviews de outros.
- **Recomendações Mútuas:** "O João recomendou-te este livro" com mensagem personalizada.
- **Leaderboard da Comunidade:** Ranking de leitores mais ativos do mês (opcional/opt-in).
- **Partilha para Redes Sociais:** Gerar imagem bonita (Open Graph / Stories format) para partilhar milestone de leitura no Instagram/Twitter.

---

## 10. 🔔 Notificações & Lembretes

- **Lembrete de Leitura Diária:** Notificação push configurável (ex: "Ainda não registaste a tua leitura de hoje! 📖").
- **Lembrete de Meta Semanal:** Alerta quando estás em risco de não atingir a meta semanal de leitura.
- **Notificação de Novo Livro do Autor Favorito:** Alerta quando um autor que segues lança um novo livro (via Google Books API).
- **Anniversário de Leitura:** "Há exatamente 1 ano concluíste [Livro X]! Que tal reler?" 
- **Lembrete de Devolução:** Se emprestaste um livro, alerta na data de devolução esperada.
- **Resumo Semanal por Email:** Email automático semanal com o resumo da semana (páginas lidas, livros concluídos, progresso da meta).
- **Relatório Mensal:** Email/notificação mensal com estatísticas detalhadas de leitura.
- **Alerta de Streak em Perigo:** "⚠️ Tens até às 23h59 para manter o teu streak de 7 dias!"

---

## 11. 📥 Import / Export

- **Export para CSV:** Exportar toda a biblioteca para CSV compatível com Excel/Google Sheets.
- **Export para JSON:** Backup completo da biblioteca em JSON estruturado.
- **Export para PDF:** Gerar um PDF estilizado com a lista de livros lidos (tipo anuário de leitura).
- **Export para Markdown:** Lista de livros em Markdown para usar em blogs/Notion/Obsidian.
- **Import de Goodreads CSV:** Importar histórico do Goodreads (título, autor, status, rating, dates).
- **Import de StoryGraph CSV:** Importar histórico do StoryGraph.
- **Import de LibraryThing:** Importar de outro gestor de biblioteca popular.
- **Backup Automático:** Backup automático semanal para Google Drive ou Dropbox via OAuth.
- **QR Code de Perfil:** Gerar QR code que abre o perfil público do utilizador (para trocar com amigos).
- **Relatório Anual (Year in Books):** Página especial gerada no final do ano tipo Spotify Wrapped para leitores, com estatísticas anuais e designs partilháveis.

---

## 12. ⚙️ Settings & Personalização

- **Idioma da Interface:** Suporte multilingue completo (PT, EN, ES, FR) — ficheiro `i18n.ts` já existe no projeto.
- **Formato de Datas:** Configurar formato preferido de data (DD/MM/YYYY, MM/DD/YYYY, etc.).
- **Primeiro Dia da Semana:** Segunda-feira vs. Domingo como início da semana nas vistas de calendário.
- **Unidade de Progresso Padrão:** Páginas vs. Capítulos vs. Percentagem.
- **Velocidade de Leitura Pessoal:** Campo para o utilizador inserir a sua velocidade média (para cálculos mais precisos de previsão).
- **Privacidade da Biblioteca:** Pública / Apenas seguidores / Privada.
- **Notificações Configuráveis:** Toggle individual para cada tipo de notificação.
- **Hora do Lembrete Diário:** Picker de hora para o lembrete de leitura.
- **Conta Multi-Perfil:** Suporte a múltiplos perfis na mesma conta (ex: perfil pessoal + perfil dos filhos).
- **Zona Horária:** Definir timezone para cálculos de streak corretos.
- **Integração com Calendário:** Exportar sessões de leitura para Google Calendar / iCal.
- **Modo de Foco (Sem Distrações):** Interface minimalista apenas com o livro atual e o timer.

---

## 13. 🔐 Segurança & Privacidade

- **Autenticação em 2 Passos (2FA):** TOTP via Google Authenticator ou Authy.
- **Login com Passkey (WebAuthn):** Autenticação biométrica sem password (impressão digital, Face ID).
- **OAuth Social Login:** Login com Google / GitHub / Apple além do email/password.
- **Histórico de Sessões:** Ver todos os dispositivos onde a conta está ativa e terminar sessões remotamente.
- **Exportar Dados (GDPR):** Botão para exportar todos os dados pessoais em formato JSON.
- **Eliminar Conta (GDPR):** Processo de eliminação completa da conta e todos os dados associados.
- **Log de Atividade de Segurança:** Registo de logins, alterações de password e eventos de segurança.
- **Modo Privado Temporário:** Ocultar a biblioteca durante uma sessão sem terminar sessão.
- **Encriptação de Notas Privadas:** Encriptar as notas privadas no lado do cliente antes de enviar para o servidor.

---

## 14. 🚀 Performance & Infraestrutura

- **Image Optimization (WebP):** Converter capas carregadas para WebP e servir via `<Image>` do Next.js com lazy loading.
- **Edge Caching (Vercel Edge):** Configurar cache headers nas rotas API para reduzir latência.
- **Database Connection Pooling:** Usar PgBouncer ou Supabase connection pooler para gerir melhor as conexões ao Neon.
- **Postgres Full-Text Search:** Migrar pesquisa de `LIKE %...%` para `tsvector` + `tsquery` para pesquisas muito mais rápidas em bibliotecas grandes.
- **Paginação por Cursor (Cursor-based Pagination):** Substituir paginação por offset por cursor-based para performance consistente em listas grandes.
- **TanStack Virtual (já parcialmente implementado):** Garantir virtualização ativa em todas as listas longas (livros, autores, reviews).
- **React Query / TanStack Query:** Adicionar cache e stale-while-revalidate para dados do servidor, eliminando refetches desnecessários.
- **Optimistic Updates:** Atualizar a UI imediatamente na interface antes da resposta do servidor para sensação de velocidade.
- **Rate Limiting:** Implementar rate limiting nas rotas API para evitar abusos.
- **Monitoring & Logging:** Integrar Sentry para monitorização de erros em produção + logs estruturados.
- **Analytics de Performance (Core Web Vitals):** Dashboard interno de LCP, FID, CLS via `@vercel/analytics` (já instalado).
- **Sitemap & Robots.txt:** Configurar sitemap dinâmico para SEO de perfis públicos.

---

## 15. 🤖 Inteligência Artificial

- **Recomendações Personalizadas por IA:** Sugerir livros com base nos géneros, autores e ratings do utilizador (usando embedding + similaridade).
- **Análise de Sentimento da Review:** IA a analisar o texto da review e sugerir um rating baseado no sentimento.
- **Resumo Automático de Livro:** Gerar automaticamente um resumo do livro via Google Gemini API quando o livro é adicionado.
- **Completar Ficha com IA:** Botão "Preencher com IA" que usa o título e autor para preencher todos os campos em falta.
- **Sugestão de Géneros:** IA a sugerir géneros com base na sinopse do livro.
- **Chat com a Biblioteca:** Interface de chat onde podes fazer perguntas do tipo "Que livros de ficção científica li em 2025?" ou "Qual o meu autor mais lido?".
- **Geração de Reading Plan:** IA a criar um plano de leitura personalizado para atingir a meta anual, distribuindo os livros da wishlist ao longo dos meses.
- **Análise de Padrões:** IA a identificar padrões de leitura (ex: "Lês mais ao fim de semana", "A tua velocidade cai em Dezembro").
- **Comparação com Outros Leitores:** "Leitores com gostos semelhantes aos teus adoraram este livro" (collaborative filtering).
- **Narração de Estatísticas:** IA a gerar um parágrafo narrativo mensal (ex: "Em Março, leste 3 livros e registaste 847 páginas, o teu melhor mês desde Setembro de 2025...").
- **Extração de Citações Automática:** IA a sugerir as melhores citações de um livro com base nos highlights mais populares online.
- **Mood Reading:** Sugestão de livro baseado no estado de espírito do utilizador (selecionado via emoji/mood picker).

---

## 🏷️ Quick Wins (Fácil de implementar, alto impacto)

> Ideias que podem ser implementadas rapidamente com o stack atual.

| Feature | Esforço | Impacto |
|---|---|---|
| Confetti ao concluir um livro | ⭐ | ⭐⭐⭐ |
| Skeleton loaders nas listas | ⭐ | ⭐⭐⭐ |
| Command Palette (⌘K) com cmdk (já instalado) | ⭐⭐ | ⭐⭐⭐ |
| Heatmap de atividade anual | ⭐⭐ | ⭐⭐⭐ |
| Export para CSV | ⭐ | ⭐⭐⭐ |
| Streak de leitura diária | ⭐⭐ | ⭐⭐⭐ |
| Color Extraction da capa | ⭐⭐ | ⭐⭐⭐ |
| Reading Timer / Pomodoro | ⭐⭐ | ⭐⭐ |
| Vista de Prateleira (Bookshelf) | ⭐⭐⭐ | ⭐⭐⭐ |
| Scan de ISBN pela câmara | ⭐⭐⭐ | ⭐⭐⭐ |
| Badges/Conquistas de leitura | ⭐⭐⭐ | ⭐⭐⭐ |
| Resumo anual "Year in Books" | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Push Notifications de lembrete | ⭐⭐ | ⭐⭐⭐ |
| Filtros guardados | ⭐ | ⭐⭐ |
| Tooltips ricos nos cards | ⭐ | ⭐⭐ |
| Campo ISBN + barcode lookup | ⭐⭐ | ⭐⭐⭐ |
| Login com Google (OAuth) | ⭐⭐ | ⭐⭐⭐ |
| Tags livres nos livros | ⭐⭐ | ⭐⭐⭐ |
| Relatório mensal por email | ⭐⭐⭐ | ⭐⭐⭐ |
| Modo foco / reading mode | ⭐⭐ | ⭐⭐ |

---

*Documento gerado em Abril 2026. Atualizar à medida que as funcionalidades são implementadas.*
