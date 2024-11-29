import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs/promises';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const scriptName = process.argv[1].split('/').pop();
const argv = yargs(hideBin(process.argv))
  .usage(`\nUsage: node ${scriptName} <project> [--pending] [--include-test-emails]`)
  .command('<project>', 'Specify the project', (yargs) => {
    yargs.positional('project', {
      describe: 'The project name',
      type: 'string',
    });
  })
  .option('pending', {
    alias: 'p',
    type: 'boolean',
    description: 'Include pending orders',
    default: false,
  })
  .option('include-test-emails', {
    alias: 'all',
    type: 'boolean',
    description: 'Include test emails',
    default: false,
  })
  .demandCommand(1, 'You must specify a project')
  .help()
  .parse();

const project = argv._[0];
const pending = argv.pending;
const includeTestEmails = argv['include-test-emails'];
const testDomains = includeTestEmails ? [] : process.env.TEST_DOMAINS.split(',').map((domain) => domain.trim());
const spreadsheetId = process.env[`${project.toUpperCase()}_SHEET_ID`];

console.log(`\nPROJECT: ${project}`);
console.log(includeTestEmails ? '' : 'Excluding test emails!\n');

// setup firebase
const firebaseServiceKeyPath = `credentials/${project}-firebase-service-key.json`;
const firebaseServiceAccount = JSON.parse(await fs.readFile(new URL(firebaseServiceKeyPath, import.meta.url), 'utf-8'));
admin.initializeApp({ credential: admin.credential.cert(firebaseServiceAccount) });

// setup google sheets
const sheetsServiceKeyPath = `credentials/${project}-sheets-service-key.json`;
const sheetsServiceAccount = JSON.parse(await fs.readFile(new URL(sheetsServiceKeyPath, import.meta.url), 'utf-8'));
const sheetsClient = new google.auth.JWT({ email: sheetsServiceAccount.client_email, key: sheetsServiceAccount.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const sheets = google.sheets({ version: 'v4', auth: sheetsClient });

// get data from firestore
const db = getFirestore();
const pendingOrders = await getOrders('pendingOrders');
const orders = await getOrders('orders');

// helper functions

async function getOrders(collection) {
  const ref = db.collection(collection);
  const snapshot = await ref.get();
  const orders = snapshot.docs.map((doc) => ({ key: doc.id, ...doc.data() }));
  return orders.sort((a, b) => b.createdAt - a.createdAt);
}

async function readSheet() {
  return sheets.spreadsheets.values.get({ spreadsheetId, range: 'Orders' });
}

function log({ email, message }) {
  const isTestEmail = testDomains.some((domain) => email.includes(domain));
  if (!isTestEmail) {
    console.log(message);
  }
}

export { pending, pendingOrders, orders, readSheet, log };
