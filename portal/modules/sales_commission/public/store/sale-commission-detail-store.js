import SaleCommissionDetailActions from '../action/sale-commission-detail-actions';
class SaleCommissionDetailStore {
    constructor(){
        this.sortField = 'commission_detail'; //排序字段
        this.order = 'descend'; //排序方向
        this.setInitialState ();
        this.bindActions(SaleCommissionDetailActions);
    }
    setInitialState(){
        this.lastId = ''; // 最后一个id，默认为空
        this.pageSize = 20; // 每次加载的数据数
        this.listenScrollBottom = true; // 下拉加载
        // 单个的销售提成明细
        this.saleCommissionDetailList = {
            loading: false,
            errMsg: '',
            data: []
        };
    }
    // 设置排序参数
    setSort(sorter) {
        this.sortField = sorter && sorter.sortField;
        this.order = sorter && sorter.sortOrder;
    }
    // 单个的销售提成明细
    getSaleCommissionDetail(result) {
        if (result.loading) {
            this.saleCommissionDetailList.loading = result.loading;
        } else {
            this.saleCommissionDetailList.loading = false;
            if (result.error) {
                this.saleCommissionDetailList.errMsg = result.errMsg || Intl.get('sales.commission.failed.get.detail', '获取销售明细信息失败！');
                this.listenScrollBottom = false;
            } else {
                this.saleCommissionDetailList.errMsg = '';
                let resData = result.list || [];
                if (resData && _.isArray(resData.list) && resData.list.length) {
                    this.saleCommissionDetailList.data = this.saleCommissionDetailList.data.concat(resData.list);
                    let length = this.saleCommissionDetailList.data.length;
                    this.lastId = length > 0 ? this.saleCommissionDetailList.data[length - 1].id : '';
                    if (resData.list.length < this.pageSize) {
                        this.listenScrollBottom = false;
                    }
                } else {
                    this.listenScrollBottom = false;
                }
            }
        }
    }
    setGrantStatus(grantStatus) {
        _.each(this.saleCommissionDetailList.data, (saleItem) => {
            saleItem.grant = grantStatus;
        });
    }
}

//使用alt导出store
export default alt.createStore(SaleCommissionDetailStore , 'SaleCommissionDetailStore');