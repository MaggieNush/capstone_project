import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
    // Initial state trying to load from the localStorage for persistence
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,

    login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user)); // Store the entire user object including role
    set({ token, user });
    console.log('Zustand: User logged in, role:', user.role); 
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
    console.log('Zustand: User logged out.');
  },

  isLoggedIn: () => !!get().token,
  isSalesperson: () => get().user?.role === 'salesperson',
  isAdmin: () => get().user?.role === 'admin',
}));

export default useAuthStore;