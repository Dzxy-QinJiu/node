/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/16.
 */
import ChatDocumentMessageItem from './chat-document-message-item';
import ChatMessageContentItem from './chat-message-content-item';
import classNames from 'classnames';
import userData from 'PUB_DIR/sources/user-data';
import { transTimeFormat } from 'PUB_DIR/sources/utils/time-format-util';
import { MESSAGE_TYPES } from './consts';

class ChatMessageItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messageContentList: []
        };
    }

    componentWillMount() {
        if(this.isTextMessage()) {
            this.formatTextMessage();
        }
    }

    //是否是自己
    isSelf() {
        return this.props.userId === this.props.message.senderUid;
    }

    //是否是文档类型消息
    isDocumentMessage() {
        return this.props.message.message.structName === MESSAGE_TYPES.API_DOCUMENT_MESSAGE;
    }

    //是否是文本类型消息
    isTextMessage() {
        return this.props.message.message.structName === MESSAGE_TYPES.API_TEXT_MESSAGE;
    }

    formatTextMessage() {
        let { message: { message } } = this.props;
        let text = message.text;
        let messageContentList = [];
        if (message.ext && message.ext.structName === MESSAGE_TYPES.API_REPLACED_ATTACHMENTS) {
            let arr = message.ext.atts.array;
            let replacedAttachmentList = _.orderBy(arr, ['index'], ['asc']);
            let startIndex = 0;
            replacedAttachmentList.forEach(replacedAttachment => {
                let index = replacedAttachment.index;
                if (index === 0) {
                    messageContentList.push({
                        data: replacedAttachment.id,
                        type: replacedAttachment.rType.name,
                        attachment: replacedAttachment.attachment
                    });
                } else {
                    messageContentList.push({
                        data: text.substring(startIndex, index),
                        type: MESSAGE_TYPES.TEXT
                    });
                    messageContentList.push({
                        data: replacedAttachment.id,
                        type: replacedAttachment.rType.name,
                        attachment: replacedAttachment.attachment
                    });
                }
                startIndex = index + 1;
            });
            if (startIndex <= text.length) {
                messageContentList.push({
                    data: text.substring(startIndex),
                    type: MESSAGE_TYPES.TEXT
                });
            }
        } else {
            messageContentList.push({
                data: text,
                type: MESSAGE_TYPES.TEXT
            });
        }
        this.setState({ messageContentList });
    }

    renderContentBlock() {
        if(this.isDocumentMessage()) {//是否是文档类型
            return <ChatDocumentMessageItem message={this.props.message}/>;
        }else if(this.isTextMessage()) {//是否是文本类型
            return this.state.messageContentList.map((item, index) => (
                <ChatMessageContentItem key={index + Date.now()} message={item}/>
            ));
        }
        return null;
    }

    render() {
        let cls = classNames('chat-message-item', {
            'self': this.isSelf()
        });
        const userInfo = userData.getUserData();
        return (
            <div className={cls}>
                <div className="chat-message-head">
                    {this.isSelf() && userInfo.user_logo ? (
                        <img className="sender-image-img" src={userInfo.user_logo}/>
                    ) : (<div className="sender-image-img default"/>)}
                </div>
                <div className="chat-message-content">
                    <div className="user-info">
                        <div className="user-name">{this.isSelf() ? userInfo.nick_name : Intl.get('common.customer.service', '在线客服')}</div>
                        <div className="send-time">{transTimeFormat(this.props.message.date)}</div>
                    </div>
                    <div className="message-content">
                        <div className="content-wrap">
                            {this.renderContentBlock()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ChatMessageItem.propTypes = {
    message: PropTypes.object,
    userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};
export default ChatMessageItem;