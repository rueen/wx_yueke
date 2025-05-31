/**
 * 我的学员页面逻辑
 */
import { mockApi } from '../../utils/mockApi.js'

Page({
  /**
   * 页面数据
   */
  data: {
    students: [],
    loading: true,
    isEmpty: false
  },

  /**
   * 页面加载时触发
   */
  onLoad() {
    wx.setNavigationBarTitle({
      title: '我的学员'
    })
    this.loadStudents()
  },

  /**
   * 页面显示时触发
   */
  onShow() {
    this.loadStudents()
  },

  /**
   * 加载学员列表
   */
  async loadStudents() {
    try {
      this.setData({ loading: true })
      
      const app = getApp()
      const currentUserId = app.globalData.currentUserId
      
      if (!currentUserId) {
        wx.showToast({
          title: '请先登录',
          icon: 'error'
        })
        return
      }

      const result = await mockApi.getRelatedUsers(currentUserId, 'coach')
      
      if (result.success) {
        this.setData({
          students: result.data,
          isEmpty: result.data.length === 0,
          loading: false
        })
      } else {
        throw new Error(result.message || '获取学员列表失败')
      }
    } catch (error) {
      console.error('加载学员列表失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
      this.setData({ loading: false })
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
   * 查看学员详情
   * @param {Object} e 事件对象
   */
  onStudentDetail(e) {
    const studentId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/student-detail/student-detail?id=${studentId}`
    })
  },

  /**
   * 向学员发起约课
   * @param {Object} e 事件对象
   */
  onBookCourse(e) {
    const studentId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/book-course/book-course?studentId=${studentId}&type=coach`
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadStudents().finally(() => {
      wx.stopPullDownRefresh()
    })
  }
}) 