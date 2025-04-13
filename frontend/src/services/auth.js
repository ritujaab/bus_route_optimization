// src/services/auth.js
// This service handles authentication operations

// Simulate a login request
export const loginWithEmailAndPassword = async (email, password) => {
    // In a real app, this would be an API call to your backend
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple email validation for demo purposes
        if (email && password.length >= 6) {
          const user = {
            id: 'user-' + Math.random().toString(36).substr(2, 9),
            email,
            name: email.split('@')[0]
          };
          resolve({ success: true, user });
        } else {
          resolve({ success: false, error: 'Invalid credentials' });
        }
      }, 500);
    });
  };
  
  // Simulate Google Sign In
  export const signInWithGoogle = async () => {
    // In a real app, this would use Firebase Auth or similar
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = {
          id: 'google-user-' + Math.random().toString(36).substr(2, 9),
          email: 'user@example.com',
          name: 'Demo User',
          photoURL: 'https://via.placeholder.com/150'
        };
        resolve({ success: true, user });
      }, 500);
    });
  };
  
  // Simulate user registration
  export const registerWithEmailAndPassword = async (name, email, password) => {
    // In a real app, this would be an API call to your backend
    return new Promise((resolve) => {
      setTimeout(() => {
        if (name && email && password.length >= 6) {
          const user = {
            id: 'user-' + Math.random().toString(36).substr(2, 9),
            email,
            name
          };
          resolve({ success: true, user });
        } else {
          resolve({ success: false, error: 'Invalid input' });
        }
      }, 500);
    });
  };
  
  // Simulate logging out
  export const logout = async () => {
    // In a real app, this would clear sessions, tokens, etc.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  };