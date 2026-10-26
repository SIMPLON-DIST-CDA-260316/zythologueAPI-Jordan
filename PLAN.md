## Brief — Dashboard Front React

Vous allez maintenant construire le **dashboard Front** qui viendra consommer l’API Express réalisée précédemment.

**Contrainte : 2 jours.** L'objectif n'est pas de créer un dashboard complet, mais de mettre en place une base propre et fonctionnelle : environnement, authentification et premiers appels API.

### Étapes

**1. Mettre en place l'environnement Docker**  
Compléter l'environnement existant avec le frontend **React + Vite**. À la fin, l'ensemble doit fonctionner via Docker : API Express, PostgreSQL, Adminer et Dashboard React/Vite, avec le **hot reload** actif.

**2. Choisir un template de dashboard React**  
Rechercher un template gratuit existant. L'objectif est d'**adapter plutôt que recréer** toute l'interface.

**3. Nettoyer et adapter le template**  
Supprimer tout ce qui n'est pas nécessaire au projet. Conserver uniquement :

- une page **Register** ;
- une page **Login** ;
- une page **Dashboard / Gestion des bières**.

**4. Connecter Register et Login à l'API**  
Faire fonctionner l'authentification avec l'API Express existante. Dans un premier temps, utilisez volontairement un **`fetch()` classique** afin de valider le fonctionnement avant d'ajouter de l'abstraction.

**5. Gérer le JWT**  
Récupérer le JWT renvoyé par l'API après authentification et le stocker côté client. Pour cet exercice, nous utiliserons **`localStorage` temporairement**.

**6. Refactoriser les appels API**  
Une fois l'authentification fonctionnelle, refactoriser le code : centraliser les appels API dans des **services** et remplacer progressivement les `fetch()` directs par **TanStack Query / Mutation**.

**7. Mettre en place le contexte d'authentification**  
Créer un `AuthContext` permettant à l'application de connaître l'état de l'utilisateur : utilisateur connecté, token disponible, connexion/déconnexion et accès aux pages protégées.

### Méthode de travail

> **Faire fonctionner → comprendre → refactoriser.**

Ne cherchez pas à tout abstraire dès le départ. Faites d'abord fonctionner le parcours **Register → Login → JWT → Dashboard**, puis améliorez progressivement l'architecture.

Vous pouvez utiliser l'IA pour vous assister, mais vous devez être capables **d'expliquer, adapter et défendre chaque choix technique et chaque ligne de code intégrée**.

### La suite

**1. Mettre en place un useContext() d'authentification**
Mettre en place un contexte d'auth, avec redirection par react-router vers /login des utilisateurs non authentifiés, autoriser les fetchs que aux utilisateurs authentifiés et admin dans le dashboard et ses entités. Créer 1 page dashboard pour une entité avec son CRUD sécurisé

**2. Nettoyer et valider le form du frontend**
Nettoyer et valider le form du frontend avant d'envoyer les données au back. Refctor pour partager zod dans le front et le back dans le monorepo plutôt que de tout dupliquer des deux côtés

**3. Optimiser les services**
Optimiser les services de fetch au sein de react pour respecter DRY, utiliser tanstack query. Optimiser les composants d'affichage du dashboard (datatable de shadCN, pagination, recherche , filtre), toujours pour respecter DRY et les meilleures pratiques.
