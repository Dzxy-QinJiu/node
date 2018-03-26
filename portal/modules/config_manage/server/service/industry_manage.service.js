/**
 * Created by zhshj on 2017/2/6.
 */
"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);

var IndustryManageRestApis = {
	//行业列表
	Industries: "/rest/base/v1/realm/config/industry"
};

exports.urls = IndustryManageRestApis;

//获取行业列表
exports.getIndustries = function (req, res, obj) {
	return restUtil.authRest.get({
		url: IndustryManageRestApis.Industries,
		req: req,
		res: res
	},{
		page_size:obj.page_size
	});
};
//添加行业信息
exports.addIndustries = function (req, res, obj) {
	return restUtil.authRest.post({
		url: IndustryManageRestApis.Industries,
		req: req,
		res: res
	},obj);
};
//删除行业信息
exports.deleteIndustries = function (req, res, delete_id) {
	return restUtil.authRest.del({
		url: IndustryManageRestApis.Industries+'/'+delete_id,
		req: req,
		res: res
	},null);
};
