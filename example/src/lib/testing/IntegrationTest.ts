import {Test, TestFnOpts, TestMode} from './tests';

export class IntegrationTest {
  tests: Test[] = [];
  title: string;

  constructor(title: string) {
    this.title = title;
  }

  protected registerTest(
    name: string,
    mode: TestMode,
    fn: (opts: TestFnOpts) => Promise<any>,
  ) {
    this.tests.push({
      name,
      mode,
      run: fn,
    });
  }
}
