<template>
  <div class="step-list-scroll-area">
    <div v-if="bulkSelectedCount > 0" class="step-bulk-selection-bar" role="toolbar" aria-label="批量操作">
      <span class="step-bulk-selection-bar__text">已选 <strong>{{ bulkSelectedCount }}</strong> 项</span>
      <div class="step-bulk-selection-bar__actions">
        <button type="button" class="step-bulk-selection-bar__btn" @click="$emit('clear-bulk')">取消选择</button>
        <button type="button" class="step-bulk-selection-bar__btn step-bulk-selection-bar__btn--danger" @click="$emit('remove-checked')">
          删除所选
        </button>
      </div>
    </div>
    <n-scrollbar class="step-list-scrollbar">
      <div v-if="items.length === 0" class="step-list-zero">无匹配步骤，请调整筛选或搜索</div>
      <div
        v-for="item in items"
        v-else
        :key="item.listKey"
        :class="[
          'step-list-item',
          {
            active: selectedStepIndex === item.idx,
            'drag-over': dragOverIndex === item.idx,
            dragging: dragFromIndex === item.idx,
            'step-list-item--passed': item.statusClass === 'passed'
          }
        ]"
        draggable="true"
        @click="$emit('select', item.idx)"
        @dragstart.stop="$emit('drag-start', item.idx)"
        @dragover.prevent.stop="$emit('drag-over', $event, item.idx)"
        @dragleave.stop="$emit('drag-leave', $event)"
        @drop.prevent.stop="$emit('drop', item.idx)"
        @dragend.stop="$emit('drag-end')"
      >
        <span class="step-drag-handle" title="拖动调整顺序" @mousedown.stop>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="5" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="15" cy="5" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="9" cy="19" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="15" cy="19" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <n-checkbox
          :checked="bulkCheckedIndices.includes(item.idx)"
          @click.stop
          @update:checked="(v: boolean) => $emit('toggle-bulk', item.idx, v)"
        />
        <div class="step-li-order">#{{ item.idx + 1 }}</div>
        <span class="step-li-method" :style="getMethodBadgeStyle(item.method)">{{ item.method }}</span>
        <div class="step-li-main">
          <div class="step-li-topline">
            <div class="step-li-name">{{ item.stepName }}</div>
            <span :class="['step-li-status', item.statusClass]">{{ item.statusText }}</span>
          </div>
          <div v-if="item.metaLine" :class="item.metaClass">{{ item.metaLine }}</div>
          <div class="step-li-submeta">
            <span>{{ item.lastCode }}</span>
            <span>{{ item.lastElapsed }}</span>
            <span>{{ item.lastRunAt }}</span>
          </div>
          <div v-if="item.failureSummary" class="step-li-failure-summary" :title="item.failureSummary">
            {{ item.failureSummary }}
          </div>
        </div>
      </div>
    </n-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { NCheckbox, NScrollbar } from 'naive-ui'
import { getMethodBadgeStyle } from '@/utils/scenario-step-list'
import type { ScenarioStepListItem } from '@/utils/scenario-step-list'

defineProps<{
  items: ScenarioStepListItem[]
  selectedStepIndex: number | null
  bulkCheckedIndices: number[]
  dragOverIndex: number | null
  dragFromIndex: number | null
  bulkSelectedCount: number
}>()

defineEmits<{
  (e: 'select', idx: number): void
  (e: 'toggle-bulk', idx: number, checked: boolean): void
  (e: 'drag-start', idx: number): void
  (e: 'drag-over', ev: DragEvent, idx: number): void
  (e: 'drag-leave', ev: DragEvent): void
  (e: 'drop', idx: number): void
  (e: 'drag-end'): void
  (e: 'clear-bulk'): void
  (e: 'remove-checked'): void
}>()
</script>

<style scoped>
.step-list-scroll-area {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  grid-column: 1 / -1;
  grid-row: 5;
  align-self: stretch;
  overflow: hidden;
}

.step-bulk-selection-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  margin: 0 8px 6px;
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.28);
  background: linear-gradient(135deg, rgba(238, 242, 255, 0.95), rgba(250, 245, 255, 0.9));
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
}

.step-bulk-selection-bar__text {
  font-size: 12px;
  color: #475569;
}

.step-bulk-selection-bar__text strong {
  color: #4338ca;
  font-weight: 700;
}

.step-bulk-selection-bar__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.step-bulk-selection-bar__btn {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.step-bulk-selection-bar__btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.step-bulk-selection-bar__btn--danger {
  color: #b91c1c;
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(254, 242, 242, 0.9);
}

.step-bulk-selection-bar__btn--danger:hover {
  background: rgba(254, 226, 226, 0.95);
  border-color: rgba(239, 68, 68, 0.5);
}

.step-list-scrollbar {
  flex: 1;
  min-height: 0;
  height: auto;
  padding-bottom: 8px;
  overflow: hidden;
}

.step-li-failure-summary {
  margin-top: 6px;
  font-size: 11px;
  line-height: 1.4;
  color: #b91c1c;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
