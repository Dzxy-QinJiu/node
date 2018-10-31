/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/26.
 */
import {Input, Icon, Alert} from 'antd';
require('./index.less');
import {getApplyResultDscr} from 'PUB_DIR/sources/utils/common-method-util';
const UserData = require('PUB_DIR/sources/user-data');
class ApplyDetailRemarks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            detailInfo: this.props.detailInfo,
            replyListInfo: this.props.replyListInfo,
            replyFormInfo: this.props.replyFormInfo
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
        let replyList = replyListInfo.list;
        if (_.isArray(replyList) && replyList.length) {
            return (
                <ul>
                    {replyList.map((replyItem, index) => {
                        return (
                            <li key={index} className="apply-info-label">
                                <span className="user-info-label">
                                    {replyItem.nick_name || UserData.getUserData().nick_name}:</span>
                                <span className="user-info-text">
                                    {replyItem.comment ? replyItem.comment : getApplyResultDscr(replyItem)}</span>
                                <span className="user-info-label reply-date-text">{
                                    moment(replyItem.comment_time).format(oplateConsts.DATE_TIME_FORMAT)}</span>
                            </li>);
                    })}
                </ul>);
        } else {
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

    render(){
        let detailInfo = this.state.detailInfo;
        return (
            <div className="apply-detail-reply-list apply-detail-info">
                <div className="reply-icon-block">
                    <span className="iconfont icon-apply-message-tip"/>
                </div>
                <div className="reply-info-block apply-info-block">
                    <div className="reply-list-container apply-info-content">
                        {this.renderReplyList()}
                        {/*已经通过和驳回的申请，不能再添加回复了*/}
                        {detailInfo.status === 'pass' || detailInfo.status === 'reject' ? null :
                            <Input addonAfter={(
                                <a onClick={this.props.addReply}>{Intl.get('user.apply.reply.button', '回复')}</a>)}
                            value={this.state.replyFormInfo.comment}
                            onChange={this.props.commentInputChange}
                            placeholder={Intl.get('user.apply.reply.no.content', '请填写回复内容')}/>}
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
};
ApplyDetailRemarks.propTypes = {
    detailInfo: PropTypes.object,
    replyListInfo: PropTypes.object,
    replyFormInfo: PropTypes.object,
    refreshReplyList: PropTypes.func,
    addReply: PropTypes.func,
    commentInputChange: PropTypes.func,
};

export default ApplyDetailRemarks;