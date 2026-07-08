-- ============================================================
-- Zythologue - Données de test (seed)
-- PostgreSQL 18
--
-- Exécution cross-platform (Windows, macOS, Linux) :
--   docker exec -i zythologue-postgres psql -U zythologue -d zythologue < sql/02_seed.sql
-- ou avec psql local :
--   PGPASSWORD=zythologue psql -h localhost -p 5432 -U zythologue -d zythologue -f sql/02_seed.sql
-- ============================================================

-- ============================================================
-- 1. Nettoyage — ordre inverse des dépendances FK
-- ============================================================
TRUNCATE
    beer_ingredient,
    beer_category,
    brewery_favorite,
    beer_favorite,
    brewery_photo,
    beer_photo,
    brewery_review,
    beer_review,
    beer,
    ingredient,
    category,
    brewery,
    "user"
RESTART IDENTITY CASCADE;

-- ============================================================
-- 2. Tables indépendantes
-- ============================================================

INSERT INTO "user" (id, lastname, firstname, email, password, birthdate, role, created_at, updated_at) VALUES
  (1,  'Dupont',   'Alice',     'alice.dupont@example.com',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj0og/L.YXme', '1990-03-15', 'admin',  '2023-06-01T10:00:00Z', '2023-06-01T10:00:00Z'),
  (2,  'Martin',   'Baptiste',  'baptiste.martin@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',  '1988-07-22', 'client', '2023-06-05T14:30:00Z', '2023-06-05T14:30:00Z'),
  (3,  'Bernard',  'Clara',     'clara.bernard@example.com',   '$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  '1995-11-08', 'client', '2023-06-10T09:15:00Z', '2023-06-10T09:15:00Z'),
  (4,  'Leclerc',  'David',     'david.leclerc@example.com',   '$2b$12$4PqE0r6iCwxm5UdNFJqYveyH7vJfZkrR8rJxLp9gVnmD7AkFdGqXK',  '1985-04-30', 'client', '2023-06-15T11:45:00Z', '2023-06-15T11:45:00Z'),
  (5,  'Moreau',   'Emma',      'emma.moreau@example.com',     '$2b$12$8WmK2mHzY0LG3BzFcDuqJeP5WnHr1kJlT9bX6CmRdV3YfNoIwPaSO',  '1993-09-17', 'client', '2023-07-01T08:00:00Z', '2023-07-01T08:00:00Z'),
  (6,  'Petit',    'François',  'francois.petit@example.com',  '$2b$12$vZ9jKe1GpBxUmTy3hWiNoO4JfNqPwXkbDlEgRmVsYcHzAoSt5Cr2K',  '1980-12-03', 'client', '2023-07-10T16:20:00Z', '2023-07-10T16:20:00Z'),
  (7,  'Simon',    'Gabrielle', 'gabrielle.simon@example.com', '$2b$12$aD7fWzLkTqRxJmVnP8hGiOeB1YcNsXdUf6MkHr3ZoAjCpvt2Ew5QL',  '1991-06-25', 'client', '2023-07-15T13:10:00Z', '2023-07-15T13:10:00Z'),
  (8,  'Lambert',  'Hugo',      'hugo.lambert@example.com',    '$2b$12$XmP4kYzHdJeVwBnCr6qTsOgD2AiLfZuRo5NvEhGbKmXpW8jc7Ft0I',  '1987-02-14', 'client', '2023-08-01T10:30:00Z', '2023-08-01T10:30:00Z'),
  (9,  'Roux',     'Isabelle',  'isabelle.roux@example.com',   '$2b$12$Kq3rJxBvZoYnDhWeTgLfPiOmC7AuNs5XkRd1Mc6Hj2EwVbtF9Yz4G',  '1994-08-19', 'client', '2023-08-10T15:00:00Z', '2023-08-10T15:00:00Z'),
  (10, 'Girard',   'Julien',    'julien.girard@example.com',   '$2b$12$MsHjLqBxZdWkYnVpOf3rCgT5AiRe7NuJoP2Xv6HzEbKmFcDt8Yw1S',  '1989-01-07', 'client', '2023-09-01T12:00:00Z', '2023-09-01T12:00:00Z'),
  (11, 'Lefebvre', 'Karine',    'karine.lefebvre@example.com', '$2b$12$PwBkJrCxVmHdNz7YoLqTsEg4AfRiO3UjKe5Xb2MvDnZp8FcGt1Wh6',  '1996-05-12', 'client', '2023-09-15T09:45:00Z', '2023-09-15T09:45:00Z'),
  (12, 'Morin',    'Laurent',   'laurent.morin@example.com',   '$2b$12$TrKqBxJnCgZmYdVsHoWfP6iL3EuRoD8AeN5Mj2Xb7KzFtGpVc1Yh4',  '1983-10-28', 'client', '2023-10-01T17:30:00Z', '2023-10-01T17:30:00Z'),
  (13, 'Garnier',  'Marie',     'marie.garnier@example.com',   '$2b$12$YhNzBrJxKgPmVqCsWoTfD5iE3LuRoM7AeN8Xj2Db6KzFtHpVc4Wm1',  '1992-07-04', 'admin',  '2023-10-15T11:00:00Z', '2023-10-15T11:00:00Z');

INSERT INTO brewery (id, name, description, country, city, website) VALUES
  (1,  'Brasserie de Chimay',              'Brasserie trappiste belge fondée en 1862 par les moines cisterciens de l''abbaye Notre-Dame de Scourmont. Reconnue mondialement pour ses bières de caractère brassées selon la tradition trappiste.',                                                          'Belgique',    'Chimay',                  'https://www.chimay.com'),
  (2,  'Duvel Moortgat',                   'Brasserie belge familiale fondée en 1871, célèbre pour sa Duvel, une bière forte dorée à fermentation haute. Le groupe brasse également les bières Maredsous et Vedett.',                                                                                    'Belgique',    'Breendonk',               'https://www.duvel.com'),
  (3,  'Brasserie d''Orval',               'Abbaye trappiste cistercienne fondée au XIIe siècle dans la province de Luxembourg belge. Brasse une bière unique au monde, reconnue pour son caractère sec et sa refermentation en bouteille.',                                                             'Belgique',    'Villers-devant-Orval',    'https://www.orval.be'),
  (4,  'Brasserie Cantillon',              'Brasserie artisanale bruxelloise fondée en 1900, spécialisée dans les bières lambic à fermentation spontanée. Véritable musée vivant de la brasserie traditionnelle belge.',                                                                                'Belgique',    'Bruxelles',               'https://www.cantillon.be'),
  (5,  'Brasserie de la Senne',            'Brasserie artisanale bruxelloise fondée en 2010 par Yvan De Baets et Bernard Leboucq, connue pour ses bières houblonnées et non filtrées inspirées des traditions belges et américaines.',                                                                   'Belgique',    'Bruxelles',               'https://www.brasseriedela senne.be'),
  (6,  'Weihenstephan',                    'La plus ancienne brasserie du monde encore en activité, fondée en 1040 près de Munich. Rattachée à l''Université technique de Munich, elle est référence mondiale pour les bières blanches bavaroises.',                                                     'Allemagne',   'Freising',                'https://www.weihenstephaner.de'),
  (7,  'Paulaner',                         'Brasserie munichoise fondée en 1634 par des moines franciscains. Célèbre pour ses bières de saison comme la Salvator, la première Doppelbock de l''histoire, et ses weizenbier.',                                                                           'Allemagne',   'Munich',                  'https://www.paulaner.com'),
  (8,  'Sierra Nevada Brewing Co.',        'Pionnière du mouvement craft beer américain, fondée en 1980 à Chico en Californie par Ken Grossman. Sa Pale Ale est considérée comme l''une des bières artisanales les plus influentes au monde.',                                                           'États-Unis',  'Chico',                   'https://www.sierranevada.com'),
  (9,  'Stone Brewing',                    'Brasserie artisanale fondée en 1996 en Californie, connue pour ses IPA puissantes et houblonnées. L''une des plus grandes brasseries craft indépendantes des États-Unis.',                                                                                   'États-Unis',  'Escondido',               'https://www.stonebrewing.com'),
  (10, 'BrewDog',                          'Brasserie artisanale écossaise fondée en 2007 par James Watt et Martin Dickie. Pionnière du mouvement craft beer européen, réputée pour ses IPA audacieuses et sa philosophie de transparence.',                                                             'Royaume-Uni', 'Ellon',                   'https://www.brewdog.com'),
  (11, 'Brasserie des Franches-Montagnes', 'Brasserie artisanale suisse fondée en 1997 dans le Jura bernois par Jérôme Rebetez. Connue pour ses créations originales et son approche expérimentale, notamment la Abbaye de Saint Bon-Chien.',                                                          'Suisse',      'Saignelégier',            'https://www.brasseriebfm.ch'),
  (12, 'Brasserie du Mont Blanc',          'Brasserie artisanale savoyarde fondée en 1999 au pied du Mont Blanc. Elle élabore des bières de caractère en utilisant l''eau pure des glaciers alpins et des matières premières sélectionnées.',                                                           'France',      'Saint-Gervais-les-Bains', 'https://www.brasseriedumontblanc.com');

INSERT INTO category (id, name, description) VALUES
  (1,  'Triple',          'Bière belge à haute fermentation, forte (8-10%), dorée à ambrée, avec un profil aromatique complexe mêlant fruits, épices et une légère amertume. Associée aux brasseries trappistes et d''abbaye.'),
  (2,  'Blonde',          'Bière de couleur dorée à jaune pâle, généralement légère à modérément alcoolisée (4-7%). Profil équilibré entre malt et houblon, souvent fruitée et rafraîchissante.'),
  (3,  'Brune',           'Bière foncée à base de malts torréfiés, avec des arômes de chocolat, caramel et café. Alcool modéré à élevé (5-9%), corps ample et saveurs complexes.'),
  (4,  'Rouge / Ambrée',  'Bière de couleur rousse à rouge cuivrée, caractérisée par ses notes de caramel et de malt légèrement torréfié. Amertume modérée, corps généreux.'),
  (5,  'IPA',             'India Pale Ale : bière fortement houblonnée avec des arômes intenses de résine, agrumes, fruits tropicaux ou herbes. Amertume prononcée, alcool modéré à élevé (5-7.5%).'),
  (6,  'Stout',           'Bière noire opaque à base de malt fortement torréfié ou grillé. Saveurs prononcées de café, chocolat amer et parfois caramel. Corps plein, crémeux, faible à forte teneur en alcool.'),
  (7,  'Witbier',         'Bière blanche belge brassée avec du blé non malté, traditionnellement épicée à la coriandre et à l''écorce d''orange. Trouble, légère, rafraîchissante, faiblement alcoolisée (4-5%).'),
  (8,  'Saison',          'Bière de ferme belge historiquement brassée en hiver pour les travailleurs saisonniers. Sèche, effervescente, légèrement épicée, avec des notes fruitées et herbacées. Alcool modéré (5-8%).'),
  (9,  'Gueuze / Lambic', 'Bière belge à fermentation spontanée produite dans la vallée de la Senne. Le lambic est un assemblage de vieux et jeunes lambics, sec, acidulé, avec des notes de fruits et de levures sauvages.'),
  (10, 'Bock',            'Bière lager allemande forte (6-7.5%), de couleur ambrée à brune. Maltée, légèrement sucrée, avec peu d''amertume. Le Doppelbock est une version encore plus forte et riche.');

INSERT INTO ingredient (id, name, description) VALUES
  (1,  'Malt d''orge',       'Principal céréale maltée utilisée en brasserie. Apporte corps, couleur et saveurs de pain ou de caramel selon le degré de torréfaction.'),
  (2,  'Houblon Saaz',       'Houblon noble tchèque, doux et épicé, avec des notes herbacées et florales. Utilisé principalement pour l''amertume fine des lagers et bières belges.'),
  (3,  'Houblon Cascade',    'Houblon américain très populaire, caractérisé par ses arômes d''agrumes (pamplemousse, citron) et floraux. Pilier des American IPA.'),
  (4,  'Houblon Centennial', 'Houblon américain intense aux notes d''agrumes et de résine. Utilisé pour l''amertume et l''arôme dans les IPA et Pale Ales américaines.'),
  (5,  'Eau',                'Ingrédient majeur représentant 90-95% de la bière. Sa composition minérale influence directement le style et le profil gustatif de la bière.'),
  (6,  'Levure ale',         'Levure à fermentation haute (Saccharomyces cerevisiae) utilisée pour les bières ales. Fermente à températures plus élevées (15-24°C) et produit des esters fruités et épicés.'),
  (7,  'Levure lager',       'Levure à fermentation basse (Saccharomyces pastorianus) utilisée pour les lagers et bocks. Fermente à basse température (7-13°C) pour un profil propre et neutre.'),
  (8,  'Blé',                'Céréale non maltée utilisée dans les witbiers et lambics. Apporte une texture trouble, une légèreté et des notes de pain frais.'),
  (9,  'Avoine',             'Céréale ajoutée pour apporter de la rondeur, une texture crémeuse et veloutée. Très utilisée dans les Oatmeal Stouts.'),
  (10, 'Coriandre',          'Épice traditionnelle des witbiers belges. Les graines concassées apportent des notes fraîches, citronnées et légèrement poivrées.'),
  (11, 'Écorce d''orange',   'Zestes d''orange amère ou douce utilisés dans les witbiers et certaines bières artisanales. Apportent des arômes d''agrumes et une légère amertume.'),
  (12, 'Sucre de canne',     'Adjuvant fermentescible ajouté pour augmenter l''alcool sans alourdir la bière. Caractéristique des fortes bières belges (triples, fortes dorées).'),
  (13, 'Miel',               'Adjuvant naturel apportant des sucres fermentescibles, une légère douceur résiduelle et des notes florales subtiles dans certaines bières artisanales.'),
  (14, 'Malt de froment',    'Malt issu du blé, utilisé dans les bières blanches et de froment. Apporte légèreté, trouble naturel et arômes de pain et de céréales.'),
  (15, 'Malt caramel',       'Malt spécial à cristallisation, apportant des arômes de caramel, toffee et fruits secs. Ajoute de la couleur ambrée et une douceur résiduelle.'),
  (16, 'Malt torréfié',      'Malt fortement grillé à haute température, apportant des arômes intenses de café, chocolat amer et grillé. Donne la couleur noire aux stouts et porters.'),
  (17, 'Lactose',            'Sucre du lait non fermentescible, apportant une douceur résiduelle et une texture crémeuse. Utilisé dans les Milk Stouts et certaines bières sucrées.'),
  (18, 'Fruits rouges',      'Framboises, cerises griottes ou autres fruits rouges utilisés dans certains lambics et gueuzes pour apporter acidité fruitée et couleur rosée.');

-- ============================================================
-- 3. Tables avec FK
-- ============================================================

INSERT INTO beer (id, name, description, price, alcohol_level, is_alcohol_free, brewery_id) VALUES
  (1,  'Chimay Rouge (Première)',       'Bière brune trappiste aux arômes de fruits, de réglisse et d''épices. Légèrement fruitée en bouche avec une amertume douce et une longue finale.',                                                             3.50,  7.0, false,  1),
  (2,  'Chimay Bleue (Grande Réserve)', 'Bière brune trappiste puissante et complexe, avec des notes de fruits cuits, de caramel et une touche d''épices. Idéale pour la garde.',                                                                      4.00,  9.0, false,  1),
  (3,  'Chimay Blanche (Cinq Cents)',   'Triple trappiste d''un beau doré, arômes de malt, de houblon et de levure. Bouche sèche, légèrement amère, avec une effervescence vivace.',                                                                   3.80,  8.0, false,  1),
  (4,  'Chimay Dorée',                  'Bière blonde légère et accessible, brassée à l''origine pour les moines eux-mêmes. Notes de miel, de céréales et de levure fraîche. Désaltérante.',                                                           3.20,  4.8, false,  1),
  (5,  'Chimay Triple',                 'Triple trappiste dorée et aromatique, combinant des notes d''agrumes, de poivre blanc et de malt. Corps rond, carbonatation vive, finale sèche et longue.',                                                   4.20,  8.5, false,  1),
  (6,  'Chimay Stout Réserve',          'Stout trappiste intense aux arômes prononcés de café, chocolat noir et malt grillé. Corps plein et crémeux, longue finale torréfiée légèrement amère.',                                                       4.50,  9.0, false,  1),
  (7,  'Chimay Amber Ale',              'Bière ambrée équilibrée aux notes de caramel, de biscuit et de houblon floral. Amertume douce, corps moyen, idéale pour découvrir les bières belges.',                                                        3.70,  6.0, false,  1),
  (8,  'Duvel',                         'Forte blonde belge emblématique, dorée et limpide sous une épaisse mousse blanche. Arômes de fruits, de houblon et d''alcool discret. Finale amère persistante.',                                             3.90,  8.5, false,  2),
  (9,  'Duvel Triple Hop',              'Version houblonnée de la Duvel, avec un troisième houblon ajouté à froid. Arômes d''agrumes et de résine encore plus prononcés, amertume intense et parfumée.',                                              4.80,  9.5, false,  2),
  (10, 'Maredsous 6 Blonde',            'Bière blonde d''abbaye, légère et accessible. Notes de malt, de miel et de fruits jaunes. Bonne effervescence, finale douce et légèrement épicée.',                                                          3.40,  6.0, false,  2),
  (11, 'Maredsous 8 Brune',             'Bière brune d''abbaye, ronde et maltée avec des notes de caramel, de pruneaux et de vanille. Corps ample, amertume douce, longue et chaleureuse finale.',                                                    3.80,  8.0, false,  2),
  (12, 'Maredsous 10 Triple',           'Triple d''abbaye complexe et puissante. Notes de poire, d''abricot, de malt et de levure. Corps plein, finale longue avec une chaleur alcoolisée bien intégrée.',                                            4.20, 10.0, false,  2),
  (13, 'Vedett Extra Blond',            'Blonde légère et pétillante, moderne et accessible. Notes d''agrumes et de houblon frais. Bière de soif idéale pour l''été, légèrement amère.',                                                              2.90,  5.2, false,  2),
  (14, 'Orval Trappiste',               'Bière trappiste unique au monde, reconnaissable à sa bouteille et sa couleur ambrée. Refermentée en bouteille avec une levure sauvage, sèche, herbacée et complexe.',                                        4.50,  6.2, false,  3),
  (15, 'Petite Orval',                  'Version légère de l''Orval, brassée exclusivement pour la cafétéria de l''abbaye. Blonde, légère et fraîche, avec les arômes caractéristiques de la levure d''Orval.',                                       2.80,  3.5, false,  3),
  (16, 'Cantillon Gueuze 100% Lambic',  'Assemblage de lambics d''un, deux et trois ans, refermenté en bouteille. Acidulée, sèche, complexe, avec des notes de pomme verte, de cuir et de foin. Un classique bruxellois.',                            8.00,  5.0, false,  4),
  (17, 'Cantillon Rosé de Gambrinus',   'Lambic à la framboise, fruité et acidulé. Robe rose saumonée, arômes intenses de framboise fraîche et acidité naturelle du lambic. Un équilibre unique entre fruit et lambic sauvage.',                      9.50,  5.0, false,  4),
  (18, 'Taras Boulba',                  'Bière blonde belge extra-houblonnée aux arômes d''agrumes et de fleurs. Légère, sèche et amère, conçue pour être bue en grande quantité. Un hommage aux houblons nobles.',                                    3.20,  4.5, false,  5),
  (19, 'Zinnebir',                      'Session IPA bruxelloise audacieuse, fortement houblonnée avec des variétés américaines. Arômes d''agrumes et de résine, amertume franche et corps léger. Signature de la Brasserie de la Senne.',            3.40,  5.8, false,  5),
  (20, 'Weihenstephaner Hefeweissbier', 'Hefeweizen bavaroises de référence mondiale. Trouble, avec ses arômes typiques de banane et de clou de girofle issus de la levure. Légère, désaltérante, parfaite avec les plats bavarois.',                 3.50,  5.4, false,  6),
  (21, 'Weihenstephaner Korbinian',     'Doppelbock bavarois intense et malteux. Robe brun-acajou, arômes riches de pain d''épices, caramel et fruits cuits. Corps plein, finale longue et chaleureuse.',                                             4.20,  7.4, false,  6),
  (22, 'Paulaner Salvator',             'La mère de tous les Doppelbocks, brassée depuis 1780. Ambrée foncée, maltée et douce, avec des notes de caramel, de toffee et de fruits secs. Corps plein, finale réchauffante.',                            4.50,  7.9, false,  7),
  (23, 'Sierra Nevada Pale Ale',        'L''une des bières artisanales les plus influentes des États-Unis. Ambrée dorée, notes de houblon Cascade (agrumes, résine), malt biscuité. Amertume équilibrée, classique indémodable.',                     4.00,  5.6, false,  8),
  (24, 'Sierra Nevada Torpedo IPA',     'IPA californienne puissante utilisant la technique du dry hopping à la torpille. Arômes intenses de pin, pamplemousse et résine. Amertume franche, corps moyennement plein.',                               5.50,  7.2, false,  8),
  (25, 'Stone IPA',                     'IPA californienne iconique à l''amertume puissante et aux arômes intenses de pamplemousse, citron et résine de pin. Sèche, houblonnée, avec un corps léger qui la rend très buvable malgré son intensité.',  5.00,  6.9, false,  9),
  (26, 'BrewDog Punk IPA',              'L''IPA qui a révolutionné la scène bière britannique. Notes tropicales de passion, mangue et agrumes portées par un quatuor de houblons américains et néo-zélandais. Amertume franche.',                      3.80,  5.4, false, 10),
  (27, 'BrewDog Elvis Juice',           'IPA aux agrumes avec zestes de pamplemousse et d''orange. Arômes d''agrumes très prononcés, malt caramel en fond, amertume résineuse. Une IPA audacieuse et immédiatement reconnaissable.',                  4.20,  6.5, false, 10),
  (28, 'La Torpille',                   'Saison suisse ambrée et houblonnée aux arômes épicés de levure belge, d''agrumes et de fleurs. Corps léger, carbonatation élevée, finale sèche et herbacée. Création originale de la BFM.',                  5.50,  7.5, false, 11),
  (29, 'Abbaye de Saint Bon-Chien',     'Bière forte brune vieillie en barriques de chêne. Complexe et profonde, avec des notes de vanille, bois, fruits confits et une acidité subtile. Millésimée, produite en quantité limitée.',                 14.00, 11.0, false, 11),
  (30, 'Blanche des Neiges',            'Witbier savoyard brassée avec l''eau pure des glaciers des Alpes. Notes de coriandre, d''orange et de blé. Légère, trouble et rafraîchissante, avec une finale épicée caractéristique.',                     3.20,  5.0, false, 12);

INSERT INTO beer_review (id, grade, comment, created_at, user_id, beer_id) VALUES
  (1,   9, 'Une brune trappiste exemplaire, fruitée et épicée à souhait. Belle longueur en bouche.',                                                             '2024-01-20T18:30:00Z',  3,  1),
  (2,  10, 'La meilleure bière que j''aie jamais bue. Complexité incroyable, parfaite pour la garde.',                                                          '2024-01-25T20:00:00Z',  4,  2),
  (3,   8, 'Triple réussie, bien sèche avec une belle effervescence. Idéale avec un fromage affiné.',                                                           '2024-02-05T19:15:00Z',  5,  3),
  (4,   8, 'Légère et agréable, parfaite pour initier quelqu''un aux bières trappistes.',                                                                       '2024-02-10T17:45:00Z',  6,  4),
  (5,   9, 'Triple délicieuse, arômes d''agrumes et de poivre très bien équilibrés. Incontournable.',                                                           '2024-02-20T21:00:00Z',  7,  5),
  (6,   7, 'Stout puissant, café et chocolat très présents. Un peu trop fort pour moi mais intéressant.',                                                       '2024-03-01T19:30:00Z',  8,  6),
  (7,   9, 'Ambrée parfaitement équilibrée. Le caramel et le houblon se marient à merveille.',                                                                  '2024-03-10T18:00:00Z',  9,  7),
  (8,   8, 'La Duvel reste une valeur sûre. Légère malgré son degré, avec cette amertume signature.',                                                           '2024-01-15T20:30:00Z',  1,  8),
  (9,   7, 'Plus houblonnée que la Duvel classique, intéressant mais un peu écrasant sur la durée.',                                                            '2024-02-08T21:15:00Z',  2,  9),
  (10,  7, 'Bonne blonde d''abbaye, accessible et équilibrée. Parfaite pour accompagner un repas.',                                                             '2024-02-15T18:45:00Z',  3, 10),
  (11,  8, 'Belle brune d''abbaye, le caramel et les fruits confits sont très présents. Très agréable.',                                                        '2024-03-05T20:00:00Z',  4, 11),
  (12,  7, 'Triple complexe et puissante. L''alcool est bien intégré mais il faut l''apprécier lentement.',                                                     '2024-03-15T19:00:00Z',  5, 12),
  (13,  6, 'Correcte comme blonde légère, mais manque de caractère par rapport aux autres bières belges.',                                                      '2024-03-20T17:30:00Z',  6, 13),
  (14,  9, 'L''Orval est unique au monde. Son caractère sauvage et sec la distingue de toutes les autres trappistes.',                                          '2024-01-30T21:00:00Z',  7, 14),
  (15,  8, 'Petite Orval légère et rafraîchissante, avec les arômes typiques de la levure Orval. Belle réussite.',                                              '2024-02-12T18:30:00Z',  8, 15),
  (16,  4, 'Très acide et complexe, difficile d''accès. À réserver aux amateurs de bières lambiques.',                                                          '2024-02-18T20:00:00Z',  1, 16),
  (17,  3, 'Trop acide pour moi, mais je comprends l''intérêt pour les aficionados. Ce n''est pas ma tasse de thé.',                                           '2024-03-08T19:45:00Z',  2, 17),
  (18,  8, 'Taras Boulba est une perle belge. Légère mais houblonnée, parfaite pour une session.',                                                              '2024-04-05T18:00:00Z', 10, 18),
  (19,  7, 'IPA belge réussie avec un profil houblonné intéressant. Un peu moins intense que les IPA américaines.',                                             '2024-04-12T19:30:00Z', 11, 19),
  (20,  8, 'La Hefeweizen de référence, banane et clou de girofle parfaitement dosés. Rafraîchissante.',                                                        '2024-04-20T17:00:00Z', 12, 20),
  (21,  9, 'Doppelbock exceptionnel, la richesse maltée est enveloppante. Un chef-d''œuvre bavarois.',                                                          '2024-05-01T20:30:00Z', 13, 21),
  (22,  8, 'Le Salvator est le grand-père de tous les Doppelbocks. Généreux, malteux et chaleureux.',                                                           '2024-05-10T21:00:00Z',  1, 22),
  (23,  7, 'La Sierra Nevada Pale Ale reste une classique. Moins intense que les IPA modernes mais équilibrée.',                                                '2024-05-15T18:30:00Z',  9, 23),
  (24,  8, 'Torpedo IPA excellente, dry-hopping très efficace. Les arômes de résine et de pin sont intenses.',                                                  '2024-05-22T19:00:00Z', 10, 24),
  (25,  6, 'Bonne IPA mais rien de révolutionnaire. L''amertume est parfois trop agressive pour moi.',                                                          '2024-06-01T20:00:00Z', 11, 25);

INSERT INTO brewery_review (id, grade, comment, created_at, user_id, brewery_id) VALUES
  (1,   9, 'L''une des plus belles brasseries trappistes du monde. Qualité constante et irréprochable depuis des décennies.',                               '2024-02-01T18:00:00Z',  1,  1),
  (2,   8, 'Duvel Moortgat est une institution belge. La Duvel reste indétrônable, et les autres gammes sont excellentes.',                                 '2024-02-05T19:30:00Z',  2,  2),
  (3,  10, 'Orval est unique au monde. La brasserie, le cadre, la bière — tout est parfait. Un pèlerinage pour tout amateur.',                              '2024-02-10T20:00:00Z',  3,  3),
  (4,   3, 'Les bières sont intéressantes d''un point de vue technique mais vraiment difficiles d''accès pour le grand public.',                            '2024-02-15T17:45:00Z',  4,  4),
  (5,   8, 'La Brasserie de la Senne est une des meilleures brasseries artisanales bruxelloises. Créative et houblonnée.',                                  '2024-03-01T19:00:00Z',  5,  5),
  (6,   9, 'La plus ancienne brasserie du monde, et toujours au sommet. Leurs hefeweizen sont la référence mondiale.',                                      '2024-03-10T18:30:00Z',  6,  6),
  (7,   7, 'Paulaner reste une bonne brasserie traditionnelle bavaroise, bien que moins artisanale que d''autres.',                                         '2024-03-15T20:00:00Z',  7,  7),
  (8,   8, 'Sierra Nevada a façonné la scène craft américaine. Leur Pale Ale est un monument de l''histoire brassicole.',                                   '2024-03-20T19:30:00Z',  8,  8),
  (9,   6, 'Stone Brewing produit des IPA correctes mais je trouve la philosophie marketing parfois trop agressive.',                                       '2024-04-01T18:00:00Z',  9,  9),
  (10,  7, 'BrewDog a popularisé les craft beers en Europe. Les bières sont bonnes, un peu mainstream maintenant.',                                        '2024-04-05T20:30:00Z', 10, 10),
  (11,  8, 'La BFM est une brasserie suisse exceptionnelle, avec une créativité sans égal. La Saint Bon-Chien est mythique.',                               '2024-04-10T19:00:00Z', 11, 11),
  (12,  7, 'Belle brasserie alpine, les bières sont fraîches et bien faites. Le terroir alpin est bien présent.',                                           '2024-04-15T18:30:00Z', 12, 12),
  (13, 10, 'Chimay est tout simplement la meilleure brasserie belge selon moi. Chaque bière est un chef-d''œuvre.',                                        '2024-05-01T20:00:00Z',  2,  1),
  (14,  9, 'La Senne ne cesse de m''impressionner. Des bières courageuses et bien exécutées, loin des sentiers battus.',                                   '2024-05-10T19:30:00Z',  3,  5),
  (15,  8, 'Weihenstephan est une référence mondiale pour les bières de froment. Le cadre historique ajoute à l''expérience.',                             '2024-05-20T18:00:00Z',  4,  6);

INSERT INTO beer_photo (id, url, beer_id) VALUES
  (1,  'https://images.example.com/beers/chimay-rouge-1.jpg',           1),
  (2,  'https://images.example.com/beers/chimay-rouge-2.jpg',           1),
  (3,  'https://images.example.com/beers/chimay-rouge-3.jpg',           1),
  (4,  'https://images.example.com/beers/chimay-bleue-1.jpg',           2),
  (5,  'https://images.example.com/beers/chimay-blanche-1.jpg',         3),
  (6,  'https://images.example.com/beers/chimay-tripel-1.jpg',          5),
  (7,  'https://images.example.com/beers/duvel-1.jpg',                  8),
  (8,  'https://images.example.com/beers/duvel-triple-hop-1.jpg',       9),
  (9,  'https://images.example.com/beers/orval-trappiste-1.jpg',       14),
  (10, 'https://images.example.com/beers/orval-trappiste-2.jpg',       14),
  (11, 'https://images.example.com/beers/cantillon-gueuze-1.jpg',      16),
  (12, 'https://images.example.com/beers/taras-boulba-1.jpg',          18),
  (13, 'https://images.example.com/beers/weihenstephaner-hefe-1.jpg',  20),
  (14, 'https://images.example.com/beers/sierra-nevada-pale-ale-1.jpg',23),
  (15, 'https://images.example.com/beers/sierra-nevada-torpedo-1.jpg', 24),
  (16, 'https://images.example.com/beers/brewdog-punk-ipa-1.jpg',      26),
  (17, 'https://images.example.com/beers/brewdog-elvis-juice-1.jpg',   27),
  (18, 'https://images.example.com/beers/la-torpille-1.jpg',           28),
  (19, 'https://images.example.com/beers/abbaye-saint-bon-chien-1.jpg',29),
  (20, 'https://images.example.com/beers/blanche-des-neiges-1.jpg',    30);

INSERT INTO brewery_photo (id, url, brewery_id) VALUES
  (1,  'https://images.example.com/breweries/chimay-1.jpg',                 1),
  (2,  'https://images.example.com/breweries/chimay-2.jpg',                 1),
  (3,  'https://images.example.com/breweries/duvel-moortgat-1.jpg',         2),
  (4,  'https://images.example.com/breweries/orval-1.jpg',                  3),
  (5,  'https://images.example.com/breweries/cantillon-1.jpg',              4),
  (6,  'https://images.example.com/breweries/brasserie-de-la-senne-1.jpg',  5),
  (7,  'https://images.example.com/breweries/weihenstephan-1.jpg',          6),
  (8,  'https://images.example.com/breweries/paulaner-1.jpg',               7),
  (9,  'https://images.example.com/breweries/sierra-nevada-1.jpg',          8),
  (10, 'https://images.example.com/breweries/stone-brewing-1.jpg',          9),
  (11, 'https://images.example.com/breweries/brewdog-1.jpg',               10),
  (12, 'https://images.example.com/breweries/bfm-1.jpg',                   11);

-- ============================================================
-- 4. Tables de liaison (clés primaires composites)
-- ============================================================

INSERT INTO beer_favorite (user_id, beer_id, created_at) VALUES
  (1,  1,  '2024-01-15T10:00:00Z'),
  (1,  3,  '2024-02-20T11:00:00Z'),
  (1,  8,  '2024-03-10T14:00:00Z'),
  (1,  14, '2024-04-05T16:00:00Z'),
  (1,  24, '2024-05-18T19:00:00Z'),
  (2,  1,  '2024-01-20T09:00:00Z'),
  (2,  3,  '2024-02-25T18:00:00Z'),
  (2,  10, '2024-03-15T20:00:00Z'),
  (2,  16, '2024-04-10T17:00:00Z'),
  (2,  24, '2024-05-22T21:00:00Z'),
  (2,  26, '2024-06-01T15:00:00Z'),
  (3,  2,  '2024-02-10T12:00:00Z'),
  (3,  9,  '2024-03-20T19:00:00Z'),
  (4,  4,  '2024-01-25T10:30:00Z'),
  (4,  11, '2024-03-05T18:30:00Z'),
  (4,  19, '2024-04-15T20:00:00Z'),
  (5,  5,  '2024-02-15T14:00:00Z'),
  (5,  12, '2024-04-20T21:30:00Z'),
  (6,  6,  '2024-02-28T19:00:00Z'),
  (6,  17, '2024-05-10T20:00:00Z'),
  (7,  7,  '2024-03-25T17:00:00Z'),
  (8,  15, '2024-04-02T12:00:00Z'),
  (8,  23, '2024-05-30T18:00:00Z'),
  (9,  18, '2024-04-25T20:00:00Z'),
  (10, 25, '2024-05-08T19:30:00Z'),
  (11, 27, '2024-05-14T21:00:00Z'),
  (12, 28, '2024-05-25T18:30:00Z'),
  (13, 20, '2024-06-05T15:00:00Z');

INSERT INTO brewery_favorite (user_id, brewery_id, created_at) VALUES
  (1,  1,  '2024-01-10T10:00:00Z'),
  (1,  3,  '2024-02-15T14:00:00Z'),
  (2,  2,  '2024-01-18T11:00:00Z'),
  (2,  4,  '2024-03-05T16:00:00Z'),
  (3,  1,  '2024-02-08T09:00:00Z'),
  (3,  6,  '2024-04-01T20:00:00Z'),
  (4,  5,  '2024-02-20T15:00:00Z'),
  (4,  8,  '2024-04-10T18:00:00Z'),
  (5,  2,  '2024-03-10T12:00:00Z'),
  (6,  10, '2024-03-20T19:00:00Z'),
  (7,  7,  '2024-04-05T17:00:00Z'),
  (8,  3,  '2024-04-15T21:00:00Z'),
  (9,  11, '2024-05-01T14:00:00Z'),
  (10, 4,  '2024-05-12T19:00:00Z'),
  (11, 12, '2024-05-28T16:00:00Z');

INSERT INTO beer_category (beer_id, category_id) VALUES
  (1, 3), (1, 4),
  (2, 3), (2, 1),
  (3, 1),
  (4, 2),
  (5, 1), (5, 2),
  (6, 6), (6, 3),
  (7, 4),
  (8, 2),
  (9, 2), (9, 5),
  (10, 2),
  (11, 3),
  (12, 1),
  (13, 2),
  (14, 4), (14, 8),
  (15, 2),
  (16, 9),
  (17, 9),
  (18, 2), (18, 8),
  (19, 5), (19, 2),
  (20, 7),
  (21, 10), (21, 3),
  (22, 10), (22, 3),
  (23, 5), (23, 2),
  (24, 5),
  (25, 5),
  (26, 5),
  (27, 5), (27, 2),
  (28, 8), (28, 2),
  (29, 3),
  (30, 7), (30, 2);

INSERT INTO beer_ingredient (beer_id, ingredient_id) VALUES
  (1,  1), (1,  2), (1,  5), (1,  6), (1,  12),
  (2,  1), (2,  2), (2,  5), (2,  6), (2,  12), (2,  15),
  (3,  1), (3,  2), (3,  5), (3,  6), (3,  12),
  (4,  1), (4,  2), (4,  5), (4,  6),
  (5,  1), (5,  2), (5,  5), (5,  6), (5,  12),
  (6,  1), (6,  16),(6,  9), (6,  5), (6,  6),
  (7,  1), (7,  2), (7,  5), (7,  6), (7,  15),
  (8,  1), (8,  2), (8,  5), (8,  6), (8,  12),
  (9,  1), (9,  2), (9,  3), (9,  4), (9,  5), (9,  6),
  (10, 1), (10, 2), (10, 5), (10, 6),
  (11, 1), (11, 2), (11, 5), (11, 6), (11, 15),
  (12, 1), (12, 2), (12, 5), (12, 6), (12, 12),
  (13, 1), (13, 3), (13, 5), (13, 6),
  (14, 1), (14, 2), (14, 5), (14, 6), (14, 12),
  (15, 1), (15, 2), (15, 5), (15, 6),
  (16, 1), (16, 8), (16, 5), (16, 6),
  (17, 1), (17, 8), (17, 5), (17, 6), (17, 18),
  (18, 1), (18, 2), (18, 3), (18, 5), (18, 6),
  (19, 1), (19, 3), (19, 4), (19, 5), (19, 6),
  (20, 8), (20, 14),(20, 5), (20, 6), (20, 10),
  (21, 1), (21, 2), (21, 5), (21, 7), (21, 15),
  (22, 1), (22, 2), (22, 5), (22, 7), (22, 15),
  (23, 1), (23, 3), (23, 5), (23, 6),
  (24, 1), (24, 3), (24, 4), (24, 5), (24, 6),
  (25, 1), (25, 3), (25, 4), (25, 5), (25, 6),
  (26, 1), (26, 3), (26, 4), (26, 5), (26, 6),
  (27, 1), (27, 3), (27, 4), (27, 5), (27, 6), (27, 13),
  (28, 1), (28, 2), (28, 5), (28, 6), (28, 8),
  (29, 1), (29, 2), (29, 5), (29, 6), (29, 16),(29, 15),
  (30, 8), (30, 14),(30, 5), (30, 6), (30, 10),(30, 11);

-- ============================================================
-- 5. Resynchronisation des séquences SERIAL
-- ============================================================
SELECT setval(pg_get_serial_sequence('"user"', 'id'),         MAX(id)) FROM "user";
SELECT setval(pg_get_serial_sequence('brewery', 'id'),        MAX(id)) FROM brewery;
SELECT setval(pg_get_serial_sequence('category', 'id'),       MAX(id)) FROM category;
SELECT setval(pg_get_serial_sequence('ingredient', 'id'),     MAX(id)) FROM ingredient;
SELECT setval(pg_get_serial_sequence('beer', 'id'),           MAX(id)) FROM beer;
SELECT setval(pg_get_serial_sequence('beer_review', 'id'),    MAX(id)) FROM beer_review;
SELECT setval(pg_get_serial_sequence('brewery_review', 'id'), MAX(id)) FROM brewery_review;
SELECT setval(pg_get_serial_sequence('beer_photo', 'id'),     MAX(id)) FROM beer_photo;
SELECT setval(pg_get_serial_sequence('brewery_photo', 'id'),  MAX(id)) FROM brewery_photo;
