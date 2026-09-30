# 2. Identification : `POST /api/v1/auth/login`

La preuve d'identification (JWT signé) est déposée dans un cookie `httpOnly` : elle n'apparaît jamais dans le body, et le JavaScript du navigateur ne peut pas la lire.

```mermaid
sequenceDiagram
    autonumber
    actor C as Client
    participant X as Express (Router)
    participant RL as loginRateLimiter
    participant V as validate(loginSchema)
    participant AC as AuthController
    participant AS as AuthService
    participant AR as AuthRepository
    participant DB as PostgreSQL
    participant EH as errorHandler

    C->>X: POST /auth/login {email, password}
    X->>RL: requête
    alt Plus de 5 échecs en 15 min depuis cette IP
        RL->>X: next(TooManyRequestsError)
        X->>EH: next(err)
        EH-->>C: 429 Trop de tentatives + en-têtes RateLimit et Retry-After
    else Quota disponible
        Note over RL: Une connexion réussie ne consomme pas le quota,<br/>seuls les échecs (400) comptent
        RL->>V: next()
        alt Body invalide (email invalide, MDP vide)
            V-->>C: 400 Données invalides + détail par champ
        else Body valide
            V->>AC: next(), body parsé dans res.locals.body (email normalisé)
            AC->>AS: login(body)
            AS->>AR: findByEmail(email)
            AR->>DB: SELECT id, role, password FROM user WHERE email = $1
            DB-->>AR: 0 ou 1 ligne
            AR-->>AS: UserCredentials ou null
            alt Email inconnu
                AS->>AS: argon2.verify(DUMMY_HASH, password)<br/>même durée qu'un vrai login (anti attaque temporelle)
                AS-->>AC: throw BadRequestError
                AC-->>X: promesse rejetée
                X->>EH: next(err)
                EH-->>C: 400 Email ou mot de passe incorrect
            else Email trouvé
                AS->>AS: argon2.verify(passwordHash, password)
                alt Mot de passe incorrect
                    AS-->>AC: throw BadRequestError
                    AC-->>X: promesse rejetée
                    X->>EH: next(err)
                    EH-->>C: 400 Email ou mot de passe incorrect (message identique)
                else Mot de passe correct
                    AS->>AS: jwt.sign({ role }, JWT_SECRET,<br/>{ subject: id, expiresIn: 1h, algorithm: HS256 })
                    AS-->>AC: token
                    AC->>AC: res.cookie(zythologue_auth, token,<br/>httpOnly, sameSite strict, secure en prod, maxAge 1h)
                    AC-->>C: 200 Connexion réussie + Set-Cookie (token absent du body)
                end
            end
        end
    end
```
