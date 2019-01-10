import {Router} from 'react-router-dom';
import {renderRoutes} from 'react-router-config';
import Translate from '../intl/i18nTemplate';

const history = require('./history');
const routeUtils = require('./route/route-utils');


//获取权限之后,系统入口
function init() {
    let authedRoute = routeUtils.filterRoute(require('./route/routers').routers);
    const routes = <Router history={history}>{renderRoutes(authedRoute)}</Router>;

    ReactDOM.render(<Translate Template={routes}></Translate>, $('#app')[0]);
}

exports.init = init;

