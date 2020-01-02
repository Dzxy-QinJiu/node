const language = require('../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./css/main-es_VE.less');
} else if (language.lan() === 'zh') {
    require('./css/main-zh_CN.less');
}
import { Tabs } from 'antd';
const { TabPane } = Tabs;

const TAB_KEYS = {
    SYSTEM: 'system',// 通知
    UPGRADE_NOTICE: 'notice',// 公告
};
//顶部导航
const SystemNotification = require('./views/system');
import UpgradeNotice from './views/upgrade-notice';
import {clickUpgradeNoiceEmitter} from 'PUB_DIR/sources/utils/emitters';
import ajax from 'ant-ajax';
import { storageUtil } from 'ant-utils';
const websiteConfig = JSON.parse(storageUtil.local.get('websiteConfig'));
import {setPersonWebConfig} from 'PUB_DIR/sources/utils/common-data-util';

class Notification extends React.Component {
    constructor(props) {
        super(props);
        let activeKey = TAB_KEYS.SYSTEM;
        // 最后一次升级时间大于点击查看公告的时间时，点通知，需要显示公告tab项
        if (_.get(websiteConfig, 'last_upgrade_notice_time') > _.get(websiteConfig, 'show_notice_time')) {
            activeKey = TAB_KEYS.UPGRADE_NOTICE;
            clickUpgradeNoiceEmitter.emit(clickUpgradeNoiceEmitter.CLICK_NOITCE_TAB, false);
            
            setPersonWebConfig({show_notice_time: moment().valueOf()});
        }
        this.state = {
            activeKey: activeKey
        };
    }
    componentDidMount() {
        $('body').css('overflow', 'hidden');
        // 如果有新的公告信息，点击显示公告
    }

    componentWillUnmount() {
        $('body').css('overflow', 'hidden');
    }

    //切换tab时的处理
    changeActiveKey = (key) => {
        let keyName = '通知';
        if (key === TAB_KEYS.UPGRADE_NOTICE) {
            keyName = '公告';
            clickUpgradeNoiceEmitter.emit(clickUpgradeNoiceEmitter.CLICK_NOITCE_TAB, false);
            setPersonWebConfig({show_notice_time: moment().valueOf()});
        }
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-tabs-nav-wrap .ant-tabs-nav'), '查看' + keyName);
        this.setState({
            activeKey: key
        });
    };

    render() {
        return (
            <div className="notification_wrap">
                <div className="shade" onClick={this.props.closeNotificationPanel}></div>
                <Tabs
                    defaultActiveKey={TAB_KEYS.SYSTEM}
                    activeKey={this.state.activeKey}
                    onChange={this.changeActiveKey}
                >
                    <TabPane
                        tab={Intl.get('menu.notification', '通知')}
                        key={TAB_KEYS.SYSTEM}
                    >
                        {
                            this.state.activeKey === TAB_KEYS.SYSTEM ?
                                <div className="notification-content" id="system-notice">
                                    <SystemNotification/>
                                </div>
                                : null
                        }
                    </TabPane>
                    <TabPane
                        tab={Intl.get('rightpanel_notice','公告')}
                        key={TAB_KEYS.UPGRADE_NOTICE}
                    >
                        {
                            this.state.activeKey === TAB_KEYS.UPGRADE_NOTICE ? (
                                <div className="upgrade-notice-wrap">
                                    <UpgradeNotice />
                                </div>
                            ) : null
                        }
                    </TabPane>
                </Tabs>);
            </div>
        );
    }
}

Notification.propTypes = {
    closeNotificationPanel: PropTypes.func,
};

module.exports = Notification;
