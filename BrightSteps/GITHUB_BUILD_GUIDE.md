
# One GitHub Repo = One APK Build

## Structure (Monorepo)
```
BrightSteps/
  backend/            -> FastAPI (deployed to cloud)
  frontend/BrightStepsApp -> React Native Expo (builds to APK)
  .github/workflows/  -> CI that builds APK
```

## How it works (Why you can't bundle Python inside APK)
- APK = JavaScript bundle + native code, it cannot run a Python FastAPI server inside
- Solution: APK is OFFLINE-FIRST (all 8 modules work without internet using AsyncStorage)
- When online, APK syncs progress to your FastAPI backend in the cloud
- So from user view: 1 APK install = full app

## Steps to upload to GitHub and get APK

1. Push to GitHub:
   git init
   git add .
   git commit -m "BrightSteps initial"
   git remote add origin https://github.com/YOURNAME/brightsteps.git
   git push -u origin main

2. Deploy backend (free):
   - Go to render.com -> New Web Service -> Connect GitHub repo
   - Root: backend, Build: pip install -r requirements.txt, Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   - Copy URL e.g. https://brightsteps-api.onrender.com
   - Paste in frontend/BrightStepsApp/app.json -> extra.apiUrl

3. Build APK from GitHub:
   - In Expo: npx expo login, npx eas init
   - Get EXPO_TOKEN from expo.dev/settings/access-tokens
   - Add to GitHub Secrets: EXPO_TOKEN
   - Push to main -> Actions tab -> APK builds automatically
   - OR locally: cd frontend/BrightStepsApp && eas build --platform android --profile preview
   - Download APK from expo.dev or GitHub Artifacts

4. Result: One APK file (30-50MB) installable on any Android. iOS build same command with --platform ios (needs Apple dev account).

## Fully Offline Single APK (no backend needed)
Set offlineMode:true in app.json - app will use bundled activities and local progress. You can later sync.
This is best for special needs classrooms with no internet.
