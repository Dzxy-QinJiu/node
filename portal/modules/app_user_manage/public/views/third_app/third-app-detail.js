require('../../css/third-app-detail.less');
import { Button, Select, Form, Input, message, Spin, Checkbox, Tabs, Icon, Alert, DatePicker } from 'antd';
var ThirdAppDetailActions = require('../../action/third-app-detail-actions');
var AlertTimer = require('CMP_DIR/alert-timer');
import Spinner from 'CMP_DIR/spinner';
import DefaultUserLogoTitle from 'CMP_DIR/default-user-logo-title';
var AppUserPanelSwitchAction = require('../../action/app-user-panelswitch-actions');
var ThirdAppDetailStore = require ('../../store/third-app-detail-store');
import { RightPanelClose, RightPanelReturn } from 'CMP_DIR/rightPanel';
import AppUserUtil from '../../util/app-user-util';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import OperationStepsFooter from 'CMP_DIR/user_manage_components/operation-steps-footer';
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';
var PrivilegeChecker = require('CMP_DIR/privilege/checker').PrivilegeChecker;
var HeadIcon = require('CMP_DIR/headIcon');
const FormItem = Form.Item;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const TabPane = Tabs.TabPane;
import Trace from 'LIB_DIR/trace';
const status = {
    add: '添加',
    edit: '编辑'
};
//记录上下留白布局
const LAYOUT = {
    TAB_TOP_HEIGHT: 66,
    TAB_BOTTOM_PADDING: 60
};

const itemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
};

class ThirdAppEdit extends React.Component {
    constructor(props) {
        super(props);
        //根据是否传入appId判断是否是添加状态
        props.appId ? ThirdAppDetailActions.changePanelStatus('display') : ThirdAppDetailActions.changePanelStatus('add');        
        this.state = {
            ...ThirdAppDetailStore.getState(),
            appId: props.appId || '',
            userId: props.userId || ''
        };
        this.onStoreChange = this.onStoreChange.bind(this);
    }
    componentDidMount() {
        ThirdAppDetailStore.listen(this.onStoreChange);     
        ThirdAppDetailActions.getPlatforms();   
        if(this.state.status !== 'add') {
            this.getAppDetail();           
        }
    }
    
    //获取应用详情
    getAppDetail() {
        ThirdAppDetailActions.getAppDetail({id: this.state.appId});
    }
    displayOnly() {
        if (this.state.status === 'display') {
            return true;
        }
        else {
            return false;
        }
    }
    onStoreChange() {
        this.setState(
            ThirdAppDetailStore.getState()
        );
    }
    //修改当前面板状态 edit 编辑
    changeStatus(panelStatus) {
        if (panelStatus == 'display') {
            Trace.traceEvent('第三方应用配置详情', '返回第三方应用配置详情');
        }
        if (panelStatus == 'edit') {
            Trace.traceEvent('第三方应用配置详情', '修改第三方应用');
        }
        ThirdAppDetailActions.changePanelStatus(panelStatus);
    }
    //修改当前app使用状态 disable enable
    changeAppStatus(appStatus) {
        if(this.state.result.changeAppStatus == 'loading') {
            return;
        }
        ThirdAppDetailActions.changeAppStatus({
            id: this.state.app.id,
            status: appStatus,
            userId: this.props.userId
        });
    }
    cancel() {
        if (this.state.submitResult === 'loading' || this.state.submitResult === 'success') {
            return;
        }
        //返回展示详情状态
        this.changeStatus('display');
    }   
    closeRightPanel() {        
        Trace.traceEvent(ReactDOM.findDOMNode(this.footer), '取消' + status[this.state.status] + '第三方应用');
        AppUserPanelSwitchAction.resetState();
        //面板向右滑
        AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT);
        ThirdAppDetailActions.resetState();
    }
    onSubmit() {
        if(this.state.result.addApp == 'loading' || this.state.result.editApp == 'loading') {
            return;
        }
        Trace.traceEvent('第三方应用配置详情', '确认' + status[this.state.status] + '第三方应用');
        this.props.form.validateFields((err, val) => {
            if (err) {
                return;
            }           
            let {app} = val;
            app.logo = this.state.app.logo || '';
            app.user_id = this.props.userId;
            if(app.create_time) {
                app.create_time = app.create_time.toISOString();
            }
            if (this.state.status == 'edit') {
                app.id = this.props.appId;
                ThirdAppDetailActions.editApp(app);
            }
            if (this.state.status == 'add') {
                ThirdAppDetailActions.addApp(app);
            }              
        });
    }
    uploadImg(img) {
        this.state.app.logo = img;
        this.setState(this.state);
    }
    renderIndicator() {        
        let error = null;
        _.each(this.state.errMsg,(value, key) => {
            if(value != '') {
                error = value;
            }
        });
        if(error) {
            return (
                <div className="alert-timer">
                    <Alert message={error} type="error" showIcon />
                </div>
            );
        }
        return null;
    }
    renderForm() {
        const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
        const height = $(window).height() - LAYOUT.TAB_TOP_HEIGHT - LAYOUT.TAB_BOTTOM_PADDING;
        var logoDescr = 'Logo';
        if(this.state.result.getAppDetail === 'loading') {
            return (
                <Spinner />
            );
        }  
        return (            
            <GeminiScrollBar style={{ height }}>                
                {this.displayOnly() ?
                    <DefaultUserLogoTitle
                        nickName={this.state.app.name}
                        userLogo={this.state.app.logo}
                    /> : 
                    <HeadIcon 
                        headIcon={this.state.app.logo}
                        upLoadDescr={logoDescr}
                        isEdit={this.state.status !== 'display'}
                        isUserHeadIcon={true}
                        onChange={this.uploadImg.bind(this)}
                    />}
                <FormItem {...itemLayout} label={Intl.get('common.app.name', '应用名称')}>
                    {
                        this.displayOnly() ? this.state.app.name : getFieldDecorator('app.name', {
                            initialValue: this.state.app && this.state.app.name,
                            rules: [{ required: true, message: Intl.get('user.third.thirdapp.name.reuqired', '请填写应用名称') }]
                        })(
                            <Input />
                        )
                    }
                </FormItem>
                <FormItem {...itemLayout} className="fix" label={Intl.get('user.third.thirdapp.platform', '应用平台')}>
                    {
                        this.displayOnly() ? this.state.app.platform : getFieldDecorator('app.platform', {
                            initialValue: this.state.app && this.state.app.platform,
                            rules: [{ required: true, message: Intl.get('user.third.thirdapp.platform.reuqired', '请选择或填写应用平台') }]
                        })(
                            <Select combobox
                                filterOption={(input, option) => ignoreCase(input, option)}
                                searchPlaceholder={Intl.get('user.third.thirdapp.platform.reuqired', '请选择或填写应用平台')}
                            >
                                {
                                    this.state.platforms.map((item, idx) => {
                                        return (<Option key={idx} value={item}>{item}</Option>);
                                    })
                                }
                            </Select>
                        )
                    }
                    
                </FormItem>
                <FormItem {...itemLayout} label="APP Key">
                    {
                        this.displayOnly() ? this.state.app.app_key : getFieldDecorator('app.app_key', {
                            initialValue: this.state.app && this.state.app.app_key,
                            rules: [{ required: true, message: Intl.get('user.third.thirdapp.platform.reuqired', '请填写APP Key') }]
                        })(
                            <Input />
                        )
                    }
                </FormItem>
                <FormItem {...itemLayout} label="APP Secret">
                    {
                        this.displayOnly() ? this.state.app.app_secret : getFieldDecorator('app.app_secret', {
                            initialValue: this.state.app && this.state.app.app_secret,
                            rules: [{ required: true, message: Intl.get('user.third.thirdapp.secret.reuqired', '请填写APP Secret') }]
                        })(
                            <Input />
                        )
                    }
                </FormItem>
                <FormItem {...itemLayout} label={Intl.get('user.third.thirdapp.cb', '回调地址')}>
                    {
                        this.displayOnly() ? this.state.app.redirect_uri : getFieldDecorator('app.redirect_uri', {
                            initialValue: this.state.app && this.state.app.redirect_uri
                        })(
                            <Input />
                        )
                    }
                </FormItem>
                { this.displayOnly() ? 
                    <FormItem {...itemLayout} label={Intl.get('member.create.time', '创键时间')}>
                        {
                            this.state.app.create_time
                        }
                    </FormItem> : null }
                <FormItem {...itemLayout} label={Intl.get('user.third.thirdapp.des', '应用简介')}>
                    {
                        this.displayOnly() ? this.state.app.about : getFieldDecorator('app.about', {
                            initialValue: this.state.app && this.state.app.about
                        })(
                            <textarea className="fix"/>
                        )
                    }
                </FormItem>   
                {this.renderIndicator()}             
            </GeminiScrollBar>
        );
    }
    renderStatusBtn() { 
        return (
            this.state.app.status === 'enable' ?
                <div className="circle-button iconfont icon-forbid app_user_manage_rightpanel right-pannel-default status-btn"
                    title={Intl.get('user.status.stop', '停用')}
                    data-tracename="停用应用"
                    onClick={this.changeAppStatus.bind(this, 'disable')}
                ></div> :
                <div className="circle-button iconfont icon-choose app_user_manage_rightpanel right-pannel-default status-btn"
                    data-tracename="启用应用"
                    title={Intl.get('common.enabled', '启用')}
                    onClick={this.changeAppStatus.bind(this, 'enable')}
                ></div>
        );        
    }
    render() {        
        return (
            <div className="user-manage-v2 user-detail-edit-app-v2" id="third-app-detail-wrapper" data-tracename="第三方应用配置详情">                
                <PrivilegeChecker check={'THIRD_PARTY_MANAGE'}>
                    { this.state.status === 'add' ? null : this.renderStatusBtn() }
                    {
                        this.displayOnly() ?
                            <div className="icon-update circle-button iconfont app_user_manage_rightpanel right-pannel-default"
                                title={Intl.get('third.party.app.edit', '配置开放平台应用')}
                                onClick={this.changeStatus.bind(this, 'edit')}
                                style={{ right: '62px', top: '18px' }}
                            ></div>
                            : this.state.status === 'edit' ? <RightPanelReturn onClick={this.cancel.bind(this)} /> : null
                    }
                </PrivilegeChecker>
                <RightPanelClose onClick={this.closeRightPanel.bind(this)} />
                <Tabs defaultActiveKey="editapp">
                    <TabPane tab={this.state.app.name || Intl.get('third.party.app.add', '添加开放平台应用')} key="editapp">
                        {this.renderForm()}
                    </TabPane>
                </Tabs>
                {this.displayOnly() ? null :
                    <OperationStepsFooter
                        ref={footer => this.footer = footer}
                        currentStep={2}
                        prevText={Intl.get('common.cancel', '取消')}
                        finishText={Intl.get('common.confirm', '确认')}
                        onStepChange={this.closeRightPanel.bind(this)}
                        onFinish={this.onSubmit.bind(this)}
                    ></OperationStepsFooter>}
            </div>
        );
    }
}
const ThirdAppDetail = Form.create()(ThirdAppEdit);

export default ThirdAppDetail;