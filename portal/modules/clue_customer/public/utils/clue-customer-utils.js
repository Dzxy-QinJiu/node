//客户名格式验证
import {nameRegex, ipRegex} from 'PUB_DIR/sources/utils/validate-util';
const hasPrivilege = require('../../../../components/privilege/checker').hasPrivilege;
import clueCustomerAction from '../action/clue-customer-action';
var userData = require('PUB_DIR/sources/user-data');
import { storageUtil } from 'ant-utils';
const local = storageUtil.local;
import {clueNameContactRule,cluePositionContactRule} from 'PUB_DIR/sources/utils/validate-util';
import cluePrivilegeConst from 'MOD_DIR/clue_customer/public/privilege-const';
import { checkCurrentVersion, checkVersionAndType, isSalesRole } from 'PUB_DIR/sources/utils/common-method-util';
export const SESSION_STORAGE_CLUE_SALES_SELECTED = 'clue_assign_selected_sales';
import {isSupportCheckPhone} from 'PUB_DIR/sources/utils/validate-util';
import {PHONE_STATUS_MAP, PHONE_STATUS_KEY} from 'PUB_DIR/sources/utils/consts';

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
// 判断是否为销售或者是个人版本
export const isSalesOrPersonnalVersion = () => {
    return isSalesRole() || checkVersionAndType().personal;
};

//分配线索的权限
export const assignSalesPrivilege = (curClue) => {
    let user = userData.getUserData();
    return (hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_DISTRIBUTE_SELF) || hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_DISTRIBUTE_ALL)) && !isCommonSalesOrPersonnalVersion() && editCluePrivilege(curClue);
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
    return (hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_UPDATE_ALL) || hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_UPDATE_SELF)) && editCluePrivilege(clue);
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
            //过滤掉值为空 除了职务其他属性都是数组
            if (_.isArray(submitObj[key])){
                submitObj[key] = submitObj[key].filter(item => item);
                updateObj.contacts[0][key] = submitObj[key];
            }else if(!_.isEmpty(submitObj[key]) && key !== 'id'){
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
    // 是否更新了自定义字段
    if (submitObj.custom_variables) {
        updateObj.custom_variables = _.get(submitObj, 'custom_variables');
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
export const contactPositionRule = function() {
    return [cluePositionContactRule];
};

const TENTHOUSAND = 10000;
//成立时间
export const registerSize = [
    {
        name: Intl.get('clue.recommend.filter.name.no.limit', '{name}不限', {name: Intl.get('clue.recommend.established.time', '成立时间')})
    },
    {
        name: Intl.get('clue.recommend.condition.register.size', '{num}年以内', {num: 1}),
        max: 1
    },
    {
        name: Intl.get('clue.recommend.condition.register.range', '{min}-{max}年', {min: 1, max: 3}),
        min: 1, max: 3
    },
    {
        name: Intl.get('clue.recommend.condition.register.range', '{min}-{max}年', {min: 3, max: 5}),
        min: 3, max: 5
    },
    {
        name: Intl.get('clue.recommend.condition.register.range', '{min}-{max}年', {min: 5, max: 10}),
        min: 5, max: 10
    },
    {
        name: Intl.get('clue.recommend.condition.register.over.num', '{num}年以上', {num: 10}),
        min: 10
    },
];
//公司规模
export const staffSize = [
    {
        name: Intl.get('clue.recommend.filter.name.no.limit', '{name}不限', {name: Intl.get('clue.recommend.company.size', '公司规模')})
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
//注册资本
export const moneySize = [
    {
        name: Intl.get('clue.recommend.filter.name.no.limit', '{name}不限', {name: Intl.get('clue.recommend.registered.capital', '注册资本')})
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
//企业类型
export const companyProperty = [
    { name: Intl.get('clue.recommend.filter.name.no.limit', '{name}不限', {name: Intl.get('clue.recommend.enterprise.class', '企业类型')}) },
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
//企业状态
export const companyStatus = [
    { name: Intl.get('clue.recommend.filter.name.no.limit', '{name}不限', {name: Intl.get('clue.recommend.filter.company.status', '企业状态')}) },
    {
        name: Intl.get('clue.recommend.filter.company.status.survival', '存续'),
        value: '存续'
    },
    {
        name: Intl.get('clue.recommend.filter.company.status.employment', '在业'),
        value: '在业'
    },
    {
        name: Intl.get('clue.recommend.filter.company.status.revoked', '吊销'),
        value: '吊销'
    },
    {
        name: Intl.get('clue.recommend.filter.company.status.cancellation', '注销'),
        value: '注销'
    },
    {
        name: Intl.get('clue.recommend.filter.company.status.immigration', '迁入'),
        value: '迁入'
    },
    {
        name: Intl.get('clue.recommend.filter.company.status.out', '迁出'),
        value: '迁出'
    },
    {
        name: Intl.get('clue.recommend.filter.company.status.closed', '停业'),
        value: '停业'
    },
    {
        name: Intl.get('clue.recommend.filter.company.status.liquidation', '清算'),
        value: '清算'
    },
    {
        name: Intl.get('common.others', '其他'),
        value: '其他'
    },
];

//线索推荐面板的静态常量集合
export const EXTRACT_CLUE_CONST_MAP = {
    ANOTHER_BATCH: 'anotherBatch',//换一批
    LAST_HALF_YEAR_REGISTER: '近半年注册',
    RESET: 'reset',//重置
};
//处理推荐线索条件
export const handleRecommendClueFilters = function(condition) {
    //需要处理筛选条件，兼容以前的industrys，改为现在的keyword
    if(_.get(condition,'industrys[0]')) {
        condition.keyword = condition.industrys[0];
        delete condition.industrys;
    }
    //需要处理下公司名，现在新版不支持公司名搜索，所以需要去掉该字段
    if(_.get(condition, 'name')) {
        delete condition.name;
    }
    //需要处理下feature，判断是否存在热门标签里，不存在就去掉改字段
    let feature = _.find(ADVANCED_OPTIONS, option => _.isEqual(option.value, _.get(condition, 'feature')));
    if (!feature && _.isObject(condition)) {
        delete condition.feature;
    }
};

export const deleteEmptyProperty = function(data) {
    for (var key in data){
        if (data[key] === null){
            delete data[key];
        }
    }
};
export const COMMON_OTHER_ITEM = 'otherSelectedItem';
export const SIMILAR_CUSTOMER = 'similarCustomer';
export const SIMILAR_CLUE = 'similarClue';
export const SIMILAR_IP = 'similarIP';
export const EXTRACT_TIME = 'getLeadFromLeadPool';
export const APPLY_TRY_LEAD = 'applyTryEnterprise';
export const NOT_CONNECTED = Intl.get('clue.customer.not.connect.phone', '未打通电话的线索');
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
//获客类型后端存储的数据
export const SOURCE_CLASSIFY = {
    INBOUND: 'inbound',
    OUTBOUND: 'outbound',
    OTHER: 'other'
};
//获客方式下拉列表
const sourceClassifyWithoutOtherArray = [
    {
        title: Intl.get('crm.clue.client.source.outbound', '自拓'),
        value: SOURCE_CLASSIFY.OUTBOUND
    }, {
        title: Intl.get('crm.clue.client.source.inbound', '市场'),
        value: SOURCE_CLASSIFY.INBOUND
    }];
//获客方式
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
export const otherFilterArray = [
    {
        name: Intl.get('clue.filter.wait.me.handle', '待我处理'),
        value: SELECT_TYPE.WAIT_ME_HANDLE
    },{
        name: Intl.get( 'clue.has.similar.customer','有相似客户'),
        value: SIMILAR_CUSTOMER
    },{
        name: Intl.get('clue.has.similar.clue','有相似线索'),
        value: SIMILAR_CLUE
    },{
        name: Intl.get('clue.has.similar.ip','有相同IP线索'),
        value: SIMILAR_IP
    },{
        name: Intl.get('clue.customer.not.connect.phone', '未打通电话的线索'),
        value: NOT_CONNECTED
    },{
        name: Intl.get('crm.filter.extract.from.lead.pool','从线索池中提取的线索'),
        value: EXTRACT_TIME
    }
];
//获客方式options
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
export const CLUE_CONDITION = ['name','startTime','endTime','entTypes','staffnumMax','staffnumMin','capitalMin','capitalMax', 'openStatus'];
export const ADD_INDUSTRY_ADDRESS_CLUE_CONDITION = _.concat(['keyword', 'industrys','province','city','district'],CLUE_CONDITION);
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

//已被其他同事提取的错误提示
export const HASEXTRACTBYOTHERERRTIP = [Intl.get('errorcode.169', '该线索已被提取'),Intl.get('errorcode.170', '您选择的线索都已经被提取')];

export const VERSIONS = {
    'starter': Intl.get('versions.starter','基础版'),
    'professional': Intl.get('versions.professional','专业版'),
    'enterprise': Intl.get('versions.enterprise','企业版')
};

//是否有推荐线索的权限
export const hasRecommendPrivilege = () => {
    return !userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON) && hasPrivilege(cluePrivilegeConst.CURTAO_CRM_COMPANY_STORAGE);
};

//是否有检测空号的权限
export const hasCheckPhoneStatusPrivilege = (curStatus) => {
    //只有待我处理、待分配、待跟进、已跟进tab才有批量检测操作
    return _.includes([SELECT_TYPE.WAIT_ME_HANDLE, SELECT_TYPE.WILL_DISTRIBUTE, SELECT_TYPE.WILL_TRACE, SELECT_TYPE.HAS_TRACE], curStatus.status);
};

//获取需要检测的手机号
export const getCheckedPhones = function(clues) {
    let phoneList = [];//要检测的手机号列表
    let hasCheckedPhoneList = [];//已经检测过状态的手机号列表
    _.each(clues, clue => {
        if(clue.contacts.length) {
            let phones = _.chain(clue.contacts)
                .filter(item => _.isArray(item.phone) && item.phone.length)
                .map('phone')
                .reduce((sum, n) => sum.concat(n))
                .uniq()
                .filter(item => isSupportCheckPhone(item))
                .value();
            if(phones.length) {
                _.each(phones, phone => {
                    phoneList.push({
                        clue_id: clue.id,
                        mobile_phone: phone
                    });
                    let curPhone = _.find(_.get(clue, 'phone_status'), item => item.phone === phone);
                    if(curPhone && curPhone.status) {
                        hasCheckedPhoneList.push(phone);
                    }
                });
            }
        }
    });
    return {
        phoneList,
        hasCheckedPhoneList
    };
};

//获取展示的电话号码，13567893112(实号)
export const getShowPhoneNumber = function(obj, phoneNumber, needStatus = false) {
    let phone = { phoneNumber: phoneNumber };
    if(_.get(obj, 'phone_status[0]')) {
        let phoneStatus = _.get(obj, 'phone_status');
        let curPhoneStatus = _.find(phoneStatus, item => item.phone === phoneNumber);
        if(isEmptyPhone(_.get(curPhoneStatus,'status'))) {//只显示疑似空号(0空号，3虚无，4沉默号，5风险号)的手机号状态
            let status = _.get(PHONE_STATUS_MAP, PHONE_STATUS_KEY.EMPTY, Intl.get( 'common.others', '其他'));
            phone.phoneNumber = `${phoneNumber}(${status})`;
        }
        if(_.has(curPhoneStatus, 'status')) {
            phone.status = curPhoneStatus.status;
        }
    }
    if(needStatus) {
        return phone;
    }
    return phone.phoneNumber;
};

//处理对象上的电话检测状态
export const dealClueCheckPhoneStatus = function(obj, result) {
    let phoneStatus = _.get(obj, 'phone_status', []);
    let phoneResult = result[0];
    let phoneObj = {phone: phoneResult.mobile_phone, status: phoneResult.phone_status};
    let curIndex = _.findIndex(phoneStatus, item => item.phone === phoneResult.mobile_phone);
    if(curIndex > -1) {
        phoneStatus[curIndex] = phoneObj;
    }else {
        phoneStatus.push(phoneObj);
    }
    return phoneStatus;
};

//处理线索上联系方式的电话状态
export const dealContactPhoneStatus = function(obj) {
    let phone_status = [];
    if (_.isArray(obj.contacts)) {
        for (let j = 0; j < obj.contacts.length; j++) {
            let contact = obj.contacts[j];
            //处理手机号的检测状态
            if(_.get(contact, 'phone_status[0]')) {
                _.each(_.get(contact, 'phone_status'), item => {
                    if(_.has(item, 'status')) {//是否有status这个字段
                        phone_status.push(item);
                    }
                });
            }
            delete contact.phone_status;
        }
    }
    return phone_status;
};

//疑似空号状态
export const isEmptyPhone = function(status) {
    return _.includes([PHONE_STATUS_KEY.EMPTY, PHONE_STATUS_KEY.NOTHING, PHONE_STATUS_KEY.SILENCE, PHONE_STATUS_KEY.RISK], status);
};

export const AREA_ALL = 'all';

//热门标签
export const ADVANCED_OPTIONS = [
    {
        name: Intl.get('clue.recommend.has.mobile', '有手机号'),
        value: 'mobile_num:1',
        processValue: (value) => {
            return _.toNumber(value);
        }
    },
    // {
    //     name: Intl.get('clue.recommend.register.half.year', '近半年注册'),
    //     value: `feature:${EXTRACT_CLUE_CONST_MAP.LAST_HALF_YEAR_REGISTER}`
    // },
    {
        name: Intl.get('clue.recommend.has.website', '有官网'),
        value: 'has_website:true',
        processValue: (value) => {
            return value === 'true';
        }
    },
    {
        name: Intl.get('clue.recommend.smal.micro.enterprise', '小微企业'),
        value: 'feature:小微企业'
    },
    {
        name: Intl.get('clue.recommend.high.tech.enterprise.enterprise', '高新技术企业'),
        value: 'feature:高新'
    },
    {
        name: Intl.get('clue.recommend.listed', '上市企业'),
        value: 'feature:上市'
    },
    /*{
        name: Intl.get('clue.recommend.state.owned.enterprise', '国有企业'),
        value: 'feature:国有企业'
    },*/
    /*{
        name: Intl.get('clue.recommend.has.phone', '有电话'),
        value: 'phone_num:1',
        processValue: (value) => {
            return _.toNumber(value);
        }
    },*/
    {
        name: Intl.get('clue.recommend.has.more.contact', '多个联系方式'),
        value: 'phone_num:2',
        processValue: (value) => {
            return _.toNumber(value);
        }
    },
];
