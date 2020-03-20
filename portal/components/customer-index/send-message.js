/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/17.
 */
import './css/send-message.less';
import { Button } from 'antd';
import EmotionBase from './emotion/emotion-base';
import emotionUtils from 'PUB_DIR/sources/utils/emotion-utils';
import { customerServiceEmitter } from 'OPLATE_EMITTER';

//键盘按键
var KeyCode = {
    ENTER: 13
};

class SendMessage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isFocus: false,
            loading: false,
            isShowEmotion: false,
        };
    }

    imageData = {};

    componentDidMount() {
        customerServiceEmitter.on(customerServiceEmitter.CLICK_EMOTION_IMAGE, this.emotionClick);
    }

    componentWillUnmount() {
        this.imageData = {};
        customerServiceEmitter.removeListener(customerServiceEmitter.CLICK_EMOTION_IMAGE, this.emotionClick);
    }

    getNums = () => {
        return emotionUtils.getEmotionType().length;
    };

    getEmotionArray = () => {
        return emotionUtils.getEmotionList();
    };

    getEmotionTypes = () => {
        return emotionUtils.getEmotionType();
    };

    emotionClick = (emotion) => {
        this.setState({isShowEmotion: false});
        if (emotion.length) {
            let emotionImg = emotionUtils.replaceUnifiedWithImg(emotion);
            this.insertMessage(emotionImg);
        }
    };

    triggerFocus = (type) => {
        this.setState({isFocus: type});
    };

    showEmotion = () => {
        this.setState({isShowEmotion: !this.state.isShowEmotion});
    };

    handleClose = () => {
        this.setState({isShowEmotion: false});
    };

    //发送消息
    send = () => {
        if (this.state.loading) {
            return false;
        }
        this.setState({loading: true});
        let childNodes = this.refs.editDiv.childNodes;
        let self = this;
        let nodeText = '';
        let mentions = [];
        let replacedAttachments = [];
        [].slice.call(childNodes).forEach(function(node) {
            // 起始位置
            let startIndex = nodeText.length;
            if (node.nodeType === 3) { // 文字消息
                let text = node.textContent;
                nodeText = nodeText + text;
            } else if (node.nodeType === 1 && node.nodeName === 'IMG') {
                if (node.className === 'emotion-item') { // 表情图片
                    let shortName = node.attributes['name'].value;
                    replacedAttachments.push({
                        index: startIndex,
                        id: shortName,
                        rType: 1
                    });
                    nodeText = nodeText + ' ';
                } else { // 上传图片
                    let fileId = node.attributes['fileId'].value;
                    if (self.imageData[fileId]) {
                        replacedAttachments.push({
                            index: startIndex,
                            id: fileId,
                            rType: 3,
                            attachment: self.imageData[fileId]
                        });
                        nodeText = nodeText + ' ';
                    } else {
                        nodeText = nodeText + ':' + fileId + ':';
                    }
                }
            } else if (node.nodeType === 1 && node.nodeName === 'SPAN') {
                if (node.className === 'atMeSpan') {
                    let userId = node.attributes['userId'].value;
                    mentions.push(userId);
                    replacedAttachments.push({
                        index: startIndex,
                        id: userId,
                        rType: 2
                    });
                    nodeText = nodeText + ' ';
                } else {
                    let text = node.textContent;
                    nodeText = nodeText + text;
                }
            } else if (node.nodeType === 1 && node.nodeName === 'BR') {
                nodeText = nodeText + '\n';
            }
        });
        this.refs.editDiv.innerHTML = '';
        if (nodeText.trim().length === 0 && mentions.length === 0 && replacedAttachments.length === 0) {
            this.setState({
                loading: false
            });
            return;
        }

        window.antmeProxy.rpc('RPC.messaging.sendMessage',
            [[], window.Oplate.antmeClientId, nodeText, mentions, replacedAttachments], function(data) {
                self.imageData = {};
                self.setState({
                    loading: false
                });
            });
    };

    messageEnter = (event) => {
        if(event.keyCode === KeyCode.ENTER) {
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false; // 取消此事件的默认操作
            }
            event.stopPropagation();
            if (document.selection) { // IE
                let range = document.selection.createRange();
                range.pasteHTML('<br/><br/>');
            } else { // other
                document.execCommand('InsertHtml', false, '<br/><br/>');
            }
        }
    };

    preventDefault = (event) => {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false; // 取消此事件的默认操作
        }
    };

    insertMessage = (str) => {
        if (!this.state.isFocus) {
            this.refs.editDiv.focus();
            if (document.selection) {
                let range = document.selection.createRange();
                range.moveToElementText(this.refs.editDiv);
                range.select();
                document.selection.empty(); // 取消选中
            } else {
                let range = document.createRange();
                range.selectNodeContents(this.refs.editDiv);
                range.collapse(false);
                let sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
        this.refs.editDiv.focus();
        let selection = window.getSelection ? window.getSelection() : document.selection;

        let range = selection.createRange ? selection.createRange() : selection.getRangeAt(0);

        if (!window.getSelection) {
            this.refs.editDiv.focus();

            selection = window.getSelection ? window.getSelection() : document.selection;

            range = selection.createRange ? selection.createRange() : selection.getRangeAt(0);

            range.pasteHTML(str);

            range.collapse(false);

            range.select();
        } else {
            this.refs.editDiv.focus();

            range.collapse(false);

            let hasR = range.createContextualFragment(str);

            let hasRLastChild = hasR.lastChild;

            while (hasRLastChild && hasRLastChild.nodeName.toLowerCase() === 'br' && hasRLastChild.previousSibling && hasRLastChild.previousSibling.nodeName.toLowerCase() === 'br') {
                let e = hasRLastChild;

                hasRLastChild = hasRLastChild.previousSibling;

                hasR.removeChild(e);
            }

            range.insertNode(hasR);
            if (hasRLastChild) {
                range.setEndAfter(hasRLastChild);
                range.setStartAfter(hasRLastChild);
            }

            selection.removeAllRanges();

            selection.addRange(range);
        }
    };

    //粘贴事件处理
    messagePaste = (e) => {
        e.preventDefault();
        let self = this;
        if (!this.props.initAntme) {
            return false;
        }
        if (e && e.clipboardData && e.clipboardData.items) {
            let copiedData = e.clipboardData.items[0];
            if (copiedData && copiedData.type.indexOf('image') === 0) {
                let image = copiedData.getAsFile();
                let reader = new FileReader();
                reader.onload = function() {
                    let rd = new FileReader();
                    rd.onload = function(e) {
                        let data = e.target.result;
                        // 加载图片获取图片真实宽度和高度
                        let newImage = new Image();
                        newImage.onload = function() {
                            image.width = newImage.width;
                            image.height = newImage.height;
                            let fileId = Math.random();
                            self.insertMessage('<img src=\'' + data + '\' fileId=\'' + fileId + '\' class=\'img-item\'>');
                            self.imageData[fileId] = {
                                arrayBuffer: reader.result,
                                file: image,
                                width: newImage.width,
                                height: newImage.height
                            };
                        };
                        newImage.src = data;
                    };
                    rd.readAsDataURL(image);
                };
                reader.readAsArrayBuffer(image);
            } else {
                let text = e.clipboardData.getData('text/plain') || '';
                if (text !== '') {
                    this.insertMessage(text);
                }
            }
        }
    };

    render() {
        return (
            <div className="send-message" onKeyDown={this.messageEnter}>
                <div className="chat-tool-bar">
                    <div className="tool-btn-wrap">
                        <div className="btn-image">
                            <div className="emotion-wrap" style={{display: this.state.isShowEmotion ? 'block' : 'none'}}>
                                <EmotionBase
                                    nums={this.getNums()}
                                    emotionArray={this.getEmotionArray()}
                                    emotionTypes={this.getEmotionTypes()}
                                />
                            </div>
                            <div className="emotion-btn" onClick={this.showEmotion}>
                                <i className="iconfont icon-biaoqing"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="send-message-wrap">
                    <div
                        className="send-message-body"
                        contentEditable
                        ref="editDiv"
                    />
                </div>
                <div className="send-btn">
                    <Button
                        loading={this.state.loading}
                        disabled={!this.props.initAntme}
                        onClick={this.send}
                        type="primary"
                        size="small"
                    >{Intl.get('common.send', '发送')}</Button>
                </div>
            </div>
        );
    }
}

SendMessage.propTypes = {
    initAntme: PropTypes.bool,
};
export default SendMessage;