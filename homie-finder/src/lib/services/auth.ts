import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const provider = new GoogleAuthProvider();

import { FirebaseError } from "firebase/app";

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    // The signed-in user info.
    const user = result.user;
    return { user, token };
  } catch (error) {
    // Handle Errors here.
    if (error instanceof FirebaseError) {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData?.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      throw { errorCode, errorMessage, email, credential };
    } else {
      throw error;
    }
  }
}
