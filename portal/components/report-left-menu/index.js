/**
 * 报告页面左侧菜单
 */

require('./style.less');
import {NavLink} from 'react-router-dom';
const userData = require('PUB_DIR/sources/user-data');

class ReportLeftMenu extends React.Component {
    render() {
        const data = userData.getUserData();
        const subMenus = _.get(data, 'thirdLevelMenus.REPORT');

        return (
            <div className='report-left-menu'>
                <ul>
                    {_.map(subMenus, menuItem => (
                        <li>
                            <NavLink
                                to={'/' + menuItem.routePath}
                                activeClassName="active"
                            >
                                {menuItem.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}

export default ReportLeftMenu;
