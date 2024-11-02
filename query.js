import fs from 'fs/promises';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config();
const serviceAccount = JSON.parse(await fs.readFile(new URL('./firebase-service-key.json', import.meta.url), 'utf-8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = getFirestore();
const ordersRef = db.collection('orders');

try {
  const ordersSnapshot = await ordersRef.get();
  const orders = getOrders(ordersSnapshot).sort((a, b) => b.createdAt - a.createdAt);
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
