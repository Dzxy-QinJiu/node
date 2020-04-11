/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/26.
 */
import {Input, Icon, Alert} from 'antd';
require('./index.less');
import {getApplyResultDscr,getReportSendApplyStatusTimeLineDesc} from 'PUB_DIR/sources/utils/common-method-util';
import {APPLY_FINISH_STATUS,USERAPPLY_FINISH_STATUS} from 'PUB_DIR/sources/utils/consts';
const UserData = require('PUB_DIR/sources/user-data');
class ApplyDetailRemarks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            detailInfo: this.props.detailInfo,
            replyListInfo: this.props.replyListInfo,
            replyFormInfo: this.props.replyFormInfo,
            keyword: '',//输入的回复内容，之所以在这个组件中再加一个属性，是因为如果Input用replyListInfo.comment,普通输入法没有问题，搜狗五笔输入法总是会出现输入不上去的情况
        };
    }
    componentWillReceiveProps = (nextProps) => {
        this.setState({
            detailInfo: nextProps.detailInfo,
            replyListInfo: nextProps.replyListInfo,
            replyFormInfo: nextProps.replyFormInfo
        });
    };
    //渲染回复列表
    renderReplyList() {
        let replyListInfo = this.state.replyListInfo;
        if (replyListInfo.result === 'loading') {
            return (
                <div className="reply-loading-wrap">
                    <Icon type="loading"/>
                    <span className="reply-loading-text">
                        {Intl.get('user.apply.reply.loading', '正在努力加载回复列表 ......')}
                    </span>
                </div>);
        }
        if (replyListInfo.result === 'error') {
            var message = (
                <span>{replyListInfo.errorMsg}，<Icon type="reload" onClick={this.props.refreshReplyList}
                    title={Intl.get('common.get.again', '重新获取')}/></span>);
            return (<Alert message={message} type="error" showIcon={true}/> );
        }
        //回复列表中去掉点击通过或者驳回按钮增加的回复数据
        let replyList = _.cloneDeep(replyListInfo.list);
        replyList = _.filter(replyList, item => !_.has(item,'status'));
        //按回复时间进行排序
        replyList = _.sortBy(replyList, item => item.comment_time);
        if (_.isArray(replyList) && replyList.length) {
            return (
                <ul>
                    {replyList.map((replyItem, index) => {
                        var des = this.props.isReportOrDocument ? getReportSendApplyStatusTimeLineDesc(replyItem.status) : getApplyResultDscr(replyItem);
                        //加index的判断是因为在列表中确认通过和最后的确认通过完成的状态都是pass，只能靠index为0的来判断哪一条是最后的确认任务完成的
                        if (this.props.isReportOrDocument && !replyItem.comment && index === 0 && _.get(this.state.detailInfo,'status') === 'pass'){
                            des = Intl.get('apply.approver.confirm.task.done','确认任务完成');
                        }
                        return (
                            <li key={index} className="apply-info-label">
                                <span className="user-info-label">
                                    {replyItem.nick_name || UserData.getUserData().nick_name}:</span>
                                <span className="user-info-text">
                                    {replyItem.comment ? replyItem.comment :
                                        des
                                    }</span>
                                <span className="user-info-label reply-date-text">{
                                    moment(replyItem.comment_time).format(oplateConsts.DATE_TIME_FORMAT)}</span>
                            </li>);
                    })}
                </ul>);
        } else if (this.getApplyFinishedStatus()){
            return Intl.get('apply.approve.no.comment','暂无回复内容！');
        }else {
            return null;
        }
    }
    //渲染回复表单loading,success,error
    renderReplyFormResult() {
        var replyFormInfo = this.state.replyFormInfo;
        if (replyFormInfo.result === 'loading') {
            return <Icon type="loading"/>;
        }
        if (replyFormInfo.result === 'error') {
            return <Alert
                message={replyFormInfo.errorMsg}
                type="error"
                showIcon={true}
            />;
        }
        return null;
    }
    getApplyFinishedStatus = () => {
        let detailInfo = this.state.detailInfo;
        return _.includes(APPLY_FINISH_STATUS, detailInfo.status) || _.includes(USERAPPLY_FINISH_STATUS, detailInfo.approval_state);
    };
    //渲染刷新回复列表的提示
    renderRefreshReplyTip = () => {
        return (<span className="refresh-reply-data-tip">
            <ReactIntl.FormattedMessage
                id="user.apply.refresh.reply.tip"
                defaultMessage={'有新回复，点此{refreshTip}'}
                values={{
                    'refreshTip': <a
                        onClick={this.props.refreshReplyList}>{Intl.get('common.refresh', '刷新')}</a>
                }}
            />
        </span>);
    };
    handleInputChange = (e) => {
        var searchContent = e.target.value;

        this.setState({
            keyword: searchContent
        });
        this.props.commentInputChange(e);
    };
    addReply = (e) => {
        this.props.addReply(e,() => {
            this.setState({
                keyword: ''
            });
        });
    };
    render(){
        let detailInfo = this.state.detailInfo;
        return (
            <div className="apply-detail-reply-list apply-detail-info">
                <div className="reply-icon-block">
                    <span className="iconfont icon-apply-message-tip"/>
                </div>
                <div className="reply-info-block apply-info-block">
                    <div className="reply-list-container apply-info-content">
                        {this.props.isUnreadDetail ? this.renderRefreshReplyTip() : null}
                        {this.renderReplyList()}
                        {/*已经通过和驳回还有已撤销的申请，不能再添加回复了*/}
                        {this.getApplyFinishedStatus() ?
                            null :
                            <Input
                                addonAfter={(
                                    <a data-tracename="点击回复按钮" onClick={this.addReply}>{Intl.get('user.apply.reply.button', '回复')}</a>)}
                                value={this.state.keyword}
                                onChange={this.handleInputChange}
                                placeholder={Intl.get('user.apply.reply.no.content', '请填写回复内容')}
                            />}
                        {this.renderReplyFormResult()}
                    </div>
                </div>
            </div>
        );
    }
}
ApplyDetailRemarks.defaultProps = {
    detailInfo: {},
    replyListInfo: {},
    replyFormInfo: {},
    refreshReplyList: function() {

    },
    addReply: function() {

    },
    commentInputChange: function() {

    },
    isReportOrDocument: false,
    isUnreadDetail: false
};
ApplyDetailRemarks.propTypes = {
    detailInfo: PropTypes.object,
    replyListInfo: PropTypes.object,
    replyFormInfo: PropTypes.object,
    refreshReplyList: PropTypes.func,
    addReply: PropTypes.func,
    commentInputChange: PropTypes.func,
    isReportOrDocument: PropTypes.bool,
    isUnreadDetail: PropTypes.bool,
};

export default ApplyDetailRemarks;
