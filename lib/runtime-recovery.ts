/** These failures require a fresh document, not a retry of cached route data. */
export function needsDocumentReload(message: string) {
  return /frame\.join is not a function|__webpack_modules__\[moduleId\] is not a function|ChunkLoadError|Loading chunk .+ failed/i.test(message);
}

/** One automatic retry per URL and error, so persistent failures cannot loop. */
export function claimDocumentReload(storage: Pick<Storage, "getItem" | "setItem">, url: string, message: string) {
  if (!needsDocumentReload(message)) return false;
  const key = `nova:runtime-recovery:${url}:${message}`;
  try {
    if (storage.getItem(key)) return false;
    storage.setItem(key, "1");
    return true;
  } catch {
    return false;
  }
}
