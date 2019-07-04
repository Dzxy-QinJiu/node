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
        this.salesMan = '';//普通销售：userId，非普通销售（销售领导及运营人员）：userId&&teamId
        this.salesManNames = '';//普通销售：userName，非普通销售(销售领导及运营人员)：userName(teamName)
        this.unSelectDataTip = '';//未选择数据就保存的提示信息
        this.batchExtractLoading = false;
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

    getSalesManList(list) {
        list = _.isArray(list) ? list : [];
        //客户所属销售下拉列表，过滤掉停用的成员
        this.salesManList = _.filter(list, sales => sales && sales.user_info && sales.user_info.status === 1);
    }

    // 设置排序字段
    setSortField(updateSortField) {
        this.sorter.field = updateSortField;
    }
    // 初始化线索池数据
    setClueInitialData() {
        this.cluePoolList = [];
        this.cluePoolListSize = 0;
        this.lastId = '';
        this.isLoading = true;
        this.listenScrollBottom = false;
    }
    // 设置关键字
    setKeyWord(keyword) {
        this.keyword = keyword;
    }

    setSalesMan(salesObj) {
        this.salesMan = salesObj.salesMan;
        //去掉未选销售的提示
        this.unSelectDataTip = '';
    }

    setSalesManName(salesObj) {
        this.salesManNames = salesObj.salesManNames;
        //去掉未选销售的提示
        this.unSelectDataTip = '';
    }
    // 未选销售的提示
    setUnSelectDataTip(tip) {
        this.unSelectDataTip = tip;
    }

    // 提取线索成功之后，更新线索列表
    updateCluePoolList(id) {
        this.cluePoolList = _.filter(this.cluePoolList, clue => clue.id !== id);
        this.cluePoolListSize--;
    }
}

export default alt.createStore(CluePoolStore, 'CluePoolStore');