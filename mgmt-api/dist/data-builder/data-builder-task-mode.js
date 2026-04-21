"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataBuilderTaskMode = getDataBuilderTaskMode;
exports.isDataBuilderShadowEnabled = isDataBuilderShadowEnabled;
exports.isDataBuilderDbPrimaryEnabled = isDataBuilderDbPrimaryEnabled;
exports.isDataBuilderLegacyFallbackMode = isDataBuilderLegacyFallbackMode;
exports.isDataBuilderPersistenceEnabled = isDataBuilderPersistenceEnabled;
exports.shouldDataBuilderShadowReadThrough = shouldDataBuilderShadowReadThrough;
const DEFAULT_DATA_BUILDER_TASK_MODE = 'db_primary';
const LEGACY_TASK_MODES = new Set(['proxy', 'shadow']);
function getDataBuilderTaskMode() {
    const raw = String(process.env.DATA_BUILDER_TASK_MODE || DEFAULT_DATA_BUILDER_TASK_MODE)
        .trim()
        .toLowerCase();
    if (raw === 'shadow')
        return 'shadow';
    if (raw === 'db_primary')
        return 'db_primary';
    return 'proxy';
}
function isDataBuilderShadowEnabled() {
    return getDataBuilderTaskMode() === 'shadow';
}
function isDataBuilderDbPrimaryEnabled() {
    return getDataBuilderTaskMode() === 'db_primary';
}
function isDataBuilderLegacyFallbackMode() {
    return LEGACY_TASK_MODES.has(getDataBuilderTaskMode());
}
function isDataBuilderPersistenceEnabled() {
    return isDataBuilderShadowEnabled() || isDataBuilderDbPrimaryEnabled();
}
function shouldDataBuilderShadowReadThrough() {
    const raw = String(process.env.DATA_BUILDER_SHADOW_READ_THROUGH || 'true')
        .trim()
        .toLowerCase();
    return !['0', 'false', 'no', 'off'].includes(raw);
}
//# sourceMappingURL=data-builder-task-mode.js.map