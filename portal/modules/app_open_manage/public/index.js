import { Button, Modal, Form, Select } from 'antd';
const Option = Select.Option;
require('./style/index.less');
import rightPanelUtil from 'CMP_DIR/rightPanel';
const RightPanel = rightPanelUtil.RightPanel;
import { RightPanelClose } from 'CMP_DIR/rightPanel/index';
const OpenAppAction = require('./action');
const OpenAppStore = require('./store');
const FormItem = Form.Item;
var TopNav = require('CMP_DIR/top-nav');
import StatusWrapper from 'CMP_DIR/status-wrapper';
import { USER_STATUS } from './consts';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';

const itemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
};

class OpenApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowAppDetail: false,
            selectedApp: {},
            ...OpenAppStore.getState()
        };
    }
    componentDidMount() {
        OpenAppStore.listen(this.onStoreChange);
        this.getAppList();
    }
    onStoreChange = () => {
        this.setState(
            OpenAppStore.getState()
        );
    }
    getAppList() {
        OpenAppAction.getAppList();
    }
    getRoleList(clientId) {
        OpenAppAction.getRoleList(clientId);
    }
    getUserList(role) {
        const data = {
            query: {
                cur_page: 1,
                page_size: 20,
            }
        };
        OpenAppAction.getAllUsers(data);
    }
    handleCheckDetail(app) {
        if (this.state.selectedApp.client_id !== app.client_id) {
            this.setState({
                selectedApp: app
            }, () => {
                this.getRoleList(app.client_id);
                this.getUserList();
                this.showAppDetail(true);
            });
        }
    }
    handleCloseDetail() {
        this.setState({
            selectedApp: {}
        }, () => {
            this.showAppDetail(false);
        });
    }
    showAppDetail(isShow) {
        this.setState({
            isShowAppDetail: isShow
        });
    }
    handleSubmit() {

    }
    handleSelectChange({ role_id }, value) {
        OpenAppAction.changeRoleUser({
            role_id,
            ids: value
        });
    }
    render() {
        const renderRoleFormItem = (role, index) => (
            <FormItem {...itemLayout} key={index} label={role.role_name}>
                <Select
                    multiple={true}
                    value={role.userList.map(x => x.user_id)}
                    onChange={this.handleSelectChange.bind(this, role)}
                    showSearch={true}
                >
                    {
                        this.state.userList.data.map((user, index) => (
                            <Option key={index} value={user.user_id}>{user.user_name}</Option>
                        ))
                    }
                </Select>
            </FormItem>
        );
        return (
            <div className="open-app-wrapper">
                <TopNav>
                    <TopNav.MenuList />
                </TopNav>
                <StatusWrapper
                    loading={this.state.appList.loading}
                    errorMsg={this.state.appList.errorMsg}
                >
                    <div className="">
                        {
                            this.state.appList.data.map((app, index) => (
                                <fieldset key={index} className='app-container'>
                                    <legend>{app.title}</legend>
                                    <p>{app.desc}</p>
                                    <div className="btn-bar">
                                        <Button onClick={this.handleCheckDetail.bind(this, app)}>
                                            {Intl.get('call.record.show.customer.detail', '查看详情')}
                                        </Button>
                                    </div>
                                </fieldset>
                            ))
                        }
                    </div>
                </StatusWrapper>
                <RightPanel
                    className="app-detail-wrapper"
                    showFlag={this.state.isShowAppDetail}
                >
                    {
                        this.state.isShowAppDetail ?
                            <div className="">
                                <RightPanelClose
                                    title={Intl.get('common.app.status.close', '关闭')}
                                    onClick={this.handleCloseDetail.bind(this)}
                                />
                                <div className="app-detail-container">
                                    <h4 className="title">
                                        {this.state.selectedApp.title}
                                    </h4>
                                    <div className="content">
                                        <h5>
                                            开通范围
                                        </h5>
                                        <StatusWrapper
                                            loading={this.state.roleList.loading && this.state.roleUserList.loading}
                                            errorMsg={this.state.roleList.errorMsg}
                                        >
                                            <div className="role-from-wrapper">
                                                {
                                                    this.state.roleList.data.map((role, index) => renderRoleFormItem(role, index))
                                                }
                                            </div>
                                        </StatusWrapper>
                                    </div>
                                    <div className="btn-bar">
                                        <Button type="primary" onClick={this.handleSubmit.bind(this)}>{Intl.get('common.sure', '确定')}</Button>
                                        <Button onClick={this.handleCloseDetail.bind(this)}>{Intl.get('common.cancel', '取消')}</Button>
                                    </div>
                                </div>
                            </div> : null
                    }
                </RightPanel>
            </div>
        );

    }
}
module.exports = OpenApp;