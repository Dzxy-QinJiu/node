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

class TopBar extends React.Component {
    static defaultProps = {
    };

    static propTypes = {
    };

    constructor(props) {
        super(props);

        this.state = {
            filterType: 'team',
            teamList: [{
                group_name: '全部团队',
                group_id: '',
            }],
            memberList: [{
                user_info: {
                    nick_name: '全部销售',
                    user_id: '',
                }
            }],
        };
    }

    componentDidMount() {
        this.getTeamList();
        this.getMemberList();
    }

    getTeamList = () => {
        const reqData = commonMethodUtil.getParamByPrivilege();

        ajax.send({
            url: '/rest/get/sale/teams/' + reqData.type,
        }).then(result => {
            this.setState({
                teamList: this.state.teamList.concat(result),
            });
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
    };

    onTeamChange = (teamId) => {
        teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, teamId);
    };

    onMemberChange = (memberId) => {
        teamTreeEmitter.emit(teamTreeEmitter.SELECT_MEMBER, memberId);
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
                                defaultValue=""
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
                                defaultValue=""
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
