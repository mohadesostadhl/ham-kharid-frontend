import { useState } from '#imports'
import { $fetch } from 'ofetch'
import type { AuthState, User } from '~/types'

function message(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(message).join(' ')
  if (value && typeof value === 'object') return Object.values(value).map(message).join(' ')
  return 'ارتباط برقرار نشد. دوباره تلاش کنید.'
}
export function useApi() {
  const user = useState<User | null>('user', () => null)
  const csrf = useState('csrf', () => '')
  const ready = useState('session-ready', () => false)
  async function session() {
    const data = await $fetch<AuthState>('/api/auth/session/')
    user.value = data.user
    csrf.value = data.csrf_token
    ready.value = true
  }
  async function request<T>(
    path: string,
    method: 'GET' | 'POST' = 'GET',
    body?: object,
  ): Promise<T> {
    try {
      if (method !== 'GET' && !csrf.value) await session()
      return await $fetch<T>(`/api${path}`, {
        method,
        body,
        headers: method === 'POST' ? { 'X-CSRFToken': csrf.value } : {},
      })
    } catch (error: unknown) {
      const data = (error as { data?: { errors?: unknown } }).data
      throw new Error(message(data?.errors))
    }
  }
  async function authenticate(path: 'login' | 'signup', body: object) {
    const result = await request<AuthState>(`/auth/${path}/`, 'POST', body)
    user.value = result.user
    csrf.value = result.csrf_token
  }
  async function logout() {
    const result = await request<AuthState>('/auth/logout/', 'POST')
    user.value = null
    csrf.value = result.csrf_token
  }
  return { user, ready, session, request, authenticate, logout }
}
