var appService = require('../service/app');

//获取集成配置
exports.getIntegrationConfig = function(req, res) {
    appService.getIntegrationConfig(req, res).on('success' , function(data) {
        res.status(200).json(data);
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//根据当前用户数据权限，获取应用列表
exports.getGrantApplications = function(req , res) {
    //获取应用状态
    var status = req.query.status;
    if(!status) {
        status = 'true';
    }
    appService.getGrantApplications(req,res,status).on('success' , function(data) {
        res.json(data);
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message || '获取应用列表失败');
    });
};
//根据当前用户数据权限，获取“我的应用”列表
exports.getMyApplications = function(req , res) {
    appService.getMyApplications(req,res).on('success' , function(data) {
        res.json(data);
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message || '获取我的应用列表失败');
    });
};

// 获取当前应用的新增用户的团队数据
exports.getAddedTeam = (req, res) => {
    appService.getAddedTeam(req, res, req.query).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取当前应用的在线用户的地域数据
exports.getOnLineUserZone = (req, res) => {
    appService.getOnLineUserZone(req, res, req.query).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取各应用的默认配置
exports.getAppsDefaultConfig = (req, res) => {
    appService.getAppsDefaultConfig(req, res, req.query).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//根据id获取应用信息
exports.getCurAppById = function(req, res) {
    appService.getCurAppById(req, res, req.params.app_id).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取所有的产品列表
exports.getAllProductList = function(req, res) {
    appService.getAllProductList(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};