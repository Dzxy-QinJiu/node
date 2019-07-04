import { storageUtil } from 'ant-utils';
const local = storageUtil.local;
export const SESSION_STORAGE_CLUE_SALES_SELECTED = 'clue_assign_selected_sales';

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