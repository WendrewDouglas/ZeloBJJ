import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Shield,
  Clock,
  GraduationCap,
  Zap,
  CreditCard,
  Smartphone,
  PlayCircle,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Infinity as InfinityIcon,
  BookOpen,
} from "lucide-react";
import { SubscribeButton } from "@/components/public/subscribe-button";
import { SiteHeader } from "@/components/public/site-header";

const offer = {
  name: "Curso Brazilian Jiu-Jitsu — Completo Digital",
  price: "29",
  cents: "90",
  features: [
    "Acesso imediato aos 9 módulos completos",
    "Vídeos em HD com técnicas detalhadas",
    "Material de apoio em PDF para estudo offline",
    "Comunidade exclusiva (fórum integrado)",
    "Suporte via WhatsApp",
    "Pagamento único — sem mensalidade",
  ],
};

const modules = [
  { n: "01", title: "Base e Postura", desc: "Alicerce do Jiu-Jitsu. Postura, distribuição de peso e proteção corporal." },
  { n: "02", title: "Movimentação Corporal", desc: "Ponte, fuga de quadril, giro, levantada técnica e ajustes de base." },
  { n: "03", title: "Hierarquia das Posições", desc: "Costas, montada, controle lateral, passagem de guarda e progressão." },
  { n: "04", title: "Guarda: Conceito e Função", desc: "Transforme a posição inferior em ataque com guarda fechada e aberta." },
  { n: "05", title: "Raspagens Básicas", desc: "Inversão de posições com técnica: tesoura, gancho, desequilíbrio e timing." },
  { n: "06", title: "Finalizações Fundamentais", desc: "Mata-leão, americana, armlock e triângulo com controle e posicionamento." },
  { n: "07", title: "Defesa e Sobrevivência", desc: "Proteção, fechamento de espaço e inteligência tática sob pressão." },
  { n: "08", title: "Respiração e Controle Emocional", desc: "Controle a pressão com respiração, calma e economia de energia." },
  { n: "09", title: "Conduta e Mentalidade", desc: "Respeito, constância, humildade e disciplina como aceleradores da evolução." },
];

const forWhom = [
  { icon: GraduationCap, title: "Iniciantes absolutos", desc: "Quem nunca pisou no tatame e quer começar com a base correta desde o primeiro dia." },
  { icon: Zap, title: "Faixas brancas e azuis", desc: "Quem treina na academia e quer preencher lacunas técnicas estudando fora do tatame." },
  { icon: BookOpen, title: "Quem quer revisar", desc: "Praticantes mais experientes que querem voltar aos fundamentos e refinar os princípios." },
];

const faq = [
  {
    q: "Como funciona o acesso ao curso?",
    a: "Após o pagamento aprovado, você recebe um e-mail de confirmação e o acesso é liberado automaticamente na área do aluno. É só fazer login e começar a estudar.",
  },
  {
    q: "Por quanto tempo tenho acesso?",
    a: "Acesso vitalício. Você paga uma única vez e pode voltar ao conteúdo sempre que quiser, sem mensalidade.",
  },
  {
    q: "Posso parcelar?",
    a: "Sim — no cartão de crédito, em até 18x com taxa de parcelamento por conta do comprador. Também aceitamos Pix, boleto, Google Pay, Apple Pay e saldo PagBank.",
  },
  {
    q: "O pagamento é seguro?",
    a: "Sim. Todo o processamento é feito pelo PagBank (grupo UOL), com criptografia ponta-a-ponta. Nenhum dado de cartão passa pelos servidores da Zelo BJJ.",
  },
  {
    q: "Preciso ter experiência prévia em Jiu-Jitsu?",
    a: "Não. O curso foi estruturado para quem está começando do zero. Se você já treina, vai usar o material como guia de referência e revisão.",
  },
  {
    q: "Como entro em contato com o suporte?",
    a: "Pelo WhatsApp no botão flutuante do site ou direto em wa.me/5518981328589. Respondemos em horário comercial.",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />

      {/* Hero */}
      <section className="hero-gradient relative flex min-h-[92vh] items-center justify-center overflow-hidden px-4 pt-28 pb-20 md:px-6">
        <div className="grid-fade absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Oferta de Lançamento · Acesso Vitalício
            </span>
          </div>

          <Image
            src="/logo.png"
            alt="Zelo BJJ"
            width={140}
            height={140}
            className="mx-auto mb-6 animate-float drop-shadow-[0_0_40px_rgba(197,160,40,0.25)]"
            priority
          />

          <h1 className="mb-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Aprenda <span className="gradient-gold">Jiu-Jitsu Brasileiro</span>
            <br className="hidden md:block" /> do zero ao avançado
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-pretty text-base text-gray-text md:text-lg">
            9 módulos estruturados, vídeo-aulas em HD e material de apoio. Pague uma única vez e
            estude no seu ritmo, quando e onde quiser.
          </p>

          <div className="mx-auto flex max-w-md flex-col items-stretch gap-3">
            <a
              href="#oferta"
              className="group relative inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 text-base font-bold text-dark shadow-xl shadow-gold/20 transition-all hover:bg-gold-light md:text-lg"
            >
              Garantir meu acesso · R$ 29,90
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-8 py-3 text-sm font-medium text-gray-text transition-colors hover:border-gold hover:text-gold"
            >
              Já sou aluno · Entrar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
            {[
              { icon: Shield, label: "Pagamento seguro" },
              { icon: Zap, label: "Acesso imediato" },
              { icon: InfinityIcon, label: "Vitalício" },
              { icon: CreditCard, label: "Até 18x" },
            ].map((t) => (
              <div
                key={t.label}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-gray-text"
              >
                <t.icon className="h-3.5 w-3.5 text-gold" />
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre + Stats */}
      <section id="sobre" className="px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-gold">
                Sobre a Zelo BJJ
              </span>
              <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
                A arte suave, com <span className="gradient-gold">técnica e propósito</span>
              </h2>
              <p className="mb-4 text-gray-text leading-relaxed">
                O Jiu-Jitsu Brasileiro é uma arte marcial, esporte e sistema de defesa pessoal
                baseado em princípios técnicos e estratégicos. Na Zelo BJJ, ensinamos os
                fundamentos essenciais que todo praticante precisa para construir uma base sólida e
                evoluir com segurança.
              </p>
              <p className="text-gray-text leading-relaxed">
                O verdadeiro progresso é construído no longo prazo, com paciência e dedicação aos
                princípios básicos. Esse curso é sobre isso.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "9", label: "Módulos Completos" },
                { value: "50+", label: "Técnicas Ensinadas" },
                { value: "HD", label: "Vídeos Detalhados" },
                { value: "∞", label: "Acesso Vitalício" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="card-hover rounded-2xl border border-white/10 bg-dark-lighter/50 p-6 text-center backdrop-blur"
                >
                  <div className="mb-2 text-4xl font-extrabold text-gold">{stat.value}</div>
                  <div className="text-sm text-gray-text">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Para quem */}
      <section className="bg-dark-light px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-gold">
              Para quem é
            </span>
            <h2 className="text-3xl font-bold md:text-4xl">
              Feito para <span className="gradient-gold">cada fase</span> da sua jornada
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {forWhom.map((item) => (
              <div
                key={item.title}
                className="card-hover rounded-2xl border border-white/5 bg-dark-lighter/60 p-6 backdrop-blur"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-text">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modulos */}
      <section id="modulos" className="px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-gold">
              Conteúdo do Curso
            </span>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              9 módulos, do <span className="gradient-gold">fundamento ao combate real</span>
            </h2>
            <p className="mx-auto max-w-xl text-gray-text">
              Do conceito de base à mentalidade do lutador. Estudada nessa ordem para você não
              pular etapas nem revisitar o mesmo conteúdo várias vezes.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => (
              <div
                key={mod.n}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-dark-lighter/60 p-6 transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_10px_40px_-10px_rgba(197,160,40,0.3)]"
              >
                <div className="absolute -right-6 -top-6 text-7xl font-black text-gold/5 transition-colors group-hover:text-gold/10">
                  {mod.n}
                </div>
                <span className="relative mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold">
                  <PlayCircle className="h-3.5 w-3.5" />
                  Módulo {mod.n}
                </span>
                <h3 className="relative mb-2 text-lg font-bold text-white">{mod.title}</h3>
                <p className="relative text-sm leading-relaxed text-gray-text">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Princípios */}
      <section className="bg-dark-light px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-gold">
              Metodologia
            </span>
            <h2 className="text-3xl font-bold md:text-4xl">
              Princípios <span className="gradient-gold">Fundamentais</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Posição antes da Finalização",
                desc: "Sem controle posicional, tentativas de finalização falham e expõem você. Domine a posição primeiro.",
              },
              {
                icon: Zap,
                title: "Técnica sobre Força",
                desc: "Jiu-Jitsu eficiente é economia de energia. Técnica bem aplicada requer pouca força.",
              },
              {
                icon: Clock,
                title: "Constância e Paciência",
                desc: "Melhor treinar 3x por semana com consistência do que 6x em uma semana e faltar um mês.",
              },
            ].map((item) => (
              <div key={item.title} className="card-hover rounded-2xl border border-white/5 bg-dark-lighter/60 p-7 text-center backdrop-blur">
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-gray-text leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Oferta */}
      <section id="oferta" className="relative px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <span className="mb-3 inline-block rounded-full border border-gold/30 bg-gold/5 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
              Oferta de Lançamento
            </span>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
              Invista uma vez. <span className="gradient-gold">Acesse para sempre.</span>
            </h2>
            <p className="mx-auto max-w-xl text-gray-text">
              Pagamento único, sem mensalidade. Todo o curso liberado na hora.
            </p>
          </div>

          <div className="glow-gold relative overflow-hidden rounded-3xl border border-gold/50 bg-gradient-to-b from-dark-lighter to-dark-light p-6 md:p-10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-5 py-1 text-xs font-bold uppercase tracking-widest text-dark shadow-lg">
              Acesso Vitalício
            </span>

            <div className="mb-8 text-center">
              <p className="mb-2 text-xs uppercase tracking-widest text-gold">Completo Digital · 9 módulos</p>
              <h3 className="mb-6 text-xl font-bold md:text-2xl">{offer.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-xl text-gray-text">R$</span>
                <span className="text-6xl font-extrabold text-gold md:text-7xl">{offer.price}</span>
                <span className="text-2xl font-bold text-gold">,{offer.cents}</span>
              </div>
              <p className="mt-2 text-sm text-gray-text">à vista · em até <strong className="text-white">18x</strong> no cartão</p>
            </div>

            <ul className="mb-8 grid gap-3 sm:grid-cols-2">
              {offer.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-text">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mx-auto max-w-md space-y-3">
              <div className="pulse-ring rounded-full">
                <SubscribeButton
                  planSlug="curso_digital"
                  planName={offer.name}
                  featured
                  size="lg"
                  label="Garantir meu acesso agora"
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-text">
                <Shield className="h-3.5 w-3.5 text-gold" />
                Pagamento seguro via PagBank
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {["Cartão", "Pix", "Boleto", "Google Pay", "Apple Pay"].map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-gray-text"
                  >
                    <Smartphone className="h-3 w-3" /> {m}
                  </span>
                ))}
              </div>
              <p className="pt-2 text-center text-xs text-gray-text">
                Já comprou?{" "}
                <Link href="/login" className="font-semibold text-gold hover:text-gold-light">
                  Fazer login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-dark-light px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-gold">
              Perguntas frequentes
            </span>
            <h2 className="text-3xl font-bold md:text-4xl">
              Dúvidas <span className="gradient-gold">rápidas</span>
            </h2>
          </div>
          <div className="space-y-3">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group overflow-hidden rounded-2xl border border-white/5 bg-dark-lighter/60 transition-colors hover:border-gold/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-white md:text-base">
                  {item.q}
                  <span className="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-gold transition-transform group-open:rotate-45">
                    <span className="text-lg leading-none">+</span>
                  </span>
                </summary>
                <div className="border-t border-white/5 px-5 py-4 text-sm leading-relaxed text-gray-text">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final + Contato */}
      <section id="contato" className="relative overflow-hidden px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-gradient-to-b from-dark-lighter to-dark p-8 text-center md:p-12">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">
            Pronto para <span className="gradient-gold">começar</span>?
          </h2>
          <p className="mb-8 text-gray-text">
            Clique abaixo para garantir seu acesso ou fale com a gente no WhatsApp.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#oferta"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-bold text-dark shadow-lg transition-colors hover:bg-gold-light"
            >
              Comprar agora · R$ 29,90
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="https://wa.me/5518981328589?text=Ol%C3%A1%21%20Quero%20saber%20mais%20sobre%20a%20Zelo%20BJJ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-white transition-colors hover:border-gold hover:text-gold"
            >
              <MessageCircle className="h-4 w-4" />
              Tirar dúvida no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-12 md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Zelo BJJ" width={36} height={36} />
            <span className="font-bold text-white">
              ZELO <span className="text-gold">BJJ</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/login" className="text-gray-text transition-colors hover:text-gold">
              Entrar
            </Link>
            <a href="#faq" className="text-gray-text transition-colors hover:text-gold">
              FAQ
            </a>
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
          <p className="text-xs text-gray-text">&copy; 2026 Zelo BJJ. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a
        href="https://wa.me/5518981328589?text=Ol%C3%A1%21%20Quero%20saber%20mais%20sobre%20a%20Zelo%20BJJ"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg ring-4 ring-green-500/20 transition-transform hover:scale-110"
        aria-label="WhatsApp"
      >
        <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
