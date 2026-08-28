# Zythologue API

API REST de gestion de bières, développée dans le cadre du brief "Zythologue" (conception et implémentation d'une API CRUD).

## Stack technique

- **Node.js** / **TypeScript**
- **Express** pour le serveur HTTP
- **PostgreSQL** avec le driver **pg**, en requêtes SQL natives (pas d'ORM)
- **Zod** pour la validation des entrées

L'architecture est volontairement écrite en **programmation orientée objet** (classes `Repository` / `Service` / `Controller` par entité), un choix fait pour s'exercer sur ce paradigme plutôt qu'une nécessité technique du projet.

Chaque route suit la même chaîne de responsabilité :
- **Controller** : validation de forme de la requête (paramètres d'URL, body via Zod) et mapping vers les codes HTTP.
- **Service** : logique métier (règles de cohérence, vérifications d'existence en base).
- **Repository** : accès aux données, requêtes SQL paramétrées.

## Installation et démarrage

1. Copier `.env.sample` vers `.env` et renseigner les variables :
   ```
   POSTGRES_USER=...
   POSTGRES_PASSWORD=...
   POSTGRES_DB=...
   POSTGRES_PORT=5432
   ```
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

## Autres ressources

Le détail complet (body, query params, réponses, exemples) de chaque endpoint ci-dessous est disponible dans le Swagger UI (`/api-docs`), tenu à jour au fil des ajouts. Liste des routes disponibles, par ressource :

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

**`beer_log`** — journal d'audit en lecture seule, alimenté par un trigger PostgreSQL sur chaque insertion de bière
- `GET /api/v1/beer-logs`
