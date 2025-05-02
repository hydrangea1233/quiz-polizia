import React, { useState } from 'react';
import questions from './data/domande.json';

function App() {
  const [categoria, setCategoria] = useState('');
  const [numero, setNumero] = useState(5);
  const [estratte, setEstratte] = useState([]);
  const [risposteUtente, setRisposteUtente] = useState<{ [index: number]: string }>({});
  const [mostraCorrette, setMostraCorrette] = useState(false);
  const [indiceCorrente, setIndiceCorrente] = useState(0);

  const categorie = Object.keys(questions);

  const resetQuiz = () => {
    setEstratte([]);
    setRisposteUtente({});
    setMostraCorrette(false);
    setCategoria('');
    setNumero(5);
    setIndiceCorrente(0);
  };

  const generaQuiz = () => {
    const lettere = ["A", "B", "C", "D", "E"];

    // Funzione che mescola le opzioni e aggiorna la corretta
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
  };

  const selezionaRisposta = (index: number, lettera: string) => {
    if (mostraCorrette) return; // Blocca solo dopo la verifica
    setRisposteUtente(prev => ({ ...prev, [index]: lettera }));
    console.log(index, lettera);
  };


  return (
    <div className="p-4 min-h-screen bg-[#fef5f8] text-[#333] flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-[#CD3771]">Un quiz qualsiasi</h1>
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
          <input type="number" value={numero} onChange={e => setNumero(Number(e.target.value))} min={1} max={50} className="w-full border p-2 rounded" />
        </div>
        <div className="flex justify-center">
          <button
            onClick={generaQuiz}
            className="bg-[#CD3771] hover:bg-[#b02f64] text-white px-4 py-2 rounded-full shadow transition"
          >
            Genera
          </button>
        </div>
        <div className="mt-6 space-y-4">
          {estratte.length > 0 && (
            <div key={indiceCorrente} className="bg-white border border-[#e9d6dc] p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Categoria: {estratte[indiceCorrente].categoria}</p>
              <p className="font-semibold mb-2">
                {indiceCorrente + 1}. {estratte[indiceCorrente].domanda}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(estratte[indiceCorrente].opzioni).map(([lettera, testo]) => {
                  const isSelezionata = risposteUtente[indiceCorrente] === lettera;
                  const èCorretta = estratte[indiceCorrente].corretta === lettera;
                  let colore = "border-[#ddd] bg-white hover:bg-[#f8f8f8]";

                  if (mostraCorrette) {
                    if (èCorretta) colore = "border-green-500 bg-green-100";
                    else if (isSelezionata && !èCorretta) colore = "border-red-500 bg-red-100";
                  } else if (isSelezionata) {
                    colore = "bg-[#fbe6ee] border-[#CD3771] text-[#CD3771]";
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
                  className="flex flex-col sm:flex-row justify-between gap-2 mt-4"
                >← Precedente</button>
                <button
                  onClick={() => setIndiceCorrente(i => Math.min(i + 1, estratte.length - 1))}
                  disabled={indiceCorrente === estratte.length - 1}
                  className="flex flex-col sm:flex-row justify-between gap-2 mt-4"
                >Successiva →</button>
              </div>
            </div>
          )}
          {estratte.length > 0 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setMostraCorrette(true)}
                disabled={Object.keys(risposteUtente).length !== estratte.length || mostraCorrette}
                className={`bg-[#CD3771] hover:bg-[#b02f64] text-white px-4 py-2 rounded-full shadow transition ${Object.keys(risposteUtente).length === estratte.length && !mostraCorrette
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                  }`}
              >
                Verifica Risposte
              </button>
            </div>
          )}
          {mostraCorrette && (
            <div className="mt-4 text-lg font-semibold text-center">
              Risposte corrette:{" "}
              {
                estratte.filter((q: any, i: number) => risposteUtente[i] === q.corretta).length
              }{" "}
              su {estratte.length}
            </div>
          )}
          {mostraCorrette && (
            <div className="mt-4 text-center">
              <button
                onClick={resetQuiz}
                className="bg-[#CD3771] hover:bg-[#b02f64] text-white px-4 py-2 rounded-full shadow transition"
              >Ricomincia</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;