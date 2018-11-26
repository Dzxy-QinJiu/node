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

    onSelectDate(startTime, endTime) {
        dateSelectorEmitter.emit(dateSelectorEmitter.SELECT_DATE, startTime, endTime);
    }

    render() {
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
                            range={initialTime.range}
                            onSelect={this.onSelectDate}>
                            <AntcDatePicker.Option value="all">{Intl.get('user.time.all', '全部时间')}</AntcDatePicker.Option>
                            <AntcDatePicker.Option value="day">{Intl.get('common.time.unit.day', '天')}</AntcDatePicker.Option>
                            <AntcDatePicker.Option value="week">{Intl.get('common.time.unit.week', '周')}</AntcDatePicker.Option>
                            <AntcDatePicker.Option value="month">{Intl.get('common.time.unit.month', '月')}</AntcDatePicker.Option>
                            <AntcDatePicker.Option value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</AntcDatePicker.Option>
                            <AntcDatePicker.Option value="year">{Intl.get('common.time.unit.year','年')}</AntcDatePicker.Option>
                            <AntcDatePicker.Option value="custom">{Intl.get('user.time.custom', '自定义')}</AntcDatePicker.Option>
                        </AntcDatePicker>
                    </div>
                </TopNav>
            </div>
        );
    }
}

export default TopBar;
