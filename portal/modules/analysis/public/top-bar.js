/**
 * 顶部栏
 */

import { AntcDatePicker } from 'antc';
import ajax from 'ant-ajax';
import { initialTime } from './consts';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import { Select} from 'antd';
const Option = Select.Option;
const TopNav = require('CMP_DIR/top-nav');
const emitters = require('PUB_DIR/sources/utils/emitters');
const dateSelectorEmitter = emitters.dateSelectorEmitter;
const teamTreeEmitter = emitters.teamTreeEmitter;
import {getMyTeamTreeAndFlattenList} from 'PUB_DIR/sources/utils/common-data-util';
class TopBar extends React.Component {
    static defaultProps = {
        //当前显示页面
        currentPage: {}
    };

    static propTypes = {
        currentPage: PropTypes.object,
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
        };
    }

    componentDidMount() {
        this.getTeamList();
        this.getMemberList();
    }

    getTeamList = () => {
        getMyTeamTreeAndFlattenList(data => {
            if(!data.errorMsg) {
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

        if (type === 'team') {
            teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, '');
        } else {
            teamTreeEmitter.emit(teamTreeEmitter.SELECT_MEMBER, 'all');
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

        this.setState({selectedTeam}, () => {
            teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, teamIdStr);
        });
    };

    onMemberChange = (memberId) => {
        let selectedMember; 
        let memberIdStr;
         
        if (_.last(memberId) === 'all' || _.isEmpty(memberId)) {
            selectedMember = ['all'];
            memberIdStr = 'all';
        } else {
            selectedMember = _.filter(memberId, id => id !== 'all');
            memberIdStr = selectedMember.join(',');
        }

        this.setState({selectedMember}, () => {
            teamTreeEmitter.emit(teamTreeEmitter.SELECT_MEMBER, memberIdStr);
        });
    };

    onSelectDate = (startTime, endTime) => {
        startTime = parseInt(startTime);
        endTime = parseInt(endTime);

        this.setState({startTime, endTime});

        dateSelectorEmitter.emit(dateSelectorEmitter.SELECT_DATE, startTime, endTime);
    }

    render() {
        //日期选择器选项
        let datePickerOption = {
            range: initialTime.range,
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

        const adjustDatePicker = _.get(this.props.currentPage, 'adjustDatePicker');

        //如果当前页存在日期选择器调整函数，则调用该函数对选择器选项进行调整
        if (adjustDatePicker) {
            adjustDatePicker(datePickerOption, this.state.startTime, this.state.endTime);
        }

        return (
            <div className='top-bar'>
                <TopNav>
                    <TopNav.MenuList/>
                    <div className="btn-item">
                        <Select
                            defaultValue="team"
                            onChange={this.onFilterTypeChange}
                        >
                            <Option key="1" value="team">按团队</Option>
                            <Option key="2" value="member">按销售</Option>
                        </Select>

                        {this.state.filterType === 'team' ? (
                            <Select
                                mode="multiple"
                                value={this.state.selectedTeam}
                                onChange={this.onTeamChange}
                                dropdownMatchSelectWidth={false}
                            >
                                {_.map(this.state.teamList, (teamItem, index) => {
                                    return <Option key={index} value={teamItem.group_id}>{teamItem.group_name}</Option>;
                                })}
                            </Select>
                        ) : null}

                        {this.state.filterType === 'member' ? (
                            <Select
                                mode="multiple"
                                value={this.state.selectedMember}
                                onChange={this.onMemberChange}
                                dropdownMatchSelectWidth={false}
                            >
                                {_.map(this.state.memberList, (memberItem, index) => {
                                    return <Option key={index} value={memberItem.user_info.user_id}>{memberItem.user_info.nick_name}</Option>;
                                })}
                            </Select>
                        ) : null}

                        <AntcDatePicker
                            disableDateAfterToday={true}
                            range={datePickerOption.range}
                            start_time={datePickerOption.startTime}
                            end_time={datePickerOption.endTime}
                            onSelect={this.onSelectDate}>
                            {datePickerOption.periodOptions.map((option, index) => (
                                <AntcDatePicker.Option value={option.value} key={index}>{option.name}</AntcDatePicker.Option>
                            ))}
                        </AntcDatePicker>
                    </div>
                </TopNav>
            </div>
        );
    }
}

export default TopBar;
