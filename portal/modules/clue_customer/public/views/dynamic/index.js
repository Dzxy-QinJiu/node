/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/8.
 */
require('../../css/dynamic.less');
//动态store
var DynamicStore = require('../../store/dynamic-store');
//动态action
var DynamicAction = require('../../action/dynamic-action');
var TimeLine = require('CMP_DIR/time-line');
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import Spinner from 'CMP_DIR/spinner';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import CustomerDetail from 'MOD_DIR/crm/public/views/customer-detail';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import {RightPanel} from 'CMP_DIR/rightPanel';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
const DYNAMICHEIGHT = {
    LAYOUT: 130
};

var Dynamic = React.createClass({
    getInitialState: function() {
        return {
            showCustomerId: '',//正在展示客户详情的客户id
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            ...DynamicStore.getState(),
            windowHeight: $(window).height()
        };
    },
    onStoreChange: function() {
        this.setState({...DynamicStore.getState()});
    },
    componentDidMount: function() {
        DynamicStore.listen(this.onStoreChange);
        DynamicAction.getDynamicList(this.props.currentId, this.state.pageSize);
        $(window).on('resize', this.onStoreChange);
    },
    componentWillReceiveProps: function(nextProps) {
        if (nextProps.currentId !== this.props.currentId) {
            DynamicAction.setInitialData();
            setTimeout(() => {
                DynamicAction.getDynamicList(nextProps.currentId,this.state.pageSize);
            });
        }
    },
    componentWillUnmount: function() {
        DynamicAction.setInitialData();
        DynamicStore.unlisten(this.onStoreChange);
        $(window).off('resize', this.onStoreChange);
    },
    handleShowCustomerDetail: function(customerId) {
        this.setState({
            showCustomerId: customerId
        });
    },
    showCustomerDetail: function(customerId) {
        this.setState({
            showCustomerId: customerId
        });
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customerId,
                ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                hideRightPanel: this.closeRightPanel
            }
        });
    },
    closeRightPanel: function() {
        this.setState({
            showCustomerId: ''
        });
    },
    ShowCustomerUserListPanel: function(data) {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });
    },
    closeCustomerUserListPanel: function() {
        this.setState({
            isShowCustomerUserListPanel: false
        });
    },
    timeLineItemRender: function(item) {
        return (
            <dl>
                <dd>
                    {item.message}
                    {item.relate_name && item.relate_id ? <span className="relete-name" onClick={this.showCustomerDetail.bind(this, item.relate_id)}>{item.relate_name}</span> : null}
                </dd>
                <dt>{moment(item.date).format(oplateConsts.TIME_FORMAT)}</dt>
            </dl>
        );
    },
    //关闭已有客户的右侧面板
    hideRightPanel: function(){
        this.setState({
            showCustomerId: ''
        });
    },
    render: function() {
        var divHeight = $(window).height() - DYNAMICHEIGHT.LAYOUT;
        let customerOfCurUser = this.state.customerOfCurUser;
        return (
            <div className="clue-customer-dynamic" style={{height: divHeight}} >
                <GeminiScrollbar
                    // handleScrollBottom={this.handleScrollBarBottom}
                    // listenScrollBottom={this.state.listenScrollBottom}
                >
                    {this.state.isLoading && !this.state.lastClueId ? <Spinner/> : this.state.errorMsg ? (
                        <span className="dynamic-error-tip">{this.state.errorMsg}</span>) : _.get(this.state, 'dynamicList[0]') ? (
                        <div className="clue-dynamic-list">
                            <TimeLine
                                list={this.state.dynamicList}
                                groupByDay={true}
                                timeField="date"
                                render={this.timeLineItemRender}
                            />
                        </div>) : <NoDataIconTip tipContent={Intl.get('crm.dynamic.no.data', '暂无动态')}/>}
                </GeminiScrollbar>
                {/*该客户下的用户列表*/}
                {this.state.isShowCustomerUserListPanel ? <RightPanel
                    className="customer-user-list-panel"
                    showFlag={this.state.isShowCustomerUserListPanel}
                >
                    { this.state.isShowCustomerUserListPanel ?
                        <AppUserManage
                            customer_id={customerOfCurUser.id}
                            hideCustomerUserList={this.closeCustomerUserListPanel}
                            customer_name={customerOfCurUser.name}
                        /> : null
                    }
                </RightPanel> : null}
            </div>
        );
    }
});

module.exports = Dynamic;

