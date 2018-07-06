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
    phone: 'phone',//通话结束后，后端推送过来的最后一个状态（销售、管理员打电话）
    call_back: 'call_back'//通话结束后，运营人员的回访电话，后端推送过来的最后一个状态
};
export const commonPhoneDesArray = [
    Intl.get('call.record.state.no.answer', '未接听'),
    Intl.get('phone.status.other.hang.out', '对方挂断'),
    Intl.get('phone.status.contact.later', '联系人现在不在，之后再联系')
];
