/**
 * Created by hzl on 2019/8/20.
 */
require('../css/member-record.less');
import {AntcTimeLine} from 'antc';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import DetailCard from 'CMP_DIR/detail-card';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import Spinner from 'CMP_DIR/spinner';
import MemberManageAjax from '../ajax';
import {CHANGE_RECORD_TYPE} from 'PUB_DIR/sources/utils/consts';
import { recordChangeTimeLineItem } from 'PUB_DIR/sources/utils/common-method-util';

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
    
    renderMemberRecordList() {
        return (
            <AntcTimeLine
                className="icon-blue"
                data={this.state.recordList}
                groupByDay={true}
                timeField="record_time"
                contentRender={recordChangeTimeLineItem}
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