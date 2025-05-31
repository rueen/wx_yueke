/**
 * 我的教练页面逻辑
 */
import { mockApi } from '../../utils/mockApi.js'

Page({
  /**
   * 页面数据
   */
  data: {
    coaches: [],
    loading: true,
    isEmpty: false
  },

  /**
   * 页面加载时触发
   */
  onLoad() {
    wx.setNavigationBarTitle({
      title: '我的教练'
    })
    this.loadCoaches()
  },

  /**
   * 页面显示时触发
   */
  onShow() {
    this.loadCoaches()
  },

  /**
   * 加载教练列表
   */
  async loadCoaches() {
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

      const result = await mockApi.getRelatedUsers(currentUserId, 'student')
      
      if (result.success) {
        this.setData({
          coaches: result.data,
          isEmpty: result.data.length === 0,
          loading: false
        })
      } else {
        throw new Error(result.message || '获取教练列表失败')
      }
    } catch (error) {
      console.error('加载教练列表失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
      this.setData({ loading: false })
    }
  },

  /**
   * 查看教练详情
   * @param {Object} e 事件对象
   */
  onCoachDetail(e) {
    const coachId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/coach-detail/coach-detail?id=${coachId}`
    })
  },

  /**
   * 向教练发起约课
   * @param {Object} e 事件对象
   */
  onBookCourse(e) {
    const coachId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/book-course/book-course?coachId=${coachId}&type=student`
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadCoaches().finally(() => {
      wx.stopPullDownRefresh()
    })
  }
}) 