/** Created by 2019-02-19 14:05 */
var React = require('react');
/**
 * 产品信息添加表单
 */

import { Alert, message } from 'antd';
import { getNumberValidateRule, numberAddNoMoreThan } from 'PUB_DIR/sources/utils/validate-util';
import { removeCommaFromNum } from 'LIB_DIR/func';
import ProductList from '../components/product-list';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import { PRIVILEGE_MAP, VIEW_TYPE } from 'MOD_DIR/contract/consts';
import Trace from 'LIB_DIR/trace';
import routeList from 'MOD_DIR/contract/common/route';
import ajax from 'MOD_DIR/contract/common/ajax';

const defaultValueMap = {
    count: 1,
    total_price: 1000,
    commission_rate: 6,
    version: '',
    account_start_time: Date.now(),
    account_end_time: Date.now()
};

class AddProduct extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            ...this.getInitialState(props)
        };
    }
    getInitialState(props) {
        let products;

        if (_.isArray(props.products) && props.products.length) {
            products = JSON.parse(JSON.stringify(this.props.products));
        } else {
            products = [];
        }
        return {
            products: products,
            formData: {},
            valid: false,
            pristine: true
        };
    }

    static defaultProps = {
        totalAmout: 0
    };

    producTableRef = null;

    static propTypes = {
        products: PropTypes.array,
        appList: PropTypes.array,
        updateScrollBar: PropTypes.func,
        isDetailType: PropTypes.bool.isRequired,
        totalAmout: PropTypes.number,
        contract: PropTypes.array,
        refreshCurrentContract: PropTypes.func,
    };

    componentWillReceiveProps(nextProps) {
        if(_.get(this.props,'contract') && this.props.contract.id !== nextProps.contract.id){
            let newState = this.getInitialState(nextProps);
            newState.products = JSON.parse(JSON.stringify(nextProps.contract.products));
            newState.isEdit = false;
            this.producTableRef.state.isEdit = false;
            this.setState(newState);
        }
    }

    deleteProduct(index) {
        this.state.products.splice(index, 1);

        this.setState(this.state, () => {
            this.props.updateScrollBar();
        });
    }

    handleProductChange = (data, cb) => {
        this.setState({ products: data, pristine: true },() => {
            _.isFunction(cb) && cb();
            this.props.updateScrollBar();
        });
    };

    handleProductCancel = () => {
        let products = _.clone(this.props.products);
        this.setState({products},() => {
            this.props.updateScrollBar();
        });
    };

    handleProductSave = (saveObj,successFunc,errorFunc) => {
        saveObj = {products: saveObj};
        Trace.traceEvent(ReactDOM.findDOMNode(this),'修改产品信息');

        const handler = 'editContract';
        const route = _.find(routeList, route => route.handler === handler);

        const arg = {
            url: route.path,
            type: route.method,
            data: saveObj || {},
            params: {type: VIEW_TYPE.SELL}
        };
        ajax(arg).then(result => {
            if (result.code === 0) {
                message.success(Intl.get('user.edit.success', '修改成功'));
                if (_.isFunction(successFunc)) successFunc();
                const hasResult = _.isObject(result.result) && !_.isEmpty(result.result);
                let contract = _.extend({}, this.props.contract, result.result);
                if (hasResult) {
                    this.props.refreshCurrentContract(this.props.contract.id, true, contract);
                }
            } else {
                if (_.isFunction(errorFunc)) errorFunc(Intl.get('common.edit.failed', '修改失败'));
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg || Intl.get('common.edit.failed', '修改失败'));
        });
    };

    handleSubmitEditValidityTime = (startTime, endTime, product) => {
        let {products} = this.state;
        let index = _.findIndex(products, item => {
            return item.id === product.id;
        });
        products[index].account_start_time = startTime;
        products[index].account_end_time = endTime;
        this.setState({
            products
        });
    };

    validate = (cb) => {
        let flag = this.producTableRef.handleSubmit('add');
        if(flag) {
            this.setState({
                products: flag
            }, () => {
                cb && cb(flag);
            });
        }else {
            cb && cb(flag);
        }
        return flag;
    };

    getTotalAmount = () => {
        // 获取合同金额的大小
        let totalAmout;
        let reports = _.get(this,'props.parent.refs.addReport.state.reports') || _.get(this,'props.contract.reports') || [];
        let totalReportsPrice = 0;
        reports.length > 0 ? totalReportsPrice = _.reduce(reports,(sum, item) => {
            const amount = +item.total_price;
            return sum + amount;
        }, 0) : '';

        totalAmout = (_.get(this,'props.contract.contract_amount') || removeCommaFromNum(this.props.totalAmout)) - totalReportsPrice;
        return totalAmout >= 0 ? totalAmout : 0;
    };

    render() {

        let num_col_width = 75, _this = this;

        // 如果是添加合同时，是可以编辑的（true），详情查看时，显示可编辑按钮，点编辑后，显示编辑状态且有保存取消按钮
        let isEditBtnShow = this.props.isDetailType && hasPrivilege(PRIVILEGE_MAP.CONTRACT_UPATE_PRIVILEGE);
        let isEdit = !this.props.isDetailType ? true :
            (isEditBtnShow && this.producTableRef ? this.producTableRef.state.isEdit : false);
        let isSaveCancelBtnShow = this.props.isDetailType;



        const formItems = [
            {
                title: Intl.get('common.start.end.time', '起止时间'),
                dataIndex: 'time',
                editable: true,
                editor: 'AntcValidity',
                editorProps: (record, isEdit) => {
                    return {
                        mode: isEdit ? 'add' : 'info',
                        className: 'validity-time',
                        startTime: isEdit ? record.account_start_time : moment(record.account_start_time) || '',
                        endTime: isEdit ? record.account_end_time : moment(record.account_end_time) || '',
                        onChange: (startTime,endTime) => this.handleSubmitEditValidityTime(startTime, endTime, record)
                    };
                },
                formLayOut: {
                    labelCol: { span: 5 },
                    wrapperCol: { span: 18 }
                }
            },
            {
                title: Intl.get('contract.21', '版本号'),
                dataIndex: 'version',
                editable: true,
                display: 'inline',
                formLayOut: {
                    labelCol: { span: 10 },
                    wrapperCol: { span: 12 }
                },
                editorConfig: {
                    rules: [{
                        required: true,
                        message: Intl.get('contract.44', '不能为空')
                    }]
                }
            },
            {
                title: Intl.get('sales.commission', '提成') + '(%)',
                dataIndex: 'commission_rate',
                editable: true,
                display: 'inline',
                formLayOut: {
                    labelCol: { span: 10 },
                    wrapperCol: { span: 12 }
                },
                editorConfig: {
                    rules: (text,record,index) => {
                        return [{
                            required: true,
                            message: Intl.get('contract.44', '不能为空')
                        }, getNumberValidateRule()];
                    }
                }
            },
            {
                title: `${Intl.get('common.app.count', '数量')}(${Intl.get('contract.22', '个')})`,
                dataIndex: 'count',
                editable: true,
                display: 'inline',
                formLayOut: {
                    labelCol: { span: 10 },
                    wrapperCol: { span: 12 }
                },
                editorConfig: {
                    rules: (text,record,index) => {
                        return [{
                            required: true,
                            message: Intl.get('contract.44', '不能为空')
                        }, getNumberValidateRule()];
                    }
                }
            },
            {
                title: Intl.get('contract.23', '总价') + '(' + Intl.get('contract.82', '元') + ')',
                dataIndex: 'total_price',
                editable: true,
                display: 'inline',
                formLayOut: {
                    labelCol: { span: 10 },
                    wrapperCol: { span: 12 }
                },
                dynamicRule: {
                    index: 2,
                    key: 'amount',
                    fn: (parent) => {
                        return {
                            validator: (rule,value,callback) => {
                                let currentTotalAmout = _this.getTotalAmount();
                                // 这里需要获取其他产品的价格
                                let validateArr = [];
                                _.map(this.state.products, (item, index) => {
                                    let ref = parent[`form${item.id}Ref`];
                                    let formValue = ref.props.form.getFieldsValue();
                                    if(!_.get(item,'account_start_time')) {
                                        item.account_start_time = moment().valueOf();
                                        item.account_end_time = moment().valueOf();
                                    }
                                    validateArr.push({...item, ...formValue});
                                });

                                let sumAmount = _.reduce(validateArr, (sum, item) => {
                                    const amount = +item.total_price;
                                    return sum + amount;
                                }, 0);
                                sumAmount -= value;

                                if(currentTotalAmout >= sumAmount + parseFloat(value)) {
                                    _this.setState({
                                        products: _.cloneDeep(validateArr)
                                    });
                                }
                                numberAddNoMoreThan(currentTotalAmout, sumAmount, Intl.get('contract.161', '已超合同额'), rule, value, callback);
                            }
                        };
                    },
                },
                editorConfig: {
                    rules: (text,record,index) => {
                        return [{
                            required: true,
                            message: Intl.get('contract.44', '不能为空')
                        }, getNumberValidateRule()];
                    }
                }
            },

        ];

        return (
            <div className="add-products" data-tracename="产品页面">
                <div className="product-forms">
                    <ProductList
                        addBtnText={Intl.get('common.product', '产品')}
                        ref={ref => this.producTableRef = ref}
                        defaultValueMap={defaultValueMap}
                        appList={this.props.appList.map(x => ({
                            client_id: x.app_id,
                            client_image: x.app_logo,
                            client_name: x.app_name
                        }))}
                        totalAmount={this.getTotalAmount()}
                        data={this.state.products}
                        dataSource={this.state.products}
                        isEdit={isEdit}
                        isEditBtnShow={isEditBtnShow}
                        isSaveCancelBtnShow={isSaveCancelBtnShow}
                        formItems={formItems}
                        onSave={this.handleProductSave}
                        handleCancel={this.handleProductCancel}
                        onChange={this.handleProductChange}
                        getTotalAmount={this.getTotalAmount}
                    />
                    {
                        !isEditBtnShow && !this.state.pristine && !this.state.valid ?
                            <div className="alert-container">
                                <Alert type="error" message={Intl.get('contract.table.form.fill', '请填写表格内容')} showIcon/>
                            </div> : null
                    }
                </div>
            </div>
        );
    }
}

module.exports = AddProduct;


