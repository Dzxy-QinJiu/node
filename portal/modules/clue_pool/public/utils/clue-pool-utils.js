import { storageUtil } from 'ant-utils';
const local = storageUtil.local;
export const SESSION_STORAGE_CLUE_POOL_SALES_SELECTED = 'clue_pool_assign_selected_sales';

export const getClueSalesList = function() {
    var clueSalesIdList = local.get(SESSION_STORAGE_CLUE_POOL_SALES_SELECTED);
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
    local.set(SESSION_STORAGE_CLUE_POOL_SALES_SELECTED,JSON.stringify(clueSalesIdList));
};
