/**
 * Stable error codes. Each `WCErrorCode` from Apple's WatchConnectivity
 * framework has one; `unknown` covers anything else.
 */
export const WATCH_ERROR_CODES = [
  'generic-error',
  'session-not-supported',
  'session-missing-delegate',
  'session-not-activated',
  'device-not-paired',
  'watch-app-not-installed',
  'not-reachable',
  'invalid-parameter',
  'payload-too-large',
  'payload-unsupported-types',
  'message-reply-failed',
  'message-reply-timed-out',
  'file-access-denied',
  'delivery-failed',
  'insufficient-space',
  'session-inactive',
  'transfer-timed-out',
  'companion-app-not-installed',
  'watch-only-app',
  'unknown',
] as const;

export type WatchErrorCode = (typeof WATCH_ERROR_CODES)[number];

const WC_ERROR_DOMAIN = 'WCErrorDomain';

// WCErrorCode values start at 7001 and follow the order of WATCH_ERROR_CODES.
const FIRST_WC_ERROR_CODE = 7001;
const LAST_WC_ERROR_CODE = FIRST_WC_ERROR_CODE + WATCH_ERROR_CODES.length - 2;

// The pre-TurboModule bridge built codes such as `EWCERRORDOMAIN7007`.
const LEGACY_CODE_PATTERN = /^EWCERRORDOMAIN(\d+)$/;

const DEFAULT_MESSAGES: Partial<Record<WatchErrorCode, string>> = {
  'session-not-supported':
    'WatchConnectivity is not supported on this device or platform',
};

/**
 * @deprecated Compare `error.code` with `'not-reachable'` instead.
 */
export const ERROR_CODE_SESSION_UNREACHABLE: WatchErrorCode = 'not-reachable';

export class WatchError extends Error {
  readonly code: WatchErrorCode;
  /** The `NSError` code, when the error came from the native side. */
  readonly nativeCode: number | null;
  /** The `NSError` domain, when the error came from the native side. */
  readonly domain: string | null;

  constructor(
    code: WatchErrorCode,
    message?: string,
    native: { code?: number | null; domain?: string | null } = {}
  ) {
    super(message ?? DEFAULT_MESSAGES[code] ?? `Watch error: ${code}`);
    this.name = 'WatchError';
    this.code = code;
    this.nativeCode = native.code ?? null;
    this.domain = native.domain ?? null;
  }
}

/**
 * True when `value` is a {@link WatchError}, optionally with the given code.
 */
export function isWatchError(
  value: unknown,
  code?: WatchErrorCode
): value is WatchError {
  return (
    value instanceof Error &&
    value.name === 'WatchError' &&
    (code === undefined || (value as WatchError).code === code)
  );
}

/**
 * Converts a native error into a {@link WatchError}. It accepts a rejected
 * TurboModule promise (`code` is the `NSError` code as a string), an error
 * dictionary sent with an event (`code` is a number), and the legacy
 * `EWCERRORDOMAIN7007` format.
 *
 * @private
 */
export function toWatchError(raw: unknown): WatchError {
  if (isWatchError(raw)) {
    return raw;
  }

  const { code, domain, message } = readNativeError(raw);
  const nativeCode = parseNativeCode(code);
  const isWatchConnectivityCode =
    domain === WC_ERROR_DOMAIN ||
    (typeof code === 'string' && LEGACY_CODE_PATTERN.test(code));

  return new WatchError(
    isWatchConnectivityCode ? codeForWcError(nativeCode) : 'unknown',
    message,
    {
      code: nativeCode,
      domain: domain ?? (isWatchConnectivityCode ? WC_ERROR_DOMAIN : null),
    }
  );
}

function readNativeError(raw: unknown): {
  code: unknown;
  domain: string | null;
  message: string | undefined;
} {
  if (typeof raw !== 'object' || raw === null) {
    return { code: undefined, domain: null, message: undefined };
  }

  const { code, domain, message } = raw as Record<string, unknown>;

  return {
    code,
    domain: typeof domain === 'string' ? domain : null,
    message: typeof message === 'string' && message ? message : undefined,
  };
}

function parseNativeCode(code: unknown): number | null {
  if (typeof code === 'number') {
    return code;
  }
  if (typeof code !== 'string') {
    return null;
  }

  const digits = LEGACY_CODE_PATTERN.exec(code)?.[1] ?? code;
  const parsed = Number(digits);
  return Number.isInteger(parsed) ? parsed : null;
}

function codeForWcError(nativeCode: number | null): WatchErrorCode {
  if (
    nativeCode === null ||
    nativeCode < FIRST_WC_ERROR_CODE ||
    nativeCode > LAST_WC_ERROR_CODE
  ) {
    return 'unknown';
  }

  return WATCH_ERROR_CODES[nativeCode - FIRST_WC_ERROR_CODE] ?? 'unknown';
}
