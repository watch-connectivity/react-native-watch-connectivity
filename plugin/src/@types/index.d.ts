type IosExtensionTargetType = 'watch' | 'widget' | 'complication';

export type IosExtensionTarget = {
  bundleId: string;
  companionAppBundleId?: string;
  displayName?: string;
  entitlementsFile?: string;
  frameworks: string[];
  name: string;
  sourceDir: string;
  sourceFiles: string[];
  type: IosExtensionTargetType;
};

type WithExtensionProps = {
  devTeamId: string;
  targets: IosExtensionTarget[];
};
