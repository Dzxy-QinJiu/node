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
import { DISPLAY_TYPES, OPERATE_INFO, PRIVILEGE_MAP, VIEW_TYPE } from 'MOD_DIR/contract/consts';
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
            products = _.cloneDeep(this.props.products);
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
        totalAmout: 0,
        className: ''
    };

    producTableRef = null;

    static propTypes = {
        className: PropTypes.string,
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

    handleProductCancel = (index, id) => {
        let item = _.find(_.cloneDeep(this.props.products), item => {
            return item.id === id;
        });
        let mineProducts = this.state.products;
        mineProducts[index] = item;

        this.setState({products: mineProducts},() => {
            this.props.updateScrollBar();
        });
    };

    handleProductDelete = (id, successFunc, errorFunc, type) => {
        let products = _.filter(this.props.products, item => {
            return item.id !== id;
        });
        this.handleProductSave(products, successFunc, errorFunc, type);
    };

    handleProductSave = (saveObj,successFunc,errorFunc,type = DISPLAY_TYPES.UPDATE) => {
        saveObj = {products: saveObj, id: this.props.contract.id};

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
                message.success(OPERATE_INFO[type].success);
                if (_.isFunction(successFunc)) successFunc();
                const hasResult = _.isObject(result.result) && !_.isEmpty(result.result);
                let contract = _.extend(this.props.contract, result.result);
                if (hasResult) {
                    this.props.refreshCurrentContract(this.props.contract.id, true, contract);
                }
            } else {
                if (_.isFunction(errorFunc)) errorFunc(OPERATE_INFO[type].faild);
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg || OPERATE_INFO[type].faild);
        });
    };

    handleSubmitEditValidityTime = (startTime, endTime, product) => {
        if(!startTime) return false;
        let products = _.cloneDeep(this.state.products);
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
        let flag = this.producTableRef.handleSubmit(DISPLAY_TYPES.ADD);
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
        let totalAmout, reports;
        if(this.props.isDetailType) {
            reports = _.get(this,'props.contract.reports',[]);
        }else {
            reports = _.get(this,'props.parent.refs.addReport.state.reports',[]);
        }
        let totalReportsPrice = 0;
        reports.length > 0 ? totalReportsPrice = _.reduce(reports,(sum, item) => {
            const amount = +item.total_price;
            return sum + amount;
        }, 0) : '';

        totalAmout = (_.get(this,'props.contract.contract_amount') || removeCommaFromNum(this.props.totalAmout)) - totalReportsPrice || 0;
        return totalAmout;
    };
    // 验证毛利与总额大小
    validateAmount = (validateArr,rule,value,callback) => {
        let currentTotalAmout = this.getTotalAmount();
        let sumAmount = _.reduce(validateArr, (sum, item) => {
            const amount = +item.total_price;
            return sum + amount;
        }, 0);
        sumAmount -= value;

        if(currentTotalAmout >= sumAmount + parseFloat(value)) {
            this.setState({
                products: _.cloneDeep(validateArr)
            });
        }
        numberAddNoMoreThan(currentTotalAmout, sumAmount, Intl.get('contract.161', '已超合同额'), rule, value, callback);
    };

    render() {

        let num_col_width = 75, _this = this;

        // 如果是添加合同时，是可以编辑的（true），详情查看时，显示可编辑按钮，点编辑后，显示编辑状态且有保存取消按钮
        let isEditBtnShow = this.props.isDetailType && hasPrivilege(PRIVILEGE_MAP.CONTRACT_UPATE_PRIVILEGE);
        let isEdit = !this.props.isDetailType ? true :
            isEditBtnShow; //(isEditBtnShow && this.producTableRef ? this.producTableRef.state.isEdit : false);
        let isSaveCancelBtnShow = this.props.isDetailType;

        const appIds = _.map(this.state.products, 'id');

        const appList = _.filter(this.props.appList, app => appIds.indexOf(app.app_id) === -1);

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
                    labelCol: { span: 6 },
                    wrapperCol: { span: 18 }
                }
            },
            {
                title: Intl.get('contract.21', '版本号'),
                dataIndex: 'version',
                editable: true,
                display: 'inline',
                formLayOut: {
                    labelCol: { span: 12 },
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
                    labelCol: { span: 12 },
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
                    labelCol: { span: 12 },
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
                    labelCol: { span: 12 },
                    wrapperCol: { span: 12 }
                },
                dynamicRule: {
                    index: 2,
                    key: 'amount',
                    fn: (parent) => {
                        return {
                            validator: (rule,value,callback) => {
                                // 这里需要获取其他产品的价格
                                let validateArr = [];
                                _.each(this.state.products, (item, index) => {
                                    let ref = parent[`form${item.id}Ref`];
                                    let formValue = ref.props.form.getFieldsValue();
                                    if(!_.get(item,'account_start_time')) {
                                        item.account_start_time = moment().valueOf();
                                        item.account_end_time = moment().valueOf();
                                    }
                                    validateArr.push({...item, ...formValue});
                                });
                                this.validateAmount(validateArr,rule,value,callback);
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

        const ortherItems = [
            {
                title: Intl.get('common.product.name', '产品名称'),
                dataIndex: 'app_name',
                editable: true,
                index: 0,
                formLayOut: {
                    labelCol: { span: 6 },
                    wrapperCol: { span: 18 }
                },
                editor: 'Select',
                editorChildrenType: 'Option',
                editorChildren: (Children) => {
                    return _.map(appList, item => {
                        return <Children value={item.app_id} key={item.app_id}>{item.app_name}</Children>;
                    });
                },
                editorConfig: {
                    rules: [{
                        required: true,
                        message: Intl.get('contract.44', '不能为空')
                    }]
                }
            },
        ];

        return (
            <div className={`add-products ${this.props.className}`} data-tracename="添加编辑产品信息">
                <div className="product-forms clearfix">
                    <ProductList
                        addBtnText={Intl.get('config.product.add', '添加产品')}
                        title={Intl.get('contract.95', '产品信息')}
                        ref={ref => this.producTableRef = ref}
                        defaultValueMap={defaultValueMap}
                        appList={this.props.appList.map(x => ({
                            client_id: x.app_id,
                            client_image: x.app_logo,
                            client_name: x.app_name
                        }))}
                        totalAmount={this.getTotalAmount()}
                        contractId={_.get(this.props,'contract','')}
                        data={this.state.products}
                        dataSource={this.state.products}
                        isEdit={isEdit}
                        isEditBtnShow={isEditBtnShow}
                        isSaveCancelBtnShow={isSaveCancelBtnShow}
                        formItems={formItems}
                        ortherItems={ortherItems}
                        onSave={this.handleProductSave}
                        onDelete={this.handleProductDelete}
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


