## File Structure Documentation

* **`app/`**
  * `index.tsx` — Main frontend view
* **`src/`** — Backend source
  * **`config/`**
    * `supabase.js` — API keys & connection to Supabase database/storage
  * **`services/`**
    * `authService.js` — Authentication engine (Login/Signup/Logout)
    * `storageService.js` — Audio upload engine & library fetching


## How to Run

**1. Install dependencies**

```bash
npm install
```

**2. Start the app**

```bash
npx expo start
```
