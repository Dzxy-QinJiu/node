var callAnalysisAjax = require('../ajax/call-analysis-ajax');
import {getMyTeamTreeAndFlattenList} from 'PUB_DIR/sources/utils/common-data-util';
function CallAnalysisActions() {
    this.generateActions(
        'resetState',//初始化数据的设置
        'changeSearchTime', //搜索时间的切换
        'showZoneDistribute', // 显示地域分布 
    );
    // 获取通话时长为TOP10的列表
    this.getCallDurTopTen = function(reqData, reqBody) {
        this.dispatch({loading: true, error: false});
        callAnalysisAjax.getCallDurTopTen(reqData, reqBody).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData});
        }, (errMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errMsg});
        }
        );
    };
    //获取通话总次数、总时长列表
    this.getCallTotalList = function(reqData, reqBody) {
        this.dispatch({loading: true, error: false});
        callAnalysisAjax.getCallTotalList(reqData, reqBody).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData});
        }, (errMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errMsg});
        }
        );
    };

    // 获取通话数量和通话时长趋势图统计
    this.getCallCountAndDur = function(reqData, reqBody) {
        this.dispatch({loading: true, error: false});
        callAnalysisAjax.getCallCountAndDur(reqData, reqBody).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData});
        }, (errMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errMsg});
        }
        );
    };
    //分别获取单个团队的通话数量和通话时长趋势图数据
    this.getCallCountAndDurSeparately = function(reqData, reqBody) {
        this.dispatch({loading: true, error: false});
        callAnalysisAjax.getCallCountAndDurSeparately(reqData, reqBody).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData});
        }, (errMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errMsg});
        }
        );
    };
    // 获取电话的接通情况
    this.getCallInfo = function(pathParam, reqData) {
        this.dispatch({loading: true, error: false});
        callAnalysisAjax.getCallInfo(pathParam, reqData).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errorMsg});
        }
        );
    };

    // 114占比
    this.getCallRate = function(reqData, reqBody) {
        let type = '';
        if (reqBody.filter_invalid_phone) {
            type = 'service';
        }
        else {
            type = '114';
        }
        this.dispatch({loading: true, error: false, type});
        callAnalysisAjax.getCallRate(reqData, reqBody, type).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData, type});
        }, (errMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errMsg, type});
        }
        );
    };

    //获取通话时段（数量和时长）的统计数据
    this.getCallIntervalData = function(authType, reqData) {
        this.dispatch({loading: true, error: false});
        callAnalysisAjax.getCallIntervalData(authType, reqData).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData.list});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errorMsg});
        }
        );
    };

    // 团队信息
    this.getSaleGroupTeams = function(reqData) {
        getMyTeamTreeAndFlattenList(data => {
            if(data.errorMsg) {
                this.dispatch({error: true, errMsg: data.errorMsg});
            } else {
                this.dispatch({error: false, resData: data.teamList});
            }
        });


    };

    // 成员信息
    this.getSaleMemberList = function(reqData) {
        callAnalysisAjax.getSaleMemberList(reqData).then((resData) => {
            this.dispatch({error: false, resData: resData});
        }, (errorMsg) => {
            this.dispatch({error: true, errMsg: errorMsg});
        }
        );
    };

    // 获取通话客户的地域和阶段分布
    this.getCallCustomerZoneStage = function(reqData, reqBody) {
        this.dispatch({loading: true, error: false});
        callAnalysisAjax.getCallCustomerZoneStage(reqData, reqBody).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData});
        }, (errMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errMsg});
        }
        );
    };

    // 获取订单阶段
    this.getSalesStageList = function() {
        callAnalysisAjax.getSalesStageList().then( (salesStageList) => {
            this.dispatch(salesStageList.result);
        }, (errMsg) => {
            this.dispatch(errMsg);
        });
    };

}

module.exports = alt.createActions(CallAnalysisActions);
