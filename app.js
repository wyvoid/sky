// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('微信登录：'+ res)
      }
    })
  },
  globalData: {
    userInfo: null,
    
    phone: wx.getSystemInfoSync().platform.toLowerCase(),//客户端操作平台 
    
    //配置项目环境
    environment:{

    },

    // 测试环境 DEV
    DEV:{
      baseUrl: "http://192.168.40.215:8080/api",
      wssUrl: "http://192.168.40.215:8800",
    },
    // 预发环境 UAT
    UAT:{
      baseUrl: 'http://preh5.psgxs.com/api',
      wssUrl: "http://admin.ipanshi.com",
    },
    //生产/线上环境 PROD
    PROD:{
      baseUrl: "https://h5.psgxs.com/api",// 请求接口域名
      wssUrl: "https://api.psgxs.com:8897",// sockets 地址
    },

  },
  onShow (options) {
    this.globalData.environment = this.globalData.DEV;//测试环境
    // this.globalData.environment = this.globalData.UAT;//预发环境
    // this.globalData.environment = this.globalData.PROD;//线上环境
  },
})
