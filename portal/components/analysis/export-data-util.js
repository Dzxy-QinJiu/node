/**
 * 图表导出数据的处理
 * */

// 用户留存
export function handleRetentionChartData(processData) {
    let exportData = [];
    let columns = processData.columns || [];
    let titleArray = columns.map((item) => {
        let title = item;
        if(item === 'date') {
            title = Intl.get('common.login.time', '时间');
        } else if(item === 'added') {
            title = Intl.get('oplate.user.analysis.32', '新增数');
        }
        return title;
    });
    exportData.push(titleArray);
    let tableJsonList = processData.tableJsonList || [];
    _.each( tableJsonList, (rowObj) => {
        exportData.push( _.values(rowObj) );
    } );
    return exportData;
}

// 饼图数据的处理
export function handlePieChartData(processData) {
    let exportData = [];
    if(_.isArray(processData)){
        _.each(processData, (itemData) => {
            let userTypeArray = [];
            if (itemData.name) { // 用户类型、应用启停用状态
                userTypeArray.push(itemData.name);
            }
            if (itemData.key === 0) { // 在线时长统计
                userTypeArray.push(Intl.get('oplate.user.analysis.7', '时长小于1小时'));
            } else if (itemData.key === 1) {
                userTypeArray.push(Intl.get('oplate.user.analysis.8', '时长大于等于1小时'));
            }
            if(itemData.count){
                userTypeArray.push(itemData.count);
            }
            exportData.push(userTypeArray);
        });
    } else {
        // 应用的启停用状态
        if (processData.enabled) {
            exportData.push([Intl.get('common.enabled', '启用'), processData.enabled]);
        }
        if (processData.disabled) {
            exportData.push([Intl.get('common.stop', '停用'), processData.disabled]);
        }
        // 用户类型
        if (processData.formal) {
            exportData.push([Intl.get('common.official', '签约'), processData.formal]);
        }
        if (processData.trial) {
            exportData.push([Intl.get('common.trial', '试用'), processData.trial]);
        }
        if (processData.special) {
            exportData.push([Intl.get('user.type.presented', '赠送'), processData.special]);
        }
        if (processData.training) {
            exportData.push([Intl.get('user.type.train', '培训'), processData.training]);
        }
        if (processData.internal) {
            exportData.push([Intl.get('user.type.employee', '员工'), processData.internal]);
        }
        if (processData.unknown) {
            exportData.push([Intl.get('common.unknown', '未知'), processData.unknown]);
        }
        // 用户登录时长
        if (processData.higher) {
            exportData.push([Intl.get('app_operation.13', '高于平均时长') + processData.avgLoginTime, processData.higher]);
        }
        if (processData.lower) {
            exportData.push([Intl.get('app_operation.14', '低于平均时长') + processData.avgLoginTime, processData.lower]);
        }
    }

    return exportData;
}


/** 柱状图数据的处理
 *  processData的数据结构：
 *  [{name: "鹰眼全网监测", count: 20}, {name: "鹰击微博舆情", count: 666}]
 * */
export function handleBarChartData(processData, valueField = 'count') {
    let exportData = [];
    if (_.isArray(processData) && processData.length) {
        let titleArray = _.map(processData, 'name');
        let titleArrayName = titleArray.map((item) => {
            let title = item;
            if(item === 'unknown') {
                title = Intl.get('common.unknown', '未知');
            }
            return title;
        });
        exportData.push(titleArrayName);
        let countArray = _.map(processData, valueField);
        exportData.push(countArray);
    }
    return exportData;
}

// 线图数据的处理
export function handleLineChartData(processData, valueField = 'count') {
    let exportData = [];
    if (_.isArray(processData) && processData.length) {
        let titleArray = _.map(processData, 'timestamp');
        let titleArrayName = titleArray.map( (time) => {
            return moment(+time).format(oplateConsts.DATE_FORMAT);
        });
        exportData.push(titleArrayName);
        let countArray = _.map(processData, valueField);
        // 新增用户下，正式和试用用户
        if(processData[0].formal || processData[0].formal === 0) {
            titleArrayName.unshift(Intl.get('common.type', '类型'));
            countArray = _.map(processData, 'formal'); // 正式用户
            countArray.unshift(Intl.get('user.analysis.formal', '正式'));
            exportData.push(countArray);
        }
        if (processData[0].trial || processData[0].trial === 0) {
            countArray = _.map(processData, 'trial'); // 试用用户
            countArray.unshift(Intl.get('common.trial', '试用'));
        }
        if (processData[0].active) {
            countArray = _.map(processData, 'active'); // 用户活跃度
        }

        exportData.push(countArray);
    }
    return exportData;
}

// 处理用户类型中，签约、试用、赠送、培训、未知的类型
function handleUserType(userTypeData) {
    let userTypeArrayData = [];
    let formalArray = _.map(userTypeData, 'formal');
    if (formalArray.length) {
        formalArray.unshift(Intl.get('common.official', '签约'));
        userTypeArrayData.push(formalArray);
    }
    let trialArray = _.map(userTypeData, 'trial');
    if (trialArray.length) {
        trialArray.unshift(Intl.get('common.trial', '试用'));
        userTypeArrayData.push(trialArray);
    }
    let specialArray = _.map(userTypeData, 'special');
    if (specialArray.length) {
        specialArray.unshift(Intl.get('user.type.presented', '赠送'));
        userTypeArrayData.push(specialArray);
    }
    let trainingArray = _.map(userTypeData, 'training');
    if (trainingArray.length) {
        trainingArray.unshift(Intl.get('user.type.train', '培训'));
        userTypeArrayData.push(trainingArray);
    }
    let internalArray = _.map(userTypeData, 'internal');
    if (internalArray.length) {
        internalArray.unshift(Intl.get('user.type.employee', '员工'));
        userTypeArrayData.push(internalArray);
    }
    let unknownArray = _.map(userTypeData, 'unknown');
    if (unknownArray.length) {
        unknownArray.unshift(Intl.get('common.unknown', '未知'));
        userTypeArrayData.push(unknownArray);
    }
    let totalArray = _.map(userTypeData, 'total');
    if (totalArray.length) {
        totalArray.unshift(Intl.get('operation.report.total.num', '总数'));
        userTypeArrayData.push(totalArray);
    }
    return userTypeArrayData;
}
// 用户统计数据的处理
export function handleUserStatis(userAnalysisData) {
    let exportData = [];
    if (_.isArray(userAnalysisData) && userAnalysisData.length) {
        if (userAnalysisData[0].app_name) { // 综合条件下
            let titleArray = _.map(userAnalysisData[0].data, 'timestamp');
            let titleNameArray = titleArray.map( (time) => {
                return moment(+time).format(oplateConsts.DATE_FORMAT);
            });
            titleNameArray.unshift(Intl.get('common.product.name','产品名称'));
            exportData.push(titleNameArray);
            let countArray = [];
            _.each( userAnalysisData, (userData) => {
                countArray = _.map(userData.data, 'count');
                countArray.unshift(userData.app_name);
                exportData.push(countArray);
            } );
        } else { // 单个应用
            let titleArray = _.map(userAnalysisData, 'timestamp');
            let titleNameArray = titleArray.map( (time) => {
                return moment(+time).format(oplateConsts.DATE_FORMAT);
            });
            titleNameArray.unshift(Intl.get('user.user.type', '用户类型'));
            let singleAppUserData = handleUserType(userAnalysisData);
            singleAppUserData.unshift(titleNameArray);
            exportData = singleAppUserData;
        }
    }
    return exportData;
}

// 团队统计、行业统计、地域统计的数据处理
export function handleExportData(processData) {
    let exportData = [];
    if (_.isArray(processData) && processData.length) {
        let titleArray = _.map(processData, 'name');
        let titleArrayName = titleArray.map((item) => {
            let title = item;
            if(item === 'unknown') {
                title = Intl.get('common.unknown', '未知');
            }
            return title;
        });
        if (processData[0].total) { // 综合条件下
            titleArrayName.unshift(Intl.get('user.user.type', '用户类型'));
            let userData = handleUserType(processData);
            userData.unshift(titleArrayName);
            exportData = userData;
        } else if(processData[0].count) {
            exportData.push(titleArrayName);
            let countArray = _.map(processData, 'count');
            exportData.push(countArray);
        }
    }
    return exportData;
}

// 活跃度的数据处理
export function handleActivelyData(processData) {
    let exportData = [];
    if (_.isArray(processData) && processData.length) {
        let datas = processData[0].datas;
        let titleArray = _.map(datas, 'timestamp');
        let titleNameArray = titleArray.map( (time) => {
            return moment(+time).format(oplateConsts.DATE_FORMAT);
        });
        titleNameArray.unshift(Intl.get('common.type', '类型'));
        exportData.push(titleNameArray);

        let activeArray = _.map(datas, 'active'); // 活跃数
        activeArray.unshift(Intl.get('operation.report.active.num', '活跃数'));
        exportData.push(activeArray);

        let percentArray = [];
        let totalArray = [];
        _.each( datas, (activeStats) => {
            if (activeStats.percent) {
                var parseText = parseFloat(activeStats.percent * 100);
                var count = !isNaN(parseText) ? parseText.toFixed(2) + '%' : '';
                percentArray.push(count);
            } else {
                percentArray.push((0).toFixed(2) + '%');
            }
            if (activeStats.total) {
                totalArray.push( activeStats.total );
            } else {
                totalArray.push(0);
            }
        } );
        percentArray.unshift(Intl.get('operation.report.active', '活跃率'));
        totalArray.unshift(Intl.get('operation.report.total.num', '总数'));
        exportData.push(percentArray, totalArray);
    }
    return exportData;
}

// 活跃时间段统计
export function handleActiveTimesData(processData) {
    let titleArray = _.range(24);
    let titleNameArray = _.map( titleArray, (title) => {
        return title + '点';
    } );
    titleNameArray.unshift(Intl.get('common.login.time', '时间'));
    let exportData = [];
    let groupBy = _.groupBy(processData, (active) => {return active.week;} );
    _.each(groupBy, (group) => {
        let week = group[0].week;
        let countArray = _.map(group, 'count');
        if (week === '0') {
            countArray.unshift(Intl.get('user.time.sunday', '周日'));
            exportData.push(countArray);
        } else if (week === '1') {
            countArray.unshift(Intl.get('user.time.monday', '周一'));
            exportData.push(countArray);
        } else if (week === '2') {
            countArray.unshift(Intl.get('user.time.tuesday', '周二'));
            exportData.push(countArray);
        } else if (week === '3') {
            countArray.unshift(Intl.get('user.time.wednesday', '周三'));
            exportData.push(countArray);
        } else if (week === '4') {
            countArray.unshift(Intl.get('user.time.thursday', '周四'));
            exportData.push(countArray);
        } else if (week === '5') {
            countArray.unshift(Intl.get('user.time.friday', '周五'));
            exportData.push(countArray);
        } else if (week === '6') {
            countArray.unshift(Intl.get('user.time.saturday', '周六'));
            exportData.push(countArray);
        }
    });
    exportData.unshift(titleNameArray);
    return exportData;
}

// 各版本下载统计
export function handleAppDownLoadData(processData, appTitleName) {
    let exportData = [];
    let titleNameArray = appTitleName.map( (time) => {
        return moment(new Date(+time)).format(oplateConsts.DATE_FORMAT);
    });
    titleNameArray.unshift(Intl.get('contract.21', '版本号'));
    exportData.push(titleNameArray);
    _.each(processData, (versionData) => {
        let countArray = versionData.data;
        countArray.unshift(versionData.name);
        exportData.push(countArray);
    });
    return exportData;
}

//地域统计
export function handleZoneExportData(processData) {
    let exportData = [];
    if (_.isArray(processData) && processData.length) {
        exportData.push(['地域','人数']);
        exportData = exportData.concat(processData.map(x => [
            x.name, x.value
        ]));
    }
    return exportData;
}

//设备统计
export function handleDeviceExport(data) {
    let exportArr = [];
    if (_.isArray(data) && data.length) {
        exportArr.push([Intl.get('common.login.equipment', '设备'),Intl.get('common.app.count', '数量')]);
        exportArr = exportArr.concat(data.map(x => [
            x.name, x.count
        ]));
    }
    return exportArr;
}

//浏览器
export function handleBrowserExport(data) {
    let exportArr = [];
    if (_.isArray(data) && data.length) {
        exportArr.push([Intl.get('user.info.login.browser', '浏览器'),Intl.get('common.app.count', '数量')]);
        exportArr = exportArr.concat(data.map(x => [
            x.name, x.count
        ]));
    }
    return exportArr;
}
//用户访问次数
export function handleLoginCountsExport(data) {
    let exportArr = [];
    if (_.isArray(data) && data.length) {
        exportArr.push([Intl.get('user.login.time', '次数'), Intl.get('common.app.count', '数量')]);
        exportArr = exportArr.concat(data);
    }
    return exportArr;
}

export function handleLoginDaysExport(data) {
    let exportArr = [];
    if (_.isArray(data) && data.length) {
        exportArr.push([Intl.get('oplate.user.analysis.loginDays', '用户访问天数'), Intl.get('common.app.count', '数量')]);
        exportArr = exportArr.concat(data);
    }
    return exportArr;
}

export function handleLoginTimesExport(data) {
    let exportArr = [];
    if (_.isArray(data) && data.length) {
        exportArr.push([Intl.get('oplate.user.analysis.loginTimes', '用户在线时间'), Intl.get('common.app.count', '数量')]);
        exportArr = exportArr.concat(data.map(x => {
            return [x[0], (x[1] - 1) * 60];
        }));
    }
    return exportArr;
}

export function handleAveTimesExport(data) {
    let exportArr = [];
    if (_.isArray(data) && data.length) {
        exportArr.push([Intl.get('oplate.user.analysis.averageLoginTimes', '平均在线时长'), Intl.get('common.app.count', '数量')]);
        exportArr = exportArr.concat(data.map(x => [
            x.name, x.count
        ]));
    }
    return exportArr;
}

/*** 多条线图(一个时间点对应一个数据)
 * processData的数据结构： 
 * [{app_name: "鹰击微博舆情"}, data: [{count:60, timestamp: 1518364800000}, ...], ...]
 * */
export function handleMultiLineChartData(processData, titleName) {
    let exportData = [];
    if (_.isArray(processData) && processData.length) {
        let titleArray = _.map( processData[0].data, 'timestamp');
        let titleNameArray = titleArray.map((time) => {
            return moment(+time).format(oplateConsts.DATE_FORMAT);
        });
        titleNameArray.unshift(titleName);
        exportData.push(titleNameArray);
        let countArray = [];
        _.each(processData, (itemData) => {
            countArray = _.map(itemData.data, 'count');
            countArray.unshift(itemData.app_name);
            exportData.push(countArray);
        });
    }
    return exportData;
}

/*** 活跃度的多条线图（一个时间点对应多个数据）
 * processData的数据结构：
 *  [{appName: "鹰击微博舆情"}, datas: [{active:766, percent:0.06796805678793257,timestamp:1520179200000,total:11270}, ...], ...]
 * */
export function handleMultiLineActivelyData(processData) {
    let exportData = [];
    if (_.isArray(processData) && processData.length) {
        let titleArray = _.map( processData[0].datas, 'timestamp');
        let titleNameArray = titleArray.map((time) => {
            return moment(+time).format(oplateConsts.DATE_FORMAT);
        });
        let exportTimeArray = [], activeTypeArray = [];
        titleNameArray.forEach( (time, index) => {
            if (index === 0) {
                exportTimeArray.push('', time, '', '');
                activeTypeArray.push(Intl.get('common.product.name','产品名称'),Intl.get('operation.report.active.num', '活跃数'),
                    Intl.get('operation.report.total.num', '总数'), Intl.get('operation.report.active', '活跃率'));
            } else {
                exportTimeArray.push(time, '', '');
                activeTypeArray.push(Intl.get('operation.report.active.num', '活跃数'),
                    Intl.get('operation.report.total.num', '总数'), Intl.get('operation.report.active', '活跃率'));
            }
        });
        exportData.push(exportTimeArray, activeTypeArray);

        processData.forEach( (itemData) => {
            let dataRows = [itemData.appName];
            itemData.datas.forEach( (data) => {
                dataRows.push( data.active || 0);
                dataRows.push( data.total || 0);
                var parseText = parseFloat((data.percent || 0) * 100);
                var count = !isNaN(parseText) ? parseText.toFixed(2) + '%' : '';
                dataRows.push(count);
            } );
            exportData.push( dataRows );
        } );
    }
    return exportData;
}

/** table表格数据,需要传处理的数据processData，以及表头columns
 * columns，数据结构为：
 *  [{dataIndex: "name", key: "department", title: "部门"}, {dataIndex: "3E6570bKX4okbBT10TANVohs", key: "count0", title: "鹰击微博舆情"},...]
 *  prcessData的数据结构：
 [{ 3E6570bKX4okbBT10TANVohs: 1, 8Usrp3M88v75TP90Iw1IYwNA:5,name: "南部区域",total:6},
 { 3E6570bKX4okbBT10TANVohs: 12, 8Usrp3M88v75TP90Iw1IYwNA:6,name: "南部网信",total:18}...]
 * */
export function handleTableData(processData, columns) {
    let exportData = [];
    if (_.isArray(columns) && columns.length) {
        if (_.isArray(processData) && processData.length) {
            let titleArray = _.map( columns, 'title');
            exportData.push(titleArray);
            processData.forEach( (itemData) => {
                let dataRows = [];
                columns.forEach( (column) => {
                    dataRows.push(itemData[column.dataIndex]);
                });
                exportData.push( dataRows );
            });
        }
    }
    return exportData;
}

/**
 * 漏斗图数据的处理
 * processData的数据结构：
 * [{name: "鹰眼全网监测", count: 20}, {name: "鹰击微博舆情", count: 666}]
 */
export function processChartExportData(processData, valueField = 'count') {
    let exportData = [];
    if (_.isArray(processData) && processData.length) {
        let titleArray = _.map(processData, 'name');
        let titleArrayName = titleArray.map((item) => {
            let title = item;
            if(item === 'unknown') {
                title = Intl.get('common.unknown', '未知');
            }
            return title;
        });
        exportData.push(titleArrayName);
        let countArray = _.map(processData, valueField);
        exportData.push(countArray);
    }
    return exportData;
}

