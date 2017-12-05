//service文件
var OplateUserAnalysisService = require("../service/oplate-user-analysis.service");

//获取 统计数字（总用户、新增用户、过期用户、新增过期用户）
exports.getSummaryNumbers = function (req, res) {
    OplateUserAnalysisService.getSummaryNumbers(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取总用户的用户统计
exports.getTotalSummary = function (req, res) {
    OplateUserAnalysisService.getTotalSummary(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取新增用户的用户统计
exports.getAddedSummary = function (req, res) {
    OplateUserAnalysisService.getAddedSummary(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取过期用户的用户统计
exports.getExpiredSummary = function (req, res) {
    OplateUserAnalysisService.getExpiredSummary(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取新增过期用户的用户统计
exports.getAddedExpiredSummary = function (req, res) {
    OplateUserAnalysisService.getAddedExpiredSummary(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取总用户的团队统计
exports.getTotalTeam = function (req, res) {
    OplateUserAnalysisService.getTotalTeam(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取新增用户的团队统计
exports.getAddedTeam = function (req, res) {
    OplateUserAnalysisService.getAddedTeam(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取过期用户的团队统计
exports.getExpiredTeam = function (req, res) {
    OplateUserAnalysisService.getExpiredTeam(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取新增过期用户的团队统计
exports.getAddedExpiredTeam = function (req, res) {
    OplateUserAnalysisService.getAddedExpiredTeam(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取总用户的地域统计
exports.getTotalZone = function (req, res) {
    OplateUserAnalysisService.getTotalZone(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取新增用户的地域统计
exports.getAddedZone = function (req, res) {
    OplateUserAnalysisService.getAddedZone(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取过期用户的地域统计
exports.getExpiredZone = function (req, res) {
    OplateUserAnalysisService.getExpiredZone(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取新增过期用户的地域统计
exports.getAddedExpiredZone = function (req, res) {
    OplateUserAnalysisService.getAddedExpiredZone(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取总用户的行业统计
exports.getTotalIndustry = function (req, res) {
    OplateUserAnalysisService.getTotalIndustry(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取新增用户的行业统计
exports.getAddedIndustry = function (req, res) {
    OplateUserAnalysisService.getAddedIndustry(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取过期用户的行业统计
exports.getExpiredIndustry = function (req, res) {
    OplateUserAnalysisService.getExpiredIndustry(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取新增过期用户的行业统计
exports.getAddedExpiredIndustry = function (req, res) {
    OplateUserAnalysisService.getAddedExpiredIndustry(req, res, req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取用户活跃度
exports.getActiveNess = function (req, res) {
    var dataType = req.params.dataType;
    var dataRange = req.params.dataRange;
    OplateUserAnalysisService.getActiveNess(req, res, dataType , dataRange , req.query).on("success", function (data) {
        res.json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取用户活跃时间段
exports.getActiveTime = function (req, res) {
    OplateUserAnalysisService.getActiveTime(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取全部成员
exports.getTotalMember = function(req,res) {
    OplateUserAnalysisService.getTotalMember(req,res,req.query).on("success",function(data) {
        res.json(data);
    }).on("error",function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取新增成员
exports.getAddedMember = function(req,res) {
    OplateUserAnalysisService.getAddedMember(req,res,req.query).on("success",function(data) {
        res.json(data);
    }).on("error",function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取过期成员
exports.getExpiredMember = function(req,res) {
    OplateUserAnalysisService.getExpiredMember(req,res,req.query).on("success",function(data) {
        res.json(data);
    }).on("error",function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取新增过期成员
exports.getAddedExpiredMember = function(req,res) {
    OplateUserAnalysisService.getAddedExpiredMember(req,res,req.query).on("success",function(data) {
        res.json(data);
    }).on("error",function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取登陆时长统计
exports.getLoginLong = function(req,res) {
    var hours = req.params.hours;
    var dataType = req.params.dataType;
    OplateUserAnalysisService.getLoginLong(req,res,dataType,hours,req.query).on("success",function(data) {
        res.json(data);
    }).on("error",function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};


//获取用户留存
exports.getRetention = function(req,res) {
    OplateUserAnalysisService.getRetention(req,res,req.query).on("success",function(data) {
        res.json(data);
    }).on("error",function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取用户类型统计
exports.getUserTypeStatistics = function (req, res) {
    let analysis_type = req.params.analysis_type;
    OplateUserAnalysisService.getUserTypeStatistics(req, res, analysis_type, req.query).on("success",function(data) {
        res.json(data);
    }).on("error",function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取新增用户类型
exports.getAddedUserTypeStatistics  = function (req, res) {
    let analysis_type = req.params.analysis_type;
    OplateUserAnalysisService.getUserTypeStatistics(req, res, analysis_type, req.query).on("success",function(data) {
        res.json(data);
    }).on("error",function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取用户类型统计
exports.getAppStatus = function (req, res) {
    let analysis_type = req.params.analysis_type;
    OplateUserAnalysisService.getAppStatus(req, res, analysis_type, req.query).on("success",function(data) {
        res.json(data);
    }).on("error",function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 全部应用下，获取团队统计
exports.getAppsTeam = function(req, res) {
    let analysis_type = req.params.analysis_type;
    OplateUserAnalysisService.getAppsTeam(req, res, analysis_type, 'team' , req.query).on("success",function(data) {
        res.json(data);
    }).on("error",function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 全部应用下，获取行业统计
exports.getAppsIndustry = function(req, res) {
    let analysis_type = req.params.analysis_type;
    OplateUserAnalysisService.getAppsIndustry(req, res, analysis_type,'industry', req.query).on("success",function(data) {
        res.json(data);
    }).on("error",function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};


// 全部应用下，获取地域统计
exports.getAppsZone = function(req, res) {
    let analysis_type = req.params.analysis_type;
    OplateUserAnalysisService.getAppsZone(req, res, analysis_type,'zone', req.query).on("success",function(data) {
        res.json(data);
    }).on("error",function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取应用下载的统计
exports.getAppsDownloadStatistics = (req,res) => {
    OplateUserAnalysisService.getAppsDownloadStatistics(req,res,req.query).on("success", (data) =>{
        res.json(data);
    }).on("error", (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};