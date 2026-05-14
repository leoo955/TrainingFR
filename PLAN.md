# Plan d'Action - Écosystème Training FR

Ce document récapitule les étapes accomplies et les objectifs immédiats pour finaliser la plateforme.

## ✅ Accomplissements
1.  **Migration Design** : Tous les fichiers HTML bruts ont été transformés en composants React 19 modernes avec Framer Motion.
2.  **Système d'Authentification** : Mise en place d'un flux complet Discord OAuth2 + JWT.
3.  **Onboarding Minecraft** : Ajout d'une étape obligatoire après le login pour lier son pseudo Minecraft.
4.  **Integration FranceTiers** : Connexion réelle à l'API FranceTiers pour récupérer les paliers (CRYSTAL, SWORD, etc.), le rang et les points.
5.  **Base de Données** : Configuration Prisma + Supabase prête pour stocker les profils et les sessions.
6.  **Dev Tools** : Toolbar pour switcher de rôle (Owner/Trainer/Student) instantanément en mode développement.

## 🚀 Prochaines Étapes Immédiates
1.  **Personnalisation Totale des Dashboards** :
    - Remplacer les placeholders "PLAYER" ou "COACH" par le vrai pseudo Minecraft de l'utilisateur.
    - Charger automatiquement le skin 3D correspondant au pseudo.
    - Afficher les vrais paliers FranceTiers dès l'ouverture du Dashboard (sans avoir à chercher).
2.  **Gestion des Sessions (Bot)** :
    - Finaliser la détection des messages "TRAIN VALIDÉ" sur Discord pour remplir automatiquement la base de données.
    - Afficher ces sessions en temps réel dans l'historique du Dashboard.
3.  **Finalisation Wiki** :
    - Brancher la table `Resource` pour permettre aux trainers d'ajouter du contenu technique directement depuis l'interface.

## 🛠️ Configuration Requise (Utilisateur)
- **Supabase** : Exécuter le contenu de `setup.sql` dans le SQL Editor pour créer les tables.
- **Discord** : Configurer les "Intents" (Message Content) et le "Redirect URI" sur le Developer Portal.
- **Environnement** : Remplir les fichiers `.env` avec les secrets récupérés.

---
*Jarvis - Assistant de Développement*
