# Cahier des Charges - Projet Training FR

## 1. Description du Projet
Training FR est une plateforme web dédiée à la communauté Minecraft PvP française. Elle centralise les données de classement, propose des outils de recherche tactique et permet le recrutement de coachs certifiés.

## 2. Objectifs Principaux
*   Offrir une interface de recherche (Lookup) ultra-rapide connectée aux APIs MCTiers et FranceTiers.
*   Fournir un Wiki PvP interactif pour l'apprentissage des techniques avancées.
*   Gérer un système de rôles (Owner, Trainer, Student) sécurisé par Discord OAuth.
*   Permettre la liaison de compte Minecraft avec vérification automatique d'UUID.

## 3. Spécifications Fonctionnelles

### 3.1 Authentification & Profils
*   **Connexion :** Discord OAuth uniquement.
*   **Liaison Minecraft :** Saisie du pseudo, récupération de l'UUID via API Mojang/PlayerDB.
*   **Dashboard :**
    *   **Student :** Suivi de ses tiers, accès au Wiki.
    *   **Trainer :** Gestion de son roster d'élèves, modification du Wiki.
    *   **Owner :** Contrôle total des rôles et de la plateforme.

### 3.2 Recherche Tactique (Lookup)
*   Recherche par pseudo Minecraft.
*   Affichage 3D du skin via Crafty.gg.
*   Récupération des tiers (HT/LT) sur FranceTiers.
*   Récupération des rangs mondiaux sur MCTiers.

### 3.3 Wiki PvP
*   Contenu géré par blocs (Texte, Code, Alerte, Vidéo).
*   Éditeur WYSIWYG brutaliste pour les Owners et Trainers.

## 4. Stack Technique
*   **Frontend :** React 19, Vite, Tailwind CSS v4, Framer Motion.
*   **Backend :** Node.js (Express), Prisma ORM.
*   **Base de Données :** PostgreSQL (Supabase).
*   **APIs Externes :** FranceTiers, MCTiers, Crafty.gg, PlayerDB.

## 5. Délais et Phases
1.  **Phase 1 :** Socle technique (Backend Express + Prisma + Auth Discord).
2.  **Phase 2 :** Frontend Core (Design Brutaliste + Layouts).
3.  **Phase 3 :** Intégration APIs (Lookup & FranceTiers).
4.  **Phase 4 :** Wiki & Dashboard.
