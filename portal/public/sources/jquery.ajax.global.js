/**
 * author:周连毅
 * description:全局的ajax处理
 *     1.对于session超时的450错误(服务器会返回状态码450，同时返回json信息{type:"login"})
 *       页面会使用$.tooltip提示一个错误信息 "您已很长时间没有进行操作，为了保障帐号安全，请重新登录系统"
 */

var UI_ERROR = require('../../lib/utils/request-error-util');
import {Modal} from 'antd';
import phoneUtil from './utils/phone-util';
import {pcAndWechatMiniProgram} from 'PUB_DIR/sources/utils/register_util';
(function() {
    //socket的emitter
    var socketEmitter = require('./utils/emitters').socketEmitter;
    const isCurtao = require('./utils/common-method-util').isCurtao;
    let SessionTimeoutModal = isCurtao() ? require('../../components/Login-curtao/session-timeout-modal/index') : require('../../components/Login/session-timeout-modal/index');
    const Translate = require('../intl/i18nTemplate');
    var history = require('./history');
    const Router = require('react-router-dom').Router;
    module.exports.handleSessionExpired = handel401Ajax;

    /*处理ajax时，session过期的问题*/
    function handel401Ajax() {
        sendMessage && sendMessage('session过期, globalError status: 401');
        // session超时后，退出容联电话系统的登录
        phoneUtil.logoutCallClient();
        //让socket断开连接
        socketEmitter.emit(socketEmitter.DISCONNECT);
        //session过期提示的添加
        var $modal = $('body >#session-timeout-modal');
        if ($modal && $modal.length > 0) {
            return;
        } else {
            $('body').append('<div id="session-timeout-modal"></div>');
            ReactDOM.render(<Translate Template={<Router history={history}><SessionTimeoutModal /></Router>}/>, $('#session-timeout-modal')[0]);
        }
    }

    //处理403错误请求（token过期）
    function handel403Ajax(xhr) {
        if (xhr.responseJSON === UI_ERROR.TOKEN_EXPIRED) {
            sendMessage && sendMessage(Intl.get('retry.token.status', 'status:403,Token过期'));
            window.location.href = '/login';
        }
    }

    /**
     *不允许多人登录，被下线的处理
     * @param tipContent
     */
    function handleReloginError(tipContent) {
        // 登录踢出后，退出容联电话系统的登录
        phoneUtil.logoutCallClient();
        //让socket断开连接
        socketEmitter.emit(socketEmitter.DISCONNECT);
        Modal.error({
            wrapClassName: 'socket-io',
            content: tipContent,
            okText: Intl.get('retry.login.again', '重新登录'),
            onOk: function() {
                pcAndWechatMiniProgram('/logout');
            }
        });
        setTimeout(function() {
            //设置提示框的样式
            var $modal = $('body >.ant-modal-container');
            if ($modal && $modal.length > 0) {
                $modal.addClass('offline-modal-container');
            }
        }, 100);
        //解除 session失效提示的 事件绑定
        $(document).off('ajaxError');
    }

    /**
     * 处理请求超时的情况(408)
     * @param xhr
     * @param options
     */
    function handleTimeout(xhr, options) {
        sendMessage && sendMessage('Error requesting ' + options && options.url + ': ' + xhr.status + ' ' + xhr.statusText);
    }

    /**
     * 全局ajax错误处理
     * @param xhr
     * @param options
     */
    function globalErrorHandler(xhr, options) {
        var status = xhr.status;
        switch (status) {
            case 401:
                handel401Ajax();
                break;
            case 403:
                //不允许多人登录被踢出的统一处理
                if (xhr.responseJSON === UI_ERROR.LOGIN_ONLY_ONE || xhr.responseJSON === UI_ERROR.KICKED_BY_ADMIN) {
                    let reloginError = Intl.get('login.by.another', '您的账号在另一地点登录，如非本人操作，建议您尽快修改密码！');
                    let kickedByAmdin = Intl.get('kicked.by.admin', '您已被被管理员踢出，请重新登录!');
                    handleReloginError((xhr.responseJSON === UI_ERROR.LOGIN_ONLY_ONE) ? reloginError : kickedByAmdin);
                } else {
                    handel403Ajax(xhr);
                }
                break;
            case 408:
                handleTimeout(xhr, options);
                break;
        }
    }

    $(document).ajaxError(function(event, xhr, options) {
        globalErrorHandler(xhr, options);
    });
})();
