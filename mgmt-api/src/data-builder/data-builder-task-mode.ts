export type DataBuilderTaskMode = 'proxy' | 'shadow' | 'db_primary';

const DEFAULT_DATA_BUILDER_TASK_MODE: DataBuilderTaskMode = 'db_primary';
// `proxy` and `shadow` are rollback/compatibility modes. `db_primary` is the steady-state path.
const LEGACY_TASK_MODES: ReadonlySet<DataBuilderTaskMode> = new Set(['proxy', 'shadow']);

export function getDataBuilderTaskMode(): DataBuilderTaskMode {
  const raw = String(process.env.DATA_BUILDER_TASK_MODE || DEFAULT_DATA_BUILDER_TASK_MODE)
    .trim()
    .toLowerCase();
  if (raw === 'shadow') return 'shadow';
  if (raw === 'db_primary') return 'db_primary';
  return 'proxy';
}

export function isDataBuilderShadowEnabled(): boolean {
  return getDataBuilderTaskMode() === 'shadow';
}

export function isDataBuilderDbPrimaryEnabled(): boolean {
  return getDataBuilderTaskMode() === 'db_primary';
}

export function isDataBuilderLegacyFallbackMode(): boolean {
  return LEGACY_TASK_MODES.has(getDataBuilderTaskMode());
}

export function isDataBuilderPersistenceEnabled(): boolean {
  return isDataBuilderShadowEnabled() || isDataBuilderDbPrimaryEnabled();
}

export function shouldDataBuilderShadowReadThrough(): boolean {
  const raw = String(process.env.DATA_BUILDER_SHADOW_READ_THROUGH || 'true')
    .trim()
    .toLowerCase();
  return !['0', 'false', 'no', 'off'].includes(raw);
}
