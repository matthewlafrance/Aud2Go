## Features
* **Authentication:** Secure user login and registration via Supabase Auth.
* **Cloud Storage:** Direct audio file uploads to Supabase Storage.
* **Database Management:** File metadata synced to a PostgreSQL database.
* **Native Playback:** Cross-platform audio playback using.

## File Structure Documentation

* **`app/`** — Frontend Views (Expo Router)
  * `index.tsx` — Authentication portal (Login/Signup). Redirects on success.
  * `library.tsx` — The main dashboard. Handles file uploading, rendering the user's library, and text-based search filtering.
  * `player.tsx` — The "Now Playing" screen with playback controls.
* **`src/`** — Backend Source & API
  * **`config/`**
    * `supabase.js` — Core Supabase client initialization and environment variables.
  * **`services/`**
    * `authService.js` — Handles user registration, login, and session persistence.
    * `storageService.js` — Handles the full CRUD pipeline for audio files (uploading to buckets, inserting metadata to Postgres, fetching library lists, and deletion).
hjhhki

## How to Run

**1. Install dependencies**

```bash
npm install
```

**2. Start the app**

```bash
npx expo start
```
