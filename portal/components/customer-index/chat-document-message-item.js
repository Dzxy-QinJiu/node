/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/16.
 */
import { MESSAGE_TYPES } from './consts';
import { downloadFile } from 'PUB_DIR/sources/utils/common-method-util';
import { customerServiceEmitter } from 'OPLATE_EMITTER';

class ChatDocumentMessageItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isPlaying: false,
            fileUrl: null,
            imageUrl: null,
            imageData: {
                w: '200',
                h: '100'
            }
        };
    }

    componentWillMount() {
        this.getFileUrl();
    }

    isImageMessage() {
        let { message: { message }} = this.props;
        let name = message.name;
        return message.mimeType && (name.endsWith('.jpg') || name.endsWith('.jpeg') ||
            name.endsWith('.JPG') || name.endsWith('.JPEG') ||
            name.endsWith('.png') || name.endsWith('.PNG'));
    }

    isVoiceMessage() {
        return this.props.message.message.ext && this.props.message.message.ext.structName === MESSAGE_TYPES.API_DOCUMENT_EX_VOICE;
    }

    isPhotoMessage() {
        return this.props.message.message.ext && this.props.message.message.ext.structName === MESSAGE_TYPES.API_DOCUMENT_EX_PHOTO;
    }

    recorderSeconds() {
        return Math.max(1, Math.min(Math.round(parseInt(this.props.message.message.ext.duration) / 1000), 60)) + '“';
    }

    //获取文件url
    getFileUrl() {
        let self = this;
        const { message: { message } } = this.props;
        window.antmeProxy.rpc('RPC.messaging.loadFile',
            [message.fileId, message.accessHash], function(result) {
                if(self.isImageMessage()) {
                    self.setState({
                        imageUrl: result.url,
                        imageData: message.thumb
                    });
                }else {
                    self.setState({fileUrl: result.url});
                }
            });
    }

    //下载文件
    downloadFile = () => {
        if (!this.props.message.isActive) {
            downloadFile('start-download', this.state.fileUrl);
        }
    };

    //语音消息播放
    handleAudioClick = () => {
        let isPlaying = this.state.isPlaying;
        let audio = this.refs.recorderAudio;
        if (audio.paused) { // 如果当前是暂停状态
            isPlaying = true;
            audio.play(); // 播放
        } else { // 当前是播放状态
            isPlaying = false;
            audio.pause(); // 暂停
        }
        this.setState({isPlaying});
    };

    //播放完成
    handleAudioEnded = () => {
        this.setState({isPlaying: false});
    };

    //图片放大
    handleFullImage = () => {
        customerServiceEmitter.emit(customerServiceEmitter.FULL_CHAT_MESSAGE_IMAGE, {
            url: this.state.imageUrl
        });
    };

    renderContentBlock() {
        if(this.isVoiceMessage()) {
            return (
                <React.Fragment>
                    <div className="audio-btn" onClick={this.handleAudioClick}>
                        {this.state.isPlaying ? (<i className="material-icons">pause_circle_outline</i>) : (<i className="material-icons">play_circle_outline</i>)}
                        <audio src={this.state.fileUrl} preload="none" onEnded={this.handleAudioEnded} ref="recorderAudio"/>
                    </div>
                    <span className="recorder-label">{this.recorderSeconds()}</span>
                </React.Fragment>
            );
        }else if(this.isImageMessage()) {
            return (
                <img src={this.state.imageUrl} style={{width: _.get(this.state.imageData, 'w', 200), height: _.get(this.state.imageData, 'h', 100)}} onClick={this.handleFullImage}/>
            );
        }else {
            return <a onClick={this.downloadFile}>{this.props.message.message.name}</a>;
        }
    }

    render() {
        return (
            <span className="chat-message-content-item">
                {this.renderContentBlock()}
            </span>
        );
    }
}

ChatDocumentMessageItem.propTypes = {
    message: PropTypes.object
};
export default ChatDocumentMessageItem;