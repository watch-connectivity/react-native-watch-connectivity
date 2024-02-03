import * as fs from 'fs';
import * as path from 'path';

import {ConfigPlugin, withXcodeProject} from '@expo/config-plugins';
import {getPbxproj, savePbxproj} from './utils';

import {XcodeProject} from 'xcode';

const WATCH_BUILD_CONFIGURATION_SETTINGS = {
  ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES: 'YES',
  ASSETCATALOG_COMPILER_APPICON_NAME: 'AppIcon',
  ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME: 'AccentColor',
  ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS: 'NO',
  CODE_SIGN_STYLE: 'Automatic',
  CURRENT_PROJECT_VERSION: '1',
  ENABLE_PREVIEWS: 'YES',
  GENERATE_INFOPLIST_FILE: 'YES',
  LD_RUNPATH_SEARCH_PATHS: '"$(inherited) @executable_path/Frameworks"',
  MARKETING_VERSION: '1.0',
  SDKROOT: 'watchos',
  SKIP_INSTALL: 'YES',
  SWIFT_EMIT_LOC_STRINGS: 'YES',
  SWIFT_VERSION: '5.0',
  TARGETED_DEVICE_FAMILY: '4',
  WATCHOS_DEPLOYMENT_TARGET: '9.4',
};

export const withXCodeExtensionTargets: ConfigPlugin<WithExtensionProps> = (
  config,
  options: WithExtensionProps,
) => {
  return withXcodeProject(config, async (newConfig) => {
    try {
      const projectName = newConfig.modRequest.projectName;
      const projectRoot = newConfig.modRequest.projectRoot;
      const platformProjectPath = newConfig.modRequest.platformProjectRoot;
      // const bundleId = config.ios?.bundleIdentifier || '';
      const projectPath = `${newConfig.modRequest.platformProjectRoot}/${projectName}.xcodeproj/project.pbxproj`;

      await updateXCodeProj(
        projectRoot,
        projectPath,
        platformProjectPath,
        options.devTeamId,
        options.targets,
        projectName,
      );
      return newConfig;
    } catch (e) {
      console.error(e);
      throw e;
    }
  });
};

async function updateXCodeProj(
  projectRoot: string,
  projectPath: string,
  platformProjectPath: string,
  developmentTeamId: string,
  targets: IosExtensionTarget[],
  projectName?: string,
) {
  let xcodeProject: XcodeProject;
  try {
    xcodeProject = getPbxproj(projectPath);
  } catch (e) {
    console.error(e);
    return;
  }

  targets.forEach((target) => {
    addXcodeTarget(
      xcodeProject,
      projectRoot,
      platformProjectPath,
      developmentTeamId,
      target,
      projectName,
    );
  });

  savePbxproj(xcodeProject);
}

const resourcesFiles = ['Assets.xcassets', 'Info.plist'];

function addXcodeTarget(
  xcodeProject: XcodeProject,
  projectRoot: string,
  platformProjectPath: string,
  developmentTeamId: string,
  target: IosExtensionTarget,
  projectName?: string,
) {
  const watchAppTargetName = target.name;
  const targetSourceDirPath = path.join(projectRoot, target.sourceDir);

  const targetFilesDir = path.join(platformProjectPath, target.name);
  fs.cpSync(targetSourceDirPath, targetFilesDir, {recursive: true});

  // TODO: check entitlements

  const targetFiles = [...resourcesFiles, ...target.sourceFiles];

  const pbxGroup = xcodeProject.addPbxGroup(
    targetFiles,
    target.name,
    target.name,
  );

  // Add the new PBXGroup to the top level group. This makes the
  // files / folder appear in the file explorer in Xcode.
  const groups = xcodeProject.hash.project.objects.PBXGroup;
  Object.keys(groups).forEach(function (groupKey) {
    // some groups have name and path (Main App), some have only path (Tests), some have only name (Frameworks)
    if (
      groups[groupKey].name === undefined &&
      groups[groupKey].path === undefined
    ) {
      // @ts-expect-error type error
      xcodeProject.addToPbxGroup(pbxGroup.uuid, groupKey);
    }
  });

  // WORK AROUND for codeProject.addTarget BUG
  // Xcode projects don't contain these if there is only one target
  // An upstream fix should be made to the code referenced in this link:
  //   - https://github.com/apache/cordova-node-xcode/blob/8b98cabc5978359db88dc9ff2d4c015cba40f150/lib/pbxProject.js#L860
  const projObjects = xcodeProject.hash.project.objects;
  projObjects.PBXTargetDependency = projObjects.PBXTargetDependency || {};
  // @ts-expect-error type error
  projObjects.PBXContainerItemProxy = projObjects.PBXTargetDependency || {};

  // add target
  // use application not watch2_app https://stackoverflow.com/a/75432468
  let targetType = 'application';
  switch (target.type) {
    case 'widget':
      targetType = 'app_extension';
      break;
    case 'complication':
      targetType = 'app_extension';
      break;
    default:
      break;
  }

  const newTarget = xcodeProject.addTarget(
    target.name,
    targetType,
    target.name,
    // @ts-expect-error typings are showing only 3 args, but the 4th is bundleId, and it works
    target.bundleId,
  );

  // add build phase
  xcodeProject.addBuildPhase(
    target.sourceFiles,
    'PBXSourcesBuildPhase',
    'Sources',
    newTarget.uuid,
    targetType,
    target.name,
  );

  xcodeProject.addBuildPhase(
    resourcesFiles,
    'PBXResourcesBuildPhase',
    'Resources',
    newTarget.uuid,
    targetType,
    target.name,
  );

  // We need to embed the watch app into the main app, this is done automatically for
  // watchos2 apps, but not for the new regular application coded watch apps
  // Create CopyFiles phase in first target
  // Xcode by default is creating a different build phase with name "Embed Watch Content".
  // Parser doesn't have this build phase, but after some research "Embed Watch Content"
  // is just a renamed version of "Copy Files" build phase with dstSubfolderSpec set to 16 ("Products Directory").
  // So we can just create a new "Copy Files" build phase and set dstSubfolderSpec set to 16 later.
  // more information here: https://stackoverflow.com/questions/45104037/need-to-add-an-embed-watch-content-build-phase-to-my-ios-app
  const watchBuildPhase = xcodeProject.addBuildPhase(
    [quoted(watchAppTargetName + '.app')],
    'PBXCopyFilesBuildPhase',
    'Embed Watch Content',
    xcodeProject.getFirstTarget().uuid,
    targetType,
    quoted('$(CONTENTS_FOLDER_PATH)/Watch'),
  );

  // by default xcode PBXCopyFilesBuildPhase have "wrapper" for dstSubfolderSpec, but the correct one for the watch app is "Products Directory"
  //   # dstSubfolderSpec property value used in a PBXCopyFilesBuildPhase object.
  // 'BUILT_PRODUCTS_DIR': 16,  # Products Directory
  //  : 1,                      # Wrapper
  //  : 6,                      # Executables: 6
  //  : 7,                      # Resources
  //  : 15,                     # Java Resources
  //  : 10,                     # Frameworks
  //  : 11,                     # Shared Frameworks
  //  : 12,                     # Shared Support
  //  : 13,                     # PlugIns
  // more info here: https://stackoverflow.com/a/16619840
  // @ts-expect-error addBuildPhase below have dstSubfolderSpec.
  watchBuildPhase.buildPhase.dstSubfolderSpec = 16;

  // change order of the "Embed Watch Content" build phase to be higher in the build order
  // this is a new feature/bug ??? introduced in Xcode 15.x.
  // reference: https://forums.developer.apple.com/forums/thread/730974
  const nativeTargetSections = xcodeProject.pbxNativeTargetSection();
  Object.keys(nativeTargetSections).forEach((key) => {
    const nativeTarget = nativeTargetSections[key];
    // find the one which have .name to "projectName"
    if (nativeTarget.name === projectName) {
      const buildPhases = nativeTarget.buildPhases;
      // find the "Embed Watch Content" build phase
      const embedWatchContentIndex = buildPhases.findIndex(
        (buildPhase) => buildPhase.comment === 'Embed Watch Content',
      );
      // remove it from the array
      const embedWatchContent = buildPhases.splice(embedWatchContentIndex, 1);

      // find the "Start Packager" build phase
      const startPackagerIndex = buildPhases.findIndex(
        (buildPhase) => buildPhase.comment === 'Start Packager',
      );

      // add it to before the "Start Packager" build phase
      buildPhases.splice(startPackagerIndex, 0, embedWatchContent[0]);
    }
  });

  // TODO: check complication
}

function quoted<T>(t: T) {
  return `"${t}"`;
}
