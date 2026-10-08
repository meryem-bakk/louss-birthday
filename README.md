# 🌸 Happy Birthday — site d'anniversaire interactif

Un petit cadeau numérique en 4 étapes : 💌 lettre → 🧩 puzzle → 🎂 gâteau → 💐 bouquet → 🎁 message final.
HTML / CSS / JavaScript vanilla + GSAP (CDN). Aucun build, aucun backend.

## Personnaliser (5 minutes)

Tout se passe dans **`js/config.js`** :

| Quoi | Où |
|---|---|
| Prénom, âge, date, signature | `name`, `age`, `birthday`, `from` |
| La lettre | `letter.greeting`, `letter.paragraphs` (autant de paragraphes que tu veux), `letter.signoff` |
| Image du puzzle | `puzzleImage` + `puzzleSize` (3, 4 ou 5) |
| Photo de la page finale | `finalPhoto` (vide = image du puzzle) + `photoCaption` |
| Musique | `music` + `musicVolume` |
| Petits textes de chaque étape | `texts.*` |
| Message final | `finale.lines`, `finale.last` |
| Couleurs | `colors.*` |

`{name}`, `{age}`, `{from}` et `{birthday}` sont remplacés automatiquement dans tous les textes.

### Photos
- **Puzzle** : mets ta photo dans `assets/puzzle/` (ex. `photo.jpg`) et change `puzzleImage`.
  Une photo **carrée** est idéale ; sinon elle est recadrée au centre automatiquement.
  Taille conseillée : 1000 × 1000 px, JPG qualité ~80 (< 300 Ko).
- **Photo finale** : dans `assets/images/`, puis `finalPhoto: "assets/images/ma-photo.jpg"`.

### Musique
Dépose un MP3 dans `assets/music/` (ex. `song.mp3`, idéalement < 4 Mo).
La musique ne démarre **jamais** toute seule : seulement quand on touche 🔊.
Si le fichier est absent, une douce boîte à musique « Happy Birthday » est jouée à la place.

## Tester en local
Ouvre `index.html` directement, ou mieux, lance un petit serveur :

```bash
python -m http.server 5173
```

puis va sur http://localhost:5173.

## Mettre en ligne
Le dossier est un site statique, prêt tel quel :
- **Netlify** : glisse-dépose le dossier sur https://app.netlify.com/drop
- **Vercel** : `vercel` dans le dossier (aucune configuration).
- **GitHub Pages** : pousse le dossier dans un dépôt → Settings → Pages → branche `main`, dossier `/root`.

## Structure

```
index.html          structure des 6 écrans
css/style.css       styles (mobile first), couleurs en variables CSS
js/config.js        🎀 toute la personnalisation
js/effects.js       pétales, confettis, toasts, petits sons
js/letter.js        initLetter()          — enveloppe + lettre
js/puzzle.js        initPuzzle()          — drag & drop / tap, compteur, mélange
js/cake.js          initCakeBuilder()     — gâteau SVG en couches
js/bouquet.js       initBouquetBuilder()  — bouquet SVG harmonisé automatiquement
js/main.js          showSection(), completeStep(), showFinale(), musique
assets/             images, puzzle, musique…
```

La progression est dans `APP.completedSteps` ; une étape n'est validée que lorsque l'activité est vraiment terminée.

## Accessibilité & performance
- `prefers-reduced-motion` respecté (animations raccourcies, pétales désactivés).
- Puzzle jouable à la souris, au doigt et au clavier (Entrée sur deux pièces).
- Aucune image lourde : gâteau, bouquet et décors sont dessinés en SVG.
