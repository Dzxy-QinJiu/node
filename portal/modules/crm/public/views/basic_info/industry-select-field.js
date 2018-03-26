const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
import {Icon, Alert, Select, Form} from 'antd';
let FormItem = Form.Item;
let Option = Select.Option;
let CrmAction = require('../../action/crm-actions');
import FieldMixin from '../../../../../components/antd-form-fieldmixin';
let CrmBasicAjax = require("../../ajax/index");
import Trace from "LIB_DIR/trace";

var IndustrySelectField = React.createClass({
    mixins: [FieldMixin],
    componentDidMount: function () {
        this.getIndustryList();
    },
    getDefaultProps: function () {
        return {
            list: [],
            onChange: function () {
            },
            onModifySuccess: function () {
            }
        };
    },
    getInitialState: function () {
        return {
            loading: false,//正在保存
            displayType: "text",
            disabled: this.props.disabled,
            isMerge: this.props.isMerge,
            customerId: this.props.customerId,
            isLoadingList: false,//正在获取下拉列表中的数据
            formData: {
                industry: this.props.industry
            },
            status: {
                industry: {}
            },
            submitErrorMsg: ''
        };
    },
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.customerId != this.state.customerId) {
            //切换客户时，重新设置state数据
            let stateData = this.getInitialState();
            stateData.isMerge = nextProps.isMerge;
            stateData.customerId = nextProps.customerId;
            stateData.formData.industry = nextProps.industry;
            stateData.disabled = nextProps.disabled;
            this.setState(stateData);
        }
    },
    getIndustryList: function () {
        //获取后台管理中设置的行业列表
        this.setState({isLoadingList: true});
        CrmAction.getIndustries(result=> {
            let list = _.isArray(result) ? result : [];
            if (list.length > 0) {
                list = _.pluck(list, "industry");
            }
            this.setState({isLoadingList: false, list: list});
        });
    },
    getSelectOptions: function () {
        var list = this.state.list.map((item, i) => {
            return (<Option key={i} value={item}>{item}</Option>);
        });
        return list;
    },
    getSelectedText: function () {
        var target = _.find(this.state.list, (item) => {
            return item == this.state.formData.industry;
        });
        return target ? target : <span>&nbsp;</span>;
    },
    changeDisplayType: function (type) {
        if (type === 'text') {
            Trace.traceEvent(this.getDOMNode(),"取消对行业的修改");
            this.state.formData.industry = this.props.industry;
            this.setState({
                formData: this.state.formData,
                displayType: type,
                submitErrorMsg: ""
            });
        } else {
            Trace.traceEvent(this.getDOMNode(),"设置行业");
            this.setState({
                displayType: type,
                submitErrorMsg: "",
                loading: false
            });
        }

    },
    //回到展示状态
    backToDisplay: function () {
        this.setState({
            loading: false,
            displayType: 'text',
            submitErrorMsg: ''
        });
    },
    handleSubmit: function () {
        var validation = this.refs.validation;
        if (this.state.loading) {
            return;
        }
        if(this.state.formData.industry == this.props.industry){
            this.backToDisplay();
            return;
        }
        validation.validate(valid=> {
            if (!valid) {
                return;
            } else {
                let submitData = {
                    id: this.state.customerId,
                    type: "industry",
                    industry: this.state.formData.industry
                };
                Trace.traceEvent(this.getDOMNode(),"保存对行业的修改");
                if (this.props.isMerge) {
                    this.props.updateMergeCustomer(submitData);
                    this.backToDisplay();
                } else {
                    this.setState({loading: true});
                    CrmBasicAjax.updateCustomer(submitData).then(result=> {
                        if (result) {
                           this.backToDisplay();
                            //更新列表中的客户行业
                            this.props.modifySuccess(submitData);
                        }
                    }, errorMsg=> {
                        this.setState({
                            loading: false,
                            submitErrorMsg: errorMsg || Intl.get("crm.162", "修改客户行业失败")
                        });
                    });
                }
            }
        });
    },
    handleSelect: function () {
       Trace.traceEvent(this.getDOMNode(),"选择行业");
    },
    render: function () {
        if (this.state.displayType === 'text') {
            return (
                <div className="basic-industry-field">
                    <span>{this.state.formData.industry}</span>
                    <i className="iconfont icon-update" title={Intl.get("crm.163", "设置行业")}
                       onClick={this.changeDisplayType.bind(this , "edit")}/>
                </div>
            );
        }
        let options = this.getSelectOptions();
        let status = this.state.status;
        let buttonBlock = this.state.loading ? (
            <Icon type="loading"/>
        ) : !this.state.isLoadingList ? (
            <div>
                <i title={Intl.get("common.save", "保存")} className="inline-block iconfont icon-choose" onClick={this.handleSubmit}/>
                <i title={Intl.get("common.cancel", "取消")} className="inline-block iconfont icon-close"
                   onClick={this.changeDisplayType.bind(this,"text")}/>
            </div>
        ) : null;

        return (<Form>
            <Validation ref="validation" onValidate={this.handleValidate}>
                <FormItem
                    label=""
                    labelCol={{span: 0}}
                    wrapperCol={{span: 24}}
                    validateStatus={this.renderValidateStyle('industry')}
                    help={status.industry.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.industry.errors && status.industry.errors.join(','))}
                >
                    {this.state.isLoadingList ? (
                        <div className="industry-list-loading"><ReactIntl.FormattedMessage id="crm.88" defaultMessage="正在获取行业列表" /><Icon type="loading"/></div>) : (
                        <Validator
                            rules={[{required: true, message: Intl.get("crm.22", "请选择行业")}]}>
                            <Select showSearch placeholder={Intl.get("crm.22", "请选择行业")} name="industry"
                                    searchPlaceholder={Intl.get("crm.89", "输入行业进行搜索")}
                                    optionFilterProp="children"
                                    notFoundContent={this.state.list.length ? Intl.get("crm.23", "无相关行业") : Intl.get("crm.24", "暂无行业")}
                                    value={this.state.formData.industry}
                                    onChange={this.setField.bind(this, 'industry')}
                                    onSelect={this.handleSelect}
                            >
                                {options}
                            </Select>
                        </Validator>)}
                </FormItem>
            </Validation>
            <div className="buttons">
                {buttonBlock}
            </div>
            {this.state.submitErrorMsg ? (
                <div className="has-error">
                    <span className="ant-form-explain">{this.state.submitErrorMsg}</span>
                </div>) : null
            }
        </Form>);
    }
});

module.exports = IndustrySelectField;
