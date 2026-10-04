export function initialVoiceInvite() {
  return /^[A-F0-9]{8}$/i.test(
    new URLSearchParams(window.location.search).get('room') || '',
  );
}
