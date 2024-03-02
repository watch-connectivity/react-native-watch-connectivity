export type IosExtensionTarget = {
  bundleId: string;
  companionAppBundleId?: string;
  displayName?: string;
  entitlementsFile?: string;
  frameworks: string[];
  name: string;
  sourceDir: string;
};
