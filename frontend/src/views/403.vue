<template>
  <div class="error-page">
    <n-result
      status="403"
      title="403 禁止访问"
      description="抱歉，您的神经链路权限等级不足，无法进入此区域。"
    >
      <template #footer>
        <n-button type="primary" @click="$router.push('/login')">返回登录</n-button>
      </template>
    </n-result>
  </div>
</template>

<script setup lang="ts">
import { NResult, NButton } from 'naive-ui'
</script>

<style scoped>
.error-page { height: 100vh; display: flex; align-items: center; justify-content: center; background: #05080F; }
</style>
