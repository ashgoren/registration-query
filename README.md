# Query Firestore & Google Sheets
## Companion for [Contra Registration App](https://github.com/mgoren/registration-template)

- list all orders
- list any pending orders not finalized
- list any emails present in database but missing from spreadsheet
- list any duplicate emails in spreadsheet

## Configuration

### Create Service Key Files

#### Firebase

- Generate new private key from [project settings service accounts](https://console.firebase.google.com/project/[PROJECT_ID]/settings/serviceaccounts/adminsdk)
- Put in `credentials` directory, rename to `<project>-firebase-service-key.json`

#### Google Sheets

- In `credentials` directory: `gcloud iam service-accounts keys create <project>-sheets-service-key.json --iam-account sheets@<projectId>.iam.gserviceaccount.com`

*Verify credentials are not included in git commit!*

### Configure Environment Variables

- Copy `.example.env` to `.env` and fill in values.

---

## Usage

_Note_: By default these scripts ignore emails listed as test domains in `.env`. To include them, use the `--all`/`--include-test-emails` flag.


## Usage to list all completed orders (or pending, with flag)

```sh
node orders <project> [--pending] [--include-test-emails]
```

# Usage to list any pending orders not finalized

```sh
node missing <project> [--include-test-emails]
```

# Usage to list any emails missing from spreadsheeet, as well as duplicate emails

```sh
node spreadsheet <project> [--include-test-emails]
```
