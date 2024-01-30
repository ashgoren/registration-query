import serviceAccount from './firebase-service-key.json' assert { type: 'json' };
import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || process.env.REACT_APP_FIREBASE_DATABASE_URL,
});

const db = admin.database();
const ordersRef = db.ref('orders');

ordersRef.get().then((snapshot) => {
  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      const key = childSnapshot.key;
      const childData = childSnapshot.val();
      const email = childData.emailConfirmation;
      const date = new Date(childData.timestamp).toLocaleDateString();
      const purchaser = childData.people[0];
      const otherPerson = childData.people[1]?.first ? childData.people[1] : null;
      const purchaserName = `${purchaser.first} ${purchaser.last}`;
      const otherName = otherPerson ? `${otherPerson.first} ${otherPerson.last}` : '';
      console.log(`${purchaserName}, ${otherName}, ${email}, ${date}, ${childData.electronicPaymentId}`);
    });
  } else {
    console.log("No data available");
  }
  admin.app().delete();
}).catch((error) => {
  console.error(error);
});
