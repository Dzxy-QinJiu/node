/**
 * Created by hzl on 2019/8/20.
 */
require('../css/member-record.less');
import {AntcTimeLine} from 'antc';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import DetailCard from 'CMP_DIR/detail-card';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import Spinner from 'CMP_DIR/spinner';
import ShearContent from 'CMP_DIR/shear-content';
import MemberManageAjax from '../ajax';

const pageSize = 200;
const appId = window.Oplate && window.Oplate.clientId || '3722pgujaa35r3u29jh0wJodBg574GAaqb0lun4VCq9';

class MemberRecord extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            memberId: props.memberId, // 成员id
            loading: false, // 获取成员列表的loading
            recordList: [], // 变更记录列表
            errorMsg: '', // 获取成员失败信息
            appId: appId + ',everyapp'
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.memberId !== nextProps.memberId) {
            this.setState({
                memberId: nextProps.memberId,
                loading: false,
                recordList: [],
                errorMsg: '',
            }, () => {
                this.getMemberChangeRecord();
            });
        }
    }

    componentDidMount() {
        this.getMemberChangeRecord();
    }

    getMemberChangeRecord = () => {
        let queryObj = {
            app_id: this.state.appId,
            user_id: this.state.memberId,
            page_size: pageSize
        };
        this.setState({
            loading: true
        });
        MemberManageAjax.getMemberChangeRecord(queryObj).then( (result) => {
            this.setState({
                loading: false,
                recordList: result,
                errorMsg: '',
            });
        }, (errorMsg) => {
            this.setState({
                loading: false,
                errorMsg: errorMsg || Intl.get('member.record.get.record.failed', '获取成员变更失败'),
            });
        });
    };

    renderTimeLineItem = (item) => {
        let operatePerson = _.get(item, 'operator_aka'); // 谁做了变更
        let operateType = _.get(item, 'operate'); // 变更类型
        let operateDetail = _.get(item, 'detail'); // 具体变更了什么
        let operateTime = _.get(item, 'record_time'); // 具体变的时间
        if (operateDetail) {
            if (operateType === 'GrantCreate') { //授权的创建
                operatePerson += Intl.get('member.record.member.operate', '{operate}了该成员。',
                    {operate: Intl.get('common.create', '创建')});
                let role = _.get(operateDetail, 'roles');
                if (role) {
                    operatePerson += Intl.get('user.role.is', '角色为{role}。', { 'role': role });
                }
            } else if (operateType === 'GrantUpdate') {
                let status = _.get(operateDetail, 'status'); // 修改成员状态
                let role = _.get(operateDetail, 'roles'); // 修改成员角色
                if (status) {
                    if (status === '0') {
                        operatePerson += Intl.get('member.record.member.operate', '{operate}了该成员。',
                            {operate: Intl.get('common.stop', '停用')});
                    } else if (status === '1') {
                        operatePerson += Intl.get('member.record.member.operate', '{operate}了该成员。',
                            {operate: Intl.get('common.enabled', '启用')});
                    }
                } else if (role) {
                    operatePerson += Intl.get('member.record.change.field.name', '修改了该成员的{field}，改为{name}。',
                        {field: Intl.get('common.role', '角色'), name: role});
                }
            } else if (operateType === 'UserInfoUpdate') { //修改基本信息的变更信息
                let logo = _.get(operateDetail, 'user_logo'); // 修改了成员头像
                let nickName = _.get(operateDetail, 'nick_name'); // 修改成员昵称
                let password = _.get(operateDetail, 'password'); // 修改了密码
                let email = _.get(operateDetail, 'email'); // 修改了邮箱
                let phone = _.get(operateDetail, 'phone'); // 修改了手机号
                let qq = _.get(operateDetail, 'qq'); // 修改了qq
                if (logo) {
                    operatePerson += Intl.get('member.record.change.field', '修改了该成员的{field}。',
                        {field: Intl.get('member.head.logo', '头像')});
                } else if (nickName) {
                    operatePerson += Intl.get('member.record.change.field.name', '修改了该成员的{field}，改为{name}。',
                        {field: Intl.get('common.nickname', '昵称'), name: nickName});
                } else if (password) {
                    operatePerson += Intl.get('member.record.change.field', '修改了该成员的{field}',
                        {field: Intl.get('common.password', '密码')});
                }else if (email) {
                    operatePerson += Intl.get('member.record.change.field.name', '修改了该成员的{field}，改为{name}。',
                        {field: Intl.get('common.email', '邮箱'), name: email});
                } else if (phone) {
                    operatePerson += Intl.get('member.record.change.field.name', '修改了该成员的{field}，改为{name}。',
                        {field: Intl.get('member.phone', '手机'), name: phone});
                } else if (qq) {
                    operatePerson += Intl.get('member.record.change.field.name', '修改了该成员的{field}，改为{name}。',
                        {field: 'QQ', name: qq});
                }
            } else if (operateType === 'teamChange') { // 修改部门的变更信息
                // 修改了部门
                let teamName = _.get(operateDetail, 'team_name');
                if (teamName) {
                    operatePerson += Intl.get('member.record.change.field.name', '修改了该成员的{field}，改为{name}。',
                        {field: Intl.get('crm.113', '部门'), name: teamName});
                }
            } else if (operateType === 'teamRoleChange') { // 修改职务的变更信息
                // 修改了职务
                let positionName = _.get(operateDetail, 'team_role');
                if (positionName) {
                    operatePerson += Intl.get('member.record.change.field.name', '修改了该成员的{field}，改为{name}。',
                        {field: Intl.get('member.position', '职务'), name: positionName});
                }
            }
        }
        return (
            <dl>
                <dd>
                    <ShearContent>
                        {operatePerson}
                    </ShearContent>
                </dd>
                <dt>{moment(operateTime).format(oplateConsts.TIME_FORMAT)}</dt>
            </dl>
        );
    };

    renderMemberRecordList() {
        return (
            <AntcTimeLine
                className="icon-blue"
                data={this.state.recordList}
                groupByDay={true}
                timeField="record_time"
                contentRender={this.renderTimeLineItem}
                dot={<span className="iconfont icon-change"></span>}
            />
        );
    }

    render() {
        const height = this.props.getContainerHeight();
        return (
            <div
                className="member-record-container"
                style={{height: height}}
            >
                <GeminiScrollbar>
                    {
                        this.state.loading ?
                            <Spinner/> : _.get(this.state, 'recordList[0]') ?
                                (
                                    <div>
                                        <DetailCard
                                            content={this.renderMemberRecordList()}
                                        />
                                    </div>
                                ) : (<NoDataIconTip tipContent={Intl.get('member.record.no.record', '暂无变更记录')}/>)}
                </GeminiScrollbar>
            </div>);
    }
}

MemberRecord.propTypes = {
    memberId: PropTypes.string,
    getContainerHeight: PropTypes.func
};

export default MemberRecord;