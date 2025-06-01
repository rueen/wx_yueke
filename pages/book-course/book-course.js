/**
 * 发起约课页面逻辑
 */
import { mockApi } from '../../utils/mockApi.js'
import { formatTime, showError, showSuccess, showConfirm } from '../../utils/util.js'

Page({
  /**
   * 页面数据
   */
  data: {
    userType: 'student',      // 当前用户类型
    targetType: 'coach',      // 目标类型（学员约教练，教练约学员）
    availableUsers: [],       // 可约用户列表
    selectedUserId: '',       // 选中的用户ID
    selectedUser: null,       // 选中的用户信息
    
    // 时间选择相关
    selectedDate: '',         // 选择的日期
    selectedTime: '',         // 选择的时间
    availableTimes: [],       // 可选时间段
    
    // 约课信息
    location: '',             // 上课地点
    remark: '',               // 备注
    duration: 60,             // 课程时长（分钟）
    
    // 状态
    isSubmitting: false,      // 提交状态
    loading: true,            // 加载状态
    
    // 页面参数
    fromUserDetail: false     // 是否从用户详情页进入
  },

  /**
   * 页面加载时触发
   */
  onLoad(options) {
    console.log('约课页面参数:', options)
    
    const app = getApp()
    const userType = app.globalData.userType
    
    // 处理页面参数
    let selectedUserId = ''
    let targetType = userType === 'coach' ? 'student' : 'coach'
    
    if (options.studentId) {
      selectedUserId = options.studentId
      targetType = 'student'
    } else if (options.coachId) {
      selectedUserId = options.coachId
      targetType = 'coach'
    }
    
    this.setData({
      userType: userType,
      targetType: targetType,
      selectedUserId: selectedUserId,
      fromUserDetail: !!selectedUserId
    })
    
    wx.setNavigationBarTitle({
      title: targetType === 'coach' ? '约教练' : '约学员'
    })
    
    this.initPage()
  },

  /**
   * 初始化页面
   */
  async initPage() {
    try {
      this.setData({ loading: true })
      
      // 设置默认日期（明天）
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const defaultDate = tomorrow.toISOString().split('T')[0]
      
      this.setData({
        selectedDate: defaultDate
      })
      
      // 加载可约用户
      await this.loadAvailableUsers()
      
      // 如果有预选用户，加载其信息
      if (this.data.selectedUserId) {
        await this.loadSelectedUser()
      }
      
      // 生成可选时间
      this.generateAvailableTimes()
      
    } catch (error) {
      console.error('初始化约课页面失败:', error)
      showError('页面加载失败')
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 加载可约用户列表
   */
  async loadAvailableUsers() {
    try {
      const app = getApp()
      const currentUserId = app.globalData.currentUserId
      const result = await mockApi.getRelatedUsers(currentUserId, this.data.userType)
      
      if (result.success) {
        this.setData({
          availableUsers: result.data
        })
      }
    } catch (error) {
      console.error('加载可约用户失败:', error)
    }
  },

  /**
   * 加载选中用户信息
   */
  async loadSelectedUser() {
    try {
      const result = await mockApi.getUserInfo(this.data.selectedUserId)
      if (result.success) {
        this.setData({
          selectedUser: result.data
        })
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
    }
  },

  /**
   * 生成可选时间段
   */
  generateAvailableTimes() {
    const times = []
    for (let hour = 9; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        times.push(timeStr)
      }
    }
    this.setData({
      availableTimes: times
    })
  },

  /**
   * 选择用户
   */
  onSelectUser(e) {
    const userId = e.currentTarget.dataset.id
    const user = this.data.availableUsers.find(u => u.id === userId)
    
    this.setData({
      selectedUserId: userId,
      selectedUser: user
    })
  },

  /**
   * 日期选择
   */
  onDateChange(e) {
    this.setData({
      selectedDate: e.detail.value
    })
  },

  /**
   * 时间选择
   */
  onTimeChange(e) {
    const timeIndex = e.detail.value
    this.setData({
      selectedTime: this.data.availableTimes[timeIndex]
    })
  },

  /**
   * 课程时长选择
   */
  onDurationChange(e) {
    const durationIndex = parseInt(e.detail.value)
    const durationMap = [30, 60, 90, 120]
    this.setData({
      duration: durationMap[durationIndex]
    })
  },

  /**
   * 地点输入
   */
  onLocationInput(e) {
    this.setData({
      location: e.detail.value
    })
  },

  /**
   * 备注输入
   */
  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value
    })
  },

  /**
   * 提交约课请求
   */
  async onSubmit() {
    if (this.data.isSubmitting) return

    // 表单验证
    if (!this.validateForm()) {
      return
    }

    const confirmed = await showConfirm('确定要发起约课请求吗？', '约课确认')
    if (!confirmed) return

    this.setData({ isSubmitting: true })

    try {
      const app = getApp()
      const startTime = new Date(`${this.data.selectedDate} ${this.data.selectedTime}`)
      const endTime = new Date(startTime.getTime() + this.data.duration * 60 * 1000)

      const courseData = {
        coachId: this.data.userType === 'coach' ? app.globalData.currentUserId : this.data.selectedUserId,
        studentId: this.data.userType === 'student' ? app.globalData.currentUserId : this.data.selectedUserId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location: this.data.location,
        remark: this.data.remark,
        type: this.data.userType === 'coach' ? 'coach_to_student' : 'student_to_coach'
      }

      const result = await mockApi.createCourseRequest(courseData)

      if (result.success) {
        showSuccess('约课请求发送成功')
        
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        showError(result.message || '约课失败')
      }
    } catch (error) {
      console.error('约课失败:', error)
      showError('网络异常，请重试')
    } finally {
      this.setData({ isSubmitting: false })
    }
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { selectedUserId, selectedDate, selectedTime, location } = this.data

    if (!selectedUserId) {
      showError(`请选择要约的${this.data.targetType === 'coach' ? '教练' : '学员'}`)
      return false
    }

    if (!selectedDate) {
      showError('请选择日期')
      return false
    }

    if (!selectedTime) {
      showError('请选择时间')
      return false
    }

    if (!location.trim()) {
      showError('请输入上课地点')
      return false
    }

    // 检查时间是否在未来
    const selectedDateTime = new Date(`${selectedDate} ${selectedTime}`)
    if (selectedDateTime <= new Date()) {
      showError('请选择未来的时间')
      return false
    }

    return true
  }
}) 