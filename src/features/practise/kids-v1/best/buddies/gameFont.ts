/* The chunky, rounded face the game moments are set in (the numbers, the
   level, LEVEL UP!). Fetched only when the kids app first shows one of them,
   so the rest of the site never pays for it. */
let asked = false;

export const GAME_FONT = "'Fredoka', 'Outfit', system-ui, sans-serif";

export function loadGameFont() {
  if (asked || typeof document === 'undefined') return;
  asked = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap';
  document.head.appendChild(link);
}
