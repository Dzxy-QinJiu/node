import classNames from 'classnames';
require('../css/crm-add-form.less');
import { Icon, Form, Input, Select, message } from 'antd';
import { AntcAreaSelection } from 'antc';

var FormItem = Form.Item;
var Option = Select.Option;
var CrmAction = require('../action/crm-actions');
const GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var crmUtil = require('../utils/crm-util');
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import routeList from '../../../common/route';
import ajax from '../../../common/ajax';
import crmAjax from '../ajax/index';

const userData = require('../../../../public/sources/user-data');
import Trace from 'LIB_DIR/trace';

import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import { customerNameRegex } from 'PUB_DIR/sources/utils/validate-util';
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';
import { renderCustomerNameMsg } from 'PUB_DIR/sources/utils/common-method-util';
import ContactForm from 'MOD_DIR/crm/public/views/contacts/contact-form';
const ADD_TITLE_HEIGHT = 70 + 24;//添加客户标题的高度+下边距marginBottom
var uuid = require('uuid/v4');

function defaultContact() {
    return {
        uid: uuid(),
        name: '',//联系人名称
        department: '', //联系人部门
        position: '', //联系人职位
        role: Intl.get('crm.115', '经办人'), //联系人角色
        phone: [], //联系人联系方式
        qq: [],//联系人qq
        weChat: [],//联系人微信
    };
}

class CRMAddForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getInitialState();
    }

    getInitialState() {
        //在线索关联客户，新添加客户时，新添加客户的名字是线索名称，客户联系人是线索联系人
        let propsFormData = this.props.formData;
        let contacts = [{
            uid: uuid(),
            name: _.get(propsFormData,'contactName', ''),//联系人名称
            department: '', //联系人部门
            position: '', //联系人职位
            role: Intl.get('crm.115', '经办人'), //联系人角色
            //拨打电话弹屏后，再点击添加客户，自动将电话号码放入到添加客户的右侧面板内
            phone: [this.props.phoneNum], //联系人联系方式
            qq: _.get(propsFormData, 'contacts[0].qq', []),//联系人qq
            weChat: _.get(propsFormData, 'contacts[0].weChat', []),//联系人微信
            email: _.get(propsFormData, 'contacts[0].email', []),//联系人邮箱
        }];
        const formData = {
            name: (propsFormData && propsFormData.name) ? propsFormData.name : '',//客户名称
            industry: [],//行业
            province: '',
            city: '',
            county: '',
            province_code: '',
            city_code: '',
            county_code: '',
            address: '',//详细地址
            administrative_level: '',//行政区划
            remarks: '',//备注
            contacts
        };
        return {
            isLoading: false,
            formData: formData,
            customerNameExist: false,//客户名是否已存在
            existCustomerList: [],//已存在的客户列表
            checkNameError: false,//客户名唯一性验证出错
            checkPhoneErrorMsg: '',//联系人电话验证提示信息
            isLoadingIndustry: false,//是否正在加载行业列表
            submitErrorMsg: '',//保存失败的错误提示
            phoneNum: this.props.phoneNum,//外部传入的电话值
            isBasicExpanded: false, // 客户基本信息是否展示其余项不折叠
            isContactWayExpanded: this.props.isContactWayExpanded, // 联系方式是否展示其余项不折叠
        };
    }

    componentDidMount() {
        this.getIndustry();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.phoneNum && nextProps.phoneNum !== this.state.phoneNum) {
            let phoneNum = nextProps.phoneNum;
            this.setState({
                phoneNum
            }, () => {
                //拨打电话弹屏后，再点击添加客户，自动将电话号码放入到添加客户的右侧面板内
                let contact = _.get(this.state.formData.contacts,'[0]');
                if(contact) {
                    let curContactRef = this[`form${contact.uid}Ref`];
                    let phone = curContactRef.state.formData.phone;
                    if(phone) {
                        curContactRef.props.form.setFieldsValue({
                            ['phone' + phone[0].id]: phoneNum
                        });
                    }
                }
            });
        }
    }

    getIndustry() {
        //获取后台管理中设置的行业列表
        this.setState({isLoadingIndustry: true});
        CrmAction.getIndustries(result => {
            let list = _.isArray(result) ? result : [];
            if (list.length > 0) {
                list = _.map(list, 'industry');
            }
            this.setState({isLoadingIndustry: false, industryList: list});
        });
    }

    //更新地址
    updateLocation = (addressObj) => {
        let formData = this.state.formData;
        formData.province = addressObj.provName || '';
        formData.city = addressObj.cityName || '';
        formData.county = addressObj.countyName || '';
        formData.province_code = addressObj.provCode || '';
        formData.city_code = addressObj.cityCode || '';
        formData.county_code = addressObj.countyCode || '';
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('form div .ant-form-item'), '选择地址');
    };

    //提交修改
    handleSubmit = (e) => {
        if (this.state.isLoading) return;
        this.setState({isLoading: true});
        e.preventDefault();
        this.props.form.validateFields((error, values) => {
            let contactErrors = [];
            let contacts = [];
            let notNeedContactKeys = ['id', 'customer_id'];
            //验证联系人
            this.state.formData.contacts.map(contact => {
                let res = this[`form${contact.uid}Ref`].handleSubmit();
                if (res.error) {
                    contactErrors.push('true');
                } else {
                    let data = res.data;
                    for (var key in notNeedContactKeys) {
                        delete data[notNeedContactKeys[key]];
                    }
                    contacts.push(data);
                }
            });
            //验证不通过、电话验证不通过、客户名是否已存在、客户名唯一性验证出错时不能保存、联系人为空时
            if (error ||
                _.get(contactErrors, '[0]') ||
                this.state.customerNameExist ||
                this.state.checkNameError ||
                _.isEmpty(_.get(contacts,'[0]'))
            ) {
                this.setState({isLoading: false});
                return false;
            }else {
                //导入客户前先校验，是不是超过了本人的客户上限
                let member_id = userData.getUserData().user_id;
                CrmAction.getCustomerLimit({member_id, num: 1}, (result) => {
                    if (_.isNumber(result)) {
                        if (result === 0) {//可以添加
                            //在这里处理好一些数据
                            let formData = {
                                ...values,
                                contacts
                            };
                            this.addCustomer(formData);
                        } else if (result > 0) {
                            //不可以添加
                            this.setState({isLoading: false, submitErrorMsg: Intl.get('crm.should.add.customer', '您拥有的客户已达到上限，请不要再添加客户了')});
                        }
                    } else {
                        this.setState({isLoading: false});
                    }
                });
            }
        });
    };

    //添加客户
    addCustomer(formObj) {
        let formData = _.cloneDeep(this.state.formData);
        formData = {...formData, ...formObj};
        formData.name = _.trim(formData.name);
        let PropsFormData = this.props.formData;
        if (this.props.isAssociateClue && PropsFormData) {
            //添加客户时，新创建的客户要关联该线索
            //线索id
            formData.clue_id = PropsFormData.id;
            //添加客户时，新创建的客户要关联注册的用户
            formData.app_user_ids = PropsFormData.app_user_ids;
        }

        //去除表单数据中值为空的项
        commonMethodUtil.removeEmptyItem(formData, true);
        function afterAddCustomer(result, _this) {
            if (result.code === 0 || result.result === 'success') {
                //新增添加成功后的方法
                if(_.isFunction(_this.props.afterAddCustomer)) {
                    _this.props.afterAddCustomer(result.result);
                }
                //是否关闭添加面板
                if(_this.props.isClosedPanelAfterAdd) {
                    _this.props.hideAddForm();
                }
                _this.setState(_this.getInitialState());
            } else {
                _this.setState({isLoading: false, submitErrorMsg: result});
            }
        }
        //由线索创建的客户和普通的添加客户不是一个接口
        if(this.props.isAssociateClue && PropsFormData){
            CrmAction.addCustomerByClue(formData, this.props.isConvert, result => {
                afterAddCustomer(result, this);
            });
        }else{
            CrmAction.addCustomer(formData, result => {
                afterAddCustomer(result, this);
            });
        }
    }

    closeAddPanel = (e) => {
        Trace.traceEvent(e, '关闭添加客户面板');
        this.props.hideAddForm();
        this.setState(this.getInitialState());
    };

    //根据客户名在地理信息接口获取该客户的信息并填充到对应字段\
    autofillGeoInfo(customerName) {
        const route = _.find(routeList, route => route.handler === 'getGeoInfo');

        const arg = {
            url: route.path,
            query: {keywords: customerName}
        };

        ajax(arg).then(result => {
            if (_.isEmpty(result)) return;
            let formData = this.state.formData;
            //下面的数据都没有时，再用获取的默认数据，（以防自己先填写了下面的数据，再修改用户名时，直接给清空或替换掉的问题）
            let values = this.props.form.getFieldsValue();
            if (!values.address) {
                this.props.form.setFieldsValue({address: result.address});
            }
            if (!formData.location) {
                formData.location = result.location;
            }
            if (!formData.province) {
                formData.province = result.pname;
                formData.city = result.cityname;
                formData.county = result.adname;
                formData.province_code = result.pcode;
                formData.city_code = result.citycode;
                formData.county_code = result.adcode;
            }
            let contact = _.get(this.state.formData.contacts,'[0]');
            if(contact) {
                let curContactRef = this[`form${contact.uid}Ref`];
                let phone = curContactRef.state.formData.phone;
                if(phone) {
                    let phoneValue = curContactRef.props.form.getFieldValue('phone' + phone[0].id);
                    if(!phoneValue) {
                        curContactRef.props.form.setFieldsValue({
                            ['phone' + phone[0].id]: result.tel
                        });
                    }
                }
            }
            this.setState({formData});
        });
    }

    //根据客户名获取客户的行政级别并填充到对应字段上
    getAdministrativeLevelByName(customerName) {
        crmAjax.getAdministrativeLevel({name: customerName}).then(result => {
            if (_.isEmpty(result)) return;
            this.props.form.setFieldsValue({'administrative_level': crmUtil.filterAdministrativeLevel(result.level)});
        });
    }

    //客户名唯一性验证
    checkOnlyCustomerName = (e) => {
        var customerName = _.trim(this.props.form.getFieldValue('name'));
        //满足验证条件后再进行唯一性验证
        if (customerName && customerNameRegex.test(customerName)) {
            Trace.traceEvent(e, '添加客户名称');
            CrmAction.checkOnlyCustomerName(customerName, (data) => {
                let list = _.get(data, 'list');
                //客户名是否重复
                let repeatCustomer = _.some(list, {'name': customerName});
                if (_.isString(data)) {
                    //唯一性验证出错了
                    this.setState({customerNameExist: false, checkNameError: true, existCustomerList: []});
                } else if (_.isObject(data)) {
                    if (!repeatCustomer) {
                        //不存在
                        this.setState({
                            customerNameExist: false,
                            checkNameError: false,
                            existCustomerList: _.get(data, 'list', [])
                        });
                    } else {
                        //已存在
                        this.setState({
                            customerNameExist: true,
                            checkNameError: false,
                            existCustomerList: _.get(data, 'list', [])
                        });
                    }
                }
            });

            if(!commonMethodUtil.checkVersionAndType().isPersonalTrial) {
                this.getAdministrativeLevelByName(customerName);
            }
            //根据客户名查询地域、行业等信息并自动填充到相关字段
            this.autofillGeoInfo(customerName);
        } else {
            this.setState({customerNameExist: false, checkNameError: false, existCustomerList: []});
        }
    };

    //客户名格式验证
    checkCustomerName = (rule, value, callback) => {
        value = _.trim(value);
        if (value) {
            if (customerNameRegex.test(value)) {
                callback();
            } else {
                this.setState({customerNameExist: false, checkNameError: false});
                callback(new Error(Intl.get('crm.197', '客户名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号等字符，且长度在1到25（包括25）之间')));
            }
        } else {
            this.setState({customerNameExist: false, checkNameError: false});
            callback(new Error(Intl.get('crm.81', '请填写客户名称')));
        }
    };

    handleRemarkInput(e) {
        Trace.traceEvent(e, '添加备注');
    }

    handleSelect() {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('form div .ant-form-item label[for=\'industry\']').next('div'), '选择行业');
    }

    getAdministrativeLevelOptions() {
        let options = crmUtil.administrativeLevels.map(obj => {
            return (<Option key={obj.id} value={obj.id}>{obj.level}</Option>);
        });
        options.unshift(<Option key="" value="">&nbsp;</Option>);
        return options;
    }

    //展开、收起联系方式的处理
    toggleContactWay = () => {
        this.setState({isContactWayExpanded: !this.state.isContactWayExpanded});
    };

    //展开、收起客户基本信息的处理
    toggleBasicInfo = () => {
        this.setState({isBasicExpanded: !this.state.isBasicExpanded});
    };

    setField = (field, e) => {
        let formData = this.state.formData;
        formData[field] = e && e.target.value || '';
        this.setState({formData});
    };

    // 添加联系人
    handleAddContact = () => {
        let formData = this.state.formData;
        formData.contacts.push(defaultContact());
        this.setState({formData});
    };

    handleDelContact = (index) => {
        let formData = _.cloneDeep(this.state.formData);
        let contact = formData.contacts[index];
        formData.contacts.splice(index, 1);
        delete this[`form${contact.uid}Ref`];
        this.setState({formData});
    };

    renderFormContent() {
        let {getFieldDecorator} = this.props.form;
        let formData = this.state.formData;
        let industryList = this.state.industryList || [];
        //行业下拉列表
        let industryOptions = industryList.map(function(industry, index) {
            return (<Option key={index} value={industry}>{industry}</Option>);
        });
        let contacts = this.state.formData.contacts;

        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
        let formHeight = $('body').height() - ADD_TITLE_HEIGHT;
        let isBasicExpanded = this.state.isBasicExpanded;
        let isContactWayExpanded = this.state.isContactWayExpanded;
        //客户基本信息展开、收起
        const basicInfoClassName = classNames('iconfont', {
            'icon-up-twoline handle-btn-item': isBasicExpanded,
            'icon-down-twoline handle-btn-item': !isBasicExpanded
        });
        //联系方式展开、收起
        const contactWayClassName = classNames('iconfont', {
            'icon-up-twoline handle-btn-item': isContactWayExpanded,
            'icon-down-twoline handle-btn-item': !isContactWayExpanded
        });
        return (
            <Form layout="horizontal" className="crm-add-form" id="crm-add-form" style={{height: formHeight}}>
                <GeminiScrollbar>
                    <div className="add-info-title">
                        <span className="iconfont icon-detail-list"/>
                        {Intl.get('user.user.basic', '基本信息')}
                        <div className="add-info-buttons">
                            <span
                                className={basicInfoClassName}
                                data-tracename={isBasicExpanded ? '收起详情' : '展开详情'}
                                title={isBasicExpanded ? Intl.get('crm.basic.detail.hide', '收起详情') : Intl.get('crm.basic.detail.show', '展开详情')}
                                onClick={this.toggleBasicInfo}
                            />
                        </div>
                    </div>
                    <div className="customer-info-wrapper">
                        <FormItem
                            {...formItemLayout}
                            label={Intl.get('crm.4', '客户名称')}
                            id="crm-name"
                            required={true}
                        >
                            {
                                getFieldDecorator('name', {
                                    initialValue: _.get(formData, 'name', ''),
                                    validateTrigger: 'onBlur',
                                    rules: [{validator: this.checkCustomerName}]
                                })(
                                    <Input
                                        id="name"
                                        onBlur={(e) => {
                                            this.checkOnlyCustomerName(e);
                                        }}
                                        onChange={this.setField.bind(this, 'name')}
                                    />
                                )
                            }
                        </FormItem>
                        {renderCustomerNameMsg(this.state.existCustomerList, this.state.checkNameError, _.get(formData, 'name', ''), this.props.showRightPanel)}
                        <div style={{display: isBasicExpanded ? 'block' : 'none'}}>
                            <FormItem
                                {...formItemLayout}
                                label={Intl.get('common.industry', '行业')}
                                id="industry"
                            >
                                {this.state.isLoadingIndustry ? (
                                    <div className="industry-list-loading">
                                        <ReactIntl.FormattedMessage
                                            id="crm.88"
                                            defaultMessage="正在获取行业列表"/>
                                        <Icon type="loading"/></div>) : (
                                    getFieldDecorator('industry')(
                                        <Select
                                            showSearch
                                            placeholder={Intl.get('crm.22', '请选择行业')}
                                            searchPlaceholder={Intl.get('crm.89', '输入行业进行搜索')}
                                            optionFilterProp="children"
                                            notFoundContent={!industryList.length ? Intl.get('crm.24', '暂无行业') : Intl.get('crm.23', '无相关行业')}
                                            onSelect={(e) => {
                                                this.handleSelect(e);
                                            }}
                                            getPopupContainer={() => document.getElementById('crm-add-form')}
                                            filterOption={(input, option) => ignoreCase(input, option)}
                                        >
                                            {industryOptions}
                                        </Select>
                                    )
                                )}
                            </FormItem >
                            {commonMethodUtil.checkVersionAndType().isPersonalTrial ? null : (
                                <FormItem
                                    label={Intl.get('crm.administrative.level', '行政级别')}
                                    {...formItemLayout}
                                >
                                    {
                                        getFieldDecorator('administrative_level')(
                                            <Select
                                                placeholder={Intl.get('crm.administrative.level.placeholder', '请选择行政级别')}
                                                getPopupContainer={() => document.getElementById('crm-add-form')}
                                            >
                                                {this.getAdministrativeLevelOptions()}
                                            </Select>
                                        )
                                    }
                                </FormItem >
                            )}
                            <AntcAreaSelection
                                labelCol="5"
                                wrapperCol="19"
                                width="100%"
                                colon={false}
                                label={Intl.get('crm.96', '地域')}
                                placeholder={Intl.get('crm.address.placeholder', '请选择地域')}
                                provName={formData.province}
                                cityName={formData.city}
                                countyName={formData.county}
                                updateLocation={this.updateLocation}
                            />
                            <FormItem
                                label={Intl.get('common.address', '地址')}
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator('address')(
                                        <Input
                                            placeholder={Intl.get('crm.detail.address.placeholder', '请输入详细地址')}
                                        />
                                    )
                                }
                            </FormItem>
                            < FormItem
                                label={Intl.get('common.remark', '备注')}
                                id="remarks"
                                {...formItemLayout}
                            >
                                {
                                    getFieldDecorator('remarks')(
                                        <Input
                                            type="textarea"
                                            id="remarks"
                                            rows="3"
                                            onBlur={(e) => {
                                                this.handleRemarkInput(e);
                                            }}
                                        />
                                    )
                                }
                            </FormItem>
                        </div>
                    </div>

                    <div className="add-info-title contact-info-title">
                        <span className="iconfont icon-contact-head"/>
                        {Intl.get('call.record.contacts', '联系人')}
                        <div className="add-info-buttons">
                            <span
                                className={contactWayClassName}
                                data-tracename={isContactWayExpanded ? '收起详情' : '展开详情'}
                                title={isContactWayExpanded ? Intl.get('crm.basic.detail.hide', '收起详情') : Intl.get('crm.basic.detail.show', '展开详情')}
                                onClick={this.toggleContactWay}
                            />
                        </div>
                    </div>
                    <FormItem
                        label={' '}
                        colon={false}
                        labelCol={{span: 1}}
                        wrapperCol={{span: 23}}
                    >
                        <div className="crm-contacts-wrapper">
                            {_.map(contacts, (contact, index) => {
                                return (
                                    <div className="crm-contact-content clearfix" key={contact.uid}>
                                        <ContactForm
                                            uid={'contact' + contact.uid}
                                            isContactWayExpanded={isContactWayExpanded}
                                            wrappedComponentRef={ref => this[`form${contact.uid}Ref`] = ref}
                                            contact={{contact}}
                                            height='auto'
                                            isDynamicAddAdnDelContact
                                            getDynamicAddPhones={() => {
                                                let phoneArray = [];
                                                _.each(contacts, item => {
                                                    if(item.uid !== contact.uid && this[`form${item.uid}Ref`]) {
                                                        let curPhoneArray = this[`form${item.uid}Ref`].getCurPhoneArray();
                                                        phoneArray = phoneArray.concat(curPhoneArray);
                                                    }
                                                });
                                                return phoneArray;
                                            }}
                                            hasSaveAndCancelBtn={false}
                                            isRequiredContactName={false}
                                            isUseGeminiScrollbar={false}
                                            isValidatePhoneOnDidMount={true}
                                            isValidateOnExternal
                                        />
                                        {index === 0 && this.state.formData.contacts.length === 1 ? null : <i className="iconfont icon-delete handle-btn-item" title={Intl.get('common.delete','删除')} onClick={this.handleDelContact.bind(this, index)}/>}
                                    </div>
                                );
                            })}
                            <div className="add-contact handle-btn-item" onClick={this.handleAddContact.bind(this)}><i className="iconfont icon-add"/>{Intl.get('crm.detail.contact.add', '添加联系人')}</div>
                        </div>
                    </FormItem>
                    <FormItem
                        wrapperCol={{span: 24}}>
                        <SaveCancelButton
                            loading={this.state.isLoading}
                            saveErrorMsg={this.state.submitErrorMsg}
                            handleSubmit={this.handleSubmit}
                            handleCancel={this.closeAddPanel}
                        />
                    </FormItem>
                </GeminiScrollbar>
            </Form>
        );
    }

    render() {
        return (
            <RightPanelModal
                className="crm-add-container"
                isShowMadal={this.props.isShowMadal}
                isShowCloseBtn={true}
                onClosePanel={this.closeAddPanel}
                title={this.props.title}
                content={this.renderFormContent()}
                dataTracename="添加客户"
            />
        );
    }
}

CRMAddForm.defaultProps = {
    showRightPanel: function() {
    },
    hideAddForm: function() {
    },
    phoneNum: '',
    isAssociateClue: false,
    //联系方式是否展示其余项不折叠
    isContactWayExpanded: false,
    formData: {},
    isShowMadal: true,
    //添加完成后是否关闭面板
    isClosedPanelAfterAdd: true,
    //是否是在线索转客户的过程中添加客户
    isConvert: true,
    // 头部标题区域
    title: Intl.get('crm.3', '添加客户')
};
CRMAddForm.propTypes = {
    showRightPanel: PropTypes.func,
    hideAddForm: PropTypes.func,
    isClosedPanelAfterAdd: PropTypes.bool,
    //添加成功后处理函数
    afterAddCustomer: PropTypes.func,
    phoneNum: PropTypes.string,
    isAssociateClue: PropTypes.bool,
    //联系方式是否展示其余项不折叠
    isContactWayExpanded: PropTypes.bool,
    formData: PropTypes.object,
    isShowMadal: PropTypes.bool,
    isConvert: PropTypes.bool,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element
    ]),
    form: PropTypes.object,
};
module.exports = Form.create()(CRMAddForm);

