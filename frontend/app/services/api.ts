import type { AuthTokens, Board, Client, Column, Inspiration, Task, User, Workspace } from '~/types'

function useApiFetch() {
  const config = useRuntimeConfig()
  const token = useCookie('access_token')

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }
    if (token.value) headers['Authorization'] = `Bearer ${token.value}`

    const res = await fetch(`${config.public.apiBase}${path}`, { ...options, headers })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(err.message ?? 'Request failed')
    }
    return res.json() as Promise<T>
  }

  return { request }
}

export function useAuthApi() {
  const { request } = useApiFetch()
  return {
    register: (data: { name: string; email: string; password: string }) =>
      request<AuthTokens>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<AuthTokens>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<User>('/auth/me'),
  }
}

export function useWorkspaceApi() {
  const { request } = useApiFetch()
  return {
    list: () => request<Workspace[]>('/workspaces'),
    get: (id: string) => request<Workspace>(`/workspaces/${id}`),
    create: (data: Partial<Workspace>) =>
      request<Workspace>('/workspaces', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Workspace>) =>
      request<Workspace>(`/workspaces/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<void>(`/workspaces/${id}`, { method: 'DELETE' }),
  }
}

export function useBoardApi() {
  const { request } = useApiFetch()
  return {
    list: (workspaceId: string) => request<Board[]>(`/boards?workspaceId=${workspaceId}`),
    create: (data: Partial<Board>) =>
      request<Board>('/boards', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Board>) =>
      request<Board>(`/boards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<void>(`/boards/${id}`, { method: 'DELETE' }),
  }
}

export function useTaskApi() {
  const { request } = useApiFetch()
  return {
    list: (boardId: string) => request<Task[]>(`/tasks?boardId=${boardId}`),
    create: (data: Partial<Task>) =>
      request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Task>) =>
      request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    reorder: (tasks: { id: string; position: number }[]) =>
      request<{ success: boolean }>('/tasks/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ tasks }),
      }),
    agenda: (workspaceId: string, start: string, end: string) =>
      request<Task[]>(`/tasks/agenda?workspaceId=${workspaceId}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`),
    remove: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
  }
}

export function useClientApi() {
  const { request } = useApiFetch()
  return {
    list: (workspaceId: string) => request<Client[]>(`/clients?workspaceId=${workspaceId}`),
    create: (data: Partial<Client>) =>
      request<Client>('/clients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Client>) =>
      request<Client>(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<void>(`/clients/${id}`, { method: 'DELETE' }),
  }
}

export function useInspirationApi() {
  const { request } = useApiFetch()
  return {
    list: (workspaceId: string) =>
      request<Inspiration[]>(`/inspirations?workspaceId=${workspaceId}`),
    create: (data: Partial<Inspiration>) =>
      request<Inspiration>('/inspirations', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id: string) => request<void>(`/inspirations/${id}`, { method: 'DELETE' }),
  }
}

export function useColumnApi() {
  const { request } = useApiFetch()
  return {
    create: (data: Partial<Column>) =>
      request<Column>('/columns', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Column>) =>
      request<Column>(`/columns/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<void>(`/columns/${id}`, { method: 'DELETE' }),
  }
}
