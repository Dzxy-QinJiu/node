const routes = require('../../../common/route');
import ajax from '../../../common/ajax';
const ajaxPro = function(handler) {
    const route = routes.find(x => x.handler === handler);
    // let jqXHR = null;
    let config = {
        url: route.path,
        type: route.method
    };
    return function(param) {
        if (typeof param === 'object') {
            config.data = param;
        }
        // jqXHR && jqXHR.abort();
        return ajax(config);
    };
};

//获取合同数据
exports.getContractData = ajaxPro('getContractData');

//费用数据
exports.getCostData = ajaxPro('getCostData');

//还款数据
exports.getRepaymentData = ajaxPro('getRepaymentData');

//获取保存的表格列表
exports.getTableList = ajaxPro('getTableList');

//保存表格视图
exports.saveTableInfo = ajaxPro('saveTableInfo');

//获取表格字段信息
exports.getTableInfo = ajaxPro('getTableInfo');