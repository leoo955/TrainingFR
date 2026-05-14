# Documentation des APIs - Training FR

Ce projet a été réinitialisé pour ne conserver que la documentation des services et APIs utilisés.

## 1. Supabase (Backend & Database)
La plateforme utilise **Supabase** comme infrastructure backend principale.
- **Base de données :** PostgreSQL.
- **Authentification :** Système personnalisé basé sur le Pseudo Minecraft et un mot de passe (stocké de manière sécurisée via `crypt` dans Supabase).
- **ORM :** Prisma est utilisé pour interagir avec la base de données depuis le serveur Node.js/Express.
- **Rôles :** Gestion native des rôles via une table `profiles` (`owner`, `trainer`, `student`).

## 2. Crafty.gg (Rendu 3D Minecraft)
L'intégration de **Crafty.gg** permet l'affichage dynamique des skins Minecraft en 3D sur le site.
- **Usage :** Visualisation des avatars sur le Dashboard et la page de Lookup.
- **Fonctionnement :** Requête simple vers l'API de rendu de Crafty.gg en utilisant le pseudo ou l'UUID du joueur.

## 3. FranceTiers (Données Tactiques)
**FranceTiers** est la source de données pour le classement et la recherche tactique (Lookup) des joueurs de la scène PvP française.
- **Usage :** Récupération des paliers (tiers) et des statistiques compétitives des joueurs.
- **Intégration :** Les données sont récupérées pour enrichir les profils utilisateurs et faciliter le travail des trainers.

## 4. Architecture Globale (Historique)
- **Frontend :** React 19 + Vite + Tailwind CSS v4.
- **Animations :** Framer Motion (effets de glitch et transitions brutalisme).
- **Communication :** API REST (Express) faisant le pont entre le Frontend et Supabase.
