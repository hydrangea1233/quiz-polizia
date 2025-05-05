import React, { useState, useRef, useEffect } from 'react';
import questions from './data/domande.json';

function App() {
  const [categoria, setCategoria] = useState('');
  const [numero, setNumero] = useState(5);
  const [domande, setEstratte] = useState([]);
  const [risposteUtente, setRisposteUtente] = useState<{ [index: number]: string }>({});
  const [mostraCorrette, setMostraCorrette] = useState(false);
  const [indiceCorrente, setIndiceCorrente] = useState(0);
  const [time, setTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [maxTime, setMaxTime] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const countdownRef = useRef<number | null>(null);
  const [mostraTutteLeDomande, setMostraTutteLeDomande] = useState(false);

  const categorie = Object.keys(questions);

  const resetQuiz = () => {
    setEstratte([]);
    setRisposteUtente({});
    setMostraCorrette(false);
    setCategoria('');
    setNumero(5);
    setIndiceCorrente(0);
    stopTimer();
    setTime(0);
    resetCountdown();
    setMostraTutteLeDomande(false);
  };

  const generaQuiz = () => {
    setMostraTutteLeDomande(false);
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
      for (const [catName, domandeCat] of Object.entries(questions)) {
        const annotate = (domandeCat as any[]).map(d => mescolaOpzioni({
          ...d,
          categoria: catName
        }));
        tutteDomande = tutteDomande.concat(annotate);
      }
    } else if (categoria && questions[categoria]) {
      tutteDomande = (questions[categoria] as any[]).map(d =>
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

  const startTimer = () => {
    setTime(0);
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

  const handleVerificaRisposte = (risposteDate: boolean) => {
    setMostraCorrette(risposteDate);
    setMostraTutteLeDomande(true);
    stopTimer();
    stopCountdown();
  }

  return (
    <div className="p-4 min-h-screen bg-[#e8eaee] text-[#333] flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-[#6A82AB]">Un quiz qualsiasi</h1>
        <div className="mb-4">
          <label className="block mb-1">Categoria:</label>
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Seleziona --</option>
            <option value="__tutte__">Tutte le categorie</option>
            {categorie.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1">Numero domande:</label>
          <input type="number" value={numero} onChange={e => setNumero(Number(e.target.value))} min="1" max="100" className="w-full border p-2 rounded" />
        </div>
        {!mostraCorrette && (
          <div className="flex justify-center">
            <button
              onClick={generaQuiz}
              className="bg-[#6A82AB] hover:bg-[#81A8CC] text-white px-4 py-2 rounded-full shadow transition"
            >
              Genera
            </button>
          </div>
        )}
        {domande.length > 0 && (
          <div className="mt-6 space-y-4">
            {mostraCorrette && (
              <div className="mt-4 text-lg font-semibold text-center text-[#6A82AB]">
                Risposte corrette:{" "}
                {
                  domande.filter((q: any, i: number) => risposteUtente[i] === q.corretta).length
                }{" "}
                su {domande.length}
              </div>
            )}
            {mostraTutteLeDomande
              ? domande.map((domanda, index) => (
                <div key={index} className="bg-white border border-[#e9d6dc] p-4 rounded-xl shadow-sm">
                  <p className="font-semibold mb-2">
                    {index + 1}: {domanda.domanda}
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(domande[index].opzioni).map(([lettera, testo]) => {
                      const isSelezionata = risposteUtente[index] === lettera;
                      const èCorretta = domande[index].corretta === lettera;
                      let colore = "border-[#ddd] bg-white hover:bg-[#f8f8f8]";
                      if (mostraCorrette) {
                        if (èCorretta) colore = "border-green-500 bg-green-100";
                        else if (isSelezionata && !èCorretta) colore = "border-red-500 bg-red-100";
                      } else if (isSelezionata) {
                        colore = "bg-[#e2f1ff] border-[#6A82AB] text-[#6A82AB]";
                      }

                      return (
                        <button
                          key={lettera}
                          disabled
                          className={`border ${colore} rounded p-2 text-left`}
                        >
                          <strong>{lettera}</strong>: {testo}
                        </button>
                      );
                    })}
                  </ul>
                </div>
              ))
              : (
                <div key={indiceCorrente} className="bg-white border border-[#e9d6dc] p-4 rounded-xl shadow-sm">
                  <p
                    className={`text-center text-lg font-semibold mb-2 transition-colors ${remainingTime > maxTime * 0.5
                      ? 'text-green-600'
                      : remainingTime > maxTime * 0.2
                        ? 'text-yellow-500'
                        : 'text-red-600'
                      }`}
                  >
                    {formatTime(remainingTime)}
                    {isTimeUp && <p className="text-red-600 text-center">Tempo scaduto!</p>}
                  </p>
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
                        colore = "bg-[#e2f1ff] border-[#6A82AB] text-[#6A82AB]";
                      }

                      return (
                        <button
                          key={lettera}
                          onClick={() => selezionaRisposta(indiceCorrente, lettera)}
                          className={`border ${colore} rounded p-2 text-left`}
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
                      className={`px-4 py-2 rounded transition ${indiceCorrente === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#6A82AB] hover:bg-[#81A8CC] text-white'
                        }`}
                    >← Precedente</button>
                    <button
                      onClick={() => setIndiceCorrente(i => Math.min(i + 1, domande.length - 1))}
                      disabled={indiceCorrente === domande.length - 1}
                      className={`px-4 py-2 rounded transition ${indiceCorrente === domande.length - 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#6A82AB] hover:bg-[#81A8CC] text-white'
                        }`}
                    >Successiva →</button>
                  </div>
                </div>
              )}
            {!mostraCorrette && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => handleVerificaRisposte(true)}
                  disabled={isTimeUp || Object.keys(risposteUtente).length !== domande.length || mostraCorrette}
                  className={`bg-[#6A82AB] hover:bg-[#81A8CC] text-white px-4 py-2 rounded-full shadow transition ${Object.keys(risposteUtente).length === domande.length && !mostraCorrette
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
              className="bg-[#6A82AB] hover:bg-[#81A8CC] text-white px-4 py-2 rounded-full shadow transition"
            >Ricomincia</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;