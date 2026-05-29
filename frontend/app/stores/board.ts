import { defineStore } from 'pinia'
import { useBoardApi, useColumnApi, useTaskApi } from '~/services/api'
import type { Board, Column, Task } from '~/types'

export const useBoardStore = defineStore('board', () => {
  const current = ref<Board | null>(null)
  const columns = ref<Column[]>([])
  const tasks = ref<Task[]>([])

  const tasksByColumn = computed(() => {
    const map: Record<string, Task[]> = {}
    for (const col of columns.value) {
      map[col.id] = tasks.value
        .filter((t) => t.columnId === col.id)
        .sort((a, b) => a.position - b.position)
    }
    return map
  })

  async function loadBoard(workspaceId: string, boardId: string) {
    const boardApi = useBoardApi()
    const taskApi = useTaskApi()
    const columnApi = useColumnApi()
    const [boards, boardTasks] = await Promise.all([
      boardApi.list(workspaceId),
      taskApi.list(boardId),
    ])
    current.value = boards.find((b) => b.id === boardId) ?? null
    columns.value = (current.value?.columns ?? []).sort((a, b) => a.position - b.position)
    tasks.value = boardTasks

    const defaultsByLayout: Record<string, string[]> = {
      KANBAN: ['A Fazer', 'Em Andamento', 'Em Revisão', 'Concluído'],
      TIMELINE: ['Planejamento', 'Em Execução', 'Concluído'],
    }

    const defaults = defaultsByLayout[current.value?.layoutType ?? '']
    if (defaults && columns.value.length === 0) {
      const results: any[] = []
      for (let i = 0; i < defaults.length; i++) {
        const col = await columnApi.create({ boardId, title: defaults[i], position: i })
        results.push(col)
      }
      columns.value = results
    }
  }

  async function createColumn(boardId: string, title: string) {
    const columnApi = useColumnApi()
    const position = columns.value.length
    const col = await columnApi.create({ boardId, title, position })
    columns.value.push(col)
    return col
  }

  async function updateColumn(id: string, data: Partial<Column>) {
    const columnApi = useColumnApi()
    const col = await columnApi.update(id, data)
    const idx = columns.value.findIndex((c) => c.id === id)
    if (idx !== -1) columns.value[idx] = { ...columns.value[idx]!, ...col }
    return col
  }

  async function removeColumn(id: string) {
    const columnApi = useColumnApi()
    await columnApi.remove(id)
    columns.value = columns.value.filter((c) => c.id !== id)
    tasks.value = tasks.value.filter((t) => t.columnId !== id)
  }

  async function createTask(data: Partial<Task>) {
    const taskApi = useTaskApi()
    const colTasks = tasks.value.filter((t) => t.columnId === data.columnId)
    const payload: Record<string, unknown> = {
      boardId: data.boardId,
      position: colTasks.length,
    }
    if (data.columnId) payload.columnId = data.columnId
    if (data.title) payload.title = data.title
    if (data.description) payload.description = data.description
    if (data.taskType) payload.taskType = data.taskType
    if (data.priority) payload.priority = data.priority
    if (data.startDate) payload.startDate = data.startDate
    if (data.deadline) payload.deadline = data.deadline
    if (data.estimatedTime) payload.estimatedTime = data.estimatedTime
    const task = await taskApi.create(payload as Partial<Task>)
    tasks.value.push(task)
    return task
  }

  async function updateTask(id: string, data: Partial<Task>) {
    const taskApi = useTaskApi()
    const { title, description, columnId, taskType, priority, startDate, deadline, estimatedTime, position } = data
    const payload: Record<string, unknown> = {}
    if (title !== undefined) payload.title = title
    if (description !== undefined) payload.description = description
    if (columnId !== undefined) payload.columnId = columnId
    if (taskType !== undefined) payload.taskType = taskType
    if (priority !== undefined) payload.priority = priority
    if (startDate !== undefined) payload.startDate = startDate
    if (deadline !== undefined) payload.deadline = deadline
    if (estimatedTime !== undefined) payload.estimatedTime = estimatedTime
    if (position !== undefined) payload.position = position
    const task = await taskApi.update(id, payload as Partial<Task>)
    const idx = tasks.value.findIndex((t) => t.id === id)
    if (idx !== -1) tasks.value[idx] = task
    return task
  }

  async function removeTask(id: string) {
    const taskApi = useTaskApi()
    await taskApi.remove(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  async function moveTask(taskId: string, targetColumnId: string, targetPosition: number) {
    const taskApi = useTaskApi()
    const task = tasks.value.find((t) => t.id === taskId)
    if (!task) return

    const oldColumnId = task.columnId
    task.columnId = targetColumnId
    task.position = targetPosition

    const reorderPayload: { id: string; position: number }[] = []

    if (oldColumnId !== targetColumnId) {
      tasks.value
        .filter((t) => t.columnId === oldColumnId && t.id !== taskId)
        .sort((a, b) => a.position - b.position)
        .forEach((t, i) => {
          t.position = i
          reorderPayload.push({ id: t.id, position: i })
        })
    }

    const targetTasks = tasks.value
      .filter((t) => t.columnId === targetColumnId)
      .sort((a, b) => a.position - b.position)

    targetTasks.forEach((t, i) => {
      t.position = i
      reorderPayload.push({ id: t.id, position: i })
    })

    await taskApi.reorder(reorderPayload)
    await taskApi.update(taskId, { columnId: targetColumnId })
  }

  function reset() {
    current.value = null
    columns.value = []
    tasks.value = []
  }

  return {
    current,
    columns,
    tasks,
    tasksByColumn,
    loadBoard,
    createColumn,
    updateColumn,
    removeColumn,
    createTask,
    updateTask,
    removeTask,
    moveTask,
    reset,
  }
})
