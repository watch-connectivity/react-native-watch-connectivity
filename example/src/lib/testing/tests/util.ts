export type TestLogFn = (str: string) => void;

export function assert(value: boolean, message: string = 'Assertion failed') {
  if (!value) {
    throw new Error(message);
  }
}
