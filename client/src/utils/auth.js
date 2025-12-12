
export const TOKEN_KEY = 'noctura_token';
export const USER_KEY = 'noctura_user';

export function saveToken(token) {
  if (!token) return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to save token:', e);
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to read token:', e);
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.error('Failed to clear token:', e);
  }
}

export function saveUser(userObj) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(userObj || {}));
  } catch (e) {
    console.error('Failed to save user:', e);
  }
}

export function getUser() {
  try {
    const s = localStorage.getItem(USER_KEY);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    console.error('Failed to read user:', e);
    return null;
  }
}


export function clearUser() {
  localStorage.removeItem("user");
}
