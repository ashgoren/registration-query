import admin from 'firebase-admin';
import { orders, pendingOrders, log } from './shared.js';

try {
  const pendingOrdersMissingFromOrders = pendingOrders.filter((pendingOrder) => {
    return !orders.some((order) => order.idempotencyKey === pendingOrder.idempotencyKey);
  });
  for (const order of pendingOrdersMissingFromOrders) {
    log({
      message: `${order.key} ${order.people[0].email}`,
      email: order.people[0].email
    });
  }
  if (pendingOrdersMissingFromOrders.length === 0) {
    console.log('\nNo pending orders missing from orders :)\n');
  }
} catch (error) {
  console.error(error);
} finally {
  admin.app().delete();
}
console.log('');
