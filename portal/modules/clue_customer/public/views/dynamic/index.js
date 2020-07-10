/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/8.
 */
var React = require('react');
require('../../css/dynamic.less');
//动态store
var DynamicStore = require('../../store/dynamic-store');
//动态action
var DynamicAction = require('../../action/dynamic-action');
import {AntcTimeLine} from 'antc';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import Spinner from 'CMP_DIR/spinner';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import {RightPanel} from 'CMP_DIR/rightPanel';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import ShearContent from '../../../../../components/shear-content-new';
import DetailCard from 'CMP_DIR/detail-card';

class Dynamic extends React.Component {
    state = {
        showCustomerId: '',//正在展示客户详情的客户id
        isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
        customerOfCurUser: {},//当前展示用户所属客户的详情
        ...DynamicStore.getState(),
        divHeight: this.props.divHeight
    };

    onStoreChange = () => {
        this.setState({...DynamicStore.getState()});
    };

    componentDidMount() {
        DynamicStore.listen(this.onStoreChange);
        DynamicAction.getDynamicList(this.props.currentId, this.state.pageSize);
        $(window).on('resize', this.onStoreChange);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentId !== this.props.currentId) {
            DynamicAction.setInitialData();
            setTimeout(() => {
                DynamicAction.getDynamicList(nextProps.currentId,this.state.pageSize);
            });
        }
        if (nextProps.divHeight !== this.props.divHeight){
            this.setState({
                divHeight: nextProps.divHeight
            });
        }
    }

    componentWillUnmount() {
        DynamicAction.setInitialData();
        DynamicStore.unlisten(this.onStoreChange);
        $(window).off('resize', this.onStoreChange);
    }

    handleShowCustomerDetail = (customerId) => {
        this.setState({
            showCustomerId: customerId
        });
    };

    showCustomerDetail = (customerId) => {
        this.setState({
            showCustomerId: customerId
        });
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customerId,
                ShowCustomerUserListPanel: this.props.ShowCustomerUserListPanel,
                hideRightPanel: this.closeRightPanel
            }
        });
    };

    closeRightPanel = () => {
        this.setState({
            showCustomerId: ''
        });
    };

    timeLineItemRender = (item) => {
        return (
            <dl>
                <dd>
                    <ShearContent>
                        {item.message}
                    </ShearContent>
                    {item.relate_name && item.relate_id ? <span className="relate-name" onClick={this.showCustomerDetail.bind(this, item.relate_id)} data-tracename="查看客户详情">{item.relate_name}</span> : null}
                </dd>
                <dt>{moment(item.date).format(oplateConsts.TIME_FORMAT)}</dt>
            </dl>
        );
    };

    render() {
        let customerOfCurUser = this.state.customerOfCurUser;
        return (
            <DetailCard content={(
                <div className="clue-customer-dynamic" style={{ height: this.state.divHeight }} data-tracename="线索变更记录">
                    <GeminiScrollbar
                    // handleScrollBottom={this.handleScrollBarBottom}
                    // listenScrollBottom={this.state.listenScrollBottom}
                    >
                        {this.state.isLoading ? <Spinner /> : this.state.errorMsg ? (
                            <span className="dynamic-error-tip">{this.state.errorMsg}</span>) : _.get(this.state, 'dynamicList[0]') ? (
                            <div className="dynamic-list">
                                <AntcTimeLine
                                    data={this.state.dynamicList}
                                    groupByDay={true}
                                    timeField="date"
                                    contentRender={this.timeLineItemRender}
                                />
                            </div>) : <NoDataIconTip tipContent={Intl.get('crm.dynamic.no.data', '暂无动态')} />}
                    </GeminiScrollbar>
                </div>
            )} />
        );
    }
}
Dynamic.propTypes = {
    divHeight: PropTypes.number,
    currentId: PropTypes.string,
    ShowCustomerUserListPanel: PropTypes.func
};
module.exports = Dynamic;


