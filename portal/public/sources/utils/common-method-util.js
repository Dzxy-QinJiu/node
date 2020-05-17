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
import {
    APPLY_APPROVE_TYPES,
    USERAPPLY_FINISH_STATUS,
    DOCUMENT_TYPE,
    INTEGRATE_TYPES,
    REPORT_TYPE,
    APPLY_FINISH_STATUS,
    APPLY_USER_STATUS,
    REG_FILES_SIZE_RULES,
    ORGANIZATION_TYPE, LEAVE_TIME_RANGE, AM_AND_PM,
    FINAL_TASK,
    ORGANIZATION_APP_TYPES,
    REALM_REMARK,
    INDICATOR_TOOLTIP,
    DIFF_STATUS_TAB,
    RESPONSIVE_LAYOUT,
    TIMERANGEUNIT,
    WEEKDAYS,
    CONFIG_TYPE,
    winningClueMaxCount,
    COMPANY_PHONE, COMPANY_VERSION_KIND
} from './consts';
var DateSelectorUtils = require('antc/lib/components/datepicker/utils');
var timeoutFunc;//定时方法
var timeout = 1000;//1秒后刷新未读数
import {notificationEmitter, modifyAppConfigEmitter, paymentEmitter} from './emitters';
import {getCallClient} from 'PUB_DIR/sources/utils/phone-util';
import {getMyTeamTreeAndFlattenList} from './common-data-util';
import {SELF_SETTING_FLOW} from 'MOD_DIR/apply_approve_manage/public/utils/apply-approve-utils';
import ShearContent from 'CMP_DIR/shear-content';
import cluePrivilegeConst from 'MOD_DIR/clue_customer/public/privilege-const';
import {
    isCommonSalesOrPersonnalVersion,
    isSalesOrPersonnalVersion
} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import publicPrivilegeConst from 'PUB_DIR/privilege-const';
import notificationPrivilege from 'MOD_DIR/notification/public/privilege-const';
import useManagePrivilege from 'MOD_DIR/app_user_manage/public/privilege-const';
const { getWebsiteConfig, getLocalWebsiteConfig } = require('LIB_DIR/utils/websiteConfig');
//缓存在sessionStorage中的我能查看的团队
const MY_TEAM_TREE_KEY = 'my_team_tree';
import {setUserData} from '../user-data';

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
const removeEmptyItem = function(obj, removeMoreEmptyType = false) {
    _.each(obj, (v, k) => {
        let flag = removeMoreEmptyType ? _.isNil(v) : false;
        if (v === '' || flag) delete obj[k];
        if (_.isArray(v)) {
            _.each(v, (subv) => {
                let flag = removeMoreEmptyType ? _.isNil(v) : false;
                if (subv === '' || flag) delete obj[k];
                else if (_.isObject(subv)) {
                    removeEmptyItem(subv, removeMoreEmptyType);
                    if (Object.keys(subv).length === 0) delete obj[k];
                }
            });
        }
    });
};
exports.removeEmptyItem = removeEmptyItem;


exports.getParamByPrivilege = function() {
    let reqData = {};
    if (hasPrivilege(publicPrivilegeConst.GET_TEAM_LIST_ALL)) {
        reqData.type = 'all';
    } else if (hasPrivilege(publicPrivilegeConst.GET_TEAM_LIST_MYTEAM_WITH_SUBTEAMS)) {
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
exports.renderClueStatus = function(listItem) {
    let status =
            _.isString(listItem) ? listItem :
                listItem.availability === '1' ? 'invalid' : listItem.status;
    var statusDes = '';
    switch (status) {
        case '0':
            statusDes =
                <span className="clue-stage will-distribute">{Intl.get('clue.customer.will.distribution', '待分配')}</span>;
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
        case 'invalid':
            statusDes =
                <spam className="clue-stage has-invalid">{Intl.get( 'clue.analysis.inability', '无效')}</spam>;
            break;
    }
    return statusDes;
};
//获取线索未处理的权限
//销售和运营有展示线索未读数的权限
exports.getClueUnhandledPrivilege = function() {
    return (hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_QUERY_ALL) || hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_QUERY_SELF)) && (isSalesRole() || userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON));
};
//获取线索未读数的参数
exports.getUnhandledClueCountParams = function() {
    return {
        bodyParam: {
            rang_params: [{//时间范围参数
                from: moment('2010-01-01 00:00:00').valueOf(),//开始时间设置为2010年
                to: moment().valueOf(),
                type: 'time',
                name: 'source_time'
            }],
            query: {
                status: isSalesOrPersonnalVersion() ? '1,2' : '0,1,2',//如果是销售或者是个人版，要取待跟进和已跟进状态的线索，其他情况还要加上待分配的状态
                availability: '0'
            },
        },
        queryParam: {
            self_pending: true
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
    return _.get(obj, 'configDescription','');
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
    if ((_.includes(APPLY_FINISH_STATUS, applicantList.status)) && _.isArray(_.get(thisState, 'detailInfoObj.info.approve_details'))) {
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
    //已经结束的用approve_detail里的列表 没有结束的，用comment里面取数据
    var applicantList = _.get(thisState, 'detailInfoObj.info');
    var replyList = [];
    if ((_.includes(USERAPPLY_FINISH_STATUS, applicantList.status)) && _.isArray(_.get(thisState, 'detailInfoObj.info.approve_details'))) {
        replyList = _.get(thisState, 'detailInfoObj.info.approve_details');
    } else {
        replyList = _.get(thisState, 'replyListInfo.list');
    }
    replyList = _.filter(replyList, (item) => {
        return item.status;
    });
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
                let nickName = _.get(salesman, 'user_info.nick_name', '') || _.get(salesman,'user_info.user_name', '');
                dataList.push({
                    name: nickName + teamName,
                    value: _.get(salesman, 'user_info.user_id', '') + teamId
                });
            });
        } else {
            let nickName = _.get(salesman, 'user_info.nick_name', '') || _.get(salesman,'user_info.user_name', '');
            dataList.push({
                name: nickName,
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
            name: _.get(usersman, 'nickName', '') || _.get(usersman, 'userName', ''),
            value: `${_.get(usersman, 'userId', '')}`
        });
    });
    return dataList;
};
//待我审批的数量减一
exports.substractUnapprovedCount = function(applyId) {
    if (Oplate && Oplate.unread) {
        var unhandleApplyList = Oplate.unread['unhandleApplyList'];
        //如果这个审批的id在待我审批的列表中
        var targetObj = _.find(unhandleApplyList, item => item.id === applyId);
        if(targetObj){
            Oplate.unread['unhandleApply'] -= 1;
            Oplate.unread['unhandleApplyList'] = _.filter(Oplate.unread['unhandleApplyList'],item => item.id !== applyId);
            if (timeoutFunc) {
                clearTimeout(timeoutFunc);
            }
            timeoutFunc = setTimeout(function() {
                //触发展示的组件待审批数的刷新
                notificationEmitter.emit(notificationEmitter['SHOW_UNHANDLE_APPLY_APPROVE_COUNT']);
            }, timeout);
        }


    }
};

// 获取组织信息
function getOrganization() {
    return _.get(userData.getUserData(), 'organization', {}); // 组织信息
}

exports.getOrganization = getOrganization;

// 判断组织类型，若是eefung返回true，否则返回false
function isOrganizationEefung() {
    let organization = getOrganization(); // 组织信息
    return _.get(organization, 'id') === ORGANIZATION_TYPE.EEFUNG;
}
exports.isOrganizationEefung = isOrganizationEefung;

//是否已经配置了坐席号
function hasCalloutPrivilege() {
    //是否展示拨打按钮
    let callClient = getCallClient();
    return callClient && callClient.isInited();
}
exports.hasCalloutPrivilege = hasCalloutPrivilege;
exports.afterGetExtendUserInfo = (data, that, isShowPhoneSet) => {
    var responseObj = {
        isShowActiveEmail: !data.emailEnable,//是否展示激活邮箱的提示
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
exports.getApplyListTypeDes = (selectedApplyStatus) => {
    switch (selectedApplyStatus) {
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
            if(_.isArray(item.valueArr) && !_.includes(item.valueArr, fileType)){
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
                    return _.includes(userArr, item.user_id) && user_id === item.owner_id;
                });
            } else {
                //如果我及我的下级团队大于一个团队，先把登录的账号所在的团队过滤掉,这样是为了防止有A,B两个同级的不同团队的销售主管，当A的下属有待审批的申请的时候，B是不应该有转审功能的
                teamList = _.filter(teamList, (teamItem) => {
                    var userArr = [];
                    userArr = _.concat(userArr, teamItem.owner_id, teamItem.manager_ids, teamItem.user_ids);
                    return !_.includes(userArr, user_id);
                });
                //判断待审批人是否在剩下团队的成员列表中
                var userArr = getTeamUsers(teamList);
                isCandidateLeader = _.some(candidateList, (item) => {
                    return _.includes(userArr, item.user_id);
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
//时间选择组件中禁用时间的范围
exports.disabledHour = function(startTime, endTime){
    var startHour = moment(startTime).get('hour'),endHour = moment(endTime).get('hour');
    return _.concat(_.range(0,startHour), _.range(endHour + 1, 24));
};
//禁用的分钟数量
exports.disabledMinute = function(startTime, endTime, selectTime){
    const startMoment = moment(startTime),endMoment = moment(endTime);
    var startHour = startMoment.get('hour'),endHour = endMoment.get('hour'), currentHour = moment(selectTime).get('hour');
    if(currentHour === startHour){
        return _.range(0, startMoment.get('minute'));
    }else if(currentHour === endHour){
        return _.range(endMoment.get('minute') + 1, 60);
    }else{
        return [];
    }
};
exports.calculateSelectType = function(selectTime, rangeObj){
    var selectTypeArr = LEAVE_TIME_RANGE;
    if (!selectTime){
        selectTypeArr = selectTypeArr.push({name: '', value: ''});
    }else{
        //如果和开始的时间是同一天并且开始的类型是PM
        if (moment(selectTime).isSame(rangeObj.initialVisitStartTime, 'day') && rangeObj.initial_visit_start_type === AM_AND_PM.PM){
            selectTypeArr = LEAVE_TIME_RANGE.slice(1,2);
        }
        //如果和结束的时间是同一天并且结束的类型是AM
        if (moment(selectTime).isSame(rangeObj.initialVisitEndTime, 'day') && rangeObj.initial_visit_end_type === AM_AND_PM.AM){
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
    }else{
        return false;
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
    return userData.hasRole(userData.ROLE_CONSTANS.SALES) || userData.hasRole(userData.ROLE_CONSTANS.SECRETARY) || userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER);
}
exports.isSalesRole = isSalesRole;

function isAdminRole() {
    return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN);
}

//是否管理员
exports.isAdminRole = isAdminRole;

//是否主管或运营人员
exports.isManagerOrOpRole = function() {
    return userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON) || userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER);
};

//是否客户经理
function isCustomerManager() {
    return userData.getUserData().position === '客户经理';
}
exports.isCustomerManager = isCustomerManager;

//是否是蚁坊域的客户经理
exports.isEefungCustomerManager = function() {
    return isOrganizationEefung() && isCustomerManager();
};

// 是否开通呼叫中心
exports.isOpenCaller = () => {
    let organization = getOrganization();
    let productsIdMap = JSON.parse(_.get(Oplate,'productsIdMap', '{}'));
    return _.includes(_.get(organization,'grantProducts', []), _.get(productsIdMap, 'caller', ''));
};

// 是否开通营收中心
exports.isOpenCash = () => {
    let organization = getOrganization();
    let productsIdMap = JSON.parse(_.get(Oplate,'productsIdMap', '{}'));
    return _.includes(_.get(organization,'grantProducts', []), _.get(productsIdMap, 'cash', ''));
};
//是否是csm.curtao.com域名访问的
exports.isCurtao = () => {
    return Oplate.isCurtao === 'true';
};
// 设置是否已有专属号码
exports.setExclusiveNumber = (phoneType) => {
    let isDefault = _.isEqual(phoneType, 'default');
    userData.setUserData('hasExcluesiveNumber', '' + !isDefault);
};
//是否是识微域
exports.isCiviwRealm = () => {
    var userDetail = userData.getUserData();
    var realmId = _.get(userDetail, 'auth.realm_id');
    return realmId === REALM_REMARK.CIVIW;
};

//获取邮件中激活邮箱的url（需要用浏览器中当前的url基础路径来拼，好区分那个环境中发的邮件（如：https://ketao.antfact.com、https://csm.curtao.com）
exports.getEmailActiveUrl = () => {
    return _.get(window, 'location.origin', '') + '/email/active?code=';
};

//获取某种indicator的tooltip
exports.getCertainTypeTooltip = (indicator) => {
    var target = _.find(INDICATOR_TOOLTIP, item => item.key === indicator);
    return _.get(target,'value','');
};
//获取某个tab的title
exports.getCertainTabsTitle = (status) => {
    var target = _.find(DIFF_STATUS_TAB, item => item.key === status);
    return _.get(target,'value','');
};
exports.getUserApplyStateText = (obj) => {
    if (obj.isConsumed === 'true') {
        if (obj.approval_state === '1') {
            return Intl.get('user.apply.pass', '已通过');
        } else if (obj.approval_state === '2') {
            return Intl.get('user.apply.reject', '已驳回');
        } else if (obj.approval_state === '3') {
            return Intl.get('user.apply.backout', '已撤销');
        }
    } else {
        return Intl.get('user.apply.false', '待审批');
    }
};

//客户名唯一性验证的提示信息
/**
 * @param existCustomerList 已存在的客户列表
 * @param checkNameError 客户名检验接口报错的提示
 * @param curCustomerName 当前输入的客户名
 * @param showRightPanel 点击客户名打开客户详情的方法
* */
exports.renderCustomerNameMsg = ( existCustomerList, checkNameError, curCustomerName, showRightPanel) => {
    if (existCustomerList.length) {
        let list = _.cloneDeep(existCustomerList);
        const sameCustomer = _.find(list, item => item.name === curCustomerName);
        const curUserId = userData.getUserData().user_id;
        let renderCustomerName = (customer) => {
            if (customer) {
                //如果是销售角色并且不是我的客户，只能看名字，不能看客户详情
                if (userData.hasRole(userData.ROLE_CONSTANS.SALES) && _.get(customer, 'user_id') !== curUserId) {
                    return (<span>{_.get(customer, 'name', '')} ({_.get(customer, 'user_name')})</span>);
                } else {//如果是管理员、运营或是我的客户，可以查看客户详情
                    return (
                        <a href="javascript:void(0)" onClick={showRightPanel.bind(this, _.get(customer, 'id'))} className="handle-btn-item">
                            {_.get(customer, 'name', '')}
                        </a>);
                }
            } else {
                return null;
            }
        };
        if(sameCustomer){
            list = _.filter(list, cur => cur.id !== sameCustomer.id);
        }
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

//线索唯一性验证的提示信息
/**
 * @param existClueList 已存在的线索列表
 * @param checkNameError 客户名检验接口报错的提示
 * @param curClueName 当前输入的线索名
 * @param showRightPanel 点击线索名打开线索详情的方法
 * */
exports.renderClueNameMsg = ( existClueList, checkNameError, curClueName, showRightPanel) => {
    if (existClueList.length) {
        let list = _.cloneDeep(existClueList);
        const sameCustomer = _.find(list, item => item.name === curClueName);
        const curUserId = userData.getUserData().user_id;
        let renderCustomerName = (clue) => {
            if (clue) {
                //如果是销售角色并且不是我的线索，只能看名字，不能看线索详情
                if (userData.hasRole(userData.ROLE_CONSTANS.SALES) && _.get(clue, 'user_id') !== curUserId) {
                    return (<span>{_.get(clue, 'name', '')} ({_.get(clue, 'user_name')})</span>);
                } else {//如果是管理员、运营或是我的客户，可以查看线索详情
                    return (
                        <a href="javascript:void(0)" onClick={showRightPanel.bind(this, clue)} className="handle-btn-item">
                            {_.get(clue, 'name', '')}
                        </a>);
                }
            } else {
                return null;
            }
        };
        if(sameCustomer){
            list = _.filter(list, cur => cur.id !== sameCustomer.id);
        }
        return (
            <div className="tip-customer-exist">
                <span className="tip-customer-error">{Intl.get('crm.sales.clue', '线索')}{sameCustomer ? Intl.get('crm.66', '已存在') : Intl.get('crm.67', '可能重复了')}，</span>
                {/*同名线索或相似线索的第一个*/}
                {renderCustomerName(sameCustomer || list.shift())}
                {_.get(list, 'length') ? (
                    <div>
                        {Intl.get('clue.customer.similar.clue.contains', '相似的线索还有')}:
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
            <div className="check-only-error"><ReactIntl.FormattedMessage id="clue.customer.check.only.fail" defaultMessage="线索名称唯一性校验出错"/>！
            </div>);
    } else {
        return '';
    }
};

/***
 * 是否是正式用户
 * @returns {boolean}
 */
exports.isFormalUser = () => {
    let organization = getOrganization();
    return _.isEqual(_.get(organization, 'version.type', ''), '正式');
};

//判断当前页面是否处于手机端或pad端的断点，用于响应式布局的展示
exports.isResponsiveDisplay = () => {
    let responsive = {};
    responsive.isWebMiddle = $(window).width() < RESPONSIVE_LAYOUT.MIDDLE_WIDTH;//浏览器是否处于pad端断点位置
    responsive.isWebMin = $(window).width() < RESPONSIVE_LAYOUT.MIN_WIDTH;//浏览器是否处于手机端断点位置
    return responsive;

};
//处理历史申请记录的数据
exports.handleHistoricalList = function(lists) {
    return _.filter(lists, item => {
        var replyList = _.get(item,'replyLists[0]');
        var targetObj = _.find(replyList,item => item.comment);
        if(targetObj){
            return true;
        }else{
            return false;
        }
    });
};
//判断当前版本，个人版/企业版
function checkCurrentVersion() {
    let organization = getOrganization();
    let version = _.get(organization, 'version', {});
    let name = _.get(version, 'name', '');
    //'个人试用',’企业试用‘
    //todo 暂时按照name字段进行判断，后期需要给定一个字段
    return {
        personal: new RegExp('个人').test(name),
        // company: new RegExp('企业').test(name),
        company: !new RegExp('个人').test(name),
    };
}
exports.checkCurrentVersion = checkCurrentVersion;

//判断当前版本类型，试用/正式
function checkCurrentVersionType() {
    let organization = getOrganization();
    let version = _.get(organization, 'version', {});
    let type = _.get(version, 'type', '');
    return {
        trial: _.isEqual(type, '试用'),
        formal: _.isEqual(type, '正式'),
    };

}
exports.checkCurrentVersionType = checkCurrentVersionType;


function checkVersionAndType() {
    let version = checkCurrentVersion();
    let type = checkCurrentVersionType();
    return {
        ...version,
        ...type,
        isPersonalTrial: version.personal && type.trial,
        isPersonalFormal: version.personal && type.formal,
        isCompanyTrial: version.company && type.trial,
        isCompanyFormal: version.company && type.formal,
    };
}

//返回版本信息及类型
exports.checkVersionAndType = checkVersionAndType;

// 渲染联系销售的提示内容, isOnlyTrial:只需要判断是试用版（导出线索的试用版都需要提示升级）
exports.getContactSalesPopoverTip = (isOnlyTrial) => {
    let currentVersionObj = checkVersionAndType();
    let tips = '';
    if (currentVersionObj.company) {//企业版
        let needUpgradeFlag = currentVersionObj.trial && isExpired();
        // 只需要判断是否是试用
        if(isOnlyTrial){
            needUpgradeFlag = currentVersionObj.trial;
        }
        if (needUpgradeFlag) {//需要升级的提示（企业试用或过期的企业试用）
            tips = Intl.get('payment.please.contact.our.sale.upgrade', '请联系我们的销售人员进行升级，联系方式：{contact}', { contact: COMPANY_PHONE });
        } else if (currentVersionObj.formal && isExpired()) {//正式账号过期
            tips = Intl.get('payment.please.contact.our.sale.renewal', '请联系我们的销售人员进行续费，联系方式：{contact}', { contact: COMPANY_PHONE });
        }
    }
    return tips;
};
// 账号是否过期
function isExpired(){
    return _.get(userData.getUserData(), 'organization.isExpired');
}
exports.isExpired = isExpired;

//获取日程打电话时需要的类型（customer/lead）和id
exports.getScheduleCallTypeId = function(scheduleItem) {
    let type = 'customer';
    let id = _.get(scheduleItem, 'customer_id', '');
    //如果客户id不存在，线索id存在，说明是线索的日程
    if (!id && _.get(scheduleItem,'lead_id','')) {
        type = 'lead';
        id = scheduleItem.lead_id;
    }
    return {id, type};
};

//获取某个安全域已经提取多少推荐线索数量,
exports.getRecommendClueCount = function(paramsObj = {},callback) {
    //如果是试用的账号，要获取今天的提取量，
    var submitObj = {
        timeStart: moment().startOf('day').valueOf(),
        timeEnd: moment().endOf('day').valueOf(),
    };
    const type = checkCurrentVersionType();
    //如果是正式账号，要获取本月的提取量
    if(type.formal){
        submitObj = {
            timeStart: moment().startOf('month').valueOf(),
            timeEnd: moment().endOf('month').valueOf(),
        };
    }
    submitObj = _.isEmpty(paramsObj) ? submitObj : paramsObj;

    $.ajax({
        url: '/rest/recommend/clue/count',
        dataType: 'json',
        type: 'get',
        data: submitObj,
        success: (data) => {
            var count = _.get(data,'total', 0);
            _.isFunction(callback) && callback({count: count, error: false});

        },
        error: (errorInfo) => {
            _.isFunction(callback) && callback({count: 0, error: true});
        }
    });
};

// 判断是否是客套组织
exports.isKetaoOrganizaion = () => {
    let organizationId = _.get(getOrganization(), 'id');
    return organizationId === ORGANIZATION_TYPE.KETAO;
};

// 变更记录
exports.recordChangeTimeLineItem = (item) => {
    let operateTime = _.get(item, 'record_time'); // 具体变的时间
    return (
        <dl>
            <dd>
                <p>
                    <ShearContent>
                        {_.get(item, 'content')}
                    </ShearContent>
                </p>
            </dd>
            <dt>{moment(operateTime).format(oplateConsts.TIME_FORMAT)}</dt>
        </dl>
    );
};
//展示时间的时候加上为空的判断
exports.timeShowFormat = (time,format) => {
    return time ? moment(time).format(format) : '';
};

// 是否显示公告未读信息
exports.isShowUnReadNotice = () => {
    const websiteConfig = getLocalWebsiteConfig() || {};
    return _.get(websiteConfig, 'last_upgrade_notice_time', 0) > _.get(websiteConfig, 'show_notice_time', 0);
};

// 是否显示通知tab
exports.isShowSystemTab = () => {
    return Oplate.isCurtao !== 'true' && hasPrivilege(useManagePrivilege.USER_QUERY) && hasPrivilege(notificationPrivilege.CUSTOMER_NOTICE_MANAGE);
};

// 选择应用后，获取配置类型
exports.getConfigAppType = (selectedAppIds, selectedAppList) => {
    let configType = CONFIG_TYPE.UNIFIED_CONFIG;
    let hasTerminals = _.find(selectedAppList, item => !_.isEmpty(item.terminals));
    if (selectedAppIds.length > 1 && hasTerminals) {
        configType = CONFIG_TYPE.SEPARATE_CONFIG;
    }
    return configType;
};

// 申请产品，选择的多终端类型
exports.applyAppConfigTerminal = (terminals, appId, appList) => {
    let matchApp = _.find(appList, item => item.app_id === appId);
    let configTerminals = [];
    if (matchApp && !_.isEmpty(matchApp.terminals)) {
        _.each(terminals, id => {
            let matchTerminals = _.find(matchApp.terminals, item => item.id === id);
            if (matchTerminals) {
                configTerminals.push(matchTerminals);
            }
        });
    }
    return configTerminals;
};

// 审批时，根据申请的应用，显示对应的多终端信息
exports.approveAppConfigTerminal = (appId, appList) => {
    let matchApp = _.find(appList, item => item.app_id === appId);
    let configTerminals = [];
    if (matchApp && !_.isEmpty(matchApp.terminals)) {
        configTerminals = matchApp.terminals;
    }
    return configTerminals;
};

//获取延期时间
exports.getDelayTimeUnit = (delayTimeRange, delayTimeNumber) => {
    //延期周期
    let delayUnit = `${delayTimeNumber}${delayTimeRange}`;
    //如果是选择了周，要把周换成天
    if(delayTimeRange === TIMERANGEUNIT.WEEK){
        delayUnit = `${delayTimeNumber * WEEKDAYS}${TIMERANGEUNIT.DAY}`;
    }
    return delayUnit;
};
//是否是自定义的延期类型
exports.isCustomDelayType = (type) => {
    return type === TIMERANGEUNIT.CUSTOM;
};

/**
 * 添加、修改、删除团队（部门）信息后，修改缓存中的数据
 * 注意：部门和团队说的是一回事，由于原来的变量名是根据team命名的
 * 参数说明：
 * teamTreeList 已有的团队信息
 *  modifyData 修改的数据
 *  flag 是添加、修改、删除的标志
 * */
function saveTraversingTeamTree(teamTreeList, modifyData, flag) {
    if (flag === 'create') { // 添加
        let isRootTeam = _.get(modifyData, 'root_group');
        if (isRootTeam) { // 添加的是根团队（根部门）
            teamTreeList.push(modifyData);
        } else { // 添加子团队（子部门）
            _.find(teamTreeList, team => {
                let childGroups = _.get(team, 'child_groups', []);
                if (_.get(team, 'group_id') === _.get(modifyData, 'parent_group')) {
                    childGroups.push(modifyData);
                } else {
                    if (childGroups) {
                        saveTraversingTeamTree(childGroups, modifyData, flag);
                    }
                }
            });
        }
    } else {
        if (!_.isEmpty(teamTreeList)) {
            _.find(teamTreeList, team => {
                if (_.get(team, 'group_id') === _.get(modifyData, 'group_id')) {
                    if (flag === 'edit') {
                        team.group_name = _.get(modifyData, 'group_name');
                    } else if (flag === 'delete'){
                        _.remove(teamTreeList, team);
                    }
                } else {
                    if (team.child_groups) {
                        saveTraversingTeamTree(team.child_groups, modifyData, flag);
                    }
                }
            });
        }
    }
    //保存到userData中
    setUserData(MY_TEAM_TREE_KEY, teamTreeList);
}

exports.saveTraversingTeamTree = saveTraversingTeamTree;

/***
 * 获取表单填写情况的聚合信息
 * @param formData 表单数据
 * @param fields  需要聚合的字段数组
 [{
    key: 'startTime', //字段名
    label: '注册时间', // 表单标签的文本
    processValue: condition => {
        return condition.startTime ? `${moment(condition.startTime).format(oplateConsts.DATE_FORMAT)} - ${moment(condition.endTime).format(oplateConsts.DATE_FORMAT)}` : '';
    }
 }]
 * @returns {string} 聚合后的字符串
 */
exports.getFormattedCondition = (formData, fields) => {
    let result = [];
    _.each(fields, filed => {
        let label = _.get(filed,'label', '');
        label = label ? `${label}: ` : '';
        let value = _.get(formData, filed.key, '');

        if(_.get(filed, 'separator')) {//如果有分隔符
            let data = _.get(formData, filed.key, []);
            value = _.join(data, filed.separator) || '';
        }

        if(_.isFunction(filed.processValue)) {//有处理函数
            value = filed.processValue(formData) || '';
        }

        if(value) {
            label += value;

            result.push(label);
        }
    });

    return _.filter(result, item => item).join(' ');
};
/**
 * 返回团队以及子团队中所有启用的成员
 * 参数说明：
 * selectedTeam 选择的所选团队ids以及团队全部信息
 *  memberList 全部成员
 * */
exports.selectedTeamTreeAllMember = (selectedTeam, memberList) => {
    let selectedTeamMember = [];
    let selectedTeamIds = _.get(selectedTeam, 'selectedTeamIds'); // 所选团队的id
    let teamLists = _.get(selectedTeam, 'teamLists'); // 所有团队成员
    // 筛选出所选择的团队以及下级团队的成员信息
    let selectedTeamArray = _.filter(teamLists, team => _.indexOf(selectedTeamIds, team.group_id) !== -1);
    _.each(selectedTeamArray, team => {
        let ownerId = _.get(team, 'owner_id'); // 负责人
        let managerIds = _.get(team, 'manager_ids'); // 舆情秘书
        let userIds = _.get(team, 'user_ids'); // 成员
        let selectedTeamMemberIds = ownerId ? _.concat(ownerId, managerIds, userIds) : _.concat(managerIds, userIds);
        // 每个团队，遍历一次成员数据，是为了成员的显示顺序和团队对应起来
        // 比如：选择销售部，需要显示销售总监（迟洲振），再显示子团队的成员信息
        _.each(memberList, member => {
            if (_.get(member, 'status') && _.indexOf(selectedTeamMemberIds, member.user_id) !== -1) {
                selectedTeamMember.push({
                    name: member.nick_name,
                    id: member.user_id,
                    user_name: member.user_name
                });
            }
        });
    });
    return selectedTeamMember;
};
//把时间戳的秒数都统一改成0秒
exports.getTimeWithSecondZero = function(value) {
    return moment(value).set('second', 0).valueOf();
};
//计算一下各个外出客户的时长是否小于总外出时长及各个外出客户的时长是否有重复
exports.checkCustomerTotalLeaveTime = function(startTime,endTime,customers,isAdd) {
    var totalRange = endTime - startTime;
    var customerSelectRange = 0, //customerSelectRange 各个客户外出时间总和
        isOverRide = false;//isOverRide 是否时间有重复
    _.each(customers, (customerItem,index) => {
        var startTime = customerItem.visit_start_time;
        var endTime = customerItem.visit_end_time;
        isOverRide = _.some(customers,(item,customerIndex) => {
            var start = _.get(item,'visit_start_time');
            var end = _.get(item,'visit_end_time');
            return customerIndex !== index && (_.inRange(startTime, start, end) || _.inRange(endTime, start, end));
        });
    });
    if(isOverRide){
        return {
            errTip: Intl.get('business.leave.time.no.overlay', '外出时间不要重复')
        };
    }else if(isAdd){
        customerSelectRange = _.reduce(customers, (customerSelectRange, customerItem) => {
            return customerSelectRange + (customerItem.visit_end_time - customerItem.visit_start_time);
        },customerSelectRange);

        if(customerSelectRange === totalRange){
            return {
                errTip: Intl.get('business.change.total.time', '请修改时间再添加')
            };
        }
    }
};

// 是否显示赢线索活动
// 判断依据：试用（个人和企业）并且不是运营角色
exports.isShowWinningClue = () => {
    const versionAndType = checkVersionAndType();
    // 赢线索活动截止到2020-03-31, 直接加了false判断，不显示赢线索活动了
    // 要是以后再显示赢线索活动，需要去掉false
    return false && versionAndType.trial && !userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
};

// 是否已经赢取了最大的线索量
exports.isWinningClueMaxCount = () => {
    let isShowRewardClueTips = true;
    let todayWinningClueCount = _.get(Oplate, 'todayWinningClueCount', 0);
    if (todayWinningClueCount >= winningClueMaxCount) {
        isShowRewardClueTips = false;
    } else {
        Oplate.todayWinningClueCount += 2;
    }
    return isShowRewardClueTips;
};

// 判断是否修改了应用的配置信息
// 若修改了，则需要触发修改应用配置事件
exports.isModifyAppConfig = (originalData, configType ,value) => {
    const originalValue = _.get(originalData,`${configType}.value`); // 原始值
    if (!_.isEqual(originalValue, value)) {
        modifyAppConfigEmitter.emit(modifyAppConfigEmitter.MODIFY_APP_CONFIG);
    }
};

exports.downloadFile = function(id, url) {
    let downloadIFrameId = '_DOWNLOAD_IFRAME_' + id;
    let downloadIFrame = $('iframe[id=\'' + downloadIFrameId + '\']:first');
    let lastDownloadTime = downloadIFrame.data('lastDownloadTime');

    if (!downloadIFrame.length) {
        downloadIFrame = $('<iframe style=\'display:none\' />').attr('id', downloadIFrameId).appendTo($('body'));
    }

    if (!_.isNumber(lastDownloadTime) || lastDownloadTime + 1000 < $.now()) {
        downloadIFrame.data('lastDownloadTime', $.now()).get(0).contentWindow.location.replace(url);
        return true;
    } else {
        return false;
    }
};
//个人试用升级为正式版
exports.handleUpgradePersonalVersion = function(tipTitle) {
    paymentEmitter.emit(paymentEmitter.OPEN_UPGRADE_PERSONAL_VERSION_PANEL, {
        showDifferentVersion: triggerShowVersionInfo,
        leftTitle: tipTitle,
    });
};
//显示/隐藏版本信息面板
const triggerShowVersionInfo = function(isShowModal = true) {
    paymentEmitter.emit(paymentEmitter.OPEN_APPLY_TRY_PANEL, {isShowModal, versionKind: COMPANY_VERSION_KIND});
};
exports.triggerShowVersionInfo = triggerShowVersionInfo;
