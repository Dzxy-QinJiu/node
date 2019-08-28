'use strict';
var _ = require('lodash');
const userScoreService = require('../service/user-score-service');
exports.getUserScoreIndicator = (req, res) => {
    userScoreService.getUserScoreIndicator(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};
exports.getUserEngagementRule = (req, res) => {
    userScoreService.getUserEngagementRule(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};
exports.saveUserEngagementRule = (req, res) => {
    userScoreService.saveUserEngagementRule(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};
exports.getUserScoreLists = (req, res) => {
    userScoreService.getUserScoreLists(req, res).on('success', (data) => {
        //过滤掉不用的选择项
        if (_.isArray(data.detail)){
            data.detail = _.filter(data.detail, item => item.indicator !== 'online_time_rate');
            data.detail = _.filter(data.detail, item => item.indicator !== 'active_days_rate');
            _.forEach(data.detail, item => {
                if(item.indicator === 'active_days'){
                    //这里是因为如果选择天的时候，后端不需要online_unit字段，但是前端为了处理统一，也加了这个字段
                    item['online_unit'] = 'day';
                }
            });
        }
        //如果有选择了天数的，

        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};
exports.saveUserScoreLists = (req, res) => {
    userScoreService.saveUserScoreLists(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};




