import * as fs from 'fs';

import xcode, {XcodeProject} from 'xcode';

export function getPbxproj(projectPath: string) {
  try {
    const xcodeProject = xcode.project(projectPath);
    xcodeProject.parseSync();
    return xcodeProject;
  } catch (e) {
    throw new Error(
      'Could not find Xcode project file in ios folder. Make sure you opened your project in Xcode or run "pod install" from the ios folder.\n' +
        "Also make sure you're project is a valid one.\n" +
        e,
    );
  }
}

export function savePbxproj(project: XcodeProject) {
  fs.writeFileSync(project.filepath, project.writeSync());
}
