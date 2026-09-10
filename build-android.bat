@echo off
echo Starting Android APK Build Process...

echo Setting Node.js memory limit...
set NODE_OPTIONS=--max-old-space-size=8192

echo Cleaning previous builds...
cd android
call gradlew clean
cd ..

echo Clearing Expo cache...
call npx expo install --fix

echo Building APK...
call npx expo run:android --variant release --clear

echo Build process completed!
pause