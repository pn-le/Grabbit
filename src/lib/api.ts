import { isDemoMode } from './supabase'
import { demoApi } from './api.demo'
import { supabaseApi } from './api.supabase'
import type { GrabbitApi } from './api.types'

export const api: GrabbitApi = isDemoMode ? demoApi : supabaseApi
export { isDemoMode }
export { PAGE_SIZE } from './api.types'
export type { DealPage, PostResult } from './api.types'
