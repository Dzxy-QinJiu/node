import {Link} from 'react-router-dom';
import userData from '../user-data';
import {CC_INFO, APPLY_TYPE} from 'PUB_DIR/sources/utils/consts';
const REJECT = {
    SUBSCRIBED: 0, //订阅
    UNSUBSCRIBED: 1//未订阅
};

//返回单个申请状态与错误信息
function getApplyState(applyType) {
    return new Promise((resolve) => {
        let userInfo = userData.getUserData();
        //判断是否需要抄送
        let ccResult = canUserCC(applyType);
        if(!ccResult) {
            resolve({
                applyPrivileged: true,
            });
        } else {
            let hasPrivilege = {};
            //如果邮箱为空
            if(_.isEmpty(_.get(userInfo, 'email'))) {
                hasPrivilege.needBind = true;
            } else if(!_.has(userInfo, 'emailEnable')) { //如果没有enableEmail字段，发送ajax请求
                getUserInfo().then(data => {
                    userData.setUserData('emailEnable', data.emailEnable);
                    userData.setUserData('reject', data.reject);
                    if(!data.emailEnable) {
                        hasPrivilege.needActive = true;
                    }
                    if(_.isEqual(data.reject, REJECT.UNSUBSCRIBED)) {
                        hasPrivilege.needSubscribe = true;
                    }
                });
            } else if(!_.get(userInfo, 'emailEnable')) { //如果enableEnable为false
                hasPrivilege.needActive = true;
            } else if(_.isEqual(_.get(userInfo, 'reject'), REJECT.UNSUBSCRIBED)) { //如果没有订阅邮箱
                hasPrivilege.needSubscribe = true;
            }

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
    });
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

//获取用户是否需要抄送
function canUserCC(applyType) {
    let workFlowConfigs = userData.getUserData().workFlowConfigs;
    //获取申请类型的config
    let ccInfo = _.filter(workFlowConfigs, config => _.isEqual(config.type, applyType))[0];
    let privilegedType = [CC_INFO.APPLY_AND_APPROVE, CC_INFO.APPROVE];
    //如果是用户申请，无论type为什么都需要判断是否有邮箱
    if(_.isEqual(applyType, APPLY_TYPE.USER_APPLY)) {
        return true;
    }
    //其他类型按照正常判断方式判断
    if(_.includes(privilegedType, _.get(ccInfo, 'applyRulesAndSetting.ccInformation'))) {
        return true;
    } else {
        return false;
    }
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