import notificationSound from '../assets/notification.mp3';

let cachedAudio: HTMLAudioElement | null = null;

export function playNotificationSound(enabled: boolean): void {
  if (!enabled) return;

  if (!cachedAudio) {
    cachedAudio = new Audio(notificationSound);
    cachedAudio.volume = 0.5;
  }

  cachedAudio.currentTime = 0;
  cachedAudio.play().catch(() => {});
}
