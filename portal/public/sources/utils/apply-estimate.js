import {Link} from 'react-router-dom';
import userData from '../user-data';
import {CC_INFO, APPLY_TYPE} from 'PUB_DIR/sources/utils/consts';
let applyStates = [];
//获取所有的申请状态与错误信息
function getAllApplyStates() {
    return new Promise((resolve, reject) => {
        applyStates.splice(0,applyStates.length);
        getUserInfo().then(userInfo => {
            let hasPrivilege = {};
            let privilegedType = [CC_INFO.APPROVE, CC_INFO.APPLY_AND_APPROVE];
            //对每个type进行筛选，将返回参数push进applySates数组中
            _.each(userInfo.ccInfoList, ccInfo => {
                //检查是否有抄送权限
                let hasEmailPrivilege = _.indexOf(privilegedType, ccInfo.ccInfo) !== -1;
                if(hasEmailPrivilege) {
                    if(!_.get(userInfo, 'email')) {
                        hasPrivilege.needBind = true;
                    } else if(!_.get(userInfo, 'emailEnable')) {
                        hasPrivilege.needActive = true;
                    }
                    let applyMessage = getApplyMessage(hasPrivilege);
                    if(_.isEmpty(applyMessage)) {
                        applyStates.push({
                            isApplyButtonShow: true,
                            applyPrivileged: true,
                            ...ccInfo
                        });
                    } else {
                        applyStates.push({
                            isApplyButtonShow: true,
                            applyPrivileged: false,
                            applyMessage: applyMessage,
                            ...ccInfo
                        });
                    }
                } else {
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
    let applyMessage = null;
    let messageTip = {
        defaultMessageId: '',
        defaultMessage: '',
        linkMessage: ''
    };
    if(_.get(hasPrivilege, 'needActive')) {
        messageTip.defaultMessageId = 'apply.error.active';
        messageTip.defaultMessage = Intl.get('apply.error.active', '您还没有激活邮箱，请先{activeEmail}');
        messageTip.linkMessage = '';
        applyMessage = (<span className="apply-error-tip">
            <span className="iconfont icon-warn-icon"></span>
            <span className="apply-error-text">
                <ReactIntl.FormattedMessage
                    id="apply.error.active"
                    defaultMessage={'您还没有激活邮箱，请先{activeEmail}'}
                    values={{
                        'activeEmail': <Link to="/user_info_manage/user_info"><ReactIntl.FormattedMessage id="apply.active.email.tips" defaultMessage="激活邮箱"/></Link>
                    }}/>
            </span>
        </span>);
    } else if(_.get(hasPrivilege, 'needBind')) {
        applyMessage = (<span className="apply-error-tip">
            <span className="iconfont icon-warn-icon"></span>
            <span className="apply-error-text">
                <ReactIntl.FormattedMessage
                    className="apply-error-text"
                    id="apply.error.bind"
                    defaultMessage={'您还没有绑定邮箱，请先{bindEmail}'}
                    values={{
                        'bindEmail': <Link to="/user_info_manage/user_info"><ReactIntl.FormattedMessage id="apply.bind.email.tips" defaultMessage="绑定邮箱"/></Link>
                    }}/>
            </span>
        </span>);
    }
    return applyMessage;
}


export {getApplyState};