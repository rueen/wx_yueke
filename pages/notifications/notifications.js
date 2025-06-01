/**
 * 通知页面逻辑
 */
import { mockApi } from '../../utils/mockApi.js'
import { formatTime, showError } from '../../utils/util.js'

Page({
  /**
   * 页面数据
   */
  data: {
    notifications: [],
    loading: true,
    refreshing: false,
    hasMore: true
  },

  /**
   * 页面加载时触发
   */
  onLoad() {
    wx.setNavigationBarTitle({
      title: '消息通知'
    })
    
    this.loadNotifications()
  },

  /**
   * 页面显示时触发
   */
  onShow() {
    // 每次显示时刷新通知
    this.loadNotifications()
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadNotifications(true)
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: '约课小程序 - 消息通知',
      path: '/pages/notifications/notifications'
    }
  },

  /**
   * 加载通知列表
   */
  async loadNotifications(isRefresh = false) {
    if (isRefresh) {
      this.setData({ refreshing: true })
    } else {
      this.setData({ loading: true })
    }

    try {
      const app = getApp()
      const userId = app.globalData.currentUserId
      
      const result = await mockApi.getNotifications(userId)

      if (result.success) {
        const notifications = result.data.map(item => this.formatNotification(item))
        
        this.setData({
          notifications: notifications
        })
      } else {
        showError(result.message || '加载通知失败')
      }
    } catch (error) {
      console.error('加载通知失败:', error)
      showError('网络异常，请重试')
    } finally {
      this.setData({
        loading: false,
        refreshing: false
      })
      
      if (isRefresh) {
        wx.stopPullDownRefresh()
      }
    }
  },

  /**
   * 格式化通知
   */
  formatNotification(notification) {
    return {
      ...notification,
      timeText: this.getTimeText(notification.createdAt),
      typeText: this.getTypeText(notification.type),
      typeIcon: this.getTypeIcon(notification.type)
    }
  },

  /**
   * 获取时间文本
   */
  getTimeText(createdAt) {
    const now = new Date()
    const time = new Date(createdAt)
    const diff = now - time
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) {
      return '刚刚'
    } else if (minutes < 60) {
      return `${minutes}分钟前`
    } else if (hours < 24) {
      return `${hours}小时前`
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return formatTime(time, 'MM-DD HH:mm')
    }
  },

  /**
   * 获取类型文本
   */
  getTypeText(type) {
    const typeMap = {
      'course_request': '约课请求',
      'course_confirmed': '约课确认',
      'course_rejected': '约课被拒',
      'course_cancelled': '课程取消',
      'course_reminder': '课程提醒',
      'student_invitation': '学员邀请',
      'system': '系统通知'
    }
    return typeMap[type] || '通知'
  },

  /**
   * 获取类型图标
   */
  getTypeIcon(type) {
    const iconMap = {
      'course_request': '📋',
      'course_confirmed': '✅',
      'course_rejected': '❌',
      'course_cancelled': '🚫',
      'course_reminder': '⏰',
      'student_invitation': '👥',
      'system': 'ℹ️'
    }
    return iconMap[type] || '📢'
  },

  /**
   * 点击通知
   */
  async onNotificationTap(e) {
    const notification = e.currentTarget.dataset.notification
    
    // 标记为已读
    if (!notification.isRead) {
      await this.markAsRead(notification.id)
    }

    // 根据通知类型进行跳转
    this.handleNotificationNavigation(notification)
  },

  /**
   * 标记为已读
   */
  async markAsRead(notificationId) {
    try {
      await mockApi.markNotificationAsRead(notificationId)
      
      // 更新本地数据
      const notifications = this.data.notifications.map(item => {
        if (item.id === notificationId) {
          return { ...item, isRead: true }
        }
        return item
      })
      
      this.setData({ notifications })
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  },

  /**
   * 处理通知导航
   */
  handleNotificationNavigation(notification) {
    const { type, relatedId } = notification

    switch (type) {
      case 'course_request':
        // 跳转到待处理请求页面
        wx.navigateTo({
          url: '/pages/pending-requests/pending-requests'
        })
        break
        
      case 'course_confirmed':
      case 'course_reminder':
        // 跳转到课程详情
        if (relatedId) {
          wx.navigateTo({
            url: `/pages/course-detail/course-detail?id=${relatedId}`
          })
        }
        break
        
      case 'student_invitation':
        // 跳转到待处理请求页面
        wx.navigateTo({
          url: '/pages/pending-requests/pending-requests'
        })
        break
        
      default:
        // 默认不跳转或显示详情
        wx.showToast({
          title: '已查看',
          icon: 'success'
        })
    }
  },

  /**
   * 全部标记为已读
   */
  async onMarkAllRead() {
    const unreadNotifications = this.data.notifications.filter(item => !item.isRead)
    
    if (unreadNotifications.length === 0) {
      wx.showToast({
        title: '没有未读消息',
        icon: 'none'
      })
      return
    }

    try {
      // 批量标记为已读
      await Promise.all(
        unreadNotifications.map(item => mockApi.markNotificationAsRead(item.id))
      )

      // 更新本地数据
      const notifications = this.data.notifications.map(item => ({
        ...item,
        isRead: true
      }))

      this.setData({ notifications })

      wx.showToast({
        title: '已全部标记已读',
        icon: 'success'
      })
    } catch (error) {
      console.error('批量标记已读失败:', error)
      showError('操作失败，请重试')
    }
  },

  /**
   * 清空所有通知
   */
  onClearAll() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有通知吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          // TODO: 实现清空通知API
          this.setData({
            notifications: []
          })
          
          wx.showToast({
            title: '已清空通知',
            icon: 'success'
          })
        }
      }
    })
  }
}) 