/** Created by 2019-01-31 11:11 */
/**
 * 已付款信息展示及编辑页面
 */
var React = require('react');
import { message, Select, Icon, Form, Input, DatePicker, Checkbox, Alert } from 'antd';

let Option = Select.Option;
let FormItem = Form.Item;
import Trace from 'LIB_DIR/trace';
import 'MOD_DIR/user_manage/public/css/user-info.less';
import DetailCard from 'CMP_DIR/detail-card';
import EditableTable from '../components/editable-table';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import ajax from 'MOD_DIR/contract/common/ajax';
import { DISPLAY_TYPES, OPERATE, OPERATE_INFO, PRIVILEGE_MAP } from 'MOD_DIR/contract/consts';
import routeList from 'MOD_DIR/contract/common/route';
import { getNumberValidateRule, numberAddNoMoreThan } from 'PUB_DIR/sources/utils/validate-util';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';

const disabledDate = function(current) {
    //不允许选择大于当前天的日期
    return current && current.valueOf() > Date.now();
};

class DetailPayment extends React.Component {
    state = {
        ...this.getInitStateData(this.props),
    };

    getInitStateData(props) {
        let hasEditPrivilege = hasPrivilege(PRIVILEGE_MAP.CONTRACT_ADD_PAYMENT);

        return {
            loading: false,
            paymentLists: this.getPaymentLists(this.props.contract),
            submitErrorMsg: '',
            hasEditPrivilege,
            displayType: DISPLAY_TYPES.TEXT,
            saveErrMsg: '',
            currentKey: '', // 当前编辑项
        };
    }

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps.contract, 'id') && this.props.contract.id !== nextProps.contract.id) {

            this.setState({
                displayType: DISPLAY_TYPES.TEXT,
                paymentLists: this.getPaymentLists(nextProps.contract),
                currentKey: ''
            });
        }
    }

    updateScrollBar = () => {
        const scrollBar = this.refs.gemiScrollBar;

        if (!scrollBar) {
            return;
        }

        scrollBar.update();
    };

    getPaymentLists(contract) {
        return _.sortBy(_.cloneDeep(_.get(contract,'payments',[])), item => item.date).reverse();
    }
    // 获取更新后的列表
    getUpdateList() {
        let propPaymentLists = this.getPaymentLists(this.props.contract);
        let payLists;
        // 需要判断列表中是否有添加项
        // 有：合并并更新
        // 没有: 直接覆盖
        let addItem = _.filter(_.get(this.state,'paymentLists',[]), item => item.isAdd);
        if(addItem) {
            payLists = [...addItem,...propPaymentLists];
        }else {
            payLists = propPaymentLists;
        }
        return payLists;
    }
    changeDisplayType(type) {
        if (type === DISPLAY_TYPES.TEXT) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '关闭添加付款输入区');
            this.setState({
                displayType: type,
                submitErrorMsg: '',
            }, () => {
                this.updateScrollBar();
            });
        } else if (type === DISPLAY_TYPES.EDIT) {
            this.setState({
                displayType: type
            }, () => {
                this.updateScrollBar();
            });
        }
    }
    handleSubmit = (type) => {
        let _this = this;
        let saveObj;
        if(type === DISPLAY_TYPES.ADD) {
            this.props.form.validateFields((err,value) => {
                if (err) return false;

                this.setState({loading: true});

                saveObj = {...value};
                const params = {contractId: this.props.contract.id};

                if(saveObj.date) {
                    saveObj.date = saveObj.date.valueOf();
                }

                const successFunc = (resultData) => {
                    _this.setState({
                        loading: false,
                        paymentLists: this.getPaymentLists(this.props.contract),
                        submitErrorMsg: '',
                        displayType: DISPLAY_TYPES.TEXT
                    }, () => {
                        this.updateScrollBar();
                    });
                };
                const errorFunc = (errorMsg) => {
                    _this.setState({
                        loading: false,
                        submitErrorMsg: errorMsg
                    });
                };
                this.editPayment(type, saveObj, params, '', successFunc, errorFunc);
            });
        }
    };
    editPayment(type, data, params, id, successFunc, errorFunc) {
        const handler = type + 'Payment';
        const route = _.find(routeList, route => route.handler === handler);
        let arg = {
            url: route.path,
            type: route.method,
            data: data,
        };
        if (params) arg.params = params;


        Trace.traceEvent(ReactDOM.findDOMNode(this), OPERATE[type] + '付款信息');

        ajax(arg).then(result => {
            if (result.code === 0) {
                message.success(OPERATE_INFO[type].success);

                this.props.refreshCurrentContractNoAjax('payments', type, result.result, id);

                if (_.isFunction(successFunc)) successFunc(result.result);
            } else {
                if (_.isFunction(errorFunc)) errorFunc(OPERATE_INFO[type].faild);
            }
        }, errorMsg => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg || OPERATE_INFO[type].faild);
        });
    }
    handleCancel = () => {
        this.changeDisplayType(DISPLAY_TYPES.TEXT);
    };
    handleEditTableSave = (data, successFunc, errorFunc) => {
        const params = {contractId: this.props.contract.id};
        let successFuncs, type = DISPLAY_TYPES.UPDATE;
        if(data.date){
            data.date = data.date.valueOf();
        }
        // 如果是添加
        if(_.get(data,'isAdd',false)) {
            type = DISPLAY_TYPES.ADD;
            // 需要删除isAdd和id属性
            delete data.isAdd;
            delete data.id;

            successFuncs = () => {
                _.isFunction(successFunc) && successFunc();
                this.setState({
                    paymentLists: this.getPaymentLists(this.props.contract),
                    displayType: DISPLAY_TYPES.TEXT,
                    currentKey: ''
                }, () => {
                    this.updateScrollBar();
                });
            };
        }else { // 编辑更新
            successFuncs = () => {
                _.isFunction(successFunc) && successFunc();
                this.setState({
                    paymentLists: this.getUpdateList(),
                    currentKey: ''
                });
            };
        }
        this.editPayment(type, data, params, data.id, successFuncs, (errorMsg) => {
            this.setState({ saveErrMsg: errorMsg });
            _.isFunction(errorFunc) && errorFunc();
        });
    };

    handleDelete = (record,successFunc, errorFunc) => {
        let params = { id: record.id };
        const successFuncs = (resultData) => {
            _.isFunction(successFunc) && successFunc();
            this.setState({
                paymentLists: this.getUpdateList(),
                currentKey: ''
            }, () => {
                this.updateScrollBar();
            });
        };
        this.editPayment(DISPLAY_TYPES.DELETE, '', params, record.id, successFuncs, (errorMsg) => {
            message.error(errorMsg);
            _.isFunction(errorFunc) && errorFunc();
        });
    };

    handleColumnsChange = (type, key) => {
        let displayType = this.state.displayType;
        if(type === 'addCancel') {
            // 添加项的取消修改
            displayType = DISPLAY_TYPES.TEXT;
        }
        this.setState({
            displayType,
            saveErrMsg: '',
            currentKey: key
        });
    };

    // 点击添加按钮
    addList = () => {
        let paymentLists = _.cloneDeep(this.state.paymentLists);
        paymentLists.unshift({
            id: '',
            date: moment(),
            amount: '',
            isAdd: true, // 是否是添加
        });
        this.setState({
            paymentLists,
            displayType: DISPLAY_TYPES.EDIT,
            currentKey: ''
        });
    };

    renderAddPaymentPanel(paymentLists) {
        let {getFieldDecorator} = this.props.form;

        return (
            <Form layout='inline' className='detailcard-form-container new-add-repayment-container'>
                <FormItem
                    className='add-repayment-date'
                >
                    {
                        getFieldDecorator('date', {
                            initialValue: moment(),
                        })(
                            <DatePicker
                                disabledDate={disabledDate}
                            />
                        )
                    }
                </FormItem>
                <ReactIntl.FormattedMessage id="contract.91" defaultMessage="付款"/>
                <FormItem>
                    {
                        getFieldDecorator('amount', {
                            rules: [{
                                required: true,
                                message: Intl.get('contract.44', '不能为空')
                            }, getNumberValidateRule()]
                        })(
                            <Input/>
                        )
                    }
                </FormItem>
                <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元"/>
                <SaveCancelButton
                    loading={this.state.loading}
                    saveErrorMsg={this.state.submitErrorMsg}
                    handleSubmit={this.handleSubmit.bind(this,DISPLAY_TYPES.ADD)}
                    handleCancel={this.handleCancel}
                />
            </Form>
        );
    }

    renderPaymentList(paymentLists) {
        //已付款总额
        let paymentsAmount = 0;

        if (paymentLists.length) {
            paymentsAmount = _.reduce(paymentLists, (memo, item) => {
                // 过滤掉单个添加的，和当前项
                const num = item.isAdd || this.state.currentKey === item.id ? 0 : parseFloat(item.amount);
                return memo + num;
            }, 0);
        }
        let num_col_width = 75;
        const columns = [
            {
                title: Intl.get( 'contract.236', '付款日期'),
                dataIndex: 'date',
                editable: true,
                editor: 'DatePicker',
                editorConfig: {
                    initialValue: (value) => {
                        return moment(value);
                    }
                },
                editorProps: {
                    disabledDate
                },
                width: 'auto',
                render: (text, record, index) => {
                    return <span>{moment(text).format(oplateConsts.DATE_FORMAT)}</span>;
                },
            },
            {
                title: `${Intl.get('contract.200', '付款额')}(${Intl.get('contract.155', '元')})`,
                dataIndex: 'amount',
                editable: true,
                width: 'auto',
                editorConfig: {
                    rules: [{
                        required: true,
                        message: Intl.get('contract.44', '不能为空')
                    }, getNumberValidateRule(), numberAddNoMoreThan.bind(this, this.props.contract.contract_amount, paymentsAmount, Intl.get('contract.161', '已超合同额'))]
                }
            }
        ];

        return (
            <EditableTable
                ref={ref => this.paymentTableRef = ref}
                parent={this}
                isEdit={this.state.hasEditPrivilege}
                columns={columns}
                defaultKey='id'
                dataSource={paymentLists}
                onSave={this.handleEditTableSave}
                onColumnsChange={this.handleColumnsChange}
                onDelete={this.handleDelete}
            />
        );
    }

    // 渲染基础信息
    renderBasicInfo() {
        const paymentLists = this.state.paymentLists;
        const noPaymentData = !paymentLists.length && !this.state.loading;
        const contract_amount = _.get(this.props.contract,'contract_amount',0);
        //已添加的付款总额
        let paymentsAmount = 0;

        if (paymentLists.length) {
            paymentsAmount = _.reduce(paymentLists, (memo, item) => {
                // 过滤掉单个添加的
                const num = item.isAdd ? 0 : parseFloat(item.amount);
                return memo + num;
            }, 0);
        }

        const content = (
            <div className="repayment-list">
                {/*是展示状态，且有权限编辑，且合同总额大于已付款总额*/}
                {this.state.displayType === DISPLAY_TYPES.TEXT && this.state.hasEditPrivilege && contract_amount > paymentsAmount ? (
                    <span className="iconfont icon-add" onClick={this.addList}
                        title={Intl.get('common.add', '添加')}/>) : null}
                {this.renderPaymentList(paymentLists)}
                {this.state.saveErrMsg ? <Alert type="error" message={this.state.saveErrMsg} showIcon /> : null}
            </div>
        );

        let payTitle = (
            <div className="repayment-repay">
                <span>{Intl.get('contract.peyment.info', '付款信息')}</span>
            </div>
        );

        return (
            <DetailCard
                content={content}
                titleBottomBorderNone={noPaymentData}
                title={payTitle}
            />
        );
    }


    render() {
        return (
            <div className='clearfix contract-repayment-container' style={{height: this.props.height}} data-tracename="付款页面">
                <GeminiScrollBar ref='geminiScrollBar'>
                    {this.renderBasicInfo()}
                </GeminiScrollBar>
            </div>
        );
    }
}

DetailPayment.propTypes = {
    height: PropTypes.string,
    contract: PropTypes.object,
    handleSubmit: PropTypes.func,
    showLoading: PropTypes.func,
    hideLoading: PropTypes.func,
    refreshCurrentContract: PropTypes.func,
    refreshCurrentContractNoAjax: PropTypes.func,
    form: PropTypes.object
};
module.exports = Form.create()(DetailPayment);

