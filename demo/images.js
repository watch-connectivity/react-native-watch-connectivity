//noinspection NpmUsedModulesInstalled
import {ImagePickerManager} from 'NativeModules'

export function pickImage (title, data = false, xtra = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      title:                        title,
      cancelButtonTitle:            'Cancel',
      takePhotoButtonTitle:         'Take Photo...',
      chooseFromLibraryButtonTitle: 'Choose from Library...',
      cameraType:                   'front',
      mediaType:                    'photo',
      quality:                      0.5,
      allowsEditing:                true,
      noData:                       !data,
      storageOptions:               {
        skipBackup: true,
        path:       'images'
      },
      ...xtra
    }

    ImagePickerManager.showImagePicker(options, response => {
      const {error} = response
      if (error) {
        reject(error)
      }
      else {
        if (data && response.data) {
          let dataUri      = 'data:image/jpeg;base64,' + response.data
          response.dataUri = dataUri
        }
        resolve(response)
      }
    });
  })
}
