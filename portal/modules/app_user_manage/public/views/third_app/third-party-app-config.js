// 第三方应用管理配置信息

var React = require('react');
import Spinner from 'CMP_DIR/spinner';
import { Alert } from 'antd';
import AppUserUtil, { LAYOUT_CONSTANTS } from '../../util/app-user-util'; //右侧面板常量
import { PrivilegeChecker } from 'CMP_DIR/privilege/checker';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import ThirdPartyAppConfigStore from '../../store/third-party-app-config-store';
import ThirdPartyAppConfigAction from '../../action/third-party-app-config-actions';
import DefaultUserLogoTitle from 'CMP_DIR/default-user-logo-title';
import AppUserPanelSwitchAction from '../../action/app-user-panelswitch-actions';

const FORMAT = oplateConsts.DATE_FORMAT;

class ThreePartyAppConfig extends React.Component {
    static defaultProps = {
        userId: '1'
    };

    onStateChange = () => {
        this.setState(this.getStateData());
    };

    getStateData = () => {
        return ThirdPartyAppConfigStore.getState();
    };

    componentDidMount() {
        ThirdPartyAppConfigStore.listen(this.onStateChange);
        ThirdPartyAppConfigAction.getAppConfigList(this.props.userId);
    }

    componentDidUpdate(prevProps, prevState) {
        var newUserId = this.props.userId;
        if (prevProps.userId !== newUserId) {
            setTimeout( () => {
                ThirdPartyAppConfigAction.dismiss();
                ThirdPartyAppConfigAction.getUserBasicInfo(newUserId);
                ThirdPartyAppConfigAction.getAppConfigList(newUserId);
            }, 0);
        }
    }

    retryGetAppConfig = () => {
        var userId = this.props.userId;
        setTimeout( () => {
            ThirdPartyAppConfigAction.dismiss();
            ThirdPartyAppConfigAction.getAppConfigList(userId);
        }, 0);
    };

    componentWillUnmount() {
        ThirdPartyAppConfigStore.unlisten(this.onStateChange);
        setTimeout( () => {
            ThirdPartyAppConfigAction.dismiss();
        });
    }

    // 增加第三方应用配置的信息
    showAddAppPanel = () => {
        AppUserPanelSwitchAction.switchToThirdAppPanel({userId: this.props.userId});
        //向左滑动面板
        AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_LEFT);
    };

    renderAppInfo = (app) => {
        var establish_time = moment(new Date(+app.create_time)).format(FORMAT);
        var displayEstablishTime = '';

        if (app.create_time === '0') {
            displayEstablishTime = Intl.get('user.nothing', '无');
        } else if (establish_time === 'Invalid date') {
            displayEstablishTime = Intl.get('common.unknown', '未知');
        } else {
            displayEstablishTime = establish_time;
        }
        return (
            <div className="rows-3">
                <div className="app-prop-list">
                    <span className="app-title">{app.name}</span>
                    <span className="app-info">{Intl.get('user.third.thirdapp.platform', '应用平台')}:{app.platform}</span>
                    <span className="app-info">{Intl.get('user.third.thirdapp.type', '应用类型')}:{app.type}</span>
                    <span className="app-info">{Intl.get('third.party.app.create.time', '创建时间')}: {displayEstablishTime}</span>
                    <span className="app-info">{Intl.get('common.describe', '描述')}: {app.about}</span>
                </div>
            </div>
        );
    };

    renderAddAppBtn = () => {
        return (
            <PrivilegeChecker
                check="THIRD_PARTY_MANAGE" // 只有管理员可以查看应用详情、添加、编辑和停用应用
                tagName="a"
                className="a_button"
                href="javascript:void(0)"
                onClick={this.showAddAppPanel}>
                <ReactIntl.FormattedMessage id="third.party.app.add" defaultMessage="添加开放平台应用"/>
            </PrivilegeChecker>
        );
    };

    // 显示单个应用详情
    showSingleAppDetail = (app) => {
        AppUserPanelSwitchAction.switchToThirdAppPanel({appId: app.id, userId: this.props.userId});
        //向左滑动面板
        AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_LEFT);
    };

    //获取应用列表段
    getAppsBlock = () => {
        let className = 'logo';
        className += ' pull-left';
        return (
            <ul className="app_list">
                {this.state.initialApp.length > 0 ? (this.state.initialApp.map( (app) => {
                    return (
                        <li className="clearfix list-unstyled" key={app.id}>
                            <div className={className} title={app.name}>
                                <DefaultUserLogoTitle
                                    nickName={app.name}
                                    userLogo={app.logo}
                                />
                            </div>
                            <div className="desp pull-left">
                                {
                                    this.renderAppInfo(app)
                                }
                            </div>
                            {
                                (app.status === 'disable') ? (
                                    <div className="is_disabled">
                                        <span className="disabled_span">{Intl.get('common.stop', '停用')}</span>
                                    </div>
                                ) : null
                            }
                            <PrivilegeChecker
                                check="THIRD_PARTY_MANAGE" // 只有管理员可以查看应用详情、添加、编辑和停用应用
                                tagName="div"
                                className="operate"
                            >
                                <a href="javascript:void(0)"
                                    onClick={this.showSingleAppDetail.bind(this, app)}
                                    title={Intl.get('user.third.app.detail', '查看开放平台应用详情')}>
                                    <i className="iconfont icon-app-detail"></i>
                                </a>
                            </PrivilegeChecker>
                        </li>
                    );
                })) : (
                    <div>
                        <span>{Intl.get('my.app.no.app', '暂无应用')}</span>
                        <PrivilegeChecker
                            check="THIRD_PARTY_MANAGE" // 只有管理员可以查看应用详情、添加、编辑和停用应用
                            tagName="span"
                            className="operate"
                        >
                            <span>，{Intl.get('common.yesno', '是否')}</span>{this.renderAddAppBtn()}
                        </PrivilegeChecker>
                    </div>
                )}
            </ul>
        );
    };

    state = this.getStateData();

    render() {
        let LoadingBlock = this.state.isLoading ? (
            <Spinner />
        ) : null;
        let ErrorBlock = ( () => {
            if (this.state.getDetailErrorMsg) {
                let retry = (
                    <span>{this.state.getAppConfigErrorMsg}，<a href="javascript:void(0)"
                        onClick={this.retryGetAppConfig}><ReactIntl.FormattedMessage
                            id="common.retry" defaultMessage="重试"/></a></span>
                );
                return (
                    <div className="get_app_config_error_tip">
                        <Alert
                            message={retry}
                            type="error"
                            showIcon={true}
                        />
                    </div>
                );
            }
            return null;
        })();
        let AppConfigBlock = !this.state.isLoading && !this.state.getDetailErrorMsg ? (
            <div>
                { this.state.initialApp.length > 0 ? (<div className="app_wrap" ref="app_wrap">
                    <dl className="dl-horizontal clearfix">
                        <dd className="text-right add_app_btns">
                            {this.renderAddAppBtn()}
                        </dd>
                    </dl>
                    {this.getAppsBlock()}
                </div>) : (
                    <div className="no-data-tips">
                        { this.getAppsBlock()}
                    </div>

                )}

            </div>

        ) : null;


        var fixedHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DELTA - LAYOUT_CONSTANTS.BOTTOM_DELTA;
        return (
            <div style={{height: fixedHeight}}>
                <GeminiScrollbar>
                    {LoadingBlock}
                    {ErrorBlock}
                    {AppConfigBlock}
                </GeminiScrollbar>
            </div>
        );
    }
}

ThreePartyAppConfig.propTypes = {
    userId: PropTypes.string,
};

export default ThreePartyAppConfig;
