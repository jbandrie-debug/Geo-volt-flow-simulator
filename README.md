# Volt-Flow Circuit Simulator

Volt-Flow is an interactive electrical circuit simulator with English and Bisaya support. The same app runs as a web app and as an Android APK.

## Get the Android APK

Open the repository's **Releases** page and download `app-debug.apk` from the latest `v*` release. On the phone, allow installation from the browser or file manager when Android asks. This is a debug-signed APK for direct installation and testing; it is not a Play Store release.

Pushing a branch under `release/` builds an APK, creates a GitHub Release, and attaches the APK to that release. Workflow artifacts are retained for 30 days.

## Build locally

Requirements: Node.js 22+, Java 21, and Android SDK platform 36/build tools 36.0.0.

```sh
npm install
npm run prepare:web
npx cap add android
npx @capacitor/assets generate --android --assetPath assets --iconBackgroundColor '#1a1f2e' --splashBackgroundColor '#1a1f2e'
npx cap sync android
cd android
./gradlew assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`.

To publish a new APK release, create and push a version branch such as `release/v1.0.0` from the desired commit. GitHub Actions builds the APK, creates the matching GitHub Release, and saves the APK as both a release asset and a workflow artifact.

## Circuit model notes

The simulator solves DC steady state and sinusoidal AC steady state. Capacitors and inductors use their AC impedances; transient charging and switching behavior is not modeled. The Ground component marks a reference point for circuit diagrams and does not create a voltage source.

