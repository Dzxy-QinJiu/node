import { storageUtil } from 'ant-utils';
const local = storageUtil.local;
export const SESSION_STORAGE_CLUE_SALES_SELECTED = 'clue_assign_selected_sales';

//为了防止开始时间不传，后端默认时间是从1970年开始的问题,把开始时间设置从2010年开始
export const clueStartTime = moment().year(2010).startOf('year').valueOf();

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

// 全部 "" 待分配 0 待跟进 1 已跟进 2 已转化  3
export const SELECT_TYPE = {
    ALL: '',
    WILL_DISTRIBUTE: '0',
    WILL_TRACE: '1',
    HAS_TRACE: '2',
    HAS_TRANSFER: '3',
};