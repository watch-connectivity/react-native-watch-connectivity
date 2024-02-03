import {ConfigPlugin} from '@expo/config-plugins';
import {withXCodeExtensionTargets} from './ios/withXcodeWatchTargetExtension';

const withWatchConfigs: ConfigPlugin<WithExtensionProps> = (
  config,
  options,
) => {
  return withXCodeExtensionTargets(config, options);
};

export default withWatchConfigs;
