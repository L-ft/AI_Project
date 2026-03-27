import { createI18n } from 'vue-i18n'

const messages = {
  zh: {
    sidebar: {
      expand: '展开侧边栏',
      collapse: '折叠侧边栏',
      testScenarios: '测试场景',
      scheduledTasks: '定时任务',
      testReports: '测试报告',
      interfaceTest: '单接口测试',
      interfaceDirectory: '接口目录',
      favorites: '收藏',
      beta: 'Beta'
    }
  },
  en: {
    sidebar: {
      expand: 'Expand Sidebar',
      collapse: 'Collapse Sidebar',
      testScenarios: 'Test Scenarios',
      scheduledTasks: 'Scheduled Tasks',
      testReports: 'Test Reports',
      interfaceTest: 'Interface Test',
      interfaceDirectory: 'API Directory',
      favorites: 'Favorites',
      beta: 'Beta'
    }
  }
}

export default createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages
})