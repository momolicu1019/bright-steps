
# BrightSteps - AI Learning Platform

## Stack
- Backend: Python FastAPI + SQLAlchemy + OpenAI
- Frontend: React Native + Expo (Android & iOS)
- AI: GPT-4o-mini for Teacher & Parent Coach + local adaptive algorithm

## Setup Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY=sk-...
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
Docs: http://localhost:8000/docs

## Setup Frontend
cd frontend/BrightStepsApp
npm install
npx expo start
- Press a for Android emulator, i for iOS simulator
- Edit src/services/api.ts -> set YOUR_LOCAL_IP (e.g., 192.168.1.5)

## Key Features Implemented
- Child profiles with abilities_profile (not diagnosis-locked)
- Adaptive difficulty: accuracy >80% => level up
- TTS in EN/FIL, Large buttons, offline storage ready (AsyncStorage)
- Parent & Teacher dashboards
- AAC board, Visual schedules, Bubble pop
- Rewards: coins, pets, stickers, certificates

## Folder ready for production
- Add Firebase for auth, push
- Add react-native-sqlite for full offline
- Add expo-av for calm music
