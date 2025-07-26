import { User, Session, AuthError, STORAGE_KEYS } from './types';

class AuthService {
  constructor() {
    // Initialize storage if empty
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
  }

  private getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  private setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private generateToken(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private hashPassword(password: string): string {
    // Simple hash for demo purposes - in production, use proper hashing
    return btoa(password + 'salt');
  }

  private verifyPassword(password: string, hashedPassword: string): boolean {
    return this.hashPassword(password) === hashedPassword;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // User registration
  async register(email: string, password: string, name?: string): Promise<{ user: User; session: Session } | AuthError> {
    const users = this.getItem<User[]>(STORAGE_KEYS.USERS) || [];
    
    // Check if user already exists
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return { message: 'User with this email already exists', field: 'email' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { message: 'Please enter a valid email address', field: 'email' };
    }

    // Validate password
    if (password.length < 6) {
      return { message: 'Password must be at least 6 characters long', field: 'password' };
    }

    // Create new user
    const newUser: User = {
      id: this.generateId(),
      email: email.toLowerCase(),
      name: name || undefined,
      createdAt: new Date().toISOString()
    };

    // Store user with hashed password
    const userWithPassword = {
      ...newUser,
      password: this.hashPassword(password)
    };

    users.push(userWithPassword);
    this.setItem(STORAGE_KEYS.USERS, users);

    // Create session
    const session = this.createSession(newUser);
    this.setItem(STORAGE_KEYS.SESSION, session);

    return { user: newUser, session };
  }

  // User login
  async login(email: string, password: string): Promise<{ user: User; session: Session } | AuthError> {
    const users = this.getItem<any[]>(STORAGE_KEYS.USERS) || [];
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { message: 'Invalid email or password', field: 'email' };
    }

    if (!this.verifyPassword(password, user.password)) {
      return { message: 'Invalid email or password', field: 'password' };
    }

    // Create session
    const { password: _, ...userWithoutPassword } = user;
    const session = this.createSession(userWithoutPassword);
    this.setItem(STORAGE_KEYS.SESSION, session);

    return { user: userWithoutPassword, session };
  }

  // Create session
  private createSession(user: User): Session {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    return {
      user,
      token: this.generateToken(),
      expiresAt
    };
  }

  // Get current session
  getCurrentSession(): Session | null {
    const session = this.getItem<Session>(STORAGE_KEYS.SESSION);
    if (!session) return null;

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      this.logout();
      return null;
    }

    return session;
  }

  // Get current user
  getCurrentUser(): User | null {
    const session = this.getCurrentSession();
    return session?.user || null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }

  // Logout
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<User | AuthError> {
    const users = this.getItem<any[]>(STORAGE_KEYS.USERS) || [];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return { message: 'User not found' };
    }

    // Update user
    users[userIndex] = { ...users[userIndex], ...updates };
    this.setItem(STORAGE_KEYS.USERS, users);

    // Update session if it's the current user
    const session = this.getCurrentSession();
    if (session && session.user.id === userId) {
      const { password: _, ...userWithoutPassword } = users[userIndex];
      const updatedSession = { ...session, user: userWithoutPassword };
      this.setItem(STORAGE_KEYS.SESSION, updatedSession);
    }

    const { password: _, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthError | null> {
    const users = this.getItem<any[]>(STORAGE_KEYS.USERS) || [];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return { message: 'User not found' };
    }

    // Verify current password
    if (!this.verifyPassword(currentPassword, users[userIndex].password)) {
      return { message: 'Current password is incorrect', field: 'currentPassword' };
    }

    // Validate new password
    if (newPassword.length < 6) {
      return { message: 'Password must be at least 6 characters long', field: 'newPassword' };
    }

    // Update password
    users[userIndex].password = this.hashPassword(newPassword);
    this.setItem(STORAGE_KEYS.USERS, users);

    return null;
  }
}

export const authService = new AuthService(); 