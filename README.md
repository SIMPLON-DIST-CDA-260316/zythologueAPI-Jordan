# Zythologue API

API REST de gestion de bières, développée dans le cadre du brief "Zythologue" (conception et implémentation d'une API CRUD).

## Stack technique

- **Node.js** / **TypeScript**
- **Express** pour le serveur HTTP
- **PostgreSQL** avec le driver **pg**, en requêtes SQL natives (pas d'ORM)
- **Zod** pour la validation des entrées
- **argon2** (argon2id) pour le hachage des mots de passe
- **jsonwebtoken** pour la preuve d'identification (JWT transmis en cookie `httpOnly`)
- **express-rate-limit** pour limiter les tentatives de connexion (anti force brute)

L'architecture est volontairement écrite en **programmation orientée objet** (classes `Repository` / `Service` / `Controller` par entité), un choix fait pour s'exercer sur ce paradigme plutôt qu'une nécessité technique du projet.

Chaque route suit la même chaîne de responsabilité :
- **Middlewares** : contrôle d'accès (`authenticate`, `requireAdmin`), puis validation de forme avec Zod (`validate`). Leurs résultats sont déposés dans `res.locals` (`user`, `params`, `body`…).
- **Controller** : lit `res.locals`, appelle le service et choisit le code HTTP de succès.
- **Service** : logique métier (règles de cohérence, vérifications d'existence, règle du propriétaire).
- **Repository** : accès aux données, requêtes SQL paramétrées.
- **errorHandler** : toute erreur levée (`HttpError`) remonte jusqu'à lui. Express 5 transmet automatiquement les promesses rejetées à `next(err)`, et l'`errorHandler` les traduit en réponse HTTP.

## Installation et démarrage

1. Copier `.env.sample` vers `.env` et renseigner les variables :
   ```
   POSTGRES_USER=...
   POSTGRES_PASSWORD=...
   POSTGRES_DB=...
   POSTGRES_PORT=5432

   JWT_SECRET=...
   NODE_ENV=development
   ```
   - `JWT_SECRET` est **obligatoire** : l'API refuse de démarrer sans. Générer une valeur aléatoire avec :
     ```
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```
   - `NODE_ENV` vaut `development` par défaut. En `production`, le cookie d'authentification reçoit l'attribut `Secure` (envoyé uniquement en HTTPS).
2. Démarrer l'application et la base de données :
   ```
   npm run dev
   ```
3. Jouer la migration puis le seed (dans le conteneur `api`) :
   ```
   npm run db:migrate
   npm run db:seed
   ```

L'API est alors disponible sur `http://localhost:3000/api/v1/beers` (port configurable via la variable d'environnement `PORT`).

Une documentation interactive (Swagger UI) est disponible sur `http://localhost:3000/api-docs` : elle permet de consulter chaque endpoint et de l'exécuter directement contre l'API réelle ("Try it out").

## Ressource `Beer`

Exemple de représentation JSON d'une bière telle que renvoyée par l'API :

```json
{
  "id": 1,
  "name": "Chouffe",
  "description": "Bière belge ambrée épicée",
  "price": 3.5,
  "alcoholLevel": 8,
  "isAlcoholFree": false,
  "breweryName": "Brasserie d'Achouffe",
  "breweryId": 2,
  "categories": [{ "id": 1, "name": "Ambrée" }],
  "ingredients": [{ "id": 1, "name": "Houblon Saaz" }]
}
```

| Champ           | Type               | Description                                      |
|-----------------|--------------------|---------------------------------------------------|
| `id`            | number             | Identifiant unique de la bière                     |
| `name`          | string             | Nom de la bière (unique)                          |
| `description`   | string \| null     | Description libre                                  |
| `price`         | number             | Prix (≥ 0)                                        |
| `alcoholLevel`  | number             | Taux d'alcool en % (≥ 0)                          |
| `isAlcoholFree` | boolean            | `true` si `alcoholLevel < 0.5`, `false` sinon      |
| `breweryName`   | string             | Nom de la brasserie associée                       |
| `breweryId`     | number             | Identifiant de la brasserie associée                |
| `categories`    | `{id, name}[]`     | Catégories associées. Présent uniquement sur `GET /beers/:id`, `POST /beers` et `PATCH /beers/:id` (absent sur la liste `GET /beers`) |
| `ingredients`   | `{id, name}[]`     | Ingrédients associés. Mêmes conditions de présence que `categories` |

En cas d'erreur serveur inattendue (code `500`), la réponse a la forme `{ "message": "..." }`.

---

## Endpoints

### GET /api/v1/beers

Récupère une liste paginée de bières, avec filtrage et tri optionnels.

**Query params** (tous optionnels, toute clé non listée ci-dessous est rejetée en 400)

| Nom | Type | Valeurs acceptées | Défaut | Description |
|---|---|---|---|---|
| `breweryId` | number | entier positif | — | Filtre les bières d'une brasserie donnée |
| `categoryId` | number | entier positif | — | Filtre les bières associées à une catégorie donnée |
| `ingredientId` | number | entier positif | — | Filtre les bières associées à un ingrédient donné |
| `isAlcoholFree` | boolean | `true` \| `false` | — | Filtre par présence/absence d'alcool |
| `sortBy` | string | `price` \| `alcoholLevel` | tri par `id` | Champ de tri |
| `order` | string | `asc` \| `desc` | `asc` | Sens du tri |
| `page` | number | entier positif | `1` | Numéro de page |
| `limit` | number | entier positif, max 100 | `5` | Nombre de résultats par page |

**Exemple** : `GET /api/v1/beers?breweryId=2&sortBy=price&order=desc&page=1&limit=5`

**Réponses**

| Code | Cas | Corps |
|---|---|---|
| 200 | Succès | `{ data, page, limit, total, totalPages }` |
| 400 | Query param invalide ou clé inconnue | `{ "message": "Paramètres de requête invalides", "errors": {...} }` |

```json
{
  "data": [
    { "id": 1, "name": "Chouffe", "description": "Bière belge ambrée épicée", "price": 3.5, "alcoholLevel": 8, "isAlcoholFree": false, "breweryName": "Brasserie d'Achouffe", "breweryId": 2 }
  ],
  "page": 1,
  "limit": 5,
  "total": 12,
  "totalPages": 3
}
```

---

### GET /api/v1/beers/:id

Récupère une bière par son identifiant.

**Paramètres d'URL**

| Nom | Type | Règle |
|---|---|---|
| `id` | number | Entier positif |

**Réponses**

| Code | Cas | Corps |
|---|---|---|
| 200 | Bière trouvée | Objet bière |
| 400 | `id` non conforme (non numérique, non entier ou ≤ 0) | `{ "message": "L'identifiant n'est pas conforme" }` |
| 404 | Aucune bière avec cet id | `{ "message": "Bière non trouvée" }` |

---

### POST /api/v1/beers

Crée une nouvelle bière.

**Body attendu**

| Champ | Type | Obligatoire | Règles de validation |
|---|---|---|---|
| `name` | string | oui | non vide (après trim), 255 caractères max, doit être unique en base |
| `description` | string \| null | non | non vide (après trim) si fourni, `null` accepté |
| `price` | number | oui | ≥ 0 |
| `alcoholLevel` | number | oui | ≥ 0 |
| `isAlcoholFree` | boolean | oui | doit correspondre à `alcoholLevel` : `true` si `alcoholLevel < 0.5`, `false` sinon |
| `breweryId` | number | oui | entier positif, doit correspondre à une brasserie existante |

**Exemple de requête**

```json
{
  "name": "Chouffe",
  "description": "Bière belge ambrée épicée",
  "price": 3.5,
  "alcoholLevel": 8,
  "isAlcoholFree": false,
  "breweryId": 2
}
```

**Réponses**

| Code | Cas | Corps |
|---|---|---|
| 201 | Bière créée | Objet bière créé |
| 400 | Body invalide (champ manquant, type incorrect, ou `isAlcoholFree` incohérent avec `alcoholLevel`) | `{ "message": "Données invalides", "errors": {...} }` |
| 404 | `breweryId` ne correspond à aucune brasserie | `{ "message": "Brasserie non trouvée" }` |
| 409 | Une bière avec ce `name` existe déjà | `{ "message": "Une bière de ce nom existe déjà" }` |

---

### PATCH /api/v1/beers/:id

Modifie partiellement une bière existante. Seuls les champs envoyés dans le body sont modifiés ; les autres conservent leur valeur actuelle.

**Paramètres d'URL**

| Nom | Type | Règle |
|---|---|---|
| `id` | number | Entier positif |

**Body attendu** (tous les champs sont optionnels, mais au moins un doit être fourni)

| Champ | Type | Règles de validation |
|---|---|---|
| `name` | string | non vide (après trim), 255 caractères max, doit être unique en base |
| `description` | string \| null | non vide (après trim) si fourni, `null` accepté (efface la description) |
| `price` | number | ≥ 0 |
| `alcoholLevel` | number | ≥ 0 |
| `isAlcoholFree` | boolean | doit rester cohérent avec `alcoholLevel` une fois fusionné aux valeurs actuelles de la bière |
| `breweryId` | number | entier positif, doit correspondre à une brasserie existante |

**Exemple de requête** (modification du prix uniquement)

```json
{
  "price": 3.9
}
```

**Réponses**

| Code | Cas | Corps |
|---|---|---|
| 200 | Bière mise à jour | Objet bière mis à jour |
| 400 | `id` non conforme | `{ "message": "L'identifiant n'est pas conforme" }` |
| 400 | Body vide ou invalide | `{ "message": "Données invalides", "errors": {...} }` ou `{ "message": "Aucun champ à modifier" }` |
| 400 | `isAlcoholFree`/`alcoholLevel` incohérents après fusion avec l'état actuel | `{ "message": "isAlcoholFree doit correspondre au taux d'alcool (sans alcool si < 0.5%, avec alcool sinon)" }` |
| 404 | Bière non trouvée | `{ "message": "Bière non trouvée" }` |
| 404 | `breweryId` fourni ne correspond à aucune brasserie | `{ "message": "Brasserie non trouvée" }` |
| 409 | Une autre bière porte déjà le nouveau `name` | `{ "message": "Une bière de ce nom existe déjà" }` |

---

### DELETE /api/v1/beers/:id

Supprime une bière par son identifiant.

**Paramètres d'URL**

| Nom | Type | Règle |
|---|---|---|
| `id` | number | Entier positif |

**Réponses**

| Code | Cas | Corps |
|---|---|---|
| 204 | Bière supprimée | (vide) |
| 400 | `id` non conforme | `{ "message": "L'identifiant n'est pas conforme" }` |
| 404 | Aucune bière avec cet id | `{ "message": "Bière non trouvée" }` |

---

## Ressource `Brewery`

Exemple de représentation JSON d'une brasserie telle que renvoyée par l'API :

```json
{
  "id": 2,
  "name": "Brasserie d'Achouffe",
  "description": "Brasserie ardennaise fondée en 1982",
  "country": "Belgique",
  "city": "Achouffe",
  "website": "https://www.achouffe.be",
  "beerCount": 4
}
```

| Champ         | Type            | Description                                     |
|---------------|-----------------|-------------------------------------------------|
| `id`          | number          | Identifiant unique de la brasserie              |
| `name`        | string          | Nom de la brasserie (unique)                    |
| `description` | string          | Description libre (obligatoire)                 |
| `country`     | string          | Pays de la brasserie                            |
| `city`        | string          | Ville de la brasserie                           |
| `website`     | string \| null  | Site web de la brasserie                        |
| `beerCount`   | number          | Nombre de bières rattachées à cette brasserie   |

---

### GET /api/v1/breweries

Récupère une liste paginée de brasseries, avec filtrage et tri optionnels.

**Query params** (tous optionnels, toute clé non listée ci-dessous est rejetée en 400)

| Nom | Type | Valeurs acceptées | Défaut | Description |
|---|---|---|---|---|
| `country` | string | non vide | — | Filtre sur le pays (correspondance exacte) |
| `city` | string | non vide | — | Filtre sur la ville (correspondance exacte) |
| `name` | string | non vide | — | Recherche partielle sur le nom, insensible à la casse |
| `sortBy` | string | `name` | tri par `id` | Champ de tri |
| `order` | string | `asc` \| `desc` | `asc` | Sens du tri |
| `page` | number | entier positif | `1` | Numéro de page |
| `limit` | number | entier positif, max 100 | `5` | Nombre de résultats par page |

**Exemple** : `GET /api/v1/breweries?country=Belgique&name=chou&sortBy=name&order=asc&page=1&limit=5`

**Réponses**

| Code | Cas | Corps |
|---|---|---|
| 200 | Succès | `{ data, page, limit, total, totalPages }` |
| 400 | Query param invalide ou clé inconnue | `{ "message": "Paramètres de requête invalides", "errors": {...} }` |

```json
{
  "data": [
    { "id": 2, "name": "Brasserie d'Achouffe", "description": "Brasserie ardennaise fondée en 1982", "country": "Belgique", "city": "Achouffe", "website": "https://www.achouffe.be", "beerCount": 4 }
  ],
  "page": 1,
  "limit": 5,
  "total": 21,
  "totalPages": 5
}
```

---

### GET /api/v1/breweries/:id

Récupère une brasserie par son identifiant.

**Paramètres d'URL**

| Nom | Type | Règle |
|---|---|---|
| `id` | number | Entier positif |

**Réponses**

| Code | Cas | Corps |
|---|---|---|
| 200 | Brasserie trouvée | Objet brasserie |
| 400 | `id` non conforme (non numérique, non entier ou ≤ 0) | `{ "message": "L'identifiant n'est pas conforme" }` |
| 404 | Aucune brasserie avec cet id | `{ "message": "Brasserie non trouvée" }` |

---

### POST /api/v1/breweries

Crée une nouvelle brasserie.

**Body attendu**

| Champ | Type | Obligatoire | Règles de validation |
|---|---|---|---|
| `name` | string | oui | non vide (après trim), 255 caractères max, doit être unique en base |
| `description` | string | oui | non vide (après trim) |
| `country` | string | oui | non vide (après trim), 100 caractères max |
| `city` | string | oui | non vide (après trim), 100 caractères max |
| `website` | string \| null | non | URL valide (2048 caractères max) si fourni, `null` accepté |

**Exemple de requête**

```json
{
  "name": "Brasserie d'Achouffe",
  "description": "Brasserie ardennaise fondée en 1982",
  "country": "Belgique",
  "city": "Achouffe",
  "website": "https://www.achouffe.be"
}
```

**Réponses**

| Code | Cas | Corps |
|---|---|---|
| 201 | Brasserie créée | Objet brasserie créé (`beerCount` vaut `0`) |
| 400 | Body invalide (champ manquant, type incorrect, `website` mal formée) | `{ "message": "Données invalides", "errors": {...} }` |
| 409 | Une brasserie avec ce `name` existe déjà | `{ "message": "Une brasserie de ce nom existe déjà" }` |

---

### PATCH /api/v1/breweries/:id

Modifie partiellement une brasserie existante. Seuls les champs envoyés dans le body sont modifiés ; les autres conservent leur valeur actuelle.

**Paramètres d'URL**

| Nom | Type | Règle |
|---|---|---|
| `id` | number | Entier positif |

**Body attendu** (tous les champs sont optionnels, mais au moins un doit être fourni)

| Champ | Type | Règles de validation |
|---|---|---|
| `name` | string | non vide (après trim), 255 caractères max, doit être unique en base |
| `description` | string | non vide (après trim) |
| `country` | string | non vide (après trim), 100 caractères max |
| `city` | string | non vide (après trim), 100 caractères max |
| `website` | string \| null | URL valide si fourni, `null` accepté (efface le site web) |

**Exemple de requête** (modification de la ville uniquement)

```json
{
  "city": "Houffalize"
}
```

**Réponses**

| Code | Cas | Corps |
|---|---|---|
| 200 | Brasserie mise à jour | Objet brasserie mis à jour |
| 400 | `id` non conforme | `{ "message": "L'identifiant n'est pas conforme" }` |
| 400 | Body vide ou invalide | `{ "message": "Données invalides", "errors": {...} }` ou `{ "message": "Aucun champ à modifier" }` |
| 404 | Brasserie non trouvée | `{ "message": "Brasserie non trouvée" }` |
| 409 | Une autre brasserie porte déjà le nouveau `name` | `{ "message": "Une brasserie de ce nom existe déjà" }` |

---

### DELETE /api/v1/breweries/:id

Supprime une brasserie par son identifiant.

> ⚠️ **Suppression en cascade.** Les bières de la brasserie, leurs photos, ainsi que les photos, avis et favoris de la brasserie sont supprimés avec elle (`ON DELETE CASCADE`). Les fichiers image correspondants sont effacés du disque.

**Paramètres d'URL**

| Nom | Type | Règle |
|---|---|---|
| `id` | number | Entier positif |

**Réponses**

| Code | Cas | Corps |
|---|---|---|
| 204 | Brasserie supprimée | (vide) |
| 400 | `id` non conforme | `{ "message": "L'identifiant n'est pas conforme" }` |
| 404 | Aucune brasserie avec cet id | `{ "message": "Brasserie non trouvée" }` |

---

## Authentification

Les diagrammes de séquence (Mermaid, avec l'export PDF dans [`UML/pdf/`](UML/pdf/)) :
- [1. Enregistrement](UML/1-register.md)
- [2. Identification](UML/2-login.md)
- [3. Autorisation : middleware, rôles, propriétaire](UML/3-authorization.md)

### POST /api/v1/auth/register

Crée un compte utilisateur. Le mot de passe est haché (argon2id) avant stockage et n'est jamais renvoyé.

**Body attendu** (toute clé non listée, par exemple `role`, est ignorée : un compte est toujours créé avec le rôle `client`)

| Champ | Type | Obligatoire | Règles de validation |
|---|---|---|---|
| `lastName` | string | oui | non vide (après trim), 100 caractères max |
| `firstName` | string | oui | non vide (après trim), 100 caractères max |
| `email` | string | oui | email valide, 255 caractères max, converti en minuscules, doit être unique en base |
| `birthDate` | string | oui | date `YYYY-MM-DD`, au moins 18 ans, postérieure au 1900-01-01 |
| `password` | string | oui | 8 à 255 caractères, au moins une minuscule, une majuscule, un chiffre et un caractère spécial |

**Exemple de requête**

```json
{
  "lastName": "Durand",
  "firstName": "Jean",
  "email": "jean.durand@example.com",
  "birthDate": "1995-06-15",
  "password": "Motdepasse123!"
}
```

**Réponses**

| Code | Cas | Corps |
|---|---|---|
| 201 | Compte créé | `{ id, lastName, firstName, email, birthDate, role, createdAt }` |
| 400 | Body invalide (champ manquant, email invalide, mineur, mot de passe faible) | `{ "message": "Données invalides", "errors": {...} }` |
| 409 | Un compte existe déjà avec cet email | `{ "message": "Un compte existe déjà avec cet email" }` |

---

### POST /api/v1/auth/login

Identifie un utilisateur par email et mot de passe. En cas de succès, la preuve d'identification (JWT) est déposée dans un cookie ; elle n'apparaît **jamais** dans le body.

**Body attendu**

| Champ | Type | Obligatoire | Règles de validation |
|---|---|---|---|
| `email` | string | oui | email valide, converti en minuscules |
| `password` | string | oui | 1 à 255 caractères |

**Réponses**

| Code | Cas | Corps |
|---|---|---|
| 200 | Identification réussie | `{ "message": "Connexion réussie" }` + en-tête `Set-Cookie` |
| 400 | Body invalide | `{ "message": "Données invalides", "errors": {...} }` |
| 400 | Email inconnu **ou** mot de passe incorrect (message identique, pour ne pas révéler l'existence d'un compte) | `{ "message": "Email ou mot de passe incorrect" }` |
| 429 | Plus de 5 échecs en 15 min depuis la même IP | `{ "message": "Trop de tentatives de connexion, réessayez dans 15 minutes" }` |

**Limitation des tentatives** : seuls les échecs (400) sont comptés, une connexion réussie ne consomme pas le quota. Une fois la limite atteinte, toute tentative depuis cette IP reçoit un 429 jusqu'à la fin de la fenêtre, y compris avec le bon mot de passe. Les en-têtes `RateLimit` et `Retry-After` indiquent le délai restant. Le compteur est gardé en mémoire : il est remis à zéro au redémarrage de l'API.

**Cookie** : `zythologue_auth=<JWT>; HttpOnly; SameSite=Strict; Max-Age=3600` (+ `Secure` si `NODE_ENV=production`)

**JWT** : signé en HS256 avec `JWT_SECRET`, valable 1 h. Payload : `sub` (id de l'utilisateur), `role`, `iat`, `exp`.

---

### GET /api/v1/auth/me

Renvoie l'utilisateur connecté. Cette route ne fait que renvoyer `res.locals.user`, déposé par le middleware `authenticate` : c'est la démonstration la plus directe du middleware.

**Réponses**

| Code | Cas | Corps |
|---|---|---|
| 200 | Jeton valide | `{ id, lastName, firstName, email, birthDate, role, createdAt }` |
| 401 | Pas de cookie | `{ "message": "Authentification requise" }` |
| 401 | Jeton invalide (signature, format), expiré, ou compte supprimé depuis | `{ "message": "Session invalide ou expirée" }` |

---

## Autorisation

### Le middleware `authenticate`

Défini dans [`src/middlewares/auth.ts`](src/middlewares/auth.ts), il enchaîne quatre étapes :
1. Il lit le JWT dans le cookie `zythologue_auth`, en analysant directement l'en-tête `Cookie` (sans `cookie-parser`).
2. Il le vérifie avec `AuthService.authenticate`, qui appelle `jwt.verify` avec l'algorithme **imposé** `HS256`. Une signature invalide, un jeton mal formé ou expiré donnent une 401.
3. Il **recharge l'utilisateur en base** à partir de `sub`. Le rôle utilisé est donc celui de la base, et non celui écrit dans le jeton : un compte supprimé ou rétrogradé perd ses droits immédiatement, sans attendre l'expiration.
4. Il dépose l'utilisateur dans `res.locals.user`, où les controllers le récupèrent.

`requireAdmin` vaut `[authenticate, adminOnly]` : il authentifie, puis refuse (403) tout rôle autre que `admin`. Dans chaque route, le contrôle d'accès passe **avant** la validation et l'upload : un anonyme n'obtient aucun retour sur le format attendu, et aucun fichier n'est mis en mémoire pour lui.

### Qui peut faire quoi

| Accès | Routes | Refus |
|---|---|---|
| **Public** | tous les `GET` du catalogue (`/beers`, `/breweries`, `/categories`, `/ingredients`, photos), `GET /beers/:id/reviews`, `POST /auth/register`, `POST /auth/login` | — |
| **Connecté** | `GET /auth/me`, `POST /beers/:id/reviews` | 401 |
| **Auteur** | `PATCH /beers/:id/reviews/:reviewId` (même un admin ne modifie pas l'avis d'un autre) | 401, 403 |
| **Auteur ou admin** | `DELETE /beers/:id/reviews/:reviewId` (modération) | 401, 403 |
| **Admin** | tous les `POST` / `PATCH` / `DELETE` du catalogue (bières, brasseries, catégories, ingrédients, photos, liaisons `beer_category` / `beer_ingredient`), `GET /beer-logs` | 401, 403 |

Toutes les routes protégées peuvent donc répondre, en plus des codes documentés pour chaque endpoint :

| Code | Signification | Corps |
|---|---|---|
| 401 | Je ne sais pas qui tu es : pas de cookie, jeton invalide ou expiré | `{ "message": "Authentification requise" }` ou `{ "message": "Session invalide ou expirée" }` |
| 403 | Je sais qui tu es, mais tu n'as pas le droit | `{ "message": "Accès réservé aux administrateurs" }` ou un message propre à la ressource |

Comptes du seed pour tester (mot de passe `Motdepasse123!`) : `alice.dupont@example.com` (**admin**), `baptiste.martin@example.com` (**client**).

---

## Avis sur les bières (`beer_review`)

C'est la ressource personnelle de chaque utilisateur. **L'auteur d'un avis est toujours l'utilisateur du jeton** : le body ne contient pas de `userId`, et s'il en contient un, Zod le supprime.

```json
{
  "id": 26,
  "grade": 8,
  "comment": "Belle brune, un peu sucrée",
  "createdAt": "2026-09-30T12:55:52.881Z",
  "userId": 2,
  "beerId": 1
}
```

### GET /api/v1/beers/:id/reviews

Liste les avis d'une bière (public). Réponses : `200` (tableau), `400` (`id` non conforme), `404` (bière non trouvée).

### POST /api/v1/beers/:id/reviews

Ajoute un avis de l'utilisateur connecté sur la bière.

| Champ | Type | Obligatoire | Règles de validation |
|---|---|---|---|
| `grade` | number | oui | entier de 1 à 10 |
| `comment` | string \| null | non | non vide (après trim) si fourni |

| Code | Cas |
|---|---|
| 201 | Avis créé (`userId` = utilisateur du jeton) |
| 400 | Body invalide |
| 401 | Non connecté |
| 404 | Bière non trouvée |
| 409 | L'utilisateur a déjà donné son avis sur cette bière (un seul avis par personne et par bière) |

### PATCH /api/v1/beers/:id/reviews/:reviewId

Modifie partiellement son propre avis (`grade` et/ou `comment`, au moins un champ). `comment: null` efface le commentaire.

| Code | Cas |
|---|---|
| 200 | Avis modifié |
| 400 | Body vide ou invalide, ou identifiant non conforme |
| 401 | Non connecté |
| 403 | L'avis appartient à quelqu'un d'autre, même pour un admin : `{ "message": "Vous ne pouvez modifier que vos propres avis" }` |
| 404 | Avis inexistant, ou rattaché à une autre bière que `:id` |

### DELETE /api/v1/beers/:id/reviews/:reviewId

Supprime un avis. Seuls l'auteur ou un admin (modération) le peuvent.

| Code | Cas |
|---|---|
| 204 | Avis supprimé |
| 401 | Non connecté |
| 403 | Ni auteur ni admin : `{ "message": "Vous ne pouvez supprimer que vos propres avis" }` |
| 404 | Avis inexistant, ou rattaché à une autre bière que `:id` |

---

## Autres ressources

Le détail complet (body, query params, réponses, exemples) de chaque endpoint ci-dessous est disponible dans le Swagger UI (`/api-docs`), tenu à jour au fil des ajouts. Comme pour `Beer` et `Brewery`, les `GET` sont publics et toute écriture est réservée aux admins (voir [Autorisation](#autorisation)). Liste des routes disponibles, par ressource :

**Photos** (sous-ressources de `beer` et `brewery`)
- `GET/POST /api/v1/beers/:id/photos`, `DELETE /api/v1/beers/:id/photos/:photoId`
- `GET/POST /api/v1/breweries/:id/photos`, `DELETE /api/v1/breweries/:id/photos/:photoId`

**`Category`** — CRUD complet, même forme que `Brewery` (`id`, `name`, `description`)
- `GET /api/v1/categories`, `GET /api/v1/categories/:id`, `POST /api/v1/categories`, `PATCH /api/v1/categories/:id`, `DELETE /api/v1/categories/:id`

**`Ingredient`** — CRUD complet (`id`, `name`, `description` nullable)
- `GET /api/v1/ingredients`, `GET /api/v1/ingredients/:id`, `POST /api/v1/ingredients`, `PATCH /api/v1/ingredients/:id`, `DELETE /api/v1/ingredients/:id`

**`beer_category` / `beer_ingredient`** (tables de liaison, écriture seule — la lecture passe par `categories`/`ingredients` embarqués dans `GET /beers/:id`, cf. ressource `Beer` ci-dessus)
- `POST /api/v1/beers/:id/categories` (body `{categoryId}`), `DELETE /api/v1/beers/:id/categories/:categoryId`
- `POST /api/v1/beers/:id/ingredients` (body `{ingredientId}`), `DELETE /api/v1/beers/:id/ingredients/:ingredientId`

**`beer_log`** — journal d'audit en lecture seule, alimenté par un trigger PostgreSQL sur chaque insertion de bière, **réservé aux admins**
- `GET /api/v1/beer-logs`

---

## Tests (Bruno)

La collection [`bruno/zythologue-api/`](bruno/zythologue-api/) s'utilise avec l'environnement `Local`. Bruno garde le cookie d'authentification entre les requêtes, comme un navigateur.

- **`auth/`** : inscription, connexion, `Me`. Les requêtes `Login admin` et `Login client` connectent les comptes du seed.
- **`authorization/`** : scénario 401, puis 403, puis 201 sur le catalogue (anonyme, puis client, puis admin).
- **`beers/reviews/`** : scénario complet des avis (auteur tiré du jeton, doublon, propriétaire, modération admin). Le scénario supprime l'avis qu'il crée : on peut le relancer.
- Les requêtes d'écriture des autres dossiers (`beers/`, `categories/`…) demandent d'être connecté en admin : lancer d'abord `auth/Login admin`.

Les requêtes « anonymes » utilisent `{{anonBaseUrl}}` (`127.0.0.1` au lieu de `localhost`). Bruno range ses cookies par domaine, donc ces requêtes partent sans cookie, même si une session est ouverte sur `localhost`.

En ligne de commande : `npx @usebruno/cli run beers/reviews --env Local`, à lancer depuis `bruno/zythologue-api/`.
