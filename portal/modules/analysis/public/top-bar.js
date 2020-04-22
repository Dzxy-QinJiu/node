/**
 * 顶部栏
 */

import {AntcDatePicker} from 'antc';
import ajax from 'ant-ajax';
import {initialTime} from './consts';
import Store from './store';
import {Select} from 'antd';
import {getMyTeamTreeAndFlattenList} from 'PUB_DIR/sources/utils/common-data-util';
import ButtonZones from 'CMP_DIR/top-nav/button-zones';
import {dateSelectorEmitter, teamTreeEmitter, callDeviceTypeEmitter} from 'PUB_DIR/sources/utils/emitters';
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';
const isCommonSales = require('PUB_DIR/sources/user-data').getUserData().isCommonSales;
import {CALL_TYPE_OPTION} from 'PUB_DIR/sources/utils/consts';

const Option = Select.Option;

class TopBar extends React.Component {
    static defaultProps = {
        //当前显示页面
        currentPage: {},
        //是否显示通话设备类型选择器
        isCallDeviceTypeSelectorShow: false
    };

    static propTypes = {
        currentPage: PropTypes.object,
        isCallDeviceTypeSelectorShow: PropTypes.bool
    };

    constructor(props) {
        super(props);

        this.state = {
            filterType: 'team',
            teamList: [{
                group_name: Intl.get('user.list.all.teamlist', '全部团队'),
                group_id: 'all',
            }],
            selectedTeam: 'all',
            memberList: [{
                nick_name: Intl.get('common.memeber.all', '全部成员'),
                user_id: 'all',
            }],
            selectedMember: 'all',
            //开始时间
            startTime: initialTime.start,
            //结束时间
            endTime: initialTime.end,
            //时间区间，日、周、月、年等
            range: initialTime.range,
            currentPage: this.props.currentPage
        };
    }

    componentDidMount() {
        this.getTeamList();
        this.getMemberList();
        teamTreeEmitter.on(teamTreeEmitter.SELECT_TEAM, this.handleTeamChange);
    }

    componentWillUnmount() {
        teamTreeEmitter.removeListener(teamTreeEmitter.SELECT_TEAM, this.handleTeamChange);
    }

    getTeamList = () => {
        getMyTeamTreeAndFlattenList(data => {
            if (!data.errorMsg) {
                this.setState({
                    teamList: this.state.teamList.concat(data.teamList),
                });
            }
        });
    };

    getMemberList = () => {
        ajax.send({
            url: '/rest/base/v1/group/childgroupusers?filter_manager=true',
        }).then(result => {
            const memberList = _.map(result, 'user_info');

            this.setState({
                memberList: this.state.memberList.concat(memberList)
            });
        });
    };

    onFilterTypeChange = (type) => {
        this.setState({
            filterType: type,
            selectedTeam: 'all',
            selectedMember: 'all',
        }, () => {
            Store.teamMemberFilterType = type;
            Store.isSelectedAllTeamMember = true; 

            let eventName;

            if (type === 'team') {
                eventName = teamTreeEmitter.SELECT_TEAM;
            } else {
                eventName = teamTreeEmitter.SELECT_MEMBER;
            }

            teamTreeEmitter.emit(eventName, '');
        });
    };

    //调整团队、成员下拉菜单内容区域的宽度，以解决删除选中项时下拉内容宽度和菜单宽度不对应，导致页面产生横向滚动条的问题
    adjustTeamMemberDropdownWidth() {
        setTimeout(() => {
            const teamMemberSelectWidth = $('.select-team-member-list').width();

            const dropdownWidth = $('.team-member-dropdown').width();

            $('.team-member-dropdown').css({
                width: teamMemberSelectWidth,
                minWidth: teamMemberSelectWidth
            });
        }, 300);
    }

    onTeamChange = (teamId) => {
        if (teamId === 'all' || _.isEmpty(teamId)) {
            teamId = '';
        }

        teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, teamId);
    };

    handleTeamChange = (teamIdStr) => {
        let selectedTeam;

        if (teamIdStr) {
            selectedTeam = teamIdStr;
        } else {
            selectedTeam = 'all';
        }

        //根据是否选择的是全部团队更新Store中的记录是否选择的是全部团队或成员的标志
        Store.isSelectedAllTeamMember = teamIdStr ? false : true; 

        this.setState({selectedTeam}, () => {
            this.adjustTeamMemberDropdownWidth();
        });
    };

    onMemberChange = (memberId) => {
        let selectedMember;

        if (memberId === 'all' || _.isEmpty(memberId)) {
            selectedMember = 'all';
            memberId = '';
        } else {
            selectedMember = memberId;
        }

        this.setState({selectedMember}, () => {
            teamTreeEmitter.emit(teamTreeEmitter.SELECT_MEMBER, memberId);

            this.adjustTeamMemberDropdownWidth();
        });
    };

    onSelectDate = (startTime, endTime, range) => {
        this.setState({startTime, endTime, range});

        let interval;
        const adjustInterval = _.get(this.state.currentPage, 'adjustInterval');

        if (_.isFunction(adjustInterval)) {
            interval = adjustInterval(range);
        } else {
            if (range === 'day' || range === 'week') {
                interval = 'day';
            } else if (range === 'month') {
                interval = 'week';
            } else if (range === 'quarter') {
                interval = 'month';
            } else if (range === 'year') {
                interval = 'quarter';
            } else if (range === 'custom') {
                const endMoment = moment(endTime);

                //如果时间跨度大于一年
                if (endMoment.diff(startTime, 'years') > 1) {
                    interval = 'year';
                //如果时间跨度小于等于一年，大于一个月
                } else if (endMoment.diff(startTime, 'years') <= 1 && endMoment.diff(startTime, 'months') > 1) {
                    interval = 'month';
                //如果时间跨度小于等于一个月，大于一周
                } else if (endMoment.diff(startTime, 'months') <= 1 && endMoment.diff(startTime, 'weeks') > 1) {
                    interval = 'week';
                //如果时间跨度小于等于一周
                } else {
                    interval = 'day';
                }
            }
        }

        dateSelectorEmitter.emit(dateSelectorEmitter.SELECT_DATE, startTime, endTime, interval, range);
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.currentPage !== nextProps.currentPage) {
            this.setState({currentPage: nextProps.currentPage});
        }
    }

    // 通话类型的筛选框
    renderCallTypeSelect = () => {
        return (
            <div className='btn-item'>
                <Select
                    defaultValue={CALL_TYPE_OPTION.ALL}
                    onChange={this.selectCallTypeValue}
                >
                    <Option value={CALL_TYPE_OPTION.ALL}>
                        {Intl.get('user.online.all.type', '全部类型')}
                    </Option>
                    <Option value={CALL_TYPE_OPTION.PHONE}>
                        {Intl.get('call.record.call.center', '呼叫中心')}
                    </Option>
                    <Option value={CALL_TYPE_OPTION.APP}>
                        {Intl.get('common.ketao.app', '客套APP')}
                    </Option>
                </Select>
            </div>
        );
    };

    // 选择通话类型的值
    selectCallTypeValue = (value) => {
        callDeviceTypeEmitter.emit(callDeviceTypeEmitter.CHANGE_CALL_DEVICE_TYPE, value);
    };

    //渲染操作按钮区
    renderButtonZones = () => {
        //日期选择器选项
        let datePickerOption = {
            className: 'btn-item',
            range: this.state.range,
            startTime: this.state.startTime,
            endTime: this.state.endTime,

            periodOptions: [{
                name: Intl.get('common.time.unit.day', '天'),
                value: 'day'
            }, {
                name: Intl.get('common.time.unit.week', '周'),
                value: 'week'
            }, {
                name: Intl.get('common.time.unit.month', '月'),
                value: 'month'
            }, {
                name: Intl.get('common.time.unit.quarter', '季度'),
                value: 'quarter'
            }, {
                name: Intl.get('common.time.unit.year', '年'),
                value: 'year'
            }, {
                name: Intl.get('user.time.custom', '自定义'),
                value: 'custom'
            }]
        };

        const adjustDatePicker = _.get(this.state.currentPage, 'adjustDatePicker');

        //如果当前页存在日期选择器调整函数，则调用该函数对选择器选项进行调整
        if (adjustDatePicker) {
            adjustDatePicker(datePickerOption, this.state.startTime, this.state.endTime);
        }

        return (
            <div className="btn-item-container">
                {this.props.isCallDeviceTypeSelectorShow ? this.renderCallTypeSelect() : null}
                {isCommonSales ? null : (
                    <Select
                        defaultValue="team"
                        className='btn-item'
                        onChange={this.onFilterTypeChange}
                    >
                        <Option key="1" value="team">{Intl.get('common.by.team', '按团队')}</Option>
                        <Option key="2" value="member">{Intl.get('common.by.member', '按成员')}</Option>
                    </Select>
                )}

                {this.state.filterType === 'team' && !isCommonSales ? (
                    <Select
                        className='btn-item select-team-member-list'
                        showSearch
                        optionFilterProp="children"
                        value={this.state.selectedTeam}
                        onChange={this.onTeamChange}
                        dropdownClassName="team-member-dropdown"
                        filterOption={(input, option) => ignoreCase(input, option)}
                    >
                        {_.map(this.state.teamList, (teamItem, index) => {
                            return <Option key={index} value={teamItem.group_id}>{teamItem.group_name}</Option>;
                        })}
                    </Select>
                ) : null}

                {this.state.filterType === 'member' && !isCommonSales ? (
                    <Select
                        className='btn-item select-team-member-list'
                        showSearch
                        optionFilterProp="children"
                        value={this.state.selectedMember}
                        onChange={this.onMemberChange}
                        dropdownClassName="team-member-dropdown"
                        filterOption={(input, option) => ignoreCase(input, option)}
                    >
                        {_.map(this.state.memberList, (memberItem, index) => {
                            return <Option key={index} value={memberItem.user_id}>{memberItem.nick_name}</Option>;
                        })}
                    </Select>
                ) : null}

                <AntcDatePicker
                    className={datePickerOption.className}
                    disableDateAfterToday={true}
                    range={datePickerOption.range}
                    customTimeLimit={{
                        limit: 1,
                        unit: 'years',
                        errMsg: Intl.get('analysis.custom.period.cannot.exceed.1.year', '自定义时间段不能超过1年')
                    }}
                    start_time={datePickerOption.startTime}
                    end_time={datePickerOption.endTime}
                    selectedTimeFormat='int'
                    onSelect={this.onSelectDate}>
                    {datePickerOption.periodOptions.map((option, index) => (
                        <AntcDatePicker.Option value={option.value}
                            key={index}>{option.name}</AntcDatePicker.Option>
                    ))}
                </AntcDatePicker>
            </div>
        );
    };

    render() {
        return (<ButtonZones>{this.renderButtonZones()}</ButtonZones>);
    }
}

export default TopBar;
