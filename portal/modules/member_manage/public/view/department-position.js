import { Tabs } from 'antd';
const TabPane = Tabs.TabPane;
const TAB_KEYS = {
    DEPARTMENT_TAB: '1',//部门
    POSITION_TAB: '2'// 职务
};

import PositionManage from './sales-role-manage';
import DepartmentManage from '../../../sales_team/public';
import {getOrganization} from 'PUB_DIR/sources/utils/common-method-util';


class DepartmentPosition extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: TAB_KEYS.DEPARTMENT_TAB
        };
    }
    // 切换tab时的处理
    changeActiveKey = (key) => {
        this.setState({
            activeKey: key
        });
    };

    render() {
        let organizationName = _.get(getOrganization(), 'name', '');
        return (
            <Tabs
                defaultActiveKey={TAB_KEYS.DEPARTMENT_TAB}
                activeKey={this.state.activeKey}
                onChange={this.changeActiveKey}
            >
                <TabPane
                    tab={Intl.get('crm.113', '部门')}
                    key={TAB_KEYS.DEPARTMENT_TAB}
                >

                    <div className='organization-name'>{organizationName}</div>
                    <DepartmentManage selected={this.state.selected}/>
                </TabPane>
                <TabPane
                    tab={Intl.get('member.position', '职务')}
                    key={TAB_KEYS.POSITION_TAB}
                >
                    <PositionManage />
                </TabPane>
            </Tabs>
        );
    }
}

export default DepartmentPosition;
