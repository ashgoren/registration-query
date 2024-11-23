# Query Firebase Realtime database for list of entries

# Configuration

## Create service key file

- Generate new private key from [project settings service accounts](https://console.firebase.google.com/project/[PROJECT_ID]/settings/serviceaccounts/adminsdk)
- Rename to `<projectId>-firebase-service-key.json`

# Usage to list all completed orders (or pending, with flag)

```sh
node orders <project> [--pending]
```

# Usage to list any pendingOrders missing from orders (based on uuid)

```sh
node missing <project>
```
