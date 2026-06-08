"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, CreditCard, MessageSquare, Shield, Sparkles, Target, Users, Zap } from "lucide-react";
import OperationsHeroVisual from "@/components/OperationsHeroVisual";
import { useLanguage, type LanguageCode } from "@/components/LanguageProvider";

type ToolCopy = { title: string; description: string; useNow: string };
type TrustCopy = { title: string; detail: string };
type HomeCopy = {
  badge: string;
  headline: string;
  emphasis: string;
  intro: string;
  primaryCta: string;
  secondaryCta: string;
  trust: TrustCopy[];
  proofEyebrow: string;
  proofTitle: string;
  proofIntro: string;
  tools: ToolCopy[];
  activationEyebrow: string;
  activationTitle: string;
  activationBody: string;
  compareCta: string;
  bookCta: string;
  proofSteps: string[];
  finalTitle: string;
  finalBody: string;
  finalPrimary: string;
  finalSecondary: string;
};

const copy: Record<LanguageCode, HomeCopy> = {
  EN: {
    badge: "MRagent and micro-tools are ready",
    headline: "Reclaim 2+ hours daily",
    emphasis: "within 24 hours",
    intro: "MindReply helps overloaded operators, founders, and client-facing teams process messages, tasks, and follow-ups before critical work slips.",
    primaryCta: "Process 10 Urgent Items",
    secondaryCta: "Ask MRagent",
    trust: [
      { title: "Value in minutes", detail: "The first useful output is an action queue or a send-ready message." },
      { title: "Credits for delivery", detail: "Buy a pack when the first output proves the time saving." },
      { title: "Professional support", detail: "Use the marketplace when sensitive work needs expert review." },
      { title: "Private by design", detail: "Built for sensitive professional communication and decision support." },
    ],
    proofEyebrow: "Working proof",
    proofTitle: "Start with the queue that is already costing time.",
    proofIntro: "No long setup. Paste the active mess, get a ranked response plan, then process the next batch when the first output is useful.",
    tools: [
      { title: "Ops Overload Analyzer", description: "Turn 5-10 urgent messages and tasks into a ranked action queue.", useNow: "Use now" },
      { title: "Prospect Reply Analyzer", description: "Find why replies stalled and get the next message, offer, and close.", useNow: "Use now" },
      { title: "Email Polisher", description: "Convert rough drafts into calm, professional, send-ready wording.", useNow: "Use now" },
    ],
    activationEyebrow: "First-session activation",
    activationTitle: "The user should feel relief before checkout.",
    activationBody: "MindReply sells when the first output removes hesitation: what matters, who owns it, what to send, and what to do next.",
    compareCta: "Compare Growth and Pro",
    bookCta: "Book expert review",
    proofSteps: [
      "Paste overloaded emails, Slack notes, tasks, or follow-ups.",
      "MindReply returns urgency, owner, next action, and the send-ready response.",
      "Process the next batch with credits or upgrade when daily overload repeats.",
    ],
    finalTitle: "Recover the next 10 items now.",
    finalBody: "Start with the overload analyzer. If it gives you a usable queue, buy credits for the next batch or move to Growth when this happens every day.",
    finalPrimary: "Open Analyzer",
    finalSecondary: "View all tools",
  },
  FR: {
    badge: "MRagent et les micro-outils sont prets",
    headline: "Recuperez 2+ heures par jour",
    emphasis: "en 24 heures",
    intro: "MindReply aide les equipes surchargees a traiter messages, taches et relances avant que le travail critique ne glisse.",
    primaryCta: "Traiter 10 urgences",
    secondaryCta: "Demander a MRagent",
    trust: [
      { title: "Valeur en minutes", detail: "Le premier resultat utile est une file d'actions ou un message pret a envoyer." },
      { title: "Credits a la demande", detail: "Achetez un pack quand le premier resultat prouve le gain de temps." },
      { title: "Support professionnel", detail: "Utilisez les experts quand un sujet sensible demande une revue humaine." },
      { title: "Prive par design", detail: "Concu pour les communications professionnelles sensibles." },
    ],
    proofEyebrow: "Preuve rapide",
    proofTitle: "Commencez par la file qui coute deja du temps.",
    proofIntro: "Pas de longue configuration. Collez le flux actif, obtenez un plan classe, puis traitez le lot suivant.",
    tools: [
      { title: "Analyseur de surcharge", description: "Transforme 5-10 messages et taches urgents en file d'actions classee.", useNow: "Utiliser" },
      { title: "Analyseur de reponses prospects", description: "Identifie pourquoi la reponse bloque et donne le prochain message.", useNow: "Utiliser" },
      { title: "Polisseur d'email", description: "Transforme un brouillon en message calme, professionnel et pret a envoyer.", useNow: "Utiliser" },
    ],
    activationEyebrow: "Premiere session",
    activationTitle: "Le soulagement doit venir avant le paiement.",
    activationBody: "MindReply vend quand le premier resultat retire l'hesitation: priorite, responsable, message et prochaine action.",
    compareCta: "Comparer Growth et Pro",
    bookCta: "Reserver une revue expert",
    proofSteps: [
      "Collez emails, notes Slack, taches ou relances surchargees.",
      "MindReply renvoie urgence, responsable, prochaine action et reponse prete.",
      "Traitez le lot suivant avec credits ou passez a Growth si cela revient chaque jour.",
    ],
    finalTitle: "Recuperez les 10 prochains elements maintenant.",
    finalBody: "Commencez par l'analyseur. Si la file est utile, achetez des credits ou passez a Growth quand cela se repete.",
    finalPrimary: "Ouvrir l'analyseur",
    finalSecondary: "Voir tous les outils",
  },
  DE: {
    badge: "MRagent und Mikro-Tools sind bereit",
    headline: "Gewinnen Sie 2+ Stunden pro Tag zurueck",
    emphasis: "innerhalb von 24 Stunden",
    intro: "MindReply hilft ueberlasteten Teams, Nachrichten, Aufgaben und Follow-ups zu verarbeiten, bevor kritische Arbeit liegen bleibt.",
    primaryCta: "10 dringende Punkte verarbeiten",
    secondaryCta: "MRagent fragen",
    trust: [
      { title: "Wert in Minuten", detail: "Das erste Ergebnis ist eine Aktionsliste oder eine sendefertige Nachricht." },
      { title: "Credits fuer Lieferung", detail: "Kaufen Sie Credits, wenn das erste Ergebnis Zeit spart." },
      { title: "Professionelle Hilfe", detail: "Nutzen Sie Experten, wenn sensible Arbeit menschliche Pruefung braucht." },
      { title: "Privat by design", detail: "Gebaut fuer sensible professionelle Kommunikation." },
    ],
    proofEyebrow: "Schneller Beweis",
    proofTitle: "Starten Sie mit der Warteschlange, die schon Zeit kostet.",
    proofIntro: "Keine lange Einrichtung. Einfuegen, priorisierten Plan erhalten, dann den naechsten Stapel verarbeiten.",
    tools: [
      { title: "Ops Overload Analyzer", description: "Macht aus 5-10 dringenden Nachrichten und Aufgaben eine priorisierte Aktionsliste.", useNow: "Jetzt nutzen" },
      { title: "Prospect Reply Analyzer", description: "Findet, warum Antworten stecken bleiben, und liefert die naechste Nachricht.", useNow: "Jetzt nutzen" },
      { title: "Email Polisher", description: "Macht Rohentwuerfe ruhig, professionell und sendefertig.", useNow: "Jetzt nutzen" },
    ],
    activationEyebrow: "Erste Sitzung",
    activationTitle: "Der Nutzer soll Erleichterung vor dem Checkout spueren.",
    activationBody: "MindReply verkauft, wenn das erste Ergebnis Zoegern entfernt: was wichtig ist, wem es gehoert, was zu senden ist.",
    compareCta: "Growth und Pro vergleichen",
    bookCta: "Expertenpruefung buchen",
    proofSteps: [
      "Fuegen Sie ueberladene Emails, Slack-Notizen, Aufgaben oder Follow-ups ein.",
      "MindReply liefert Dringlichkeit, Besitzer, naechste Aktion und sendefertige Antwort.",
      "Verarbeiten Sie den naechsten Stapel mit Credits oder upgraden Sie bei taeglicher Ueberlastung.",
    ],
    finalTitle: "Bearbeiten Sie die naechsten 10 Punkte jetzt.",
    finalBody: "Starten Sie mit dem Analyzer. Wenn die Liste nutzbar ist, kaufen Sie Credits oder wechseln Sie zu Growth.",
    finalPrimary: "Analyzer oeffnen",
    finalSecondary: "Alle Tools ansehen",
  },
  ES: {
    badge: "MRagent y las microherramientas estan listas",
    headline: "Recupera 2+ horas al dia",
    emphasis: "en 24 horas",
    intro: "MindReply ayuda a equipos saturados a procesar mensajes, tareas y seguimientos antes de que el trabajo critico se pierda.",
    primaryCta: "Procesar 10 urgencias",
    secondaryCta: "Preguntar a MRagent",
    trust: [
      { title: "Valor en minutos", detail: "El primer resultado util es una cola de acciones o un mensaje listo para enviar." },
      { title: "Creditos por entrega", detail: "Compra un pack cuando el primer resultado demuestre ahorro de tiempo." },
      { title: "Soporte profesional", detail: "Usa expertos cuando el trabajo sensible necesite revision." },
      { title: "Privado por diseno", detail: "Hecho para comunicacion profesional sensible." },
    ],
    proofEyebrow: "Prueba rapida",
    proofTitle: "Empieza con la cola que ya esta costando tiempo.",
    proofIntro: "Sin configuracion larga. Pega el caos activo, recibe un plan priorizado y procesa el siguiente lote.",
    tools: [
      { title: "Analizador de sobrecarga", description: "Convierte 5-10 mensajes y tareas urgentes en una cola de accion.", useNow: "Usar ahora" },
      { title: "Analizador de respuestas", description: "Encuentra por que se freno una respuesta y da el siguiente mensaje.", useNow: "Usar ahora" },
      { title: "Pulidor de email", description: "Convierte borradores en mensajes calmados, profesionales y listos.", useNow: "Usar ahora" },
    ],
    activationEyebrow: "Primera sesion",
    activationTitle: "El usuario debe sentir alivio antes de pagar.",
    activationBody: "MindReply convierte cuando el primer resultado quita duda: prioridad, responsable, mensaje y siguiente accion.",
    compareCta: "Comparar Growth y Pro",
    bookCta: "Reservar revision experta",
    proofSteps: [
      "Pega emails, notas de Slack, tareas o seguimientos saturados.",
      "MindReply devuelve urgencia, responsable, siguiente accion y respuesta lista.",
      "Procesa el siguiente lote con creditos o mejora cuando se repite a diario.",
    ],
    finalTitle: "Recupera los proximos 10 elementos ahora.",
    finalBody: "Empieza con el analizador. Si la cola es util, compra creditos o pasa a Growth cuando ocurra cada dia.",
    finalPrimary: "Abrir analizador",
    finalSecondary: "Ver herramientas",
  },
  BG: {
    badge: "MRagent i mikro-instrumentite sa gotovi",
    headline: "Vurnete si 2+ chasa na den",
    emphasis: "do 24 chasa",
    intro: "MindReply pomaga na pretovareni ekipi da obrabotvat saobshtenia, zadachi i posledvashti deistvia predi kritichnata rabota da izostane.",
    primaryCta: "Obraboti 10 speshni neshta",
    secondaryCta: "Popitai MRagent",
    trust: [
      { title: "Stoinost za minuti", detail: "Purviyat rezultat e opashka s deistvia ili gotov za izprashtane tekst." },
      { title: "Krediti za rezultat", detail: "Kupi paket, kogato purviyat rezultat dokaje spestenoto vreme." },
      { title: "Profesionalna podkrepa", detail: "Izpolzvai ekspert pri chuvstvitelna rabota, koyato iska pregled." },
      { title: "Lichno po dizain", detail: "Suazdadeno za chuvstvitelna profesionalna komunikacia." },
    ],
    proofEyebrow: "Burzo dokazatelstvo",
    proofTitle: "Zapochni s opashkata, koyato veche gubi vreme.",
    proofIntro: "Bez dulga nastroika. Postavi aktivniya haos, vzemi prioritiziran plan i obraboti sledvashtata partiya.",
    tools: [
      { title: "Analizator za pretovarvane", description: "Prevrushta 5-10 speshni saobshtenia i zadachi v prioritizirana opashka.", useNow: "Izpolzvai" },
      { title: "Analizator na prospect otgovori", description: "Pokazva zashto razgovorut e spryal i dava sledvashtoto saobshtenie.", useNow: "Izpolzvai" },
      { title: "Email polisher", description: "Prevrushta grubi chernovi v spokoen, profesionalen tekst za izprashtane.", useNow: "Izpolzvai" },
    ],
    activationEyebrow: "Purva sesia",
    activationTitle: "Potrebitelyat tryabva da useti oblekchenie predi plashtane.",
    activationBody: "MindReply prodava, kogato purviyat rezultat maha kolebanieto: prioritet, sobstvenik, tekst i sledvashta stupka.",
    compareCta: "Sravni Growth i Pro",
    bookCta: "Rezervirai eksperten pregled",
    proofSteps: [
      "Postavi pretovareni emaili, Slack belezhki, zadachi ili posledvashti deistvia.",
      "MindReply vrushta speshnost, otgovornik, sledvashta stupka i gotov otgovor.",
      "Obraboti sledvashtata partiya s krediti ili upgraden, ako se povtarya vseki den.",
    ],
    finalTitle: "Vuzstanovi sledvashtite 10 neshta sega.",
    finalBody: "Zapochni s analizatora. Ako opashkata e polezna, kupi krediti ili mini kum Growth pri ezhednevno pretovarvane.",
    finalPrimary: "Otvori analizatora",
    finalSecondary: "Vizh vsichki instrumenti",
  },
  IT: {
    badge: "MRagent e micro-strumenti sono pronti",
    headline: "Recupera 2+ ore al giorno",
    emphasis: "entro 24 ore",
    intro: "MindReply aiuta team sovraccarichi a gestire messaggi, task e follow-up prima che il lavoro critico scivoli.",
    primaryCta: "Processa 10 urgenze",
    secondaryCta: "Chiedi a MRagent",
    trust: [
      { title: "Valore in minuti", detail: "Il primo output utile e una coda di azioni o un messaggio pronto." },
      { title: "Crediti per consegna", detail: "Compra un pack quando il primo output dimostra risparmio di tempo." },
      { title: "Supporto professionale", detail: "Usa esperti quando il lavoro sensibile richiede revisione." },
      { title: "Privato by design", detail: "Pensato per comunicazioni professionali sensibili." },
    ],
    proofEyebrow: "Prova rapida",
    proofTitle: "Inizia dalla coda che sta gia costando tempo.",
    proofIntro: "Nessuna configurazione lunga. Incolla il caos attivo, ottieni un piano ordinato e processa il prossimo lotto.",
    tools: [
      { title: "Analizzatore sovraccarico", description: "Trasforma 5-10 messaggi e task urgenti in una coda di azione.", useNow: "Usa ora" },
      { title: "Analizzatore risposte prospect", description: "Trova perche le risposte si bloccano e fornisce il prossimo messaggio.", useNow: "Usa ora" },
      { title: "Email Polisher", description: "Converte bozze grezze in messaggi calmi, professionali e pronti.", useNow: "Usa ora" },
    ],
    activationEyebrow: "Prima sessione",
    activationTitle: "Il valore deve sentirsi prima del checkout.",
    activationBody: "MindReply converte quando il primo output rimuove l'esitazione: priorita, proprietario, messaggio e prossima azione.",
    compareCta: "Confronta Growth e Pro",
    bookCta: "Prenota revisione esperta",
    proofSteps: [
      "Incolla email, note Slack, task o follow-up sovraccarichi.",
      "MindReply restituisce urgenza, owner, prossima azione e risposta pronta.",
      "Processa il prossimo lotto con crediti o fai upgrade se accade ogni giorno.",
    ],
    finalTitle: "Recupera i prossimi 10 elementi ora.",
    finalBody: "Inizia con l'analizzatore. Se la coda e utile, compra crediti o passa a Growth quando succede ogni giorno.",
    finalPrimary: "Apri analizzatore",
    finalSecondary: "Vedi tutti gli strumenti",
  },
  PT: {
    badge: "MRagent e microferramentas estao prontos",
    headline: "Recupere 2+ horas por dia",
    emphasis: "em 24 horas",
    intro: "MindReply ajuda equipes sobrecarregadas a processar mensagens, tarefas e follow-ups antes que trabalho critico escape.",
    primaryCta: "Processar 10 urgencias",
    secondaryCta: "Perguntar ao MRagent",
    trust: [
      { title: "Valor em minutos", detail: "O primeiro resultado util e uma fila de acoes ou mensagem pronta." },
      { title: "Creditos por entrega", detail: "Compre um pacote quando o primeiro resultado provar economia de tempo." },
      { title: "Suporte profissional", detail: "Use especialistas quando trabalho sensivel precisa de revisao." },
      { title: "Privado por design", detail: "Criado para comunicacao profissional sensivel." },
    ],
    proofEyebrow: "Prova rapida",
    proofTitle: "Comece pela fila que ja custa tempo.",
    proofIntro: "Sem configuracao longa. Cole o caos ativo, receba um plano priorizado e processe o proximo lote.",
    tools: [
      { title: "Analisador de sobrecarga", description: "Transforma 5-10 mensagens e tarefas urgentes em fila de acao.", useNow: "Usar agora" },
      { title: "Analisador de respostas", description: "Mostra por que respostas travaram e entrega a proxima mensagem.", useNow: "Usar agora" },
      { title: "Polidor de email", description: "Converte rascunhos em mensagens calmas, profissionais e prontas.", useNow: "Usar agora" },
    ],
    activationEyebrow: "Primeira sessao",
    activationTitle: "O usuario deve sentir alivio antes do checkout.",
    activationBody: "MindReply converte quando o primeiro resultado remove hesitacao: prioridade, dono, mensagem e proxima acao.",
    compareCta: "Comparar Growth e Pro",
    bookCta: "Reservar revisao especialista",
    proofSteps: [
      "Cole emails, notas Slack, tarefas ou follow-ups sobrecarregados.",
      "MindReply devolve urgencia, responsavel, proxima acao e resposta pronta.",
      "Processe o proximo lote com creditos ou faca upgrade quando isso ocorre todo dia.",
    ],
    finalTitle: "Recupere os proximos 10 itens agora.",
    finalBody: "Comece com o analisador. Se a fila for util, compre creditos ou va para Growth quando isso acontece todo dia.",
    finalPrimary: "Abrir analisador",
    finalSecondary: "Ver ferramentas",
  },
};

const toolHrefs = ["/tools/ops-overload-analyzer", "/tools/prospect-reply-analyzer", "/tools/email-polisher"];
const toolIcons = [Zap, Target, MessageSquare];
const trustIcons = [Clock, CreditCard, Users, Shield];

export default function Home() {
  const { language } = useLanguage();
  const current = copy[language] ?? copy.EN;

  return (
    <main className="min-h-screen bg-[hsl(40_20%_96%)]">
      <section className="relative overflow-hidden bg-[hsl(220_55%_20%)] px-4 pb-20 pt-32">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="text-center lg:text-left">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium text-[hsl(43_80%_60%)]" style={{ borderColor: "rgba(201,169,97,0.3)" }}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {current.badge}
            </div>
            <h1 className="mb-6 font-serif text-5xl font-bold leading-tight text-[hsl(43_70%_88%)] md:text-6xl lg:text-7xl">
              {current.headline} <span className="italic text-[hsl(43_80%_60%)]">{current.emphasis}</span>
            </h1>
            <p className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-[rgba(248,245,240,0.75)] md:text-xl lg:mx-0">
              {current.intro}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Link href="/tools/ops-overload-analyzer" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(43_80%_60%)] px-8 py-4 font-semibold text-[hsl(220_45%_13%)] shadow-lg transition hover:opacity-90">
                {current.primaryCta} <ArrowRight size={16} />
              </Link>
              <Link href="/agent" className="inline-flex items-center justify-center gap-2 rounded-lg border px-8 py-4 font-medium text-[hsl(43_70%_88%)] transition hover:text-[hsl(43_80%_60%)]" style={{ borderColor: "rgba(248,245,240,0.3)" }}>
                {current.secondaryCta}
              </Link>
            </div>
          </div>
          <OperationsHeroVisual />
        </div>
      </section>

      <section className="border-y bg-[hsl(218_38%_12%)] px-4 py-10" style={{ borderColor: "rgba(201,169,97,0.22)" }}>
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {current.trust.map((item, index) => {
            const Icon = trustIcons[index];
            return (
              <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.055] p-5">
                <Icon size={20} className="text-[hsl(43_80%_60%)]" />
                <h2 className="mt-3 text-sm font-bold text-[hsl(43_70%_88%)]">{item.title}</h2>
                <p className="mt-2 text-xs leading-relaxed text-[rgba(248,245,240,0.68)]">{item.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[hsl(43_80%_42%)]">{current.proofEyebrow}</p>
            <h2 className="font-serif text-3xl font-bold text-[hsl(220_45%_13%)] md:text-4xl">{current.proofTitle}</h2>
            <p className="mt-4 text-sm leading-relaxed text-[hsl(220_25%_45%)]">{current.proofIntro}</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {current.tools.map((tool, index) => {
              const Icon = toolIcons[index];
              return (
                <Link key={tool.title} href={toolHrefs[index]} className="group rounded-2xl border bg-white p-6 transition hover:-translate-y-0.5 hover:border-[hsl(43_80%_60%)] hover:shadow-lg" style={{ borderColor: "hsl(40 25% 88%)" }}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(220_55%_20%)] text-[hsl(43_70%_88%)]">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-5 font-serif text-xl font-bold text-[hsl(220_45%_13%)]">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[hsl(220_25%_45%)]">{tool.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[hsl(220_55%_20%)] group-hover:gap-2">
                    {tool.useNow} <ArrowRight size={12} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[hsl(220_45%_13%)] px-4 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[hsl(43_80%_60%)]">{current.activationEyebrow}</p>
            <h2 className="font-serif text-3xl font-bold text-[hsl(43_70%_88%)] md:text-4xl">{current.activationTitle}</h2>
            <p className="mt-4 text-sm leading-relaxed text-[rgba(248,245,240,0.72)]">{current.activationBody}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/memberships" className="inline-flex items-center justify-center rounded-lg bg-[hsl(43_80%_60%)] px-6 py-3 text-sm font-semibold text-[hsl(220_45%_13%)]">
                {current.compareCta}
              </Link>
              <Link href="/professionals" className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-[hsl(43_70%_88%)]">
                {current.bookCta}
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {current.proofSteps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(43_80%_60%)] text-sm font-bold text-[hsl(220_45%_13%)]">{index + 1}</span>
                <p className="mt-4 text-sm leading-relaxed text-[rgba(248,245,240,0.78)]">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl rounded-2xl border bg-white p-8 text-center shadow-sm" style={{ borderColor: "hsl(40 25% 88%)" }}>
          <Sparkles className="mx-auto text-[hsl(43_80%_42%)]" size={24} />
          <h2 className="mt-4 font-serif text-3xl font-bold text-[hsl(220_45%_13%)]">{current.finalTitle}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[hsl(220_25%_45%)]">{current.finalBody}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/tools/ops-overload-analyzer" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(220_55%_20%)] px-6 py-3 text-sm font-semibold text-[hsl(43_70%_88%)]">
              {current.finalPrimary} <ArrowRight size={14} />
            </Link>
            <Link href="/tools" className="inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold text-[hsl(220_45%_13%)]" style={{ borderColor: "hsl(40 25% 88%)" }}>
              {current.finalSecondary} <CheckCircle2 size={14} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
