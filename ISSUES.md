# react-native-watch-connectivity — Revival Issue Tracker

> Library is still the dominant RN Watch solution (9.1K weekly downloads, ~1K stars).
> Last npm publish: Sept 2022 (v1.1.0). Last commit: March 2024.

## Critical — Library broken on modern RN

- [x] **Migrate native module to TurboModule (codegen)**
  Created `NativeWatchConnectivity.ts` codegen spec, converted `RNWatch.m` to `WatchConnectivity.mm` TurboModule. `sendMessage` and `sendMessageData` converted from callbacks to Promises. Module renamed from `RNWatch` to `WatchConnectivity`.

- [x] **Rebuild library scaffolding with `create-react-native-library`**
  Re-scaffolded with `create-react-native-library` v0.57.2. Now uses builder-bob v0.40.18, Yarn 4, ESM output, codegen config. All source moved from `lib/` to `src/`.

- [x] **Rebuild example app on RN 0.84**
  Fresh example app generated targeting RN 0.84 + React 19. Uses hooks from the library.

## High — Stale dependencies & config

- [x] **Upgrade TypeScript 3.9 -> 5.x**
  Now on TypeScript 5.9.2 with strict mode, verbatimModuleSyntax, and modern module resolution.

- [x] **Upgrade ESLint 6 -> 9+ (flat config)**
  Now on ESLint 9.35 with flat config (`eslint.config.mjs`).

- [x] **Bump podspec iOS deployment target 9.0 -> 16.0**
  Podspec now uses `min_ios_version_supported` (inherits from RN's minimum).

- [x] **Replace `lodash.sortby` with native JS**
  Replaced with `Array.prototype.sort()` in `files.ts` and `user-info.ts`. Zero runtime dependencies.

- [x] **Update Node.js minimum to 22**
  `engines` field set to `>= 22.11.0` in package.json. `.nvmrc` set to 22.

## Medium — Project hygiene

- [x] **Add GitHub Actions CI**
  Full CI workflow: lint, typecheck, build library, build iOS example, build Android example.

- [ ] **Add tests**
  Zero test coverage. Jest configured but unused. At minimum: unit tests for the TS layer (message encoding, event system, hooks). Native module testing is harder but the TS surface is very testable.

- [x] **Fix dead homepage link**
  Homepage now points to GitHub repo.

- [ ] **Update README**
  References RN 0.40+, manual linking for RN <0.60, etc. Needs a refresh for the new architecture era.

## Org Migration

- [ ] **Move repo to Tiwtor organisation**
  Update: package.json `repository` URL, podspec `source`, npm maintainers, README badges.

- [x] **Keep existing npm package name** (decided: no scope change, keep `react-native-watch-connectivity`)
