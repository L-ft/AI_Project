import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchRequirementGroups,
  deleteRequirementGroup,
  type RequirementGroupItem
} from '@/api/requirement-groups'

export const useRequirementGroupsStore = defineStore('requirementGroups', () => {
  const groups = ref<RequirementGroupItem[]>([])
  const loading = ref(false)
  let pollTimer: ReturnType<typeof setInterval> | null = null

  const hasGenerating = computed(() =>
    groups.value.some((g) => g.status === 'generating' || g.status === 'pending')
  )

  async function load() {
    loading.value = true
    try {
      groups.value = await fetchRequirementGroups()
    } finally {
      loading.value = false
    }
  }

  function startPollingWhenNeeded() {
    if (pollTimer) return
    pollTimer = setInterval(() => {
      if (hasGenerating.value) void load()
    }, 4000)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  async function remove(groupId: number) {
    await deleteRequirementGroup(groupId)
    await load()
  }

  return {
    groups,
    loading,
    hasGenerating,
    load,
    remove,
    startPollingWhenNeeded,
    stopPolling
  }
})
