<template>
  <div class="login-page">
    <div class="ai-bg-glow"></div>
    
    <n-card class="login-card" :bordered="false">
      <div class="login-header">
        <div class="ai-sphere">
          <div class="inner-pulse"></div>
        </div>
        <h2 class="title">AI 自动化平台</h2>
        <p class="subtitle">{{ isLogin ? '智能接口自动化专家系统' : '创建您的智能自动化账户' }}</p>
      </div>
      
      <n-tabs v-model:value="authMode" justify-content="space-evenly" type="line" @update:value="isLogin = (authMode === 'login')">
        <n-tab name="login">登录</n-tab>
        <n-tab name="register">注册</n-tab>
      </n-tabs>

      <n-form :model="authForm" :rules="rules" size="large" style="margin-top: 20px">
        <n-form-item v-if="!isLogin" path="username" :show-label="false">
          <n-input v-model:value="authForm.username" placeholder="用户昵称">
            <template #prefix><n-icon :component="UserOutlined" /></template>
          </n-input>
        </n-form-item>

        <n-form-item path="phone" :show-label="false">
          <n-input v-model:value="authForm.phone" placeholder="手机号码">
            <template #prefix><n-icon :component="MobileOutlined" /></template>
          </n-input>
        </n-form-item>
        
        <n-form-item path="password" :show-label="false">
          <n-input
            v-model:value="authForm.password"
            type="password"
            show-password-on="mousedown"
            placeholder="登录密码"
          >
            <template #prefix><n-icon :component="LockOutlined" /></template>
          </n-input>
        </n-form-item>
        
        <div style="margin-top: 10px">
          <n-button 
            type="primary" 
            block 
            round
            @click="handleAuth" 
            class="login-btn"
          >
            {{ isLogin ? '立即登录' : '完成注册' }}
          </n-button>
        </div>
      </n-form>
      
      <div class="footer-links">
        <span @click="isLogin = !isLogin">{{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}</span>
        <span class="dot">·</span>
        <span>找回密码</span>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NCard, NForm, NFormItem, NInput, NButton, NIcon, NTabs, NTab 
} from 'naive-ui'
import { MobileOutlined, LockOutlined, UserOutlined } from '@vicons/antd'
import { message } from '../utils/naive-api'
import request from '../api/request'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()
const isLogin = ref(true)
const authMode = ref('login')
const authForm = ref({ phone: '', password: '', username: '' })

const rules = {
  phone: { required: true, message: '请输入手机号码', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' },
  username: { required: true, message: '请输入昵称', trigger: 'blur' }
}

const handleAuth = async () => {
  try {
    if (isLogin.value) {
      // 调用登录接口
      const res: any = await request.post('/auth/login', {
        phone: authForm.value.phone,
        password: authForm.value.password
      })
      if (res.access_token) {
        // 更新 Pinia Store
        userStore.setUserInfo({
          uid: res.user.uid,
          username: res.user.username,
          phone: res.user.phone, // 后端统一返回 phone 字段名
          role: res.user.role,
          token: res.access_token
        })
        message.success('登录成功，欢迎回来')
        router.push('/dashboard')
      }
    } else {
      // 调用注册接口
      await request.post('/auth/register', {
        phone: authForm.value.phone,
        password: authForm.value.password,
        username: authForm.value.username
      })
      message.success('注册成功，请登录')
      isLogin.value = true
      authMode.value = 'login'
    }
  } catch (error) {
    // 错误已由拦截器处理
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e6f0ff;
  overflow: hidden;
  position: relative;
}

.ai-bg-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 10% 10%, rgba(0, 209, 255, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 90% 90%, rgba(0, 122, 255, 0.15) 0%, transparent 50%);
  z-index: 1;
}

.login-card {
  width: 400px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 28px;
  box-shadow: 0 30px 60px rgba(0, 100, 255, 0.1);
  z-index: 10;
  padding: 10px;
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.ai-sphere {
  width: 50px;
  height: 50px;
  background: #0077ff;
  margin: 0 auto 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 119, 255, 0.4);
}

.inner-pulse {
  width: 60%;
  height: 60%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 0.3; }
  100% { transform: scale(0.8); opacity: 0.8; }
}

.title {
  color: #1a1f36;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 3px;
  margin: 0;
}

.subtitle {
  color: #4f5b76;
  font-size: 13px;
  margin-top: 5px;
}

.login-btn {
  height: 48px;
  font-weight: 700;
  letter-spacing: 1px;
  background: #0077ff;
}

.footer-links {
  display: flex;
  justify-content: center;
  margin-top: 25px;
  font-size: 12px;
  color: #a3acb9;
  cursor: pointer;
}

.dot { margin: 0 8px; }

:deep(.n-input) {
  background-color: #f5f8ff !important;
  border-radius: 12px;
}
</style>
