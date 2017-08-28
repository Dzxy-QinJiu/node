//service文件
var OperationReportService = require("../service/operation-report-service");

//获取各应用的签约用户数
exports.getAppSignedUser = function (req, res) {
    OperationReportService.getAppSignedUser(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取到期用户的周登录时长超1小时的各应用的用户数
exports.getExpiredUserExceedLoginTime = function (req, res) {
    OperationReportService.getExpiredUserExceedLoginTime(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取各应用登录情况
exports.getAppLoginUser = function (req, res) {
    OperationReportService.getAppLoginUser(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取各应用新增账号统计
exports.getAppNewTrialUser = function (req, res) {
    OperationReportService.getAppNewTrialUser(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取各应用新增延期账号统计
exports.getAppNewDelayUser = function (req, res) {
    OperationReportService.getAppNewDelayUser(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取近四周的登录对比
exports.getAppLoginComparison = function (req, res) {
    OperationReportService.getAppLoginComparison(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取近四周周登录总时长超过1小时的用户数对比
exports.getAppWeeklyLoginTotalTime = function (req, res) {
    OperationReportService.getAppWeeklyLoginTotalTime(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取近四周到期用户的登录对比
exports.getAppExpiredLoginComparison = function (req, res) {
    OperationReportService.getAppExpiredLoginComparison(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取近四周用户活跃度
exports.getUserActive = function (req, res) {
    OperationReportService.getUserActive(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取用户日活跃度
exports.getUserDailyActive = function (req, res) {
    OperationReportService.getUserDailyActive(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });

};
//近四周新开用户的对比
exports.getAppNewUserComparison = function (req, res) {
    OperationReportService.getAppNewUserComparison(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取近四周新增延期用户对比
exports.getAppNewDelayUserComparison = function (req, res) {
    OperationReportService.getAppNewDelayUserComparison(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//近四周签约用户登录对比
exports.getAppFormalUserLoginComparison = function (req, res) {
    OperationReportService.getAppFormalUserLoginComparison(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取各部门签约用户的登录表格数据
exports.getTeamSignedLoginUser = function (req, res) {
    OperationReportService.getTeamSignedLoginUser(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取各应用登录用户数的部门分布表格数据
exports.getTeamLoginUser = function (req, res) {
    OperationReportService.getTeamLoginUser(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取各部门到期用户的登录表格数据
exports.getTeamExpiredLoginUser = function (req, res) {
    OperationReportService.getTeamExpiredLoginUser(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取各部门到期用户的登录时长表格数据
exports.getTeamExpiredUserLoginTime = function (req, res) {
    OperationReportService.getTeamExpiredUserLoginTime(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取各部门新开试用账号的统计表格
exports.getTeamNewTrialUser = function (req, res) {
    OperationReportService.getTeamNewTrialUser(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取各部门新增延期用户的统计表格
exports.getTeamNewDelayUser = function (req, res) {
    OperationReportService.getTeamNewDelayUser(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取各部门新开试用账号登录的统计表格
exports.getTeamNewTrialLoginUser = function (req, res) {
    OperationReportService.getTeamNewTrialLoginUser(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取各部门新增延期用户登录的统计表格
exports.getTeamNewDelayLoginUser = function (req, res) {
    OperationReportService.getTeamNewDelayLoginUser(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取各部门登录超过x小时的统计表格数据
exports.getTeamExceedLoginTime = function (req, res) {
    OperationReportService.getTeamExceedLoginTime(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取各部门登录超过x小时的延期用统计表格数据
exports.getTeamDelayUserLoginTime = function (req, res) {
    OperationReportService.getTeamDelayUserLoginTime(req, res, req.query).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};