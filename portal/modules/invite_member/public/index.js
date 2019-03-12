/**
 * Created by hzl on 2019/3/8.
 */
require('./css/index.less');
import userData from 'PUB_DIR/sources/user-data';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import commonDataUtil from 'PUB_DIR/sources/utils/common-data-util';
import InviteMemberForm from './view/invite-member-form';

class InviteMember extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            teamList: [], // 团队信息
            isInivteMemberRightPanelShow: false, // 是否显示邀请成员的面板，默认为false
        };
    }
    componentDidMount = () => {
        // 销售主管获取团队信息（邀请成员时，销售主管需要团队信息，运营人员不需要）
        if (userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER)) {
            this.getTeamList();
        }
    };
    componentWillUnmount = () => {
        this.setState({
            teamList: [],
            isInivteMemberRightPanelShow: false
        });
    };
    // 获取团队信息
    getTeamList = () => {
        commonDataUtil.getMyTeamTreeAndFlattenList( data => {
            this.setState({
                teamList: _.get(data, 'teamList', [])
            });
        } );
    };

    // 显示邀请成员面板
    showInviteMemberPanel = (event) => {
        this.setState({
            isInivteMemberRightPanelShow: true
        });
        Trace.traceEvent(event, '点击邀请成员');
    };
    // 关闭邀请成员面板
    closeRightPanel = () => {
        this.setState({
            isInivteMemberRightPanelShow: false,
        });
        Trace.traceEvent(event, '关闭邀请成员界面');
    };

    render() {
        // 销售领导、运营人员有邀请成员的权限
        let hasInivteMemberPrivilege = hasPrivilege('MEMBER_INVITE_APPLY') &&
            (userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER) || userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON));
        if (hasInivteMemberPrivilege) {
            return (
                <div className="invite-member">
                    <div className="btn-item-container">
                        <span className='btn-item iconfont icon-invite-member'
                            onClick={this.showInviteMemberPanel}
                            title={Intl.get('sales.home.invite.member', '邀请成员')}>
                        </span>
                    </div>
                    {
                        this.state.isInivteMemberRightPanelShow ?
                            <InviteMemberForm
                                teamList={this.state.teamList}
                                closeRightPanel={this.closeRightPanel}
                            /> : null
                    }
                </div>
            );
        } else {
            return null;
        }

    }
}

module.exports = InviteMember;