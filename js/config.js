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
  puzzleImage: "assets/puzzle/photo.svg",   // ← ex. "assets/puzzle/photo.jpg"
  puzzleSize: 4,                            // 4 → 4 × 4 = 16 pièces (3 = facile, 5 = difficile)

  // Photo de la page finale (vide = on réutilise l'image du puzzle).
  finalPhoto: "",                           // ← ex. "assets/images/us.jpg"
  photoCaption: "you & me ♡",

  /* --- 💌 La lettre ------------------------------------------------- */
  letter: {
    greeting: "Dear {name},",
    paragraphs: [
      // ✏️ Remplace ces paragraphes par ta vraie lettre (autant que tu veux).
      "Happy birthday! I can't believe another year has gone by — and that, once again, I'm not there to hug you in person. So I made you this little corner of the internet instead.",
      "I hope you know how much you mean to me. You're the first person I want to call when something good happens, and the one I trust the most when things get hard. Being far away has never changed that, not even a little.",
      "Thank you for every late-night conversation, every voice note that was way too long, every inside joke nobody else understands. Thank you for being so wonderfully, completely you.",
      "This year, I wish you soft mornings, brave adventures and a thousand reasons to laugh. And I promise you this: the next birthday cake, we'll eat it together."
    ],
    signoff: "With all my love,",
    signature: "{from}"
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
