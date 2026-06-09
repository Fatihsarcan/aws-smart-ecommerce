import { signIn, signOut, signUp, confirmSignUp, fetchAuthSession } from "aws-amplify/auth";

export async function login(email, password) {
  return signIn({ username: email, password });
}

export async function register({ email, password, name, age, interests }) {
  return signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        name,
        "custom:age": String(age),
        "custom:interests": interests,
      },
    },
  });
}

export async function confirmEmail(email, code) {
  return confirmSignUp({ username: email, confirmationCode: code });
}

export async function logout() {
  return signOut();
}

export async function getToken() {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString();
}
