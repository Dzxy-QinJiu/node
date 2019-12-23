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

    const url = '/accounts?' + querystring.stringify(query);

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

    if (appId && (_.includes(appId, 'all') || _.includes(appId, ','))) {
        return true;
    } else {
        return false;
    }
}

//是否普通销售
export function isCommonSales() {
    return userData.getUserData().isCommonSales;
}

//是否是要查看具体销售人员的数据
//普通销售自己登录或管理人员选择某些销售都属于这种情况
export function isSales() {
    return isCommonSales() || Store.teamMemberFilterType === 'member'; 
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
    if (_.has(arg, 'query.start_time')) {
        _.set(arg, 'query.starttime', arg.query.start_time);
        delete arg.query.start_time;
    }

    if (_.has(arg, 'query.end_time')) {
        _.set(arg, 'query.endtime', arg.query.end_time);
        delete arg.query.end_time;
    }
}

//查询参数回调函数: 不带下划线的开始结束时间转成带下划线的
export function argCallbackTimeToUnderlineTime(arg) {
    if (_.has(arg, 'query.starttime')) {
        _.set(arg, 'query.start_time', arg.query.starttime);
        delete arg.query.starttime;
    }

    if (_.has(arg, 'query.endtime')) {
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
//
//可以将原始返回数据，如：
//{
//    deal: 0,
//    deal_rate: 0,
//    pass: 5,
//    pass_rate: 0.8333,
//    total: 6
//}
//或
//{
//    deal: 0,
//    pass_deal: 0,
//    pass: 5,
//    total_pass: 0.8333,
//    total: 6
//}
//转化成图表渲染及导出需要的数据格式：
//[
//    {
//        name: '',
//        value: 6,
//        showValue: '提交数: 6',
//        csvName: '提交数'
//    },
//    {
//        name: '83.33%',
//        value: 5,
//        showValue: '通过数: 5',
//        csvName: '通过数'
//    },
//    {
//        name: '0.00%',
//        value: 0,
//        showValue: '成交数: 0',
//        csvName: '成交数',
//        totalConvertRate: '0.00%'
//    }
//]
//
//参数说明：
//stageList 阶段列表，提供阶段标识到其中文名的映射，如：
//[
//    {
//        name: '提交数',
//        key: 'total',
//    },
//    {
//        name: '通过数',
//        key: 'pass',
//    },
//    {
//        name: '成交数',
//        key: 'deal',
//    }
//]
//需要这个参数是因为返回值里只有阶段标识，没有中文名，而图表上需要显示中文名，所以需要通过一个映射表将标识对应的中文名查出来
//
//prefixRule 前缀规则，用于构造转化率字段的前缀匹配规则，若为'STAGE_NAME'，表示要用stageList中的当前被遍历的阶段标识替换，若为其他字符串，则用字符串本身
//
//suffixRule 后缀规则，用于构造转化率字段的后缀匹配规则，若为'STAGE_NAME'，表示要用下划线加stageList中的当前被遍历的阶段标识替换，若为其他字符串，则用字符串本身
//
//需要前后缀规则参数是因为返回值里的转化率字段命名规则不统一，有的用 阶段标识+固定后缀 如：deal_rate，有的用 前一阶段+后一阶段，如：pass_deal
//通过设置前后缀规则参数，就能构造出转化率字段标识，从而匹配出对应阶段转化率的值
//
export function getFunnelWithConvertRateProcessDataFunc(stageList, prefixRule = 'STAGE_NAME', suffixRule = '_rate') {
    return function(data) {
        //最终数据
        let processedData = [];

        //遍历阶段映射列表
        _.each(stageList, stage => {
            //从返回数据中取出对应阶段的值
            let value = data[stage.key] || 0;

            //用于在图表上显示的值
            const showValue = stage.name + ': ' + value;

            //转化率
            let convertRate = '';
            //转化率字段前缀
            let prefix;
            //转化率字段后缀
            let suffix;

            //如果前缀规则为从当前阶段映射中取阶段标识
            if (prefixRule === 'STAGE_NAME') {
                //则将前缀设为当前阶段标识
                prefix = stage.key; 
            } else {
                //否则将前缀设为前缀规则本身的值
                prefix = prefixRule;
            }

            //如果后缀规则为从当前阶段映射中取阶段标识
            if (suffixRule === 'STAGE_NAME') {
                //则将后缀设为下划线加上当前阶段标识
                suffix = '_' + stage.key; 
            } else {
                //否则将后缀设为后缀规则本身的值
                suffix = suffixRule;
            }

            //如果前后缀均不为null，表示需要取相邻两个阶段间的转化率
            if (prefix !== null && suffix !== null) {
                //遍历返回的数据对象
                _.each(data, (value, key) => {
                    //前缀是否匹配
                    let prefixMatched;
                    //后缀是否匹配
                    let suffixMatched;

                    //如果返回数据对象中当前被遍历的项的键值是以设置的前缀开头的
                    if (key.startsWith(prefix)) {
                        //则前缀匹配成功
                        prefixMatched = true;
                    }

                    //如果返回数据对象中当前被遍历的项的键值是以设置的后缀结尾的
                    if (key.endsWith(suffix)) {
                        //则后缀匹配成功
                        suffixMatched = true;
                    }

                    //如果前后缀都匹配成功，说明该项数据即为当前阶段对应的转化率
                    if (prefixMatched && suffixMatched) {
                        //将转化率设为当前遍历项的值
                        convertRate = value;
                        //找到了对应的转化率后，就可以退出循环了
                        return false;
                    }
                });
            }

            //如果转化率是数字
            if (_.isNumber(convertRate)) {
                //转为百分比
                convertRate = (convertRate * 100).toFixed(2) + '%';
            }

            //用处理后得到的值构造最终数据项并加入最终数据数组
            processedData.push({
                name: convertRate,
                value,
                showValue,
                csvName: stage.name
            });
        });

        //总转化率
        let totalConvertRate;

        //获取第一个阶段的键
        const firstStageKey = _.first(stageList).key;
        //通过第一个阶段的键获取第一个阶段的值
        const firstStageValue = data[firstStageKey] || 0;
        //获取最后一个阶段的键
        const lastStageKey = _.last(stageList).key;
        //通过最后一个阶段的键获取最后一个阶段的值
        const lastStageValue = data[lastStageKey] || 0;

        //如果第一个阶段值为0，则直接将总转化率设为'0%'，以防止其作为被除数时会得出错误的结果
        if (firstStageValue === 0) {
            totalConvertRate = '0%';
        } else {
            //否则用最后一个阶段的值除以第一个阶段值来得到总转化率
            totalConvertRate = ((lastStageValue / firstStageValue) * 100).toFixed(2) + '%';
        }

        //将成交率存入最后一个数据项
        _.last(processedData).totalConvertRate = totalConvertRate;

        //返回最终数据
        return processedData;
    };
}

//带转化率的漏斗图的导出数据处理函数
export function funnelWithConvertRateProcessCsvData(chart, option) {
    let csvData = [];
    let thead = [];
    let tbody = [];

    //转化率相关表头列名数组
    let convertRateNames = [];
    //转化率相关值数组
    let convertRateValues = [];

    const data = chart.data;

    _.each(data, (item, index) => {
        thead.push(item.csvName);
        tbody.push(item.value);

        //item.name里存的是从上一阶段到当前阶段的转化率
        //如果该转化率存在
        if (item.name) {
            //取上一阶段的导出列名
            const prevColCsvName = data[index - 1].csvName;
            //构造从上一阶段到当前阶段的转化率列名
            const rateColName = prevColCsvName + '到' + item.csvName + '转化率';
            //将该列名存入转化率相关表头列名数组
            convertRateNames.push(rateColName);
            //将转化率值存入转化率相关值数组
            convertRateValues.push(item.name);
        }

        //如果当前阶段是数据的最后一项，也即最后一个阶段
        if (index === data.length - 1) {
            //将转化率相关表头列名数组并入表头数组
            thead = thead.concat(convertRateNames);
            //将转化率相关值数组并入表体数组
            tbody = tbody.concat(convertRateValues);
        }

        //如果当前项中包含总转化率
        if (item.totalConvertRate) {
            thead.push('总转化率');
            tbody.push(item.totalConvertRate);
        }
    });

    csvData.push(thead, tbody);

    return csvData;
}

//获取114占比和客服电话统计数据处理函数
export function get114RatioAndServiceTelProcessDataFunc(type) {
    return function(data, chart) {
        let processedData = [];

        if (isCommonSales()) {
            data = data[0];

            if (data.rate !== 0) {
                let name, nonName;

                if (type === '114') {
                    name = Intl.get('common.114.phone', '114电话');
                    nonName = Intl.get('common.non.114.phone', '非114电话');
                } else {
                    name = Intl.get('call.record.service.phone', '客服电话');
                    nonName = Intl.get('common.non.service.phone', '非客服电话');
                }

                processedData.push(
                    {
                        name,
                        value: data.invalid_docs,
                        rate: data.rate
                    },
                    {
                        name: nonName,
                        value: data.total_docs - data.invalid_docs,
                        rate: 1 - data.rate
                    }
                );
            }
        } else {
            _.each(data, item => {
                if (item.rate !== 0) {
                    processedData.push({
                        name: item.sales_team || item.nick_name,
                        value: item.rate
                    });
                }
            });
        }

        return processedData;
    };
}

//获取114占比和客服电话统计选项处理函数
export function get114RatioAndServiceTelProcessOptionFunc() {
    return function(option) {
        if (isCommonSales()) {
            option.tooltip.formatter = params => {
                return params.marker + params.name + ': ' + params.value + ', 占比: ' + numToPercent(params.data.rate);
            };
        }

        //纵轴标签显示到100%
        option.yAxis[0].max = 1;
    };
}
