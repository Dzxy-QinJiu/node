import {Button, Modal, Form, Icon, message} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;

require('./style/index.less');
import rightPanelUtil from 'CMP_DIR/rightPanel';

const RightPanel = rightPanelUtil.RightPanel;
import {RightPanelClose} from 'CMP_DIR/rightPanel/index';

const OpenAppAction = require('./action');
const OpenAppStore = require('./store');
const FormItem = Form.Item;
import StatusWrapper from 'CMP_DIR/status-wrapper';
import {USER_STATUS, APP_STATUS, MAX_PAGESIZE} from './consts';
const Spinner = require('CMP_DIR/spinner/index');
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';

const itemLayout = {
    labelCol: {span: 5},
    wrapperCol: {span: 18},
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
    };

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
        Modal.confirm({
            title: Intl.get('back.openApp.confirm', '确认要开通{appName}功能吗', {appName: app.tags_name}),
            onOk: () => {
                OpenAppAction.openApp({
                    params: {
                        roleId: app.role_id
                    }
                }).then(result => {
                    if (result) {
                        message.success(Intl.get('back.openApp.tip.success', '开通成功'));
                        OpenAppAction.changeAppStatus(app);
                    } else {
                        message.error(Intl.get('back.openApp.tip.fail', '开通失败'));
                    }
                }).catch(err => {
                    message.error((err && err.message) || Intl.get('back.openApp.tip.fail', '开通失败'));
                });
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
        const editRoleId = _.get(this.state.roleList, ['data', index, 'role_id']);
        const userList = _.get(this.state.roleList, ['data', index, 'userList']);
        const rawUserList = _.get(this.state.roleList, ['data', index, 'rawUserList']);
        const pubUserList = _.intersectionBy(userList, rawUserList, 'user_id');
        const addUsers = _.differenceBy(userList, pubUserList, 'user_id');
        const delUsers = _.differenceBy(rawUserList, pubUserList, 'user_id');
        const addParams = {
            'member_ids': addUsers.map(x => x.user_id),
            'role_ids': [editRoleId]
        };
        const delParams = {
            'member_ids': delUsers.map(x => x.user_id),
            'role_ids': [editRoleId]
        };
        const params = {};
        if (addParams.member_ids.length) {
            params.addParams = addParams;
        }
        if (delParams.member_ids.length) {
            params.delParams = delParams;
        }
        OpenAppAction.editRoleOfUsers({
            data: params
        }).then(({data}) => {
            if (data.success) {
                message.success(Intl.get('common.save.success', '保存成功'));
                this.changeItemEdit({
                    isShow: false,
                    index,
                    isSuccess: true
                });
            } else {
                message.error(Intl.get('common.save.failed', '保存失败'));
            }
        }).catch(err => {
            message.error((err && err.message) || Intl.get('common.save.failed', '保存失败'));
        });
    }

    handleSelectChange({role_id}, value) {
        OpenAppAction.changeRoleUser({
            role_id,
            ids: value
        });
    }

    //此处为防止event充当参数，所以把参数放到对象中
    changeItemEdit(params) {
        OpenAppAction.changeRoleItemEdit(params);
    }

    render() {
        const renderRoleFormItem = (role, index) => (
            <FormItem {...itemLayout} key={index} label={role.role_name}>
                <AntcSelect
                    multiple={true}
                    value={role.userList.map(x => x.user_id)}
                    onChange={this.handleSelectChange.bind(this, role)}
                    showSearch={true}
                    disabled={!role.showEdit || this.state.editRoleResult.loading}
                    filterOption={(input, option) => ignoreCase(input, option)}
                >
                    {
                        this.state.userList.data.map((user, index) => (
                            <Option key={index} value={user.user_id}>{user.nick_name || user.user_name}</Option>
                        ))
                    }
                </AntcSelect>
                <div className="role-item-btn-bar">
                    {
                        role.showEdit ?
                            <StatusWrapper
                                loading={this.state.editRoleResult.loading}
                                size='small'
                            >
                                <span className="">
                                    <Icon type="check" onClick={this.handleSubmit.bind(this, index)}/>
                                    <Icon type="close" onClick={this.changeItemEdit.bind(this, {
                                        isShow: false, index, isCancel: true
                                    })}/>
                                </span>
                            </StatusWrapper> :
                            <Icon type="edit" onClick={this.changeItemEdit.bind(this, {
                                isShow: true, index
                            })}/>
                    }
                </div>
            </FormItem>
        );
        return (
            <div className="open-app-wrapper">
                {this.state.appList.loading ? <Spinner className='open-app-loading'/> : this.state.appList.errorMsg ? (
                    <span className="">{this.state.appList.errorMsg}</span>) : _.get(this.state, 'appList.data[0]') ? (
                    <div className="">
                        {
                            this.state.appList.data.map((app, index) => (
                                <fieldset key={index}
                                    className={app.status === APP_STATUS.ENABLED ? 'app-container' : 'app-container disabled'}>
                                    <legend>{app.tags_name}</legend>
                                    <p>{app.tags_description}</p>
                                    {app.status === APP_STATUS.ENABLED ? null : (
                                        <div className="btn-bar">
                                            <Button onClick={this.handleApplyOpen.bind(this, app)}>
                                                {Intl.get('back.openApp.apply', '申请开通')}
                                            </Button>
                                        </div>
                                    )
                                    }
                                </fieldset>
                            ))
                        }
                    </div>) : <NoDataIconTip tipContent={Intl.get('user.no.product','暂无产品')}/>}
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
                                </div>
                            </div> : null
                    }
                </RightPanel>
            </div>
        );

    }
}

module.exports = OpenApp;