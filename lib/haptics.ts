export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    switch (type) {
      case 'light':
        window.navigator.vibrate(10);
        break;
      case 'medium':
        window.navigator.vibrate(20);
        break;
      case 'heavy':
        window.navigator.vibrate(50);
        break;
      case 'success':
        window.navigator.vibrate([20, 30, 20]);
        break;
      case 'warning':
        window.navigator.vibrate([50, 30, 50]);
        break;
      case 'error':
        window.navigator.vibrate([100, 50, 100]);
        break;
    }
  }
}
