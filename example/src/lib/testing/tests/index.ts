import {MessagesIntegrationTest} from './message-tests';
import {UserInfoIntegrationTest} from './user-info-tests';
import {ReachabilityIntegrationTest} from './reachability-tests';
import {ApplicationContextTests} from './application-context-tests';
import {MessageDataIntegrationTest} from './message-data-tests';
import {FileIntegrationTest} from './file-tests';
import {PairedTests} from './paired-tests';
import {InstalledTests} from './installed-tests';

export type TestFn = (log: (str: string) => void) => Promise<void>;

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
