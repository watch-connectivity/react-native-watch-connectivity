// Stands in for react-native in the web test project. Importing it fails, so
// the web test proves the default entry never loads react-native or the native
// module, which is what crashed web builds.
throw new Error('react-native must not be imported by the web entry point');
