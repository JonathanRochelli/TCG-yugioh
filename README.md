# 🃏 Yu-Gi-Oh — Simulateur d'ouverture de Boosters

Une application web pour **ouvrir des boosters** et **collectionner de vraies cartes
Yu-Gi-Oh**. Choisis un booster, déchire le paquet, révèle tes cartes (les rares
brillent !) et complète ta collection. Données des cartes fournies par l'API
communautaire [YGOPRODeck](https://ygoprodeck.com/api-guide/).

> Projet fan, non affilié à Konami. Aucune carte n'est vendue ; tout est simulé.

## ✨ Fonctionnalités

- **Boutique de boosters** : plusieurs vrais sets classiques (Legend of Blue Eyes
  White Dragon, Metal Raiders, Pharaoh's Servant, Spell Ruler).
- **Ouverture animée** : déchirure du paquet, puis cartes qui se retournent une à une
  (flip 3D) avec **effet holographique** sur les raretés supérieures.
- **9 cartes par paquet** avec une distribution de rareté réaliste (8 communes + 1
  slot « foil » pondéré : Rare > Super Rare > Ultra Rare > Secret Rare).
- **Collection persistante** (localStorage) : doublons, rareté, recherche et
  **pourcentage de complétion par set**.
- **Économie** : pièces pour acheter des paquets, « poussière » gagnée en recyclant
  les doublons.
- **Limite quotidienne** : un nombre maximum de paquets par jour, remis à zéro chaque
  jour (affiché « X/Y paquets restants aujourd'hui »).

## 🚀 Démarrage

```bash
npm install
npm run dev      # serveur de développement (http://localhost:5173)
npm run build    # build de production (typecheck + bundle dans dist/)
npm run preview  # sert le build de production
npm test         # tests unitaires (Vitest)
```

## 🗂️ Structure

```
src/
  api/ygoprodeck.ts   # fetch API + cache localStorage + repli hors-ligne
  data/               # sets curatés + dataset de secours
  game/               # rareté, génération de paquet, économie, limite quotidienne
  store/collection.ts # état de la collection (localStorage)
  components/          # UI (boutique, ouverture, collection, modale…)
  __tests__/          # tests Vitest
```

## 🌐 À propos des données & du réseau

- Les cartes sont récupérées **au runtime, dans le navigateur**, depuis
  `https://db.ygoprodeck.com/api/v7/` (CORS activé). Les résultats sont mis en cache
  dans le `localStorage` (7 jours).
- **Repli hors-ligne** : si l'API n'est pas joignable (hors-ligne, proxy réseau
  bloquant), l'app se rabat automatiquement sur un petit jeu de cartes de démonstration
  embarqué. Un fetch qui n'aboutit pas est abandonné au bout de 8 s.
- Les illustrations proviennent de `images.ygoprodeck.com`. Si une image ne charge pas,
  une vignette de secours (nom + type) est affichée.

## ⚙️ Réglages

- `src/game/dailyLimit.ts` → `MAX_PACKS_PER_DAY` (défaut : 5).
- `src/game/economy.ts` → `PACK_COST`, `STARTING_COINS`, valeurs de poussière.
- `src/game/rarity.ts` → `FOIL_WEIGHTS` (probabilités du slot rare).
- `src/data/curatedSets.ts` → liste des boosters proposés.

## 📝 Limites connues

- La limite quotidienne et l'économie sont **côté client** (stockées dans le navigateur)
  et donc réinitialisables en vidant le `localStorage`. Suffisant pour un jeu sans
  serveur.
