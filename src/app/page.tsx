import Image from "next/image";

const modules = [
  {
    number: "01",
    title: "Base e Postura",
    description:
      "O alicerce do Jiu-Jitsu. Aprenda postura correta em pé e no chão, distribuição de peso e proteção corporal.",
  },
  {
    number: "02",
    title: "Movimentação Corporal",
    description:
      "Ponte, fuga de quadril, giro, levantada técnica e ajustes de base. Os movimentos essenciais para defesas e escapes.",
  },
  {
    number: "03",
    title: "Hierarquia das Posições",
    description:
      "Costas, montada, controle lateral, passagem de guarda. Entenda a ordem de dominância e como progredir.",
  },
  {
    number: "04",
    title: "Guarda: Conceito e Função",
    description:
      "Transforme a posição inferior em ataque. Guarda fechada e aberta, controle de distância e criação de oportunidades.",
  },
  {
    number: "05",
    title: "Raspagens Básicas",
    description:
      "Inverta posições com técnica. Raspagem de tesoura, gancho e os princípios de desequilíbrio e timing.",
  },
  {
    number: "06",
    title: "Finalizações Fundamentais",
    description:
      "Mata-leão, americana, armlock e triângulo. As submissões essenciais com controle e posicionamento.",
  },
  {
    number: "07",
    title: "Defesa e Sobrevivência",
    description:
      "Proteção de pescoço, fechamento de espaço, defesa de braços e inteligência para saber quando resistir ou reposicionar.",
  },
  {
    number: "08",
    title: "Respiração e Controle Emocional",
    description:
      "Controle a pressão com respiração, calma e economia de energia. Transforme o combate em jogo de inteligência.",
  },
  {
    number: "09",
    title: "Conduta e Mentalidade",
    description:
      "Respeito, constância, humildade e disciplina. Os valores que aceleram sua evolução no Jiu-Jitsu.",
  },
];

const plans = [
  {
    name: "Iniciante",
    price: "97",
    period: "/mês",
    features: [
      "Acesso aos módulos 1-4",
      "Vídeos em HD",
      "Material de apoio em PDF",
      "Suporte via WhatsApp",
    ],
    featured: false,
  },
  {
    name: "Completo",
    price: "197",
    period: "/mês",
    features: [
      "Todos os 9 módulos",
      "Vídeos em HD",
      "Material de apoio em PDF",
      "Suporte prioritário",
      "Aulas ao vivo semanais",
      "Comunidade exclusiva",
    ],
    featured: true,
  },
  {
    name: "Presencial + Online",
    price: "297",
    period: "/mês",
    features: [
      "Acesso completo online",
      "Aulas presenciais 3x/semana",
      "Acompanhamento individual",
      "Suporte VIP",
      "Acesso vitalício ao conteúdo",
    ],
    featured: false,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-dark/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <a href="#" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Zelo BJJ" width={48} height={48} />
            <span className="text-xl font-bold tracking-wide text-white">
              ZELO <span className="text-gold">BJJ</span>
            </span>
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#sobre" className="text-sm text-gray-text transition-colors hover:text-gold">
              Sobre
            </a>
            <a href="#modulos" className="text-sm text-gray-text transition-colors hover:text-gold">
              Módulos
            </a>
            <a href="#planos" className="text-sm text-gray-text transition-colors hover:text-gold">
              Planos
            </a>
            <a href="#contato" className="text-sm text-gray-text transition-colors hover:text-gold">
              Contato
            </a>
          </nav>
          <a
            href="https://wa.me/5518981328589?text=Olá! Tenho interesse nos cursos da Zelo BJJ"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-dark transition-colors hover:bg-gold-light"
          >
            Fale Conosco
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-gradient relative flex min-h-screen items-center justify-center px-6 pt-20">
        <div className="mx-auto max-w-5xl text-center">
          <Image
            src="/logo.png"
            alt="Zelo BJJ"
            width={160}
            height={160}
            className="mx-auto mb-8"
            priority
          />
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Domine o <span className="gradient-gold">Jiu-Jitsu Brasileiro</span>
            <br />
            com quem entende de verdade
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-text md:text-xl">
            Cursos online completos, do fundamento à técnica avançada. Aprenda no seu ritmo com
            metodologia comprovada e suporte de instrutores experientes.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#planos"
              className="w-full rounded-full bg-gold px-8 py-4 text-lg font-bold text-dark transition-colors hover:bg-gold-light sm:w-auto"
            >
              Comece Agora
            </a>
            <a
              href="#modulos"
              className="w-full rounded-full border border-white/20 px-8 py-4 text-lg font-semibold text-white transition-colors hover:border-gold hover:text-gold sm:w-auto"
            >
              Ver Conteúdo
            </a>
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                O que é a <span className="gradient-gold">Zelo BJJ</span>?
              </h2>
              <p className="mb-4 text-gray-text leading-relaxed">
                O Jiu-Jitsu Brasileiro é uma arte marcial, esporte e sistema de defesa pessoal
                baseado em princípios técnicos e estratégicos. Na Zelo BJJ, ensinamos os fundamentos
                essenciais que todo praticante precisa desenvolver para construir uma base sólida e
                evoluir com segurança e eficiência.
              </p>
              <p className="mb-4 text-gray-text leading-relaxed">
                Alunos que dominam os fundamentos evoluem de forma mais consistente, independentemente
                de seus objetivos &mdash; recreativos, competitivos ou de defesa pessoal.
              </p>
              <p className="text-gray-text leading-relaxed">
                O verdadeiro progresso no Jiu-Jitsu é construído no longo prazo, com paciência e
                dedicação aos princípios básicos.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "9", label: "Módulos Completos" },
                { value: "50+", label: "Técnicas Ensinadas" },
                { value: "HD", label: "Vídeos Detalhados" },
                { value: "24/7", label: "Acesso ao Conteúdo" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-dark-lighter p-6 text-center"
                >
                  <div className="mb-2 text-3xl font-bold text-gold">{stat.value}</div>
                  <div className="text-sm text-gray-text">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modulos */}
      <section id="modulos" className="bg-dark-light px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Conteúdo do <span className="gradient-gold">Curso</span>
            </h2>
            <p className="mx-auto max-w-xl text-gray-text">
              9 módulos completos cobrindo todos os fundamentos básicos do Jiu-Jitsu Brasileiro.
              Do conceito de base até a mentalidade do lutador.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => (
              <div
                key={mod.number}
                className="card-hover rounded-2xl border border-white/5 bg-dark-lighter p-6"
              >
                <span className="mb-3 inline-block text-sm font-bold text-gold">
                  MÓDULO {mod.number}
                </span>
                <h3 className="mb-3 text-xl font-bold text-white">{mod.title}</h3>
                <p className="text-sm leading-relaxed text-gray-text">{mod.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principios */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Princípios <span className="gradient-gold">Fundamentais</span>
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Posição antes da Finalização",
                desc: "Sem controle posicional, tentativas de finalização falham e expõem você. Domine a posição primeiro.",
              },
              {
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Técnica sobre Força",
                desc: "Jiu-Jitsu eficiente é economia de energia. Técnica bem aplicada requer pouca força.",
              },
              {
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Constância e Paciência",
                desc: "Melhor treinar 3x por semana com consistência do que 6x em uma semana e faltar um mês.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold">
                  {item.icon}
                </div>
                <h3 className="mb-3 text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-gray-text leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="bg-dark-light px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Escolha seu <span className="gradient-gold">Plano</span>
            </h2>
            <p className="mx-auto max-w-xl text-gray-text">
              Invista na sua evolução. Todos os planos incluem acesso imediato ao conteúdo.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`card-hover relative rounded-2xl border p-8 ${
                  plan.featured
                    ? "border-gold bg-dark-lighter"
                    : "border-white/5 bg-dark-lighter"
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-bold text-dark">
                    MAIS POPULAR
                  </span>
                )}
                <h3 className="mb-2 text-xl font-bold">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-sm text-gray-text">R$</span>
                  <span className="text-4xl font-extrabold text-gold">{plan.price}</span>
                  <span className="text-sm text-gray-text">{plan.period}</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-text">
                      <svg
                        className="h-4 w-4 shrink-0 text-gold"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href={`https://wa.me/5518981328589?text=Olá! Tenho interesse no plano ${plan.name} da Zelo BJJ`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full rounded-full py-3 text-center font-semibold transition-colors ${
                    plan.featured
                      ? "bg-gold text-dark hover:bg-gold-light"
                      : "border border-white/20 text-white hover:border-gold hover:text-gold"
                  }`}
                >
                  Assinar Agora
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Pronto para <span className="gradient-gold">começar</span>?
          </h2>
          <p className="mb-10 text-gray-text">
            Entre em contato pelo WhatsApp e tire todas as suas dúvidas. Nossa equipe está pronta
            para ajudar você a iniciar sua jornada no Jiu-Jitsu.
          </p>
          <a
            href="https://wa.me/5518981328589?text=Olá! Quero saber mais sobre a Zelo BJJ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full bg-green-600 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-green-700"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chamar no WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Zelo BJJ" width={36} height={36} />
            <span className="font-bold text-white">
              ZELO <span className="text-gold">BJJ</span>
            </span>
          </div>
          <p className="text-sm text-gray-text">
            &copy; 2026 Zelo BJJ. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <a
              href="https://instagram.com/zelobjj"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-text transition-colors hover:text-gold"
            >
              Instagram
            </a>
            <a
              href="https://wa.me/5518981328589"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-text transition-colors hover:text-gold"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a
        href="https://wa.me/5518981328589?text=Olá! Quero saber mais sobre a Zelo BJJ"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg transition-transform hover:scale-110"
        aria-label="WhatsApp"
      >
        <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
