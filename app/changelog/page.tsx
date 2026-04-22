import { NavHeader } from "@/components/NavHeader";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Rocket, Sparkles, Bug, FileText } from "lucide-react";

export const metadata = {
  title: "Notas da Versão | BookManager",
  description: "Acompanhe as últimas novidades e melhorias do BookManager.",
};

const releases = [
  {
    version: "v3.0",
    date: "22 Abril 2026 (Atual)",
    title: "A Grande Evolução: Gamificação & Comunidade",
    description: "Uma transformação completa do BookManager, focada em tornar a leitura uma experiência social, motivadora e multiplataforma.",
    changes: [
      { type: "feature", text: "Migração da infraestrutura de base de dados para Neon (PostgreSQL), garantindo maior velocidade e fiabilidade.", icon: Rocket },
      { type: "feature", text: "Novo Perfil do Utilizador com sistema de Gamificação: Conquistas, Medalhas, Níveis de XP e Recordes Pessoais.", icon: Sparkles },
      { type: "feature", text: "Separador 'Comunidade': Descobre o que outros utilizadores estão a ler e adiciona livros ao teu perfil diretamente.", icon: Rocket },
      { type: "feature", text: "Dashboard totalmente reformulada com métricas avançadas de progresso e visualizações dinâmicas.", icon: FileText },
      { type: "feature", text: "Sistema de Progresso Diário: Regista as tuas páginas lidas dia-a-dia e acompanha o teu histórico.", icon: Sparkles },
      { type: "feature", text: "Temporizador de Sessão de Leitura (Pomodoro) com suporte para entrada manual de tempo (MM:SS).", icon: FileText },
      { type: "feature", text: "Sistemas de Coleções, Autores e Favoritos para uma organização profunda da tua biblioteca.", icon: Rocket },
      { type: "feature", text: "Pesquisa inteligente de livros via API externa e sistema de Importação/Exportação de dados.", icon: Sparkles },
      { type: "feature", text: "Suporte PWA: Instala o BookManager no teu telemóvel ou computador como uma aplicação nativa.", icon: Rocket },
      { type: "feature", text: "Anuário de Leitura: Gera e descarrega um ficheiro PDF detalhado com o resumo das tuas leituras.", icon: FileText },
      { type: "feature", text: "Suporte Offline: Acede aos teus dados básicos mesmo sem ligação à internet.", icon: Sparkles },
      { type: "feature", text: "Sistema de avaliação melhorado (entrada numérica para notas e novas opções de recomendação).", icon: Sparkles },
      { type: "feature", text: "Performance: Introdução de Infinite Scrolling na listagem de livros, suportando bibliotecas de grandes dimensões sem quebras de desempenho.", icon: Rocket },
      { type: "fix", text: "Reformulação do sistema de criação/edição: Autor passa a ser opcional e suporte para múltiplas sessões diárias acumuladas.", icon: Bug }
    ]
  },
  {
    version: "v2.0",
    date: "24 Janeiro 2026",
    title: "Reformulação Visual e Multi-idioma",
    description: "Um salto na acessibilidade e no design, preparando a plataforma para utilizadores de todo o mundo.",
    changes: [
      { type: "feature", text: "Nova Interface Premium: Design totalmente renovado, focado na acessibilidade e estética moderna.", icon: Sparkles },
      { type: "feature", text: "Sistema Multi-idioma: Suporte completo para Português, Inglês, Espanhol e Francês.", icon: Rocket },
      { type: "feature", text: "Modo Escuro e Modo Claro dinâmicos para maior conforto visual.", icon: Sparkles },
      { type: "feature", text: "Melhorias no sistema de leitura: Preview de livros e novos indicadores de início/fim de leitura.", icon: FileText },
      { type: "feature", text: "Identidade Visual: Introdução do logótipo oficial do BookManager e novas estatísticas na dashboard.", icon: Rocket }
    ]
  },
  {
    version: "v1.0",
    date: "Lançamento Inicial",
    title: "O Nascimento do BookManager",
    description: "A base de tudo. O sistema essencial para começares a organizar a tua vida literária.",
    changes: [
      { type: "feature", text: "Sistema de Autenticação completo: Login, Registo e Recuperação de conta.", icon: Rocket },
      { type: "feature", text: "Gestão de Catálogo: Criação, edição e listagem de livros na biblioteca.", icon: FileText },
      { type: "feature", text: "Páginas de Detalhe: Informação completa sobre cada livro adicionado.", icon: Sparkles },
      { type: "feature", text: "Dashboard de Estatísticas: Resumo básico das tuas leituras e catálogo.", icon: Rocket }
    ]
  }
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 lg:px-8 py-16 max-w-4xl">
        <div className="space-y-4 mb-16 text-center">
          <Badge variant="secondary" className="px-4 py-1.5 text-sm rounded-full bg-primary/10 text-primary hover:bg-primary/15 transition-colors border-0">
            Atualizações
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Notas da Versão</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Acompanha as mais recentes novidades, melhorias e correções no BookManager.
            Estamos constantemente a trabalhar para tornar a tua experiência ainda melhor.
          </p>
        </div>

        <div className="relative border-l border-border/50 ml-3 md:ml-6 space-y-16 pb-12">
          {releases.map((release, index) => (
            <div key={release.version} className="relative pl-8 md:pl-12">
              {/* Timeline Dot */}
              <div className="absolute -left-3 md:-left-3.5 top-1.5 h-6 w-6 rounded-full bg-background border-4 border-primary/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-4">
                <h2 className="text-2xl font-bold">{release.version}</h2>
                <span className="text-sm font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-md w-fit">
                  {release.date}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{release.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {release.description}
              </p>
              
              <ul className="space-y-4">
                {release.changes.map((change, i) => {
                  const Icon = change.icon;
                  const isFix = change.type === "fix";
                  return (
                    <li key={i} className="flex gap-4 p-4 rounded-xl border border-border/40 bg-card/50 hover:bg-muted/30 transition-colors">
                      <div className={`mt-0.5 p-2 rounded-lg shrink-0 h-fit ${isFix ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm md:text-base leading-relaxed text-card-foreground">
                        {change.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
