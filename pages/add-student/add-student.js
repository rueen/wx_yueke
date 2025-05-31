/**
 * 添加学员页面逻辑
 */
import { mockApi } from '../../utils/mockApi.js'
import { validatePhone, showError, showSuccess } from '../../utils/util.js'

Page({
  /**
   * 页面数据
   */
  data: {
    phone: '',           // 学员手机号
    coursesLeft: 10,     // 课时数
    remark: '',          // 备注
    isSubmitting: false  // 提交状态
  },

  /**
   * 页面加载时触发
   */
  onLoad() {
    wx.setNavigationBarTitle({
      title: '添加学员'
    })
  },

  /**
   * 手机号输入
   * @param {Object} e 事件对象
   */
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  /**
   * 课时数输入
   * @param {Object} e 事件对象
   */
  onCoursesInput(e) {
    const value = parseInt(e.detail.value) || 0
    this.setData({
      coursesLeft: Math.max(0, value)
    })
  },

  /**
   * 备注输入
   * @param {Object} e 事件对象
   */
  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value
    })
  },

  /**
   * 课时数加减操作
   * @param {Object} e 事件对象
   */
  onCoursesChange(e) {
    const type = e.currentTarget.dataset.type
    let { coursesLeft } = this.data
    
    if (type === 'add') {
      coursesLeft += 1
    } else if (type === 'minus' && coursesLeft > 0) {
      coursesLeft -= 1
    }
    
    this.setData({ coursesLeft })
  },

  /**
   * 提交添加学员
   */
  async onSubmit() {
    if (this.data.isSubmitting) return

    // 表单验证
    if (!this.validateForm()) {
      return
    }

    this.setData({ isSubmitting: true })

    try {
      const app = getApp()
      const coachId = app.globalData.currentUserId

      const result = await mockApi.addStudent(
        coachId,
        this.data.phone,
        this.data.coursesLeft
      )

      if (result.success) {
        showSuccess('学员添加成功')
        
        // 延迟返回上一页
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        showError(result.message || '添加失败')
      }
    } catch (error) {
      console.error('添加学员失败:', error)
      showError('网络异常，请重试')
    } finally {
      this.setData({ isSubmitting: false })
    }
  },

  /**
   * 表单验证
   * @returns {Boolean} 是否有效
   */
  validateForm() {
    const { phone, coursesLeft } = this.data

    // 验证手机号
    if (!phone) {
      showError('请输入学员手机号')
      return false
    }

    if (!validatePhone(phone)) {
      showError('请输入正确的手机号')
      return false
    }

    // 验证课时数
    if (coursesLeft < 0) {
      showError('课时数不能为负数')
      return false
    }

    return true
  }
}) 