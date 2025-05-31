/**
 * 约课小程序全局App实例
 */
import { mockApi } from './utils/mockApi.js'

App({
  /**
   * 全局数据
   */
  globalData: {
    userInfo: null,           // 用户信息
    userType: 'student',      // 用户身份类型：student-学员, coach-教练
    isLoggedIn: false,        // 登录状态
    unreadNotifications: 0,   // 未读通知数量
    currentUserId: null       // 当前用户ID
  },

  /**
   * 小程序启动时触发
   */
  onLaunch(options) {
    console.log('小程序启动', options)
    
    // 检查启动参数中的身份类型
    if (options.query && options.query.type) {
      this.globalData.userType = options.query.type === 'coach' ? 'coach' : 'student'
    }
    
    // 初始化用户状态
    this.initUser()
    
    // 初始化模拟API
    mockApi.init()
  },

  /**
   * 小程序显示时触发
   */
  onShow() {
    console.log('小程序显示')
    // 检查登录状态
    this.checkLoginStatus()
  },

  /**
   * 小程序隐藏时触发
   */
  onHide() {
    console.log('小程序隐藏')
  },

  /**
   * 初始化用户信息
   */
  initUser() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      const userType = wx.getStorageSync('userType')
      const isLoggedIn = wx.getStorageSync('isLoggedIn')
      
      if (userInfo && isLoggedIn) {
        this.globalData.userInfo = userInfo
        this.globalData.userType = userType || 'student'
        this.globalData.isLoggedIn = true
        this.globalData.currentUserId = userInfo.id
      }
    } catch (error) {
      console.error('初始化用户信息失败:', error)
    }
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    if (!this.globalData.isLoggedIn) {
      // 重定向到登录页面
      wx.reLaunch({
        url: '/pages/login/login'
      })
    }
  },

  /**
   * 用户登录
   * @param {Object} userInfo 用户信息
   * @param {String} userType 用户类型
   */
  login(userInfo, userType = 'student') {
    try {
      this.globalData.userInfo = userInfo
      this.globalData.userType = userType
      this.globalData.isLoggedIn = true
      this.globalData.currentUserId = userInfo.id
      
      // 保存到本地存储
      wx.setStorageSync('userInfo', userInfo)
      wx.setStorageSync('userType', userType)
      wx.setStorageSync('isLoggedIn', true)
      
      console.log('用户登录成功:', userInfo)
      return true
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  },

  /**
   * 用户退出登录
   */
  logout() {
    try {
      this.globalData.userInfo = null
      this.globalData.userType = 'student'
      this.globalData.isLoggedIn = false
      this.globalData.currentUserId = null
      this.globalData.unreadNotifications = 0
      
      // 清除本地存储
      wx.removeStorageSync('userInfo')
      wx.removeStorageSync('userType')
      wx.removeStorageSync('isLoggedIn')
      
      // 跳转到登录页面
      wx.reLaunch({
        url: '/pages/login/login'
      })
      
      console.log('用户退出登录')
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  },

  /**
   * 切换用户身份
   * @param {String} userType 用户类型
   */
  switchUserType(userType) {
    if (['student', 'coach'].includes(userType)) {
      this.globalData.userType = userType
      wx.setStorageSync('userType', userType)
      
      // 刷新当前页面
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      if (currentPage.onShow) {
        currentPage.onShow()
      }
      
      console.log('切换身份为:', userType)
    }
  },

  /**
   * 更新未读通知数量
   * @param {Number} count 未读数量
   */
  updateUnreadNotifications(count) {
    this.globalData.unreadNotifications = count
    
    // 更新tabBar徽标
    if (count > 0) {
      wx.setTabBarBadge({
        index: 1,
        text: count.toString()
      })
    } else {
      wx.removeTabBarBadge({
        index: 1
      })
    }
  }
}) 