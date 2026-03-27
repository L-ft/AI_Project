<template>
  <div class="placeholder-page">
    <n-result status="info" title="接口管理" description="该模块正在神经元连接中，敬请期待。">
      <template #footer>
        <n-button @click="$router.push('/dashboard')">返回仪表盘</n-button>
      </template>
    </n-result>
  </div>
</template>

<script setup lang="ts">
import { NResult, NButton } from 'naive-ui'
</script>

<style scoped>
.placeholder-page { padding: 40px; display: flex; align-items: center; justify-content: center; min-height: 60vh; }
</style>
