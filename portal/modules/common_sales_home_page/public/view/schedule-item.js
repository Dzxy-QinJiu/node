/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/15.
 */
require('../css/schedule-item.less');
import SalesHomePageAction from '../action/sales-home-actions';
import {Button, message} from 'antd';
import userData from 'PUB_DIR/sources/user-data';
import ContactItem from './contact-item';
import {getScheduleCallTypeId} from 'PUB_DIR/sources/utils/common-method-util';
var user_id = userData.getUserData().user_id;
class ScheduleItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scheduleItemDetail: this.props.scheduleItemDetail,
            handleStatusLoading: false,//正在提交修改日程的状态
            isEdittingItemId: '',//正在修改状态的那条日程的id
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.scheduleItemDetail.id && nextProps.scheduleItemDetail.id !== this.state.scheduleItemDetail.id) {
            this.setState({
                scheduleItemDetail: nextProps.scheduleItemDetail
            });
        }
    }

    openCustomerOrClueDetail = (schedule) => {
        this.props.openCustomerOrClueDetail(schedule);
    };

    handleFinishedSchedule(scheduleId) {
        //点击日程列表中的标记为完成
        const reqData = {
            id: scheduleId,
            status: 'handle',
        };
        this.setState({
            handleStatusLoading: true,
            isEdittingItemId: scheduleId
        });
        SalesHomePageAction.handleScheduleStatus(reqData, (resData) => {
            this.setState({
                handleStatusLoading: false,
                isEdittingItemId: ''
            });
            if (_.isBoolean(resData) && resData) {
                //标记为完成后，把样式改成标记完成的样式
                SalesHomePageAction.afterHandleStatus({
                    type: this.props.scheduleType,
                    id: scheduleId
                });
            } else {
                message.error(resData || Intl.get('crm.failed.alert.todo.list', '修改待办事项状态失败'));
            }
        });
    }

    render() {
        var schedule = this.state.scheduleItemDetail;
        //联系人的相关信息
        var contacts = schedule.contacts ? schedule.contacts : [];
        var contactTime = moment(schedule.start_time).format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT) + '-' + moment(schedule.end_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT);
        let scheduleTypeId = getScheduleCallTypeId(schedule);
        return (
            <div className="schedule-item-container customer-detail-item">
                {this.props.isShowTopTitle ? <div className="schedule-top-panel">
                    {Intl.get('sales.fromtpage.set.contact.time', '原定于{initialtime}联系', {initialtime: contactTime})}
                </div> : null}
                <div className="schedule-content-panel">
                    <div className="schedule-title">
                        {this.props.isShowScheduleTimerange ? <span className="time-range">
                             [{moment(schedule.start_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)}-{
                                moment(schedule.end_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT)
                            }]
                        </span> : null}
                        <span className="sale-home-customer-name" onClick={this.openCustomerOrClueDetail.bind(this, schedule)} data-tracename="打开客户详情">

                            {schedule.topic || schedule.customer_name}
                        </span>
                        {user_id === schedule.member_id && schedule.status !== 'handle' ?
                            <Button type="primary" data-tracename="处理日程" size="small"
                                onClick={this.handleFinishedSchedule.bind(this, schedule.id)}
                            >{Intl.get('sales.frontpage.schedule.has.finished', '完成了')}</Button> : null}

                    </div>
                    <div className="schedule-content">
                        {schedule.content}
                    </div>
                    {_.isArray(contacts) && contacts.length ? <ContactItem
                        id={scheduleTypeId.id}
                        type={scheduleTypeId.type}
                        contacts={contacts}
                        customerData={schedule}
                        itemType="schedule"
                    /> : null}
                </div>
            </div>
        );
    }
}

ScheduleItem.defaultProps = {
    scheduleItemDetail: {},//日程详细信息
    isShowTopTitle: true, //是否展示顶部时间样式
    isShowScheduleTimerange: true,//是否展示日程的时间范围
    openCustomerOrClueDetail: function() {

    },
};
ScheduleItem.propTypes = {
    scheduleItemDetail: PropTypes.object,//日程详细信息
    isShowTopTitle: PropTypes.bool, //是否展示顶部时间样式
    isShowScheduleTimerange: PropTypes.bool,//是否展示日程的时间范围
    openCustomerOrClueDetail: PropTypes.func,
};
export default ScheduleItem;