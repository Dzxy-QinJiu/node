import AnalysisAction from '../action/analysis-action';
import { CONTRACT_VALUE_TYPES, CONTRACT_FIELDS, CONTRACT_VIEW_AUTH } from '../consts';
function AnalysisStore() {
    //初始化state数据
    this.initState();
    //绑定action
    this.bindActions(AnalysisAction);
}

/**
 * 函数外取不到state执行环境，所以传字符串
 * loadingObj[string]: 存放loading状态的变量名
 * errorObj[string]: 存放错误信息的变量名
 * fn 请求成功触发的回调，会传入响应结果result，包含{ errorMsg, loading, data, paramObj }
*/
const resultHandler = function(loadingObj, errorObj, fn) {
    return function(result) {
        const { loading, errorMsg } = result;
        if (loading) {
            this[loadingObj] = true;
            this[errorObj] = '';
        }
        else if (errorMsg) {
            this[loadingObj] = false;
            this[errorObj] = errorMsg;
        }
        else {
            this[loadingObj] = false;
            this[errorObj] = '';
            fn.call(this, result);
        }
    };
};
AnalysisStore.prototype.initState = function() {
    this.id = null;
    this.tableData = null;
    this.status = CONTRACT_VIEW_AUTH.SELF.value,//展示权限 self仅自己可见 all全;
    this.loading = false;
    this.sortId = '',
    this.tableList = [];
    this.tableTotal = '';
    this.tableInfoMap = {};
    this.getTablelistLoading = false;
    this.getTablelistErrorMsg = '';
    this.saveTableInfoLoading = false;
    this.saveTableInfoErrorMsg = '';
    this.getTableInfoLoading = false;
    this.getTableInfoErrorMsg = '';
    this.errorMsg = '';
    this.contractType = 'contract',//合同类型 [合同|回款|费用;
    this.fieldParamObj = {//已保存的表格参数;
        filterList: [],//筛选;
        colList: [],//列字;
        rowList: [],//行字;
        valueList: [],//;
    };
    this.tableName = '';
    this.selectorHeight = 0;//筛选区域的高度，放到store里是为了在点击表格标题时设为0
};
AnalysisStore.prototype.resetState = function() {
    this.contractType = 'contract';//合同类型 [合同|回款|费用]
    this.fieldParamObj = {//已保存的表格参数项
        filterList: [],//筛选项
        colList: [],//列字段
        rowList: [],//行字段
        valueList: [],//值
    };
    this.tableData = null;
    this.tableName = '';
    this.id = null;
    this.selectorHeight = 0;
};

//获取合同表格数据
AnalysisStore.prototype.getContractData = resultHandler('loading', 'errorMsg',
    function({ errorMsg, loading, data, paramObj }) {
        this.tableData = data;
        this.contractType = 'contract';
    }
);
//获取合同表格数据
AnalysisStore.prototype.getCostData = resultHandler('loading', 'errorMsg',
    function({ errorMsg, loading, data, paramObj }) {
        this.tableData = data;
        this.contractType = 'cost';
    }
);
//获取合同表格数据
AnalysisStore.prototype.getRepaymentData = resultHandler('loading', 'errorMsg',
    function({ errorMsg, loading, data, paramObj }) {
        this.tableData = data;
        this.contractType = 'repayment';
    }
);
//获取已保存的表格名称列表
AnalysisStore.prototype.getTableList = resultHandler('getTablelistLoading', 'getTablelistErrorMsg',
    function({ errorMsg, loading, data, paramObj }) {
        this.tableTotal = data.total;
        if (!paramObj.sort_id) {
            this.sortId = '';
            this.tableList = data.results;
        } else {
            this.sortId = '';
            this.tableList = this.tableList.concat(data.results);
        }
    }
);

//保存表格视图
AnalysisStore.prototype.saveTableInfo = resultHandler('saveTableInfoLoading', 'saveTableInfoErrorMsg',
    function({ errorMsg, loading, data, paramObj }) {

    }
);

AnalysisStore.prototype.getTableInfo = resultHandler('getTableLoading', 'getTableInfoErrorMsg',
    function({ errorMsg, loading, data, paramObj }) {
        let { cols, metrics, rows, filters, view_name, id, status, view_type } = data;
        //前端维护的字段会有变动，会有存储的字段在前端找不到的情况，所以用filter过滤一遍 
        let colList = cols.map(x => CONTRACT_FIELDS[view_type].find(field => field.value === x.item)).filter(x => x);
        let rowList = rows.map(x => CONTRACT_FIELDS[view_type].find(field => field.value === x.item)).filter(x => x);
        let valueList = metrics.map(x => {
            let valueItem = CONTRACT_FIELDS[view_type].find(field => {
                if (x.item.split('(')[1]) {
                    return field.value === x.item.split('(')[1].replace(')', '');
                } else {
                    return false;
                }
            });
            //存在字段在前端找不到的情况
            if (valueItem) {
                valueItem.calcType = CONTRACT_VALUE_TYPES.find(type => type.value === x.item.split('(')[0]);
                return valueItem;
            }
        }).filter(x => x);
        let filterList = filters.map(x => CONTRACT_FIELDS[view_type].find(field => field.value === x.item)).filter(x => x);
        this.tableName = view_name;
        this.id = id;
        this.status = status;
        this.contractType = view_type;
        this.fieldParamObj = { valueList, rowList, colList, filterList };
    }
);

AnalysisStore.prototype.setSortId = function(sortId) {
    this.sortId = sortId;
};

AnalysisStore.prototype.setSelectorHeight = function(height) {
    this.selectorHeight = height;
};

module.exports = alt.createStore(AnalysisStore, 'AnalysisStore');
