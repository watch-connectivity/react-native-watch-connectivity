//noinspection NpmUsedModulesInstalled

import ImagePicker, {ImagePickerResponse} from 'react-native-image-picker';

import {MAX_IMAGE_SIZE} from './constants';

export function pickImage(
  title: string,
  data = false,
): Promise<ImagePickerResponse & {dataUri?: string}> {
  const extraPickerOptions = data
    ? {maxWidth: MAX_IMAGE_SIZE, maxHeight: MAX_IMAGE_SIZE}
    : {};

  return new Promise((resolve, reject) => {
    ImagePicker.showImagePicker(
      {
        title: title,
        cancelButtonTitle: 'Cancel',
        takePhotoButtonTitle: 'Take Photo...',
        chooseFromLibraryButtonTitle: 'Choose from Library...',
        cameraType: 'front',
        mediaType: 'photo',
        quality: 0.5,
        allowsEditing: true,
        noData: !data,
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
        ...extraPickerOptions,
      },
      (response) => {
        const {error} = response;
        if (response.didCancel) {
          // Do nothing
        } else if (error) {
          reject(error);
        } else {
          if (data && response.data) {
            let dataUri = 'data:image/jpeg;base64,' + response.data;
            resolve({...response, dataUri});
          }
          resolve(response);
        }
      },
    );
  });
}
