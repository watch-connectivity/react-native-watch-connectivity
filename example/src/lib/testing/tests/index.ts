import {MessagesIntegrationTest} from './message-tests';
import {UserInfoIntegrationTest} from './user-info-tests';
import {ReachabilityIntegrationTest} from './reachability-tests';
import {ApplicationContextTests} from './application-context-tests';
import {WatchStateIntegrationTest} from './watch-state-tests';
import {MessageDataIntegrationTest} from './message-data-tests';
import {FileIntegrationTest} from './file-tests';

export type TestFn = (log: (str: string) => void) => Promise<void>;

export type TestMode = 'reachable' | 'unreachable' | 'default';

export interface Test {
  name: string;
  mode: TestMode;
  run: TestFn;
}

export interface TestSection {
  title: string;
  data: Test[];
}

const tests = [
  new MessagesIntegrationTest(),
  new MessageDataIntegrationTest(),
  new FileIntegrationTest(),
  new UserInfoIntegrationTest(),
  new ReachabilityIntegrationTest(),
  new ApplicationContextTests(),
  new WatchStateIntegrationTest(),
];

export default tests;
