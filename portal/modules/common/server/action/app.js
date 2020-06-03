var appService = require('../service/app');
var _ = require('lodash');
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
    appService.getGrantApplications(req,res).on('success' , function(data) {
        res.json(data);
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message || '获取应用列表失败');
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

// 获取该组织的用户查询条件
exports.queryUserCondition = (req, res) => {
    appService.queryUserCondition(req, res)
        .on('success', (data) => {
            res.status(200).json(data);
        })
        .on('error', (err) => {
            res.status(500).json(err && err.message);
        });
};

exports.getWxWebviewPage = (req, res) => {
    var originalUrl = req.originalUrl;
    var sessionId = originalUrl.split('?')[1];//小程序登录后的cookie，
    var sessionStore = global.config.sessionStore;
    if (sessionStore && sessionId && sessionId !== req.session.id) {
        sessionStore.get(sessionId, (err, session) => {
            req.session = _.assignIn(req.session, session);
            _.isFunction(req.session.save) && req.session.save();
        });
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
};
