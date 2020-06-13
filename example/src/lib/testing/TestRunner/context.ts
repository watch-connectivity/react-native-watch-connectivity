import React, {useContext} from 'react';
import TestRunner from './index';

const Context = React.createContext<TestRunner>(null as any);

export const TestRunnerProvider = Context.Provider;

export function useTestRunner() {
  return useContext(Context);
}
