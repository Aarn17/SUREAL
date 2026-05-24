/* ============================================================
   SUREAL — Auth System
   localStorage-based (replace with Supabase/Firebase for prod)
   ============================================================ */

const Auth = (() => {
  const USERS_KEY   = 'sureal_users';
  const SESSION_KEY = 'sureal_session';

  /* ——— Helpers ——— */
  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch { return []; }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch { return null; }
  }

  function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  /* ——— Validators ——— */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPassword(password) {
    return password.length >= 8;
  }

  /* ——— Actions ——— */
  function register({ name, email, password }) {
    if (!name || name.trim().length < 2) {
      return { ok: false, error: 'Name must be at least 2 characters.' };
    }
    if (!isValidEmail(email)) {
      return { ok: false, error: 'Please enter a valid email address.' };
    }
    if (!isValidPassword(password)) {
      return { ok: false, error: 'Password must be at least 8 characters.' };
    }

    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'An account with this email already exists.' };
    }

    const user = {
      id:        'usr_' + Date.now(),
      name:      name.trim(),
      email:     email.toLowerCase(),
      password,  /* In production: hash this server-side */
      createdAt: new Date().toISOString(),
      orders:    [],
      wishlist:  []
    };

    users.push(user);
    saveUsers(users);

    const session = { id: user.id, name: user.name, email: user.email };
    setSession(session);

    return { ok: true, user: session };
  }

  function login({ email, password }) {
    if (!isValidEmail(email)) {
      return { ok: false, error: 'Please enter a valid email address.' };
    }

    const users = getUsers();
    const user  = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return { ok: false, error: 'Invalid email or password.' };
    }

    const session = { id: user.id, name: user.name, email: user.email };
    setSession(session);

    return { ok: true, user: session };
  }

  function logout() {
    clearSession();
    window.location.href = 'index.html';
  }

  function currentUser() {
    return getSession();
  }

  function isLoggedIn() {
    return getSession() !== null;
  }

  function requireAuth(redirectUrl = 'auth.html') {
    if (!isLoggedIn()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }

  function getFullUser() {
    const session = getSession();
    if (!session) return null;
    const users = getUsers();
    return users.find(u => u.id === session.id) || null;
  }

  function updateProfile({ name, email }) {
    const session = getSession();
    if (!session) return { ok: false, error: 'Not logged in.' };

    const users = getUsers();
    const idx   = users.findIndex(u => u.id === session.id);
    if (idx === -1) return { ok: false, error: 'User not found.' };

    if (name) users[idx].name = name.trim();
    if (email && isValidEmail(email)) users[idx].email = email.toLowerCase();

    saveUsers(users);

    const updated = { id: users[idx].id, name: users[idx].name, email: users[idx].email };
    setSession(updated);

    return { ok: true, user: updated };
  }

  /* ——— Wishlist ——— */
  function toggleWishlist(productId) {
    if (!isLoggedIn()) {
      window.location.href = 'auth.html';
      return false;
    }

    const users = getUsers();
    const session = getSession();
    const idx = users.findIndex(u => u.id === session.id);
    if (idx === -1) return false;

    const wishlist = users[idx].wishlist || [];
    const pidx = wishlist.indexOf(productId);

    if (pidx === -1) {
      wishlist.push(productId);
      users[idx].wishlist = wishlist;
      saveUsers(users);
      return true; // added
    } else {
      wishlist.splice(pidx, 1);
      users[idx].wishlist = wishlist;
      saveUsers(users);
      return false; // removed
    }
  }

  function getWishlist() {
    const user = getFullUser();
    return user?.wishlist || [];
  }

  function isWishlisted(productId) {
    return getWishlist().includes(productId);
  }

  /* ——— Order History ——— */
  function saveOrder(order) {
    if (!isLoggedIn()) return;

    const users = getUsers();
    const session = getSession();
    const idx = users.findIndex(u => u.id === session.id);
    if (idx === -1) return;

    if (!users[idx].orders) users[idx].orders = [];
    users[idx].orders.unshift({
      id:        'ord_' + Date.now(),
      ...order,
      createdAt: new Date().toISOString()
    });
    saveUsers(users);
  }

  function getOrders() {
    const user = getFullUser();
    return user?.orders || [];
  }

  /* ——— Public API ——— */
  return {
    register, login, logout,
    currentUser, isLoggedIn, requireAuth,
    getFullUser, updateProfile,
    toggleWishlist, getWishlist, isWishlisted,
    saveOrder, getOrders
  };
})();

window.Auth = Auth;

/* Update nav auth state */
document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.currentUser();
  const accountLink = document.getElementById('nav-account-link');
  if (accountLink) {
    accountLink.href = user ? 'account.html' : 'auth.html';
    accountLink.title = user ? `Signed in as ${user.name}` : 'Sign in';
  }
});
