var OplateCustomerAnalysisAjax = require("../ajax/oplate-customer-analysis.ajax");
const asyncDispatcher = function (ajax) {
    return function (paramObj) {
        var _this = this;
        _this.dispatch({ errorMsg: "", loading: true });
        return new Promise((resolve, reject) => {
            ajax(paramObj)
                .then(function (data) {
                    _this.dispatch({ loading: false, data, paramObj, errorMsg: "" });
                    resolve({ data })
                })
                .fail(function (errorMsg) {
                    _this.dispatch({ loading: false, data: null, errorMsg, paramObj });
                });
        })
    }
};

//客户分析的action
function OplateCustomerAnalysisActions() {
    //创建action
    this.generateActions(
        //切换选中的应用
        "changeSelectedApp",
        //切换查询时间
        "changeSearchTime",
        //切换tab
        "changeCurrentTab",
        //显示没有数据
        "showNoData",
        //清除chart数据
        "resetChartData",
        //切换展示客户阶段点击数字打开的客户列表
        "toggleStageCustomerList"
    );

    //获取统计总数
    this.getSummaryNumbers = function(reqData) {
        var _this = this;
        _this.dispatch({loading:true,error:false});
        OplateCustomerAnalysisAjax.getSummaryNumbers(reqData).then(function(resData) {
            _this.dispatch({loading:false,error:false,resData:resData});
        } , function(errorMsg) {
            _this.dispatch({loading:false,error:true,errorMsg:errorMsg});
        });
    };

    //获取具体统计数据
    this.getAnalysisData = function(reqData) {
        var _this = this;
        _this.dispatch({loading:true,error:false,reqData:reqData});
        OplateCustomerAnalysisAjax.getAnalysisData(reqData).then(function(resData) {
            _this.dispatch({loading:false,error:false,resData:resData,reqData:reqData});
        } , function(errorMsg) {
            _this.dispatch({loading:false,error:true,errorMsg:errorMsg,reqData:reqData});
        });
    };

    //获取用户类型
    this.getUserType = function() {
        var _this = this;

        OplateCustomerAnalysisAjax.getUserType().then(function(resData) {
            if (_.isArray(resData)) {
                _this.dispatch(resData);
            }
        } , function(errorMsg) {
            _this.dispatch(errorMsg);
        });
    };

    //获取销售阶段列表
    this.getSalesStageList = function (cb) {
        var _this = this;
        OplateCustomerAnalysisAjax.getSalesStageList().then(function (salesStageList) {
            let list = salesStageList.result;
            if (_.isArray(list)) {
                //按索引排一下序
                list = _.sortBy(list, item => item.index);
                _this.dispatch(list);
            }
        } , function(errorMsg) {
            _this.dispatch(errorMsg);
        });
    };

    //查询迁出客户
    this.getTransferCustomers = asyncDispatcher(OplateCustomerAnalysisAjax.getTransferCustomers);

    //获取客户阶段变更数据
    this.getStageChangeCustomers = asyncDispatcher(OplateCustomerAnalysisAjax.getStageChangeCustomers);

    //获取客户阶段变更的客户列表
    this.getStageChangeCustomerList = asyncDispatcher(OplateCustomerAnalysisAjax.getStageChangeCustomerList);

    // 获取销售新开客户数
    this.getNewCustomerCount = asyncDispatcher(OplateCustomerAnalysisAjax.getNewCustomerCount);

    //获取试用用户覆盖率
    this.getIndustryCustomerOverlay = asyncDispatcher(OplateCustomerAnalysisAjax.getIndustryCustomerOverlay);
};

//使用alt导出一个action
module.exports = alt.createActions(OplateCustomerAnalysisActions);
