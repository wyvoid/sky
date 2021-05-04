// 获取应用实例
const app = getApp();
const baseUrl = app.globalData.environment.baseUrl;

// 获取请求头信息
function getHeader() {
  let data = {
    'content-type': 'application/x-www-form-urlencoded',  // 如果不设置默认为 application/json
    'Authorization': wx.getStorageSync('token'),
  }
  return data;
}

function noAuthHandler() {
  // 需要登录或者登录失效 先把之前的清掉
  wx.removeStorageSync('token');

  // 获取当前页面栈。数组中第一个元素为首页，最后一个元素为当前页面
  const pageStack = getCurrentPages()
  const currentPage = pageStack[pageStack.length - 1];
  const { options } = currentPage;
  let urlWithArgs = `/${currentPage.route}?`;
  for (let key in options) {
    urlWithArgs += `${key}=${options[key]}&`;
  }
  urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1);
  // 保存要访问的页面链接，登录后可以获取重定向到该页面
  wx.setStorageSync('route', urlWithArgs);

  // 跳转登录页
  wx.redirectTo({
    url: '../login/login'
  })
}

// 获取promise对象
function getPromise(url, data, method) { 
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}${url}`,
      header: getHeader(),
      method: method,
      data: data,
      success: function (res) {
        if (res.data.resultCode === 401){
          noAuthHandler()
        } else {
          res.statusCode === 200 ? resolve(res.data) : reject(res.data);
        }
      },
      fail: function (err) {
        reject(err.data)
      }
    })
  }).catch(function (e) {
    wx.showToast({
      title: e.message,
      icon: 'none',
      duration: 2000
    })
  })
}

// 封装 request 请求方法对象
module.exports = { 
  get: function (url, data ) {
    return getPromise(url, data, 'GET')
  },
  post: function (url, data) {
    return getPromise(url, data, 'POST')
  },
  put: function (url, data) {
    return getPromise(url, data, 'PUT')
  },
  delete: function (url, data) {
    return getPromise(url, data, 'DELETE')
  }
}