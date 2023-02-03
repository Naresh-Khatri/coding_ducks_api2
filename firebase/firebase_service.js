import admin from "firebase-admin";
import "dotenv/config";

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: "coding-ducks",
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email:
      "firebase-adminsdk-vw0ai@coding-ducks.iam.gserviceaccount.com",
    client_id: "109898593598376247199",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
  }),
});

export default admin;
