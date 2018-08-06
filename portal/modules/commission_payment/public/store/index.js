import CommissionPaymentActions from '../action/index';
const DatePickerUtils = require('../../../../components/datepicker/utils');
class CommissionPaymentStore {
    constructor(){
        this.role = ''; // 选择角色，默认是全部的决定
        let timeObj = DatePickerUtils.getThisQuarterTime(); // 本季度
        this.startTime = DatePickerUtils.getMilliseconds(timeObj.start_time); //开始时间
        this.endTime = _.min([DatePickerUtils.getMilliseconds(timeObj.end_time, true), Date.now()]); //结束时间
        this.sortField = 'create_time'; //排序字段
        this.order = 'descend'; //排序方向
        this.setInitialPartlyState();
        this.bindActions(CommissionPaymentActions);
    }
    setInitialPartlyState(){
        this.total = 0; // 销售总条数
        this.lastId = ''; // 最后一个id，默认为空
        this.pageSize = 20; // 每次加载的数据数
        this.listenScrollBottom = true; // 下拉加载
        // 提成发放列表数据
        this.commissionPaymentList = {
            loading: true,
            errMsg: '',
            data: []
        };
    }
    // 选择角色
    onSelectedRoleFlagChange(role) {
        this.role = role;
    }
    // 选择时间
    setSelectDate(timeObj) {
        this.startTime = timeObj.startTime;
        this.endTime = timeObj.endTime ? _.min([timeObj.endTime, Date.now()]) : '';
    }
    // 设置排序参数
    setSort(sorter) {
        this.sortField = sorter && sorter.sortField;
        this.order = sorter && sorter.sortOrder;
    }
    // 提成发放列表
    getCommissionPaymentList(result) {
        if (result.loading) {
            this.commissionPaymentList.loading = result.loading;
        } else {
            this.commissionPaymentList.loading = false;
            if (result.error) {
                this.commissionPaymentList.errMsg = result.errMsg || Intl.get('sales.commission.failed.get.sent', '获取提成发放列表失败！');
                this.listenScrollBottom = false;
            } else {
                this.commissionPaymentList.errMsg = '';
                let resData = result.list || [];
                if (resData.list && _.isArray(resData.list) && resData.list.length) {
                    this.total = resData.total; // 销售发放记录总条数
                    this.commissionPaymentList.data = this.commissionPaymentList.data.concat(resData.list);
                    let length = this.commissionPaymentList.data.length;
                    this.lastId = length > 0 ? this.commissionPaymentList.data[length - 1].id : ''; // 获取最后一条提成的id
                    // 若本次加载提成条数小于应该加载提成条数（pageSize=20），说明数据已加载完
                    if (resData.list.length < this.pageSize) {
                        this.listenScrollBottom = false;
                    }
                } else {
                    this.listenScrollBottom = false;
                }
            }
        }
    }
    addCommission(commission) {
        this.commissionPaymentList.data.unshift(commission);
    }
    refreshCurrentCommission(commission) {
        let index = _.findIndex(this.commissionPaymentList.data, item => item.id === commission.id);
        if (index > -1) this.commissionPaymentList.data.splice(index, 1, commission);
    }
    deleteCommission(id) {
        let index = _.findIndex(this.commissionPaymentList.data, item => item.id === id);
        if (index > -1) this.commissionPaymentList.data.splice(index, 1);
    }
}

//使用alt导出store
export default alt.createStore(CommissionPaymentStore , 'CommissionPaymentStore');