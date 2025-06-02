import json

# Percorsi dei file
file_2024 = "domande_2024.json"
file_2025 = "domande_2025.json"
output_file = "differenze_solo_domanda_2025_categorie_corrette.json"

# Carica i dati JSON
with open(file_2024, "r", encoding="utf-8") as f1, open(file_2025, "r", encoding="utf-8") as f2:
    data_2024 = json.load(f1)
    data_2025 = json.load(f2)

# Funzione per normalizzare il testo delle domande
def normalizza_testo(domanda):
    return domanda.strip().lower()

# Crea un set con i testi delle domande del file 2024
testi_domande_2024 = set()
for categoria, domande in data_2024.items():
    for domanda in domande:
        testo_normalizzato = normalizza_testo(domanda["domanda"])
        testi_domande_2024.add(testo_normalizzato)

# Trova le nuove domande nel file 2025
differenze = {}
for categoria, domande in data_2025.items():
    nuove_domande = []
    for domanda in domande:
        testo_normalizzato = normalizza_testo(domanda["domanda"])
        if testo_normalizzato not in testi_domande_2024:
            nuove_domande.append(domanda)
    if nuove_domande:
        differenze[categoria] = nuove_domande

# Salva il risultato in un nuovo file
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(differenze, f, ensure_ascii=False, indent=2)

print(f"✅ File creato: {output_file}")
