var OperationReportAjax = require('../ajax/ajax');

//运营报告的action
function OperationReportActions() {
    //创建action
    this.generateActions(
        //选择应用列表的设置
        'setSelectAppList'
    );
    //获取应用列表
    this.getAppList = function(callback) {
        OperationReportAjax.getAppList().then((data) => {
            this.dispatch(data);
            if (callback) callback(data);
        }, (errorMsg) => {
            this.dispatch(errorMsg);
        });
    };
    //获取团队列表
    this.getTeamList = function(callback) {
        OperationReportAjax.getTeamList().then((data) => {
            this.dispatch(data);
            if (callback) callback(data);
        }, (errorMsg) => {
            this.dispatch(errorMsg);
        });
    };

    //获取各应用的登录统计
    this.getAppLoginUser = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getAppLoginUser(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取各应用签约用户统计
    this.getAppSignedUser = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getAppSignedUser(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取各应用新开账号统计
    this.getAppNewTrialUser = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getAppNewTrialUser(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取各应用延期用户统计
    this.getAppNewDelayUser = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getAppNewDelayUser(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取近四周的登录对比
    this.getAppLoginComparison = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getAppLoginComparison(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取应用的用户数
    this.getAppsUserCount = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getAppsUserCount(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取近四周周登录总时长超过1小时的用户数对比
    this.getAppWeeklyLoginTotalTime = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getAppWeeklyLoginTotalTime(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取近四周到期用户登录对比
    this.getAppExpiredLoginComparison = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getAppExpiredLoginComparison(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    // 获取近四周的用户活跃度
    this.getUserActive = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getUserActive(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取用户日活跃度
    this.getUserDailyActive = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getUserDailyActive(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取近四周新开通用户对比
    this.getAppNewUserComparison = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getAppNewUserComparison(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取近四周新增延期用户对比
    this.getAppNewDelayUserComparison = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getAppNewDelayUserComparison(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取近四周签约用户的登录对比
    this.getAppFormalUserLoginComparison = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getAppFormalUserLoginComparison(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取各部门签约用户的登录表格数据
    this.getTeamSignedLoginUser = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getTeamSignedLoginUser(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取各应用用户登录情况的部门分布表格数据
    this.getTeamLoginUser = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getTeamLoginUser(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取各部门到期用户的登录表格数据
    this.getTeamExpiredLoginUser = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getTeamExpiredLoginUser(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取到期用户登录时长统计表数据
    this.getTeamExpiredUserLoginTime = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getTeamExpiredUserLoginTime(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取各部门新开试用账号的统计表格
    this.getTeamNewTrialUser = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getTeamNewTrialUser(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取各部门新增延期用户的统计表格
    this.getTeamNewDelayUser = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getTeamNewDelayUser(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取各部门新开试用账号登录的统计表格
    this.getTeamNewTrialLoginUser = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getTeamNewTrialLoginUser(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取各部门新开试用账号登录的统计表格
    this.getTeamNewTrialLoginUser = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getTeamNewTrialLoginUser(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取各部门延期用户登录的统计表格
    this.getTeamNewDelayLoginUser = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getTeamNewDelayLoginUser(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取到期用户的周登录时长超1小时的各应用的用户数
    this.getExpiredUserExceedLoginTime = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getExpiredUserExceedLoginTime(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取各部门登录超过x小时的统计表格数据
    this.getTeamExceedLoginTime = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getTeamExceedLoginTime(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取各部门登录超过x小时的延期用户统计表格数据
    this.getTeamDelayUserLoginTime = function(params) {
        this.dispatch({loading: true, error: false});
        OperationReportAjax.getTeamDelayUserLoginTime(params).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
}

//使用alt导出一个action
module.exports = alt.createActions(OperationReportActions);