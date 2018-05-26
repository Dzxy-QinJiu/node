const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
var Form = require("antd").Form;
var Input = require("antd").Input;
var Icon = require("antd").Icon;
var Select = require("antd").Select;
var Option = Select.Option;
var FormItem = Form.Item;
var AlertTimer = require("../../../../components/alert-timer");
var Spinner = require("../../../../components/spinner");
var rightPanelUtil = require("../../../../components/rightPanel");
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
var RightPanelCancel = rightPanelUtil.RightPanelCancel;
var RightPanelReturn = rightPanelUtil.RightPanelReturn;
var HeadIcon = require("../../../../components/headIcon");
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var AppFormStore = require("../store/app-form-store");
var AppFormAction = require("../action/app-form-actions");
var classNames = require("classnames");
var language = require("../../../../public/language/getLanguage");
import Trace from "LIB_DIR/trace";

if (language.lan() == "es" || language.lan() == "en") {
    require("../css/index-es_VE.less");
}else if (language.lan() == "zh"){
    require("../css/index-zh_CN.less");
}
function noop() {
}

var AppForm = React.createClass({
    mixins: [Validation.FieldMixin],
    getDefaultProps: function() {
        return {
            submitAppForm: noop,
            app: {
                id: '',
                name: '',
                appUrl: '',
                owner: '',
                descr: ''
            }
        };
    },

    formatAppInfo: function(app) {
        let managers = [];
        if (_.isArray(app.managers) && app.managers.length) {
            managers = _.pluck(app.managers, "managerId");
        }
        return {
            id: app.id,
            name: app.name,
            image: app.image,
            appUrl: app.appUrl,
            owner: app.ownerId,
            managers: managers,
            secretApp: app.secretAppId,
            descr: app.descr,
            tags: app.tags
        };
    },

    getInitialState: function() {
        var appInfo = this.formatAppInfo(this.props.app);
        return {
            ...AppFormStore.getState(),
            status: {
                name: {},
                appUrl: {},
                owner: {},
                managers: {},
                secretApp: {},
                descr: {}
            },
            formData: appInfo,
            appTagList: this.props.appTagList || []//应用的标签列表
        };
    },

    componentWillReceiveProps: function(nextProps) {
        var appInfo = this.formatAppInfo(nextProps.app);
        this.refs.validation.reset();
        this.setState({
            formData: appInfo,
            appTagList: nextProps.appTagList || []//应用的标签列表
        });
    },
    onChange: function() {
        this.setState(AppFormStore.getState());
    },
    componentWillUnmount: function() {
        AppFormStore.unlisten(this.onChange);
    },
    componentDidMount: function() {
        var _this = this;
        AppFormStore.listen(_this.onChange);
        _this.layout();
        $(window).resize(function(e) {
            e.stopPropagation();
            _this.layout();
        });
    },

    layout: function() {
        var bHeight = $("body").height();
        var formHeight = bHeight - $("form .head-image-container").outerHeight(true);
        $(".app-form-scroll").height(formHeight);
    },

    componentDidUpdate: function() {
        if (this.state.formData.id) {
            this.refs.validation.validate(noop);
        }
    },

    renderValidateStyle: function(item) {
        var formData = this.state.formData;
        var status = this.state.status;

        var classes = classNames({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });

        return classes;
    },

    handleCancel: function(e) {
        e.preventDefault();
        if (this.props.formType == "edit") {
            Trace.traceEvent(e, '返回应用详情界面');
            this.props.returnInfoPanel();
        } else {
            Trace.traceEvent(e, '点击取消按钮');
            this.props.closeRightPanel();
        }
    },

    handleSubmit: function(e) {
        e.preventDefault();
        Trace.traceEvent(e, '点击保存按钮');
        var validation = this.refs.validation;
        var _this = this;
        validation.validate(function(valid) {
            if (!valid) {
                return;
            } else {
                var app = $.extend(true, {}, _this.state.formData);
                //未选择所有者时，去掉该项，不传
                if (!app.owner) {
                    delete app.owner;
                }
                app.managers = JSON.stringify(app.managers);
                app.tags = JSON.stringify(app.tags);
                //设置正在保存中
                AppFormAction.setSaveFlag(true);
                if (_this.props.formType == "add") {
                    Trace.traceEvent(e, '关闭添加应用界面');
                    AppFormAction.addApp(app);
                } else {
                    Trace.traceEvent(e, '返回应用详情界面');
                    AppFormAction.editApp(app);
                }

            }
        });
    },

    uploadImg: function(src) {
        Trace.traceEvent($(this.getDOMNode()).find(".head-image-container"),"上传头像");
        var formData = this.state.formData;
        formData.image = src;
        this.setState({formData: formData});
    },

    //关闭
    closePanel: function(e) {
        Trace.traceEvent(e, '点击关闭按钮');
        this.props.closeRightPanel();
    },

    //返回详细信息展示页
    returnInfoPanel: function(e) {
        Trace.traceEvent(e, '返回应用详情界面');
        this.props.returnInfoPanel();
    },

    //去掉保存后提示信息
    hideSaveTooltip: function() {
        AppFormAction.resetSaveResult(this.props.formType, this.state.saveResult);
    },
    //下拉列表的渲染
    renderSelectOptions: function(isManager) {
        var options = '';
        var userList = this.state.appOwnerList;
        if (isManager) {
            userList = this.state.appManagerList;
        }
        var managers = this.state.formData.managers;
        if (_.isArray(userList) && userList.length > 0) {
            options = userList.map(function(user) {
                var className = "";
                if (isManager) {
                    //管理员（多选）选择后，从下拉列表中去掉已选的选项
                    if (_.isArray(managers) && managers.length > 0) {
                        managers.forEach(function(manager) {
                            if (manager == user.userId) {
                                className = "manager-options-selected";
                            }
                        });
                    }
                }
                return (<Option className={className} key={user.userId} value={user.userId}>
                    {user.nickName}
                </Option>);
            });
        } else {
            options = <Option disabled value="">{isManager ? Intl.get("app.app.no.managers", "暂无管理员") : Intl.get("app.app.no.owner", "暂无所有者")}</Option>;
        }
        return options;
    },
    //渲染密令APP的下拉列表
    renderSecretAppOptions: function() {
        var options = '';
        var appList = this.state.allAppList;
        if (_.isArray(appList) && appList.length > 0) {
            options = appList.map(function(app) {
                return (<Option key={app.id} value={app.id}>
                    {app.name}
                </Option>);
            });
        } else {
            options = <Option disabled value="">{Intl.get("app.app.no.secret", "暂无密令APP")}</Option>;
        }
        return options;
    },
    //按enter键添加标签
    addTag: function(e) {
        if (e.keyCode !== 13) return;

        const tag = e.target.value.trim();
        Trace.traceEvent(e, '按enter键添加标签');
        if (!tag) return;

        this.toggleTag(tag, true);
        //清空输入框
        this.refs.newTag.refs.input.value = "";
    },
    //标签的选中与取消处理
    toggleTag: function(tag, isAdd) {
        let tags = this.state.formData.tags || [];
        if (tags.indexOf(tag) > -1) {
            if (isAdd) return;
            Trace.traceEvent($(this.getDOMNode()).find(".block-tag-edit"),"点击取消标签");
            tags = tags.filter(theTag => theTag != tag);
            this.state.formData.tags = tags;
        } else {
            if(!isAdd) {
                Trace.traceEvent($(this.getDOMNode()).find(".block-tag-edit"),"点击选中标签");
            }
            tags.push(tag);
            this.state.formData.tags = tags;

            if (this.state.appTagList.indexOf(tag) === -1) {
                this.state.appTagList.push(tag);
            }
        }

        this.setState(this.state);
    },
    //渲染标签列表
    renderAppTagList: function() {
        var selectedTagsArray = this.state.formData.tags || [];
        var appTagList = _.isArray(this.state.appTagList) ? this.state.appTagList : [];
        var unionTagsArray = _.union(appTagList, selectedTagsArray);
        var tagsJsx = "";
        if (_.isArray(unionTagsArray) && unionTagsArray.length > 0) {
            var _this = this;
            tagsJsx = unionTagsArray.map(function(tag, index) {
                let className = "app-tag";
                className += selectedTagsArray.indexOf(tag) > -1 ? " tag-selected" : "";
                return (<span key={index} onClick={() => _this.toggleTag(tag)} className={className}>{tag}</span>);
            });
        }
        return tagsJsx;
    },

    // 选择所有者、管理员、密令APP
    handleSelect(type) {
        if (type == 'owner') {
            Trace.traceEvent($(this.getDOMNode()).find(".app-form-scroll"),"选择所有者");
        } else if(type == 'managers') {
            Trace.traceEvent($(this.getDOMNode()).find(".app-form-scroll"),"选择管理员");
        } else if (type == 'secretApp') {
            Trace.traceEvent($(this.getDOMNode()).find(".app-form-scroll"),"选择密令APP");
        }
    },

    render: function() {
        var formData = this.state.formData;
        var status = this.state.status;
        var className = "right-panel-content";
        let traceName = '';
        if (this.props.appFormShow) {
            if (this.props.formType == "add") {
                className += " right-form-add";
                traceName = '添加应用界面';
            } else {
                className += " right-panel-content-slide";
                traceName = '编辑应用界面';
            }
        }
        let labelCol = (language.lan() == 'zh' ? 4 : 6);
        //保存成功失败的结果
        var saveResult = this.state.saveResult;
        var logoDescr = 'Logo';
        return (
            <div className={className} data-tracename={traceName}>
                <RightPanelClose onClick={this.closePanel}/>
                {(this.props.formType == "add" || !this.props.appFormShow) ? null : (
                    <RightPanelReturn onClick={this.returnInfoPanel}/>)}
                <Form horizontal className="form" autoComplete="off">
                    <HeadIcon headIcon={formData.image}
                        iconDescr={formData.name || logoDescr}
                        upLoadDescr={logoDescr}
                        isEdit={true}
                        isUserHeadIcon={true}
                        onChange={this.uploadImg}/>
                    <Input type="hidden" name="image" id="image" value={formData.image}/>
                    <div className="app-form-scroll">
                        <GeminiScrollbar className="geminiScrollbar-vertical">
                            <Validation ref="validation" onValidate={this.handleValidate}>
                                <FormItem
                                    label={Intl.get("common.definition", "名称")}
                                    id="appName"
                                    labelCol={{span: labelCol}}
                                    wrapperCol={{span: 12}}
                                    validateStatus={this.renderValidateStyle('name')}
                                    help={status.name.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.name.errors && status.name.errors.join(','))}
                                >
                                    <Validator
                                        rules={[{required: true, min: 1, max: 20 , message: Intl.get("common.input.character.prompt", "最少1个字符,最多20个字符")}]}>
                                        <Input name="name" id="name" value={formData.name}
                                            placeholder={Intl.get("common.required.tip", "必填项*")}
                                            onChange={this.setField.bind(this, 'name')}
                                        />
                                    </Validator>
                                </FormItem>

                                <FormItem
                                    label="URL"
                                    id="appUrl"
                                    labelCol={{span: labelCol}}
                                    wrapperCol={{span: 12}}
                                >
                                    <Input name="appUrl" id="appUrl" value={formData.appUrl}
                                        onChange={this.setField.bind(this, 'appUrl')}/>
                                </FormItem>
                                <FormItem
                                    label={Intl.get("common.tag", "标签")}
                                    labelCol={{span: labelCol}}
                                    wrapperCol={{span: 12}}
                                >
                                    <div className="block-tag-edit">
                                        {this.renderAppTagList()}
                                    </div>
                                    <div>
                                        <Input placeholder={Intl.get("app.tag.placeholder", "按Enter键添加新标签")} ref="newTag"
                                            onKeyUp={this.addTag}
                                        />
                                    </div>
                                </FormItem>
                                <FormItem
                                    label={Intl.get("common.owner", "所有者")}
                                    id="owner"
                                    labelCol={{span: labelCol}}
                                    wrapperCol={{span: 12}}
                                    validateStatus={this.renderValidateStyle('owner')}
                                    help={status.owner.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.owner.errors && status.owner.errors.join(','))}
                                >
                                    {this.state.isLoadingOwnerList ? (
                                        <div className="user-list-loading"><ReactIntl.FormattedMessage id="app.app.get.owner.list" defaultMessage="正在获取所有者列表" /><Icon type="loading"/></div>) : (
                                        <Validator rules={[{required: true,message: Intl.get("app.app.owner.placeholder", "请选择所有者")}]}>
                                            <Select showSearch name="owner" id="owner" placeholder={Intl.get("app.app.owner.placeholder", "请选择所有者")}
                                                value={formData.owner}
                                                optionFilterProp="children" notFoundContent={Intl.get("common.no.match", "暂无匹配项")}
                                                searchPlaceholder={Intl.get("app.app.owner.search.placeholder", "输入名称进行过滤")}
                                                onChange={this.setField.bind(this, 'owner')}
                                                onSelect={this.handleSelect.bind(this, 'owner')}
                                            >
                                                {this.renderSelectOptions()}
                                            </Select>
                                        </Validator>)}
                                </FormItem>

                                <FormItem
                                    label={Intl.get("common.managers", "管理员")}
                                    id="managers"
                                    labelCol={{span: labelCol}}
                                    wrapperCol={{span: 12}}
                                    validateStatus={this.renderValidateStyle('managers')}
                                    help={status.managers.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.managers.errors && status.managers.errors.join(','))}
                                >
                                    {this.state.isLoadingManagerList ? (
                                        <div className="user-list-loading"><ReactIntl.FormattedMessage id="app.app.get.managers.list" defaultMessage="正在获取管理员列表" /><Icon type="loading"/></div>) : (
                                        <Select className="" multiple name="managers" id="managers"
                                            optionFilterProp="children"
                                            searchPlaceholder={Intl.get("app.app.managers.placeholder", "请选择管理员*")}
                                            notFoundContent={Intl.get("common.no.match", "暂无匹配项")}
                                            value={formData.managers}
                                            onChange={this.setField.bind(this, 'managers')}
                                            onSelect={this.handleSelect.bind(this, 'managers')}
                                        >
                                            {this.renderSelectOptions(true)}
                                        </Select>)}
                                </FormItem>
                                <FormItem
                                    label={Intl.get("common.secret.app", "密令APP")}
                                    id="secretApp"
                                    labelCol={{span: labelCol}}
                                    wrapperCol={{span: 12}}
                                >
                                    {this.state.isLoadingAllAppList ? (
                                        <div className="app-list-loading"><ReactIntl.FormattedMessage id="app.app.get.secret.list" defaultMessage="正在获取密令APP列表" /><Icon type="loading"/></div>) : (
                                        <Select showSearch name="secretApp" id="secretApp"
                                            placeholder={Intl.get("app.app.secret.placeholder", "请选择密令APP")}
                                            value={formData.secretApp}
                                            optionFilterProp="children" notFoundContent={Intl.get("common.no.match", "暂无匹配项")}
                                            searchPlaceholder={Intl.get("app.app.secret.search.placeholder", "请输入应用名称进行过滤")}
                                            onChange={this.setField.bind(this, 'secretApp')}
                                            onSelect={this.handleSelect.bind(this, 'secretApp')}
                                        >
                                            {this.renderSecretAppOptions()}
                                        </Select>)}
                                </FormItem>
                                <FormItem
                                    label={Intl.get("common.describe", "描述")}
                                    id="descr"
                                    labelCol={{span: labelCol}}
                                    wrapperCol={{span: 18}}
                                    validateStatus={this.renderValidateStyle('descr')}
                                >
                                    <Input type="textarea" id="descr" rows="3" value={formData.descr}
                                        onChange={this.setField.bind(this, 'descr')}
                                    />
                                </FormItem>

                                <FormItem
                                    wrapperCol={{span: 22}}>
                                    <div className="indicator">
                                        {saveResult ?
                                            (
                                                <AlertTimer time={saveResult == "error" ? 3000 : 600}
                                                    message={this.state.saveMsg}
                                                    type={this.state.saveResult} showIcon
                                                    onHide={this.hideSaveTooltip}/>
                                            ) : ""
                                        }
                                    </div>
                                    <RightPanelCancel onClick={this.handleCancel}>
                                        <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                                    </RightPanelCancel>
                                    <RightPanelSubmit onClick={this.handleSubmit}>
                                        <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存" />
                                    </RightPanelSubmit>
                                </FormItem>
                            </Validation>
                        </GeminiScrollbar>
                    </div>
                    {this.state.isSaving ? (<div className="right-pannel-block">
                        <Spinner className="right-panel-saving"/>
                    </div>) : null}
                </Form>
            </div>
        );
    }
});

module.exports = AppForm;
