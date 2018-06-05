var OplateUserAnalysisAjax = require('../ajax/oplate-user-analysis.ajax');

//用户分析的action
function OplateUserAnalysisActions() {
    //创建action
    this.generateActions(
        //切换选中的应用
        'changeSelectedApp',
        //切换查询时间
        'changeSearchTime',
        //切换tab
        'changeCurrentTab',
        //显示/隐藏 筛选区域
        'toggleFilterArea',
        //切换过滤条件选中状态
        'toggleFilterParam',
        //显示统计图没有数据
        'showNoData',
        // 点击用户类型图表获取对应的类型：试用、签约、员工、赠送、培训、未知
        'setLinkageUserType',
        // 点击应用的启停用图表获取对应的类型：启用、停用
        'setLinkageAppStatus',
        // 点击地域图表获取对应的地域
        'setLinkageZone',
        // 点击行业图表获取对应的行业
        'setLinkageIndustry',
        // 点击团队图表获取对应的团队
        'setLinkageTeam'
        
    );
    //统计数字（总用户、新增用户、过期用户、新增过期用户）
    this.getSummaryNumbers = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getSummaryNumbers(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    //获取总用户的用户统计
    this.getTotalSummary = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getTotalSummary(obj).then(function(data) {
            data = data || {};
            var result = data.data;
            if(!_.isArray(result)) {
                if(_.isArray(data)) {
                    result = data;
                } else {
                    result = [];
                }
            }
            _this.dispatch({loading: false,error: false,data: result});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    //获取新增用户的用户统计
    this.getAddedSummary = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getAddedSummary(obj).then(function(data) {
            var result = data.data;
            if(!_.isArray(result)) {
                if(_.isArray(data)) {
                    result = data;
                } else {
                    result = [];
                }
            }
            _this.dispatch({loading: false,error: false,data: result});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    //获取过期用户的用户统计
    this.getExpiredSummary = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getExpiredSummary(obj).then(function(data) {
            var result = data.data;
            if(!_.isArray(result)) {
                if(_.isArray(data)) {
                    result = data;
                } else {
                    result = [];
                }
            }
            _this.dispatch({loading: false,error: false,data: result});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    //获取新增过期用户的用户统计
    this.getAddedExpiredSummary = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getAddedExpiredSummary(obj).then(function(data) {
            var result = data.data;
            if(!_.isArray(result)) {
                if(_.isArray(data)) {
                    result = data;
                } else {
                    result = [];
                }
            }
            _this.dispatch({loading: false,error: false,data: result});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    //获取总用户的团队统计 （单个应用下）
    this.getTotalTeam = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getTotalTeam(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    //获取新增用户的团队统计
    this.getAddedTeam = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getAddedTeam(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    //获取过期用户的团队统计
    this.getExpiredTeam = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getExpiredTeam(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    //获取新增过期用户的团队统计
    this.getAddedExpiredTeam = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getAddedExpiredTeam(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    //获取总用户的地域统计
    this.getTotalZone = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getTotalZone(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {

            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    //获取新增用户的地域统计
    this.getAddedZone = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getAddedZone(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    //获取过期用户的地域统计
    this.getExpiredZone = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getExpiredZone(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    //获取新增过期用户的地域统计
    this.getAddedExpiredZone = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getAddedExpiredZone(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    //获取总用户的行业统计
    this.getTotalIndustry = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getTotalIndustry(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    //获取总用户下，销售开通各应用用户数的统计
    this.getSalesOpenUserAnalysis = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getSalesOpenUserAnalysis(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    //获取新增用户的行业统计
    this.getAddedIndustry = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getAddedIndustry(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    //获取过期用户的行业统计
    this.getExpiredIndustry = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getExpiredIndustry(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    //获取新增过期用户的行业统计
    this.getAddedExpiredIndustry = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getAddedExpiredIndustry(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    //获取用户活跃度统计
    // 类型(数据类型 (总数、新增、新增过期)  数据类型 (日活、周活、月活) )
    this.getUserActiveNess = function(dataType,dateRange,obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false , dataType: dataType , dateRange: dateRange});
        OplateUserAnalysisAjax.getUserActiveNess(dataType,dateRange,obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    //获取用户活跃时间段
    this.getUserActiveTime = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getUserActiveTime(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    //获取总用户的成员统计
    this.getTotalMember = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getTotalMember(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    //获取新增用户的成员统计
    this.getAddedMember = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getAddedMember(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    //获取过期用户的成员统计
    this.getExpiredMember = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getExpiredMember(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    //获取新增过期用户的成员统计
    this.getAddedExpiredMember = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getAddedExpiredMember(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    //获取用户登录时长统计
    // 类型(数据类型 (总数、新增、新增过期)  时长 (数字，单位：小时) )
    this.getUserLoginLong = function(dataType,dateRange,obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false,dataType: dataType,dateRange: dateRange});
        OplateUserAnalysisAjax.getUserLoginLong(dataType,dateRange,obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    //获取
    this.getRetention = function(obj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getRetention(obj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    
    // 获取用户类型统计
    this.getUserTypeStatistics = function(dataType,obj) {
        this.dispatch({loading: true,error: false,dataType: dataType});
        OplateUserAnalysisAjax.getUserTypeStatistics(dataType,obj).then( (data) => {
            this.dispatch({loading: false,error: false,data: data});
        } , (errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    // 应用的启停用状态统计
    this.getAppStatus = function(dataType,obj) {
        this.dispatch({loading: true,error: false,dataType: dataType});
        OplateUserAnalysisAjax.getAppStatus(dataType,obj).then( (data) => {
            this.dispatch({loading: false,error: false,data: data});
        } , (errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    
    // 全部应用下（综合）， 团队统计
    this.getAppsTeam = function(dataType,obj) {
        this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getAppsTeam(dataType,obj).then( (data) => {
            this.dispatch({loading: false,error: false,data: data});
        } , (errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    
    // 全部应用下（综合）， 行业统计
    this.getAppsIndustry = function(dataType,obj) {
        this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getAppsIndustry(dataType,obj).then( (data) => {
            this.dispatch({loading: false,error: false,data: data});
        } , (errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    // 全部应用下（综合）， 地域统计
    this.getAppsZone = function(dataType,obj) {
        this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getAppsZone(dataType,obj).then( (data) => {
            this.dispatch({loading: false,error: false,data: data});
        } , (errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    // 获取应用下载的统计
    this.getAppsDownloadStatistics = function(obj) {
        this.dispatch({loading: true,error: false});
        OplateUserAnalysisAjax.getAppsDownloadStatistics(obj).then( (data) => {
            this.dispatch({loading: false,error: false,data: data});
        } , (errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

}

//使用alt导出一个action
module.exports = alt.createActions(OplateUserAnalysisActions);