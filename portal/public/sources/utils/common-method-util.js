/**
 * 不同模块调用的公共方法
 * Created by wangliping on 2017/5/25.
 */
/**
 *获取递归遍历计算树形团队内的成员个数（与oplate中的计算组织成员个数的方法不同）
 * @param salesTeam: 计算成员个数的团队
 * @param teamMemberCount: 团队人数
 * @param teamMemberCountList: 所有团队成员人数统计列表[{team_id:xxx,available:{owner:xx,manager:xx,user:xx},total:xxx}]
 * @param filterManager: 是否过滤掉舆情秘书
 */
import TimeStampUtil from 'PUB_DIR/sources/utils/time-stamp-util';
// 根据权限，判断获取团队和成员时所传字段的值
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import userData from '../user-data';
import {SELECT_TYPE} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import {selectMenuList, APPLY_APPROVE_TYPES, DOCUMENT_TYPE, INTEGRATE_TYPES, REPORT_TYPE,APPLY_FINISH_STATUS, APPLY_USER_STATUS} from './consts';
var DateSelectorUtils = require('CMP_DIR/datepicker/utils');
var timeoutFunc;//定时方法
var timeout = 1000;//1秒后刷新未读数
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
import {ORGANIZATION_TYPE} from './consts';
import {getCallClient} from 'PUB_DIR/sources/utils/phone-util';

exports.getTeamMemberCount = function(salesTeam, teamMemberCount, teamMemberCountList, filterManager) {
    let curTeamId = salesTeam.group_id || salesTeam.key;//销售首页的是group_id，团队管理界面是key
    let teamMemberCountObj = _.find(teamMemberCountList, item => item.team_id === curTeamId);
    //该团队启用状态下的人数
    let availableObj = teamMemberCountObj && teamMemberCountObj.available ? teamMemberCountObj.available : {};
    if (availableObj.owner) {
        teamMemberCount += availableObj.owner;
    }
    //加上舆情秘书的个数统计（销售首页的团队人数统计中不计算舆情秘书）
    if (!filterManager && availableObj.manager) {
        teamMemberCount += availableObj.manager;
    }
    if (availableObj.user) {
        teamMemberCount += availableObj.user;
    }
    //子团队，团队管理界面是child_group，销售首页是children
    let childGroup = salesTeam.child_groups || salesTeam.children;
    //递归遍历子团队，加上子团队的人数
    if (_.isArray(childGroup) && childGroup.length > 0) {
        childGroup.forEach(team => {
            teamMemberCount = this.getTeamMemberCount(team, teamMemberCount, teamMemberCountList, filterManager);
        });
    }
    return teamMemberCount;
};
//判断录音文件是否以.WAV结尾
exports.checkWav = function(str) {
    var index = str.lastIndexOf('.WAV');
    if (index === -1) {
        return false;
    } else {
        return index + 4 === str.length;
    }
};
//返回录音url
exports.getAudioRecordUrl = function(itemLocal, itemRecord, phoneType) {
    //播放长沙，济南和北京的录音
    var local = 'changsha', audioType = '';
    if (itemLocal === 'jinan') {
        local = 'jinan';
    } else if (itemLocal === 'beijing') {
        local = 'beijing';
    }
    //是否是wav格式的文件
    if (this.checkWav(itemRecord)) {
        audioType = '';
    } else {
        audioType = '.mp3';
    }
    local = local ? local + '/' : '';
    //如果是录音类型是app类型的
    if (phoneType === 'app') {
        return '/record/app/' + itemRecord + audioType;
    } else {
        return '/record/' + local + itemRecord + audioType;
    }
};
//去除json对象中的空白项
const removeEmptyItem = function(obj) {
    _.each(obj, (v, k) => {
        if (v === '') delete obj[k];
        if (_.isArray(v)) {
            _.each(v, (subv) => {
                if (subv === '') delete obj[k];
                else if (_.isObject(subv)) {
                    removeEmptyItem(subv);
                    if (Object.keys(subv).length === 0) delete obj[k];
                }
            });
        }
    });
};
exports.removeEmptyItem = removeEmptyItem;


exports.getParamByPrivilege = function() {
    let reqData = {};
    if (hasPrivilege('GET_TEAM_LIST_ALL') || hasPrivilege('GET_TEAM_MEMBERS_ALL')) {
        reqData.type = 'all';
    } else if (hasPrivilege('GET_TEAM_LIST_MYTEAM_WITH_SUBTEAMS') || hasPrivilege('GET_TEAM_MEMBERS_MYTEAM_WITH_SUBTEAMS')) {
        reqData.type = 'self';
    }
    return reqData;
};
//是否通过两项必填一项的验证
exports.validateRequiredOne = function(item1, item2) {
    item1 = _.trim(item1);
    item2 = _.trim(item2);
    if (item1 || item2) {
        //通过必填一项的验证
        return true;
    } else {//联系人姓名和部门都为空
        return false;
    }
};
exports.getRelativeTime = function(time) {
    var relativeTime = '';
    var todayStartTime = TimeStampUtil.getTodayTimeStamp().start_time;
    var todayEndTime = TimeStampUtil.getTodayTimeStamp().end_time;
    if (time >= todayStartTime && time <= todayEndTime) {
        relativeTime = Intl.get('user.time.today', '今天');
    } else if (time >= todayStartTime - 1 * oplateConsts.ONE_DAY_TIME_RANGE && time <= todayEndTime - 1 * oplateConsts.ONE_DAY_TIME_RANGE) {
        relativeTime = Intl.get('user.time.yesterday', '昨天');
    } else if (time >= todayStartTime - 2 * oplateConsts.ONE_DAY_TIME_RANGE && time <= todayEndTime - 2 * oplateConsts.ONE_DAY_TIME_RANGE) {
        relativeTime = Intl.get('sales.frontpage.before.yesterday', '前天');
    } else if (time >= todayStartTime + 1 * oplateConsts.ONE_DAY_TIME_RANGE && time <= todayEndTime + 1 * oplateConsts.ONE_DAY_TIME_RANGE) {
        relativeTime = Intl.get('sales.frontpage.tomorrow', '明天');
    } else if (time >= todayStartTime + 2 * oplateConsts.ONE_DAY_TIME_RANGE && time <= todayEndTime + 2 * oplateConsts.ONE_DAY_TIME_RANGE) {
        relativeTime = Intl.get('sales.frontpage.after.tomorrow', '后天');
    } else {
        relativeTime = moment(time).format(oplateConsts.DATE_FORMAT);
    }
    return relativeTime;
};
//对数字进行四舍五入保留n位小数的方法
exports.formatRoundingData = function(data, n) {
    if (isNaN(data)) {
        return '-';
    } else {
        //均保留n位小数
        return data.toFixed(n);
    }
};

//有小数才四舍五入保留n位小数，四舍五入后是整数的直接去掉小数
exports.formatNumHasDotToFixed = function(num, n) {
    num = num + '';
    if (isNaN(num)) {
        return '-';
    } else {
        //有小数的数字，四舍五入保留n位小数
        if (num.split('.').length > 1) {
            num = (+num).toFixed(n);
            let numArray = num.split('.');
            //小数部分为0时，直接去掉小数
            if (+numArray[1] === 0) {
                num = numArray[0];
            }
        }
        return +num;
    }
};

//把数字转化成百分数，并进行四舍五入保留n位小数的方法
exports.formatRoundingPercentData = function(data, n) {
    if (isNaN(data)) {
        return '-';
    } else {
        //小数格式转化为百分比
        data = data * 100;
        var nData = n ? n : 2;
        //均保留两位小数
        return data.toFixed(nData);
    }
};
//比较两个数组中元素是否有不同的
exports.isDiffOfTwoArray = function(array1, array2) {
    // 返回来自array1，并且不存在于array2的数组
    let diff1 = _.difference(array1, array2);
    // 返回来自array2，并且不存在于array1的数组
    let diff2 = _.difference(array2, array1);
    //俩数组任何一个有不同，都说明俩数组中有不同的值存在
    return diff1.length || diff2.length;
};

//转译html标签
exports.encodeHTML = function(html) {
    var temp = document.createElement('div');
    (temp.textContent != null) ? (temp.textContent = html) : (temp.innerText = html);
    var output = temp.innerHTML;
    temp = null;
    return output;
};
//反译html标签
exports.decodeHTML = function(text) {
    var temp = document.createElement('div');
    temp.innerHTML = text;
    var output = temp.innerText || temp.textContent;
    temp = null;
    return output;
};
//使用分析组件时，获取组件状态的函数
exports.getResultType = function(isLoading, isError) {
    var resultType = '';
    if (isLoading) {
        resultType = 'loading';
    } else if (isError) {
        resultType = 'error';
    } else {
        resultType = 'success';
    }
    return resultType;
};
//获取数据失败及重试方法
exports.getErrorTipAndRetryFunction = function(errTip, callback) {
    var errMsg = errTip ? errTip : Intl.get('contract.111', '获取数据失败');
    if (_.isFunction(callback)) {
        return (
            <span>{errMsg},<a onClick={callback}>{Intl.get('user.info.retry', '请重试')}</a></span>
        );
    } else {
        return (
            <span>{errMsg}</span>
        );
    }
};
//去掉数组中元素的回车和空格,然后对数组进行去重
exports.removeSpacesAndEnter = function(dataArr) {
    dataArr.forEach((item, index) => {
        dataArr[index] = _.trim(item.replace(/[\r\n]/g, ''));
    });
    return _.uniq(dataArr);
};

/**
 * 递归遍历团队树
 * @param treeList 要遍历的团队树，
 * @param list 遍历出的所有团队的列表
 * @param flag 把root_group，parent_group等信息也返回回去
 */
function traversingTeamTree(treeList, list, flag) {
    if (_.isArray(treeList) && treeList.length) {
        _.each(treeList, team => {
            var childObj = {group_id: team.group_id, group_name: team.group_name};
            if (flag){
                childObj.parent_group = team.parent_group;
                childObj.user_ids = team.user_ids;
                childObj.owner_id = team.owner_id;
                childObj.manager_ids = team.manager_ids;
            }
            list.push(childObj);
            if (team.child_groups) {
                traversingTeamTree(team.child_groups, list, flag);
            }
        });
    }
}

//遍历团队树
exports.traversingTeamTree = traversingTeamTree;

//不能选今天之前的时间
exports.disabledBeforeToday = function(current) {
    return current && current < moment().subtract(1, 'days').endOf('day');
};

/**
 * 递归获取要传到后端的所有团队id的数组
 * @param teamTotalArr 跟据所选的id取得的包含下级团队的团队详情列表
 * */
function getRequestTeamIds(teamTotalArr) {
    let totalRequestTeams = [];
    _.each(teamTotalArr, (team) => {
        if (_.indexOf(totalRequestTeams, team.group_id) === -1) {
            totalRequestTeams.push(team.group_id);
        }
        if (team.child_groups) {
            totalRequestTeams = _.union(totalRequestTeams, getRequestTeamIds(team.child_groups));
        }
    });
    return totalRequestTeams;
}
exports.getRequestTeamIds = getRequestTeamIds;

/**
 * 递归遍历取出已选的团队列表(带下级团队)
 * @param teamTreeList 所有团队的团队树
 * @param selectedTeams 实际选中的团队的id列表
 * */
function traversingSelectTeamTree(teamTreeList, selectedTeams) {
    let teamTotalArr = [];
    if (_.isArray(teamTreeList) && teamTreeList.length) {
        _.each(teamTreeList, team => {
            if (selectedTeams === team.group_id) {
                teamTotalArr.push(team);
            } else if (team.child_groups) {
                teamTotalArr = _.union(teamTotalArr, traversingSelectTeamTree(team.child_groups, selectedTeams));
            }
        });
    }
    return teamTotalArr;
}
exports.traversingSelectTeamTree = traversingSelectTeamTree;


//不同状态的线索描述
exports.getClueStatus = function(status) {
    var statusDes = '';
    switch (status) {
        case '0':
            statusDes = Intl.get('clue.customer.will.distribution', '待分配');
            break;
        case '1':
            statusDes = Intl.get('sales.home.will.trace', '待跟进');
            break;
        case '2':
            statusDes = Intl.get('clue.customer.has.follow', '已跟进');
            break;
    }
    return statusDes;
};
exports.renderClueStatus = function(status) {
    var statusDes = '';
    switch (status) {
        case '0':
            statusDes = <span
                className="clue-stage will-distribute">{Intl.get('clue.customer.will.distribution', '待分配')}</span>;
            break;
        case '1':
            statusDes =
                <span className="clue-stage has-distribute">{Intl.get('sales.home.will.trace', '待跟进')}</span>;
            break;
        case '2':
            statusDes =
                <span className="clue-stage has-follow">{Intl.get('clue.customer.has.follow', '已跟进')}</span>;
            break;
    }
    return statusDes;
};
//获取线索未处理的权限
//只有是管理员或者销售领导或者銷售才有展示线索未读数的权限
//管理员，销售，运营人员有获取线索列表的权限，但是运营人员不用展示线索未处理数
exports.getClueUnhandledPrivilege = function() {
    return (hasPrivilege('CUSTOMERCLUE_QUERY_FULLTEXT_MANAGER') || hasPrivilege('CUSTOMERCLUE_QUERY_FULLTEXT_USER')) && !userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
};
//获取线索未读数的参数
exports.getUnhandledClueCountParams = function() {
    let status = '';
    //如果是域管理员，展示待分配的线索数量
    if (userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN)) {
        status = SELECT_TYPE.WILL_DISTRIBUTE;
    } else {
        //销售领导和销售展示待跟进的线索数量
        status = SELECT_TYPE.WILL_TRACE;
    }
    var data = {
        typeFilter: JSON.stringify({status: status}),
        rangeParams: JSON.stringify([{//时间范围参数
            from: moment('2010-01-01 00:00:00').valueOf(),//开始时间设置为2010年
            to: moment().valueOf(),
            type: 'time',
            name: 'source_time'
        }]),
    };
    return data;
};
//获取不同时间范围的开始和结束时间
exports.getStartEndTimeOfDiffRange = function(timeRange, disableDateAfterToday) {
    var timeObj = {};
    switch (timeRange) {
        case 'day':
            timeObj = DateSelectorUtils.getTodayTime();
            break;
        case 'week':
            timeObj = DateSelectorUtils.getThisWeekTime(disableDateAfterToday);
            break;
        case 'month':
            timeObj = DateSelectorUtils.getThisMonthTime(disableDateAfterToday);
            break;
        case 'quarter':
            timeObj = DateSelectorUtils.getThisQuarterTime(disableDateAfterToday);
            break;
        case 'year':
            timeObj = DateSelectorUtils.getThisYearTime(disableDateAfterToday);
            break;
        default:
            timeObj = DateSelectorUtils.getTodayTime();
            break;
    }
    return timeObj;
};
exports.getApplyStateText = function(obj) {
    if (obj.status === 'pass') {
        return Intl.get('user.apply.pass', '已通过');
    } else if (obj.status === 'reject') {
        return Intl.get('user.apply.reject', '已驳回');
    } else if (obj.status === 'cancel') {
        return Intl.get('user.apply.backout', '已撤销');
    }else {
        return Intl.get('user.apply.false', '待审批');
    }
};
exports.getTimeStr = function(d, format) {
    d = parseInt(d);
    if (isNaN(d)) {
        return '';
    }
    return moment(new Date(d)).format(format || oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT);
};
exports.getApplyTopicText = function(obj) {
    if (obj.topic === APPLY_APPROVE_TYPES.CUSTOMER_VISIT) {
        return Intl.get('leave.apply.add.leave.apply', '出差申请');
    } else if (obj.topic === APPLY_APPROVE_TYPES.BUSINESS_OPPORTUNITIES) {
        return _.get(obj,'detail.customer.name');
    } else if (obj.topic === APPLY_APPROVE_TYPES.PERSONAL_LEAVE) {
        return Intl.get('leave.apply.leave.application', '请假申请');
    } else if (obj.workflow_type.indexOf(APPLY_APPROVE_TYPES.REPORT) !== -1){
        return Intl.get('apply.approve.specific.report','{customer}客户的{reporttype}',{customer: _.get(obj,'detail.customer.name'),reporttype: getDocumentReportTypeDes(REPORT_TYPE,_.get(obj,'detail.report_type'))});
    }else if (obj.workflow_type.indexOf(APPLY_APPROVE_TYPES.DOCUMENT) !== -1){
        return getDocumentReportTypeText(DOCUMENT_TYPE,_.get(obj,'detail.document_type'));
    }
};
function getDocumentReportTypeText(AllTypeList,specificType) {
    var targetObj = _.find(AllTypeList, (item) => {
        return item.value === specificType;
    });
    var type = '';
    if (targetObj) {
        type = targetObj.name;
    }
    return type;
}
function getDocumentReportTypeDes(AllTypeList,specificType) {
    var targetObj = _.find(AllTypeList, (item) => {
        return item.value === specificType;
    });
    var type = '';
    if (targetObj) {
        type = targetObj.name;
        if (type === Intl.get('crm.186', '其他')){
            type = Intl.get('common.report', '报告');
        }

    }
    return type;
}
exports.getDocumentReportTypeText = getDocumentReportTypeText;
exports.getApplyResultDscr = function(detailInfoObj) {
    let resultDscr = '';
    switch (detailInfoObj.status) {
        case 'pass':
            resultDscr = Intl.get('user.apply.detail.pass', '通过申请');
            break;
        case 'reject':
            resultDscr = Intl.get('user.apply.detail.reject', '驳回申请');
            break;
        case 'cancel':
            resultDscr = Intl.get('user.apply.detail.backout', '撤销申请');
            break;
    }
    return resultDscr;
};
exports.getApplyStatusDscr = function(applyStatus) {
    let applyType = '';
    switch (applyStatus) {
        case 'ongoing':
            applyType = Intl.get('leave.apply.my.worklist.apply', '待我审批');
            break;
        case 'pass':
            applyType = Intl.get('user.apply.pass', '已通过');
            break;
        case 'reject':
            applyType = Intl.get('leave.apply.approve.rejected', '被驳回');
            break;
        case 'cancel':
            applyType = Intl.get('user.apply.be.canceled','被撤销');
            break;
    }
    return applyType;
};
exports.getApplyStatusTimeLineDesc = function(replyItemStatus) {
    var description = '';
    if (replyItemStatus === 'reject'){
        description = Intl.get('user.apply.detail.reject', '驳回申请');
    }else if(replyItemStatus === 'cancel'){
        description = Intl.get('user.apply.detail.backout', '撤销申请');
    }else if (replyItemStatus === 'pass'){
        description = Intl.get('user.apply.detail.pass', '通过申请');
    }
    return description;
};
exports.getReportSendApplyStatusTimeLineDesc = function(replyItemStatus) {
    var description = '';
    if (replyItemStatus === 'reject'){
        description = Intl.get('user.apply.detail.reject', '驳回申请');
    }else if(replyItemStatus === 'cancel'){
        description = Intl.get('user.apply.detail.backout', '撤销申请');
    }else if (replyItemStatus === 'pass'){
        description = Intl.get('apply.approve.confirm.apply','确认申请');
    }
    return description;
};
exports.getFilterReplyList = function(thisState) {
    //已经结束的用approve_detail里的列表 没有结束的，用comment里面取数据
    var applicantList = _.get(thisState, 'detailInfoObj.info');
    var replyList = [];
    if ((APPLY_FINISH_STATUS.includes(applicantList.status)) && _.isArray(_.get(thisState, 'detailInfoObj.info.approve_details'))){
        replyList = _.get(thisState, 'detailInfoObj.info.approve_details');
    }else{
        replyList = _.get(thisState,'replyListInfo.list');
    }
    replyList = _.filter(replyList,(item) => {return !item.comment;});
    replyList = _.sortBy( _.cloneDeep(replyList), [item => item.comment_time]);
    return replyList;
};
exports.getUserApplyFilterReplyList = function(thisState) {
    //用户审批里面不会有approve_detail这个字段，只能在comment里面过滤数据
    //用户审批会有两类数据，一类是改成工作流之前的数据，一类是改成工作流之后的数据
    var applicantList = _.get(thisState, 'detailInfoObj.info');
    var replyList = _.get(thisState,'replyListInfo.list',[]);
    replyList = _.filter(replyList,(item) => {return item.approve_status;});
    //如果工作流的状态是已经结束并且在reply列表中每一条都没有approve_status 这就是改成工作流之前的数据
    //撤销某条申请
    if (_.get(applicantList,'approval_state') === APPLY_USER_STATUS.CANCELED_USER_APPLY){
        replyList.push({approve_status: 'cancel',nick_name: applicantList.approval_person,comment_time: applicantList.approval_time});
    }
    if ([APPLY_USER_STATUS.PASSED_USER_APPLY,APPLY_USER_STATUS.REJECTED_USER_APPLY].includes(_.get(applicantList,'approval_state')) && !replyList.length){
        //通过某条申请
        if (_.get(applicantList,'approval_state') === APPLY_USER_STATUS.PASSED_USER_APPLY){
            replyList.push({approve_status: 'pass',nick_name: applicantList.approval_person,comment_time: applicantList.approval_time});
        }
        //驳回某条申请
        if (_.get(applicantList,'approval_state') === APPLY_USER_STATUS.REJECTED_USER_APPLY){
            replyList.push({approve_status: 'reject',nick_name: applicantList.approval_person,comment_time: applicantList.approval_time});
        }
    }
    replyList = _.sortBy( _.cloneDeep(replyList), [item => item.comment_time]);
    return replyList;
};

exports.handleDiffTypeApply = function(that) {
    var confirmType = that.state.showBackoutConfirmType, modalContent = '', deleteFunction = function() {
        }, okText = '', modalShow = false, resultType = {};
    //不同类型的操作，展示的描述和后续操作也不一样
    if (confirmType === 'pass' || confirmType === 'reject') {
        deleteFunction = that.passOrRejectApplyApprove.bind(that, confirmType);
        modalContent = Intl.get('apply.approve.modal.text.pass', '是否通过此申请');
        okText = Intl.get('user.apply.detail.button.pass', '通过');
        if (confirmType === 'reject') {
            modalContent = Intl.get('apply.approve.modal.text.reject', '是否驳回此申请');
            okText = Intl.get('common.apply.reject', '驳回');
        }
        resultType = that.state.applyResult;
    } else if (confirmType === 'cancel') {
        modalContent = Intl.get('user.apply.detail.modal.content', '是否撤销此申请？');
        deleteFunction = that.cancelApplyApprove;
        okText = Intl.get('user.apply.detail.modal.ok', '撤销');
        resultType = that.state.backApplyResult;
    }
    modalShow = confirmType && resultType.submitResult === '';
    return {
        modalShow: modalShow,
        modalContent: modalContent,
        deleteFunction: deleteFunction,
        okText: okText
    };
};

//转换成‘销售-团队’对应格式的数据
exports.formatSalesmanList = function(salesManList) {
    let dataList = [];
    //展示其所在团队的成员列表
    _.each(salesManList, salesman => {
        let teamArray = salesman.user_groups;
        //一个销售属于多个团队的处理（旧数据中存在这种情况）
        if (_.isArray(teamArray) && teamArray.length) {
            //销售与所属团队的组合数据，用来区分哪个团队中的销售
            teamArray.forEach(team => {
                let teamName = _.get(team, 'group_name') ? ` - ${team.group_name}` : '';
                let teamId = _.get(team, 'group_id') ? `&&${team.group_id}` : '';
                dataList.push({
                    name: _.get(salesman, 'user_info.nick_name', '') + teamName,
                    value: _.get(salesman, 'user_info.user_id', '') + teamId
                });
            });
        } else {
            dataList.push({
                name: `${_.get(salesman, 'user_info.nick_name', '')}`,
                value: `${_.get(salesman, 'user_info.user_id', '')}`
            });
        }
    });
    return dataList;
};

exports.renderClueStatus = function(status) {
    var statusDes = '';
    switch (status) {
        case '0':
            statusDes = <span
                className="clue-stage will-distribute">{Intl.get('clue.customer.will.distribution', '待分配')}</span>;
            break;
        case '1':
            statusDes =
                <span className="clue-stage has-distribute">{Intl.get('sales.home.will.trace', '待跟进')}</span>;
            break;
        case '2':
            statusDes =
                <span className="clue-stage has-follow">{Intl.get('clue.customer.has.follow', '已跟进')}</span>;
            break;
    }
    return statusDes;
};

//是否是oplate用户，只有oplate的用户才可以进行添加、申请等操作
exports.isOplateUser = function() {
    let user = userData.getUserData();
    return _.get(user, 'integration_config.type') === INTEGRATE_TYPES.OPLATE;
};
exports.formatUsersmanList = function(usersManList) {
    let dataList = [];
    //展示其所在团队的成员列表
    _.each(usersManList, usersman => {
        dataList.push({
            name: `${_.get(usersman, 'nickName', '')}`,
            value: `${_.get(usersman, 'userId', '')}`
        });
    });
    return dataList;
};

exports.updateUnapprovedCount = function(type,emitterType,updateCount) {
    if (Oplate && Oplate.unread) {
        Oplate.unread[type] = updateCount;
        if (timeoutFunc) {
            clearTimeout(timeoutFunc);
        }
        timeoutFunc = setTimeout(function() {
            //触发展示的组件待审批数的刷新
            notificationEmitter.emit(notificationEmitter[emitterType]);
        }, timeout);
    }
};

// 获取组织信息
function getOrganization() {
    return _.get(userData.getUserData(),'organization', {}); // 组织信息
}

exports.getOrganization = getOrganization;

// 判断组织类型，若是eefung返回true，否则返回false
exports.isOrganizationEefung = () => {
    let organization = getOrganization(); // 组织信息
    return _.get(organization,'id') === ORGANIZATION_TYPE.EEFUNG;
};
//是否可以展示拨打电话的按钮
exports.showCallIconPrivilege = () => {
    //是否展示拨打按钮
    let callClient = getCallClient();
    var isShowCallTip = false;
    if (callClient && callClient.isInited()) {
        isShowCallTip = true;
    }
    return isShowCallTip;
};