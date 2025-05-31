/**
 * 首页逻辑
 */
import { mockApi } from '../../utils/mockApi.js'
import { formatTime, getRelativeTime, getCourseStatusText, getCourseStatusClass, showError, showSuccess, showConfirm } from '../../utils/util.js'

const app = getApp()

Page({
  /**
   * 页面数据
   */
  data: {
    userInfo: null,        // 用户信息
    userType: 'student',   // 用户类型
    greeting: '',          // 问候语
    courses: [],           // 课程列表
    pendingCount: 0,       // 待处理请求数量
    isLoading: false       // 加载状态
  },

  /**
   * 页面加载时触发
   */
  onLoad() {
    console.log('首页加载')
    this.initPage()
  },

  /**
   * 页面显示时触发
   */
  onShow() {
    console.log('首页显示')
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
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.refreshData()
  },

  /**
   * 初始化页面
   */
  initPage() {
    // 设置用户信息
    this.setData({
      userInfo: app.globalData.userInfo,
      userType: app.globalData.userType,
      greeting: this.getGreeting()
    })
  },

  /**
   * 刷新数据
   */
  async refreshData() {
    if (this.data.isLoading) return
    
    this.setData({ isLoading: true })
    
    try {
      await Promise.all([
        this.loadCourses(),
        this.loadPendingCount()
      ])
    } catch (error) {
      console.error('刷新数据失败:', error)
      showError('数据加载失败，请重试')
    } finally {
      this.setData({ isLoading: false })
      wx.stopPullDownRefresh()
    }
  },

  /**
   * 加载课程列表
   */
  async loadCourses() {
    try {
      const result = await mockApi.getCourses(app.globalData.currentUserId)
      
      if (result.success) {
        // 过滤未开始的课程
        const now = new Date()
        const upcomingCourses = result.data.filter(course => {
          return new Date(course.startTime) > now && course.status !== 'cancelled'
        })
        
        // 处理课程数据
        const processedCourses = upcomingCourses.map(course => this.processCourseData(course))
        
        this.setData({
          courses: processedCourses
        })
        
        console.log('课程数据加载成功:', processedCourses)
      } else {
        throw new Error(result.message || '加载课程失败')
      }
    } catch (error) {
      console.error('加载课程失败:', error)
      throw error
    }
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
   * 处理课程数据
   * @param {Object} course 原始课程数据
   * @returns {Object} 处理后的课程数据
   */
  processCourseData(course) {
    const isCoach = app.globalData.userType === 'coach'
    const partnerId = isCoach ? course.studentId : course.coachId
    const partnerInfo = isCoach ? course.student : course.coach
    
    return {
      ...course,
      dateText: getRelativeTime(course.startTime),
      timeText: `${formatTime(course.startTime, 'HH:mm')} - ${formatTime(course.endTime, 'HH:mm')}`,
      statusText: getCourseStatusText(course.status),
      statusClass: getCourseStatusClass(course.status),
      partnerInfo: partnerInfo,
      roleText: isCoach ? '学员' : '教练',
      canCancel: course.status === 'confirmed' || course.status === 'pending'
    }
  },

  /**
   * 获取问候语
   * @returns {String} 问候语
   */
  getGreeting() {
    const hour = new Date().getHours()
    if (hour < 6) {
      return '夜深了'
    } else if (hour < 12) {
      return '早上好'
    } else if (hour < 18) {
      return '下午好'
    } else {
      return '晚上好'
    }
  },

  /**
   * 快速约课按钮点击
   */
  onQuickBook() {
    wx.navigateTo({
      url: '/pages/book-course/book-course'
    })
  },

  /**
   * 课程详情点击
   * @param {Object} e 事件对象
   */
  onCourseDetail(e) {
    const course = e.currentTarget.dataset.course
    wx.navigateTo({
      url: `/pages/course-detail/course-detail?id=${course.id}`
    })
  },

  /**
   * 取消课程
   * @param {Object} e 事件对象
   */
  async onCancelCourse(e) {
    const course = e.currentTarget.dataset.course
    
    const confirmed = await showConfirm('确定要取消这节课程吗？', '取消课程')
    if (!confirmed) return
    
    try {
      // TODO: 实现取消课程的API
      showSuccess('课程已取消')
      this.refreshData()
    } catch (error) {
      console.error('取消课程失败:', error)
      showError('取消失败，请重试')
    }
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
   * 查看相关用户（我的学员/教练）
   */
  onViewRelated() {
    const userType = app.globalData.userType
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
   * 查看待处理请求
   */
  onViewRequests() {
    wx.navigateTo({
      url: '/pages/pending-requests/pending-requests'
    })
  },

  /**
   * 页面分享
   */
  onShareAppMessage() {
    const userType = app.globalData.userType
    return {
      title: '约课 - 便捷的教练学员约课工具',
      path: `/pages/login/login?type=${userType}`,
      imageUrl: '/images/share-cover.png'
    }
  }
}) 