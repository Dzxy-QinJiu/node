var React = require('react');
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
import ScheduleItem from './schedule-item';
import RightPanelScrollBar from 'MOD_DIR/crm/public/views/components/rightPanelScrollBar';
import ErrorDataTip from 'MOD_DIR/crm/public/views/components/error-data-tip';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import {editCluePrivilege} from '../../utils/clue-customer-utils';
import DetailCard from 'CMP_DIR/detail-card';
class CrmSchedule extends React.Component {
    state = {
        clueId: this.props.curClue.id || '',
        ...ScheduleStore.getState()
    };

    onStoreChange = () => {
        this.setState(ScheduleStore.getState());
    };
    componentDidMount() {
        ScheduleStore.listen(this.onStoreChange);
        //获取日程管理列表
        this.getScheduleList();
    }

    componentWillReceiveProps(nextProps) {
        var nextCustomerId = nextProps.curClue.id || '';
        var oldCustomerId = this.props.curClue.id || '';
        if (nextCustomerId !== oldCustomerId) {
            setTimeout(() => {
                this.setState({
                    clueId: nextCustomerId
                }, () => {
                    ScheduleAction.resetState();
                    //更新线索id成功后再获取跟进记录列表
                    this.getScheduleList();
                });
            });
        }
    }

    componentWillUnmount() {
        ScheduleStore.unlisten(this.onStoreChange);
        setTimeout(() => {
            ScheduleAction.resetState();
        });
    }

    getScheduleList = () => {
        let queryObj = {
            lead_id: this.state.clueId || '',
            page_size: this.state.pageSize || 20,
        };
        if (this.state.lastScheduleId) {
            queryObj.id = this.state.lastScheduleId;
        }
        ScheduleAction.getScheduleList(queryObj);
    };

    addSchedule = () => {
        const newSchedule = {
            lead_id: this.props.curClue.id,
            lead_name: this.props.curClue.name,
            start_time: '',
            end_time: '',
            alert_time: '',
            topic: '',
            edit: true
        };
        ScheduleAction.showAddForm(newSchedule);
        //滚动条滚动到顶端以显示添加表单
        GeminiScrollbar.scrollTo(this.refs.alertWrap, 0);
        Trace.traceEvent(ReactDOM.findDOMNode(this), '添加联系计划');
    };

    editSchedule = (alert) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '编辑联系计划');
        ScheduleAction.showEditForm(alert);
    };

    //修改状态
    handleItemStatus = (item) => {
        //只能修改自己创建的日程的状态
        if (user_id !== item.member_id) {
            return;
        }
        const reqData = {
            id: item.id,
            status: item.status === 'false' ? 'handle' : 'false',
        };
        var status = item.status === 'false' ? '完成' : '未完成';
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.item-wrapper .ant-btn'), '修改联系计划的状态为' + status);
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
    };

    deleteSchedule = (id) => {
        const reqData = {id: id};
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.schedule-top-block'), '删除联系计划');
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
    };

    //下拉加载
    handleScrollBarBottom = () => {
        var currListLength = _.isArray(this.state.scheduleList) ? this.state.scheduleList.length : 0;
        // 判断加载的条件
        if (currListLength < this.state.total) {
            this.getScheduleList();
        }
    };

    updateScheduleList = (newItem, type) => {
        let scheduleList = this.state.scheduleList;
        //如果是新增一个提醒
        if (type === 'add') {
            newItem.edit = false;
            scheduleList.unshift(newItem);
        } else if (type === 'delete') {
            scheduleList = _.filter(scheduleList, (list) => {
                return list.id !== newItem.id;
            });
        }
        this.setState({ scheduleList });
    };

    toggleScheduleContact = (item, flag) => {
        let curSchedule = _.find(this.state.scheduleList, schedule => schedule.id === item.id);
        curSchedule.isShowContactPhone = flag;
        this.setState({scheduleList: this.state.scheduleList});
    };

    renderTimeLineItem = (item, hasSplitLine) => {
        if (item.edit) {
            return (
                <div className="form-wrapper">
                    <CrmScheduleForm
                        getScheduleList={this.getScheduleList}
                        currentSchedule={item}
                        curCustomer={this.props.curClue}
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
                />);
        }
    };

    renderScheduleContent = () => {
        return (
            <div className="schedule-list" data-tracename="联系计划页面">
                {this.state.isLoadingScheduleList && !this.state.lastScheduleId ? <Spinner />
                    : this.state.getScheduleListErrmsg ? (
                        <ErrorDataTip errorMsg={this.state.getScheduleListErrmsg} isRetry={true}
                            retryFunc={this.getScheduleList}/>)
                        : this.renderScheduleLists()
                }
            </div>);
    };

    //联系计划列表区域
    renderScheduleLists = () => {
        if (_.get(this.state, 'scheduleList[0]')) {
            return (
                <DetailCard content={(
                    <TimeLine
                        list={this.state.scheduleList}
                        groupByDay={true}
                        groupByYear={true}
                        timeField="start_time"
                        renderTimeLineItem={this.renderTimeLineItem}
                        relativeDate={false}
                    />)}
                />);
        } else {
            //加载完成，没有数据的情况
            return <NoDataIconTip tipContent={Intl.get('common.no.more.schedule', '暂无计划')} />;
        }
    };

    renderScheduleTitle = () => {
        return (
            <div className="schedule-title">
                <span>{Intl.get('crm.right.schedule', '联系计划')}:</span>
                {!_.get(this.state, 'scheduleList[0]') && !this.state.isLoadingScheduleList ? (
                    <span className="no-data-text">{}</span>) : null}
                {this.props.isMerge ? null : (
                    <span className="iconfont icon-add schedule-add-btn handle-btn-item"
                        title={Intl.get('crm.214', '添加联系计划')}
                        onClick={this.addSchedule} data-tracename='点击添加联系计划'/>)
                }
            </div>);
    };

    render() {
        return (
            <RightPanelScrollBar handleScrollBottom={this.handleScrollBarBottom}
                listenScrollBottom={this.state.listenScrollBottom}>
                <div className="schedule-top-block" data-tracename="线索详情日程面板">
                    <span className="total-tip crm-detail-total-tip">
                        {!this.state.getScheduleListErrmsg ? this.state.total ? (
                            <ReactIntl.FormattedMessage
                                id="sales.frontpage.total.list"
                                defaultMessage={'共{n}条'}
                                values={{'n': this.state.total + ''}}/>) :
                            Intl.get('clue.has.no.schedule.list', '该线索还没有联系计划') : null}
                    </span>
                    {this.props.isMerge || !editCluePrivilege(this.props.curClue) ? null : (
                        <Button className='crm-detail-add-btn'
                            onClick={this.addSchedule.bind(this, '')} data-tracename='点击添加联系计划'>
                            {Intl.get('crm.214', '添加联系计划')}
                        </Button>
                    )}
                </div>
                {this.renderScheduleContent()}
            </RightPanelScrollBar>
        );
    }
}
CrmSchedule.propTypes = {
    curClue: PropTypes.object,
    isMerge: PropTypes.bool
};
module.exports = CrmSchedule;

