require('./sources/dependence');
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import phonePrivilegConst from './privilege-const';
var userData = require('./sources/user-data');
var AppStarter = require('./sources/app-starter');
var PrivilegeGet = require('./sources/privilege-get');
var PrivilegeGetReact = null;
var appDom = $('#app')[0];
let phoneUtil = require('PUB_DIR/sources/utils/phone-util');
let commonDataUtil = require('PUB_DIR/sources/utils/common-data-util');

function hideLoading(errorTip) {
    if (PrivilegeGetReact) {
        let logoutTime = 3;
        PrivilegeGetReact.setState({
            isLoading: false,
            needLogout: loginTime >= 1,
            errorTip: errorTip,
            logoutTime: logoutTime
        });
        //跳转到登录页，倒计时3秒的处理
        setInterval(function() {
            if (logoutTime > 0) {
                logoutTime--;
            }
            PrivilegeGetReact.setState({
                logoutTime: logoutTime
            });
        }, 1000);
    }
}

function unmountPrivilegeGet() {
    if (PrivilegeGetReact) {
        ReactDOM.unmountComponentAtNode(appDom);
    }
}

var loginTime = 0;

//去掉react的警告(开发模式留着)
function suppressWarnings() {
    var loc = window.location.href;
    if (!/localhost|127\.0\.0\.1|192\.168\./.test(loc)) {
        // eslint-disable-next-line no-console
        console.warn = function() {
        };
    }
}

function getUserPrivilegeAndStart() {
    loginTime++;

    unmountPrivilegeGet();

    PrivilegeGetReact = ReactDOM.render(
        <PrivilegeGet retry={getUserPrivilegeAndStart}></PrivilegeGet>,
        appDom
    );

    userData.getUserDataByAjax().done(function() {
        //全局设置moment的语言环境
        moment.locale(Oplate.lang);
        unmountPrivilegeGet();
        suppressWarnings();
        const user = userData.getUserData();
        commonDataUtil.getAreaInfoAll();
        commonDataUtil.getGuideConfig();
        commonDataUtil.getUserPosition();
        AppStarter.init({
            goIndex: false
        });
        //有打电话的权限才初始化电话系统
        if(hasPrivilege(phonePrivilegConst.PHONE_ACCESS_CALL_OU)){
            phoneUtil.initPhone(user);
        }
        //启动socketio接收数据
        !Oplate.hideSomeItem && require('./sources/push').startSocketIo();
    }).fail(function(errorTip) {
        //错误处理
        hideLoading(errorTip);
    });
}

getUserPrivilegeAndStart();
