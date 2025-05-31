/**
 * 我的页面逻辑
 */
import { showConfirm, showSuccess } from '../../utils/util.js'

const app = getApp()

Page({
  /**
   * 页面数据
   */
  data: {
    userInfo: null,        // 用户信息
    userType: 'student',   // 用户类型
    pendingCount: 0,       // 待处理请求数量
    unreadCount: 0         // 未读通知数量
  },

  /**
   * 页面加载时触发
   */
  onLoad() {
    console.log('我的页面加载')
    this.initPage()
  },

  /**
   * 页面显示时触发
   */
  onShow() {
    console.log('我的页面显示')
    // 检查登录状态
    if (!app.globalData.isLoggedIn) {
      wx.reLaunch({
        url: '/pages/login/login'
      })
      return
    }
    
    this.refreshData()
  },

  /**
   * 初始化页面
   */
  initPage() {
    // 设置用户信息
    this.setData({
      userInfo: app.globalData.userInfo,
      userType: app.globalData.userType
    })
  },

  /**
   * 刷新数据
   */
  refreshData() {
    // 更新用户信息
    this.setData({
      userInfo: app.globalData.userInfo,
      userType: app.globalData.userType,
      unreadCount: app.globalData.unreadNotifications
    })
    
    // 加载待处理请求数量
    this.loadPendingCount()
  },

  /**
   * 加载待处理请求数量
   */
  async loadPendingCount() {
    // TODO: 实现获取待处理请求数量的API
    this.setData({
      pendingCount: 0
    })
  },

  /**
   * 切换用户身份
   * @param {Object} e 事件对象
   */
  onSwitchUserType(e) {
    const userType = e.currentTarget.dataset.type
    if (userType === this.data.userType) {
      return
    }
    
    // 切换身份
    app.switchUserType(userType)
    
    this.setData({
      userType: userType
    })
    
    showSuccess(`已切换为${userType === 'coach' ? '教练' : '学员'}身份`)
  },

  /**
   * 查看相关用户（我的学员/教练）
   */
  onViewRelated() {
    const userType = this.data.userType
    if (userType === 'coach') {
      wx.navigateTo({
        url: '/pages/my-students/my-students'
      })
    } else {
      wx.navigateTo({
        url: '/pages/my-coaches/my-coaches'
      })
    }
  },

  /**
   * 添加学员
   */
  onAddStudent() {
    wx.navigateTo({
      url: '/pages/add-student/add-student'
    })
  },

  /**
   * 发起约课
   */
  onBookCourse() {
    wx.navigateTo({
      url: '/pages/book-course/book-course'
    })
  },

  /**
   * 查看课表
   */
  onViewSchedule() {
    wx.navigateTo({
      url: '/pages/schedule/schedule'
    })
  },

  /**
   * 查看待处理请求
   */
  onViewRequests() {
    wx.navigateTo({
      url: '/pages/pending-requests/pending-requests'
    })
  },

  /**
   * 编辑个人资料
   */
  onEditProfile() {
    wx.navigateTo({
      url: '/pages/profile-edit/profile-edit'
    })
  },

  /**
   * 查看通知中心
   */
  onViewNotifications() {
    wx.navigateTo({
      url: '/pages/notifications/notifications'
    })
  },

  /**
   * 打开设置
   */
  onSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  /**
   * 退出登录
   */
  async onLogout() {
    const confirmed = await showConfirm('确定要退出登录吗？', '退出登录')
    if (confirmed) {
      app.logout()
    }
  },

  /**
   * 页面分享
   */
  onShareAppMessage() {
    const userType = this.data.userType
    return {
      title: '约课 - 便捷的教练学员约课工具',
      path: `/pages/login/login?type=${userType}`,
      imageUrl: '/images/share-cover.png'
    }
  }
}) 