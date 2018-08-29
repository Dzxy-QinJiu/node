var React = require('react');
import { Button, Icon } from 'antd';
var DEFAULT_ALl = Intl.get('common.all', '全部');
import Trace from 'LIB_DIR/trace';
var UserFilterAdv = React.createClass({
    roleSelected: function(role) {
        if (role != this.props.selectRole) {
            //角色筛选
            this.props.filterUserByRole(role);
            Trace.traceEvent(this.getDOMNode(),'点击角色进行过滤');
        }
    },
    getRoleListJsx: function() {
        const userRoleList = $.extend(true, [], this.props.userRoleList);
        userRoleList.unshift({role_name: DEFAULT_ALl, num: this.props.allUserTotal, role_define: ''});
        return userRoleList.map((role, idx) => {
            let className = this.props.selectRole == role.role_define ? 'selected' : '';
            return (<li key={idx} onClick={this.roleSelected.bind(this, role.role_define)}
                className={className}
            >
                <span className="tag-name">{role.role_name}</span>
                <span className="tag-count">{role.num}</span>
            </li>);
        });
    },
    render: function() {

        return (
            <div className="user-filter-adv" style={{display: this.props.isFilterPanelShow ? 'block' : 'none'}} >
                <dl>
                    <dt>
                        <ReactIntl.FormattedMessage id="common.role" defaultMessage="角色"/>
                    </dt>
                    <dd>
                        <ul>{this.getRoleListJsx()}</ul>
                    </dd>
                </dl>
            </div>
        );
    }
})
    ;

module.exports = UserFilterAdv;

