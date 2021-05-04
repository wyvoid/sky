const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 时间戳转化为年 月 日 时 分 秒
 */
function formatDate(longTypeDate, fmt) {
  var date = longTypeDate instanceof Date ? longTypeDate : new Date(longTypeDate)
  var o = {
    "M+": date.getMonth() + 1,                 //月份   
    "d+": date.getDate(),                    //日   
    "h+": date.getHours(),                   //小时   
    "m+": date.getMinutes(),                 //分   
    "s+": date.getSeconds(),                 //秒   
    "S": date.getMilliseconds()             //毫秒   
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
    }
  }
  return fmt
}

/**
 * 解决iPhone图片不显示
 */
function cImg(phone, src) {
  if ( phone.indexOf("ios") != -1 && src && src.lastIndexOf('format,webp') >= 0) {
    src = src.split('?')[0];
  }
  return src;
}

/**
 * 封装toast
 */
function toast(title, icon='none', duration=2000) {
  wx.showToast({title, icon, duration})
}

/**
 * rpx转px
 */
function rpx2px(value) {
  return value/750*wx.getSystemInfoSync().windowWidth
}

/**
 * base64 转 本地路径
 */
const fsm = wx.getFileSystemManager();
const FILE_BASE_NAME = 'tmp_base64src';
function base64src(base64data) {
  return new Promise((resolve, reject) => {
    const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
    if (!format) {
      reject(new Error('ERROR_BASE64SRC_PARSE'));
    }
    const filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.${format}`;
    const buffer = wx.base64ToArrayBuffer(bodyData);
    fsm.writeFile({
      filePath,
      data: buffer,
      encoding: 'binary',
      success() {
        resolve(filePath);
      },
      fail() {
        reject(new Error('ERROR_BASE64SRC_WRITE'));
      },
    });
  });
}

// 手机号格式校验
const phoneValid = function(value) {
  const _phoneReg = /^1\d{10}$/
  return _phoneReg.test(value)
}

// 邮箱格式校验
const emailValid = function(value){
  const _emailReg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
  return _emailReg.test(value)
}

// 字符创去左右空格
const trim = function(value){
  return value.replace(/(^\s*)|(\s*$)/g,'')
}

module.exports = {
  formatTime,
  formatDate,
  cImg,
  toast,
  rpx2px,
  phoneValid,
  emailValid,
  trim,
}