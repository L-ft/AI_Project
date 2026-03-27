import { createDiscreteApi } from 'naive-ui'
import { aiSenseTheme } from '../theme/theme'

const { message, notification, dialog, loadingBar } = createDiscreteApi(
  ['message', 'notification', 'dialog', 'loadingBar'],
  {
    configProviderProps: {
      themeOverrides: aiSenseTheme
    }
  }
)

export { message, notification, dialog, loadingBar }
