import CallRecordActions from '../action/call-record-actions';
import DateSelectorUtils from '../../../../components/datepicker/utils';

function SalesCallRecordStore() {
    this.filter_phone = false;
    this.phone_type = 'all';
    // 是否显示通话分析, 默认情况下不显示
    this.isShowCallAnalysisPanel = false;
    this.resetState();
    this.bindActions(CallRecordActions);
}

SalesCallRecordStore.prototype.resetCallRecord = function() {
    //通话记录保存在这
    this.callRecord = {
        //是否加载中
        is_loading: true,
        //一页多少条
        page_size: 20,
        //当前第几页
        page: 1,
        //总共多少条
        total: 0,
        //是否监听下拉加载
        listenScrollBottom: true,
        //数据列表
        data_list: [],
        //排序字段
        sort_field: 'call_date',
        //排序方向
        sort_order: 'descend'
    };

    // 搜索电话号码号码时，提供推荐列表
    this.recommendList = {
        list: [],
        errMsg: '' // 获取推荐列表失败
    };

};

//恢复状态
SalesCallRecordStore.prototype.resetState = function() {
    //默认展示今天的时间
    var timeRange = DateSelectorUtils.getTodayTime();
    //开始时间
    this.start_time = DateSelectorUtils.getMilliseconds(timeRange.start_time);
    //结束时间
    this.end_time = DateSelectorUtils.getMilliseconds(timeRange.end_time, true);
    this.resetCallRecord();
};

//获取通话列表
SalesCallRecordStore.prototype.getCallRecordList = function(serverData) {
    var callRecord = this.callRecord;
    callRecord.is_loading = serverData.loading;
    var isFirstPage = callRecord.page === 1;
    if (isFirstPage) {
        callRecord.data_list = [];
    }
    if (serverData.loading) {
        callRecord.errorMsg = '';
    } else {
        if (serverData.error) {
            callRecord.errorMsg = serverData.errorMsg || Intl.get('call.record.get.failed', '获取通话记录失败');
        } else {
            callRecord.errorMsg = '';
            callRecord.total = serverData.result.total;
            if (serverData.result) {
                var data_list = serverData.result.result;
                if (!_.isArray(data_list)) {
                    data_list = [];
                }
                //累加
                callRecord.data_list = callRecord.data_list.concat(data_list);
                //页数加1
                callRecord.page++;
            }
            //是否监听下拉加载的处理
            if (_.isArray(callRecord.data_list) && callRecord.data_list.length < callRecord.total) {
                callRecord.listenScrollBottom = true;
            } else {
                callRecord.listenScrollBottom = false;
            }
        }
    }
};

// 过滤电话
SalesCallRecordStore.prototype.filterPhone = function(status) {
    this.phone_type = status;
    this.resetCallRecord();
    this.callRecord.listenScrollBottom = false;
};

// 更新客户和联系人
SalesCallRecordStore.prototype.updateCallRecord = function(addData) {
    let addNumber = addData.contacts0_phone;
    _.each(this.callRecord.data_list, (item) => {
        if (item.dst === addNumber) {
            item.customer_name = addData.name;
            item.contact_name = addData.contacts0_name || '';
            item.customer_id = addData.id;
        }
    });
};

// 更新跟进内容
SalesCallRecordStore.prototype.updateCallContent = function(editContent) {
    let id = editContent.id;
    _.each(this.callRecord.data_list, (item) => {
        if (item.id === id) {
            item.remark = editContent.remark;
        }
    });
};

// 控制确认框是否出现
SalesCallRecordStore.prototype.toggleConfirm = function(obj){
    _.each(this.callRecord.data_list, (item) => {
        if (item.id === obj.id) {
            item.confirmVisible = obj.flag;
        }
    });
};

// 刷新通话记录
SalesCallRecordStore.prototype.handleRefresh = function() {
    this.resetCallRecord();
    this.callRecord.listenScrollBottom = false;
};

// 搜索电话号码号码时，提供推荐列表
SalesCallRecordStore.prototype.getRecommendPhoneList = function(result) {
    if (result.error) {
        this.recommendList.errMsg = result.errMsg || Intl.get('call.record.recommend.list', '获取推荐列表失败！');
    } else {
        this.recommendList.errMsg = '';
        if (result.resData) {
            var data = result.resData.result || [];
            let list = [];
            if (!_.isArray(data)) {
                list = [];
            } else {
                data.forEach( (item) => {
                    for (let key in item) {
                        list.push({key: key, value: item[key]});
                    }
                } );
            }
            if(result.searchInputVal){//将输入项作为下拉选项中的第一项
                let searchObj = {key: result.searchInputVal, value: 0};
                //输入项在推荐列表里已存在，需过滤掉
                list = _.filter(list, item => {
                    if(item.key === result.searchInputVal) {
                        searchObj.value = item.value;
                        return false;
                    }
                    return true;
                });

                list.unshift(searchObj);
            }
            this.recommendList.list = list;
        }
    }
};

// 显示通话分析的界面
SalesCallRecordStore.prototype.showCallAnalysisPanel = function(flag) {
    this.isShowCallAnalysisPanel = flag;
};

module.exports = alt.createStore(SalesCallRecordStore, 'SalesCallRecordStore');
