/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/9/17.
 */


import {Input, Icon, Alert} from 'antd';
require('./index.less');
import {getApplyResultDscr, getReportSendApplyStatusTimeLineDesc} from 'PUB_DIR/sources/utils/common-method-util';
import {APPLY_FINISH_STATUS} from 'PUB_DIR/sources/utils/consts';
const UserData = require('PUB_DIR/sources/user-data');
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
var classNames = require('classnames');
class ApplyDetailRemarks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openReplyListApplyIds: this.getInitialApplyId(this.props),
            sameHistoryApplyLists: this.props.sameHistoryApplyLists,
        };
    }
    getInitialApplyId = (Props) => {
        var openReplyListApplyIds = [];
        if (_.get(Props, 'sameHistoryApplyLists.list[0].id')) {
            openReplyListApplyIds.push(_.get(Props, 'sameHistoryApplyLists.list[0].id'));
        }
        return openReplyListApplyIds;
    }

    componentWillReceiveProps = (nextProps) => {
        if (!_.get(nextProps,'sameHistoryApplyLists.result')) {
            this.setState({
                sameHistoryApplyLists: nextProps.sameHistoryApplyLists,
                openReplyListApplyIds: this.getInitialApplyId(nextProps),
            });
        }
    };

    renderReplyLists(replyList) {
        return (
            <div className="reply-container">
                {replyList.map((replyItem, index) => {
                    return (
                        <p key={index} className="reply-content">
                            <span className="reply-content-name">
                                {replyItem.nick_name || UserData.getUserData().nick_name}：</span>
                            <span className="reply-content-message">
                                {_.get(replyItem,'message')}
                            </span>
                            <span className="reply-content-time">{
                                replyItem.comment_time ? moment(replyItem.comment_time).format(oplateConsts.DATE_FORMAT) : ''}</span>
                        </p>);
                })}
            </div>);
    }

    handleToggle = (flag, replyId) => {
        var openReplyListApplyIds = this.state.openReplyListApplyIds;
        if (flag) {
            openReplyListApplyIds = _.filter(openReplyListApplyIds, item => item !== replyId);
        } else {
            openReplyListApplyIds.push(replyId);
            openReplyListApplyIds = _.uniq(openReplyListApplyIds);
        }
        this.setState({openReplyListApplyIds});
    };

    renderToggleReply(replyItem) {
        var flag = _.some(this.state.openReplyListApplyIds, item => item === replyItem.id);
        return (
            <span onClick={this.handleToggle.bind(this, flag, replyItem.id)} className="reply-btns">
                {flag ? Intl.get('user.apply.hide.reply', '收起回复') : Intl.get('user.apply.click.reply', '查看回复')}
            </span>
        );
    }
    handleOpenApplyDetail(applyItem){

    }
    //渲染历史申请列表
    renderHistoricalList() {
        let sameHistoryApplyLists = this.state.sameHistoryApplyLists;
        if (sameHistoryApplyLists.result === 'loading') {
            return (
                <div className="reply-loading-wrap">
                    <Icon type="loading"/>
                    <span className="reply-loading-text">
                        {Intl.get('user.apply.loading.historical.lists', '正在努力加载历史申请列表 ......')}
                    </span>
                </div>);
        }
        if (sameHistoryApplyLists.result === 'error') {
            var message = (
                <span>{sameHistoryApplyLists.errorMsg}，<Icon type="reload" onClick={this.props.refreshReplyList}
                    title={Intl.get('common.get.again', '重新获取')}/></span>);
            return (<Alert message={message} type="error" showIcon={true}/> );
        }
        //历史申请列表中去掉点击通过或者驳回按钮增加的回复数据
        let replyList = _.cloneDeep(sameHistoryApplyLists.list);
        if (_.isArray(replyList) && replyList.length) {

            return (
                <ul>
                    {replyList.map((replyItem, index) => {
                        var showReplyLists = _.some(this.state.openReplyListApplyIds, item => item === replyItem.id);
                        var replyLists = _.get(replyItem, 'replyLists', []);
                        var btnClass = classNames('clue-status',{
                            processed: replyItem.isConsumed === 'true'
                        });
                        return (
                            <li key={index} className="apply-info-label">
                                <p className="apply-item-title" onClick={this.props.handleOpenApplyDetail.bind(this,replyItem)}>
                                    <span className="apply-item-topic user-info-label">
                                        {replyItem.topic}
                                        <span className="apply-item-status">
                                            <span className={btnClass}>[{commonMethodUtil.getApplyStateText(replyItem)}]</span>&gt;
                                        </span>
                                    </span>

                                    <span className="user-info-text">
                                        {!_.get(replyLists, '[0]') ? Intl.get('user.apply.no.rely.list', '无回复') : this.renderToggleReply(replyItem)}
                                    </span>
                                    <span className="reply-date-text">
                                        {_.get(replyItem, 'presenter')}
                                        <span
                                            className="apply-applicate">{Intl.get('user.apply.applicate.time', '申请于')}</span>
                                        {replyItem.time ? moment(replyItem.time).format(oplateConsts.DATE_FORMAT) : ''}</span>
                                </p>
                                {showReplyLists ? this.renderReplyLists(replyLists) : null}
                            </li>);
                    })}
                </ul>);
        } else {
            return Intl.get('apply.approve.no.comment', '暂无回复内容！');
        }
    }

    render() {
        return (
            <div className="apply-history-list apply-detail-info">
                <div className="reply-icon-block">
                    <span className="iconfont icon-histroy"/>
                </div>
                <div className="reply-info-block apply-info-block">
                    <div className="reply-list-container apply-info-content">
                        <div className="history-apply-title">{Intl.get('user.apply.history.apply.lists', '申请历史')}:</div>
                        {this.renderHistoricalList()}
                    </div>
                </div>
            </div>
        );
    }
}
ApplyDetailRemarks.defaultProps = {
    sameHistoryApplyLists: {},
    handleOpenApplyDetail: function(){},

    replyFormInfo: {},
    refreshReplyList: function() {

    },
    commentInputChange: function() {

    },
    isReportOrDocument: false,
};
ApplyDetailRemarks.propTypes = {
    sameHistoryApplyLists: PropTypes.object,
    handleOpenApplyDetail: PropTypes.func,

    replyFormInfo: PropTypes.object,
    refreshReplyList: PropTypes.func,
    commentInputChange: PropTypes.func,
    isReportOrDocument: PropTypes.bool,
};

export default ApplyDetailRemarks;