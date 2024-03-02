import * as fs from 'fs';

export type WidgetFiles = {
  resourcesFiles: string[];
  sourceFiles: string[];
};

// TODO: check if need more extensions here???
const resourceFileExtensions = ['png', 'jpg', 'jpeg', 'plist', 'xcassets'];

const isResourceFile = (fileExtension?: string) => {
  if (!fileExtension) {
    return false;
  }
  return resourceFileExtensions.includes(fileExtension);
};

export function getFilesForXcode(filesPath: string): WidgetFiles {
  const widgetFiles: WidgetFiles = {
    resourcesFiles: [],
    sourceFiles: [],
  };

  if (fs.lstatSync(filesPath).isDirectory()) {
    const files = fs.readdirSync(filesPath);

    files.forEach((file) => {
      const fileExtension = file.split('.').pop();
      if (isResourceFile(fileExtension)) {
        widgetFiles.resourcesFiles.push(file);
      } else {
        widgetFiles.sourceFiles.push(file);
      }
    });
  }

  return widgetFiles;
}
