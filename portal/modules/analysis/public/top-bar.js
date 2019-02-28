/**
 * 顶部栏
 */

import {AntcDatePicker} from 'antc';
import ajax from 'ant-ajax';
import {initialTime, isSales} from './consts';
import Store from './store';
import {Select} from 'antd';
import {getMyTeamTreeAndFlattenList} from 'PUB_DIR/sources/utils/common-data-util';
import ButtonZones from 'CMP_DIR/top-nav/button-zones';

const Option = Select.Option;
const emitters = require('PUB_DIR/sources/utils/emitters');
const dateSelectorEmitter = emitters.dateSelectorEmitter;
const teamTreeEmitter = emitters.teamTreeEmitter;

class TopBar extends React.Component {
    static defaultProps = {
        //当前显示页面
        currentPage: {}
    };

    static propTypes = {
        currentPage: PropTypes.object
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
            memberList: [{
                user_info: {
                    nick_name: '全部销售',
                    user_id: 'all',
                }
            }],
            selectedMember: ['all'],
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
            this.setState({
                memberList: this.state.memberList.concat(result),
            });
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
            const selectedMember = this.state.selectedMember;
            const memberIdStr = _.isEqual(selectedMember, ['all']) ? '' : selectedMember.join(',');
            //根据是否选择的是全部成员更新Store中的记录是否选择的是全部团队或成员的标志
            Store.isSelectedAllTeamMember = memberIdStr ? false : true;
            teamTreeEmitter.emit(teamTreeEmitter.SELECT_MEMBER, memberIdStr);
        }
    };

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
        });
    };

    onMemberChange = (memberId) => {
        let selectedMember;
        let memberIdStr;

        if (_.last(memberId) === 'all' || _.isEmpty(memberId)) {
            selectedMember = ['all'];
            memberIdStr = '';
        } else {
            selectedMember = _.filter(memberId, id => id !== 'all');
            memberIdStr = selectedMember.join(',');
        }

        //根据是否选择的是全部成员更新Store中的记录是否选择的是全部团队或成员的标志
        Store.isSelectedAllTeamMember = memberIdStr ? false : true;

        this.setState({selectedMember}, () => {
            teamTreeEmitter.emit(teamTreeEmitter.SELECT_MEMBER, memberIdStr);
        });
    };

    onSelectDate = (startTime, endTime, range) => {
        //选择的不是全部时间时，将时间值转为整数
        //选择全部时间时，开始时间为空，不用处理
        if (startTime) {
            startTime = parseInt(startTime);
        }

        //同上
        if (endTime) {
            endTime = parseInt(endTime);
        }

        this.setState({startTime, endTime, range});

        dateSelectorEmitter.emit(dateSelectorEmitter.SELECT_DATE, startTime, endTime);
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.currentPage !== nextProps.currentPage) {
            this.setState({currentPage: nextProps.currentPage});
        }
    }

    //渲染操作按钮区
    renderButtonZones = () => {
        //日期选择器选项
        let datePickerOption = {
            className: 'btn-item',
            range: this.state.range,
            startTime: this.state.startTime,
            endTime: this.state.endTime,

            periodOptions: [{
                name: Intl.get('user.time.all', '全部时间'),
                value: 'all'
            }, {
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
                {isSales ? null : (
                    <Select
                        defaultValue="team"
                        className='btn-item'
                        onChange={this.onFilterTypeChange}
                    >
                        <Option key="1" value="team">按团队</Option>
                        <Option key="2" value="member">按销售</Option>
                    </Select>
                )}

                {this.state.filterType === 'team' && !isSales ? (
                    <Select
                        className='btn-item'
                        mode="multiple"
                        showSearch
                        optionFilterProp="children"
                        value={this.state.selectedTeam}
                        onChange={this.onTeamChange}
                        dropdownMatchSelectWidth={false}
                    >
                        {_.map(this.state.teamList, (teamItem, index) => {
                            return <Option key={index} value={teamItem.group_id}>{teamItem.group_name}</Option>;
                        })}
                    </Select>
                ) : null}

                {this.state.filterType === 'member' && !isSales ? (
                    <Select
                        className='btn-item'
                        mode="multiple"
                        showSearch
                        optionFilterProp="children"
                        value={this.state.selectedMember}
                        onChange={this.onMemberChange}
                        dropdownMatchSelectWidth={false}
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
