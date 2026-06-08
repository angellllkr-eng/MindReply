"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { Message as AIMessage, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { useLanguage, type LanguageCode } from "@/components/LanguageProvider";

type Msg = { role: "agent" | "user"; text: string; source?: string };

type AgentCopy = {
  greeting: string;
  status: string;
  typingLabel: string;
  placeholder: string;
  ready: string;
  suggestions: string[];
  links: { professionals: string; tools: string; membership: string };
  fallbacks: {
    login: string;
    booking: string;
    payment: string;
    default: string;
  };
};

const AGENT_COPY: Record<LanguageCode, AgentCopy> = {
  EN: {
    greeting: "Hi, I am MRagent. Ask me anything - a message, a decision, a booking, an expert field, credits, or which plan fits your work. I will be useful first and only suggest a paid path when it genuinely helps.",
    status: "Helpful AI chat",
    typingLabel: "Behavioral dictionary pass",
    placeholder: "Ask MRagent anything...",
    ready: "Ready",
    suggestions: ["Help me with a difficult reply", "Act like a psychologist for this", "Book a video session", "Can we talk about another topic?"],
    links: { professionals: "Professionals", tools: "Tools", membership: "Membership" },
    fallbacks: {
      login: "For login, use Member Login or Sign Up. If account access is temporarily unavailable, keep using tools and bookings from the public flow.",
      booking: "For expert help, start from Professionals. If you are not ready to book, ask me the field and the situation here first; I can give a careful AI preview and point you to text, voice, or video only if that is the right next step.",
      payment: "Credits are best for one-off tools. Membership is better when you keep repeating context. Tell me the work pattern and I will point to the least wasteful option.",
      default: "I am still here locally. Ask me normally. I will think through the situation, use the behavioral dictionary, and keep the next step calm and practical.",
    },
  },
  FR: {
    greeting: "Bonjour, je suis MRagent. Posez-moi une question sur un message, une decision, une reservation, un domaine expert, des credits ou le plan adapte a votre travail. Je vous aide d'abord, puis je propose une option payante seulement si elle est utile.",
    status: "Chat IA utile",
    typingLabel: "Passage dictionnaire comportemental",
    placeholder: "Demandez a MRagent...",
    ready: "Pret",
    suggestions: ["Aidez-moi avec une reponse difficile", "Agissez comme psychologue pour cela", "Reserver une session video", "Peut-on parler d'un autre sujet ?"],
    links: { professionals: "Professionnels", tools: "Outils", membership: "Adhesion" },
    fallbacks: {
      login: "Pour vous connecter, utilisez Connexion ou Creer un compte. Si l'acces est temporairement indisponible, continuez avec les outils et reservations publics.",
      booking: "Pour une aide experte, commencez par Professionnels. Si vous n'etes pas pret a reserver, dites-moi le domaine et la situation; je peux donner un apercu IA prudent.",
      payment: "Les credits conviennent aux outils ponctuels. L'adhesion convient mieux quand le contexte revient souvent. Decrivez votre rythme de travail et je vous oriente.",
      default: "Je suis disponible localement. Posez votre question normalement; je garderai la prochaine etape calme, utile et pratique.",
    },
  },
  DE: {
    greeting: "Hallo, ich bin MRagent. Fragen Sie mich zu einer Nachricht, Entscheidung, Buchung, einem Fachgebiet, Credits oder dem passenden Plan. Ich helfe zuerst und empfehle Bezahloptionen nur, wenn sie wirklich Zeit sparen.",
    status: "Hilfreicher KI-Chat",
    typingLabel: "Verhaltenswoerterbuch-Pruefung",
    placeholder: "MRagent etwas fragen...",
    ready: "Bereit",
    suggestions: ["Hilf mir mit einer schwierigen Antwort", "Denk wie ein Psychologe", "Videositzung buchen", "Koennen wir ueber ein anderes Thema sprechen?"],
    links: { professionals: "Experten", tools: "Werkzeuge", membership: "Mitgliedschaft" },
    fallbacks: {
      login: "Nutzen Sie Login oder Konto erstellen. Falls der Zugang kurz nicht verfuegbar ist, bleiben Tools und Buchungen oeffentlich nutzbar.",
      booking: "Fuer Expertenhilfe starten Sie bei Experten. Wenn Sie noch nicht buchen moechten, nennen Sie Fachgebiet und Situation; ich gebe eine vorsichtige KI-Vorschau.",
      payment: "Credits passen fuer einzelne Tools. Eine Mitgliedschaft lohnt sich, wenn derselbe Kontext wiederkehrt. Beschreiben Sie das Muster und ich waehle die sparsamste Option.",
      default: "Ich bin lokal verfuegbar. Fragen Sie normal; ich denke die Situation durch und halte den naechsten Schritt ruhig und praktisch.",
    },
  },
  ES: {
    greeting: "Hola, soy MRagent. Preguntame cualquier cosa: un mensaje, una decision, una reserva, un campo experto, creditos o que plan encaja con tu trabajo. Primero sere util y solo sugerire una opcion de pago cuando ayude de verdad.",
    status: "Chat IA util",
    typingLabel: "Revision de diccionario conductual",
    placeholder: "Pregunta a MRagent...",
    ready: "Listo",
    suggestions: ["Ayudame con una respuesta dificil", "Actua como psicologo para esto", "Reservar una sesion de video", "Podemos hablar de otro tema?"],
    links: { professionals: "Profesionales", tools: "Herramientas", membership: "Membresia" },
    fallbacks: {
      login: "Para entrar, usa Acceso o Crear cuenta. Si el acceso esta temporalmente no disponible, sigue usando herramientas y reservas publicas.",
      booking: "Para ayuda experta, empieza por Profesionales. Si aun no quieres reservar, dime el campo y la situacion; puedo darte una vista previa cuidadosa con IA.",
      payment: "Los creditos sirven para herramientas puntuales. La membresia conviene cuando repites contexto. Cuentame el patron de trabajo y te indico la opcion menos desperdiciada.",
      default: "Sigo aqui en modo local. Pregunta con normalidad; pensare la situacion y mantendre el siguiente paso calmado y practico.",
    },
  },
  BG: {
    greeting: "Zdravei, az sum MRagent. Popitai me za saobshtenie, reshenie, rezervacia, ekspertna oblast, krediti ili koi plan pasva na rabotata ti. Purvo shte pomogna, a platen put shte predlozha samo ako realno pesti vreme.",
    status: "Polezen AI chat",
    typingLabel: "Povedencheski rechnik proverka",
    placeholder: "Popitai MRagent...",
    ready: "Gotov",
    suggestions: ["Pomogni mi s truden otgovor", "Misli kato psiholog za tova", "Rezervirai video sesia", "Mozhe li za druga tema?"],
    links: { professionals: "Profesionalisti", tools: "Instrumenti", membership: "Chlenstvo" },
    fallbacks: {
      login: "Za vhod izpolzvai Vhod ili Nov profil. Ako dostuput vremenno ne e nalichen, produlzhi s publichnite instrumenti i rezervacii.",
      booking: "Za ekspertna pomosht zapochni ot Profesionalisti. Ako oshte ne si gotov za rezervacia, kazhi oblastta i situaciata; shte dam vnimatelen AI pregled.",
      payment: "Kreditite sa nai-dobri za edinichen instrument. Chlenstvoto e po-dobro, kogato kontekstut se povtarya. Kazhi rabotniya model i shte nasocha kum nai-ikonomichnata opcia.",
      default: "Tuk sum lokalno. Popitai normalno; shte premislya situaciata i shte zapazya sledvashtata stupka spokoyna i praktichna.",
    },
  },
  IT: {
    greeting: "Ciao, sono MRagent. Chiedimi qualsiasi cosa: un messaggio, una decisione, una prenotazione, un campo esperto, crediti o il piano giusto. Prima ti aiuto, poi suggerisco un percorso a pagamento solo se serve davvero.",
    status: "Chat IA utile",
    typingLabel: "Passaggio dizionario comportamentale",
    placeholder: "Chiedi a MRagent...",
    ready: "Pronto",
    suggestions: ["Aiutami con una risposta difficile", "Agisci come psicologo per questo", "Prenota una sessione video", "Possiamo parlare di altro?"],
    links: { professionals: "Professionisti", tools: "Strumenti", membership: "Membership" },
    fallbacks: {
      login: "Per accedere, usa Accesso o Crea account. Se l'accesso e temporaneamente non disponibile, continua con strumenti e prenotazioni pubbliche.",
      booking: "Per aiuto esperto, inizia da Professionisti. Se non sei pronto a prenotare, dimmi il campo e la situazione; posso dare un'anteprima IA prudente.",
      payment: "I crediti sono adatti agli strumenti una tantum. La membership conviene quando il contesto si ripete. Descrivi il flusso e ti indico l'opzione piu efficiente.",
      default: "Sono ancora disponibile localmente. Chiedi normalmente; ragionero sulla situazione e manterro il prossimo passo calmo e pratico.",
    },
  },
  PT: {
    greeting: "Ola, sou o MRagent. Pergunte sobre uma mensagem, decisao, reserva, area especialista, creditos ou qual plano serve ao seu trabalho. Primeiro ajudo; so sugiro caminho pago quando realmente economiza tempo.",
    status: "Chat IA util",
    typingLabel: "Passagem pelo dicionario comportamental",
    placeholder: "Pergunte ao MRagent...",
    ready: "Pronto",
    suggestions: ["Ajude-me com uma resposta dificil", "Aja como psicologo neste caso", "Reservar uma sessao de video", "Podemos falar de outro assunto?"],
    links: { professionals: "Profissionais", tools: "Ferramentas", membership: "Assinatura" },
    fallbacks: {
      login: "Para entrar, use Entrar ou Criar conta. Se o acesso estiver temporariamente indisponivel, continue usando ferramentas e reservas publicas.",
      booking: "Para ajuda especializada, comece por Profissionais. Se ainda nao quiser reservar, diga a area e a situacao; posso dar uma previa cuidadosa com IA.",
      payment: "Creditos sao melhores para ferramentas pontuais. Assinatura e melhor quando o contexto se repete. Descreva o padrao de trabalho e eu indico a opcao mais eficiente.",
      default: "Continuo aqui localmente. Pergunte normalmente; vou pensar na situacao e manter o proximo passo calmo e pratico.",
    },
  },
};

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function replyDelay(message: string) {
  return Math.min(2200, 900 + message.length * 12);
}

export default function MRAgent() {
  const { language } = useLanguage();
  const agentCopy = AGENT_COPY[language] ?? AGENT_COPY.EN;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "agent", text: agentCopy.greeting }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    setMessages((current) => {
      if (current.length === 1 && current[0]?.role === "agent") {
        return [{ role: "agent", text: agentCopy.greeting }];
      }
      return current;
    });
  }, [agentCopy.greeting]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || typing) return;

    setMessages((current) => [...current, { role: "user", text: message }]);
    setInput("");
    setTyping(true);

    try {
      await sleep(replyDelay(message));
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, language }),
      });
      if (!response.ok) {
        throw new Error(`MR Agent failed with ${response.status}`);
      }
      const data = await response.json();
      setMessages((current) => [...current, { role: "agent", text: data.reply ?? agentCopy.fallbacks.default, source: data.source ?? "local" }]);
    } catch (error) {
      await sleep(700);
      const lower = message.toLowerCase();
      const fallback = lower.includes("login")
        ? agentCopy.fallbacks.login
        : lower.includes("book") || lower.includes("professional") || lower.includes("expert")
          ? agentCopy.fallbacks.booking
          : lower.includes("payment") || lower.includes("credit")
            ? agentCopy.fallbacks.payment
            : agentCopy.fallbacks.default;
      setMessages((current) => [...current, { role: "agent", text: fallback, source: "ready" }]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={`fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full shadow-xl transition-all hover:opacity-90 ${open ? "hidden" : ""}`} style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }} aria-label="Open MR Agent">
        <MessageCircle size={24} />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white animate-pulse" style={{ background: "hsl(43 80% 60%)" }} />
      </button>

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[hsl(40_25%_88%)]" style={{ maxHeight: "520px", background: "hsl(0 0% 100%)" }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: "hsl(220 55% 20%)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border flex items-center justify-center" style={{ background: "rgba(201,169,97,0.2)", borderColor: "rgba(201,169,97,0.4)" }}>
                <span className="font-serif font-bold text-sm" style={{ color: "hsl(43 80% 60%)" }}>MR</span>
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "hsl(43 70% 88%)" }}>MRagent</p>
                <p className="text-xs flex items-center gap-1" style={{ color: "hsl(43 80% 60%)" }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: "#34d399" }} /> {agentCopy.status}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="opacity-60 hover:opacity-100" style={{ color: "hsl(43 70% 88%)" }}><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "hsl(40 20% 92% / 0.3)" }}>
            {messages.map((message, index) => (
              <AIMessage key={index} from={message.role === "agent" ? "assistant" : "user"} className={message.role === "user" ? "items-end" : "items-start"}>
                <MessageContent className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === "agent" ? "rounded-tl-sm" : "rounded-tr-sm border border-[hsl(40_25%_88%)]"}`} style={message.role === "agent" ? { background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" } : { background: "white", color: "hsl(220 45% 13%)" }}>
                  {message.role === "agent" ? <MessageResponse>{message.text}</MessageResponse> : message.text}
                </MessageContent>
              </AIMessage>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5" style={{ background: "hsl(220 55% 20%)" }}>
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(248,245,240,0.62)" }}>{agentCopy.typingLabel}</span>
                  <span className="flex gap-1 items-center h-4">
                    {[0, 150, 300].map((delay) => <span key={delay} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "hsl(43 70% 88%)", animationDelay: `${delay}ms` }} />)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="px-3 pt-2 flex flex-wrap gap-1.5">
              {agentCopy.suggestions.map((suggestion) => (
                <button key={suggestion} onClick={() => send(suggestion)} className="text-xs px-2.5 py-1 rounded-full border hover:border-[hsl(43_80%_60%)] hover:text-[hsl(43_80%_60%)] transition-colors" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 45% 13%)" }}>{suggestion}</button>
              ))}
            </div>
          )}

          <div className="px-3 py-2 border-t border-[hsl(40_25%_88%)] flex flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1 rounded-full bg-[hsl(43_80%_60%_/_0.16)] px-2 py-1 font-semibold text-[hsl(220_55%_20%)]"><Sparkles size={11} /> {agentCopy.ready}</span>
            {[[agentCopy.links.professionals, "/professionals"], [agentCopy.links.tools, "/tools"], [agentCopy.links.membership, "/memberships"]].map(([label, href]) => (
              <Link key={href} href={href} className="flex items-center gap-0.5 text-[hsl(220_25%_45%)] hover:text-[hsl(220_55%_20%)] transition-colors">{label} <ChevronRight size={10} /></Link>
            ))}
          </div>

          <div className="p-3 border-t border-[hsl(40_25%_88%)]">
            <div className="flex gap-2">
              <input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send(input)} placeholder={agentCopy.placeholder} className="flex-1 text-sm rounded-lg px-3 py-2 outline-none border border-[hsl(40_25%_88%)] focus:border-[hsl(43_80%_60%)] transition-colors" style={{ background: "hsl(40 20% 92%)" }} />
              <button onClick={() => send(input)} disabled={!input.trim() || typing} className="px-3 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
