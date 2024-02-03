// import {
//   EnvironmentConfigurationSchema,
//   getPbxproj,
//   loadConfigurationJson,
//   savePbxproj,
// } from '@d3banking/rn-nx-plugin';
// import {logger, workspaceRoot} from '@nrwl/devkit';

// import {XcodeProject} from 'xcode';

// const sourceFiles = [
//   // application
//   'Application/AppContainer.swift',
//   'Application/AppState.swift',
//   'Application/Connectivity.swift',
//   'Application/WatchApp.swift',
//   // interactors
//   'Interactors/AccountsInteractor.swift',
//   'Interactors/FeatureConfig.swift',
//   'Interactors/LocationsInteractor.swift',
//   // ui
//   'UI/ContentView.swift',
//   'UI/ModuleWrapper.swift',
// ];

// const resourcesFiles = [
//   // configuration files
//   'Configuration Files/Settings-debug.xcconfig',
//   'Configuration Files/Settings-release.xcconfig',
//   'Configuration Files/Watch-App-Info.plist',
//   // Preview Content
//   'Preview Content/Preview Assets.xcassets',
//   // resources
//   'Resources/Assets.xcassets',
//   'Resources/Localizable.strings',
// ];

// export function addWatchTarget(
//   projectRoot: string,
//   projectClassName: string,
//   environment: string,
//   debug: boolean,
// ) {
//   const watchAppTargetName = `${projectClassName} Watch App`;

//   let xcodeProject: XcodeProject;
//   try {
//     xcodeProject = getPbxproj(projectRoot, projectClassName);
//   } catch (e) {
//     console.error(e);
//     return;
//   }

//   const configurationJson = loadConfigurationJson(
//     environment,
//     workspaceRoot,
//   ) as EnvironmentConfigurationSchema;

//   // check if the target already exists
//   for (const value of Object.values(
//     xcodeProject.hash.project.objects.PBXNativeTarget,
//   )) {
//     if (value.name === quoted(watchAppTargetName)) {
//       if (debug) {
//         logger.debug(`Target ${watchAppTargetName} already exists`);
//       }
//       return;
//     }
//   }

//   const PRODUCT_BUNDLE_IDENTIFIER = quoted(
//     `${configurationJson.ios.appIdentifier}.watchkitapp`,
//   );
//   const INFOPLIST_FILE = quoted(
//     `${watchAppTargetName}/Configuration Files/Watch-App-Info.plist`,
//   );

//   const buildSettings = {
//     INFOPLIST_FILE,
//     PRODUCT_BUNDLE_IDENTIFIER,
//     ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES: 'YES',
//     ASSETCATALOG_COMPILER_APPICON_NAME: 'AppIcon',
//     ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME: 'AccentColor',
//     CLANG_ANALYZER_NONNULL: 'YES',
//     CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: 'YES_AGGRESSIVE',
//     CLANG_CXX_LANGUAGE_STANDARD: 'gnu++20',
//     CLANG_ENABLE_OBJC_WEAK: 'YES',
//     CLANG_WARN_DOCUMENTATION_COMMENTS: 'YES',
//     GENERATE_INFOPLIST_FILE: 'YES',
//     CLANG_WARN_UNGUARDED_AVAILABILITY: 'YES_AGGRESSIVE',
//     CODE_SIGN_STYLE: 'Automatic',
//     CURRENT_PROJECT_VERSION: quoted(configurationJson.buildNumber),
//     DEBUG_INFORMATION_FORMAT: 'dwarf',
//     SWIFT_VERSION: '5.0',
//     GCC_C_LANGUAGE_STANDARD: 'gnu11',
//     LD_RUNPATH_SEARCH_PATHS: '$(inherited) @executable_path/Frameworks',
//     MARKETING_VERSION: quoted(configurationJson.appVersion),
//     MTL_ENABLE_DEBUG_INFO: 'INCLUDE_SOURCE',
//     MTL_FAST_MATH: 'YES',
//     PRODUCT_NAME: '$(TARGET_NAME)',
//     SWIFT_EMIT_LOC_STRINGS: 'YES',
//     // 4 is watchkit App and Watchkit Extension
//     TARGETED_DEVICE_FAMILY: 4,
//     CLANG_ENABLE_MODULES: 'YES',
//     CODE_SIGN_IDENTITY: 'Apple Development',
//     DEVELOPMENT_TEAM: '',
//     ENABLE_PREVIEWS: 'YES',
//     INFOPLIST_KEY_CFBundleDisplayName: '$(APP_NAME)',
//     // didn't matter so much, it will be overwritten from other place
//     INFOPLIST_KEY_NSLocationWhenInUseUsageDescription:
//       'Location is used to determine your location in relation to our Bank or ATM locations',
//     INFOPLIST_KEY_UISupportedInterfaceOrientations:
//       'UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown',
//     INFOPLIST_KEY_WKCompanionAppBundleIdentifier:
//       '$(COMPANION_BUNDLE_IDENTIFIER)',
//     PROVISIONING_PROFILE_SPECIFIER: '',
//     SDKROOT: 'watchos',
//     SKIP_INSTALL: 'YES',
//     SWIFT_ACTIVE_COMPILATION_CONDITIONS: 'DEBUG',
//     SWIFT_OPTIMIZATION_LEVEL: '"-Onone"',
//     WATCHOS_DEPLOYMENT_TARGET: quoted('7.0'),
//   };

//   // TODO: Enhancement - fix view of this, to be separated in folders (not critical - xcode view only)
//   const pbxGroup = xcodeProject.addPbxGroup(
//     [...sourceFiles, ...resourcesFiles],
//     quoted(watchAppTargetName),
//     quoted(watchAppTargetName),
//   );

//   // Add the new PBXGroup to the top level group. This makes the
//   // files / folder appear in the file explorer in Xcode.
//   const groups = xcodeProject.hash.project.objects.PBXGroup;
//   Object.keys(groups).forEach(function (groupKey) {
//     // some groups have name and path (Main App), some have only path (Tests), some have only name (Frameworks)
//     if (
//       groups[groupKey].name === undefined &&
//       groups[groupKey].path === undefined
//     ) {
//       // @ts-expect-error type error
//       xcodeProject.addToPbxGroup(pbxGroup.uuid, groupKey);
//     }
//   });

//   // WORK AROUND for codeProject.addTarget BUG
//   // Xcode projects don't contain these if there is only one target
//   // An upstream fix should be made to the code referenced in this link:
//   //   - https://github.com/apache/cordova-node-xcode/blob/8b98cabc5978359db88dc9ff2d4c015cba40f150/lib/pbxProject.js#L860
//   const projObjects = xcodeProject.hash.project.objects;
//   projObjects.PBXTargetDependency = projObjects.PBXTargetDependency || {};
//   // @ts-expect-error type error
//   projObjects.PBXContainerItemProxy = projObjects.PBXTargetDependency || {};

//   // add target
//   // use application not watch2_app https://stackoverflow.com/a/75432468
//   const targetType = 'application';

//   const newTarget = xcodeProject.addTarget(
//     watchAppTargetName,
//     targetType,
//     watchAppTargetName,
//     // @ts-expect-error typings are showing only 3 args, but the 4th is bundleId, and it works
//     PRODUCT_BUNDLE_IDENTIFIER,
//   );

//   // need this one later to replace this uuid with default watch app uuid from the scheme (it's separate file)
//   const watchTargetUuid = newTarget.uuid;

//   // add build phase
//   xcodeProject.addBuildPhase(
//     sourceFiles,
//     'PBXSourcesBuildPhase',
//     'Sources',
//     newTarget.uuid,
//     targetType,
//     watchAppTargetName,
//   );

//   xcodeProject.addBuildPhase(
//     resourcesFiles,
//     'PBXResourcesBuildPhase',
//     'Resources',
//     newTarget.uuid,
//     targetType,
//     watchAppTargetName,
//   );

//   // We need to embed the watch app into the main app, this is done automatically for
//   // watchos2 apps, but not for the new regular application coded watch apps
//   // Create CopyFiles phase in first target
//   // Xcode by default is creating a different build phase with name "Embed Watch Content".
//   // Parser doesn't have this build phase, but after some research "Embed Watch Content"
//   // is just a renamed version of "Copy Files" build phase with dstSubfolderSpec set to 16 ("Products Directory").
//   // So we can just create a new "Copy Files" build phase and set dstSubfolderSpec set to 16 later.
//   // more information here: https://stackoverflow.com/questions/45104037/need-to-add-an-embed-watch-content-build-phase-to-my-ios-app
//   const watchBuildPhase = xcodeProject.addBuildPhase(
//     [quoted(watchAppTargetName + '.app')],
//     'PBXCopyFilesBuildPhase',
//     'Embed Watch Content',
//     xcodeProject.getFirstTarget().uuid,
//     targetType,
//     quoted('$(CONTENTS_FOLDER_PATH)/Watch'),
//   );

//   // by default xcode PBXCopyFilesBuildPhase have "wrapper" for dstSubfolderSpec, but the correct one for the watch app is "Products Directory"
//   //   # dstSubfolderSpec property value used in a PBXCopyFilesBuildPhase object.
//   // 'BUILT_PRODUCTS_DIR': 16,  # Products Directory
//   //  : 1,                      # Wrapper
//   //  : 6,                      # Executables: 6
//   //  : 7,                      # Resources
//   //  : 15,                     # Java Resources
//   //  : 10,                     # Frameworks
//   //  : 11,                     # Shared Frameworks
//   //  : 12,                     # Shared Support
//   //  : 13,                     # PlugIns
//   // more info here: https://stackoverflow.com/a/16619840
//   // @ts-expect-error addBuildPhase below have dstSubfolderSpec.
//   watchBuildPhase.buildPhase.dstSubfolderSpec = 16;

//   // change order of the "Embed Watch Content" build phase to be higher in the build order
//   // this is a new feature/bug ??? introduced in Xcode 15.x.
//   // reference: https://forums.developer.apple.com/forums/thread/730974
//   const nativeTargetSections = xcodeProject.pbxNativeTargetSection();
//   Object.keys(nativeTargetSections).forEach((key) => {
//     const nativeTarget = nativeTargetSections[key];
//     // find the one which have .name to "projectClassName"
//     if (nativeTarget.name === projectClassName) {
//       const buildPhases = nativeTarget.buildPhases;
//       // find the "Embed Watch Content" build phase
//       const embedWatchContentIndex = buildPhases.findIndex(
//         (buildPhase) => buildPhase.comment === 'Embed Watch Content',
//       );
//       // remove it from the array
//       const embedWatchContent = buildPhases.splice(embedWatchContentIndex, 1);

//       // find the "Start Packager" build phase
//       const startPackagerIndex = buildPhases.findIndex(
//         (buildPhase) => buildPhase.comment === 'Start Packager',
//       );

//       // add it to before the "Start Packager" build phase
//       buildPhases.splice(startPackagerIndex, 0, embedWatchContent[0]);
//     }
//   });

//   const pbxFileReferenceSection = xcodeProject.pbxFileReferenceSection();
//   // find the Settings-debug.xcconfig file reference
//   const debugConfigFileRef = Object.keys(pbxFileReferenceSection).find(
//     (key) => {
//       const file = pbxFileReferenceSection[key];
//       // @ts-expect-error type error
//       if (file?.name === '"Settings-debug.xcconfig"') {
//         return true;
//       }
//       return false;
//     },
//   );

//   const releaseConfigFileRef = Object.keys(pbxFileReferenceSection).find(
//     (key) => {
//       const file = pbxFileReferenceSection[key];
//       // @ts-expect-error type error
//       if (file?.name === '"Settings-release.xcconfig"') {
//         return true;
//       }
//       return false;
//     },
//   );

//   /* Update build configurations */
//   const configurations = xcodeProject.pbxXCBuildConfigurationSection();

//   for (const key in configurations) {
//     if (typeof configurations[key].buildSettings !== 'undefined') {
//       const productName = configurations[key].buildSettings.PRODUCT_NAME;
//       if (productName === quoted(watchAppTargetName)) {
//         // set the baseConfigurationReference to the correct xcconfig file.
//         // This is because we need to support xcode config files, this means our info.plist will be auto-generated
//         // from the xcconfig file and merged with the default info.plist file.
//         // By default xcode will use the one which was generated by pods, but we need to use the one which was generated by us.
//         // debug xcconfig
//         if (configurations[key].name === 'Debug' && debugConfigFileRef) {
//           configurations[key].baseConfigurationReference = debugConfigFileRef;
//           configurations[key].baseConfigurationReference_comment =
//             'Settings-debug.xcconfig';
//           // release xcconfig
//         } else if (
//           configurations[key].name === 'Release' &&
//           releaseConfigFileRef
//         ) {
//           configurations[key].baseConfigurationReference = releaseConfigFileRef;
//           configurations[key].baseConfigurationReference_comment =
//             'Settings-release.xcconfig';
//         }

//         // add the build settings
//         configurations[key].buildSettings = {
//           ...configurations[key].buildSettings,
//           ...buildSettings,
//         };
//       }
//     }
//   }

//   savePbxproj(xcodeProject);

//   if (debug) {
//     logger.debug(`Added ${watchAppTargetName} target`);
//   }

//   return watchTargetUuid;
// }

// function quoted<T>(t: T) {
//   return `"${t}"`;
// }
