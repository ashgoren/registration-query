# Query Firebase Realtime database for list of entries

# Configuration

## Fill in Firebase values in `.env` 

- Can copy `.env` file from the relevant project

## Create `firebase-service-key.json`

- Generate new private key from [project settings service accounts](https://console.firebase.google.com/project/[PROJECT_ID]/settings/serviceaccounts/adminsdk)
- Rename to `firebase-service-key.json`

# Usage for query (list of all completed orders)

```sh
npm start
```

# Usage for pending (list of pending orders with uuid not found in orders)

```sh
npm run pending
```
