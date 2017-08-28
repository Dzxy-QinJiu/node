import CallRecordActions from "../action/call-record-actions";
import DateSelectorUtils from '../../../../components/datepicker/utils';

function CallRecordStore() {
    this.resetState();
    this.bindActions(CallRecordActions);
}

//恢复状态
CallRecordStore.prototype.resetState = function() {
    var timeObj = DateSelectorUtils.getThisMonthTime(true);
    //开始时间
    this.start_time = DateSelectorUtils.getMilliseconds(timeObj.start_time);
    //结束时间
    this.end_time = DateSelectorUtils.getMilliseconds(timeObj.end_time,true);
    //通话图表数据保存在这
    this.callGraph = {
        //是否加载中
        is_loading : true,
        //获取的数据
        data_list : [],
        //错误信息
        errorMsg : ""
    };
    //通话记录保存在这
    this.callRecord = {
        //是否加载中
        is_loading:true,
        //一页多少条
        page_size : 20,
        //当前第几页
        page : 1,
        //总共多少条
        total : 0,
        //是否监听下拉加载
        listenScrollBottom : true,
        //数据列表
        data_list : [],
        //排序字段
        sort_field : 'call_date',
        //排序方向
        sort_order : 'descend'
    };
};

//获取通话图表
CallRecordStore.prototype.getRecordGraph = function(serverData) {
    var callGraph = this.callGraph;
    callGraph.is_loading = serverData.loading;
    if(serverData.loading) {
        callGraph.errorMsg = '';
        callGraph.data_list = [];
    } else {
        if(serverData.error) {
            callGraph.errorMsg = serverData.errorMsg || Intl.get("call.record.get.failed", "获取通话记录失败");
            callGraph.data_list = [];
        } else {
            callGraph.errorMsg = '';
            if(serverData.result.code === 0) {
                callGraph.data_list = serverData.result.result;
                if(!_.isArray(callGraph.data_list)) {
                    callGraph.data_list = [];
                }
            } else {
                callGraph.data_list = [];
            }
        }
    }
};
//获取通话列表
CallRecordStore.prototype.getRecordList = function(serverData) {
    var callRecord = this.callRecord;
    callRecord.is_loading = serverData.loading;
    var isFirstPage = callRecord.page === 1;
    if(isFirstPage) {
        callRecord.data_list = [];
    }
    if(serverData.loading) {
        callRecord.errorMsg = '';
    } else {
        if(serverData.error) {
            callRecord.errorMsg = serverData.errorMsg || Intl.get("call.record.get.failed", "获取通话记录失败");
        } else {
            callRecord.errorMsg = '';
            callRecord.total = serverData.result.total;
            if(serverData.result.code === 0) {
                var data_list = serverData.result.result;
                if(!_.isArray(data_list)) {
                    data_list = [];
                }
                //累加
                callRecord.data_list = callRecord.data_list.concat(data_list);
                //页数加1
                callRecord.page++;
            }
            //是否监听下拉加载的处理
            if(_.isArray(callRecord.data_list)&&callRecord.data_list.length < callRecord.total) {
                callRecord.listenScrollBottom = true;
            } else {
                callRecord.listenScrollBottom = false;
            }
        }
    }
};

module.exports = alt.createStore(CallRecordStore, 'CallRecordStore');
