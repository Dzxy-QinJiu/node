import SalesCommissionActions from '../action/index';
const DatePickerUtils = require('../../../../components/datepicker/utils');
class SalesCommissionStore {
    constructor() {
        this.setInitialState();
        this.bindActions(SalesCommissionActions);
    }

    setInitialState() {
        this.setSolidState();
        this.setInitialPartlyState();
    }
    setSolidState() {
        this.searchContent = '';
        this.standardFlag = 'true'; // 是否达标的标志，默认是达标的
        let timeObj = DatePickerUtils.getThisQuarterTime(); // 本季度
        this.startTime = DatePickerUtils.getMilliseconds(timeObj.start_time); //开始时间
        this.endTime = _.min([DatePickerUtils.getMilliseconds(timeObj.end_time, true), Date.now()]); //结束时间
        this.sortField = 'create_time'; //排序字段
        this.order = 'descend'; //排序方向
    }

    setInitialPartlyState() {
        this.total = 0; // 销售总条数
        this.lastId = ''; // 最后一个id，默认为空
        this.pageSize = 20; // 每次加载的数据数
        this.listenScrollBottom = true; // 下拉加载
        this.userId = '';
        this.userName = '';
        this.grantStatus = ''; // 发放的状态，"yes"：已发放， “no”：没发放
        // 销售提成列表
        this.salesCommissionList = {
            loading: true,
            errMsg: '',
            data: []
        };
        this.updateSaleGrantErrMsg = ''; // 更新失败信息
        // 重新计算销售提成的提示信息
        this.recalculateTips = {
            message: '', // 提示信息
            type: '' // 消息类型
        };
    }
    // 选择是否达标
    setSelectedStandardFlag(standardFlag) {
        this.standardFlag = standardFlag;
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
    // 销售提成列表
    getSalesCommissionList(result) {
        if (result.loading) {
            this.salesCommissionList.loading = result.loading;
        } else {
            this.salesCommissionList.loading = false;
            if (result.error) {
                this.salesCommissionList.errMsg = result.errMsg || Intl.get('sales.commission.failed.get.list', '获取销售提成列表失败！');
                this.listenScrollBottom = false;
            } else {
                this.salesCommissionList.errMsg = '';
                let resData = result.list || [];
                if (resData.list && _.isArray(resData.list) && resData.list.length) {
                    this.total = resData.total; // 销售提成记录总条数
                    this.salesCommissionList.data = this.salesCommissionList.data.concat(resData.list);
                    let length = this.salesCommissionList.data.length;
                    this.lastId = length > 0 ? this.salesCommissionList.data[length - 1].id : ''; // 获取最后一条提成的id
                    this.userId = this.salesCommissionList.data[0].user_id;
                    this.userName = this.salesCommissionList.data[0].user_name;
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
    // 更新销售提成
    updateSaleCommission(result) {
        if (result.error) {
            this.updateSaleGrantErrMsg = result.errMsg || Intl.get('sales.commission.failed.update.grant', '更新该销售的已发放状态失败!');
        } else {
            this.updateSaleGrantErrMsg = '';
            let resData = result.resData || {};
            if (resData.code === 0) {
                let updateData = resData.result;
                this.grantStatus = updateData.grant;
                _.each(this.salesCommissionList.data, (saleItem) => {
                    if (saleItem.id === updateData.id) {
                        saleItem.grant = updateData.grant;
                    }
                });
            }
        }
    }
    // 设置重新计算的提示
    setRecalculateTips(messageObj) {
        this.recalculateTips.message = messageObj.message;
        this.recalculateTips.type = messageObj.type;
    }

    getUserInfo(userInfo) {
        this.userId = userInfo.userId;
        this.userName = userInfo.userName;
    }
}

//使用alt导出store
export default alt.createStore(SalesCommissionStore , 'SalesCommissionStore');