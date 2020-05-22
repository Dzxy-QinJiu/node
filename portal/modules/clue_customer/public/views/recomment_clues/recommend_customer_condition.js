/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/7/24.
 */
import {Form, Input, DatePicker} from 'antd';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
import {AntcAreaSelection, AntcSelect} from 'antc';
const Option = AntcSelect.Option;
require('../../css/recommend-customer-condition.less');
import {checkClueCondition, companyProperty, moneySize, staffSize,CLUE_CONDITION} from '../../utils/clue-customer-utils';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import Trace from 'LIB_DIR/trace';
import {MAXINDUSTRYCOUNT, RECOMMEND_CLUE_FILTERS} from 'PUB_DIR/sources/utils/consts';
import {ipRegex} from 'PUB_DIR/sources/utils/validate-util';
import {getFormattedCondition} from 'PUB_DIR/sources/utils/common-method-util';
class RecommendCustomerCondition extends React.Component {
    constructor(props) {
        super(props);
        var hasSavedRecommendParams = _.cloneDeep(this.props.hasSavedRecommendParams);
        this.state = {
            recommendIndustry: [],
            recommendMoneySize: moneySize,
            recommendStaffSize: staffSize,
            recommendProperty: companyProperty,
            registerStartTime: hasSavedRecommendParams.startTime || '',
            registerEndTime: hasSavedRecommendParams.endTime || '',
            hasSavedRecommendParams: hasSavedRecommendParams,
            showOtherCondition: this.hasOtherCondition(hasSavedRecommendParams),//展示推荐线索其他的条件
        };
    }
    //除了行业或者地域是否还有选中的其他的筛选条件
    hasOtherCondition = (hasSavedRecommendParams) => {
        return checkClueCondition(CLUE_CONDITION, hasSavedRecommendParams);
    };

    onStoreChange = () => {

    };

    componentDidMount() {
        this.getRecommendSelectLists();
    }

    componentWillReceiveProps(nextProps) {
        if (_.isEmpty(this.state.hasSavedRecommendParams)){
            this.setState({
                hasSavedRecommendParams: _.cloneDeep(nextProps.hasSavedRecommendParams)
            });
        }

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

    componentWillUnmount() {
    }

    //更新地址
    updateLocation = (addressObj) => {
        let hasSavedRecommendParams = this.state.hasSavedRecommendParams;
        hasSavedRecommendParams.province = addressObj.provName || '';
        hasSavedRecommendParams.city = addressObj.cityName || '';
        hasSavedRecommendParams.district = addressObj.countyName || '';
        //这里不要setState，否则选中了省份后的各省市面板会收起
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
            hasSavedRecommendParams.name = _.trim(values.name);
            // if (!_.isEmpty(values.industrys)){
            //     hasSavedRecommendParams.industrys = values.industrys;
            // }else{
            //     delete hasSavedRecommendParams.industrys;
            // }
            if (values.industrys){
                hasSavedRecommendParams.industrys = [_.trim(values.industrys)];
            }else{
                delete hasSavedRecommendParams.industrys;
            }
            if (!_.isEmpty(values.entTypes)){
                hasSavedRecommendParams.entTypes = values.entTypes;
            }else{
                delete hasSavedRecommendParams.entTypes;
            }
            if (_.get(values, 'staff_size') && _.isString(_.get(values, 'staff_size'))){
                var staffObj = JSON.parse(_.get(values, 'staff_size'));
                if (_.get(staffObj,'staffnumMin')){
                    hasSavedRecommendParams.staffnumMin = _.get(staffObj,'staffnumMin');
                }else{
                    delete hasSavedRecommendParams.staffnumMin;
                }
                if (_.get(staffObj,'staffnumMax')){
                    hasSavedRecommendParams.staffnumMax = _.get(staffObj,'staffnumMax');
                }else{
                    delete hasSavedRecommendParams.staffnumMax;
                }
            }
            if (_.get(values, 'money_size','') && _.isString(_.get(values, 'money_size'))){
                var moneyObj = JSON.parse(_.get(values, 'money_size'));
                if (_.get(moneyObj,'capitalMin')){
                    hasSavedRecommendParams.capitalMin = _.get(moneyObj,'capitalMin');
                }else{
                    delete hasSavedRecommendParams.capitalMin;
                }
                if (_.get(moneyObj,'capitalMax')){
                    hasSavedRecommendParams.capitalMax = _.get(moneyObj,'capitalMax');
                }else{
                    delete hasSavedRecommendParams.capitalMax;
                }
            }
            const {registerStartTime, registerEndTime} = this.state;
            if (registerStartTime && registerEndTime){
                hasSavedRecommendParams.startTime = registerStartTime;
                hasSavedRecommendParams.endTime = registerEndTime;
            }else{
                delete hasSavedRecommendParams.startTime;
                delete hasSavedRecommendParams.endTime;
            }
            for (var key in hasSavedRecommendParams){
                if (!hasSavedRecommendParams[key]){
                    delete hasSavedRecommendParams[key];
                }
            }
            if (err) return;
            //保存前先判断条件是否有修改，没有修改时，不用调用保存接口
            if(_.isEqual(hasSavedRecommendParams, this.props.hasSavedRecommendParams)) {
                this.props.saveRecommedConditionsSuccess();
                return;
            }
            this.setState({
                isSaving: true,
                saveMsg: '',
                saveResult: ''
            });
            let traceStr = getFormattedCondition(hasSavedRecommendParams, RECOMMEND_CLUE_FILTERS);
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('form div.submit-button-container'), '保存线索推荐查询条件 ' + traceStr);
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
                        var targetObj = _.get(data, '[0]');
                        this.props.saveRecommedConditionsSuccess(targetObj);
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
    handleCancel = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('form div.submit-button-container'), '取消保存线索推荐查询条件');
        this.props.hideFocusCustomerPanel();
    };
    onDateChange = (dates, dateStrings) => {
        if (_.get(dateStrings,'[0]') && _.get(dateStrings,'[1]')){
            //开始时间要取那天早上的00:00:00
            //结束时间要取那天晚上的23:59:59
            this.setState({
                registerStartTime: moment(_.get(dateStrings,'[0]')).startOf('day').valueOf(),
                registerEndTime: moment(_.get(dateStrings,'[1]')).endOf('day').valueOf(),
            });
        }else{
            this.setState({
                registerStartTime: '',
                registerEndTime: '',
            });
        }
    }

    //保存结果的处理
    setResultData(saveMsg, saveResult) {
        this.setState({
            isSaving: false,
            saveMsg: saveMsg,
            saveResult: saveResult
        });
    }

    handleToggleOtherCondition = () => {
        this.setState({
            showOtherCondition: !this.state.showOtherCondition
        });
    };
    validateIndustryCount = (rule, value, callback) => {
        if (value) {
            var industryReg = /^[\u4E00-\u9FA5A-Za-z0-9]{1,10}$/;
            if (industryReg.test(value)) {
                callback();
            } else {
                callback(new Error(Intl.get('clue.customer.add.industry.rule', '请输入1-10位的数字，字母或汉字(中间不能有空格)')));
            }
        }
        else{
            callback();
        }

        // if (value && value.length > MAXINDUSTRYCOUNT) {
        //     callback(new Error(Intl.get('boot.select.industry.count.tip', '最多可选择{count}个行业',{'count': MAXINDUSTRYCOUNT})));
        // } else {
        //     callback();
        // }
    };
    render() {
        const { registerStartTime, registerEndTime, showOtherCondition} = this.state;
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const formItemLayout = {
            labelCol: {
                sm: {span: 24},
            },
            wrapperCol: {
                sm: {span: 24},
            },
        };
        var recommendIndustry = this.state.recommendIndustry;
        var recommendMoneySize = this.state.recommendMoneySize;
        var recommendStaffSize = this.state.recommendStaffSize;
        var recommendProperty = this.state.recommendProperty;
        var hasSavedRecommendParams = this.state.hasSavedRecommendParams;
        let saveResult = this.state.saveResult;
        //人员规模的默认展示项
        var staffTarget = {};
        if(hasSavedRecommendParams.staffnumMin || hasSavedRecommendParams.staffnumMax){
            staffTarget = _.find(recommendStaffSize, item => item.staffnumMin === hasSavedRecommendParams.staffnumMin && item.staffnumMax === hasSavedRecommendParams.staffnumMax );
        }
        //资本规模的默认展示项
        var capitalTarget = {};
        if(hasSavedRecommendParams.capitalMin || hasSavedRecommendParams.capitalMax){
            capitalTarget = _.find(recommendMoneySize, item => item.capitalMin === hasSavedRecommendParams.capitalMin && item.capitalMax === hasSavedRecommendParams.capitalMax );
        }
        var defaultValue = [];
        if (registerStartTime && registerEndTime){
            defaultValue = [moment(registerStartTime), moment(registerEndTime)];
        }
        var cls = 'other-condition-container',show_tip = '';
        //是否展示其他的筛选条件
        if(showOtherCondition){
            cls += 'show-container';
            show_tip = Intl.get('lead.recommend.form.hide.some.condition', '收起部分条件');
        }else{
            cls += ' hide-container';
            show_tip = Intl.get('lead.recommend.form.show.all.condition', '展开全部条件');
        }

        return (
            <div className="recommend-customer-condition recommend-customer-condition-wrapper" data-tracename="设置推荐线索条件面板">
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
                                getFieldDecorator('industrys',
                                    {initialValue: _.get(hasSavedRecommendParams,'industrys[0]',''),
                                        rules: [
                                            {
                                                validator: this.validateIndustryCount,
                                            },
                                        ],
                                    }
                                )(
                                    /*
                                   * <AntcSelect
                                        mode="multiple"
                                        placeholder={Intl.get('crm.22', '请选择行业')}
                                        name="industrys"
                                        getPopupContainer={() => document.getElementById('customer-recommend-form')}
                                    >
                                        {_.isArray(recommendIndustry) && recommendIndustry.length ?
                                            recommendIndustry.map((industryItem, idx) => {
                                                return (<Option key={idx} value={industryItem}>{industryItem}</Option>);
                                            }) : (_.map(_.get(hasSavedRecommendParams,'industrys',[]), (item,idx) => {
                                                return (<Option key={idx} value={item}>{item}</Option>);
                                            }))
                                        }
                                    </AntcSelect>*/
                                    <Input placeholder={Intl.get('boot.please.input.industry.placeholder', '请输入关注的行业，如互联网、金融业等')}/>
                                )}
                        </FormItem>
                        <AntcAreaSelection labelCol="24" wrapperCol="24" width="100%"
                            colon={false}
                            label={Intl.get('crm.96', '地域')}
                            placeholder={Intl.get('crm.address.placeholder', '请选择地域')}
                            provName={hasSavedRecommendParams.province}
                            cityName={hasSavedRecommendParams.city}
                            countyName={hasSavedRecommendParams.district}
                            updateLocation={this.updateLocation}
                            hiddenCounty
                            showAllBtn
                        />
                        <div className={cls}>
                            <FormItem
                                label={Intl.get('clue.recommed.keyword.list', '公司名')}
                                id="name"
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator('name',
                                        {initialValue: _.get(hasSavedRecommendParams,'name','')}
                                    )(
                                        <Input placeholder={Intl.get('clue.recommend.input.keyword', '请输入公司名')}/>
                                    )}
                            </FormItem>
                            {/*如果选了'最近半年注册',就不用再显示注册时间*/}
                            {this.props.isSelectedHalfYearRegister ? null : (
                                <div className="ant-row ant-form-item">
                                    <div className="ant-form-item-label ant-col-xs-24">
                                        <label >{Intl.get('clue.customer.register.time', '注册时间')}</label></div>
                                    <div className="ant-form-item-control-wrapper ant-col-xs-24">
                                        <div className="ant-form-item-control has-success">
                                            <RangePicker defaultValue={defaultValue} onChange={this.onDateChange}/>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <FormItem
                                label={Intl.get('clue.customer.staff.size', '人员规模')}
                                id="staff_size"
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator('staff_size',{initialValue: _.isEmpty(staffTarget) ? '' : JSON.stringify(staffTarget)})(
                                        <AntcSelect
                                            placeholder={Intl.get('clue.customer.select.size', '请选择规模')}
                                            name="staff_size"
                                            getPopupContainer={() => document.getElementById('customer-recommend-form')}

                                        >
                                            {_.isArray(recommendStaffSize) && recommendStaffSize.length ?
                                                recommendStaffSize.map((sizeItem, idx) => {
                                                    return (<Option key={idx} value={JSON.stringify(sizeItem)}>{sizeItem.name}</Option>);
                                                }) : null
                                            }
                                        </AntcSelect>
                                    )}
                            </FormItem>
                            <FormItem
                                label={Intl.get('clue.customer.money.size', '资本规模')}
                                id="money_size"
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator('money_size',{initialValue: _.isEmpty(capitalTarget) ? '' : JSON.stringify(capitalTarget)})(
                                        <AntcSelect
                                            placeholder={Intl.get('clue.customer.select.size', '请选择规模')}
                                            name="money_size"
                                            getPopupContainer={() => document.getElementById('customer-recommend-form')}

                                        >
                                            {_.isArray(recommendMoneySize) && recommendMoneySize.length ?
                                                recommendMoneySize.map((sizeItem, idx) => {
                                                    return (<Option key={idx} value={JSON.stringify(sizeItem)}>{sizeItem.name}</Option>);
                                                }) : null
                                            }
                                        </AntcSelect>
                                    )}
                            </FormItem>
                            <FormItem
                                label={Intl.get('clue.customer.company.property', '性质')}
                                id="entTypes"
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator('entTypes',{initialValue: _.get(hasSavedRecommendParams,'entTypes')})(
                                        <AntcSelect
                                            mode="multiple"
                                            placeholder={Intl.get('clue.customer.select.property', '请选择性质')}
                                            name="entTypes"
                                            getPopupContainer={() => document.getElementById('customer-recommend-form')}
                                        >
                                            {_.isArray(recommendProperty) && recommendProperty.length ?
                                                recommendProperty.map((propertyItem, idx) => {
                                                    return (<Option key={idx} value={propertyItem.value}>{propertyItem.name}</Option>);
                                                }) : null
                                            }
                                        </AntcSelect>
                                    )}
                            </FormItem>
                        </div>
                        <div className="submit-button-container">
                            <div className='show-hide-tip' onClick={this.handleToggleOtherCondition} data-tracename='点击展开或收起推荐线索的条件'>
                                {show_tip}
                            </div>
                            <SaveCancelButton loading={this.state.isSaving}
                                saveErrorMsg={this.state.saveMsg}
                                handleSubmit={this.handleSubmit}
                                handleCancel={this.handleCancel}
                                okBtnText={Intl.get('config.manage.realm.oktext', '确定')}
                            />
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

    },
    hideFocusCustomerPanel: function() {

    }
};
RecommendCustomerCondition.propTypes = {
    hasSavedRecommendParams: PropTypes.object,
    form: PropTypes.object,
    saveRecommedConditionsSuccess: PropTypes.func,
    hideFocusCustomerPanel: PropTypes.func,
    isSelectedHalfYearRegister: PropTypes.bool,
};
export default Form.create()(RecommendCustomerCondition);
