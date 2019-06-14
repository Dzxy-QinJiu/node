/**
 * 个人操作日志
 */
require('../css/member-log.less');
import {AntcTimeLine} from 'antc';
import MemberInfoStore from '../store/member-info-store';
import MemberInfoAction from '../action/member-info-action';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import NoMoreDataTip from 'CMP_DIR/no_more_data_tip';
import DetailCard from 'CMP_DIR/detail-card';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import Spinner from 'CMP_DIR/spinner';

class MemberLog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: this.props.userName,
            ...MemberInfoStore.getState()
        };
    }

    onChange = () => {
        this.setState({
            ...MemberInfoStore.getState()
        });
    };

    componentWillReceiveProps(nextProps) {
        if (this.state.userName !== nextProps.userName) {
            this.setState({userName: nextProps.userName});
            MemberInfoAction.setLogLoading(true);
            this.getMemberLogList();
        }
    }

    componentWillUnmount() {
        MemberInfoStore.unlisten(this.onChange);
    }

    componentDidMount() {
        MemberInfoStore.listen(this.onChange);
        MemberInfoAction.setLogLoading(true);
        this.getMemberLogList();
    }

    getMemberLogList() {
        setTimeout(() => {
            MemberInfoAction.getLogList({
                user_name: this.state.userName,
                num: this.state.logNum,
                page_size: this.state.page_size
            });
        });
    }

    renderTimeLineItem = (item) => {
        let logTime = item.logTime;
        logTime = (logTime && logTime !== 'null') ? moment(parseInt(logTime)).format(oplateConsts.HOUR_MUNITE_FORMAT) : '';
        return (
            <div className="log-item">
                <div className="log-info">{item.logInfo}</div>
                <div className="log-time">{logTime}</div>
            </div>
        );

    }

    //是否显示没有更多数据了
    showNoMoreDataTip = () => {
        return !this.state.logIsLoading &&
            this.state.logList.length >= this.state.page_size && !this.state.listenScrollBottom;
    };
    // 下拉加载日志列表信息
    handleScrollBarBottom = () => {
        this.getMemberLogList();
    };

    renderLogList() {
        return (
            <AntcTimeLine
                className="icon-blue"
                data={this.state.logList}
                groupByDay={true}
                timeField="logTime"
                contentRender={this.renderTimeLineItem}
                dot={<span className="iconfont icon-foot"/>}
            />
        );
    }

    render() {
        return (
            <div className="member-log-list-continer" style={{height: this.props.getContainerHeight()}}>
                <GeminiScrollbar
                    handleScrollBottom={this.handleScrollBarBottom}
                    listenScrollBottom={this.state.listenScrollBottom}
                    itemCssSelector=".member-log-list-continer"
                >
                    {this.state.logIsLoading ? (<Spinner/>) : _.get(this.state, 'logList[0]') ? (
                        <div>
                            <DetailCard
                                content={this.renderLogList()}
                            />
                            <NoMoreDataTip
                                fontSize="12"
                                show={this.showNoMoreDataTip}
                                message={Intl.get('common.no.more.user.log', '没有更多日志了')}
                            />
                        </div>
                    ) : (<NoDataIconTip tipContent={Intl.get('member.log.no.data', '暂无操作日志')}/>)}
                </GeminiScrollbar>
            </div>);
    }
}
MemberLog.propTypes = {
    userName: PropTypes.string,
    getContainerHeight: PropTypes.func
};
export default MemberLog;