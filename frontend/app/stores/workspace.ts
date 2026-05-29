import { defineStore } from 'pinia'
import { useBoardApi, useWorkspaceApi } from '~/services/api'
import type { Board, Task, Workspace } from '~/types'

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = ref<Workspace[]>([])
  const current = ref<Workspace | null>(null)
  const boards = ref<Board[]>([])
  const tasks = ref<Task[]>([])

  async function loadWorkspaces() {
    const workspaceApi = useWorkspaceApi()
    workspaces.value = await workspaceApi.list()
  }

  async function loadWorkspace(id: string) {
    const workspaceApi = useWorkspaceApi()
    current.value = await workspaceApi.get(id)
    boards.value = current.value.boards ?? []
  }

  async function createWorkspace(data: Partial<Workspace>) {
    const workspaceApi = useWorkspaceApi()
    const ws = await workspaceApi.create(data)
    workspaces.value.unshift(ws)
    return ws
  }

  async function updateWorkspace(id: string, data: Partial<Workspace>) {
    const workspaceApi = useWorkspaceApi()
    const ws = await workspaceApi.update(id, data)
    const idx = workspaces.value.findIndex((w) => w.id === id)
    if (idx !== -1) workspaces.value[idx] = ws
    if (current.value?.id === id) current.value = ws
    return ws
  }

  async function removeWorkspace(id: string) {
    const workspaceApi = useWorkspaceApi()
    await workspaceApi.remove(id)
    workspaces.value = workspaces.value.filter((w) => w.id !== id)
    if (current.value?.id === id) current.value = null
  }

  async function createBoard(data: Partial<Board>) {
    const boardApi = useBoardApi()
    const board = await boardApi.create(data)
    boards.value.push(board)
    return board
  }

  async function updateBoard(id: string, data: Partial<Board>) {
    const boardApi = useBoardApi()
    const board = await boardApi.update(id, data)
    const idx = boards.value.findIndex((b) => b.id === id)
    if (idx !== -1) boards.value[idx] = board
    return board
  }

  async function removeBoard(id: string) {
    const boardApi = useBoardApi()
    await boardApi.remove(id)
    boards.value = boards.value.filter((b) => b.id !== id)
  }

  return {
    workspaces,
    current,
    boards,
    tasks,
    loadWorkspaces,
    loadWorkspace,
    createWorkspace,
    updateWorkspace,
    removeWorkspace,
    createBoard,
    updateBoard,
    removeBoard,
  }
})
