/**
 * Created by hzl on 2019/12/28. 升级公告
 */
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
import Spinner from 'CMP_DIR/spinner';
import notificationAjax from '../ajax/notification-ajax';
const PAGE_SIZE = 20; // 下拉加载的条数
class UpgradeNotice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageNum: 1, // 页数
            listenScrollBottom: false, // 下拉加载
            isLoading: false, // 是否加载中，默认false
            errorMsg: '', // 加载错误
            noticeList: [], // 公告列表
            total: 0, // 公告条数
        };
    }

    componentDidMount() {
        this.getUpgradeNoticeList();
        $('body').css('overflow', 'hidden');
    }

    componentWillUnmount() {
        $('body').css('overflow', 'hidden');
    }

    getUpgradeNoticeList = () => {
        let queryObj = {
            page_size: PAGE_SIZE,
            page_num: this.state.pageNum
        };
        this.setState({isLoading: true});
        notificationAjax.getUpgradeNoticeList(queryObj).then(result => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            let stateData = this.state;
            stateData.isLoading = false;
            stateData.errorMsg = '';
            if (result && _.isArray(result.list)) {
                if (stateData.lastSystemNoticeId) {
                    //下拉加载时
                    stateData.noticeList = this.state.noticeList.concat(result.list);
                } else {
                    //首次获取数据时
                    stateData.noticeList = result.list;
                }
                stateData.total = result.total || stateData.noticeList.length;
                stateData.pageNum += 1;
            }
            //如果当前已获取的数据还不到总数，继续监听下拉加载，否则不监听下拉加载
            stateData.listenScrollBottom = stateData.total > stateData.noticeList.length;
            this.setState(stateData);
        }, errorMsg => {
            this.setState({
                isLoading: false,
                errorMsg: errorMsg
            });
        });
    };

    renderUpGradeNoticeList = () => {
        return (
            <div className="notice-content-wrap">
                <div className="notice-title">
                    升级通知
                </div>
                <div className="notice-content">

                </div>
                <div className="notice-footer">

                </div>
            </div>
        );
    }

    //下拉加载
    handleScrollBarBottom = () => {
        if (this.state.total > this.state.noticeList.length) {
            this.getUpgradeNoticeList();
        }
    };

    render() {
        let containerHeight = $(window).height() - 64;
        return (
            <div className="upgrade-notice" data-tracename="公告">
                <div style={{height: containerHeight}}>
                    <GeminiScrollbar
                        handleScrollBottom={this.handleScrollBarBottom}
                        listenScrollBottom={this.state.listenScrollBottom}
                        itemCssSelector=".system_message_list>li"
                    >
                        {this.renderUpGradeNoticeList()}
                    </GeminiScrollbar>
                </div>
                {this.state.total ?
                    <div className="summary_info">
                        {Intl.get('notification.total.system.notice', '共{x}条系统消息', {x: this.state.total})}
                    </div> : null
                }
            </div>
        );
    }
}

export default UpgradeNotice;