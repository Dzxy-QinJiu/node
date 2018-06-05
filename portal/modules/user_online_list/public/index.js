import './css/index.less';
import TopNav from '../../../components/top-nav';
import OnlineUserList from './views/list';
import OnlineUserFilter from './views/filter';
import OnlineUserIndexStore from './store';
import OnlineUserIndexAction from './action';
import UserDetail from '../../app_user_manage/public/views/user-detail';
import {RightPanel} from '../../../components/rightPanel';
import {userTypeList} from 'PUB_DIR/sources/utils/consts';

//生成状态下拉选项
const statusList = [
    {name: Intl.get('user.online.all.status', '全部状态'), value: ''},
    {name: Intl.get('user.overdue.not', '未过期'), value: '0'},
    {name: Intl.get('user.online.expired', '已过期'), value: '1'}
];

const UserOnlineList = React.createClass({
    selectedUserId: '',
    showRightPanel: false,
    getInitialState: function() {
        var state = OnlineUserIndexStore.getState();
        return {
            ...state,
            selectedUserId: this.selectedUserId,
            showRightPanel: this.showRightPanel
        };
    },
    closeRightPanel: function() {
        $(this.refs.wrap).find('.current_row').removeClass('current_row');
        this.selectedUserId = '';
        this.showRightPanel = false;
        this.setState({
            selectedUserId: '',
            showRightPanel: false
        });
    },
    componentWillMount: function() {
        OnlineUserIndexAction.getAppList();
        OnlineUserIndexStore.listen(this.onStoreChange);
        emitter.on('user_detail_close_right_panel' , this.closeRightPanel);
    },
    componentWillUnmount: function() {
        OnlineUserIndexStore.unlisten(this.onStoreChange);
        this.selectedUserId = '';
        this.showRightPanel = false;
        emitter.removeListener('user_detail_close_right_panel' , this.closeRightPanel);
    },
    componentDidMount: function() {
        var $wrap = $(this.refs.wrap);
        var _this = this;
        $wrap.on('click' , 'td.show-user-detail' , function() {
            $(this).closest('tr').siblings().removeClass('current_row');
            var $tr = $(this).closest('tr');
            var $user_id_hidden = $tr.find('.user_id_hidden');
            if($user_id_hidden[0]) {
                $tr.addClass('current_row');
                var user_id = $user_id_hidden.val();
                _this.selectedUserId = user_id;
                _this.showRightPanel = true;
                _this.setState({
                    selectedUserId: user_id,
                    showRightPanel: _this.showRightPanel
                });
            }
        });
    },
    onStoreChange: function() {
        this.setState(this.getInitialState());
    },
    //选中某个应用
    appSelected: function(appObj) {
        OnlineUserIndexAction.setSelectedAppId(appObj);
    },
    render: function() {
        return (
            <div data-tracename="在线用户列表页面">
                <div className="online-user-list-wrap" ref="wrap">
                    <TopNav>
                        <TopNav.MenuList/>
                        <OnlineUserFilter
                            appList={this.state.appList}
                            typeList={userTypeList}
                            statusList={statusList}
                            appSelected={this.appSelected}
                        />
                    </TopNav>
                    <OnlineUserList
                        appList={this.state.appList}
                        typeList={userTypeList}
                        statusList={statusList}/>
                </div>
                <RightPanel className="app_user_manage_rightpanel white-space-nowrap online_user_list_rightpanel"
                    showFlag={this.state.showRightPanel}>
                    {
                        this.state.selectedUserId ? (
                            <UserDetail userId={this.state.selectedUserId} selectedAppId={this.state.selectedAppId}/>
                        ) : null
                    }
                </RightPanel>
            </div>

        );
    }
});
module.exports = UserOnlineList;
