/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const path = require('path');

const {getDefaultConfig} = require('metro-config');

const extraNodeModules = {
  'react-native-watch-connectivity': path.resolve(__dirname + '/../lib'),
};
const watchFolders = [path.resolve(__dirname + '/../lib')];

module.exports = (async () => {
  const {
    resolver: {sourceExts, assetExts},
  } = await getDefaultConfig();

  return {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
      extraNodeModules: new Proxy(extraNodeModules, {
        get: (target, name) =>
          //redirects dependencies referenced from common/ to local node_modules
          name in target
            ? target[name]
            : path.join(process.cwd(), `node_modules/${name}`),
      }),
    },
    watchFolders,
  };
})();
