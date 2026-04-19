import type { ProjectConfig } from "../cli/types";

export function generateApiClient(config: ProjectConfig): string {
  const authInterceptor =
    config.authStrategy !== "none"
      ? `
// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`
  }
  return config
})
${
  config.authStrategy === "jwt-refresh"
    ? `
// Refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { data } = await axios.post<{ data: { accessToken: string } }>(
          \`\${import.meta.env.VITE_API_URL}/auth/refresh\`,
          {},
          { withCredentials: true }
        )
        const newToken = data.data.accessToken
        localStorage.setItem('accessToken', newToken)
        original.headers.Authorization = \`Bearer \${newToken}\`
        return api(original)
      } catch {
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)`
    : ""
}`
      : "";

  const extraImports =
    config.authStrategy === "jwt-refresh"
      ? `import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'`
      : `import axios from 'axios'`;

  return `${extraImports}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1',
  timeout: 10_000,
  withCredentials: ${config.authStrategy === "jwt-refresh" ? "true" : "false"},
  headers: {
    'Content-Type': 'application/json',
  },
})
${authInterceptor}

export default api
`;
}

export function generateZustandStore(): string {
  return `import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        setAuth: (user, accessToken) =>
          set({ user, accessToken, isAuthenticated: true }, false, 'setAuth'),
        clearAuth: () =>
          set({ user: null, accessToken: null, isAuthenticated: false }, false, 'clearAuth'),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ accessToken: state.accessToken }),
      }
    ),
    { name: 'AuthStore' }
  )
)
`;
}

export function generateReduxStore(): string {
  return `import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import authSlice from './authSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }),
  devTools: import.meta.env.DEV,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
`;
}

export function generateReduxAuthSlice(): string {
  return `import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
      localStorage.setItem('accessToken', action.payload.accessToken)
    },
    clearAuth: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      localStorage.removeItem('accessToken')
    },
  },
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer
`;
}

export function generateJotaiStore(): string {
  return `import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

interface User {
  id: string
  name: string
  email: string
  role: string
}

// Persisted atom — survives page refresh
export const accessTokenAtom = atomWithStorage<string | null>('accessToken', null)

// Derived atoms
export const userAtom = atom<User | null>(null)
export const isAuthenticatedAtom = atom((get) => get(accessTokenAtom) !== null)
`;
}

export function generateVitest(isBackend: boolean): string {
  if (isBackend) {
    return `import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
}

export default config
`;
  }
  return `/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
`;
}

export function generateVitestSetup(): string {
  return `import '@testing-library/jest-dom'
`;
}
