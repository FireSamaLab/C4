# C4 Construction – MVP Estimation Charpente (Québec / Outaouais)

Application full-stack locale pour:

1. Importer une fois les prix d'une page catégorie RONA précise
2. Normaliser les dimensions de bois en clés (ex: 2x4x8)
3. Stocker les prix en JSON local
4. Utiliser ces prix dans un flux d'estimation de charpente simple

## Stack

- Node.js
- Express
- HTML
- CSS
- Vanilla JavaScript
- Stockage JSON local

## Installation

1. Installer Node.js (LTS recommandé)
2. Dans le dossier du projet:

   npm install

## Import one-time RONA

Commande:

npm run import:rona

Cette commande lit la page RONA configurée dans .env (ou .env.example), extrait les produits, puis écrit:

- data/raw-rona-prices.json (résultats bruts)
- data/lumber-prices.json (résultats normalisés pour l'estimateur)

## Démarrer l'application web

npm start

Puis ouvrir:

http://localhost:3000

## Charger les fichiers de démonstration (recommandé pour tests)

Commande:

npm run seed:demo

Cette commande remplace les fichiers actifs dans [data](data) avec les jeux de démo:

- [data/demo/projects.demo.json](data/demo/projects.demo.json)
- [data/demo/lumber-prices.demo.json](data/demo/lumber-prices.demo.json)
- [data/demo/prices.demo.json](data/demo/prices.demo.json)
- [data/demo/raw-rona-prices.demo.json](data/demo/raw-rona-prices.demo.json)

Les démos incluent les 4 types de projet de l'onglet Information projet:

- Construction neuve
- Rénovation
- Démolition / Rénovation
- Projet (terrasse, remise, etc.)

## Structure unifiée (active)

L'application active est maintenant **à la racine**:

- [server.js](server.js) (API Express)
- [index.html](index.html)
- [create-project.html](create-project.html)
- [project.html](project.html)
- [prices.html](prices.html)
- [scripts](scripts)
- [styles.css](styles.css)
- [data](data)

Les anciennes versions ont été archivées dans:

- [legacy-archive-20260328.zip](legacy-archive-20260328.zip)

Le dossier legacy a été supprimé et n'est plus utilisé par le flux MVP principal.

## Vues de l'application (navigation)

- Dashboard: [index.html](index.html)
- Prix matériaux: [prices.html](prices.html)
- Créer un projet: [create-project.html](create-project.html)
- Page projet (profil, pièces jointes, préparation IA): [project.html](project.html)

Le flux recommandé:
1. Créer un projet
2. Ouvrir le profil projet et renseigner plan/notes
3. Mettre à jour les prix via la vue Prix
4. Consulter les projets depuis le Dashboard

## Endpoints API principaux

- GET /api/health
- POST /api/import-rona-prices
- GET /api/lumber-prices
- POST /api/lumber-prices (override manuel)
- POST /api/estimate
- GET /api/projects (tableau de bord)

## Stockage local des prix

- data/raw-rona-prices.json: conserve tous les produits extraits, même non normalisés
- data/lumber-prices.json: conserve les clés normalisées utilisables par l'estimateur (ex: 2x4x8)

Les produits non normalisés restent dans le fichier brut et sont exclus du fichier propre.

## Hypothèses Québec / Outaouais

L'UI affiche:

Hypothèses par défaut pour estimation – Québec / Outaouais

Ces paramètres sont des hypothèses d'affaires pour estimation, et non une validation légale de conformité au Code.

## Déplacer le projet vers un autre PC (zip)

1. Fermer le serveur
2. Créer un .zip du dossier du projet
3. Exclure node_modules et .env
4. Sur le nouveau PC:
   - dézipper
   - npm install
   - copier .env.example vers .env au besoin
   - npm start

## Évolutions prévues (plus tard)

- Lecture de plans par IA
- Gestion complète sauvegarde/chargement projets
- Gestion des murs mécaniques/plomberie
- Mises à jour de prix en direct (non incluses dans ce MVP)
