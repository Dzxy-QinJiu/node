/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/5/31.
 * 申请用户时，各应用的配置
 */
require('./css/index.less');
import SquareLogoTag from '../square-logo-tag';
import {Tabs, Col} from 'antd';
const TabPane = Tabs.TabPane;
const CONFIG_TYPE = {
    UNIFIED_CONFIG: 'unified_config',//统一配置
    SEPARATE_CONFIG: 'separate_config'//分别配置
};
class ApplyUserAppConfig extends React.Component {
    constructor(props) {
        super(props);
    }

    changeConfigType(activeKey) {
        if (_.isFunction(this.props.changeConfigType)) {
            this.props.changeConfigType(activeKey);
        }
    }

    renderConfigTabs(apps, appsFormData) {
        return (
            <div className="app-config-tab-container">
                <Tabs type="card" activeKey={this.props.configType} onChange={this.changeConfigType.bind(this)}>
                    <TabPane tab={Intl.get('crm.apply.user.unified.config', '统一配置')} key={CONFIG_TYPE.UNIFIED_CONFIG}>
                        {this.renderAppConfigForm(appsFormData[0], apps[0])}
                    </TabPane>
                    <TabPane tab={Intl.get('crm.apply.user.separate.config', '分别配置')} key={CONFIG_TYPE.SEPARATE_CONFIG}>
                        {_.map(apps, app => {
                            let formData = _.find(appsFormData, data => data.client_id === app.client_id);
                            return (
                                <div className="app-config-item">
                                    <div className="app-config-title">
                                        <SquareLogoTag name={app ? app.client_name : ''}
                                            logo={app ? app.client_logo : ''}
                                        />
                                    </div>
                                    {this.renderAppConfigForm(formData, app)}
                                </div>);
                        })}
                    </TabPane>
                </Tabs>
            </div>);
    }

    renderAppConfigForm(appFormData, app) {
        if (_.isFunction(this.props.renderAppConfigForm)) {
            return this.props.renderAppConfigForm(appFormData, app);
        }
        return null;
    }

    render() {
        let apps = this.props.apps || [];
        let appsFormData = this.props.appsFormData || [];
        return (
            <div className="apply-app-user-config">
                <Col span={20} className="app-config-wrap">
                    {apps.length === 1 ? this.renderAppConfigForm(appsFormData[0]) :
                        apps.length > 1 ? this.renderConfigTabs(apps, appsFormData) : null}
                </Col>
            </div>);
    }
}
const PropTypes = React.PropTypes;
ApplyUserAppConfig.propTypes = {
    apps: PropTypes.array,
    appsFormData: PropTypes.array,
    configType: PropTypes.string,
    changeConfigType: PropTypes.func,
    renderAppConfigForm: PropTypes.func
};

ApplyUserAppConfig.defaultProps = {
    apps: [],//选择的需要配置的应用列表
    appsFormData: [],//应用配置的form数据列表
    //配置类型，unified_config：统一配置，separate_config：分别配置
    configType: CONFIG_TYPE.UNIFIED_CONFIG,
    //配置类型修改事件
    changeConfigType: function() {
    },
    //渲染应用的配置界面
    renderAppConfigForm: function() {
    }
};
export default ApplyUserAppConfig;