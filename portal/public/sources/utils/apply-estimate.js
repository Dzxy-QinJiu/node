import {Link} from 'react-router-dom';
import userData from '../user-data';
import {CC_INFO} from 'PUB_DIR/sources/utils/consts';

//返回单个申请状态与错误信息
function getApplyState(applyType) {
    return new Promise((resolve) => {
        let userInfo = userData.getUserData();
        //判断是否有抄送权限
        let hasPrivilege = hasCCPrivilege(applyType);
        if(!hasPrivilege) {
            resolve({
                isApplyButtonShow: false,
            });
        } else {
            //如果邮箱为空
            if(_.isEmpty(_.get(userInfo, 'email'))) {
                hasPrivilege.needBind = true;
            } else if(!_.has(userInfo, 'emailEnable')) { //如果没有enableEmail字段，发送ajax请求
                getUserInfo().then(emailEnable => {
                    userData.setUserData('emailEnable', emailEnable);
                    if(!emailEnable) {
                        hasPrivilege.needActive = true;
                    }
                });
            } else if(!_.get(userInfo, 'emailEnable')) { //如果enableEnable为false
                hasPrivilege.needActive = true;
            }

            //通过hasPrivilege向前端渲染返回信息
            //如果都有
            if(_.isEmpty(hasPrivilege)) {
                resolve({
                    isApplyButtonShow: true,
                    applyPrivileged: true,
                });
            } else {//如果未激活或未绑定
                let applyMessage = getApplyMessage(hasPrivilege);
                resolve({
                    isApplyButtonShow: true,
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
                resolve(data.emailEnable);
            },
            error: function() {
                reject();
            }
        });
    });
}

//获取用户是否有抄送权限
function hasCCPrivilege(applyType) {
    let workFlowConfigs = userData.getUserData().workFlowConfigs;
    //获取申请类型的config
    let ccInfo = _.filter(workFlowConfigs, config => _.isEqual(config.type, applyType))[0];
    let privilegedType = [CC_INFO.APPLY_AND_APPROVE, CC_INFO.APPROVE];
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