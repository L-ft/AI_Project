import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    uid: localStorage.getItem('uid') ? Number(localStorage.getItem('uid')) : null,
    username: localStorage.getItem('username') || '',
    phone: localStorage.getItem('phone') || '',
    role: localStorage.getItem('role') || '',
    token: localStorage.getItem('token') || ''
  }),
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    setUserInfo(info: { uid: number, username: string, phone: string, role: string, token: string }) {
      this.uid = info.uid
      this.username = info.username
      this.phone = info.phone
      this.role = info.role
      this.token = info.token
      localStorage.setItem('token', info.token)
      localStorage.setItem('role', info.role)
      localStorage.setItem('username', info.username)
      localStorage.setItem('phone', info.phone)
      localStorage.setItem('uid', String(info.uid))
    },
    logout() {
      this.uid = null
      this.username = ''
      this.phone = ''
      this.role = ''
      this.token = ''
      localStorage.clear()
    }
  }
})
