export type WorkspaceType = 'CREATIVE_ROUTINE' | 'CLIENT_PROJECT' | 'FULL_MANAGEMENT' | 'CUSTOM'
export type WorkspaceStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
export type LayoutType = 'KANBAN' | 'CALENDAR' | 'TIMELINE' | 'DASHBOARD'
export type TaskType = 'FOCUS' | 'INSPIRATION' | 'EXECUTION' | 'REVISION' | 'MEETING' | 'CLIENT'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
}

export interface Workspace {
  id: string
  userId: string
  name: string
  description?: string
  workspaceType: WorkspaceType
  status: WorkspaceStatus
  createdAt: string
  updatedAt: string
  boards?: Board[]
  clients?: Client[]
}

export interface Board {
  id: string
  workspaceId: string
  title: string
  layoutType: LayoutType
  position: number
  createdAt: string
  columns?: Column[]
  tasks?: Task[]
}

export interface Column {
  id: string
  boardId: string
  title: string
  position: number
  createdAt: string
  tasks?: Task[]
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface TaskTag {
  taskId: string
  tagId: string
  tag: Tag
}

export interface Task {
  id: string
  boardId: string
  columnId?: string
  title: string
  description?: string
  taskType: TaskType
  priority: Priority
  startDate?: string
  deadline?: string
  position: number
  estimatedTime?: number
  createdAt: string
  updatedAt: string
  tags: TaskTag[]
}

export interface Client {
  id: string
  workspaceId: string
  name: string
  email: string
  phone?: string
  company?: string
  notes?: string
  createdAt: string
}

export interface Inspiration {
  id: string
  workspaceId: string
  title: string
  imageUrl: string
  sourceUrl?: string
  category?: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}
