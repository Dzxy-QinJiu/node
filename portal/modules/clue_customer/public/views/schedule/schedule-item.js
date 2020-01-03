/**
 * 单个日程
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/5/4.
 */
import {Button, Popover, Popconfirm} from 'antd';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {getUserData} from 'PUB_DIR/sources/user-data';
import Trace from 'LIB_DIR/trace';
import PhoneCallout from 'CMP_DIR/phone-callout';
const DATE_TIME_WITHOUT_SECOND_FORMAT = oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT;

class ScheduleItem extends React.Component {
    constructor(props) {
        super(props);
    }

    getScheduleShowObj(item) {
        let scheduleShowOb = {
            iconClass: '',
            title: '',
            startTime: item.start_time ? moment(item.start_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT) : '',
            endTime: item.end_time ? moment(item.end_time).format(oplateConsts.TIME_FORMAT_WITHOUT_SECOND_FORMAT) : '',
            timeClass: ''
        };
        switch (item.type) {
            case 'lead':
                scheduleShowOb.iconClass = 'icon-phone-call-out';
                scheduleShowOb.title = Intl.get('crm.schedule.call', '打电话');
                break;
            case 'other':
                scheduleShowOb.iconClass = 'icon-trace-other';
                scheduleShowOb.title = Intl.get('customer.other', '其他');
                break;
        }
        //未完成的日程样式
        if (item.status === 'false') {
            //今天的起始、结束时间(23:59:59+1)
            let today = {start_time: moment().startOf('day').valueOf(), end_time: moment().endOf('day').valueOf() + 1};
            //超期（今天之前的日程）
            if (item.end_time < today.start_time) {
                scheduleShowOb.timeClass = 'overdue-schedule-item';
            } else if (item.start_time < item.end_time) {
                //今天的日程
                scheduleShowOb.timeClass = 'today-schedule-item';
            }
        }
        return scheduleShowOb;
    }

    getContactPhoneArray(item) {
        let phoneArray = [];
        _.each(_.get(item, 'contacts'), contact => {
            let contactName = contact.name || '';
            _.each(contact.phone, phone => {
                if (phone) {
                    phoneArray.push({name: contactName, phone: phone});
                }
            });
        });
        return phoneArray;
    }

    toggleScheduleContact(item, flag) {
        if (_.isFunction(this.props.toggleScheduleContact)) {
            this.props.toggleScheduleContact(item, flag);
        }
    }

    handleItemStatus(item) {
        if (_.isFunction(this.props.handleItemStatus)) {
            this.props.handleItemStatus(item);
        }
    }

    deleteSchedule(itemId) {
        if (_.isFunction(this.props.deleteSchedule)) {
            this.props.deleteSchedule(itemId);
        }
    }

    render() {
        const user_id = getUserData().user_id;
        const item = this.props.item;
        const scheduleShowObj = this.getScheduleShowObj(item);
        const phoneArray = this.getContactPhoneArray(item);
        const alertTime = Intl.get('crm.alert.time', '提醒时间') + ':' + moment(item.alert_time).format(DATE_TIME_WITHOUT_SECOND_FORMAT);
        const scheduleContentId = `schedule-item-content-wrap${item.id}`;
        var hasPhone = item.type === 'lead' && _.isArray(phoneArray) && phoneArray.length;
        return (
            <div
                className={classNames(`schedule-item ${scheduleShowObj.timeClass}`, {'day-split-line': this.props.hasSplitLine})}>
                <div className='schedule-item-title'>
                    <span className={`iconfont ${scheduleShowObj.iconClass} schedule-type-icon`}/>
                    <span className='schedule-time-stage'>{scheduleShowObj.startTime}</span>
                    {scheduleShowObj.startTime && scheduleShowObj.endTime ? '-' : null}
                    <span className='schedule-time-stage'>{scheduleShowObj.endTime}</span>
                    <span className='schedule-type-text'>{scheduleShowObj.title}</span>
                    {item.socketio_notice && item.alert_time ? (
                        <Popover
                            content={alertTime}
                            trigger='hover' placement='left'
                            overlayClassName='schedule-alert-time'>
                            <span className='iconfont icon-alarm-clock'/>
                        </Popover>) : null}
                </div>
                <div className="schedule-item-content-wrap" id={scheduleContentId}>
                    <div className='schedule-item-content'>
                        {item.content}
                    </div>
                    {this.props.isMerge ? null : (
                        <div className='schedule-item-buttons'>
                            {hasPhone ? item.isShowContactPhone ? (
                                <div className='schedule-contact-phone-block'>
                                    {_.map(phoneArray, obj => {
                                        return (
                                            <p className="name-and-phone-container" size='small'>
                                                <span className="contact-name">{obj.name || ''}</span>
                                                <PhoneCallout
                                                    phoneNumber={obj.phone}
                                                    type="lead"
                                                    id={item.lead_id}
                                                />
                                            </p>
                                        );
                                    })}
                                    <span className='iconfont icon-close' data-tracename='关闭联系计划'
                                        title={Intl.get('common.app.status.close', '关闭')}
                                        onClick={this.toggleScheduleContact.bind(this, item, false)}/>
                                </div>) : (
                                <Button className='schedule-contact-btn' data-tracename='点击联系线索按钮'
                                    onClick={this.toggleScheduleContact.bind(this, item, true)}
                                    size='small'>{Intl.get('clue.manage.contact.clue', '联系线索')}</Button>)
                                : null}
                            {user_id === item.member_id ?
                                <Button className='schedule-status-btn' onClick={this.handleItemStatus.bind(this, item)}
                                    size='small' data-tracename={item.status === 'false' ? '点击标为已完成' : '点击标为未完成'}>
                                    {item.status === 'false' ? Intl.get('crm.schedule.set.compelete', '标为已完成') : Intl.get('crm.schedule.set.unfinished', '标为未完成')}
                                </Button> : null}
                            <span className='right-handle-buttons'>
                                {/*<DetailEditBtn  onClick={this.editSchedule.bind(this, item)}/>*/}
                                {/*只能删除自己创建的日程*/}
                                {user_id === item.member_id && !this.props.hideDelete && !this.props.isMerge ?
                                    <Popconfirm placement="left"
                                        getPopupContainer={() => document.getElementById(scheduleContentId)}
                                        title={Intl.get('crm.schedule.del.confirm', '确定要删除此联系计划吗？')}
                                        onConfirm = {this.deleteSchedule.bind(this, item.id)}>
                                        <span className='iconfont icon-delete handle-btn-item' data-tracename='点击删除联系计划按钮'/>
                                    </Popconfirm> : null}
                            </span>
                        </div>)}
                </div>
            </div>);

    }
}

ScheduleItem.defaultProps = {
    item: {},//日程项
    hasSplitLine: false,//是否展示分割线
    isMerge: false,//是否是合并面板
    hideDelete: false,//是否隐藏删除按钮
    toggleScheduleContact: function() {
    },
    deleteSchedule: function() {
    },
    handleItemStatus: function() {
    }
};
ScheduleItem.propTypes = {
    item: PropTypes.object,
    hasSplitLine: PropTypes.bool,
    isMerge: PropTypes.bool,
    hideDelete: PropTypes.bool,
    toggleScheduleContact: PropTypes.func,
    deleteSchedule: PropTypes.func,
    handleItemStatus: PropTypes.func
};
export default ScheduleItem;