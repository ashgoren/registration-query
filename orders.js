import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs/promises';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config();

const argv = yargs(hideBin(process.argv))
  .usage('Usage: node orders <project> [--pending]')
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
  .demandCommand(1, 'You must specify a project')
  .help()
  .parse();

const project = argv._[0];
const pending = argv.pending;

console.log('');
console.log(`Project: ${project}`);
console.log(pending ? 'PENDING ORDERS' : 'FINAL ORDERS');
console.log('')

const serviceKeyFilename = `${project}-firebase-service-key.json`;

const serviceAccount = JSON.parse(await fs.readFile(new URL(serviceKeyFilename, import.meta.url), 'utf-8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = getFirestore();
const ordersRef = db.collection(pending ? 'pendingOrders' : 'orders');

try {
  const ordersSnapshot = await ordersRef.get();
  const orders = getOrders(ordersSnapshot).sort((a, b) => b.createdAt - a.createdAt);
  console.log('');
  for (const order of orders) {
    // console.log(order);
    const key = order.key;
    const date = order.createdAt.toDate().toLocaleDateString();
    const paymentId = order.paymentId;
    const purchaser = order.people[0];
    const email = purchaser.email;
    const people = getPeople(order.people);
    console.log(`${people}, ${key}, ${date}, ${email}, ${paymentId}`);
  }
  console.log('');
} catch (error) {
  console.error(error);
}

function getOrders(snapshot) {
  const orders = [];
  snapshot.forEach((childSnapshot) => {
    const key = childSnapshot.id;
    const childData = childSnapshot.data();
    orders.push({ key, ...childData });
  });
  return orders;
}

function getPeople(people) {
  return people.map((person) => {
    return `${person.first} ${person.last}`;
  }).join(';');
}
