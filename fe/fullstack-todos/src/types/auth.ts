export interface User {
    id: number;
    email: string;
}

export interface UsersState {
    users: User[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  }

export interface AuthState {
    user: User | null;
    token: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    isAuthenticated: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
}