/*
 * @Author: diaochan
 * @Date: 2025-05-31 21:21:24
 * @LastEditors: diaochan
 * @LastEditTime: 2025-05-31 21:26:27
 * @Description: 
 */
/**
 * 课程详情页面逻辑
 */
import { mockApi } from '../../utils/mockApi.js'
import { formatTime, showError, showSuccess, showConfirm } from '../../utils/util.js'

Page({
  /**
   * 页面数据
   */
  data: {
    courseId: '',
    course: null,
    userType: 'student',
    currentUserId: '',
    
    // 状态
    loading: true,
    operating: false
  },

  /**
   * 页面加载时触发
   */
  onLoad(options) {
    const { id } = options
    if (!id) {
      showError('课程ID不能为空')
      wx.navigateBack()
      return
    }

    const app = getApp()
    this.setData({
      courseId: id,
      userType: app.globalData.userType,
      currentUserId: app.globalData.currentUserId
    })

    this.loadCourseDetail()
  },

  /**
   * 分享
   */
  onShareAppMessage() {
    return {
      title: `课程详情 - ${this.data.course?.otherUser?.nickname || '约课小程序'}`,
      path: `/pages/course-detail/course-detail?id=${this.data.courseId}`,
      imageUrl: '/images/share-cover.png'
    }
  },

  /**
   * 加载课程详情
   */
  async loadCourseDetail() {
    try {
      this.setData({ loading: true })

      const result = await mockApi.getCourseDetail(this.data.courseId)

      if (result.success) {
        const course = this.formatCourseDetail(result.data)
        
        this.setData({ course })

        // 设置导航栏标题
        wx.setNavigationBarTitle({
          title: `与 ${course.otherUser.nickname} 的课程`
        })
      } else {
        showError(result.message || '课程不存在')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('加载课程详情失败:', error)
      showError('加载失败，请重试')
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 格式化课程详情
   */
  formatCourseDetail(course) {
    const startTime = new Date(course.startTime)
    const endTime = new Date(course.endTime)
    const now = new Date()
    
    const isCoach = this.data.userType === 'coach'
    const otherUser = isCoach ? course.student : course.coach
    
    return {
      ...course,
      otherUser,
      dateText: formatTime(startTime, 'YYYY-MM-DD'),
      dayText: formatTime(startTime, 'dddd'),
      timeText: `${formatTime(startTime, 'HH:mm')} - ${formatTime(endTime, 'HH:mm')}`,
      durationText: this.getDurationText(startTime, endTime),
      statusText: this.getStatusText(course.status),
      statusClass: course.status,
      canCancel: this.canCancelCourse(course, now),
      canReschedule: this.canRescheduleCourse(course, now),
      isUpcoming: startTime > now,
      isPast: endTime < now,
      isOngoing: startTime <= now && endTime > now
    }
  },

  /**
   * 获取课程时长文本
   */
  getDurationText(startTime, endTime) {
    const duration = Math.round((endTime - startTime) / (1000 * 60))
    if (duration >= 60) {
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`
    }
    return `${duration}分钟`
  },

  /**
   * 获取状态文本
   */
  getStatusText(status) {
    const statusMap = {
      'scheduled': '已安排',
      'ongoing': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return statusMap[status] || '未知'
  },

  /**
   * 判断是否可以取消课程
   */
  canCancelCourse(course, now) {
    const startTime = new Date(course.startTime)
    const timeDiff = startTime - now
    const hoursUntilStart = timeDiff / (1000 * 60 * 60)
    
    return course.status === 'scheduled' && hoursUntilStart > 2 // 开始前2小时可取消
  },

  /**
   * 判断是否可以改期
   */
  canRescheduleCourse(course, now) {
    const startTime = new Date(course.startTime)
    const timeDiff = startTime - now
    const hoursUntilStart = timeDiff / (1000 * 60 * 60)
    
    return course.status === 'scheduled' && hoursUntilStart > 12 // 开始前12小时可改期
  },

  /**
   * 取消课程
   */
  async onCancelCourse() {
    if (this.data.operating) return

    const confirmed = await showConfirm(
      '确定要取消这节课程吗？取消后无法恢复。',
      '取消课程'
    )
    
    if (!confirmed) return

    this.setData({ operating: true })

    try {
      // TODO: 实现取消课程API
      await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
      
      showSuccess('课程已取消')
      
      // 更新课程状态
      this.setData({
        'course.status': 'cancelled',
        'course.statusText': '已取消',
        'course.statusClass': 'cancelled',
        'course.canCancel': false,
        'course.canReschedule': false
      })
      
    } catch (error) {
      console.error('取消课程失败:', error)
      showError('取消失败，请重试')
    } finally {
      this.setData({ operating: false })
    }
  },

  /**
   * 改期课程
   */
  onRescheduleCourse() {
    // TODO: 实现改期功能
    wx.showToast({
      title: '改期功能开发中',
      icon: 'none'
    })
  },

  /**
   * 联系对方
   */
  onContactOther() {
    const otherUser = this.data.course.otherUser
    
    wx.showActionSheet({
      itemList: ['查看详情', '发起约课'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 查看用户详情
          const userType = this.data.userType === 'coach' ? 'student' : 'coach'
          wx.navigateTo({
            url: `/pages/${userType}-detail/${userType}-detail?id=${otherUser.id}`
          })
        } else if (res.tapIndex === 1) {
          // 发起新约课
          const param = this.data.userType === 'coach' ? `studentId=${otherUser.id}` : `coachId=${otherUser.id}`
          wx.navigateTo({
            url: `/pages/book-course/book-course?${param}`
          })
        }
      }
    })
  },

  /**
   * 查看地图位置
   */
  onViewLocation() {
    if (!this.data.course.location) {
      showError('暂无位置信息')
      return
    }

    // TODO: 实现地图定位功能
    wx.showToast({
      title: '地图功能开发中',
      icon: 'none'
    })
  }
}) 