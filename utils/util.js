/**
 * 通用工具函数
 */

/**
 * 格式化时间
 * @param {Date|String} date 日期对象或字符串
 * @param {String} format 格式化模板
 * @returns {String} 格式化后的时间字符串
 */
export function formatTime(date, format = 'YYYY-MM-DD HH:mm') {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 获取相对时间描述
 * @param {Date|String} date 日期
 * @returns {String} 相对时间描述
 */
export function getRelativeTime(date) {
  if (!date) return ''
  
  const now = new Date()
  const target = new Date(date)
  const diffMs = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '明天'
  } else if (diffDays === -1) {
    return '昨天'
  } else if (diffDays > 1 && diffDays <= 7) {
    return `${diffDays}天后`
  } else if (diffDays < -1 && diffDays >= -7) {
    return `${Math.abs(diffDays)}天前`
  } else {
    return formatTime(date, 'MM-DD')
  }
}

/**
 * 获取星期几
 * @param {Date|String} date 日期
 * @returns {String} 星期几
 */
export function getWeekday(date) {
  if (!date) return ''
  
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const d = new Date(date)
  return weekdays[d.getDay()]
}

/**
 * 验证手机号
 * @param {String} phone 手机号
 * @returns {Boolean} 是否有效
 */
export function validatePhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证微信号
 * @param {String} wechat 微信号
 * @returns {Boolean} 是否有效
 */
export function validateWechat(wechat) {
  const wechatRegex = /^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/
  return wechatRegex.test(wechat)
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {Number} delay 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay = 300) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {Number} interval 间隔时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, interval = 300) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      func.apply(this, args)
    }
  }
}

/**
 * 深拷贝对象
 * @param {*} obj 要拷贝的对象
 * @returns {*} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 生成唯一ID
 * @returns {String} 唯一ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 获取课程状态文本
 * @param {String} status 状态码
 * @returns {String} 状态文本
 */
export function getCourseStatusText(status) {
  const statusMap = {
    'pending': '待确认',
    'confirmed': '已确认',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || '未知状态'
}

/**
 * 获取课程状态样式类
 * @param {String} status 状态码
 * @returns {String} 样式类名
 */
export function getCourseStatusClass(status) {
  const classMap = {
    'pending': 'status-pending',
    'confirmed': 'status-confirmed',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled'
  }
  return classMap[status] || ''
}

/**
 * 显示成功提示
 * @param {String} title 提示内容
 * @param {Number} duration 显示时长
 */
export function showSuccess(title, duration = 2000) {
  wx.showToast({
    title,
    icon: 'success',
    duration
  })
}

/**
 * 显示错误提示
 * @param {String} title 提示内容
 * @param {Number} duration 显示时长
 */
export function showError(title, duration = 2000) {
  wx.showToast({
    title,
    icon: 'error',
    duration
  })
}

/**
 * 显示加载提示
 * @param {String} title 提示内容
 */
export function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  })
}

/**
 * 隐藏加载提示
 */
export function hideLoading() {
  wx.hideLoading()
}

/**
 * 显示确认对话框
 * @param {String} content 对话框内容
 * @param {String} title 对话框标题
 * @returns {Promise<Boolean>} 用户是否确认
 */
export function showConfirm(content, title = '确认') {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm)
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 检查网络状态
 * @returns {Promise<Boolean>} 网络是否可用
 */
export function checkNetwork() {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: (res) => {
        resolve(res.networkType !== 'none')
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 选择图片
 * @param {Number} count 最多选择的图片数量
 * @returns {Promise<Array>} 图片路径数组
 */
export function chooseImage(count = 1) {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFilePaths)
      },
      fail: reject
    })
  })
}

/**
 * 预览图片
 * @param {Array} urls 图片URL数组
 * @param {Number} current 当前显示图片的索引
 */
export function previewImage(urls, current = 0) {
  wx.previewImage({
    urls,
    current: urls[current]
  })
}

/**
 * 拨打电话
 * @param {String} phoneNumber 电话号码
 */
export function makePhoneCall(phoneNumber) {
  wx.makePhoneCall({
    phoneNumber
  })
}

/**
 * 复制到剪贴板
 * @param {String} data 要复制的文本
 * @returns {Promise<Boolean>} 是否成功
 */
export function setClipboardData(data) {
  return new Promise((resolve) => {
    wx.setClipboardData({
      data,
      success: () => {
        showSuccess('已复制到剪贴板')
        resolve(true)
      },
      fail: () => {
        showError('复制失败')
        resolve(false)
      }
    })
  })
} 