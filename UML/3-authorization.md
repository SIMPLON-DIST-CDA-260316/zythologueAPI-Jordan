# 3. Autorisation : lecture et écriture d'une ressource

Quatre niveaux d'accès :

| Niveau | Qui | Exemples | Vérifié par |
|---|---|---|---|
| Public | tout le monde | tous les `GET` du catalogue, `GET /beers/:id/reviews` | aucun middleware |
| Connecté | tout compte avec un jeton valide | `POST /beers/:id/reviews`, `GET /auth/me` | middleware `authenticate` |
| Admin | rôle `admin` | écriture du catalogue, `GET /beer-logs` | `requireAdmin` = `[authenticate, adminOnly]` |
| Propriétaire | l'auteur de la donnée (ou un admin pour la suppression) | `PATCH` / `DELETE /beers/:id/reviews/:reviewId` | `BeerReviewService` (règle métier) |

Codes d'erreur : **401** signifie « je ne sais pas qui tu es » (pas de jeton, jeton invalide ou expiré). **403** signifie « je sais qui tu es, mais tu n'as pas le droit ».

---

## 3a. Le middleware `authenticate` + `requireAdmin` (écriture dans le catalogue)

Exemple : `POST /api/v1/categories`. Le même enchaînement protège tous les `POST`, `PATCH` et `DELETE` du catalogue.

```mermaid
sequenceDiagram
    autonumber
    actor C as Client
    participant X as Express (Router)
    participant AM as authenticate
    participant AS as AuthService
    participant AR as AuthRepository
    participant DB as PostgreSQL
    participant AO as adminOnly
    participant V as validate(createCategorySchema)
    participant CC as CategoryController
    participant EH as errorHandler

    C->>X: POST /categories {name, description}<br/>+ en-tête Cookie: zythologue_auth=JWT
    X->>AM: requireAdmin = [authenticate, adminOnly]
    AM->>AM: readCookie(req, zythologue_auth)
    AM->>AS: authenticate(token)
    alt Pas de cookie
        AS-->>AM: throw UnauthorizedError
        AM-->>X: promesse rejetée
        X->>EH: next(err)
        EH-->>C: 401 Authentification requise
    else Cookie présent
        AS->>AS: jwt.verify(token, JWT_SECRET, { algorithms: [HS256] })
        alt Signature invalide, jeton mal formé ou expiré
            AS-->>AM: throw UnauthorizedError
            AM-->>X: promesse rejetée
            X->>EH: next(err)
            EH-->>C: 401 Session invalide ou expirée
        else Jeton valide
            AS->>AR: findById(Number(payload.sub))
            AR->>DB: SELECT ... FROM user WHERE id = $1
            DB-->>AR: 0 ou 1 ligne
            alt Compte supprimé depuis la connexion
                AR-->>AS: null
                AS-->>AM: throw UnauthorizedError
                AM-->>X: promesse rejetée
                X->>EH: next(err)
                EH-->>C: 401 Session invalide ou expirée
            else Compte trouvé
                AR-->>AS: User (rôle relu en base, pas dans le jeton)
                AS-->>AM: User
                AM->>AM: res.locals.user = User
                AM->>AO: next()
                alt Rôle client
                    AO-->>X: throw ForbiddenError
                    X->>EH: next(err)
                    EH-->>C: 403 Accès réservé aux administrateurs
                else Rôle admin
                    AO->>V: next()
                    Note over V: Validation seulement après l'autorisation :<br/>un anonyme n'obtient aucun retour sur le format attendu
                    V->>CC: body validé dans res.locals.body
                    CC-->>C: 201 Catégorie créée (service et repository habituels)
                end
            end
        end
    end
```

---

## 3b. Création d'un avis : l'écriture porte l'utilisateur du jeton

Exemple : Baptiste (client, id 2) note la bière 1 et tente de se faire passer pour l'utilisateur 99.

> Pour la lisibilité, les erreurs sont dessinées directement vers `errorHandler`. Le chemin réel est le même qu'en 3a : throw, puis promesse rejetée dans le controller, puis `next(err)` par Express.

```mermaid
sequenceDiagram
    autonumber
    actor C as Client
    participant AM as authenticate
    participant V as validate(params + body)
    participant RC as BeerReviewController
    participant RS as BeerReviewService
    participant RR as BeerReviewRepository
    participant DB as PostgreSQL
    participant EH as errorHandler

    C->>AM: POST /beers/1/reviews {grade: 8, comment, userId: 99}<br/>+ Cookie zythologue_auth
    alt Non connecté ou jeton invalide (détail en 3a)
        AM->>EH: throw UnauthorizedError
        EH-->>C: 401
    else Jeton valide
        AM->>AM: res.locals.user = Baptiste (id 2)
        AM->>V: next()
        alt grade hors de 1 à 10, ou comment vide
            V-->>C: 400 Données invalides
        else Body valide
            Note over V: Zod supprime la clé userId : le client<br/>ne choisit jamais l'auteur
            V->>RC: res.locals.params {id: 1}, res.locals.body {grade, comment}
            RC->>RS: addOne(beerId, user = res.locals.user, body)
            RS->>RR: beerExists(1)
            RR->>DB: SELECT id FROM beer WHERE id = $1
            alt Bière inexistante
                RS->>EH: throw NotFoundError
                EH-->>C: 404 Bière non trouvée
            else Bière trouvée
                RS->>RR: addOne(beerId, user.id, {grade, comment})
                RR->>DB: INSERT INTO beer_review (grade, comment, user_id, beer_id)<br/>RETURNING ...
                alt Déjà un avis sur cette bière (UNIQUE user_id + beer_id, code 23505)
                    RR->>EH: throw ConflictError
                    EH-->>C: 409 Vous avez déjà donné votre avis sur cette bière
                else Insertion réussie
                    RR-->>RS: BeerReview
                    RS-->>RC: BeerReview
                    RC-->>C: 201 {id, grade, comment, userId: 2, beerId: 1}
                end
            end
        end
    end
```

---

## 3c. Modification et suppression d'un avis : la règle du propriétaire

La route ne vérifie que l'identité (`authenticate`). Savoir si l'avis t'appartient demande de **le lire en base** : ce contrôle est donc une règle métier, écrite dans le service.

```mermaid
sequenceDiagram
    autonumber
    actor C as Client
    participant AM as authenticate
    participant V as validate(params + body)
    participant RC as BeerReviewController
    participant RS as BeerReviewService
    participant RR as BeerReviewRepository
    participant DB as PostgreSQL
    participant EH as errorHandler

    C->>AM: PATCH /beers/1/reviews/:reviewId {grade?, comment?}<br/>+ Cookie zythologue_auth
    AM->>AM: res.locals.user = utilisateur du jeton (détail en 3a)
    AM->>V: next()
    V->>RC: res.locals.params, res.locals.body
    RC->>RS: updateOneById(beerId, reviewId, user, body)
    RS->>RR: findOneById(reviewId, beerId)
    RR->>DB: SELECT ... FROM beer_review WHERE id = $1 AND beer_id = $2
    DB-->>RR: 0 ou 1 ligne
    RR-->>RS: BeerReview ou null
    alt Avis inexistant ou rattaché à une autre bière
        RS->>EH: throw NotFoundError
        EH-->>C: 404 Avis non trouvé
    else Avis trouvé mais review.userId ≠ user.id (y compris pour un admin)
        RS->>EH: throw ForbiddenError
        EH-->>C: 403 Vous ne pouvez modifier que vos propres avis
    else L'utilisateur est l'auteur
        RS->>RS: fusion : grade = body.grade ?? review.grade<br/>comment = body.comment si présent (null efface)
        RS->>RR: updateOneById(reviewId, {grade, comment})
        RR->>DB: UPDATE beer_review SET grade, comment WHERE id = $1 RETURNING ...
        RR-->>RS: BeerReview
        RS-->>RC: BeerReview
        RC-->>C: 200 Avis modifié
    end

    Note over C,EH: DELETE /beers/1/reviews/:reviewId suit le même flux, sans body.<br/>Condition de refus : review.userId ≠ user.id ET user.role ≠ admin.<br/>Un admin peut donc supprimer n'importe quel avis (modération) → 204
```
