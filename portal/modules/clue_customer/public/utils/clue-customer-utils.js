//客户名格式验证
import {nameRegex, ipRegex} from 'PUB_DIR/sources/utils/validate-util';
const hasPrivilege = require('../../../../components/privilege/checker').hasPrivilege;
import ClueAction from '../action/clue-customer-action';
var userData = require('PUB_DIR/sources/user-data');
import { storageUtil } from 'ant-utils';
const local = storageUtil.local;
import {clueNameContactRule} from 'PUB_DIR/sources/utils/validate-util';
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

// 全部 "" 待分配 0 待跟进 1 已跟进 2
export const SELECT_TYPE = {
    ALL: '',
    WILL_DISTRIBUTE: '0',
    WILL_TRACE: '1',
    HAS_TRACE: '2',
    WAIT_ME_HANDLE: 'waitMeHandle'
};

export const CLUE_DIFF_TYPE = [
    {
        name: Intl.get('sales.home.will.trace', '待跟进'),
        value: SELECT_TYPE.WILL_TRACE,
    },
    {
        name: Intl.get('clue.customer.has.follow', '已跟进'),
        value: SELECT_TYPE.HAS_TRACE,
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
//是否是销售
export const isSalesRole = function() {
    return userData.hasRole(userData.ROLE_CONSTANS.SALES) || userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER) || userData.hasRole(userData.ROLE_CONSTANS.SECRETARY);
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
//为了防止开始时间不传，后端默认时间是从1970年开始的问题,把开始时间设置从2010年开始
export const clueStartTime = moment('2010-01-01 00:00:00').valueOf();
export const getClueSalesList = function() {
    var clueSalesIdList = local.get(SESSION_STORAGE_CLUE_SALES_SELECTED);
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
export const SetLocalSalesClickCount = function(sale_id) {
    var clueSalesIdList = getClueSalesList();
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
    local.set(SESSION_STORAGE_CLUE_SALES_SELECTED,JSON.stringify(clueSalesIdList));
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
        if (hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_MANAGER')){
            type = 'manager';
        }
    }else{
        if (hasPrivilege('CLUECUSTOMER_UPDATE_MANAGER')){
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
    data.updateObj = JSON.stringify(updateObj);
    data.type = handlePrivilegeType(isMarkingAvalibility);
    return data;
};
export const contactNameRule = function() {
    return [clueNameContactRule,{required: true,
        message: Intl.get('crm.90', '请输入姓名')}];
};

