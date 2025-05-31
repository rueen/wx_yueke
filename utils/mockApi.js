/**
 * 模拟API数据和接口
 * 用于MVP版本的数据模拟
 */

// 模拟数据存储
let mockData = {
  users: [],
  courses: [],
  relationships: [], // 教练-学员关系
  notifications: [],
  courseRequests: [] // 约课请求
}

/**
 * 模拟API类
 */
class MockApi {
  /**
   * 初始化模拟数据
   */
  init() {
    // 创建一些模拟用户
    this.createMockUsers()
    // 创建模拟课程数据
    this.createMockCourses()
    // 创建模拟关系数据
    this.createMockRelationships()
    // 创建模拟通知
    this.createMockNotifications()
    
    console.log('模拟API初始化完成', mockData)
  }

  /**
   * 创建模拟用户数据
   */
  createMockUsers() {
    mockData.users = [
      {
        id: 'user_001',
        nickname: '张教练',
        avatar: '/images/avatar-coach.png',
        phone: '13800000001',
        wechat: 'coach_zhang',
        type: 'coach',
        specialty: ['健身', '减脂'],
        introduction: '10年健身经验，专业减脂训练',
        remark: '',
        availableTime: ['09:00-12:00', '14:00-18:00']
      },
      {
        id: 'user_002',
        nickname: '李教练',
        avatar: '/images/avatar-coach2.png',
        phone: '13800000002',
        wechat: 'coach_li',
        type: 'coach',
        specialty: ['瑜伽', '塑形'],
        introduction: '资深瑜伽导师，擅长塑形训练',
        remark: '',
        availableTime: ['10:00-12:00', '15:00-19:00']
      },
      {
        id: 'user_003',
        nickname: '小明',
        avatar: '/images/avatar-student.png',
        phone: '13800000003',
        wechat: 'student_ming',
        type: 'student',
        remark: '喜欢早上训练',
        coursesLeft: 8
      },
      {
        id: 'user_004',
        nickname: '小红',
        avatar: '/images/avatar-student2.png',
        phone: '13800000004',
        wechat: 'student_hong',
        type: 'student',
        remark: '膝盖有旧伤，需要注意',
        coursesLeft: 5
      }
    ]
  }

  /**
   * 创建模拟课程数据
   */
  createMockCourses() {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const afterTomorrow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    
    mockData.courses = [
      {
        id: 'course_001',
        coachId: 'user_001',
        studentId: 'user_003',
        startTime: tomorrow.toISOString(),
        endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000).toISOString(),
        location: '健身房A区',
        status: 'confirmed',
        remark: '减脂训练',
        createdAt: now.toISOString()
      },
      {
        id: 'course_002',
        coachId: 'user_002',
        studentId: 'user_004',
        startTime: afterTomorrow.toISOString(),
        endTime: new Date(afterTomorrow.getTime() + 90 * 60 * 1000).toISOString(),
        location: '瑜伽室',
        status: 'confirmed',
        remark: '瑜伽基础课程',
        createdAt: now.toISOString()
      }
    ]
  }

  /**
   * 创建模拟关系数据
   */
  createMockRelationships() {
    mockData.relationships = [
      {
        id: 'rel_001',
        coachId: 'user_001',
        studentId: 'user_003',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: 'rel_002',
        coachId: 'user_002',
        studentId: 'user_004',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ]
  }

  /**
   * 创建模拟通知数据
   */
  createMockNotifications() {
    mockData.notifications = [
      {
        id: 'notif_001',
        userId: 'user_003',
        type: 'course_request',
        title: '新的约课请求',
        content: '张教练向您发起约课请求',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ]
  }

  /**
   * 模拟网络请求延迟
   */
  delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 用户登录
   * @param {String} phone 手机号
   * @param {String} userType 用户类型
   */
  async login(phone, userType = 'student') {
    await this.delay()
    
    let user = mockData.users.find(u => u.phone === phone)
    
    if (!user) {
      // 创建新用户
      user = {
        id: `user_${Date.now()}`,
        nickname: `用户${phone.slice(-4)}`,
        avatar: '/images/avatar-default.png',
        phone: phone,
        wechat: '',
        type: userType,
        remark: '',
        specialty: userType === 'coach' ? [] : undefined,
        introduction: userType === 'coach' ? '' : undefined,
        availableTime: userType === 'coach' ? [] : undefined,
        coursesLeft: userType === 'student' ? 0 : undefined
      }
      mockData.users.push(user)
    }
    
    return { success: true, data: user }
  }

  /**
   * 获取用户信息
   * @param {String} userId 用户ID
   */
  async getUserInfo(userId) {
    await this.delay(200)
    
    const user = mockData.users.find(u => u.id === userId)
    if (!user) {
      return { success: false, message: '用户不存在' }
    }
    
    return { success: true, data: user }
  }

  /**
   * 更新用户信息
   * @param {String} userId 用户ID
   * @param {Object} updateData 更新数据
   */
  async updateUserInfo(userId, updateData) {
    await this.delay()
    
    const userIndex = mockData.users.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      return { success: false, message: '用户不存在' }
    }
    
    mockData.users[userIndex] = { ...mockData.users[userIndex], ...updateData }
    return { success: true, data: mockData.users[userIndex] }
  }

  /**
   * 获取课程列表
   * @param {String} userId 用户ID
   * @param {String} status 课程状态
   */
  async getCourses(userId, status = null) {
    await this.delay(300)
    
    let courses = mockData.courses.filter(course => 
      course.coachId === userId || course.studentId === userId
    )
    
    if (status) {
      courses = courses.filter(course => course.status === status)
    }
    
    // 添加关联用户信息
    courses = courses.map(course => {
      const coach = mockData.users.find(u => u.id === course.coachId)
      const student = mockData.users.find(u => u.id === course.studentId)
      return {
        ...course,
        coach,
        student
      }
    })
    
    // 按开始时间排序
    courses.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    
    return { success: true, data: courses }
  }

  /**
   * 发起约课请求
   * @param {Object} courseData 课程数据
   */
  async createCourseRequest(courseData) {
    await this.delay()
    
    const request = {
      id: `req_${Date.now()}`,
      ...courseData,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    
    mockData.courseRequests.push(request)
    
    // 创建通知
    const targetUserId = courseData.type === 'coach_to_student' ? courseData.studentId : courseData.coachId
    const notification = {
      id: `notif_${Date.now()}`,
      userId: targetUserId,
      type: 'course_request',
      title: '新的约课请求',
      content: `收到新的约课请求`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: request.id
    }
    mockData.notifications.push(notification)
    
    return { success: true, data: request }
  }

  /**
   * 获取我的学员/教练列表
   * @param {String} userId 用户ID
   * @param {String} userType 用户类型
   */
  async getRelatedUsers(userId, userType) {
    await this.delay(300)
    
    let relationships
    if (userType === 'coach') {
      // 获取教练的学员列表
      relationships = mockData.relationships.filter(rel => 
        rel.coachId === userId && rel.status === 'active'
      )
    } else {
      // 获取学员的教练列表
      relationships = mockData.relationships.filter(rel => 
        rel.studentId === userId && rel.status === 'active'
      )
    }
    
    const users = relationships.map(rel => {
      const targetUserId = userType === 'coach' ? rel.studentId : rel.coachId
      const user = mockData.users.find(u => u.id === targetUserId)
      return {
        ...user,
        relationshipId: rel.id
      }
    })
    
    return { success: true, data: users }
  }

  /**
   * 添加学员
   * @param {String} coachId 教练ID
   * @param {String} studentPhone 学员手机号
   * @param {Number} coursesLeft 课时数
   */
  async addStudent(coachId, studentPhone, coursesLeft) {
    await this.delay()
    
    let student = mockData.users.find(u => u.phone === studentPhone)
    
    if (!student) {
      // 创建新学员用户
      student = {
        id: `user_${Date.now()}`,
        nickname: `用户${studentPhone.slice(-4)}`,
        avatar: '/images/avatar-default.png',
        phone: studentPhone,
        wechat: '',
        type: 'student',
        remark: '',
        coursesLeft: coursesLeft
      }
      mockData.users.push(student)
    } else {
      // 更新课时数
      student.coursesLeft = (student.coursesLeft || 0) + coursesLeft
    }
    
    // 创建关系
    const relationship = {
      id: `rel_${Date.now()}`,
      coachId: coachId,
      studentId: student.id,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    mockData.relationships.push(relationship)
    
    // 发送邀请通知给学员
    const notification = {
      id: `notif_${Date.now()}`,
      userId: student.id,
      type: 'student_invitation',
      title: '教练邀请',
      content: '有教练邀请您建立关联关系',
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: relationship.id
    }
    mockData.notifications.push(notification)
    
    return { success: true, data: { student, relationship } }
  }

  /**
   * 获取通知列表
   * @param {String} userId 用户ID
   */
  async getNotifications(userId) {
    await this.delay(200)
    
    const notifications = mockData.notifications
      .filter(notif => notif.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    return { success: true, data: notifications }
  }

  /**
   * 标记通知为已读
   * @param {String} notificationId 通知ID
   */
  async markNotificationAsRead(notificationId) {
    await this.delay(100)
    
    const notification = mockData.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.isRead = true
    }
    
    return { success: true }
  }
}

// 导出单例
export const mockApi = new MockApi() 