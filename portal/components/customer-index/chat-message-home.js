/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/16.
 */
import './css/chat-message-home.less';
import EfLoading from 'CMP_DIR/ef-components/ef-loading';
import EfLoadMore from 'CMP_DIR/ef-components/load-more';
import ChatMessageItem from './chat-message-item';
import { sdkEventConstants } from './consts';
import { customerServiceEmitter } from 'OPLATE_EMITTER';

const PAGE_SIZE = 20;

class ChatMessageHome extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            messageList: [], //消息列表
            isLoading: true,
            errorMsg: '',
            isScrollToTop: true
        };
    }

    events = {
        [sdkEventConstants.MessageConstants.dialog['send-message-before']]: function(obj) {
            obj.message.isActive = true;
            obj.message.isSelf = true;
            let messageList = this.state.messageList;
            messageList.push(obj.message);
            this.setState({messageList}, () => {
                this.scrollToBottom(true);
            });
        },
        [sdkEventConstants.MessageConstants.dialog['send-message-success']]: function(dialog) {
            let messageList = this.state.messageList;
            let message = messageList.find(msg => {
                return msg.rid === dialog.rid;
            });
            if (message) {
                message.isActive = false;
                message.date = dialog.date;
            }
            this.setState({messageList});
        },
        [sdkEventConstants.MessageConstants.dialog['update-message']]: function(obj) {
            obj.message.isSelf = false;
            let messageList = this.state.messageList;
            messageList.push(obj.message);
            this.setState({messageList}, () => {
                if (this.refs.loadMore) {
                    this.scrollToBottom(this.refs.loadMore.getToBottomDistance() < 80);
                }
            });
        },
        [sdkEventConstants.MessageConstants.dialog['message-content-change']]: function(obj) {
            let messageList = this.state.messageList;
            let index = messageList.findIndex(msg => {
                return msg.rid === obj.rid;
            });
            if (index >= 0) {
                messageList[index].message = obj.message;
            }
            this.setState({messageList});
        }
    };

    componentDidMount() {
        this.registryEvents();
        if (this.props.initAntme) {
            console.log('获取历史信息，didMount中');
            this.loadHistoryMessage({
                isLoading: true
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.initAntme && !_.isEqual(nextProps.initAntme, this.props.initAntme)) {
            console.log('获取历史信息，willReceiveProps中');
            this.loadHistoryMessage({
                isLoading: true
            });
        }
    }

    componentWillUnmount() {
        this.removeEvents();
    }

    registryEvents() {
        console.log('开始注册事件监听');
        this.bindEvents = {};
        for (let eventId in this.events) {
            this.bindEvents[eventId] = this.events[eventId].bind(this);
            customerServiceEmitter.on(eventId, this.bindEvents[eventId]);
        }
    }

    removeEvents() {
        for (let eventId in this.bindEvents) {
            customerServiceEmitter.removeListener(eventId, this.bindEvents[eventId]);
            this.bindEvents[eventId] = null;
        }
    }

    //获取历史消息
    loadHistoryMessage = ({isLoading = false, date = new Date().getTime(), size = PAGE_SIZE, isScrollToTop = false}) => {
        this.setState({errorMsg: '', isLoading});

        let newState = {};
        newState.isScrollToTop = isScrollToTop;
        let self = this;
        window.antmeProxy.rpc('RPC.messaging.getServiceHistoryByCustomer', [window.Oplate.antmeClientId, date, size], function(result) {
            newState.isLoading = false;
            if (result.array.length) {
                let array = result.array.reverse();
                newState.messageList = array.concat(self.state.messageList);
            }
            self.setState(newState, () => {
                if (newState.isScrollToTop) {
                    self.refs.loadMore.topComplete();
                } else {
                    self.scrollToBottom(true);
                }
            });
        });
    };

    //上拉加载
    onTopLoad = () => {
        if (this.props.initAntme) {
            this.loadHistoryMessage({
                date: this.state.messageList[0].date,
                isScrollToTop: true
            });
        }
    };

    //滚动到底部
    scrollToBottom = (isBottom) => {
        if (this.refs.loadMore) {
            this.refs.loadMore.updateScroll();
            if (isBottom) {
                this.refs.loadMore.toBottom();
            }
        }
    };

    renderMessageListBlock() {
        return (
            <EfLoadMore ref="loadMore" onTopLoad={this.onTopLoad}>
                {this.state.messageList.map(message => {
                    return (
                        <ChatMessageItem
                            key={message.rid + message.date}
                            message={message}
                            userId={this.props.userId}
                        />
                    );
                })}
            </EfLoadMore>
        );
    }

    renderChatContent() {
        let { messageList, isLoading, errorMsg } = this.state;
        let content = null;
        if(messageList.length) {
            return this.renderMessageListBlock();
        }else if(isLoading) {
            content = <EfLoading/>;
        }else if(errorMsg) {
            content = (
                <div className="customer-error-msg">
                    {errorMsg}
                </div>
            );
        }else {
            content = (
                <div className="customer-empty-msg">
                    {Intl.get('common.empty.customer.record', '暂无会话记录')}
                    <div className="empty-img"/>
                </div>
            );
        }

        return (
            <div className="empty-container">
                {content}
            </div>
        );
    }

    render() {
        return (
            <div className="chat-message-home">
                {this.renderChatContent()}
            </div>
        );
    }
}

ChatMessageHome.propTypes = {
    initAntme: PropTypes.bool,
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
export default ChatMessageHome;