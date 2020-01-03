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
const {setWebsiteConfig } = require('LIB_DIR/utils/websiteConfig');
import {isCurtao} from 'PUB_DIR/sources/utils/common-method-util';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import notificationPrivilege from './privilege-const';
import useManagePrivilege from 'MOD_DIR/app_user_manage/public/privilege-const';

class Notification extends React.Component {
    constructor(props) {
        super(props);
        let activeKey = TAB_KEYS.UPGRADE_NOTICE;
        // 有新的公告时，点通知，需要显示公告tab项
        if (props.isUnReadNotice) {
            this.handleShowNoticeTab();
        } else if(hasPrivilege(notificationPrivilege.CUSTOMER_NOTICE_MANAGE) && !isCurtao()){
            activeKey = TAB_KEYS.SYSTEM;
        }
        this.state = {
            activeKey: activeKey
        };
    }

    handleShowNoticeTab() {
        clickUpgradeNoiceEmitter.emit(clickUpgradeNoiceEmitter.CLICK_NOITCE_TAB, false);
        setWebsiteConfig({show_notice_time: moment().valueOf()});
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
            this.handleShowNoticeTab();
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
                    {
                        !isCurtao() && hasPrivilege(useManagePrivilege.USER_QUERY) && hasPrivilege(notificationPrivilege.CUSTOMER_NOTICE_MANAGE) ? (
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
                        ) : null
                    }
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
    isUnReadNotice: PropTypes.bool,
};

module.exports = Notification;
