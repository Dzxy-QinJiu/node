/**
 * Created by hzl on 2019/12/28. 升级公告
 */
require('../css/upgrade-notice.less');
import {Alert, message } from 'antd';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
import Spinner from 'CMP_DIR/spinner';
import notificationAjax from '../ajax/notification-ajax';
import LAYOUT from '../utils/layout';
// 没有消息的提醒
import NoMoreDataTip from 'CMP_DIR/no_more_data_tip';
const PAGE_SIZE = 20; // 下拉加载的条数
const DATE_TIME_FORMAT = oplateConsts.DATE_TIME_FORMAT;
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
            application_id: '3722pgujaa35r3u29jh0wJodBg574GAaqb0lun4VCq9',
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

    //是否显示没有更多数据了
    showNoMoreDataTip = () => {
        return !this.state.isLoading &&
            this.state.noticeList.length >= 10 && !this.state.listenScrollBottom;
    };

    renderNoticeType(type) {
        let typeName = Intl.get('notice.upgrade.title', '升级通知');
        if (type === 'maintain-notice') {
            typeName = Intl.get('notice.upgrade.type.notice', '{type}公告', {type: Intl.get('notice.maintain', '维护')});
        } else if (type === 'fault-notice') {
            typeName = Intl.get('notice.upgrade.type.notice', '{type}公告', {type: Intl.get('notice.fault', '故障')});
        } else if (type === 'system-notice') {
            typeName = Intl.get('notice.upgrade.type.notice', '{type}公告', {type: Intl.get('notice.system', '系统')});
        }
        return typeName;
    }


    renderUpGradeNoticeList = () => {
        let noticeList = this.state.noticeList;
        if (this.state.isLoading && this.state.pageNum === 1) {//等待状态
            return <Spinner/>;
        } else if (!_.isEmpty(noticeList)) {//公告列表
            return (<div className="notice-content-wrap">
                <ul className="notice-content-list">
                    <div className="notice-title">
                        {Intl.get('notice.upgrade.title', '升级通知')}
                    </div>
                    {_.map(noticeList, notice => {
                        return (
                            <div className="notices-item">
                                <li key={notice.id} className="wrapper">
                                    <div className="item-content">{notice.content}</div>
                                    <div className="item-pubInfo">
                                        <span className="time">{moment(notice.create_date).format(DATE_TIME_FORMAT)}</span>
                                        <span className="split"> - </span>
                                        <span className="type">{this.renderNoticeType(notice.type)}</span>
                                    </div>
                                </li>
                            </div>
                        );
                    })}
                </ul>
                <NoMoreDataTip
                    fontSize="12"
                    show={this.showNoMoreDataTip}
                    message={Intl.get('common.no.more.data.tips', '没有更多{name}了',{name: Intl.get('notice.upgrade.system', '公告消息')})}
                />
            </div>);
        } else if (this.state.errorMsg) {//错误提示
            return ( <Alert
                message={this.state.errorMsg}
                type="error"
                showIcon={true}
            />);
        } else {//暂无数据
            return (<Alert
                message={Intl.get('common.no.data.tips', '暂无{name}', {name: Intl.get('notice.upgrade.system', '公告消息')})}
                type="info"
                showIcon={true}
            />);
        }
    }

    //下拉加载
    handleScrollBarBottom = () => {
        if (this.state.total > this.state.noticeList.length) {
            this.getUpgradeNoticeList();
        }
    };

    render() {
        let containerHeight = $(window).height() - LAYOUT.SUMMARY_H - 64;
        return (
            <div className="notice-wrap" data-tracename="公告">
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
                        {Intl.get('common.total.data', '共{num}条数据', {num: this.state.total})}
                    </div> : null
                }
            </div>
        );
    }
}

export default UpgradeNotice;