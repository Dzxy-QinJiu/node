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
import {CHANGE_RECORD_TYPE} from 'PUB_DIR/sources/utils/consts';

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

    operateInfo = (operate) => {
        return Intl.get('member.record.member.operate', '{operate}了该成员。',
            {'operate': operate});
    };

    changeInfo = (field, name) => {
        if (name) {
            return Intl.get('member.record.change.field.name', '修改了该成员的{field}，改为{name}。',
                {'field': field, 'name': name});
        } else {
            return Intl.get('member.record.change.field', '修改了该成员的{field}。',
                {'field': field});
        }
    };

    renderTimeLineItem = (item) => {
        let operatePerson = _.get(item, 'operator_aka'); // 谁做了变更
        let operateType = _.get(item, 'operate'); // 变更类型
        let operateDetail = _.get(item, 'detail'); // 具体变更了什么
        let operateTime = _.get(item, 'record_time'); // 具体变的时间

        let role = _.get(operateDetail, 'roles'); // 修改成员角色
        let status = _.get(operateDetail, 'status'); // 修改成员状态
        let logo = _.get(operateDetail, 'user_logo'); // 修改了成员头像
        let nickName = _.get(operateDetail, 'nick_name'); // 修改成员昵称
        let password = _.get(operateDetail, 'password'); // 修改了密码
        let email = _.get(operateDetail, 'email'); // 修改了邮箱
        let phone = _.get(operateDetail, 'phone'); // 修改了手机号
        let qq = _.get(operateDetail, 'qq'); // 修改了qq
        let teamName = _.get(operateDetail, 'team_name'); // 修改了部门
        let positionName = _.get(operateDetail, 'team_role'); // 修改了职务

        if (operateDetail) {
            switch (operateType) {
                case CHANGE_RECORD_TYPE.grantCreate:
                {
                    let operateCreate = Intl.get('common.create', '创建');
                    operatePerson += this.operateInfo(operateCreate);
                    if (role) {
                        operatePerson += Intl.get('user.role.is', '角色为{role}。', { 'role': role });
                    }
                    break;
                }
                case CHANGE_RECORD_TYPE.grantUpdate:
                {
                    let operateStatus = status === '0' ? Intl.get('common.stop', '停用') : Intl.get('common.enabled', '启用');
                    operatePerson += this.operateInfo(operateStatus);
                    if (role) {
                        let field = Intl.get('common.role', '角色');
                        operatePerson += this.changeInfo(field, role);
                    }
                    break;
                }
                case CHANGE_RECORD_TYPE.userInfoUpdate:
                    if (logo) {
                        let field = Intl.get('member.head.logo', '头像');
                        operatePerson += this.changeInfo(field);
                    } else if (nickName) {
                        let field = Intl.get('common.nickname', '昵称');
                        operatePerson += this.changeInfo(field, nickName);
                    } else if (password) {
                        let field = Intl.get('common.password', '密码');
                        operatePerson += this.changeInfo(field);
                    }else if (email) {
                        let field = Intl.get('common.email', '邮箱');
                        operatePerson += this.changeInfo(field, email);
                    } else if (phone) {
                        let field = Intl.get('member.phone', '手机');
                        operatePerson += this.changeInfo(field, phone);
                    } else if (qq) {
                        let field = 'QQ';
                        operatePerson += this.changeInfo(field, qq);
                    }
                    break;
                case CHANGE_RECORD_TYPE.teamChange:
                    if (teamName) {
                        let field = Intl.get('crm.113', '部门');
                        operatePerson += this.changeInfo(field, teamName);
                    }
                    break;
                case CHANGE_RECORD_TYPE.teamRoleChange: // 修改职务的变更信息
                    if (positionName) {
                        let field = Intl.get('member.position', '职务');
                        operatePerson += this.changeInfo(field, positionName);
                    }
                    break;
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