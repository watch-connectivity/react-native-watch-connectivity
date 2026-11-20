import {
  ERROR_CODE_SESSION_UNREACHABLE,
  WATCH_ERROR_CODES,
  WatchError,
  isWatchError,
  toWatchError,
} from '../errors';
import type { WatchErrorCode } from '../errors';
import { nativeErrorDictionary, nativeRejection } from './fake-native-module';

const WC_ERROR_CODES: ReadonlyArray<[number, WatchErrorCode]> = [
  [7001, 'generic-error'],
  [7002, 'session-not-supported'],
  [7003, 'session-missing-delegate'],
  [7004, 'session-not-activated'],
  [7005, 'device-not-paired'],
  [7006, 'watch-app-not-installed'],
  [7007, 'not-reachable'],
  [7008, 'invalid-parameter'],
  [7009, 'payload-too-large'],
  [7010, 'payload-unsupported-types'],
  [7011, 'message-reply-failed'],
  [7012, 'message-reply-timed-out'],
  [7013, 'file-access-denied'],
  [7014, 'delivery-failed'],
  [7015, 'insufficient-space'],
  [7016, 'session-inactive'],
  [7017, 'transfer-timed-out'],
  [7018, 'companion-app-not-installed'],
  [7019, 'watch-only-app'],
];

describe('toWatchError', () => {
  it.each(WC_ERROR_CODES)(
    'maps a rejected promise with WCErrorCode %i to %s',
    (nativeCode, code) => {
      const error = toWatchError(nativeRejection(nativeCode));

      expect(error.code).toBe(code);
      expect(error.nativeCode).toBe(nativeCode);
      expect(error.domain).toBe('WCErrorDomain');
    }
  );

  it.each(WC_ERROR_CODES)(
    'maps an event error dictionary with WCErrorCode %i to %s',
    (nativeCode, code) => {
      expect(toWatchError(nativeErrorDictionary(nativeCode)).code).toBe(code);
    }
  );

  it('covers every exported code except unknown', () => {
    expect(WC_ERROR_CODES.map(([, code]) => code).sort()).toEqual(
      WATCH_ERROR_CODES.filter((code) => code !== 'unknown').sort()
    );
  });

  it('maps the legacy EWCERRORDOMAIN code format', () => {
    const legacy = Object.assign(new Error('Unreachable'), {
      code: 'EWCERRORDOMAIN7007',
    });

    expect(toWatchError(legacy).code).toBe('not-reachable');
  });

  it('keeps the native message', () => {
    expect(toWatchError(nativeRejection(7007)).message).toBe(
      'Native error 7007'
    );
    expect(toWatchError(nativeErrorDictionary(7009)).message).toBe(
      'Native error 7009'
    );
  });

  it('treats codes from other domains as unknown', () => {
    const error = toWatchError(nativeRejection(7007, 'NSCocoaErrorDomain'));

    expect(error.code).toBe('unknown');
    expect(error.nativeCode).toBe(7007);
    expect(error.domain).toBe('NSCocoaErrorDomain');
  });

  it('treats anything that is not an error as unknown', () => {
    expect(toWatchError(undefined).code).toBe('unknown');
    expect(toWatchError('boom').code).toBe('unknown');
    expect(toWatchError(new Error('boom')).message).toBe('boom');
  });

  it('returns a WatchError unchanged', () => {
    const error = new WatchError('not-reachable');

    expect(toWatchError(error)).toBe(error);
  });
});

describe('isWatchError', () => {
  it('matches a WatchError and, optionally, its code', () => {
    const error = toWatchError(nativeRejection(7007));

    expect(isWatchError(error)).toBe(true);
    expect(isWatchError(error, 'not-reachable')).toBe(true);
    expect(isWatchError(error, 'payload-too-large')).toBe(false);
  });

  it('rejects plain errors and other values', () => {
    expect(isWatchError(new Error('boom'))).toBe(false);
    expect(isWatchError(nativeRejection(7007))).toBe(false);
    expect(isWatchError(null)).toBe(false);
  });
});

it('keeps ERROR_CODE_SESSION_UNREACHABLE matching unreachable errors', () => {
  expect(toWatchError(nativeRejection(7007)).code).toBe(
    ERROR_CODE_SESSION_UNREACHABLE
  );
});
