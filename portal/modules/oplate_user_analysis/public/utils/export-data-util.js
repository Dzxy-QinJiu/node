/**
 * 导出数据，整理为csv格式
 */

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

// 饼图数据的处理（用户类型、应用启停用状态、在线时长）
export function handlePieChartData(processData) {
    let exportData = [];
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
                percentArray.push( (activeStats.percent * 100).toFixed(2) + '%');
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

// 用户留存
export function handleRetentionData(processData) {
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