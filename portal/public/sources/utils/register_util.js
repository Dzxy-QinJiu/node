//不要抽到别的文件中去，因为服务器端的注册页面会用，抽到别的文件中如果引用其他的文件，可能会报错
var wx = require('weixin-js-sdk');
exports.pcAndWechatMiniProgram = function(hrefUrl,isRegistry) {
    if (isWxEnvironment()) {//是在小程序包裹的web-view中的退出处理
        $.ajax({
            url: '/logout',
            dataType: 'json',
            type: 'get',
            data: {isWechatLogout: true},
        });
        if(isRegistry === true){
            wx.miniProgram.redirectTo({url: '/pages/login/index'});
        }else{
            wx.miniProgram.navigateBack();
        }
    } else {
        window.location.href = hrefUrl;
    }
};
//是否是小程序包裹的web-view
function isWxEnvironment(){
    return window && window.__wxjs_environment === 'miniprogram';
}
exports.isWxEnvironment = isWxEnvironment;