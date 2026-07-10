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

L'API est alors disponible sur `http://localhost:3000/api/beers` (port configurable via la variable d'environnement `PORT`).

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
  "breweryId": 2
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

En cas d'erreur serveur inattendue (code `500`), la réponse a la forme `{ "message": "..." }`.

---

## Endpoints

### GET /api/beers

Récupère la liste de toutes les bières.

**Paramètres** : aucun.

**Réponses**

| Code | Cas | Corps |
|---|---|---|
| 200 | Succès | Tableau de bières (voir [Ressource Beer](#ressource-beer)) |

```json
[
  { "id": 1, "name": "Chouffe", "description": "Bière belge ambrée épicée", "price": 3.5, "alcoholLevel": 8, "isAlcoholFree": false, "breweryName": "Brasserie d'Achouffe", "breweryId": 2 }
]
```

---

### GET /api/beers/:id

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

### POST /api/beers

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

### PATCH /api/beers/:id

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

### DELETE /api/beers/:id

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
