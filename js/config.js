/* =====================================================================
   🎀  PERSONNALISATION — tout se modifie ici, sans toucher à la logique
   ---------------------------------------------------------------------
   • {name}, {age}, {from} et {birthday} sont remplacés automatiquement
     dans tous les textes ci-dessous.
   ===================================================================== */
const CONFIG = {
  /* --- Elle --------------------------------------------------------- */
  name: "Loussane",                 // ← son prénom
  age: 22,                      // ← l'âge qu'elle fête (bougies du gâteau, max 40 bougies affichées)
  birthday: "October 8th",      // ← la date affichée sur l'accueil et la lettre
  from: "Your forever friend",  // ← ta signature

  /* --- Médias ------------------------------------------------------- */
  // Musique : dépose ton fichier dans assets/music/. S'il est absent,
  // une petite boîte à musique ("Happy Birthday") est jouée à la place.
  music: "assets/music/song.mp3",
  musicVolume: 0.5,

  // Puzzle : idéalement une photo carrée (sinon elle est recadrée au centre).
  puzzleImage: "assets/puzzle/us.jpg",         // ← ex. "assets/puzzle/photo.jpg"
  puzzleCols: 3,                            // 3 colonnes × 2 lignes = 6 pièces
  puzzleRows: 2,

  // Photo de la page finale (vide = on réutilise l'image du puzzle).
  finalPhoto: "",                           // ← ex. "assets/images/us.jpg"
  photoCaption: "Loussane & me ♡",

  /* --- 💌 La lettre ------------------------------------------------- */
  letter: {
    greeting: "Ma Lousslouss d'amour,",
    paragraphs: [
      "Joyeux anniversaire ! Je n'arrive pas à croire qu'une année de plus est passée… et qu'une fois encore, 537 kilomètres nous séparent. 537 kilomètres, ce n'est rien sur une carte, mais aujourd'hui, c'est tout ce qui m'empêche de te serrer fort dans mes bras. Alors je t'ai fabriqué ce petit coin d'internet, pour que tu sentes, au moins un peu, à quel point je pense à toi.",
      "Tu me manques tellement. Je te vois partout dans Rabat, dans chaque recoin où on passait nos journées. Nos soirées à Dunkin, nos séances de ciné, l'espace vert avec qzziba, les warak einab et le chawarma that just don't hit pareil quand tu n'es pas là. Ces endroits ont un petit air triste depuis que tu es partie, comme s'il leur manquait leur plus belle partie.",
      "Même si on ne se parle pas tous les jours, tu es dans mes pensées chaque jour, sans exception. Tu as cette façon rare de rester présente même de loin, comme si une partie de toi était restée ici, avec moi. Et si je t'avoue que ces mots me font monter les larmes aux yeux, c'est seulement parce que tu comptes énormément pour moi.",
      "Je n'en voudrai jamais à l'IAV de nous avoir séparées. Parce que sans elle, et sans SDN, je n'aurais jamais croisé ton chemin, et je n'aurais jamais connu cette âme si belle, si drôle et si douce que tu es.",
      "Merci d'être toi, aussi merveilleusement et complètement toi. Merci pour les fous rires, les confidences, les silences qui n'ont jamais été gênants, et pour cette amitié qui ne s'abîme ni avec le temps, ni avec la distance.",
      "Pour cette nouvelle année, je te souhaite des matins doux, des aventures pleines de courage et mille raisons de sourire. Je souhaite de tout mon cœur que la vie nous réunisse très vite… et que le prochain gâteau d'anniversaire, on le mange ensemble, toi et moi, à la même table."
    ],
    signoff: "Avec tout mon amour, aujourd'hui et pour toujours,",
    signature: "Your forever friend ♡"
  },

  /* --- Petits textes du parcours ----------------------------------- */
  texts: {
    landingKicker: "{birthday} · a little gift",
    landingSubtitle: "I made a little something for you...",
    startButton: "Start the journey ✨",
    letterIntro: "Something I wanted to tell you...",
    letterOutro: "Ready for the next little surprise?",
    puzzleTitle: "Piece it together ♡",
    puzzleSubtitle: "A little memory waiting to be revealed...",
    puzzleDone: "You did it! ✨",
    cakeSubtitle: "Every birthday needs one — make it exactly the way you like it.",
    cakeDone: "Your birthday cake is ready! 🎂",
    cakeNext: "One last thing...",
    bouquetSubtitle: "Pick your flowers, I'll arrange them for you.",
    bouquetLine1: "I wish I could give you this bouquet in person.",
    bouquetLine2: "But until then, this one is yours. ♡"
  },

  /* --- 🎁 Message final --------------------------------------------- */
  finale: {
    lines: [
      "Even though we're far away today, I wanted to create a little place where you could feel how much you mean to me.",
      "Distance doesn't change the memories, the laughs, or the friendship."
    ],
    last: "Happy Birthday. ❤️"
  },

  /* --- 🎨 Couleurs (optionnel) -------------------------------------- */
  colors: {
    cream: "#FFF9F3",
    rose: "#E9B8C4",
    roseLight: "#F5DDE3",
    accent: "#9E5267",
    lavender: "#E9E1F1",
    sage: "#A8B9A3",
    text: "#5A4A4A"
  }
};
