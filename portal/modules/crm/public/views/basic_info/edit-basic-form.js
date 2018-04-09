const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
import {Icon, Form, Input, Select, message, Button}from "antd";
import {AntcAreaSelection} from "antc";
var FormItem = Form.Item;
var CrmAction = require("../../action/crm-actions");
var crmUtil = require("../../utils/crm-util");
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import Trace from "LIB_DIR/trace";
import className from "classnames";
import CrmBasicAjax from "../../ajax/index";

var CRMAddForm = React.createClass({
    mixins: [Validation.FieldMixin],
    getInitialState: function () {
        return {
            status: {
                industry: {}//行业必填
            },
            isLoading: false,
            formData: this.getFormData(this.props.basicData),
            isLoadingIndustry: false//是否正在加载行业列表
        };
    },
    getFormData: function (basicData) {
        return {
            id: basicData.id,
            industry: basicData.industry,//行业
            province: basicData.province,
            city: basicData.city,
            county: basicData.county,
            address: basicData.address,//详细地址
            administrative_level: basicData.administrative_level,//行政区划
            remarks: basicData.remarks,//备注
        };
    },
    componentDidMount: function () {
        //获取后台管理中设置的行业列表
        this.setState({isLoadingIndustry: true});
        CrmAction.getIndustries(result => {
            let list = _.isArray(result) ? result : [];
            if (list.length > 0) {
                list = _.pluck(list, "industry");
            }
            this.setState({isLoadingIndustry: false, industryList: list});
        });
    },
    componentWillReceiveProps: function (nextProps) {
        this.refs.validation.reset();
        this.setState({
            formData: this.getFormData(nextProps.basicData),
        });
    },
    renderValidateStyle: function (item) {
        var formData = this.state.formData;
        var status = this.state.status;
        var arr = item.split(".");
        if (arr[1]) {
            status = status.contacts[0];
            item = arr[1];
        }

        var classes = className({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });

        return classes;
    },

    //更新地址
    updateLocation: function (address) {
        var location = address.split('/');
        this.state.formData.province = location[0] || "";
        this.state.formData.city = location[1] || "";
        this.state.formData.county = location[2] || "";
        Trace.traceEvent($(this.getDOMNode()).find("form div .ant-form-item"), "选择地址");
    },

    //提交修改
    handleSubmit: function (e) {
        e.preventDefault();
        var validation = this.refs.validation;
        validation.validate(valid => {
            if (!valid) return;
            let formData = this.state.formData;
            let submitData = {
                id: formData.id,
            };
            let oldData = this.props.basicData;
            //只提交修改过的选项
            //行政级别
            if (formData.administrative_level != oldData.administrative_level) {
                submitData.administrative_level = formData.administrative_level;
            }
            //行业
            if (formData.industry != oldData.industry) {
                submitData.industry = formData.industry;
            }
            //地域
            if (formData.province != oldData.province || formData.city != oldData.city || formData.county != oldData.county) {
                submitData.province = formData.province;
                submitData.city = formData.city;
                submitData.county = formData.county;
            }
            //详细地址
            if (formData.address != oldData.address) {
                submitData.address = formData.address;
            }
            //备注
            if (formData.remarks != oldData.remarks) {
                submitData.remarks = formData.remarks;
            }
            this.editBasicInfo(submitData);
        });
    },
    editBasicInfo: function (submitData) {
        this.setState({isLoading: true});
        CrmBasicAjax.editBasicInfo(submitData).then(result => {
            if (result) {
                this.props.setEditBasicFlag(false);
                //更新列表中的客户行业
                this.props.modifySuccess(submitData);
            }
        }, errorMsg => {
            this.setState({
                loading: false,
                submitErrorMsg: errorMsg || Intl.get("common.save.failed", "保存失败")
            });
        });
    },
    //添加客户
    addCustomer: function () {
        this.state.isLoading = true;
        this.setState(this.state);
        var formData = JSON.parse(JSON.stringify(this.state.formData));
        formData.name = $.trim(formData.name);
        formData.contacts0_phone = $.trim(formData.contacts0_phone);
        //去除表单数据中值为空的项
        commonMethodUtil.removeEmptyItem(formData);
        CrmAction.addCustomer(formData, result => {
            this.state.isLoading = false;
            if (result.code == 0) {
                message.success(Intl.get("user.user.add.success", "添加成功"));
                if (_.isFunction(this.props.addOne)) {
                    this.props.addOne();
                }
                this.setState(this.getInitialState());
                //拨打电话时，若客户列表中没有此号码，需添加客户
                if (_.isFunction(this.props.updateCustomer)) {
                    this.props.updateCustomer(result.result)
                }
            } else {
                message.error(result);
                this.setState(this.state);
            }
        });
    },

    closeAddPanel: function () {
        this.setState(this.getInitialState());
        this.props.hideAddForm();
    },

    handleRemarkInput: function (e) {
        Trace.traceEvent(e, "添加备注");
    },
    handleSelect: function () {
        Trace.traceEvent($(this.getDOMNode()).find("form div .ant-form-item label[for='industry']").next("div"), "选择行业");
    },
    handleRoleSelect: function () {
        Trace.traceEvent($(this.getDOMNode()).find("form div .ant-form-item label[for='role']").next("div"), "选择角色");
    },
    getAdministrativeLevelOptions: function () {
        let options = crmUtil.administrativeLevels.map(obj => {
            return (<Option key={obj.id} value={obj.id}>{obj.level}</Option>)
        });
        options.unshift(<Option key="" value="">&nbsp;</Option>);
        return options;
    },

    handleCancel: function (e) {
        this.props.setEditBasicFlag(false);
        Trace.traceEvent(e, "取消对客户基本信息的修改");
    },
    renderButtons() {
        return (
            <div className="button-container">
                <Button className="button-save" type="primary"
                        onClick={this.handleSubmit.bind(this)}>
                    {Intl.get("common.save", "保存")}
                </Button>
                <Button className="button-cancel" onClick={this.handleCancel.bind(this)}>
                    {Intl.get("common.cancel", "取消")}
                </Button>
                {this.state.loading ? (
                    <Icon type="loading" className="save-loading"/>) : this.state.saveErrorMsg ? (
                    <span className="save-error">{this.state.saveErrorMsg}</span>
                ) : null}
            </div>
        );
    },
    render: function () {
        var formData = this.state.formData;
        var status = this.state.status;
        let industryList = this.state.industryList || [];
        //行业下拉列表
        var industryOptions = industryList.map(function (industry, index) {
            return (<Option key={index} value={industry}>{industry}</Option>);
        });
        let level = crmUtil.filterAdministrativeLevel(formData.administrative_level);
        const formItemLayout = {
            labelCol: {
                span: 4
            },
            wrapperCol: {
                span: 20
            }
        };
        return (
            <Form horizontal className="basic-info-edit-form">
                <Validation ref="validation" onValidate={this.handleValidate}>
                    <FormItem
                        label={Intl.get("crm.administrative.level", "行政级别")}
                        colon={false}
                        {...formItemLayout}
                    >
                        <Select placeholder={Intl.get("crm.administrative.level.placeholder", "请选择行政级别")}
                                name="administrative_level"
                                onChange={this.setField.bind(this, 'administrative_level')}
                                value={level}
                        >
                            {this.getAdministrativeLevelOptions()}
                        </Select>
                    </FormItem >
                    <FormItem
                        label={Intl.get("realm.industry", "行业")}
                        id="industry"
                        {...formItemLayout}
                        validateStatus={this.renderValidateStyle('industry')}
                        help={status.industry.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.industry.errors && status.industry.errors.join(','))}
                    >
                        {this.state.isLoadingIndustry ? (
                            <div className="industry-list-loading"><ReactIntl.FormattedMessage id="crm.88"
                                                                                               defaultMessage="正在获取行业列表"/><Icon
                                type="loading"/></div>) : (
                            <Validator
                                rules={[{required: true, message: Intl.get("crm.22", "请选择行业")}]}>
                                <Select showSearch placeholder={Intl.get("crm.22", "请选择行业")} name="industry"
                                        searchPlaceholder={Intl.get("crm.89", "输入行业进行搜索")}
                                        optionFilterProp="children"
                                        notFoundContent={!industryList.length ? Intl.get("crm.24", "暂无行业") : Intl.get("crm.23", "无相关行业")}
                                        onChange={this.setField.bind(this, 'industry')}
                                        value={formData.industry}
                                        onSelect={(e) => {
                                            this.handleSelect(e)
                                        }}
                                >
                                    {industryOptions}
                                </Select>
                            </Validator>)}
                    </FormItem >
                    <AntcAreaSelection labelCol="4" wrapperCol="20" width="432" label={Intl.get("realm.address", "地址")}
                                       placeholder={Intl.get("crm.address.placeholder", "请选择地域")}
                                       prov={formData.province} city={formData.city}
                                       county={formData.county} updateLocation={this.updateLocation}/>
                    <FormItem
                        label=" "
                        colon={false}
                        {...formItemLayout}
                    >
                        <Input name="address" value={formData.address}
                               placeholder={Intl.get("crm.detail.address.placeholder", "请输入详细地址")}
                               onChange={this.setField.bind(this, 'address')}
                        />
                    </FormItem>
                    < FormItem
                        label={Intl.get("common.remark", "备注")}
                        id="remarks"
                        {...formItemLayout}
                    >
                        <Input type="textarea" id="remarks" rows="3" value={formData.remarks}
                               onChange={this.setField.bind(this, 'remarks')}
                               onBlur={(e) => {
                                   this.handleRemarkInput(e)
                               }}
                        />
                    </FormItem>
                    {this.renderButtons()}
                </Validation>
            </Form>
        );
    }
});
module.exports = CRMAddForm;
