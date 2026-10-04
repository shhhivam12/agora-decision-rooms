export function readLanguage(): 'en' | 'hi' {
  try {
    return localStorage.getItem('decision-rooms-language') === 'hi'
      ? 'hi'
      : 'en';
  } catch {
    return 'en';
  }
}
export function saveLanguage(language: 'en' | 'hi') {
  try {
    localStorage.setItem('decision-rooms-language', language);
  } catch {}
}
