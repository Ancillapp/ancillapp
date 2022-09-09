export const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

const scriptsPromiseCache = new Map<string, Promise<unknown>>();

export const importIIFE = (src: string) => {
  const cachedScriptPromise = scriptsPromiseCache.get(src);

  if (cachedScriptPromise) {
    return cachedScriptPromise;
  }

  const scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', reject, { once: true });
    document.head.appendChild(script);
  });

  scriptsPromiseCache.set(src, scriptPromise);

  return scriptPromise;
};

export const debounce = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  F extends (...args: any) => Promise<any> = (...args: any) => Promise<any>,
>(
  fn: F,
  delay: number,
): F => {
  let timer: number | null = null;

  return ((...args) =>
    new Promise((resolve, reject) => {
      if (timer) {
        window.clearTimeout(timer);
      }

      timer = window.setTimeout(
        () =>
          fn(...args)
            .then(resolve)
            .catch(reject),
        delay,
      );
    })) as F;
};
