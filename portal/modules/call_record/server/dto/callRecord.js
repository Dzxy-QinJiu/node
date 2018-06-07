/**
 * Created by wangliping on 2016/2/22.
 * 通话记录的转换
 */

exports.toFrontObject = function(restObject) {
    var frontObj = {};
    frontObj.id = restObject.id;
    frontObj.nickName = restObject.nick_name || '';//呼叫者（打电话的人）
    frontObj.teamName = restObject.team_name || '';//团队名称
    frontObj.callNumber = restObject.dst || '';//呼叫号码
    frontObj.holdingTime = restObject.billsec || 0;//通话时间
    frontObj.callDate = restObject.call_date || 0;//打电话的时间
    // 通话状态：ANSWERED-已接听；NO ANSWER-未接听；BUSY-用户忙
    frontObj.callState = restObject.disposition || '';
    frontObj.customerName = restObject.customer_name || '';//客户
    frontObj.contactName = restObject.contact_name || '';//被呼叫者（联系人）
    frontObj.addTime = restObject.add_time || 0;//通话记录添加时间
    return frontObj;
};
