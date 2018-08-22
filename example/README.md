# RNWatch Example

Example project that demonstrates the RNWatch functionality.

## Set up

Because react-native packager's issues with symlinks, the `example` project doesn't define its own dependencies; rather, they are defined as `devDependencies` in the library's package.json (in the parent folder).

To run the example project:

1. Execute `yarn` in the parent directory
2. Open `example/ios/RNWatchExample.xcodeproj`
3. Run in XCode

## Clean up

After you've tested the library using the RNWatchExample project and want to use it in your own project, make sure you clean up react-native packages from node_modules, otherwise the packager will not know which files to use.

Simply run `rm -rf node_modules/` in the parent directory.
