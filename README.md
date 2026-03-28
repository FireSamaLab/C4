# Estimateur C4 Construction (MVP)

MVP full-stack simple pour estimer les quantités de bois de charpente et le coût approximatif d'une maison neuve rectangulaire.

## Pile technologique
- Node.js
- Express
- HTML/CSS
- JavaScript Vanilla
- Stockage JSON local

## Installation et démarrage
1. Installer les dépendances :
   npm install
2. Démarrer le serveur :
   npm start
3. Ouvrir :
   http://localhost:3000

## Flux MVP
1. Créer un projet (avec téléversement facultatif du plan)
2. Saisir les hypothèses du projet
3. Mettre à jour les prix des matériaux/du bois
4. Générer l'estimation et consulter les résultats

## Remarques
- Il s'agit d'un estimateur approximatif, pas d'un outil d'ingénierie structurelle.
- Le stockage utilise des fichiers JSON locaux dans le dossier data.
- Les plans téléversés sont stockés dans uploads.
- La structure est conçue pour évoluer facilement plus tard (ex. lecture de plans par IA).
