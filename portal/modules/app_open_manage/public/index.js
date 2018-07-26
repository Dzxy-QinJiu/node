import { Button, Modal, Form, Select, Icon, message } from 'antd';
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
import { USER_STATUS, APP_STATUS, MAX_PAGESIZE } from './consts';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';

const itemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 18 },
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
    getRoleList(app) {
        OpenAppAction.getAppRoleList({
            query: {
                tags: app.tags.join(','),
                page_size: MAX_PAGESIZE,
                page_num: 1
            }
        });
    }
    getUserList(role) {
        OpenAppAction.getAllUsers();
    }
    handleCheckDetail(app) {
        if (this.state.selectedApp.tags_name !== app.tags_name) {
            this.setState({
                selectedApp: app
            }, () => {
                this.getRoleList(app);
                this.getUserList();
                this.showAppDetail(true);
            });
        }
    }
    handleApplyOpen(app) {
        OpenAppAction.openApp({
            params: {
                roleId: app.id
            }
        }).then(result => {
            if (result) {
                message.success(Intl.get('back.openApp.tip.success', '开通成功'));
            } else {
                message.error(Intl.get('back.openApp.tip.fail', '开通失败'));
            }
        });
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
    handleSubmit(index) {
        const addParmas = {
            'member_ids': [
                'string'
            ],
            'role_ids': [
                'string'
            ]
        };
        const delParams = {};
        OpenAppAction.editRoleToUsers(params, true);
    }
    handleSelectChange({ role_id }, value) {
        OpenAppAction.changeRoleUser({
            role_id,
            ids: value
        });
    }
    changeItemEdit(isShow, index, ) {
        OpenAppAction.changeRoleItemEdit({ isShow, index });
    }
    render() {
        const renderRoleFormItem = (role, index) => (
            <FormItem {...itemLayout} key={index} label={role.role_name}>
                <Select
                    multiple={true}
                    value={role.userList.map(x => x.user_id)}
                    onChange={this.handleSelectChange.bind(this, role)}
                    showSearch={true}
                    disabled={!role.showEdit || this.state.editRoleResult.loading}
                >
                    {
                        this.state.userList.data.map((user, index) => (
                            <Option key={index} value={user.user_id}>{user.nick_name || user.user_name}</Option>
                        ))
                    }
                </Select>
                <div className="role-item-btn-bar">
                    {
                        role.showEdit ?
                            <span className="">
                                <Icon type="check" onClick={this.handleSubmit.bind(this, index)} />
                                <Icon type="close" onClick={this.changeItemEdit.bind(this, false, index)} />
                            </span> :
                            <Icon type="edit" onClick={this.changeItemEdit.bind(this, true, index)} />
                    }
                </div>
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
                                <fieldset key={index} className={app.status === APP_STATUS.ENABLED ? 'app-container' : 'app-container disabled'}>
                                    <legend>{app.tags_name}</legend>
                                    <p>{app.tags_description}</p>
                                    <div className="btn-bar">
                                        {app.status === APP_STATUS.ENABLED ?
                                            <Button onClick={this.handleCheckDetail.bind(this, app)}>
                                                {Intl.get('call.record.show.customer.detail', '查看详情')}
                                            </Button> :
                                            <Button onClick={this.handleApplyOpen.bind(this, app)}>
                                                {Intl.get('back.openApp.apply', '申请开通')}
                                            </Button>}
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
                                            {Intl.get('back.openApp.range', '开通范围')}
                                        </h5>
                                        <StatusWrapper
                                            loading={this.state.roleList.loading || this.state.userList.loading}
                                            size='medium'
                                            errorMsg={this.state.roleList.errorMsg}
                                        >
                                            <div className="role-from-wrapper">
                                                {
                                                    this.state.roleList.data.map((role, index) => renderRoleFormItem(role, index))
                                                }
                                            </div>
                                        </StatusWrapper>
                                    </div>
                                    {/* <div className="btn-bar">
                                        <Button type="primary" onClick={this.handleSubmit.bind(this)}>{Intl.get('common.sure', '确定')}</Button>
                                        <Button onClick={this.handleCloseDetail.bind(this)}>{Intl.get('common.cancel', '取消')}</Button>
                                    </div> */}
                                </div>
                            </div> : null
                    }
                </RightPanel>
            </div>
        );

    }
}
module.exports = OpenApp;