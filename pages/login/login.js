// pages/login/login.js

//引入接口
const request = require('../../utils/request');
//引入公用方法
const utils = require('../../utils/util');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: '', // 用户信息
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    encryptedData: '', // 包括敏感数据在内的完整用户信息的加密数据
    iv: '', // 加密算法的初始向量
    beforeBind: true, // 获取手机号授权的那个页面
    bindData: {
      phone: '', // 绑定手机号
      verification: '', // 验证码
    },
    isVerification: true, // 显示获取验证码
    count: 60, // 倒计时
    timer: '', // 计时器
    isAgree: false // 同意协议
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(this.data.timer);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * wx获取code 微信api
   */
  login() {
    let _this = this;
    wx.login({
      success(res) {
        if (res.code) {
          _this.wxSessionKey(res.code);
        } else {
          utils.toast(`登录失败！${res.errMsg}`)
        }
      }
    })
  },

  /**
   * wxcode获取 sessionKey, openid, unionid 接口
   */
  wxSessionKey(code) {
    request.post('/user/oauth2/wechat/sessionKey/', {
      code
    }).then(res => {
      if (res.resultCode === 1000) {
        let data = res.data;
        data.openid && wx.setStorageSync('openid', data.openid);
        data.unionid && wx.setStorageSync('unionid', data.unionid);
        data.session_key && wx.setStorageSync('sessionKey', data.session_key);
        this.wxDecode(data.session_key);
      } else {
        utils.toast(res.reason);
      }
    }, err => {
      utils.toast(err.reason);
    })
  },

  /**
   * 最后拿用户信息 自定义登录 接口
   */
  oauth2Wechat() {
    fetchApi.oauth2Wechat({
      nickName: wx.getStorageSync('nickName'),
      avatarUrl: wx.getStorageSync('avatarUrl'),
      unionId: wx.getStorageSync('unionid'),
      openId: wx.getStorageSync('openid')
    }).then(res => {
      if (res.resultCode === 1000) {
        let data = res.data;
        data.access_token && wx.setStorageSync('token', data.access_token);
        (data.grade == 0 || data.grade) && wx.setStorageSync('grade', data.grade);
        data.invitationCode && wx.setStorageSync('invitationCode', data.invitationCode);
        data.openid && wx.setStorageSync('openid', data.openid);
        data.session_key && wx.setStorageSync('phoneNumber', data.phoneNumber);
        data.unionid && wx.setStorageSync('refreshToken', data.refresh_token);
        data.userName && wx.setStorageSync('userName', data.userName);
        //跳转回去
        data.access_token && wx.reLaunch({
          url: wx.getStorageSync('route')
        });
      } else if (res.resultCode === 2018) {
        this.setData({
          beforeBind: false
        })
      } else {
        utils.toast(res.reason);
      }
    }, err => {
      utils.toast(err.reason);
    })
  },

  /**
   * 获取验证码 接口
   */
  captcha() {
    if (!utils.phoneValid(this.data.bindData.phone)) {
      return utils.toast("号码为空或错误");
    }

    request.get('/user/captcha', {
      phoneNum: this.data.bindData.phone,
      type: '1',
      deviceInfo: '999',
      timestamp: new Date().getTime(),
      checkCode: '999999'
    }).then(res => {
      if (res.resultCode === 1000) {
        utils.toast(res.reason);
        this.setData({
          isVerification: false,
          count: 60,
          [`bindData.verification`]: ''
        })
        let _this = this;
        this.data.timer = setInterval(function() {
          _this.setData({
            count: --_this.data.count,
          }, function() {
            if (_this.data.count <= 0) {
              clearInterval(_this.data.timer);
              _this.setData({
                isVerification: true
              })
            }
          })
        }, 1000);
      } else {
        utils.toast(res.reason);
      }
    }, err => {
      utils.toast(err.reason);
    })
  },

  /**
   *  绑定手机号 接口
   */
  registryThird() {
    if (!(this.data.bindData.phone && this.data.bindData.verification && this.data.isAgree)) return;
    let params = {
      phone: this.data.bindData.phone,
      smsVerifyCode: this.data.bindData.verification,
      type: '1',
      loginType: '1',
      nickName: wx.getStorageSync('nickName'),
      avatarUrl: wx.getStorageSync('avatarUrl'),
      uuid: wx.getStorageSync('unionid'),
      openId: wx.getStorageSync('openid'),
      invitationCode: wx.getStorageSync('inviteCode'),
      checkGrade: '1'
    }
    !params.uuid && delete params.uuid;
    !params.openId && delete params.openId;
    fetchApi.registryThird(params).then(res => {
      if (res.resultCode === 1000) {
        let data = res.data;
        data.access_token && wx.setStorageSync('token', data.access_token);
        data.openid && wx.setStorageSync('openid', data.openid);
        data.unionid && wx.setStorageSync('unionid', data.unionid);
        data.session_key && wx.setStorageSync('refreshToken', data.refresh_token);
        data.invitationCode && wx.setStorageSync('invitationCode', data.invitationCode);
        (data.grade == 0 || data.grade) && wx.setStorageSync('grade', data.grade);
        //跳转回去
        data.access_token && wx.reLaunch({
          url: wx.getStorageSync('route')
        });
      } else if (res.resultCode === 4034) { //该手机号已绑定
        this.continueBindingPhone();
      } else {
        utils.toast(res.reason);
      }
    }, err => {
      utils.toast(err.reason);
    })
  },

  /**
   *  继续绑定手机号 接口
   */
  multiThirdBindAccount() {
    let params = {
      nickName: wx.getStorageSync('nickName'),
      avatarUrl: wx.getStorageSync('avatarUrl'),
      uuid: wx.getStorageSync('unionid'),
      openId: wx.getStorageSync('openid'),
      loginType: '1',
      checkGrade: '1'
    }
    fetchApi.multiThirdBindAccount(params).then(res => {
      if (res.resultCode === 1000) {
        let data = res.data;
        data.access_token && wx.setStorageSync('token', data.access_token);
        data.openid && wx.setStorageSync('openid', data.openid);
        data.unionid && wx.setStorageSync('unionid', data.unionid);
        data.session_key && wx.setStorageSync('sessionKey', data.session_key);
        data.invitationCode && wx.setStorageSync('invitationCode', data.invitationCode);
        (data.grade == 0 || data.grade) && wx.setStorageSync('grade', data.grade);
        //跳转回去
        data.access_token && wx.reLaunch({
          url: wx.getStorageSync('route')
        });
      } else {
        utils.toast(res.reason);
      }
    }, err => {
      utils.toast(err.reason);
    })
  },

  /**
   * wx解密 接口
   */
  wxDecode(session_key) {
    request.post('/user/oauth2/wechat/decode_/', {
      session_key,
      encryptedData: this.data.encryptedData,
      vi: this.data.iv
    }).then(res => {
      if (res.resultCode === 1000) {
        if(!res.data) {
          let _this = this;
          // 查看是否授权
          wx.getSetting({
            success(res) {
              if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                wx.getUserInfo({
                  success: function (res) {
                    _this.data.userInfo = res.userInfo;
                    _this.data.encryptedData = res.encryptedData;
                    _this.data.iv = res.iv;
                    _this.login();
                  }
                })
              }
            }
          })
          return;
        };
        let data = JSON.parse(res.data);
        data.openId && wx.setStorageSync('openid', data.openId);
        data.unionId && wx.setStorageSync('unionid', data.unionId);
        data.nickName && wx.setStorageSync('nickName', data.nickName);
        data.avatarUrl && wx.setStorageSync('avatarUrl', data.avatarUrl);
        // data.gender && wx.setStorageSync('gender', data.gender);
        this.oauth2Wechat();
      } else {
        // utils.toast(res.reason);
      }
    }, err => {
      utils.toast(err.reason);
    })
  },

  /**
   * 获取用户授权  然后登录
   */
  getWxUserInfo(e) {
    console.log('wx user info:', e)
    this.data.userInfo = e.detail.userInfo;
    this.data.encryptedData = e.detail.encryptedData;
    this.data.iv = e.detail.iv;
    // this.login();
  },

  /**
   * 获取输入信息
   */
  toInput(e) {
    let flag = e.currentTarget.dataset.flag;
    let val = e.detail.value.replace(/\s+/g, '');
    this.setData({
      [`bindData.${flag}`]: val
    })
  },

  /**
   * 勾选协议
   */
  toAgree() {
    this.setData({
      isAgree: !this.data.isAgree
    })
  },

  /**
   * 吊起继续绑定弹框
   */
  continueBindingPhone() {
    if (!(this.data.bindData.phone && this.data.bindData.verification && this.data.isAgree)) {
      return;
    }
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '您已绑定过其他微信，是否继续绑定',
      confirmText: '继续绑定',
      cancelText: '更换码号',
      cancelColor: '#999999',
      confirmColor: '#ED0000',
      success(res) {
        if (res.confirm) {
          _this.multiThirdBindAccount();
        } else if (res.cancel) {

        }
        clearInterval(_this.data.timer);
        _this.setData({
          bindData: {
            phone: '', //绑定手机号
            verification: '' //验证码
          },
          isVerification: true
        })
      }
    })
  },

  getUserProfile(e) {
    // 推荐使用wx.getUserProfile 获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log('获取用户信息成功：', res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      },
      fail: (err) => {
        console.log('获取用户信息失败：', err)
      }      
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },  
})