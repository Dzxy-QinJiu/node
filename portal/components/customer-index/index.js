/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/16.
 */
import './css/customer-index.less';
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
        };
    }

    listenerIds = {};

    componentDidMount() {
        //登录蚁讯
        this.initialLoginAntme();
    }

    componentWillUnmount() {
        this.removeAntMeEvents();
    }

    //登录蚁讯服务
    initialLoginAntme() {
        window.antmeProxy = AntmeProxy.init({
            url: Oplate.antmeActorUrl,
            forceLogin: false,
            appId: Oplate.curtaoClientId,
            ssoLoginCallback: function() {
                /*self.ssoClient.quickLogin().then((data) => {
                    console.log('sso login success:', data.ticket);
                    console.log('ticket获取成功：', new Date());
                    window.antmeProxy.rpc('RPC.auth2.loginByTicket', [data.ticket], function () {
                        console.log('ticket登陆成功：', new Date());
                        console.log('antme login success');
                        // 登陆成功后forceLogin置为false 刷新界面重新连接antme免登陆
                        api.user.setForceLogin().then(ret => {
                            console.log('antme-set-force-login', ret.body.data.force_login);
                        });
                    });
                }).catch((data) => {
                    console.log('sso login fail:', data);
                });*/
                console.log('开始登陆蚁讯服务：', new Date());
                window.antmeProxy.rpc('RPC.auth2.loginByTicket', ['2UmXAmcdu4uHblM02ROJsMPr'], function() {
                    console.log('ticket登陆成功：', new Date());
                    console.log('antme login success');
                    // 登陆成功后forceLogin置为false 刷新界面重新连接antme免登陆
                    // api.user.setForceLogin().then(ret => {
                    //     console.log('antme-set-force-login', ret.body.data.force_login);
                    // });
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
        for (let key in sdkEventConstants.MessageConstants) {
            let constants = sdkEventConstants.MessageConstants[key];
            for (let name in constants) {
                window.antmeProxy.on(name, key, (data) => {
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

    render() {
        return (
            <div className="customer">
                <div className="customer-service">
                    <div className="customer-title">
                        <div className="to-name">{Intl.get('common.customer.service', '在线客服')}</div>
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
            </div>
        );
    }
}

CustomerIndex.propTypes = {
    needLogin: PropTypes.func,
    initAntme: PropTypes.func,
};
export default CustomerIndex;