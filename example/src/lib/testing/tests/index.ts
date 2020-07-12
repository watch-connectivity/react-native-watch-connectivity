import {MessagesIntegrationTest} from './message-tests';
import {UserInfoIntegrationTest} from './user-info-tests';
import {ReachabilityIntegrationTest} from './reachability-tests';
import {ApplicationContextTests} from './application-context-tests';
import {MessageDataIntegrationTest} from './message-data-tests';
import {FileIntegrationTest} from './file-tests';
import {PairedTests} from './paired-tests';
import {InstalledTests} from './installed-tests';

export type BeforeAfterFn = () => Promise<void> | void;
export type RegisterFn = (fn: BeforeAfterFn) => void;

export type TestFnOpts = {
  after: RegisterFn;
  before: RegisterFn;
  log: (str: string) => void;
};

export type TestFn = (opts: TestFnOpts) => Promise<void>;

export type TestMode = 'reachable' | 'unreachable' | 'default';

export interface Test {
  mode: TestMode;
  name: string;
  run: TestFn;
}

export interface TestSection {
  data: Test[];
  title: string;
}

const tests = [
  new MessagesIntegrationTest(),
  new MessageDataIntegrationTest(),
  new FileIntegrationTest(),
  new UserInfoIntegrationTest(),
  new ReachabilityIntegrationTest(),
  new ApplicationContextTests(),
  new PairedTests(),
  new InstalledTests(),
];

export default tests;
