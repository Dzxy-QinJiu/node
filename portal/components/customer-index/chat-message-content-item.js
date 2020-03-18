/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/16.
 */
import emotionUtils from 'PUB_DIR/sources/utils/emotion-utils';
import { MESSAGE_TYPES } from './consts';

class ChatMessageContentItem extends React.Component {

    state = {
        imageUrl: '',
    };

    imageData = null;

    componentWillMount() {
        if (this.message.type === MESSAGE_TYPES.IMAGE) {
            this.imageData = this.props.message.attachment.images.array[0];
            this.getImageUrl();
        }
    }

    componentWillUnmount() {
        this.imageData = null;
    }

    getImageUrl() {
        let self = this;
        window.antmeProxy.rpc('RPC.messaging.loadFile',
            [self.imageData.image.fileLocation.fileId, self.imageData.image.fileLocation.accessHash],
            function(result) {
                self.setState({imageUrl: result.url});
            });
    }

    getText() {
        if (this.props.message.type === MESSAGE_TYPES.EMOJI) {
            return emotionUtils.replaceUnifiedWithSvg(':' + this.props.message.data + ':');
        } else {
            return this.props.message.data.replace(/\n/g, '<br/>');
        }
    }

    render() {
        return (
            <span className="chat-message-content-item">
                {this.props.message.type === MESSAGE_TYPES.IMAGE ? (
                    <img src={this.state.imageUrl} style={{width: this.imageData.width, height: this.imageData.height}}/>
                ) : (
                    <span dangerouslySetInnerHTML={{__html: this.getText()}}/>
                )}
            </span>
        );
    }
}

ChatMessageContentItem.propTypes = {
    message: PropTypes.object
};
export default ChatMessageContentItem;