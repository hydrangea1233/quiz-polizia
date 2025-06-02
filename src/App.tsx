import React, { useState, useRef, useEffect } from 'react';
import questions from './data/domande_2025.json';

function App() {

  // Logica del quiz
  const [usaDomandeAlternative, setUsaDomandeAlternative] = useState(false);
  const [categoria, setCategoria] = useState("__tutte__");
  const [numero, setNumero] = useState(5);
  const [numeroInput, setNumeroInput] = useState<string>("5");
  const [domande, setEstratte] = useState([]);
  const [risposteUtente, setRisposteUtente] = useState({});
  const [indiceCorrente, setIndiceCorrente] = useState(0);

  // Verifica e feedback
  const [mostraCorrette, setMostraCorrette] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [maxTime, setMaxTime] = useState(0);

  // Refs e overflow
  const countdownRef = useRef(null);
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const numeroRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [hasOverflow, setHasOverflow] = useState(false);

  const categorie = Object.keys(questions);
  console.log(questions);

  const resetQuiz = () => {
    setEstratte([]);
    setRisposteUtente({});
    setMostraCorrette(false);
    setCategoria('__tutte__');
    setNumero(5);
    setNumeroInput(5);
    setIndiceCorrente(0);
    stopTimer();
    resetCountdown();
    setUsaDomandeAlternative(false);
  };

  const handleNumeroDomande = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Accetta solo numeri, ma non forza subito
    if (/^\d*$/.test(val)) {
      setNumeroInput(val);
    }
  };

  const handleBlur = () => {
    const numero = Number(numeroInput);

    if (!numero || numero < 1) {
      setNumeroInput("1");
      setNumero(1);
      return;
    }

    if (numero > 100) {
      setNumeroInput("100");
      setNumero(100);
      return;
    }

    setNumero(numero);
  };

  const generaQuiz = async () => {
    let questionsToUse: any = usaDomandeAlternative
      ? (await import('./data/domande_alternative.json')).default
      : (await import('./data/domande_2025.json')).default;

    const lettere = ["A", "B", "C", "D", "E"];
    const mescolaOpzioni = (d: any) => {
      const entries = Object.entries(d.opzioni);
      const shuffle = entries.sort(() => Math.random() - 0.5);
      const nuoveOpzioni: any = {};
      let nuovaCorretta = "";
      shuffle.forEach(([letteraOrig, testo], index) => {
        const nuovaLettera = lettere[index];
        nuoveOpzioni[nuovaLettera] = testo;
        if (letteraOrig === d.corretta) {
          nuovaCorretta = nuovaLettera;
        }
      });
      startTimer();
      return {
        domanda: d.domanda,
        opzioni: nuoveOpzioni,
        corretta: nuovaCorretta,
        categoria: d.categoria
      };
    };
    let tutteDomande: any[] = [];
    if (categoria === "__tutte__") {
      for (const [catName, domandeCat] of Object.entries(questionsToUse)) {
        const annotate = (domandeCat as any[]).map(d => mescolaOpzioni({
          ...d,
          categoria: catName
        }));
        tutteDomande = tutteDomande.concat(annotate);
      }
    } else if (categoria && questionsToUse[categoria]) {
      tutteDomande = (questionsToUse[categoria] as any[]).map(d =>
        mescolaOpzioni({
          ...d,
          categoria
        })
      );
    } else {
      return;
    }
    const shuffle = [...tutteDomande].sort(() => Math.random() - 0.5);
    setEstratte(shuffle.slice(0, numero));
    setRisposteUtente({});
    setMostraCorrette(false);
    setIndiceCorrente(0);
    startCountdown(shuffle.slice(0, numero).length);
  };

  const selezionaRisposta = (index: number, lettera: string) => {
    if (mostraCorrette) return;
    setRisposteUtente(prev => ({ ...prev, [index]: lettera }));
  };

  const handleVerificaRisposte = (risposteDate: boolean) => {
    setMostraCorrette(risposteDate);
    stopTimer();
    stopCountdown();
  }

  useEffect(() => {
    if (timerRunning && remainingTime > 0) {
      countdownRef.current = window.setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
    }
    if (remainingTime === 0 && timerRunning) {
      setTimerRunning(false);
      setIsTimeUp(true);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [timerRunning, remainingTime]);

  useEffect(() => {
    const el = scrollBarRef.current;
    if (!el) return;
    const checkOverflow = () => {
      setHasOverflow(el.scrollWidth > el.clientWidth);
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [domande.length]);

  useEffect(() => {
    const currentBtn = numeroRefs.current[indiceCorrente];
    currentBtn?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [indiceCorrente]);

  const startTimer = () => {
    setTimerRunning(true);
  };

  const stopTimer = () => {
    setTimerRunning(false);
  };

  const startCountdown = (questionsCount: number) => {
    const time = Math.round(questionsCount * 54);
    setMaxTime(time);
    setRemainingTime(time);
    setIsTimeUp(false);
    setTimerRunning(true);
  };

  const stopCountdown = () => {
    setTimerRunning(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  const resetCountdown = () => {
    stopCountdown();
    setRemainingTime(0);
    setMaxTime(0);
    setIsTimeUp(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="p-4 min-h-screen bg-bgcolor text-[#333] flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-maincolor uppercase text-center">quiz concorso polizia</h1>
        <div className="mb-4">
          <label className="block mb-1 text-maincolor">Categoria:</label>
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="__tutte__">Tutte le categorie</option>
            {categorie.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-maincolor">Numero domande:</label>
          <input type="text"
            value={numeroInput}
            onChange={handleNumeroDomande}
            onBlur={handleBlur}
            min="1" max="100" className="w-full border p-2 rounded" />
        </div>
        <div className="mb-4 flex items-center gap-2">
          <input
            id="toggle-json"
            type="checkbox"
            checked={usaDomandeAlternative}
            onChange={(e) => setUsaDomandeAlternative(e.target.checked)}
            className="w-5 h-5 accent-maincolor"
          />
          <label htmlFor="toggle-json" className="text-maincolor">
            Usa soltanto le domande aggiunte nel 2025
          </label>
        </div>
        {domande.length === 0 && !mostraCorrette && (
          <div className="flex justify-center">
            <button
              onClick={generaQuiz}
              className="bg-maincolor hover:bg-maincolorhover text-white px-4 py-2 rounded-full shadow transition"
            >
              Genera
            </button>
          </div>
        )}
        {domande.length > 0 && !mostraCorrette && (
          <div className="mt-4 text-center">
            <button
              onClick={resetQuiz}
              className="bg-maincolor hover:bg-maincolorhover text-white px-4 py-2 rounded-full shadow transition"
            >Reset</button>
          </div>
        )}
        {domande.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="relative flex items-center justify-center">
              {hasOverflow && (
                <button
                  onClick={() => scrollBarRef.current?.scrollBy({ left: -100, behavior: "smooth" })}
                  className="absolute left-0 z-10 bg-white rounded p-1 text-maincolor shadow"
                >
                  ←
                </button>
              )}
              <div ref={scrollBarRef} className="mx-6 flex overflow-x-auto gap-2 py-2 px-4 whitespace-nowrap scrollbar-hide">
                {domande.map((_, index) => {
                  const rispostaUtente = risposteUtente[index];
                  const rispostaCorretta = domande[index].corretta;
                  const haRisposto = rispostaUtente !== undefined;
                  const èCorretta = rispostaUtente === rispostaCorretta;

                  let bgColor = 'bg-gray-100';
                  if (mostraCorrette && haRisposto) {
                    bgColor = èCorretta ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
                  } else if (haRisposto) {
                    bgColor = 'bg-maincolor text-white';
                  }
                  return (
                    <button
                      key={index}
                      ref={(el) => (numeroRefs.current[index] = el)}
                      className={`px-3 py-1 rounded-full border ${bgColor} ${index === indiceCorrente ? 'ring-2 ring-maincolor' : ''}`}
                      onClick={() => setIndiceCorrente(index)}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              {hasOverflow && (
                <button
                  onClick={() => scrollBarRef.current?.scrollBy({ left: 100, behavior: "smooth" })}
                  className="absolute right-0 z-10 bg-white rounded p-1 text-maincolor shadow"
                >
                  →
                </button>
              )}
            </div>
            {mostraCorrette && (
              <div className="mt-4 text-lg font-semibold text-maincolor text-center">
                Risposte corrette:{" "}
                {
                  domande.filter((q: any, i: number) => risposteUtente[i] === q.corretta).length
                }{" "}
                su {domande.length}
              </div>
            )}
            <div key={indiceCorrente} className="bg-white border border-cardborder p-4 rounded-xl shadow-sm">
              <p
                className={`text-center text-lg font-semibold transition-colors ${remainingTime > maxTime * 0.5
                  ? 'text-green-600'
                  : remainingTime > maxTime * 0.2
                    ? 'text-yellow-500'
                    : 'text-red-600'
                  }`}
              >
                {formatTime(remainingTime)}
              </p>
              {isTimeUp && <p className="text-red-600 text-center text-lg font-semibold mb-2">Tempo scaduto!</p>}
              <p className="text-sm text-gray-500 mb-1">Categoria: {domande[indiceCorrente].categoria}</p>
              <p className="font-semibold mb-2">
                {indiceCorrente + 1}. {domande[indiceCorrente].domanda}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(domande[indiceCorrente].opzioni).map(([lettera, testo]) => {
                  const isSelezionata = risposteUtente[indiceCorrente] === lettera;
                  const èCorretta = domande[indiceCorrente].corretta === lettera;
                  let colore = "border-[#ddd] bg-white hover:bg-[#f8f8f8]";
                  if (mostraCorrette) {
                    if (èCorretta) colore = "border-green-500 bg-green-100";
                    else if (isSelezionata && !èCorretta) colore = "border-red-500 bg-red-100";
                  } else if (isSelezionata) {
                    colore = "bg-optionbg border-maincolor text-maincolor";
                  }
                  return (
                    <button
                      key={lettera}
                      onClick={() => selezionaRisposta(indiceCorrente, lettera)}
                      className={`border ${colore} rounded p-2 text-left wrap-break-word`}
                    >
                      <strong>{lettera}</strong>: {testo}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setIndiceCorrente(i => Math.max(i - 1, 0))}
                  disabled={indiceCorrente === 0}
                  className={`px-4 py-2 rounded transition ${indiceCorrente === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-maincolor hover:bg-maincolorhover text-white'
                    }`}
                >{Object.keys(risposteUtente).length === domande.length ?
                  <span>←</span> :
                  <span>Precedente</span>
                  }</button>
                <button
                  onClick={() => setIndiceCorrente(i => Math.min(i + 1, domande.length - 1))}
                  disabled={indiceCorrente === domande.length - 1}
                  className={`px-4 py-2 rounded transition ${indiceCorrente === domande.length - 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-maincolor hover:bg-maincolorhover text-white'
                    }`}
                >{Object.keys(risposteUtente).length === domande.length ?
                  <span>→</span> :
                  <span>Successiva</span>
                  }</button>
              </div>
            </div>
            {!mostraCorrette && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => handleVerificaRisposte(true)}
                  disabled={Object.keys(risposteUtente).length !== domande.length || mostraCorrette}
                  className={`bg-maincolor hover:bg-maincolorhover text-white px-4 py-2 rounded-full shadow transition ${Object.keys(risposteUtente).length === domande.length && !mostraCorrette
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                  Verifica Risposte
                </button>
              </div>
            )}
          </div>
        )}
        {mostraCorrette && (
          <div className="mt-4 text-center">
            <button
              onClick={resetQuiz}
              className="bg-maincolor hover:bg-maincolorhover text-white px-4 py-2 rounded-full shadow transition"
            >Ricomincia</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;