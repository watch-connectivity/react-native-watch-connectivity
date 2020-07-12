import {action, computed, observable, runInAction} from 'mobx';
import {BeforeAfterFn, Test, TestSection} from '../tests';
import {flatten, keys, some, keyBy} from 'lodash';
import {IntegrationTest} from '../IntegrationTest';

type TestStatus =
  | {status: 'pending'}
  | {status: 'running'}
  | {error: Error; status: 'failed'}
  | {status: 'passed'};

export default class TestRunner {
  tests: TestSection[] = [];

  testsByName: {[name: string]: Test} = {};

  @observable.shallow
  public testStatus: {[name: string]: TestStatus} = {};

  @observable
  logs: {[name: string]: [number, string][]} = {};

  constructor(tests: IntegrationTest[]) {
    this.tests = tests.map((t) => ({title: t.title, data: t.tests}));
    this.testsByName = keyBy(flatten(this.tests.map((t) => t.data)), 'name');
    this.testStatus = Object.fromEntries(
      keys(this.testsByName).map((name): [string, TestStatus] => [
        name,
        {status: 'pending'},
      ]),
    );
  }

  @computed
  get running() {
    return some(Object.values(this.testStatus), (s) => s.status === 'running');
  }

  @action
  clear() {
    if (!this.running) {
      this.logs = {};
      this.testStatus = this.testStatus = Object.fromEntries(
        keys(this.testsByName).map((name): [string, TestStatus] => [
          name,
          {status: 'pending'},
        ]),
      );
    }
  }

  @action
  runTest(name: string) {
    const test = this.testsByName[name];

    if (!test) {
      throw new Error(`Test ${name} does not exist`);
    }

    if (this.running) {
      return;
    }

    this.logs[name] = [];

    this.testStatus[name] = {status: 'running'};
    this._runTest(name);
  }

  @action
  private log(name: string, text: string) {
    console.log(`[${name}]`, text);
    this.logs[name].push([Date.now(), text]);
  }

  private _runTest(name: string) {
    console.log(`[${name}] running test`);
    const test = this.testsByName[name];

    if (!test) {
      throw new Error(`Test ${name} does not exist`);
    }

    let isTimedOut = false;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return new Promise((resolve, reject) => {
      let after: BeforeAfterFn[] = [];
      let before: BeforeAfterFn[] = [];

      test
        .run({
          after: (fn) => after.push(fn),
          before: (fn) => before.push(fn),
          log: (text) => {
            this.log(name, text);
          },
        })
        .then(async () => {
          for (let i = 0; i < before.length; i++) {
            await before[i]();
          }
        })
        .then(() => {
          if (!isTimedOut) {
            console.log(`[${name}] passed`);
            runInAction(() => {
              this.testStatus[name] = {status: 'passed'};
            });
            resolve();
          }

          if (timeout) {
            clearTimeout(timeout);
          }

          return null;
        })
        .catch((err: Error) => {
          if (!isTimedOut) {
            console.error(`[${name}] error`, err);
            runInAction(() => {
              this.testStatus[name] = {status: 'failed', error: err};
            });
            reject(err);
          }

          if (timeout) {
            clearTimeout(timeout);
          }
        })
        .finally(async () => {
          for (let i = 0; i < after.length; i++) {
            await after[i]();
          }
        });

      timeout = setTimeout(() => {
        isTimedOut = true;
        runInAction(() => {
          console.warn(`[${name}] timed out`);
          const error = new Error('Timed out');
          this.testStatus[name] = {
            status: 'failed',
            error,
          };
          reject(error);
        });
      }, 30000);
    });
  }
}
