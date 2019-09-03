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
import {
    selectMenuList,
    APPLY_APPROVE_TYPES,
    DOCUMENT_TYPE,
    INTEGRATE_TYPES,
    REPORT_TYPE,
    APPLY_FINISH_STATUS,
    APPLY_USER_STATUS,
    REG_FILES_SIZE_RULES,
    ORGANIZATION_TYPE,LEAVE_TIME_RANGE, AM_AND_PM,
    FINAL_TASK,
    ORGANIZATION_APP_TYPES,
    REALM_REMARK
} from './consts';
var DateSelectorUtils = require('CMP_DIR/datepicker/utils');
var timeoutFunc;//定时方法
var timeout = 1000;//1秒后刷新未读数
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
import {getCallClient} from 'PUB_DIR/sources/utils/phone-util';
var websiteConfig = require('../../../lib/utils/websiteConfig');
var getWebsiteConfig = websiteConfig.getWebsiteConfig;
import {getMyTeamTreeAndFlattenList} from './common-data-util';
import {SELF_SETTING_FLOW} from 'MOD_DIR/apply_approve_manage/public/utils/apply-approve-utils';
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
    if (phoneType === 'app' || phoneType === 'curtao_phone') {
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
 * @param withExtra 把root_group，parent_group等信息也返回回去
 */
function traversingTeamTree(treeList, list, withExtra) {
    if (_.isArray(treeList) && treeList.length) {
        _.each(treeList, team => {
            var childObj = {group_id: team.group_id, group_name: team.group_name};
            if (withExtra) {
                childObj.parent_group = team.parent_group;
                childObj.user_ids = team.user_ids || [];
                childObj.owner_id = team.owner_id;
                childObj.manager_ids = team.manager_ids || [];
            }
            list.push(childObj);
            if (team.child_groups) {
                traversingTeamTree(team.child_groups, list, withExtra);
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


//不能选今天之后的时间
exports.disabledAfterToday = function(current) {
    return current && current > moment().endOf('day');
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
        case '3':
            statusDes =
                <span className="clue-stage has-transfer">{Intl.get('clue.customer.has.transfer', '已转化')}</span>;
            break;
    }
    return statusDes;
};
//获取线索未处理的权限
//只有銷售才有展示线索未读数的权限
exports.getClueUnhandledPrivilege = function() {
    return (hasPrivilege('CUSTOMERCLUE_QUERY_FULLTEXT_MANAGER') || hasPrivilege('CUSTOMERCLUE_QUERY_FULLTEXT_USER')) && isSalesRole();
};
//获取线索未读数的参数
exports.getUnhandledClueCountParams = function() {
    return {
        queryParam: {
            rangeParams: [{//时间范围参数
                from: moment('2010-01-01 00:00:00').valueOf(),//开始时间设置为2010年
                to: moment().valueOf(),
                type: 'time',
                name: 'source_time'
            }],
        },
        bodyParam: {
            query: {
                status: '1',
                availability: '0'
            },
        },
    };
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
    } else {
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
        return _.get(obj, 'detail.customer.name');
    } else if (obj.topic === APPLY_APPROVE_TYPES.PERSONAL_LEAVE) {
        return Intl.get('leave.apply.leave.application', '请假申请');
    } else if (obj.workflow_type.indexOf(APPLY_APPROVE_TYPES.REPORT) !== -1) {
        return Intl.get('apply.approve.specific.report', '{customer}客户的{reporttype}', {
            customer: _.get(obj, 'detail.customer.name'),
            reporttype: getDocumentReportTypeDes(REPORT_TYPE, _.get(obj, 'detail.report_type'))
        });
    } else if (obj.workflow_type.indexOf(APPLY_APPROVE_TYPES.DOCUMENT) !== -1) {
        return getDocumentReportTypeText(DOCUMENT_TYPE, _.get(obj, 'detail.document_type'));
    } else if (obj.topic === APPLY_APPROVE_TYPES.MEMBER_INVITE) {
        return Intl.get('member.application', '成员申请');
    }else if (obj.workflow_type === SELF_SETTING_FLOW.VISITAPPLY){
        return Intl.get('apply.my.self.setting.work.flow', '拜访申请');
    }
};
function getDocumentReportTypeText(AllTypeList, specificType) {
    var targetObj = _.find(AllTypeList, (item) => {
        return item.value === specificType;
    });
    var type = '';
    if (targetObj) {
        type = targetObj.name;
    }
    return type;
}
function getDocumentReportTypeDes(AllTypeList, specificType) {
    var targetObj = _.find(AllTypeList, (item) => {
        return item.value === specificType;
    });
    var type = '';
    if (targetObj) {
        type = targetObj.name;
        if (type === Intl.get('crm.186', '其他')) {
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
            applyType = Intl.get('user.apply.be.canceled', '被撤销');
            break;
    }
    return applyType;
};
exports.getApplyStatusTimeLineDesc = function(replyItemStatus) {
    var description = '';
    if (replyItemStatus === 'reject') {
        description = Intl.get('user.apply.detail.reject', '驳回申请');
    } else if (replyItemStatus === 'cancel') {
        description = Intl.get('user.apply.detail.backout', '撤销申请');
    } else if (replyItemStatus === 'pass') {
        description = Intl.get('user.apply.detail.pass', '通过申请');
    }
    return description;
};
exports.getReportSendApplyStatusTimeLineDesc = function(replyItemStatus) {
    var description = '';
    if (replyItemStatus === 'reject') {
        description = Intl.get('user.apply.detail.reject', '驳回申请');
    } else if (replyItemStatus === 'cancel') {
        description = Intl.get('user.apply.detail.backout', '撤销申请');
    } else if (replyItemStatus === 'pass') {
        description = Intl.get('apply.approve.confirm.apply', '确认申请');
    }
    return description;
};
exports.getFilterReplyList = function(thisState) {
    //已经结束的用approve_detail里的列表 没有结束的，用comment里面取数据
    var applicantList = _.get(thisState, 'detailInfoObj.info');
    var replyList = [];
    if ((APPLY_FINISH_STATUS.includes(applicantList.status)) && _.isArray(_.get(thisState, 'detailInfoObj.info.approve_details'))) {
        replyList = _.get(thisState, 'detailInfoObj.info.approve_details');
    } else {
        replyList = _.get(thisState, 'replyListInfo.list');
    }
    replyList = _.filter(replyList, (item) => {
        return !item.comment;
    });
    replyList = _.sortBy(_.cloneDeep(replyList), [item => item.comment_time]);
    return replyList;
};
exports.getUserApplyFilterReplyList = function(thisState) {
    //用户审批里面不会有approve_detail这个字段，只能在comment里面过滤数据
    //用户审批会有两类数据，一类是改成工作流之前的数据，一类是改成工作流之后的数据
    var applicantList = _.get(thisState, 'detailInfoObj.info');
    var replyList = _.get(thisState, 'replyListInfo.list', []);
    replyList = _.filter(replyList, (item) => {
        return item.approve_status;
    });
    //如果工作流的状态是已经结束并且在reply列表中每一条都没有approve_status 这就是改成工作流之前的数据
    //撤销某条申请
    if (_.get(applicantList, 'approval_state') === APPLY_USER_STATUS.CANCELED_USER_APPLY) {
        replyList.push({
            approve_status: 'cancel',
            nick_name: applicantList.approval_person,
            comment_time: applicantList.approval_time
        });
    }
    if ([APPLY_USER_STATUS.PASSED_USER_APPLY, APPLY_USER_STATUS.REJECTED_USER_APPLY].includes(_.get(applicantList, 'approval_state')) && !replyList.length) {
        //通过某条申请
        if (_.get(applicantList, 'approval_state') === APPLY_USER_STATUS.PASSED_USER_APPLY) {
            replyList.push({
                approve_status: 'pass',
                nick_name: applicantList.approval_person,
                comment_time: applicantList.approval_time
            });
        }
        //驳回某条申请
        if (_.get(applicantList, 'approval_state') === APPLY_USER_STATUS.REJECTED_USER_APPLY) {
            replyList.push({
                approve_status: 'reject',
                nick_name: applicantList.approval_person,
                comment_time: applicantList.approval_time
            });
        }
    }
    replyList = _.sortBy(_.cloneDeep(replyList), [item => item.comment_time]);
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

exports.updateUnapprovedCount = function(type, emitterType, updateCount) {
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
    return _.get(userData.getUserData(), 'organization', {}); // 组织信息
}

exports.getOrganization = getOrganization;

// 判断组织类型，若是eefung返回true，否则返回false
exports.isOrganizationEefung = () => {
    let organization = getOrganization(); // 组织信息
    return _.get(organization, 'id') === ORGANIZATION_TYPE.EEFUNG;
};
//是否已经配置了坐席号
function hasCalloutPrivilege() {
    //是否展示拨打按钮
    let callClient = getCallClient();
    return callClient && callClient.isInited();
}
exports.hasCalloutPrivilege = hasCalloutPrivilege;
exports.afterGetExtendUserInfo = (data, that, isShowPhoneSet) => {
    var responseObj = {
        isShowActiveEmail: !data.email_enable,//是否展示激活邮箱的提示
        isShowAddEmail: !data.email,//是否展示添加邮箱的提示，不能仅用是否有email字段进行判断，原因是如果数据获取慢的时候，也会在页面上展示出添加邮箱的提示
        isShowSetClient: isShowPhoneSet,//是否展示设置坐席号的提示
        email: data.email
    };
    //如果邮箱未激活或者未设置坐席号，再发请求看是否设置过不再展示
    if (responseObj.isShowActiveEmail || responseObj.isShowSetClient) {
        getWebsiteConfig((configData) => {
            if (configData) {
                if (responseObj.isShowActiveEmail && _.get(configData, 'setting_notice_ignore') === 'yes') {

                    responseObj.isShowActiveEmail = false;
                }
                if (responseObj.isShowSetClient && _.get(configData, 'personnel_setting.setting_client_notice_ignore') === 'yes') {
                    responseObj.isShowSetClient = false;
                }
            }
            that.dispatch(responseObj);
        }, true);
    }
};
exports.getApplyListTypeDes = (applyListType) => {
    switch (applyListType) {
        case 'all':
            return Intl.get('user.apply.all', '全部申请');
        case 'ongoing':
            return Intl.get('leave.apply.my.worklist.apply', '待我审批');
        case 'pass':
            return Intl.get('user.apply.pass', '已通过');
        case 'reject':
            return Intl.get('user.apply.reject', '已驳回');
        case 'cancel':
            return Intl.get('user.apply.backout', '已撤销');
        case 'myApproved':
            return Intl.get('apply.list.my.approved', '我审批过');
    }
};
exports.checkFileSizeLimit = (fileSize) => {
    var sizeQualified = true, warningMsg = '';
    _.forEach(REG_FILES_SIZE_RULES, (item) => {
        if (!_.isUndefined(item.minValue)) {
            if (fileSize === item.minValue) {
                warningMsg = item.messageTips;
                sizeQualified = false;
                return false;
            }
        }
        if (_.isUndefined(item.minValue) && item.maxValue) {
            if (fileSize > item.maxValue) {
                warningMsg = item.messageTips;
                sizeQualified = false;
                return false;
            }
        }
    });
    return {sizeQualified: sizeQualified, warningMsg: warningMsg};
};
exports.checkFileNameForbidRule = (filename,regnamerules) => {
    var nameQualified = true, warningMsg = '';
    if (_.isArray(regnamerules) && _.isString(filename)){
        _.forEach(regnamerules,(item) => {
            if (filename.indexOf(item.value) >= 0){
                warningMsg = item.messageTips;
                nameQualified = false;
                return false;
            }
        });
    }
    return {nameQualified: nameQualified,warningMsg: warningMsg};
};
exports.checkFileNameAllowRule = (filename, regnamerules) => {
    var nameQualified = true, warningMsg = '';
    //允许的规则
    if (_.isArray(regnamerules) && _.isString(filename)){
        _.forEach(regnamerules,(item) => {
            var fileType = _.last(filename.split('.'));
            if(_.isArray(item.valueArr) && !item.valueArr.includes(fileType)){
                warningMsg = item.messageTips;
                nameQualified = false;
                return false;
            }
        });
    }

    return {nameQualified: nameQualified,warningMsg: warningMsg};
};
exports.checkFileNameRepeat = (filename, fileLists) => {
    var nameQualified = true, warningMsg = '';
    //允许的规则
    if (_.isArray(fileLists) && _.isString(filename)){
        var target = _.find(fileLists, item => _.get(item,'name','').indexOf(filename) > -1 || _.get(item,'file_name','').indexOf(filename) > -1);
        if (target){
            warningMsg = Intl.get('apply.upload.same.name', '该文件名称已存在');
            nameQualified = false;
        }
    }
    return {nameQualified: nameQualified,warningMsg: warningMsg};
};
//获取团队里所有成员列表
function getTeamUsers(teamList) {
    var subUserArr = [];
    if (_.isArray(teamList)) {
        _.forEach(teamList, (item) => {
            subUserArr = _.concat(subUserArr, item.owner_id, item.manager_ids, item.user_ids);
        });
    }
    subUserArr = _.uniq(subUserArr);
    return subUserArr;
}

//查询当前账号是否是待审批人的领导
const isLeaderOfCandidate = function(candidateList, callback) {
    var user_id = userData.getUserData().user_id;
    getMyTeamTreeAndFlattenList(data => {
        var teamList = data.teamList, isCandidateLeader = false;
        if (_.isArray(teamList) && teamList.length) {
            if (teamList.length === 1) {
                //如果我及我的下级团队只有一个团队，
                //判断待审批人在该团队成员列表中，并且登录的账号是该团队的管理员
                var userArr = getTeamUsers(teamList);
                isCandidateLeader = _.some(candidateList, (item) => {
                    return userArr.includes(item.user_id) && user_id === item.owner_id;
                });
            } else {
                //如果我及我的下级团队大于一个团队，先把登录的账号所在的团队过滤掉,这样是为了防止有A,B两个同级的不同团队的销售主管，当A的下属有待审批的申请的时候，B是不应该有转审功能的
                teamList = _.filter(teamList, (teamItem) => {
                    var userArr = [];
                    userArr = _.concat(userArr, teamItem.owner_id, teamItem.manager_ids, teamItem.user_ids);
                    return !userArr.includes(user_id);
                });
                //判断待审批人是否在剩下团队的成员列表中
                var userArr = getTeamUsers(teamList);
                isCandidateLeader = _.some(candidateList, (item) => {
                    return userArr.includes(item.user_id);
                });
            }
        }
        _.isFunction(callback) && callback(isCandidateLeader);
    }, true);
};
exports.isLeaderOfCandidate = isLeaderOfCandidate;
//查看当前账号是否是待审批人的领导
//如果是管理员或者我是待审批人或者我是待审批人的上级领导，我都可以把申请进行转出
exports.checkIfLeader = function(result, callback){
    var isLeader = false;
    if (result && result.length){
        isLeaderOfCandidate(result,(isLeaderFlag) => {
            isLeader = isLeaderFlag;
            _.isFunction(callback) && callback(isLeader);
        });
    }else{
        _.isFunction(callback) && callback(isLeader);
    }
};
//时间选择组件禁用的范围
exports.disabledDate = function(startTime, endTime, value){
    if (!value) {
        return false;
    }
    return value.valueOf() < moment(startTime).startOf('day').valueOf() || value.valueOf() > moment(endTime).endOf('day').valueOf();
};
exports.calculateSelectType = function(selectTime, rangeObj){
    var selectTypeArr = LEAVE_TIME_RANGE;
    if (!selectTime){
        selectTypeArr = selectTypeArr.push({name: '', value: ''});
    }else{
        //如果和开始的时间是同一天并且开始的类型是PM
        if (moment(selectTime).isSame(rangeObj.initial_visit_start_time, 'day') && rangeObj.initial_visit_start_type === AM_AND_PM.PM){
            selectTypeArr = LEAVE_TIME_RANGE.slice(1,2);
        }
        //如果和结束的时间是同一天并且结束的类型是AM
        if (moment(selectTime).isSame(rangeObj.initial_visit_end_time, 'day') && rangeObj.initial_visit_end_type === AM_AND_PM.AM){
            selectTypeArr = LEAVE_TIME_RANGE.slice(0,1);
        }
    }
    return selectTypeArr;
};
exports.getUnreadReplyTitle = function(isCheckUnreadApplyList, showUnreadTip){
    let unreadReplyTitle = Intl.get('user.apply.no.unread.reply', '无未读回复');
    if (isCheckUnreadApplyList) {//在查看未读回复列表下的提示
        unreadReplyTitle = Intl.get('user.apply.show.all.check', '查看全部申请');
    } else if (showUnreadTip) {
        unreadReplyTitle = Intl.get('user.apply.unread.reply', '有未读回复');
    }
    return unreadReplyTitle;
};

//判断某个审批是否位于最后一个节点
exports.isFinalTask = function(applyNode) {
    if (_.isArray(applyNode) && applyNode.length) {
        //现在主要是看用户申请的审批是否位于最后一个节点，这种类型的节点只会有一个，但是如果有并行的节点，applyNode就会有两个，现在认为有一个节点是final_task ，这条审批就是位于最后一个节点
        return _.some(applyNode, item => item.description === FINAL_TASK);
    }
};
//判断某个审批所在节点的审批角色是否有管理员
exports.isApprovedByManager = function(applyNode) {
    if (_.isArray(applyNode) && applyNode.length) {
        return _.some(applyNode, item => {
            var name = _.get(item, 'name', '');
            return name.indexOf(Intl.get('common.managers', '管理员')) > -1;
        });
    }
};
//把文件列表中文件大小的字段file_size,再加上一个字段size。防止在导入新文件时，计算文件大小的字段是size
exports.uniteFileSize = function(fileLists) {
    if (_.get(fileLists,'[0].file_size','')){
        _.forEach(fileLists,item => item.size = item.file_size);
    }
    return fileLists;
};

const TAG_MIN_WIDTH = 160; // 标签最小的宽度，160
const COUNT = 6; // 一行放标签的个数是 6
const PADDING_WIDTH = 16; // 边距宽度16
// 计算自适应标签的宽度
exports.ajustTagWidth = (contentWidth) => {
    let tagsWidth = TAG_MIN_WIDTH * COUNT + PADDING_WIDTH * (COUNT - 1);
    let tagWidth = TAG_MIN_WIDTH;
    if (contentWidth > 0) {
        if (contentWidth >= tagsWidth) {
            tagWidth = (contentWidth - PADDING_WIDTH * (COUNT - 1)) / COUNT;
        } else {
            let count = Math.floor(contentWidth / (TAG_MIN_WIDTH + PADDING_WIDTH));
            tagWidth = (contentWidth - PADDING_WIDTH * (count - 1)) / count;
        }
    }
    return tagWidth;
};

//获取列表容器的高度
exports.getTableContainerHeight = function() {
    const LAYOUT_CONSTANTS = {
        TOP_HANDLE_HEIGHT: 66,//头部操作区的高度
        FIXED_THEAD: 40,//表头的高度
        PADDING_BOTTOM: 20,//底部间距
        SUMMARY: 30//总数统计的高度
    };
    return $(window).height() -
        LAYOUT_CONSTANTS.TOP_HANDLE_HEIGHT -
        LAYOUT_CONSTANTS.FIXED_THEAD -
        LAYOUT_CONSTANTS.PADDING_BOTTOM -
        LAYOUT_CONSTANTS.SUMMARY;
};
function isSalesRole() {
    return !(userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON) || userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN));
}
exports.isSalesRole = isSalesRole;
exports.subtracteGlobalClue = function(clueItem,callback) {
    var unHandleClueLists = Oplate.unread['unhandleClueList'];
    var targetObj = _.find(unHandleClueLists,item => item.id === clueItem.id);
    unHandleClueLists = _.filter(unHandleClueLists,item => item.id !== clueItem.id);
    if (targetObj){
        Oplate.unread['unhandleClue'] -= 1;
        if (timeoutFunc) {
            clearTimeout(timeoutFunc);
        }
        timeoutFunc = setTimeout(function() {
            //触发展示的组件待审批数的刷新
            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_CLUE_COUNT);
        }, timeout);
        _.isFunction(callback) && callback(true);
    }
};

// 是否开通呼叫中心
exports.isOpenCaller = () => {
    let organization = getOrganization();
    return _.includes(_.get(organization,'functions', []), ORGANIZATION_APP_TYPES.CALLER);
};

// 是否开通营收中心
exports.isOpenCash = () => {
    let organization = getOrganization();
    return _.includes(_.get(organization,'functions', []), ORGANIZATION_APP_TYPES.CASH);
};

// 设置是否已有专属号码
exports.setExclusiveNumber = (phoneType) => {
    let isDefault = _.isEqual(phoneType, 'default');
    userData.setUserData('hasExcluesiveNumber', !isDefault);
};
//是否是识微域
exports.isCiviwRealm = () => {
    var userDetail = userData.getUserData();
    var realmId = _.get(userDetail, 'auth.realm_id');
    return realmId === REALM_REMARK.CIVIW;
};

//客户名唯一性验证的提示信息
/**
 * @param customerNameExist 客户名是否存在
 * @param existCustomerList 已存在的客户列表
 * @param checkNameError 客户名检验接口报错的提示
 * @param curCustomerName 当前输入的客户名
 * @param showRightPanel 点击客户名打开客户详情的方法
* */
exports.renderCustomerNameMsg = (customerNameExist, existCustomerList, checkNameError, curCustomerName, showRightPanel) => {
    if (customerNameExist) {
        let list = _.cloneDeep(existCustomerList);
        const sameCustomer = _.find(list, item => item.name === curCustomerName);
        const curUserId = userData.getUserData().user_id;
        let renderCustomerName = (customer) => {
            if (customer) {
                //如果是我的客户，可以查看客户详情
                if (_.get(customer, 'user_id') === curUserId) {
                    return (
                        <a href="javascript:void(0)" onClick={showRightPanel.bind(this, _.get(customer, 'id'))} className="handle-btn-item">
                            {_.get(customer, 'name', '')}
                        </a>);
                } else {//如果是其他人的客户，只能看名字，不能看客户详情
                    return (<span>{_.get(customer, 'name', '')} ({_.get(customer, 'user_name')})</span>);
                }
            } else {
                return null;
            }
        };
        list = _.filter(list, cur => cur.id !== sameCustomer.id);
        return (
            <div className="tip-customer-exist">
                <span className="tip-customer-error">{Intl.get('call.record.customer', '客户')}{sameCustomer ? Intl.get('crm.66', '已存在') : Intl.get('crm.67', '可能重复了')}，</span>
                {/*同名客户或相似客户的第一个*/}
                {renderCustomerName(sameCustomer || list.shift())}
                {_.get(list, 'length') ? (
                    <div>
                        {Intl.get('crm.68', '相似的客户还有')}:
                        {_.map(list, customer => {
                            return (
                                <div key={_.get(customer, 'id')}>
                                    {renderCustomerName(customer)}
                                </div>
                            );
                        })}
                    </div>) : null}
            </div>
        );
    } else if (checkNameError) {
        return (
            <div className="check-only-error"><ReactIntl.FormattedMessage id="crm.69" defaultMessage="客户名唯一性校验出错"/>！
            </div>);
    } else {
        return '';
    }
};