/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/7/24.
 */
import {Form, Input, Button, Icon, message, DatePicker, Select} from 'antd';
var Option = Select.Option;
const FormItem = Form.Item;
import {AntcAreaSelection} from 'antc';
import {DELAY_TIME_RANGE} from 'PUB_DIR/sources/utils/consts';
import AlertTimer from 'CMP_DIR/alert-timer';
require('../../css/recommend-customer-condition.less');
import {companyProperty, moneySize,staffSize} from '../../utils/clue-customer-utils';
class RecommendCustomerCondition extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recommendIndustry: [],
            recommendMoneySize: moneySize,
            recommendStaffSize: staffSize,
            recommendProperty: companyProperty,
            hasSavedRecommendParams: _.cloneDeep(this.props.hasSavedRecommendParams)
        };
    }

    onStoreChange = () => {

    };

    componentDidMount() {
        this.getRecommendSelectLists();
    }

    getRecommendSelectLists = () => {
        this.getRecommendCustomerIndustry();
    };
    getRecommendCustomerIndustry = () => {
        $.ajax({
            url: '/rest/clue/condition/industries',
            type: 'get',
            dataType: 'json',
            success: (list) => {
                this.setState({
                    recommendIndustry: list
                });
            },
            error: (xhr) => {
            }
        });
    };

    componentWillReceiveProps(nextProps) {

    }

    componentWillUnmount() {
    }

    //更新地址
    updateLocation = (addressObj) => {
        let hasSavedRecommendParams = this.state.hasSavedRecommendParams;
        hasSavedRecommendParams.province = addressObj.provName || '';
        hasSavedRecommendParams.city = addressObj.cityName || '';
        hasSavedRecommendParams.district = addressObj.countyName || '';
        this.setState({
            hasSavedRecommendParams: hasSavedRecommendParams
        });
    };
    //去掉保存后提示信息
    hideSaveTooltip = () => {
        this.setState({
            saveMsg: '',
            saveResult: ''
        });
    };
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            var hasSavedRecommendParams = this.state.hasSavedRecommendParams;
            if (!_.isEmpty(values.industrys)){
                hasSavedRecommendParams.industrys = values.industrys;
            }
            if (!_.isEmpty(values.entTypes)){
                hasSavedRecommendParams.entTypes = values.entTypes;
            }
            if (_.get(values, 'staff_size') && _.isString(_.get(values, 'staff_size'))){
                var staffObj = JSON.parse(_.get(values, 'staff_size'));
                hasSavedRecommendParams.staffnumMin = _.get(staffObj,'staffnumMin');
                hasSavedRecommendParams.staffnumMax = _.get(staffObj,'staffnumMax');
            }
            if (_.get(values, 'money_size') && _.isString(_.get(values, 'money_size'))){
                var moneyObj = JSON.parse(_.get(values, 'money_size'));
                hasSavedRecommendParams.capitalMin = _.get(moneyObj,'capitalMin');
                hasSavedRecommendParams.capitalMax = _.get(moneyObj,'capitalMax');
            }
            if (err) return;
            this.setState({
                isSaving: true,
                saveMsg: '',
                saveResult: ''
            });

            var errTip = Intl.get('crm.154', '添加失败');
            $.ajax({
                url: '/rest/clue/recommend/condition',
                dataType: 'json',
                type: 'post',
                data: hasSavedRecommendParams,
                success: (data) => {
                    if (data){
                        //添加成功
                        this.setResultData(Intl.get('user.user.add.success', '添加成功'), 'success');
                        //保存成功后跳转到推荐线索列表
                        this.props.saveRecommedConditionsSuccess(hasSavedRecommendParams);
                    }else{
                        this.setResultData(errTip, 'error');
                    }
                },
                error: (xhr) => {
                    if (xhr.responseJSON && _.isString(xhr.responseJSON)){
                        errTip = xhr.responseJSON;
                    }
                    this.setResultData(errTip, 'error');
                }
            });
        });
    };

    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 4},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 20},
            },
        };
        var recommendIndustry = this.state.recommendIndustry;
        var recommendMoneySize = this.state.recommendMoneySize;
        var recommendStaffSize = this.state.recommendStaffSize;
        var recommendProperty = this.state.recommendProperty;
        var hasSavedRecommendParams = this.state.hasSavedRecommendParams;
        let saveResult = this.state.saveResult;
        return (
            <div className="recommend-customer-condition">
                <div
                    className="recommend-top-title">{Intl.get('clue.customer.select.focus.customer', '请选择您关注的客户类型')}</div>
                <div className="add-customer-recommend">
                    <Form layout='horizontal' className="customer-recommend-form" id="customer-recommend-form">
                        <FormItem
                            label={Intl.get('menu.industry', '行业')}
                            id="industrys"
                            {...formItemLayout}
                        >
                            {
                                getFieldDecorator('industrys')(
                                    <Select
                                        mode="multiple"
                                        placeholder={Intl.get('crm.22', '请选择行业')}
                                        name="industrys"
                                        getPopupContainer={() => document.getElementById('customer-recommend-form')}
                                        defaultValue={_.get(hasSavedRecommendParams, 'industry',[])}

                                    >
                                        {_.isArray(recommendIndustry) && recommendIndustry.length ?
                                            recommendIndustry.map((industryItem, idx) => {
                                                return (<Option key={idx} value={industryItem}>{industryItem}</Option>);
                                            }) : null
                                        }
                                    </Select>
                                )}
                        </FormItem>
                        <AntcAreaSelection labelCol="4" wrapperCol="20" width="100%"
                            colon={false}
                            label={Intl.get('crm.96', '地域')}
                            placeholder={Intl.get('crm.address.placeholder', '请选择地域')}
                            provName={hasSavedRecommendParams.province}
                            cityName={hasSavedRecommendParams.city}
                            countyName={hasSavedRecommendParams.county}
                            updateLocation={this.updateLocation}
                        />
                        <FormItem
                            label={Intl.get('clue.customer.staff.size', '人员规模')}
                            id="staff_size"
                            {...formItemLayout}
                        >
                            {
                                getFieldDecorator('staff_size')(
                                    <Select
                                        placeholder={Intl.get('clue.customer.select.size', '请选择规模')}
                                        name="staff_size"
                                        getPopupContainer={() => document.getElementById('customer-recommend-form')}
                                        defaultValue={_.get(hasSavedRecommendParams, 'industry',[])}

                                    >
                                        {_.isArray(recommendStaffSize) && recommendStaffSize.length ?
                                            recommendStaffSize.map((sizeItem, idx) => {
                                                return (<Option key={idx} value={JSON.stringify(sizeItem)}>{sizeItem.name}</Option>);
                                            }) : null
                                        }
                                    </Select>
                                )}
                        </FormItem>
                        <FormItem
                            label={Intl.get('clue.customer.money.size', '资本规模')}
                            id="money_size"
                            {...formItemLayout}
                        >
                            {
                                getFieldDecorator('money_size')(
                                    <Select
                                        placeholder={Intl.get('clue.customer.select.size', '请选择规模')}
                                        name="money_size"
                                        getPopupContainer={() => document.getElementById('customer-recommend-form')}
                                        // defaultValue={_.get(hasSavedRecommendParams, 'industry',[])}

                                    >
                                        {_.isArray(recommendMoneySize) && recommendMoneySize.length ?
                                            recommendMoneySize.map((sizeItem, idx) => {
                                                return (<Option key={idx} value={JSON.stringify(sizeItem)}>{sizeItem.name}</Option>);
                                            }) : null
                                        }
                                    </Select>
                                )}
                        </FormItem>
                        <FormItem
                            label={Intl.get('clue.customer.company.property', '性质')}
                            id="entTypes"
                            {...formItemLayout}
                        >
                            {
                                getFieldDecorator('entTypes')(
                                    <Select
                                        mode="multiple"
                                        placeholder={Intl.get('clue.customer.select.property', '请选择性质')}
                                        name="entTypes"
                                        getPopupContainer={() => document.getElementById('customer-recommend-form')}
                                        defaultValue={_.get(hasSavedRecommendParams, 'entType',[])}
                                    >
                                        {_.isArray(recommendProperty) && recommendProperty.length ?
                                            recommendProperty.map((propertyItem, idx) => {
                                                return (<Option key={idx} value={propertyItem.value}>{propertyItem.name}</Option>);
                                            }) : null
                                        }
                                    </Select>
                                )}
                        </FormItem>
                        <div className="submit-button-container">
                            <Button type="primary" className="submit-btn" onClick={this.handleSubmit}
                                disabled={this.state.isSaving} data-tracename="点击保存添加
                                            推荐客户">
                                {Intl.get('common.save', '保存')}
                                {this.state.isSaving ? <Icon type="loading"/> : null}
                            </Button>
                            <div className="indicator">
                                {saveResult ?
                                    (
                                        <AlertTimer
                                            time={saveResult === 'error' ? DELAY_TIME_RANGE.ERROR_RANGE : DELAY_TIME_RANGE.SUCCESS_RANGE}
                                            message={this.state.saveMsg}
                                            type={saveResult} showIcon
                                            onHide={this.hideSaveTooltip}/>
                                    ) : ''
                                }
                            </div>
                        </div>
                    </Form>
                </div>

            </div>
        );
    }
}
RecommendCustomerCondition.defaultProps = {
    hasSavedRecommendParams: {},
    form: {},
    saveRecommedConditionsSuccess: function() {

    }
};
RecommendCustomerCondition.propTypes = {
    hasSavedRecommendParams: PropTypes.object,
    form: PropTypes.object,
    saveRecommedConditionsSuccess: PropTypes.func
};
export default Form.create()(RecommendCustomerCondition);


