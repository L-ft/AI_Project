import execRequest from './exec-request'

export type ScheduledTaskRow = {
  id: number
  code: string
  name: string
  scenario_code: string
  cron_expression: string
  timezone: string
  enabled: boolean
  description?: string | null
  last_run_at?: string | null
  next_run_at?: string | null
  last_run_status?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type ScheduledTaskRunRow = {
  id: number
  status: string
  message?: string | null
  report_code?: string | null
  started_at?: string | null
  finished_at?: string | null
}

export async function listScheduledTasks(scenarioCode?: string): Promise<ScheduledTaskRow[]> {
  const data = (await execRequest.get('/scheduled-tasks', {
    params: scenarioCode ? { scenario_code: scenarioCode } : undefined
  })) as ScheduledTaskRow[]
  return Array.isArray(data) ? data : []
}

export async function createScheduledTask(body: {
  name: string
  scenarioCode: string
  cronExpression: string
  timezone?: string
  enabled?: boolean
  description?: string | null
}): Promise<ScheduledTaskRow> {
  return (await execRequest.post('/scheduled-tasks', {
    name: body.name,
    scenarioCode: body.scenarioCode,
    cronExpression: body.cronExpression,
    timezone: body.timezone ?? 'Asia/Shanghai',
    enabled: body.enabled ?? true,
    description: body.description ?? undefined
  })) as ScheduledTaskRow
}

export async function updateScheduledTask(
  taskCode: string,
  body: Partial<{
    name: string
    scenarioCode: string
    cronExpression: string
    timezone: string
    enabled: boolean
    description: string | null
  }>
): Promise<ScheduledTaskRow> {
  return (await execRequest.patch(`/scheduled-tasks/${taskCode}`, body)) as ScheduledTaskRow
}

export async function deleteScheduledTask(taskCode: string): Promise<void> {
  await execRequest.delete(`/scheduled-tasks/${taskCode}`)
}

export async function triggerScheduledTask(taskCode: string): Promise<{
  task_code: string
  last_run_status?: string | null
  run?: { status: string; message?: string | null; report_code?: string | null; started_at?: string | null } | null
}> {
  return (await execRequest.post(`/scheduled-tasks/${taskCode}/trigger`)) as {
    task_code: string
    last_run_status?: string | null
    run?: { status: string; message?: string | null; report_code?: string | null; started_at?: string | null } | null
  }
}

export async function listTaskRuns(taskCode: string, limit = 50): Promise<ScheduledTaskRunRow[]> {
  const data = (await execRequest.get(`/scheduled-tasks/${taskCode}/runs`, {
    params: { limit }
  })) as ScheduledTaskRunRow[]
  return Array.isArray(data) ? data : []
}
