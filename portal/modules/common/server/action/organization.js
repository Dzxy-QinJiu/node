var organizationService = require('../service/organization');
let BackendIntl = require('../../../../../portal/lib/utils/backend_intl');
/**
 * 获取组织列表
 */
exports.getOrganizationList = function(req,res) {
    organizationService.getOrganizationList(req,res).on('success' , function(data) {
        res.json(data);
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message || '获取组织列表失败');
    });
};

/**
 * 修改用户组织
 */
exports.changeOrganization = function(req,res) {
    var user_id = req.params.user_id;
    var group_id = req.params.group_id;
    organizationService.changeOrganization(req,res,user_id,group_id).on('success' , function(data) {
        res.json(data);
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message || '修改用户所属组织失败');
    });
};

/**
 * 获取组织电话系统配置
 */
exports.getCallSystemConfig = function(req,res) {
    let backendIntl = new BackendIntl(req);
    organizationService.getCallSystemConfig(req,res).on('success' , function(data) {
        res.json(data);
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message || backendIntl.get('common.callsystem.get.faild', '获取组织电话系统配置失败'));
    });
};

/**
 * 完善个人试用资料
 */
exports.updatePersonalTrialInfo = function(req,res) {
    organizationService.updatePersonalTrialInfo(req,res).on('success' , function(data) {
        res.json(data);
    }).on('error' , function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};