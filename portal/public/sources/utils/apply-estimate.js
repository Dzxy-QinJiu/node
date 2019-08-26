import {Link} from 'react-router-dom';
import userData from '../user-data';
import {CC_INFO, APPLY_TYPE} from 'PUB_DIR/sources/utils/consts';
let applyStates = [];
//获取所有的申请状态与错误信息
function getAllApplyStates() {
    return new Promise((resolve, reject) => {
        applyStates.splice(0,applyStates.length);
        getUserInfo().then(userInfo => {
            let privilegedType = [CC_INFO.APPROVE, CC_INFO.APPLY_AND_APPROVE];
            //对每个type进行筛选，将返回参数push进applySates数组中
            userInfo.email = '';
            _.each(userInfo.ccInfoList, ccInfo => {
                //检查是否有抄送权限
                let hasEmailPrivilege = _.indexOf(privilegedType, ccInfo.ccInfo) !== -1;
                //如果有抄送权限，检查是否激活邮箱或者已经绑定邮箱
                if(hasEmailPrivilege) {
                    let hasPrivilege = {};
                    if(_.isEmpty(_.get(userInfo, 'email'))) {
                        hasPrivilege.needBind = true;
                    } else if(_.isEmpty(_.get(userInfo, 'emailEnable'))) {
                        hasPrivilege.needActive = true;
                    }
                    //如果都拥有
                    if(_.isEmpty(hasPrivilege)) {
                        applyStates.push({
                            isApplyButtonShow: true,
                            applyPrivileged: true,
                            ...ccInfo
                        });
                    } else {//如果未绑定或未激活
                        let applyMessage = getApplyMessage(hasPrivilege);
                        applyStates.push({
                            isApplyButtonShow: true,
                            applyPrivileged: false,
                            applyMessage: applyMessage,
                            ...ccInfo
                        });
                    }
                } else { //如果没有权限
                    applyStates.push({
                        isApplyButtonShow: false,
                        ...ccInfo
                    });
                }
            });
            resolve(applyStates);
        }, () => {
            reject();
        });
    });
}

//返回单个申请状态与错误信息
function getApplyState(applyType) {
    return new Promise((resolve) => {
        if (_.isEmpty((applyStates))) {
            getAllApplyStates().then((applyStates) => {
                resolve(_.filter(applyStates, (applyState) => _.isEqual(applyState.type, applyType))[0]);
            });
        } else {
            resolve(_.filter(applyStates, (applyState) => _.isEqual(applyState.type, applyType))[0]);
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
                let userInfo = {
                    email: data.email,
                    emailEnable: data.emailEnable,
                    ccInfoList: getCCInfo()
                };
                resolve(userInfo);
            },
            error: function() {
                reject();
            }
        });
    });
}

//获取用户抄送的权限
function getCCInfo() {
    let ccInfoList = [];
    let workFlowConfigs = userData.getUserData().workFlowConfigs;
    _.each(workFlowConfigs, item => {
        let type = _.get(item, 'type');
        if(_.includes(APPLY_TYPE, type)) {
            ccInfoList.push({
                type: type,
                ccInfo: _.get(item, 'applyRulesAndSetting.ccInformation')
            });
        }
    });
    return ccInfoList;
}

//获取返回的错误信息jsx
function getApplyMessage(hasPrivilege) {
    let messageTip = {};
    let userInfoUrl = '/user_info_manage/user_info';
    if (_.get(hasPrivilege, 'needActive')) {
        messageTip.defaultMessageId = 'apply.error.active';
        messageTip.defaultMessage = Intl.get('apply.error.active', '您还没有激活邮箱，请先{activeEmail}');
        messageTip.values = {
            'activeEmail': <Link to={userInfoUrl}>{Intl.get('apply.active.email.tips', '激活邮箱')}</Link>
        };
    } else if (_.get(hasPrivilege, 'needBind')) {
        messageTip.defaultMessageId = 'apply.error.bind';
        messageTip.defaultMessage = Intl.get('apply.error.bind', '您还没有绑定邮箱，请先{bindEmail}');
        messageTip.values = {
            'bindEmail': <Link to={userInfoUrl}>{Intl.get('apply.bind.email.tips', '绑定邮箱')}</Link>
        };
    }
    return (
        <span className="apply-error-tip">
            <span className="iconfont icon-warn-icon"></span>
            <span className="apply-error-text">
                <ReactIntl.FormattedMessage
                    id={messageTip.defaultMessageId}
                    className="apply-error-text"
                    defaultMessage={messageTip.defaultMessage}
                    values={messageTip.values}/>
            </span>
        </span>);
}


export {getApplyState};