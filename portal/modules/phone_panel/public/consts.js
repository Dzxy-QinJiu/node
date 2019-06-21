/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/5/29.
 */
export const PHONERINGSTATUS = {
    //对方已振铃
    ALERT: 'ALERT',
    //对方已应答
    ANSWERED: 'ANSWERED',
    phone: 'phone',//eefung的电话系统通话结束后，后端推送过来的最后一个状态（销售、管理员打电话）
    curtao_phone: 'curtao_phone',//容联电话系统，通话结束后，后端推送过来的最后一个状态（销售、管理员打电话）
    call_back: 'call_back'//通话结束后，运营人员的回访电话，后端推送过来的最后一个状态
};
export const commonPhoneDesArray = [
    Intl.get('call.record.state.no.answer', '未接听'),
    Intl.get('phone.status.other.hang.out', '对方挂断'),
    Intl.get('phone.status.contact.later', '联系人现在不在，之后再联系')
];
export const cluePhoneDesArray = [
    Intl.get('call.record.state.no.answer', '未接听'),
    Intl.get('phone.call.error.tip', '电话号码错误！'),
    Intl.get('apply.phone.close', '手机关机')
];
//挂断电话时推送过来的通话状态，phone：私有呼叫中心（目前有：eefung长沙、济南的电话系统），curtao_phone: 客套呼叫中心（目前有: eefung北京、合天的电话系统）, call_back:回访
export const HANG_UP_TYPES = [PHONERINGSTATUS.phone, PHONERINGSTATUS.curtao_phone, PHONERINGSTATUS.call_back];
