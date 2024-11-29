import { pending, orders, pendingOrders, log } from './shared.js';

console.log(pending ? '\nPENDING ORDERS\n' : '\nFINAL ORDERS\n');
const theOrders = pending ? pendingOrders : orders;

try {
  for (const order of theOrders) {
    // console.log(order);
    const key = order.key;
    const date = order.createdAt.toDate().toLocaleDateString();
    const paymentId = order.paymentId;
    const purchaser = order.people[0];
    const email = purchaser.email;
    const people = formatPeople(order.people);
    log({
      message: `${people}, ${key}, ${date}, ${email}, ${paymentId}`,
      email
    });
  }
} catch (error) {
  console.error(error);
}
console.log('');


// helper function
function formatPeople(people) {
  return people.map((person) => {
    return `${person.first} ${person.last}`;
  }).join(';');
}
