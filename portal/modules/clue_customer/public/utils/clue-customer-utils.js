//客户名格式验证
import {nameRegex, ipRegex} from 'PUB_DIR/sources/utils/validate-util';
const hasPrivilege = require('../../../../components/privilege/checker').hasPrivilege;
import clueCustomerAction from '../action/clue-customer-action';
var userData = require('PUB_DIR/sources/user-data');
import { storageUtil } from 'ant-utils';
const local = storageUtil.local;
import {clueNameContactRule} from 'PUB_DIR/sources/utils/validate-util';
import cluePrivilegeConst from 'MOD_DIR/clue_customer/public/privilege-const';
import { checkCurrentVersion, checkVersionAndType } from 'PUB_DIR/sources/utils/common-method-util';
export const SESSION_STORAGE_CLUE_SALES_SELECTED = 'clue_assign_selected_sales';
export const checkClueName = function(rule, value, callback) {
    value = _.trim(value);
    if (value) {
        if (nameRegex.test(value)) {
            callback();
        } else {
            callback(new Error(Intl.get('clue.name.rule', '线索名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号等字符，且长度在1到50（包括50）之间')));
        }
    }
    else{
        callback();
    }
};

export const checkClueSourceIP = function(rule, value, callback) {
    value = _.trim(value);
    if (value) {
        if (ipRegex.test(value)) {
            callback();
        } else {
            callback(new Error(Intl.get('config.manage.input.ip', '请输入有效的IP（eg:192.168.1.9）')));
        }
    }
    else{
        callback();
    }
};
export const checkQQ = function(rule, value, callback) {
    value = _.trim(value);
    if (value){
        if (!(/[1-9][0-9]{4,}$/.test(value))){
            callback(new Error(Intl.get('common.correct.qq', '请输入正确的QQ号')));
        }else{
            callback();
        }
    }else{
        callback();
    }
};
export const checkEmail = function(rule, value, callback) {
    value = _.trim(value);
    if (value) {
        if (!/^(((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(,((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)*$/i
            .test(value)) {
            callback(new Error(Intl.get('common.correct.email', '请输入正确的邮箱')));
        } else {
            callback();
        }
    } else {
        callback();
    }
};

// 全部 "" 待分配 0 待跟进 1 已跟进 2 已转化  3
export const SELECT_TYPE = {
    ALL: '',
    WILL_DISTRIBUTE: '0',
    WILL_TRACE: '1',
    HAS_TRACE: '2',
    HAS_TRANSFER: '3',
    WAIT_ME_HANDLE: 'waitMeHandle'
};
//要加数字的线索类型
export const ADD_SELECT_TYPE = {
    WILL_DISTRIBUTE: '0',
    WILL_TRACE: '1',
    HAS_TRACE: '2',
    HAS_TRANSFER: '3',
    INVALID_CLUE: 'invalid_clue'
};
//要展示增加数字效果的
export const isNotHasTransferStatus = function(salesClueItem){
    // 线索类型的判断
    return salesClueItem.status !== SELECT_TYPE.HAS_TRANSFER && salesClueItem.clue_type !== 'clue_pool';
};
export const editCluePrivilege = function(clueItem) {
    return isNotHasTransferStatus(clueItem) && clueItem.availability === AVALIBILITYSTATUS.AVALIBILITY;
};
// 判断是否为普通销售或者是个人版本
export const isCommonSalesOrPersonnalVersion = () => {
    return userData.getUserData().isCommonSales || checkVersionAndType().personal;
};
//分配线索的权限
export const assignSalesPrivilege = (curClue) => {
    let user = userData.getUserData();
    return (hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_DISTRIBUTE_SELF) || (hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_DISTRIBUTE_ALL) && !isCommonSalesOrPersonnalVersion())) && editCluePrivilege(curClue);
};
//渲染释放线索的权限
export const freedCluePrivilege = () => {
    return hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_POOL_ALL) || hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_POOL_SELF);
};
//删除线索的权限
export const deleteCluePrivilege = () => {
    return hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_DELETE);
};
//能有展示删除线索按钮的权限
export const deleteClueIconPrivilege = (clue) => {
    return deleteCluePrivilege() && editCluePrivilege(clue);
};
//标记线索有效或者无效的权限
export const avalibilityCluePrivilege = () => {
    return hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_UPDATE_AVAILABILITY_ALL) || hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_UPDATE_AVAILABILITY_SELF);
};
//线索转客户的权限
export const transferClueToCustomerIconPrivilege = (clue) => {
    return hasPrivilege(cluePrivilegeConst.LEAD_TRANSFER_MERGE_CUSTOMER) && editCluePrivilege(clue);
};
//添加线索的权限
export const addCluePrivilege = () => {
    return hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_ADD);
};
//修改线索基本资料的权限
export const editClueItemIconPrivilege = (clue) => {
    return hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_UPDATE_ALL) && editCluePrivilege(clue);
};

export const CLUE_DIFF_TYPE = [
    {
        name: Intl.get('sales.home.will.trace', '待跟进'),
        value: SELECT_TYPE.WILL_TRACE,
    },
    {
        name: Intl.get('clue.customer.has.follow', '已跟进'),
        value: SELECT_TYPE.HAS_TRACE,
    },
    {
        name: Intl.get('clue.customer.has.transfer', '已转化'),
        value: SELECT_TYPE.HAS_TRANSFER,
    }];
//线索的有效还是无效状态
export const AVALIBILITYSTATUS = {
    AVALIBILITY: '0',//有效线索
    INAVALIBILITY: '1'//无效线索
};
//带我处理
export const NEED_MY_HANDLE = '0';
//是否是运营人员
export const isOperation = function(){
    return userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
};
//是否是销售领导或者管理员
export const isSalesLeaderOrManager = function(){
    return !userData.getUserData().isCommonSales || userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN);
};
//获取所选中线索状态的状态值
export const getClueStatusValue = (filterClueStatus) => {
    var typeFilter = {};
    var targetObj = _.find(filterClueStatus, (item) => {
        return item.selected;
    });
    if (targetObj){
        typeFilter['status'] = targetObj.value;
    }else{
        typeFilter['status'] = '';
    }
    return typeFilter;
};
//开始时间应该设置为0
export const clueStartTime = 0;
export const getClueSalesList = function(sessionKey) {
    let clueSalesIdList = [];
    if(_.isEmpty(sessionKey)) {
        clueSalesIdList = local.get(SESSION_STORAGE_CLUE_SALES_SELECTED);
    } else {
        clueSalesIdList = local.get(sessionKey);
    }
    if(!clueSalesIdList) {
        clueSalesIdList = [];
    } else {
        try {
            clueSalesIdList = JSON.parse(clueSalesIdList);
        } finally{
            if(!_.isArray(clueSalesIdList)) {
                clueSalesIdList = [];
            }
        }
    }
    return clueSalesIdList;
};

//获取localstorage中的销售的点击数
export const getLocalSalesClickCount = function(clueSalesIdList, sale_id) {
    var targetObj = _.find(clueSalesIdList,(item) => {
        return item.saleId === sale_id;
    });
    var clickCount = 0;
    if (!_.isEmpty(targetObj)){
        clickCount = targetObj.clickCount;
    }
    return clickCount;
};
export const SetLocalSalesClickCount = function(sale_id, sessionKey) {
    var clueSalesIdList = getClueSalesList(sessionKey);
    var targetObj = _.find(clueSalesIdList,(item) => {
        return item.saleId === sale_id;
    });
    if (!_.isEmpty(targetObj)){
        targetObj.clickCount++;
    }else{
        clueSalesIdList.push({
            saleId: sale_id,
            clickCount: 1
        });
    }
    if(_.isEmpty(sessionKey)) {
        local.set(SESSION_STORAGE_CLUE_SALES_SELECTED,JSON.stringify(clueSalesIdList));
    } else {
        local.set(sessionKey,JSON.stringify(clueSalesIdList));
    }
};
export const handleSubmitContactData = function(submitObj){
    var data = {},updateObj = {};
    updateObj.id = submitObj.id;
    //联系人的id
    updateObj.contacts = [{'id': submitObj.contact_id}];
    delete submitObj.contact_id;
    var clueName = '';
    if (submitObj.clueName){
        clueName = submitObj.clueName;
        delete submitObj.clueName;
    }
    for (var key in submitObj){
        //要更新的字段
        data.updateItem = key;
        if (key === 'contact_name'){
            //联系人的名字
            updateObj.contacts[0]['name'] = submitObj[key];
        }else{
            //过滤掉值为空
            if (_.isArray(submitObj[key])){
                submitObj[key] = submitObj[key].filter(item => item);
                updateObj.contacts[0][key] = submitObj[key];
            }
        }
    }
    if (clueName){
        updateObj.name = clueName;
    }
    data.updateObj = JSON.stringify(updateObj);
    data.type = handlePrivilegeType();
    return data;
};
export const handlePrivilegeType = function(isMarkingAvalibility) {
    var type = 'user';
    if (isMarkingAvalibility){
        if (hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_UPDATE_ALL)){
            type = 'manager';
        }
    }else{
        if (hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_UPDATE_ALL)){
            type = 'manager';
        }
    }
    return type;
};
export const handleSubmitClueItemData = function(submitObj,isMarkingAvalibility){
    var data = {}, updateObj = {}, isMarkingAvalibility = false;
    updateObj.id = submitObj.id || submitObj.user_id;
    delete submitObj.id;
    delete submitObj.user_id;
    isMarkingAvalibility = _.has(submitObj, 'availability');
    var clueContact = [];
    if (submitObj.clueContact) {
        clueContact = submitObj.clueContact;
        delete submitObj.clueContact;
    }
    if (_.get(clueContact, '[0]')) {
        updateObj.contacts = clueContact;
    }
    for (var key in submitObj) {
        data.updateItem = key;
        updateObj[key] = submitObj[key];
    }
    if(submitObj['province'] || submitObj['city'] || submitObj['county']){
        data.updateItem = 'province';
    }
    data.updateObj = JSON.stringify(updateObj);
    data.type = handlePrivilegeType(isMarkingAvalibility);
    return data;
};
export const contactNameRule = function() {
    return [clueNameContactRule,{required: true,
        message: Intl.get('crm.90', '请输入姓名')}];
};
const TENTHOUSAND = 10000;
export const staffSize = [
    {
        name: Intl.get('common.all', '全部'),
    },
    {
        name: Intl.get('clue.customer.condition.staff.size', '{num}人以下', {num: 20}),
        staffnumMax: 20
    },
    {
        name: Intl.get('clue.customer.condition.staff.range', '{min}-{max}人', {min: 20, max: 99}),
        staffnumMin: 20,
        staffnumMax: 99
    },
    {
        name: Intl.get('clue.customer.condition.staff.range', '{min}-{max}人', {min: 100, max: 499}),
        staffnumMin: 100,
        staffnumMax: 499
    },
    {
        name: Intl.get('clue.customer.condition.staff.range', '{min}-{max}人', {min: 500, max: 999}),
        staffnumMin: 500,
        staffnumMax: 999
    },
    {
        name: Intl.get('clue.customer.condition.staff.range', '{min}-{max}人', {min: 1000, max: 9999}),
        staffnumMin: 1000,
        staffnumMax: 9999
    },
    {
        name: Intl.get('clue.customer.staff.over.num', '{num}人以上', {num: TENTHOUSAND}),
        staffnumMin: TENTHOUSAND
    }
];

export const moneySize = [
    {
        name: Intl.get('common.all', '全部'),
    },
    {
        name: Intl.get('clue.customer.money.size.less.num', '{num}万以内', {num: 10}),
        capitalMax: 10 * TENTHOUSAND
    },
    {
        name: Intl.get('clue.customer.conditoion.money.range', '{min}-{max}万', {min: 10, max: 100}),
        capitalMin: 10 * TENTHOUSAND,
        capitalMax: 100 * TENTHOUSAND
    },
    {
        name: Intl.get('clue.customer.conditoion.money.range', '{min}-{max}万', {min: 100, max: 1000}),
        capitalMin: 100 * TENTHOUSAND,
        capitalMax: 1000 * TENTHOUSAND
    },
    {
        name: Intl.get('clue.customer.conditoion.money.range', '{min}-{max}万', {min: 1000, max: 5000}),
        capitalMin: 1000 * TENTHOUSAND,
        capitalMax: 5000 * TENTHOUSAND
    },
    {
        name: Intl.get('clue.customer.condition.over.num', '{num}万及以上', {num: 5000}),
        capitalMin: 5000 * TENTHOUSAND,
    },
];
export const companyProperty = [
    {
        name: Intl.get('clue.customer.condition.company.limit', '有限责任公司'),
        value: Intl.get('clue.customer.condition.company.limit', '有限责任公司')
    },
    {
        name: Intl.get('clue.customer.condition.company.share', '股份有限公司'),
        value: Intl.get('clue.customer.condition.company.share', '股份有限公司')
    },
    {
        name: Intl.get('clue.customer.condition.company.enterprise', '国企'),
        value: Intl.get('clue.customer.condition.company.nationalized', '国有')
    },
    {
        name: Intl.get('clue.customer.condition.company.foreign.invested', '外商投资企业'),
        value: Intl.get('clue.customer.condition.company.foreign.invested', '外商投资企业')
    },
    {
        name: Intl.get('clue.customer.condition.company.sole.proprietorship', '个人独资企业'),
        value: Intl.get('clue.customer.condition.company.sole.proprietorship', '个人独资企业')
    },
    {
        name: Intl.get('clue.customer.condition.company.individual.businessmen', '个体工商户'),
        value: Intl.get('clue.customer.condition.company.individual.businessmen', '个体工商户')
    },
    {
        name: Intl.get('clue.customer.condition.company.collective.ownership', '集体所有制'),
        value: Intl.get('clue.customer.condition.company.collective.ownership', '集体所有制')
    },
    {
        name: Intl.get('clue.customer.condition.company.limited.partnership', '有限合伙'),
        value: Intl.get('clue.customer.condition.company.limited.partnership', '有限合伙')
    },
    {
        name: Intl.get('clue.customer.condition.company.general.partnership', '普通合伙'),
        value: Intl.get('clue.customer.condition.company.general.partnership', '普通合伙')
    },
    {
        name: Intl.get('clue.customer.condition.company.other', '其他'),
        value: Intl.get('clue.customer.condition.company.not.above.type', '非上述类型')
    }
];
export const deleteEmptyProperty = function(data) {
    for (var key in data){
        if (data[key] === null){
            delete data[key];
        }
    }
};
export const COMMON_OTHER_ITEM = 'otherSelectedItem';
export const SIMILAR_CUSTOMER = '有相似客户';
export const SIMILAR_CLUE = '有相似线索';
export const clueStatusTabNum = [{
    numName: 'invalidClue',
    status: 'invalidClue',
},{
    numName: 'willDistribute',
    status: SELECT_TYPE.WILL_DISTRIBUTE,
},{
    numName: 'willTrace',
    status: SELECT_TYPE.WILL_TRACE,
},{
    numName: 'hasTrace',
    status: SELECT_TYPE.HAS_TRACE,
},{
    numName: 'hasTransfer',
    status: SELECT_TYPE.HAS_TRANSFER,
},];
//集客类型后端存储的数据
export const SOURCE_CLASSIFY = {
    INBOUND: 'inbound',
    OUTBOUND: 'outbound',
    OTHER: 'other'
};
//集客方式下拉列表
const sourceClassifyWithoutOtherArray = [
    {
        title: Intl.get('crm.clue.client.source.outbound', '自拓'),
        value: SOURCE_CLASSIFY.OUTBOUND
    }, {
        title: Intl.get('crm.clue.client.source.inbound', '市场'),
        value: SOURCE_CLASSIFY.INBOUND
    }];
//集客方式
export const sourceClassifyArray = [
    {
        name: Intl.get('crm.clue.client.source.inbound', '市场'),
        value: SOURCE_CLASSIFY.INBOUND
    },{
        name: Intl.get( 'crm.clue.client.source.outbound', '自拓'),
        value: SOURCE_CLASSIFY.OUTBOUND
    },{
        name: Intl.get( 'crm.clue.client.source.other', '未知'),
        value: SOURCE_CLASSIFY.OTHER
    }
];
//集客方式options
export const sourceClassifyOptions = sourceClassifyWithoutOtherArray.map((source, index) => {
    return (<Option value={source.value} key={index}>{source.title}</Option>);
});
export const FLOW_FLY_TIME = 800;//增加一个数字的动画时长
export const HIDE_CLUE_TIME = 2000;
//释放线索的提示
export function releaseClueTip() {
    let releaseTip = Intl.get('clue.customer.release.confirm.tip','释放到线索池后，其他人也可以查看、提取，您确定要释放吗？');
    if(checkCurrentVersion().personal) {//个人版
        releaseTip = Intl.get('clue.customer.personal.release.confirm.tip', '释放后可以再从线索池提取');
    }
    return releaseTip;
}
//检查是否已选中了条件
export const CLUE_CONDITION = ['name','startTime','endTime','entTypes','staffnumMax','staffnumMin','capitalMin','capitalMax'];
export const ADD_INDUSTRY_ADDRESS_CLUE_CONDITION = _.concat(['industrys','province','city','district'],CLUE_CONDITION);
export const checkClueCondition = (checkConditionItem,settedCondition) => {
    var hasCondition = false;
    hasCondition = _.some(checkConditionItem, key => {
        //针对checkConditionItem中的不同的key，hasSavedRecommendParams[key]会有不同的类型，可能是数组，也可能是字符串（空字符串需要return false），也可能是数字（数字是0 需要return false）
        if(_.get(settedCondition, [key]) || _.get(settedCondition, `[${key}][0]`)) {
            return true;
        }
    });
    return hasCondition;
};