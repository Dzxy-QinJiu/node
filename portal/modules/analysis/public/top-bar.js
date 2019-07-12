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
                group_name: '全部团队',
                group_id: 'all',
            }],
            selectedTeam: ['all'],
            memberList: [],
            selectedMember: [],
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
            let newState = {
                memberList: result
            };

            if (_.isEmpty(this.state.selectedMember)) {
                const firstMemberId = _.get(_.first(result), 'user_info.user_id');
                newState.selectedMember = [firstMemberId];
            }

            this.setState(newState);
        });
    };

    onFilterTypeChange = (type) => {
        this.setState({filterType: type});
        Store.teamMemberFilterType = type;

        if (type === 'team') {
            const selectedTeam = this.state.selectedTeam;
            const teamIdStr = _.isEqual(selectedTeam, ['all']) ? '' : selectedTeam.join(',');
            //根据是否选择的是全部团队更新Store中的记录是否选择的是全部团队或成员的标志
            Store.isSelectedAllTeamMember = teamIdStr ? false : true; 
            teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, teamIdStr);
        } else {
            Store.isSelectedAllTeamMember = false;
            const selectedMember = this.state.selectedMember;
            const memberIdStr = selectedMember.join(',');
            teamTreeEmitter.emit(teamTreeEmitter.SELECT_MEMBER, memberIdStr);
        }
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
        let selectedTeam;
        let teamIdStr;

        if (_.last(teamId) === 'all' || _.isEmpty(teamId)) {
            selectedTeam = ['all'];
            teamIdStr = '';
        } else {
            selectedTeam = _.filter(teamId, id => id !== 'all');
            teamIdStr = selectedTeam.join(',');
        }

        //根据是否选择的是全部团队更新Store中的记录是否选择的是全部团队或成员的标志
        Store.isSelectedAllTeamMember = teamIdStr ? false : true; 

        this.setState({selectedTeam}, () => {
            teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, teamIdStr);

            this.adjustTeamMemberDropdownWidth();
        });
    };

    onMemberChange = (memberId) => {
        let selectedMember;
        let memberIdStr;

        //清空所有选中的成员时，默认选中第一个
        if (_.isEmpty(memberId)) {
            const firstMemberId = _.get(_.first(this.state.memberList), 'user_info.user_id');
            selectedMember = [firstMemberId];
            memberIdStr = firstMemberId;
        } else {
            selectedMember = memberId;
            memberIdStr = memberId.join(',');
        }

        this.setState({selectedMember}, () => {
            teamTreeEmitter.emit(teamTreeEmitter.SELECT_MEMBER, memberIdStr);

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
                        mode="multiple"
                        showSearch
                        optionFilterProp="children"
                        value={this.state.selectedTeam}
                        onChange={this.onTeamChange}
                        dropdownClassName="team-member-dropdown"
                    >
                        {_.map(this.state.teamList, (teamItem, index) => {
                            return <Option key={index} value={teamItem.group_id}>{teamItem.group_name}</Option>;
                        })}
                    </Select>
                ) : null}

                {this.state.filterType === 'member' && !isCommonSales ? (
                    <Select
                        className='btn-item select-team-member-list'
                        mode="multiple"
                        showSearch
                        optionFilterProp="children"
                        value={this.state.selectedMember}
                        onChange={this.onMemberChange}
                        dropdownClassName="team-member-dropdown"
                    >
                        {_.map(this.state.memberList, (memberItem, index) => {
                            return <Option key={index}
                                value={memberItem.user_info.user_id}>{memberItem.user_info.nick_name}</Option>;
                        })}
                    </Select>
                ) : null}

                <AntcDatePicker
                    className={datePickerOption.className}
                    disableDateAfterToday={true}
                    range={datePickerOption.range}
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
