// Letters to Lions — site config
// Paste your Google Apps Script web-app URL (ends in /exec) between the quotes.
// See apps-script/README.md for how to get it. This URL is public by design.
window.LTL_CONFIG = {
  // Letter length rules for the Write a Letter form.
  // Keep these in sync with LIMITS.title / WORD_MIN / WORD_MAX / LIMITS.letter in apps-script/Code.gs.
  TITLE_MAX_CHARS: 60,
  WORD_MIN: 50,
  WORD_MAX: 300,
  LETTER_MAX_CHARS: 3000,
  SHEET_URL: 'https://script.google.com/macros/s/AKfycbyy-I_maHAou0MxM_Ot9yPNpSZXXYUkRJpsz7iD7dZ3sHG46fJEmPruIFVlSZ837F9XMQ/exec',
};
