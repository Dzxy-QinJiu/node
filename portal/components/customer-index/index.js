/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/16.
 */
import './css/customer-index.less';
import RcViewer from 'CMP_DIR/rc-viewer';
import ChatMessageHome from './chat-message-home';
import SendMessage from './send-message';
import AntmeProxy from 'LIB_DIR/worker/antme.proxy';
import { sdkEventConstants } from './consts';
import { customerServiceEmitter } from 'OPLATE_EMITTER';

class CustomerIndex extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            initAntme: false,
            userId: null, //蚁讯中登录后返回的用户id
            previewImage: '',//预览图片地址
        };
    }

    listenerIds = {};

    componentDidMount() {
        //登录蚁讯
        this.initialLoginAntme();
        customerServiceEmitter.on(customerServiceEmitter.FULL_CHAT_MESSAGE_IMAGE, this.handlePreview);
    }

    componentWillUnmount() {
        this.removeAntMeEvents();
        customerServiceEmitter.removeListener(customerServiceEmitter.FULL_CHAT_MESSAGE_IMAGE, this.handlePreview);
    }

    //获取蚁讯ticket
    getAntMeTicket() {
        const Deferred = $.Deferred();
        $.ajax({
            url: '/rest/base/v1/user/antme/ticket',
            type: 'get',
            dateType: 'json',
            success: (ticket) => {
                Deferred.resolve(ticket);
            },
            error: (errorInfo) => {
                Deferred.reject(errorInfo.responseJSON);
            }
        });
        return Deferred.promise();
    }

    //设置forceLogin
    setForceLogin() {
        const Deferred = $.Deferred();
        $.ajax({
            url: '/rest/user/set-force-login',
            type: 'get',
            dateType: 'json',
            success: (ticket) => {
                Deferred.resolve(ticket);
            },
            error: (errorInfo) => {
                Deferred.reject(errorInfo.responseJSON);
            }
        });
        return Deferred.promise();
    }

    //登录蚁讯服务
    initialLoginAntme() {
        let self = this;
        window.antmeProxy = AntmeProxy.init({
            url: Oplate.antmeActorUrl,
            forceLogin: Oplate.forceLogin === 'true',
            appId: Oplate.antmeClientId,
            ssoLoginCallback: function() {
                console.log('开始获取ticket：', new Date());
                self.getAntMeTicket().then((ticket) => {
                    console.log('获取ticket成功', new Date());
                    console.log('开始登陆蚁讯服务：', new Date());
                    window.antmeProxy.rpc('RPC.auth2.loginByTicket', [ticket], function() {
                        console.log('登陆蚁讯成功', new Date());
                        // 登陆成功后forceLogin置为false 刷新界面重新连接antme免登陆
                        self.setForceLogin().then(ret => {
                            console.log('设置蚁讯强制登录为：', ret.force_login);
                        });
                    });
                }, (errMsg) => {
                    console.log('获取ticket失败：', errMsg);
                });
            },
            initSuccessCallBack: function(data) {
                self.init(data.userId);
                console.log('会话获取成功：', new Date());
            },
            offlineCallback: () => {
                console.log('会话获取失败：', new Date());
            },
            sessionInvalidCallback: () => {
                _.isFunction(this.props.needLogin) && this.props.needLogin();
            }
        });
    }

    //初始化蚁讯服务的事件监听
    registryAntMeEvents() {
        if(_.isEmpty(this.listenerIds)) {
            for (let key in sdkEventConstants.MessageConstants) {
                let constants = sdkEventConstants.MessageConstants[key];
                for (let name in constants) {
                    window.antmeProxy.on(name, key, (data) => {
                        console.log('事件名：', constants[name]);
                        customerServiceEmitter.emit(constants[name], data);
                    }, (id) => {
                        if (!this.listenerIds[key]) {
                            this.listenerIds[key] = {};
                        }
                        this.listenerIds[key][name] = id;
                    });
                }
            }
        }
    }

    removeAntMeEvents() {
        if (!_.isEmpty(this.listenerIds)) {
            for (let key in this.listenerIds) {
                let constants = sdkEventConstants.MessageConstants[key];
                for (let name in constants) {
                    window.antmeProxy.off(name, key, this.listenerIds[key][name]);
                }
            }
        }
        this.listenerIds = {};
    }

    init(userId) {
        this.registryAntMeEvents();
        this.setState({
            initAntme: true,
            userId
        });
        _.isFunction(this.props.initAntme) && this.props.initAntme();
    }

    handlePreview = (image) => {
        this.setState({
            previewImage: image.url,
        }, () => {
            const { viewer } = this.refs.viewer;
            viewer.show();
        });
    };

    render() {
        return (
            <div className="customer">
                <div className="customer-service">
                    <div className="customer-title">
                        <div className="to-name">{Intl.get('common.customer.service.online.assistant', '在线小助手')}</div>
                    </div>
                    <div className="customer-body">
                        <ChatMessageHome
                            initAntme={this.state.initAntme}
                            userId={this.state.userId}
                        />
                    </div>
                    <div className="customer-foot">
                        <SendMessage initAntme={this.state.initAntme}/>
                    </div>
                </div>
                <RcViewer ref="viewer">
                    {/*我们这里创建一个不显示的图片，因为这张图片只是为了用来查看放大图片的,不需要显示*/}
                    <img style={{display: 'none'}} src={this.state.previewImage}/>
                </RcViewer>
            </div>
        );
    }
}

CustomerIndex.propTypes = {
    needLogin: PropTypes.func,
    initAntme: PropTypes.func,
};
export default CustomerIndex;