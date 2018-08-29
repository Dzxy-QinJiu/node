var React = require('react');
import rightPanelUtil from 'CMP_DIR/rightPanel';
const RightPanelClose = rightPanelUtil.RightPanelClose;
import Spinner from 'CMP_DIR/spinner';
import { Tabs } from 'antd';
const TabPane = Tabs.TabPane;
import CommissionPayment from './commission-payment';

const CommissionRightPanel = React.createClass({
    getInitialState: function() {
        return {
            isLoading: false,
            userList: JSON.parse(JSON.stringify(this.props.userList)),
            teamList: JSON.parse(JSON.stringify(this.props.teamList)),
        };
    },
    componentDidMount: function() {
        $(window).on('resize', this.setContentHeight);
        this.setContentHeight();

        //补充用户列表
        this.supplementUserList(this.props);
        //补充团队列表
        this.supplementTeamList(this.props);
    },
    componentWillUnmount: function() {
        $(window).off('resize', this.setContentHeight);
    },
    setContentHeight: function() {
        const wrapper = $('.ant-tabs-tabpane');
        //新高度 = 窗口高度 - 容器距窗口顶部的距离 - 底部留空
        wrapper.height($(window).height() - $('.ant-tabs-content').offset().top - 70);
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({});
        //补充用户列表
        this.supplementUserList(nextProps);
        //补充团队列表
        this.supplementTeamList(nextProps);
    },
    //补充用户列表
    ///以防止在编辑的时候，已经离职的销售人员无法选中的问题
    supplementUserList: function(props) {
        const userId = props.commission.user_id;
        const userName = props.commission.user_name;
        const userIndex = _.findIndex(props.userList, user => user.user_id === userId);

        if (userId && userName && userIndex === -1) {
            this.state.userList.push({
                user_id: userId,
                nick_name: userName,
            });

            this.setState(this.state);
        }
    },
    //补充团队列表
    ///以防止在编辑的时候，已经删除的销售团队无法选中的问题
    supplementTeamList: function(props) {
        const teamId = props.commission.sales_team_id;
        const teamName = props.commission.sales_team;
        const teamIndex = _.findIndex(props.teamList, team => team.groupId === teamId);

        if (teamId && teamName && teamIndex === -1) {
            this.state.teamList.push({
                groupId: teamId,
                groupName: teamName,
            });

            this.setState(this.state);
        }
    },
    showLoading: function() {
        this.setState({isLoading: true});
    },
    hideLoading: function() {
        this.setState({isLoading: false});
    },
    handleCancel: function() {
        if (this.props.commission.id) {
            this.setState({isFormShow: false});
        } else {
            this.props.hideRightPanel();
        }
    },
    render: function() {
        return (
            <div id="contractRightPanel">
                <RightPanelClose
                    onClick={this.props.hideRightPanel}
                />
                <div className="add-form">
                    <Tabs activeKey="1">
                        <TabPane tab={_.isEmpty(this.props.commission) ? Intl.get('sales.commission.add.commission', '添加提成') : Intl.get('sales.commission.info', '提成信息')} key="1">
                            <CommissionPayment
                                commission={this.props.commission}
                                teamList={this.props.teamList}
                                userList={this.props.userList}
                                getUserList={this.props.getUserList}
                                isGetUserSuccess={this.props.isGetUserSuccess}
                                showLoading={this.showLoading}
                                hideLoading={this.hideLoading}
                                hideRightPanel={this.props.hideRightPanel}
                                refreshCurrentCommission={this.props.refreshCurrentCommission}
                                addCommission={this.props.addCommission}
                                deleteCommission={this.props.deleteCommission}
                            />
                        </TabPane>
                    </Tabs>
                </div>
                {this.state.isLoading ? (
                    <Spinner className="isloading"/>
                ) : null}
            </div>
        );
    }
});

module.exports = CommissionRightPanel;


