import { create } from 'zustand';

// Function that safely parse JSON from localstorage, in case of an error it defaults to null
const safeParseJSON = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error parsing ${key} from localStorage:`, error);
        return null;
    }
};

const useAuthStore = create((set) => ({
    // Initial state trying to load from the localStorage for persistence
    token: safeParseJSON('token'),
    user: safeParseJSON('user'), // Stores user information

    // Derived state (getters)
    isAuthenticated: () => {
        const state = useAuthStore.getState(); // Get the current state
        return !!state.token && !!state.user; // Check if both token and user are present
    },

    isAdmin: () => {
        const state = useAuthStore.getState(); 
        return state.isAuthenticated() && state.user?.role === 'admin'
    },

    isSalesperson: () => {
        const state = useAuthStore.getState();
        return state.isAuthenticated() && state.user?.role === 'salesperson';
    },

    // Actions (setters)
    login: (token, user) => {
        set({ token, user });
        localStorage.setItem('token', JSON.stringify(token));
        localStorage.setItem('user', JSON.stringify(user));
    },

    logout: () => {
        set({ token: null, user: null });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
}));

export default useAuthStore;