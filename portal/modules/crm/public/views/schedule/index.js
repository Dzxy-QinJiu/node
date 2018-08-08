require('../../css/schedule.less');
var ScheduleStore = require('../../store/schedule-store');
var ScheduleAction = require('../../action/schedule-action');
var CrmScheduleForm = require('./form');
import {message, Button} from 'antd';
var GeminiScrollbar = require('../../../../../components/react-gemini-scrollbar');
var TimeLine = require('CMP_DIR/time-line-new');
import Trace from 'LIB_DIR/trace';
import userData from 'PUB_DIR/sources/user-data';
var user_id = userData.getUserData().user_id;
import Spinner from 'CMP_DIR/spinner';
import DetailCard from 'CMP_DIR/detail-card';
import {DetailEditBtn} from 'CMP_DIR/rightPanel';
import ScheduleItem from './schedule-item';
import RightPanelScrollBar from '../components/rightPanelScrollBar';
import ErrorDataTip from '../components/error-data-tip';
import CallNumberUtil from 'PUB_DIR/sources/utils/get-common-data-util';
import classNames from 'classnames';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';

var CrmSchedule = React.createClass({
    getInitialState: function() {
        return {
            customerId: this.props.curCustomer.id || '',
            callNumber: this.props.callNumber || '', // 座机号
            getCallNumberError: '',
            ...ScheduleStore.getState()
        };
    },
    onStoreChange: function() {
        this.setState(ScheduleStore.getState());
    },
    // 获取拨打电话的座席号
    getUserPhoneNumber: function() {
        CallNumberUtil.getUserPhoneNumber(callNumberInfo => {
            if (callNumberInfo) {
                if (callNumberInfo.callNumber) {
                    this.setState({
                        callNumber: callNumberInfo.callNumber,
                        getCallNumberError: ''
                    });
                } else if (callNumberInfo.errMsg) {
                    this.setState({
                        callNumber: '',
                        getCallNumberError: callNumberInfo.errMsg
                    });
                }
            } else {
                this.setState({
                    callNumber: '',
                    getCallNumberError: Intl.get('crm.get.phone.failed', ' 获取座机号失败!')
                });
            }
        });
    },
    componentDidMount: function() {
        ScheduleStore.listen(this.onStoreChange);
        if (this.state.callNumber === '') {
            this.getUserPhoneNumber();
        }
        //获取日程管理列表
        this.getScheduleList();
    },
    componentWillReceiveProps: function(nextProps) {
        var nextCustomerId = nextProps.curCustomer.id || '';
        var oldCustomerId = this.props.curCustomer.id || '';
        if (nextCustomerId !== oldCustomerId) {
            setTimeout(() => {
                this.setState({
                    customerId: nextCustomerId
                }, () => {
                    ScheduleAction.resetState();
                    this.getScheduleList();
                });
            });
        }
    },
    componentWillUnmount: function() {
        ScheduleStore.unlisten(this.onStoreChange);
        setTimeout(() => {
            ScheduleAction.resetState();
        });
    },
    getScheduleList: function() {
        let queryObj = {
            customer_id: this.state.customerId || '',
            page_size: this.state.pageSize || 20,
        };
        if (this.state.lastScheduleId) {
            queryObj.id = this.state.lastScheduleId;
        }
        ScheduleAction.getScheduleList(queryObj);
    },
    addSchedule: function() {
        const newSchedule = {
            customer_id: this.props.curCustomer.id,
            customer_name: this.props.curCustomer.name,
            start_time: '',
            end_time: '',
            alert_time: '',
            topic: '',
            edit: true
        };
        ScheduleAction.showAddForm(newSchedule);
        //滚动条滚动到顶端以显示添加表单
        GeminiScrollbar.scrollTo(this.refs.alertWrap, 0);
        Trace.traceEvent('查看联系计划', '添加联系计划');
    },
    editSchedule: function(alert) {
        Trace.traceEvent(this.getDOMNode(), '编辑联系计划');
        ScheduleAction.showEditForm(alert);
    },
    //修改状态
    handleItemStatus: function(item) {
        //只能修改自己创建的日程的状态
        if (user_id !== item.member_id) {
            return;
        }
        const reqData = {
            id: item.id,
            status: item.status === 'false' ? 'handle' : 'false',
        };
        var status = item.status === 'false' ? '完成' : '未完成';
        Trace.traceEvent($(this.getDOMNode()).find('.item-wrapper .ant-btn'), '修改联系计划的状态为' + status);
        ScheduleAction.handleScheduleStatus(reqData, (resData) => {
            if (_.isBoolean(resData) && resData) {
                var newStatusObj = {
                    'id': item.id,
                    'status': reqData.status
                };
                ScheduleAction.afterHandleStatus(newStatusObj);
            } else {
                message.error(resData || Intl.get('crm.failed.alert.todo.list', '修改待办事项状态失败'));
            }
        });
    },
    deleteSchedule: function(id) {
        const reqData = {id: id};
        Trace.traceEvent($(this.getDOMNode()).find('.item-wrapper .anticon-delete'), '删除联系计划');
        ScheduleAction.deleteSchedule(reqData, (resData) => {
            if (_.isBoolean(resData) && resData) {
                ScheduleAction.afterDelSchedule(id);
                this.setState({
                    scheduleList: this.state.scheduleList
                });
            } else {
                message.error(Intl.get('crm.139', '删除失败'));
            }
        });
    },
    //下拉加载
    handleScrollBarBottom: function() {
        var currListLength = _.isArray(this.state.scheduleList) ? this.state.scheduleList.length : 0;
        // 判断加载的条件
        if (currListLength < this.state.total) {
            this.getScheduleList();
        }
    },
    updateScheduleList: function(newItem, type) {
        //如果是新增一个提醒
        if (type === 'add') {
            newItem.edit = false;
            this.state.scheduleList.unshift(newItem);
        } else if (type === 'delete') {
            this.state.scheduleList = _.filter(this.state.scheduleList, (list) => {
                return list.id !== newItem.id;
            });
        }
        this.setState({
            scheduleList: this.state.scheduleList
        });
    },


    toggleScheduleContact(item, flag){
        let curSchedule = _.find(this.state.scheduleList, schedule => schedule.id === item.id);
        curSchedule.isShowContactPhone = flag;
        this.setState({scheduleList: this.state.scheduleList});
    },

    renderTimeLineItem(item, hasSplitLine){
        if (item.edit) {
            return (
                <div className="form-wrapper">
                    <CrmScheduleForm
                        getScheduleList={this.getScheduleList}
                        currentSchedule={item}
                        curCustomer={this.props.curCustomer}
                    />
                </div>
            );
        } else {
            return (
                <ScheduleItem
                    item={item}
                    hasSplitLine={hasSplitLine}
                    isMerge={this.props.isMerge}
                    toggleScheduleContact={this.toggleScheduleContact}
                    deleteSchedule={this.deleteSchedule}
                    handleItemStatus={this.handleItemStatus}
                    callNumber={this.state.callNumber}
                    getCallNumberError={this.state.getCallNumberError}
                />);
        }
    },

    renderScheduleContent(){
        return (
            <div className="schedule-list" data-tracename="联系计划页面">
                {this.state.isLoadingScheduleList && !this.state.lastScheduleId ? <Spinner />
                    : this.state.getScheduleListErrmsg ? (
                        <ErrorDataTip errorMsg={this.state.getScheduleListErrmsg} isRetry={true}
                            retryFunc={this.getScheduleList}/>)
                        : this.renderScheduleLists()
                }
            </div>);
    },
    //联系计划列表区域
    renderScheduleLists: function() {
        if (_.get(this.state, 'scheduleList[0]')) {
            return (
                <TimeLine
                    list={this.state.scheduleList}
                    groupByDay={true}
                    groupByYear={true}
                    timeField="start_time"
                    renderTimeLineItem={this.renderTimeLineItem}
                    relativeDate={false}
                />);
        } else {
            //加载完成，没有数据的情况
            return null;
        }
    },
    renderScheduleTitle(){
        return (
            <div className="schedule-title">
                <span>{Intl.get('crm.right.schedule', '联系计划')}:</span>
                {!_.get(this.state, 'scheduleList[0]') && !this.state.isLoadingScheduleList ? (
                    <span className="no-data-text">{}</span>) : null}
                {this.props.isMerge ? null : (
                    <span className="iconfont icon-add schedule-add-btn"
                        title={Intl.get('crm.214', '添加联系计划')}
                        onClick={this.addSchedule}/>)
                }
            </div>);
    },
    render(){
        return (
            <RightPanelScrollBar handleScrollBottom={this.handleScrollBarBottom}
                listenScrollBottom={this.state.listenScrollBottom}>
                <div className="schedule-top-block">
                    <span className="total-tip crm-detail-total-tip">
                        {this.state.total ? (
                            <ReactIntl.FormattedMessage
                                id="sales.frontpage.total.list"
                                defaultMessage={'共{n}条'}
                                values={{'n': this.state.total + ''}}/>) :
                            Intl.get('crm.detail.no.schedule', '该客户还没有联系计划')}
                    </span>
                    {this.props.isMerge ? null : (
                        <Button className='crm-detail-add-btn'
                            onClick={this.addSchedule.bind(this, '')}>
                            {Intl.get('crm.214', '添加联系计划')}
                        </Button>
                    )}
                </div>
                {this.state.isLoadingScheduleList ? (<Spinner/>) : _.get(this.state, 'scheduleList[0]') ? (
                    <DetailCard className='schedule-contianer'
                        content={this.renderScheduleContent()}/>) : (
                    <NoDataIconTip tipContent={Intl.get('common.no.more.schedule', '暂无计划')}/>)}
            </RightPanelScrollBar>
        );
    }
});

module.exports = CrmSchedule;
