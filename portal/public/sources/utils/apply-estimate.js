import {Link} from 'react-router-dom';
import userData from '../user-data';
const REJECT = {
    SUBSCRIBED: 0, //订阅
    UNSUBSCRIBED: 1//未订阅
};

//返回单个申请状态与错误信息
function getApplyState() {
    return new Promise((resolve) => {
        let userInfo = userData.getUserData();
        //所有的申请都需要进行邮箱验证
        //如果邮箱为空
        if(_.isEmpty(_.get(userInfo, 'email'))) {
            resolveResult({needBind: true}, resolve);
        } else {
            if(!_.has(userInfo, 'emailEnable')) { //如果没有enableEmail字段，发送ajax请求
                getUserInfo().then(data => {
                    userData.setUserData('emailEnable', data.emailEnable);
                    userData.setUserData('reject', data.reject);
                    let userInfo = userData.getUserData();
                    privilegeCheck(userInfo, resolve);
                });
            } else {
                privilegeCheck(userInfo, resolve);
            }
        }
    });
}

//检查是否需要激活邮箱或订阅邮箱
function privilegeCheck(userInfo, resolve) {
    let hasPrivilege = {};
    if(!_.get(userInfo, 'emailEnable')) { //如果emailEnable为false,则为没有激活邮箱
        hasPrivilege.needActive = true;
    } else if(_.isEqual(_.get(userInfo, 'reject'), REJECT.UNSUBSCRIBED)) { //如果没有订阅邮箱
        hasPrivilege.needSubscribe = true;
    }
    resolveResult(hasPrivilege, resolve);
}

function resolveResult(hasPrivilege, resolve) {
    //通过hasPrivilege向前端渲染返回信息
    //如果都有
    if(_.isEmpty(hasPrivilege)) {
        resolve({
            applyPrivileged: true,
        });
    } else {//如果未激活或未绑定
        let applyMessage = getApplyMessage(hasPrivilege);
        resolve({
            applyPrivileged: false,
            applyMessage: applyMessage,
        });
    }
}

//获取用户信息
function getUserInfo() {
    return new Promise((resolve, reject) => {
        let user_id = userData.getUserData().user_id;
        $.ajax({
            url: '/rest/user_info/' + user_id,
            dataType: 'json',
            type: 'get',
            success: function(data) {
                resolve(data);
            },
            error: function() {
                reject();
            }
        });
    });
}

//获取返回的错误信息jsx
function getApplyMessage(hasPrivilege) {
    let userInfoUrl = '/user_info_manage/user_info';
    let errorMsg = null;
    if (_.get(hasPrivilege, 'needActive')) {
        errorMsg = (<ReactIntl.FormattedMessage
            id={'apply.error.active'}
            className="apply-error-text"
            defaultMessage={Intl.get('apply.error.active', '您还没有激活邮箱，请先{activeEmail}')}
            values={{'activeEmail': <Link to={userInfoUrl}>{Intl.get('apply.active.email.tips', '激活邮箱')}</Link>}}
        />);

    } else if (_.get(hasPrivilege, 'needBind')) {
        errorMsg = (<ReactIntl.FormattedMessage
            id={'apply.error.bind'}
            className="apply-error-text"
            defaultMessage={Intl.get('apply.error.bind', '您还没有绑定邮箱，请先{bindEmail}')}
            values={{'bindEmail': <Link to={userInfoUrl}>{Intl.get('apply.bind.email.tips', '绑定邮箱')}</Link>}}
        />);
    } else if(_.get(hasPrivilege, 'needSubscribe')) {
        errorMsg = (<ReactIntl.FormattedMessage
            id={'apply.error.subscribe'}
            className="apply-error-text"
            defaultMessage={Intl.get('apply.error.subscribe', '您还没有订阅邮件提醒, 请先{subscribe}')}
            values={{'subscribe': <Link to={userInfoUrl}>{Intl.get('apply.subscribe.email.tip', '订阅')}</Link>}}
        />);
    }
    return (
        <span className="apply-error-tip">
            <span className="iconfont icon-warn-icon"></span>
            <span className="apply-error-text">
                {errorMsg}
            </span>
        </span>
    );
}


export {getApplyState};