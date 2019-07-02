import CluePoolAction from '../action';

class CluePoolStore {
    constructor() {
        this.resetState();
        this.bindActions(CluePoolAction);
    }
    // 初始化数据
    resetState() {
        this.salesManList = []; // 销售列表
        this.listenScrollBottom = false;// 是否监测下拉加载
        this.isLoading = true; // 加载提取线索列表数据中。。。
        this.pageSize = 20; // 一页可显示的客户的个数
        this.cluePoolList = []; // 查询到的线索池列表
        this.cluePoolGetErrMsg = ''; // 获取提取线索列表失败
        this.cluePoolListSize = 0; // 线索池列表的数量
        this.lastId = ''; // 用于下拉加载的客户的id
        this.sorter = {
            field: 'source_time',
            order: 'descend'
        }; //列表排序
        this.currentId = '';// 当前展示的线索的id
        this.curClue = {}; //当前展示的线索详情
        this.salesMan = '';//普通销售：userId，非普通销售（销售领导及运营人员）：userId&&teamId
        this.salesManNames = '';//普通销售：userName，非普通销售(销售领导及运营人员)：userName(teamName)
        this.unSelectDataTip = '';//未选择数据就保存的提示信息
        this.distributeLoading = false;//线索客户正在分配给某个销售
        this.distributeErrMsg = '';//线索客户分配失败
        this.distributeBatchLoading = false;
        this.distributeBatchErrMsg = '';
        this.keyword = '';//线索全文搜索的关键字
    }
    // 获取线索池列表
    getCluePoolList(result) {
        if (result.loading) {
            this.isLoading = result.loading;
        } else {
            this.isLoading = false;
            if (result.error) {
                this.cluePoolGetErrMsg = result.errMsg;
            } else {
                this.cluePoolGetErrMsg = '';
                let list = _.get(result, 'resData.result', []);
                this.cluePoolListSize = _.get(result, 'resData.total', 0);
                this.cluePoolList = _.concat(this.cluePoolList, list);
                let length = _.get(this.cluePoolList, 'length', 0);
                this.listenScrollBottom = length < this.cluePoolListSize ? true : false;
                this.lastId = length > 0 ? this.cluePoolList[length - 1].id : '';
            }
        }
    }

    // 设置排序字段
    setSortField(updateSortField) {
        this.sorter.field = updateSortField;
    }

}

export default alt.createStore(CluePoolStore, 'CluePoolStore');


import {SELECT_TYPE, isOperation, isSalesLeaderOrManager, getClueStatusValue} from '../utils/clue-customer-utils';


CluePoolStore.prototype.setClueInitialData = function() {
    this.cluePoolList = [];//查询到的线索列表
    this.cluePoolListSize = 0;
    this.lastId = '';
};
CluePoolStore.prototype.setLastClueId = function(updateId) {
    this.lastId = updateId;
};

CluePoolStore.prototype.updateCurrentClueRemark = function(submitObj) {
    let clue = _.find(this.cluePoolList, (clue) => {
        return clue.id === submitObj.lead_id;
    });
    if (clue && _.isArray(clue.clue_traces) && clue.customer_traces.length) {
        clue.customer_traces[0].remark = submitObj.remark;
    }
},




//标记线索为无效线索后，线索状态变成已跟进，在页面上不展示该条数据
CluePoolStore.prototype.removeClueItem = function(updateObj) {
    this.cluePoolList = _.filter(this.cluePoolList, clue => updateObj.id !== clue.id);
};
//关联客户改变后，把列表中关联的客户信息也修改了
//标记线索为无效线索后，线索状态变成已跟进，在页面上不展示该条数据
CluePoolStore.prototype.afterModifiedAssocaitedCustomer = function(updateClue) {
    var targetIndex = _.findIndex(this.cluePoolList, clue => updateClue.id === clue.id);
    this.cluePoolList[targetIndex] = updateClue;
    if (this.curClue.id === updateClue.id){
        this.curClue = updateClue;
    }
};

//线索客户分配给销售
CluePoolStore.prototype.distributeCluecustomerToSale = function(result) {
    if (result.loading) {
        this.distributeLoading = true;
        this.distributeErrMsg = '';
    } else if (result.error) {
        this.distributeLoading = false;
        this.distributeErrMsg = result.errorMsg;
    } else {
        this.distributeLoading = false;
        this.distributeErrMsg = '';
    }
};
CluePoolStore.prototype.distributeCluecustomerToSaleBatch = function(result) {
    if (result.loading) {
        this.distributeBatchLoading = true;
        this.distributeBatchErrMsg = '';
    } else if (result.error) {
        this.distributeBatchLoading = false;
        this.distributeBatchErrMsg = result.errorMsg;
    } else {
        this.distributeBatchLoading = false;
        this.distributeBatchErrMsg = '';
    }
};

CluePoolStore.prototype.setSalesMan = function(salesObj) {
    this.salesMan = salesObj.salesMan;
    //去掉未选销售的提示
    this.unSelectDataTip = '';
};
CluePoolStore.prototype.setSalesManName = function(salesObj) {
    this.salesManNames = salesObj.salesManNames;
    //去掉未选销售的提示
    this.unSelectDataTip = '';
};
//未选销售的提示
CluePoolStore.prototype.setUnSelectDataTip = function(tip) {
    this.unSelectDataTip = tip;
};

//分配销售之后
CluePoolStore.prototype.afterAssignSales = function(updateItemId) {
    //这个updateItemId可能是一个id，也可能是多个id
    var clueIds = updateItemId.split(',');
    //如果是待分配状态，分配完之后要在列表中删除一个
    this.cluePoolList = _.filter(this.cluePoolList, clue => _.indexOf(clueIds, clue.id) === -1);
    this.cluePoolListSize = _.get(this,'cluePoolList.length',0);
};
CluePoolStore.prototype.getSalesManList = function(list) {
    list = _.isArray(list) ? list : [];
    //客户所属销售下拉列表，过滤掉停用的成员
    this.salesManList = _.filter(list, sales => sales && sales.user_info && sales.user_info.status === 1);
};
CluePoolStore.prototype.setKeyWord = function(keyword) {
    this.keyword = keyword;
};
//更新线索列表
CluePoolStore.prototype.updateClueCustomers = function(data) {
    this.cluePoolList = data;
    this.cluePoolListSize = _.get(this,'cluePoolList.length');
};

module.exports = alt.createStore(CluePoolStore, 'CluePoolStore');