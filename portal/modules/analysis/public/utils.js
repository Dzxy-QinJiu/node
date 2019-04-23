/**
 * 辅助函数
 */

import Store from './store';
const userData = require('PUB_DIR/sources/user-data');
const querystring = require('querystring');

//获取导入的上下文中的文件内容
//req 为导入的上下文
//sortField 为排序字段
export function getContextContent(req, sortField = 'menuIndex') {
    //内容数组
    let content = [];

    //将通过require.context引入的文件的内容放入内容数组
    req.keys().forEach(key => {
        content.push(req(key));
    });

    //按排序字段值排序
    content = _.sortBy(content, sortField);

    return content;
}

//处理图表点击事件
export function handleChartClick(name, value, conditions) {
    let conditionObj = {};

    _.each(conditions, condition => {
        conditionObj[condition.name] = condition.value;
    });

    const query = {
        app_id: conditionObj.app_id,
        login_begin_date: conditionObj.start_time,
        login_end_date: conditionObj.end_time,
        analysis_filter_value: value,
        analysis_filter_field: name,
        customerType: conditionObj.tab,
    };

    const url = '/crm?' + querystring.stringify(query);

    //跳转到客户列表
    window.open(url);
}

//数字转百分比
export function numToPercent(num) {
    return (num * 100).toFixed(2) + '%';
}

//获取范围请求参数
export function getRangeReqData(rangeParams, multiple) {
    let reqData = [];

    rangeParams.forEach(rangeParam => {
        if (Array.isArray(rangeParam)) {
            reqData.push(...rangeParam.map(value => ({
                'from': value,
                'to': value
            })));
        }
        else {
            if (multiple) {
                rangeParam = _.mapValues(rangeParam, value => value * multiple);
            }
            reqData.push(rangeParam);
        }
    });

    return reqData;
}
    
//处理线索统计数据
export function processClueStatisticsData(isAvalibility, originData) {
    var data = [];
    _.forEach(originData, (dataItem) => {
        _.forEach(dataItem, (value, key) => {
            if (isAvalibility) {
                if (key === '0') {
                    key = Intl.get('clue.analysis.ability', '有效');
                }
                if (key === '1') {
                    key = Intl.get('clue.analysis.inability', '无效');
                }
            }
            data.push({
                'value': value,
                'name': key || Intl.get('common.unknown', '未知')
            });
        });
    });
    return data;
}

//是否选中的不是单个应用
export function ifNotSingleApp(conditions) {
    const appIdCondition = _.find(conditions, condition => condition.name === 'app_id');
    const appId = _.get(appIdCondition, 'value');

    if (appId && (appId.includes('all') || appId.includes(','))) {
        return true;
    } else {
        return false;
    }
}

//是否是要查看具体销售人员的数据
//普通销售自己登录或管理人员选择某些销售都属于这种情况
export function isSales() {
    return userData.getUserData().isCommonSales || Store.teamMemberFilterType === 'member'; 
}

//是否是管理员或运营人员
export function isAdminOrOpStaff() {
    const role = userData.ROLE_CONSTANS;
    const hasRole = userData.hasRole;

    return hasRole(role.OPERATION_PERSON) || hasRole(role.REALM_ADMIN);
}

//是否选择的是全部团队或成员
export function isSelectedAllTeamMember() {
    return Store.isSelectedAllTeamMember; 
}

//查询参数回调函数: 带下划线的开始结束时间转成不带下划线的
export function argCallbackUnderlineTimeToTime(arg) {
    if (_.get(arg, 'query.start_time')) {
        _.set(arg, 'query.starttime', arg.query.start_time);
        delete arg.query.start_time;
    }

    if (_.get(arg, 'query.end_time')) {
        _.set(arg, 'query.endtime', arg.query.end_time);
        delete arg.query.end_time;
    }
}

//查询参数回调函数: 不带下划线的开始结束时间转成带下划线的
export function argCallbackTimeToUnderlineTime(arg) {
    if (_.get(arg, 'query.starttime')) {
        _.set(arg, 'query.start_time', arg.query.starttime);
        delete arg.query.starttime;
    }

    if (_.get(arg, 'query.endtime')) {
        _.set(arg, 'query.end_time', arg.query.endtime);
        delete arg.query.endtime;
    }
}

//查询参数回调函数: team_ids 转 team_id
export function argCallbackTeamIdsToTeamId(arg) {
    if (_.get(arg, 'query.team_ids')) {
        _.set(arg, 'query.team_id', arg.query.team_ids);
        delete arg.query.team_ids;
    }
}

//查询参数回调函数: member_ids 转 member_id
export function argCallbackMemberIdsToMemberId(arg) {
    if (_.get(arg, 'query.member_ids')) {
        _.set(arg, 'query.member_id', arg.query.member_ids);
        delete arg.query.member_ids;
    }
}

//查询参数回调函数: member_id 转 member_ids
export function argCallbackMemberIdToMemberIds(arg) {
    if (_.get(arg, 'query.member_id')) {
        _.set(arg, 'query.member_ids', arg.query.member_id);
        delete arg.query.member_id;
    }
}

//查询参数回调函数: member_ids 转 sales_id
export function argCallbackMemberIdsToSalesId(arg) {
    if (_.get(arg, 'query.member_ids')) {
        _.set(arg, 'query.sales_id', arg.query.member_ids);
        delete arg.query.member_ids;
    }
}

//数据出来函数：将 num 字段的值赋给 value 字段
export function processDataNumToValue(data) {
    _.each(data, item => {
        item.value = item.num;
    });

    return data;
}

//瀑布图csv数据处理函数
export function processFallsChartCsvData(chart, option) {
    let csvData = [];
    //用横坐标标签做表头
    const thead = _.get(option, 'xAxis[0].data');

    csvData.push(thead);

    let tr = [];

    _.each(option.series, serie => {
        //只取有名称的系列
        //无名称的系列为隐藏系列，其值只起遮挡作用，无需导出
        if (serie.name) {
            //过滤出数值
            const numberArr = _.filter(serie.data, item => _.isNumber(item));
            //追加到数值行中
            tr = tr.concat(numberArr);
        }
    });

    csvData.push(tr);

    return csvData;
}

//获取带转化率的漏斗图的数据处理函数
export function getFunnelWithConversionRateProcessDataFunc(stageList, separator = ': ', prefixRule = 'STAGE_NAME', suffixRule = '_rate') {
    return function(data) {
        let processedData = [];

        _.each(stageList, stage => {
            let value = data[stage.key] || 0;

            //用于在图表上显示的值
            const showValue = stage.name + separator + value;

            //转化率
            let convertRate = '';
            let prefix;
            let suffix;

            if (prefixRule === 'STAGE_NAME') {
                prefix = stage.key; 
            } else {
                prefix = prefixRule;
            }

            if (suffixRule === 'STAGE_NAME') {
                suffix = '_' + stage.key; 
            } else {
                suffix = suffixRule;
            }

            if (prefix !== null && suffix !== null) {
                _.each(data, (value, key) => {
                    let prefixMatched, suffixMatched;

                    if (key.startsWith(prefix)) {
                        prefixMatched = true;
                    }

                    if (key.endsWith(suffix)) {
                        suffixMatched = true;
                    }

                    if (prefixMatched && suffixMatched) {
                        convertRate = value;
                        return false;
                    }
                });
            }

            if (_.isNumber(convertRate)) {
                convertRate = (convertRate * 100).toFixed(2) + '%';
            }

            processedData.push({
                name: convertRate,
                value,
                showValue,
                csvName: stage.name
            });
        });

        //总转化率
        let totalConvertRate;

        const firstStageKey = _.first(stageList).key;
        const firstStageValue = data[firstStageKey];
        const lastStageKey = _.last(stageList).key;
        const lastStageValue = data[lastStageKey];

        if (firstStageValue === 0) {
            totalConvertRate = '0%';
        } else {
            totalConvertRate = ((lastStageValue / firstStageValue) * 100).toFixed(2) + '%';
        }

        //将成交率存入最后一个数据项
        _.last(processedData).totalConvertRate = totalConvertRate;

        return processedData;
    };
}
