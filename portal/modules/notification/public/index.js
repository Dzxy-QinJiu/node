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

class Notification extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: TAB_KEYS.SYSTEM // 通知
        };
    }
    componentDidMount() {
        $('body').css('overflow', 'hidden');
    }

    componentWillUnmount() {
        $('body').css('overflow', 'hidden');
    }

    //切换tab时的处理
    changeActiveKey = (key) => {
        let keyName = '通知';
        if (key === TAB_KEYS.UPGRADE_NOTICE) {
            keyName = '公告';
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
