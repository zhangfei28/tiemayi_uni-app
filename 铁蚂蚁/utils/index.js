import md5 from 'js-md5';
//API接口地址
// 线上
// const host = 'https://api.damingduo.cn/api/';
// 线上后台地址
// const filePath = 'http://xcx.gllgyz.com';
const host = 'http://xmyapi.wtvxin.com/api/';// 测试
const website = 'http://www.3318pk.com';
const wssPath = 'wss://hxapia.com/WebSocketServer.ashx';// wss地址
const filePath = 'http://www.hxapia.com';// 测试后台地址
const LoginPath = "/pages/login/main";//登录路径
const RegisterPath = "/pages/login/register/main";//注册路径

const RequestFrom = 'H5';
const Apikey = 'TxRe@5_6A7a#e_8Fr5c1_36El@1a1_u7tFtr@Rg';
const AppId = 'A6010957284142';
const ClientId = '32422354D41A4E7814D0ACDF510D2167';
const ClientSecret = '79C8F22AB0DD19B4A74F254A75887DAA';
export {
  host,filePath,wssPath,
  dateUtils,LoginPath,RegisterPath,ClientId,ClientSecret
}

//请求封装 //loginFn:重新登录后执行的函数
let status = false;
// 统一请求返回code
const code={
  success:0,//成功
  fail:1,//失败
  notRegister:3,//未注册
  resCode1:200,//成功特别方式
}
function request(url, data,method, loginFn) {
  uni.showLoading({
    title: '加载中' //数据请求前loading
  })
  return new Promise((resolve, reject) => {
    const Timetamp = (new Date()).getTime(); //当前时间戳
    const Sign = md5(AppId + ClientId + ClientSecret + Apikey + Timetamp); //签名
    console.log({
      AppId,
      Timetamp,
      Sign,
      RequestFrom
    })
    uni.request({
      url: host + url, //仅为示例，并非真实的接口地址
      method: method,
      data: data,
      header: {
        AppId,
        Timetamp,
        Sign,
        RequestFrom
      },
      success: function (res) {
        uni.hideLoading();
        switch (res.data.errcode) {
          case code.success:
            resolve(res.data);
            break;
          case code.resCode1:
            resolve(res.data);
            break;
          case code.notRegister:
            uni.showToast({
              title: '需要重新登录!',
              icon: 'none'
            })
            // 没登录过跳转到登录页面
            if (!uni.getStorageSync("userId") || !uni.getStorageSync("token")) {
              if(!status){
                status = true;
                uni.showModal({
                  title:'是否跳转到登录页面？',
                  success(res){
                    if(res.confirm){
                      uni.navigateTo({
                        url: LoginPath
                      })
                    }
                  },
                  complete(){
                    status = false;
                  }
                })
              }
            } else {
              // 设置需要重新登录执行的函数
              // getApp()--微信全局对象
              if (loginFn) {
                // 创建全局对象userInfoReadyCallback为匿名函数，执行需要重新登录函数
                getApp().userInfoReadyCallback = () => {
                  loginFn()
                }
              }
              // 登录过期自动重新登录
              logins({
                success() {
                  if (getApp().userInfoReadyCallback) {
                    getApp().userInfoReadyCallback()
                    // 执行完成清空匿名函数
                    getApp().userInfoReadyCallback = null
                  }
                }
              }).then(() => {
                reject()
              });
            }
            break;
          default:
            uni.showToast({
              title: res.data.msg, //提示的内容,
              icon: "none", //图标,
              mask: false, //显示透明蒙层，防止触摸穿透,
            });
            reject(res.data)
        }
      },
      fail: function (error) {
        uni.hideLoading();
        uni.showToast({
          title: error || '请求失败' + '，请刷新页面重试!',
          icon: "none"
        })
        reject(false)
      }
    })
  })
}
export function get(url, data,isLogin, loginFn) {
  return request(url, data, 'GET', loginFn)
}
export function post(url, data,isLogin, loginFn) {
  return request(url, data,'POST', loginFn)
}
//判断是否登录，未登录做弹窗跳转登录页面
export function judgeLogin(){
  if (!uni.getStorageSync("userId") || !uni.getStorageSync("token")) {
      uni.showModal({
        title:'是否跳转到登录页面？',
        success(res){
          if(res.confirm){
            uni.navigateTo({
              url: LoginPath
            })
          }
        }
      })
      return false;
  }else{
    return true;
  }
}
// 获取图片base64
export function getbase64(urladdress) {
  uni.request({
    url: urladdress,
    method: 'GET',
    responseType: 'arraybuffer',
    success: (result) => {
      let base64 = uni.arrayBufferToBase64(result);
      return base64;
    },
    fail: () => {},
    complete: () => {}
  });
  //({
  //     url:'https://www.dounine.com/hello.jpg',
  //     method:'GET',
  //     responseType: 'arraybuffer',
  //     success:function(res){
  //       let base64 = uni.arrayBufferToBase64(res);
  //       $this.data.userImageBase64 = 'data:image/jpg;base64,' + base64;;
  //     }
  // });

}

export function trim(str) {
  return str.replace(/(^\s*)|(\s*$)/g, "");
}
//验证手机号
export function valPhone(tel) {
  var r_phone = /^[1][3,4,5,6,7,8][0-9]{9}$/;
  // var phoneNumber = $.trim($('#phoneNumber').val());
  if (trim(tel) == "") {
    toast( "手机号不能为空!");
    return false;
  }
  if (!r_phone.test(tel)) {
    toast("请输入正确的手机格式!");
    return false;
  }
  return true;
}

export function toast(title,icon,time=2000){
  uni.showToast({
      title,
      icon:icon?'success':'none',
      duration:time
  })
}

// 函数防抖
let timeout = null
export function debounce(fn, wait = 500) {
  if (timeout !== null) clearTimeout(timeout)
  timeout = setTimeout(fn, wait)
}
// 函数节流
let throtteStatus = false
export function throtte(fn, wait = 500) {
  if (throtteStatus) return;
  throtteStatus = true;
  setTimeout(fn, wait)
  setTimeout(() => {
    throtteStatus = false;
  }, wait)
}
// 打开选取图片，获取图片临时路径
export function getImgPath(num = 1, sourceType = ["album", "camera"], sizeType = ['original']) {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: num, //最大图片数量=最大数量-临时路径的数量
      sizeType, //图片尺寸 original--原图；compressed--压缩图
      sourceType, //选择图片的位置 album--相册选择, 'camera--使用相机
      success: res => {
        resolve(res.tempFilePaths) //返回选择的图片临时地址数组，
      },
      fail(err) {
        uni.showToast({
          title: '图片选择失败，请重试！',
          icon: 'none'
        })
        reject(err)
      }
    });
  })
}
// 获取图片base64码
export function getImgBase64(filePath) {
  return new Promise((resolve, reject) => {
    uni.getFileSystemManager().readFile({
      filePath, //选择图片返回的相对路径
      encoding: "base64", //编码格式
      success(res) {
        resolve("data:image/png;base64," + res.data.toString())
      },
      fail(err) {
        uni.showToast({
          title: '上传图片失败，请重试！',
          icon: 'none'
        })
        reject(err)
      }
    });
  })
}
// 上传base64图片
export function upImgBase64(base64) {
  return new Promise((resolve, reject) => {
    post('Authentication/PhotoUpload', {
      Base64Data: base64
    }).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}
// 上传文件
export function upFile(filePath) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: host + 'Area/VoiceUpload',
      filePath,
      name: 'file',
      success(res) {
        console.log('文件上传', res)
        resolve(res);
      },
      fail(err) {
        console.log('文件上传失败', err)
        uni.showToast({
          title: '文件上传失败，请重试！',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}
// 时间格式化工具
function formatNumber(n) {
  const str = n.toString()
  return str[1] ? str : `0${str}`
}

export function formatTime(date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const t1 = [year, month, day].map(formatNumber).join('/')
  const t2 = [hour, minute, second].map(formatNumber).join(':')

  return `${t1} ${t2}`
}

// 微信支付
// param--支付参数（后台返回）；success--支付成功执行的方法
export function uni_pay(param) {
  return new Promise((resolve, reject) => {
    let payData = JSON.parse(param);
    uni.requestPayment({
      timeStamp: payData.timeStamp,
      nonceStr: payData.nonceStr,
      package: payData.package,
      signType: payData.signType,
      paySign: payData.paySign,
      success(res) {
        resolve(res)
      },
      fail(err) {
        uni.showToast({
          title: "支付失败，请重新尝试",
          icon: "none"
        });
        reject(err)
      }
    });
  })
}

// 更改时间格式
// type:'date'--返回日期；'time'--返回日期+时间; 's'--日期+时间+秒
export function editTime(time, type = 'date') {

  let newTime = ''
  if (type === 'time') {
    newTime = time.substr(0, time.lastIndexOf(':'))
    newTime = newTime.replace('T', ' ')
  }
  if (type === "date") {
    newTime = time.substr(0, time.lastIndexOf('T'))
  }
  if (type === "s") {
    newTime = time.substr(0, time.lastIndexOf('.'))
    newTime = newTime.replace('T', ' ')
  }
  return newTime;
}

// 更改图片展示，判断是否带链接图片
export function autoImg(img) {
  if (img.indexOf('http') === -1) {
    return filePath + img
  }
  return img;
}
/**
 * JS获取距当前时间差
 * 
 * @param int time JS毫秒时间戳
 *
 */
var dateUtils = {
	UNITS: {
		'年': 31557600000,
		'月': 2629800000,
		'天': 86400000,
		'小时': 3600000,
		'分钟': 60000,
		'秒': 1000
	},
	humanize: function (milliseconds) {
		var humanize = '';
		for (var key in this.UNITS) {
			if (milliseconds >= this.UNITS[key]) {
				humanize = Math.floor(milliseconds / this.UNITS[key]) + key + '前';
				break;
			}
		}
		return humanize || '刚刚';
	},
	format: function (dateStr) {
		var date = this.parse(dateStr)
		var diff = Date.now() - date.getTime();
		if (diff < this.UNITS['天']) {
			return this.humanize(diff);
		}
		var _format = function (number) {
			return (number < 10 ? ('0' + number) : number);
		};
		return date.getFullYear() + '-' + _format(date.getMonth() + 1) + '-' + _format(date.getDay()) + ' ' +
			_format(date.getHours()) + ':' + _format(date.getMinutes())+':'+_format(date.getSeconds());
	},
	parse: function (str) { //将"yyyy-mm-dd HH:MM:ss"格式的字符串，转化为一个Date对象
		var a = str.split(/[^0-9]/);
		return new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
	}
};
export function get_time_diff(time) {
  var diff = '';
  var time_diff = new Date().getTime() - time;
  // 计算相差天数  
  var days = Math.floor(time_diff / (24 * 3600 * 1000));
  if (days > 0) {
    return diff += days + '天';
  }
  // 计算相差小时数  
  var leave1 = time_diff % (24 * 3600 * 1000);
  var hours = Math.floor(leave1 / (3600 * 1000));
  if (hours > 0) {
    return diff += hours + '小时';
  } else {
    if (diff !== '') {
      return diff += hours + '小时';
    }
  }
  // 计算相差分钟数  
  var leave2 = leave1 % (3600 * 1000);
  var minutes = Math.floor(leave2 / (60 * 1000));
  if (minutes > 0) {
    return diff += minutes + '分钟';
  } else {
    if (diff !== '') {
      return diff += minutes + '分钟';
    }
  }
  // 计算相差秒数  
  var leave3 = leave2 % (60 * 1000);
  var seconds = Math.round(leave3 / 1000);
  if (seconds == 0) {
    return diff = '刚刚';
  } else if (seconds > 0) {
    return diff += seconds + '秒';
  } else {
    if (diff !== '') {
      return diff += seconds + '秒';
    }
  }

  return diff;
}

export function goUrl(url){
  uni.navigateTo({
    url
  })
}

//产生不相同的字符串
export function CreatOnlyVal() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}