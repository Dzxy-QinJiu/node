/**
 * Created by wangliping on 2017/4/13.
 */
var TeamService = require('../service/team');
var Resolver = require('fastjson_ref_resolver').Resolver;
const _ = require('lodash');
import {DeleteChildDepartment} from '../dto/app';

//根据团队id获取团队下的成员列表
exports.getSalesTeamMemberList = function(req, res) {
    var groupId = req.params.group_id;
    TeamService.getSalesTeamMemberList(req, res, groupId, req.query).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取当前销售所在销售团队及其子团队列表
exports.getSalesTeamList = function(req, res) {
    TeamService.getSalesTeamList(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取统计团队内成员个数的列表
exports.getTeamMemberCountList = function(req, res) {
    TeamService.getTeamMemberCountList(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取我能看的团队树列表
exports.getMyteamTreeList = function(req, res) {
    TeamService.getMyteamTreeList(req, res).on('success', function(data) {
        data = new Resolver(data).resolve();
        _.forEach(data, (teamItem) => {
            delete teamItem.client_id;
            delete teamItem.create_date;
            if (teamItem.child_groups && _.isArray(teamItem.child_groups) && teamItem.child_groups.length) {
                DeleteChildDepartment(teamItem.child_groups);
            }
        });
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};