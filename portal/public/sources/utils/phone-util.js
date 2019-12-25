/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2019/1/11.
 */

let callcenter = require('callcenter-sdk-client');
let CallcenterClient = callcenter.client;
import {Button} from 'antd';
import commonMethodUtil from './common-method-util';
import {phoneEmitter} from './emitters';
// import DialUpKeyboard from 'CMP_DIR/dial-up-keyboard';
let callClient;
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
import {PHONE_NOT_SETTING_TIP} from './consts';
//初始化
exports.initPhone = function(user) {
    let org = commonMethodUtil.getOrganization();
    callClient = new CallcenterClient(org.id, user.user_id);
    callClient.init().then((phoneType) => {
        notificationEmitter.emit(notificationEmitter.PHONE_INITIALIZE, false);
        oplateConsts.SHOW_SET_PHONE_TIP = false;
        console.log('可以打电话了!');
        commonMethodUtil.setExclusiveNumber(phoneType);
        phoneEmitter.emit(phoneEmitter.CALL_CLIENT_INITED, {phoneType});
    }, (error) => {
        //未绑定坐席号和获取坐席号失败都会走到error里面，只能根据error的内容进行判断
        if (error === PHONE_NOT_SETTING_TIP){
            oplateConsts.SHOW_SET_PHONE_TIP = true;
            notificationEmitter.emit(notificationEmitter.PHONE_INITIALIZE, true);
        }else{
            oplateConsts.SHOW_SET_PHONE_TIP = false;
            notificationEmitter.emit(notificationEmitter.PHONE_INITIALIZE, false);
        }
        console.log(error || '电话系统初始化失败了!');
    });
};

//是否是容联的电话系统
exports.isRongLianPhoneSystem = function() {
    if (callClient) {
        return callClient.needShowAnswerView();
    }
    return false;
};

//获取客户端
exports.getCallClient = function() {
    return callClient;
};

//卸载电话系统
exports.unload = function(func) {
    callClient && callClient.onbeforeunload(func);
};

//接听电话
function acceptCall() {
    callClient.acceptCall();
}

//渲染接听描述
exports.AcceptButton = ({callClient}) => {
    if (callClient.needShowAnswerView()) {
        return <span>
            {Intl.get('call.record.call.in.to.click', '有电话打入,请点击')}
            <Button className='call-operation-button'
                onClick={callClient.acceptCall.bind(callClient)}>{Intl.get('call.record.answer', '接听')} </Button>
        </span>;
    } else {
        return `${Intl.get('call.record.call.in.pick.phone', '有电话打入，请拿起话机')}`;
    }
};
//渲染挂断按钮
exports.ReleaseButton = ({callClient, tip, phoneNumber}) => {
    if (callClient.needShowAnswerView()) {
        return <span>{tip},{Intl.get('common.yesno', '是否')}
            {/*<DialUpKeyboard phoneNumber={phoneNumber}/>*/}
            <Button className='call-operation-button'
                onClick={callClient.releaseCall.bind(callClient)}>{Intl.get('call.record.to.release', '挂断')}</Button>
        </span>;
    } else {
        return tip;
    }
};

//退出登录，session超时，触发电话系统的退出
exports.logoutCallClient = () => {
    callClient && callClient.logout();
};