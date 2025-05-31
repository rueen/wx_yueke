/**
 * 登录页面逻辑
 */
import { mockApi } from '../../utils/mockApi.js'
import { validatePhone, showError, showSuccess } from '../../utils/util.js'

const app = getApp()

Page({
  /**
   * 页面数据
   */
  data: {
    phone: '',           // 手机号
    userType: 'student', // 用户类型
    isLoading: false,    // 登录状态
    canLogin: false      // 是否可以登录
  },

  /**
   * 页面加载时触发
   */
  onLoad(options) {
    console.log('登录页面加载', options)
    
    // 检查启动参数中的身份类型
    if (options.type) {
      this.setData({
        userType: options.type === 'coach' ? 'coach' : 'student'
      })
    }
    
    // 如果已经登录，跳转到首页
    if (app.globalData.isLoggedIn) {
      this.redirectToIndex()
    }
  },

  /**
   * 手机号输入事件
   * @param {Object} e 事件对象
   */
  onPhoneInput(e) {
    const phone = e.detail.value
    this.setData({
      phone: phone,
      canLogin: this.validateForm(phone, this.data.userType)
    })
  },

  /**
   * 用户类型切换事件
   * @param {Object} e 事件对象
   */
  onUserTypeChange(e) {
    const userType = e.currentTarget.dataset.type
    this.setData({
      userType: userType,
      canLogin: this.validateForm(this.data.phone, userType)
    })
  },

  /**
   * 登录按钮点击事件
   */
  async onLogin() {
    if (!this.data.canLogin || this.data.isLoading) {
      return
    }

    // 验证表单
    if (!this.validateForm(this.data.phone, this.data.userType)) {
      return
    }

    this.setData({ isLoading: true })

    try {
      // 调用登录API
      const result = await mockApi.login(this.data.phone, this.data.userType)
      
      if (result.success) {
        // 登录成功，保存用户信息到全局状态
        const success = app.login(result.data, this.data.userType)
        
        if (success) {
          showSuccess('登录成功')
          // 延迟跳转，让用户看到成功提示
          setTimeout(() => {
            this.redirectToIndex()
          }, 1000)
        } else {
          showError('登录失败，请重试')
        }
      } else {
        showError(result.message || '登录失败')
      }
    } catch (error) {
      console.error('登录异常:', error)
      showError('网络异常，请检查网络连接')
    } finally {
      this.setData({ isLoading: false })
    }
  },

  /**
   * 验证表单数据
   * @param {String} phone 手机号
   * @param {String} userType 用户类型
   * @returns {Boolean} 是否有效
   */
  validateForm(phone, userType) {
    // 验证手机号
    if (!phone) {
      return false
    }
    
    if (!validatePhone(phone)) {
      if (phone.length === 11) {
        showError('请输入正确的手机号')
      }
      return false
    }
    
    // 验证用户类型
    if (!['student', 'coach'].includes(userType)) {
      return false
    }
    
    return true
  },

  /**
   * 跳转到首页
   */
  redirectToIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  /**
   * 页面显示时触发
   */
  onShow() {
    // 如果已经登录，跳转到首页
    if (app.globalData.isLoggedIn) {
      this.redirectToIndex()
    }
  },

  /**
   * 页面隐藏时触发
   */
  onHide() {
    // 清除loading状态
    this.setData({ isLoading: false })
  },

  /**
   * 页面卸载时触发
   */
  onUnload() {
    // 清除loading状态
    this.setData({ isLoading: false })
  }
}) 