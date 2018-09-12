import ajax from 'MOD_DIR/common/ajax';
const routeList = require('MOD_DIR/common/route');

const ajaxPro = (handler, paramsObj) => {
    const route = routeList.find(x => x.handler === handler);
    if (!route) {
        throw new Error('cannot find route by handler\'' + handler + '\'');
    } else {
        const config = {
            url: route.path,
            type: route.method
        };
        if (paramsObj) { 
            if (paramsObj.params) {
                config.params = paramsObj.params;
            }
            if (paramsObj.data) {
                config.data = paramsObj.data;
            }
            if (paramsObj.query) {
                config.query = paramsObj.query;
            }
        }
        return ajax($.extend({}, config, { usePromise: true }));
    }
};
export default ajaxPro;
