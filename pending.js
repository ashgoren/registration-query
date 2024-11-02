import fs from 'fs/promises';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config();
const serviceAccount = JSON.parse(await fs.readFile(new URL('./firebase-service-key.json', import.meta.url), 'utf-8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = getFirestore();
const pendingRef = db.collection('pendingOrders');
const ordersRef = db.collection('orders');

try {
  const pendingSnapshot = await pendingRef.get();
  const ordersSnapshot = await ordersRef.get();
  const pendingOrders = getOrders(pendingSnapshot);
  const orders = getOrders(ordersSnapshot);

  const pendingOrdersMissingFromOrders = pendingOrders.filter((pendingOrder) => {
    return !orders.some((order) => order.idempotencyKey === pendingOrder.idempotencyKey);
  });
  for (const order of pendingOrdersMissingFromOrders) {
    console.log(order.key, order.people[0].email);
  }
  if (pendingOrdersMissingFromOrders.length === 0) {
    console.log('\nNo pending orders missing from orders :)\n');
  }

} catch (error) {
  console.error(error);
} finally {
  admin.app().delete();
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
