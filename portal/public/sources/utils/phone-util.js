/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2019/1/11.
 */

let callcenter = require('callcenter-sdk-client');
let CallcenterClient = callcenter.client;
import {Button} from 'antd';
import commonMethodUtil from './common-method-util';
let callClient;
//电话系统类型
const PHONE_TYPES = {
    RONGLIAN: 'ronglian',//容联
    HUAWEI: 'huaiwei_callback',//华为
    EEFUNG: 'eefung_phone',//蚁坊
    ASTERISK: 'asterisk'
};
exports.PHONE_TYPES = PHONE_TYPES;

//初始化
exports.initPhone = function(user) {
    let org = commonMethodUtil.getOrganization();
    callClient = new CallcenterClient(org.id, user.user_name);
    callClient.init().then(() => {
        console.log('可以打电话了!');
    }, (error) => {
        console.log(error || '电话系统初始化失败了!');
    });
};

//是否是容联的电话系统
exports.isRongLianPhoneSystem = function() {
    if (callClient) {
        return callClient.getPhoneType() === PHONE_TYPES.RONGLIAN;
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
exports.ReleaseButton = ({callClient, tip}) => {
    if (callClient.needShowAnswerView()) {
        return <span>{tip},{Intl.get('common.yesno', '是否')}
            <Button className='call-operation-button'
                onClick={callClient.releaseCall.bind(callClient)}>{Intl.get('call.record.to.release', '挂断')}</Button>
        </span>;
    } else {
        return tip;
    }
};