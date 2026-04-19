import type { ProjectConfig } from "../cli/types";

// ─── API Client ───────────────────────────────────────────────────────────────

export function generateApiClient(config: ProjectConfig): string {
  const extraImports =
    config.authStrategy === "jwt-refresh"
      ? `import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'`
      : `import axios from 'axios'`;

  const authInterceptor =
    config.authStrategy !== "none"
      ? `
// ── Attach access token ───────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = \`Bearer \${token}\`
  return config
})
${
  config.authStrategy === "jwt-refresh"
    ? `
// ── Silent refresh on 401 ────────────────────────────────────────────────────
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

// ─── useApi hook ──────────────────────────────────────────────────────────────

export function generateUseApiHook(): string {
  return `import { useState, useCallback } from 'react'
import api from '@/services/api'
import type { AxiosRequestConfig } from 'axios'

interface UseApiState<T> {
  data:    T | null
  loading: boolean
  error:   string | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (config?: AxiosRequestConfig) => Promise<T | null>
  reset:   () => void
}

export function useApi<T = unknown>(
  defaultConfig: AxiosRequestConfig
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data:    null,
    loading: false,
    error:   null,
  })

  const execute = useCallback(
    async (overrideConfig?: AxiosRequestConfig): Promise<T | null> => {
      setState({ data: null, loading: true, error: null })
      try {
        const response = await api.request<T>({ ...defaultConfig, ...overrideConfig })
        setState({ data: response.data, loading: false, error: null })
        return response.data
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred'
        setState({ data: null, loading: false, error: message })
        return null
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [defaultConfig.url, defaultConfig.method]
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return { ...state, execute, reset }
}
`;
}

// ─── useLocalStorage hook ─────────────────────────────────────────────────────

export function generateUseLocalStorageHook(): string {
  return `import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(\`useLocalStorage: error setting "\${key}"\`, error)
    }
  }

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T)
        } catch {
          // ignore
        }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [key])

  return [storedValue, setValue] as const
}
`;
}

// ─── State management ─────────────────────────────────────────────────────────

export function generateZustandStore(): string {
  return `import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface User {
  id:    string
  name:  string
  email: string
  role:  string
}

interface AuthState {
  user:            User | null
  accessToken:     string | null
  isAuthenticated: boolean
  setAuth:  (user: User, accessToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user:            null,
        accessToken:     null,
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
      serializableCheck: { ignoredActions: [] },
    }),
  devTools: import.meta.env.DEV,
})

export type RootState  = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch             = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
`;
}

export function generateReduxAuthSlice(): string {
  return `import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id:    string
  name:  string
  email: string
  role:  string
}

interface AuthState {
  user:            User | null
  accessToken:     string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user:            null,
  accessToken:     localStorage.getItem('accessToken'),
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user            = action.payload.user
      state.accessToken     = action.payload.accessToken
      state.isAuthenticated = true
      localStorage.setItem('accessToken', action.payload.accessToken)
    },
    clearAuth: (state) => {
      state.user            = null
      state.accessToken     = null
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
  id:    string
  name:  string
  email: string
  role:  string
}

export const accessTokenAtom     = atomWithStorage<string | null>('accessToken', null)
export const userAtom            = atom<User | null>(null)
export const isAuthenticatedAtom = atom((get) => get(accessTokenAtom) !== null)
`;
}

// ─── Testing ──────────────────────────────────────────────────────────────────

export function generateVitest(isBackend: boolean): string {
  if (isBackend) {
    return `import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/index.ts'],
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
    globals:     true,
    environment: 'jsdom',
    setupFiles:  ['./src/test/setup.ts'],
    coverage: {
      provider:  'v8',
      reporter:  ['text', 'lcov', 'html'],
      exclude:   ['node_modules/', 'src/test/'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
`;
}

export function generateVitestSetup(): string {
  return `import '@testing-library/jest-dom'\n`;
}

// ─── TanStack Router ──────────────────────────────────────────────────────────

export function generateTanStackRootRoute(): string {
  return `import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #eee' }}>
        <Link to="/" activeProps={{ style: { fontWeight: 'bold' } }}>
          Home
        </Link>
      </nav>
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </>
  ),
})
`;
}

export function generateTanStackIndexRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to your MERN Stack using TanStack Router! 🚀</p>
    </div>
  )
}
`;
}

// ─── React Router components ──────────────────────────────────────────────────

export function generateReactRouterRoutesIndex(): string {
  return `import { Routes, Route, Link } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function AppRouter() {
  return (
    <>
      <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #eee' }}>
        <Link to="/">Home</Link>
      </nav>
      <main style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  )
}
`;
}