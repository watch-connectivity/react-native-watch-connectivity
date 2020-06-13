import {Test, TestMode} from './tests';

export class IntegrationTest {
  tests: Test[] = [];
  title: string;

  constructor(title: string) {
    this.title = title;
  }

  protected registerTest(
    name: string,
    mode: TestMode,
    fn: (log: (str: string) => void) => Promise<any>,
  ) {
    this.tests.push({
      name,
      mode,
      run: fn,
    });
  }
}
