/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/16.
 */
import emotionUtils from 'PUB_DIR/sources/utils/emotion-utils';
import { MESSAGE_TYPES } from './consts';
import { customerServiceEmitter } from 'OPLATE_EMITTER';

//图片最大宽度
const IMAGE_MAX_WIDTH = 300;

class ChatMessageContentItem extends React.Component {

    state = {
        imageUrl: '',
    };

    imageData = null;

    componentWillMount() {
        if (this.props.message.type === MESSAGE_TYPES.IMAGE) {
            this.imageData = this.props.message.attachment.images.array[0];
            this.getImageUrl();
        }
    }

    componentWillUnmount() {
        this.imageData = null;
    }

    getImageUrl() {
        let self = this;
        console.log('获取图片信息');
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

    getWidthAndHeight() {
        let image = _.get(this.imageData,'image', {});
        let width = _.get(image, 'width', 0);
        let height = _.get(image, 'height', 0);

        //超过图片最大宽度需要动态计算图片宽度和高度
        if(width > IMAGE_MAX_WIDTH) {
            //需要缩小的倍数
            let ratio = (width / IMAGE_MAX_WIDTH);
            width = IMAGE_MAX_WIDTH;
            height = (height / ratio).toFixed(2);
        }
        return {
            width,
            height
        };
    }

    //图片放大
    handleFullImage = () => {
        customerServiceEmitter.emit(customerServiceEmitter.FULL_CHAT_MESSAGE_IMAGE, {
            url: this.state.imageUrl
        });
    };

    render() {
        return (
            <span className="chat-message-content-item">
                {this.props.message.type === MESSAGE_TYPES.IMAGE ? (
                    <img src={this.state.imageUrl} style={this.getWidthAndHeight()} onClick={this.handleFullImage}/>
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