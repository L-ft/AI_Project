import { GlobalThemeOverrides } from 'naive-ui'

/**
 * Naive UI 主题覆盖
 * 所有颜色值与 design-tokens.css 保持同步：
 *   primary → #7D33FF（品牌主色·紫）
 *   文字、边框、背景全部对齐灰阶规范
 */
export const aiSenseTheme: GlobalThemeOverrides = {
  common: {
    /* 主色 */
    primaryColor:        '#7d33ff',
    primaryColorHover:   '#6a28e8',
    primaryColorPressed: '#5521c2',
    primaryColorSuppl:   '#a855f7',

    /* 背景 */
    bodyColor:    '#f8f9fc',
    cardColor:    '#ffffff',
    modalColor:   '#ffffff',
    popoverColor: '#ffffff',

    /* 文字 */
    textColor1: '#1a1f36',
    textColor2: '#4f5b76',
    textColor3: '#8792a2',

    /* 边框 */
    borderColor: '#e4e8f0',

    /* 圆角（与 --radius-md 对齐） */
    borderRadius: '8px',

    /* 字体 */
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Roboto, sans-serif',
    fontSize: '14px',
    fontSizeMini: '11px',
    fontSizeSmall: '12px',
    fontSizeMedium: '14px',
    fontSizeLarge: '16px',
    fontSizeHuge: '18px',
  },

  /* 卡片 */
  Card: {
    borderRadius: '12px',
    borderColor:  '#e4e8f0',
    titleFontSizeSmall:  '14px',
    titleFontSizeMedium: '16px',
    titleFontSizeLarge:  '18px',
    titleTextColor: '#1a1f36',
  },

  /* 布局 */
  Layout: {
    siderColor:  '#ffffff',
    headerColor: '#ffffff',
    color:       '#f8f9fc',
  },

  /* 导航菜单 */
  Menu: {
    borderRadius:          '8px',
    itemTextColor:         '#4f5b76',
    itemIconColor:         '#4f5b76',
    itemTextColorHover:    '#7d33ff',
    itemIconColorHover:    '#7d33ff',
    itemTextColorActive:   '#7d33ff',
    itemIconColorActive:   '#7d33ff',
    itemColorActive:       'rgba(125, 51, 255, 0.08)',
    itemColorActiveHover:  'rgba(125, 51, 255, 0.12)',
  },

  /* 按钮 */
  Button: {
    borderRadiusMedium: '8px',
    borderRadiusSmall:  '6px',
    borderRadiusLarge:  '10px',
  },

  /* 输入框 */
  Input: {
    borderRadius: '8px',
    borderColor:  '#e4e8f0',
    borderHover:  '#7d33ff',
    borderFocus:  '#7d33ff',
  },

  /* 选择器 */
  Select: {
    peers: {
      InternalSelection: {
        borderRadius: '8px',
      }
    }
  },

  /* 标签 */
  Tag: {
    borderRadius: '4px',
  },

  /* 数据表格 */
  DataTable: {
    borderRadius: '8px',
    thColor: '#f8f9fc',
    thTextColor: '#4f5b76',
    tdColor: '#ffffff',
    borderColor: '#e4e8f0',
  },

  /* 模态框 */
  Modal: {
    borderRadius: '12px',
  },

  /* 警告框 */
  Alert: {
    borderRadius: '8px',
  },

  /* Tabs */
  Tabs: {
    colorSegment: '#f0f2f7',
    tabBorderRadius: '6px',
  },
}

/** 玻璃拟态（轻量版，仅用于 Dashboard 卡片） */
export const glassStyle = {
  backdropFilter: 'blur(8px)',
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  border: '1px solid rgba(228, 232, 240, 0.8)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
}
