/** Created by 2019-01-31 11:11 */

var React = require('react');
import { message, Select, Icon, Form, Input, DatePicker, Checkbox, Alert } from 'antd';

let Option = Select.Option;
let FormItem = Form.Item;
import Trace from 'LIB_DIR/trace';
import 'MOD_DIR/user_manage/public/css/user-info.less';
var AlertTimer = require('CMP_DIR/alert-timer');
import DetailCard from 'CMP_DIR/detail-card';
import EditableTable from '../components/editable-table';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import ajax from 'MOD_DIR/contract/common/ajax';
import { DISPLAY_TYPES, OPERATE, OPERATE_INFO, PRIVILEGE_MAP, VIEW_TYPE } from 'MOD_DIR/contract/consts';
import routeList from 'MOD_DIR/contract/common/route';
import { getNumberValidateRule } from 'PUB_DIR/sources/utils/validate-util';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';

const disabledDate = function(current) {
    //不允许选择大于当前天的日期
    return current && current.valueOf() > Date.now();
};

class InvoiceAmount extends React.Component {
    state = {
        ...this.getInitStateData(this.props),
    };

    getInitStateData(props) {
        let hasEditPrivilege = hasPrivilege(PRIVILEGE_MAP.CONTRACT_ADD_INVOICE_AMOUNT);

        return {
            loading: false,
            invoiceLists: this.getInvoiceLists(props.contract),
            submitErrorMsg: '',
            hasEditPrivilege,
            displayType: DISPLAY_TYPES.TEXT,
            saveErrMsg: ''
        };
    }

    static defaultProps = {
        updateScrollBar: function() {}
    };

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps.contract, 'id') && this.props.contract.id !== nextProps.contract.id) {

            this.setState({
                displayType: DISPLAY_TYPES.TEXT,
                invoiceLists: this.getInvoiceLists(nextProps.contract),
            });
        }
    }
    getInvoiceLists(contract) {
        return _.sortBy(_.cloneDeep(_.get(contract,'invoices',[])), item => item.date).reverse();
    }
    // 获取更新后的列表
    getUpdateList() {
        let propLists = this.getInvoiceLists(this.props.contract);
        let Lists;
        // 需要判断列表中是否有添加项
        // 有：合并并更新
        // 没有: 直接覆盖
        let addItem = _.filter(_.get(this.state,'invoiceLists',[]), item => item.isAdd);
        if(addItem) {
            Lists = [...addItem,...propLists];
        }else {
            Lists = propLists;
        }
        return Lists;
    }
    changeDisplayType(type) {
        if (type === DISPLAY_TYPES.TEXT) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '关闭添加开发票额输入区');
            this.setState({
                displayType: type,
                submitErrorMsg: '',
            }, () => {
                this.props.updateScrollBar();
            });
        } else if (type === DISPLAY_TYPES.EDIT) {
            this.setState({
                displayType: type
            }, () => {
                this.props.updateScrollBar();
            });
        }
    }
    handleSubmit = (type) => {
        let _this = this;
        let saveObj, params;
        if(type === DISPLAY_TYPES.ADD) {
            this.props.form.validateFields((err,value) => {
                if (err) return false;

                this.setState({loading: true});

                saveObj = {...value};
                if(saveObj.date) {
                    saveObj.date = saveObj.date.valueOf();
                }
                if(_.isNil(saveObj.contract_id)){
                    saveObj.contract_id = this.props.contract.id;
                }

                const successFunc = (resultData) => {
                    _this.setState({
                        loading: false,
                        invoiceLists: this.getInvoiceLists(this.props.contract),
                        submitErrorMsg: '',
                        displayType: DISPLAY_TYPES.TEXT
                    }, () => {
                        this.props.updateScrollBar();
                    });
                };
                const errorFunc = (errorMsg) => {
                    _this.setState({
                        loading: false,
                        submitErrorMsg: errorMsg
                    });
                };
                this.editInvoice(type, saveObj, params, '', successFunc, errorFunc);
            });
        }
    };
    editInvoice(type, data, params, id, successFunc, errorFunc) {

        const handler = type + 'InvoiceAmount';
        const route = _.find(routeList, route => route.handler === handler);

        let url = route.path;
        url = url + '?type=' + VIEW_TYPE.SELL;
        if(type === DISPLAY_TYPES.DELETE) {
            url += '&contract_id=' + this.props.contract.id;
        }

        let arg = {
            url: url,
            type: route.method,
            data: data,
        };
        if (params) arg.params = params;


        let targetName, changePropName, isInvoiceBasicInforOrInvoices = type;
        targetName = Intl.get('contract.39', '发票额记录');
        changePropName = 'invoices';

        Trace.traceEvent(ReactDOM.findDOMNode(this), OPERATE[type] + targetName);

        ajax(arg).then(result => {
            if (result.code === 0) {
                message.success(OPERATE_INFO[type].success);
                this.props.refreshCurrentContractNoAjax(changePropName, isInvoiceBasicInforOrInvoices, result.result, id);

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
        let successFuncs, type = DISPLAY_TYPES.UPDATE;
        // 处理时间
        if(data.date){
            data.date = data.date.valueOf();
        }
        // 没有合同id时，需要添加
        if(_.isNil(data.contract_id)){
            data.contract_id = this.props.contract.id;
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
                    invoiceLists: this.getInvoiceLists(this.props.contract),
                    displayType: DISPLAY_TYPES.TEXT
                });
            };
        }else { // 编辑更新
            successFuncs = () => {
                _.isFunction(successFunc) && successFunc();
                this.setState({
                    invoiceLists: this.getUpdateList()
                }, () => {
                    this.props.updateScrollBar();
                });
            };
        }
        this.editInvoice(type, data, '', _.get(data,'id',''), successFuncs, (errorMsg) => {
            this.setState({saveErrMsg: errorMsg});
            _.isFunction(errorFunc) && errorFunc();
        });
    };

    handleDelete = (record,successFunc, errorFunc) => {
        let params = { id: record.id };
        const successFuncs = () => {
            _.isFunction(successFunc) && successFunc();
            this.setState({
                invoiceLists: this.getUpdateList(),
            }, () => {
                this.props.updateScrollBar();
            });
        };
        this.editInvoice(DISPLAY_TYPES.DELETE, '', params, record.id, successFuncs, (errorMsg) => {
            this.setState({ saveErrMsg: errorMsg });
            _.isFunction(errorFunc) && errorFunc();
        });
    };

    handleColumnsChange = (type) => {
        let displayType = this.state.displayType;
        if(type === 'addCancel') {
            // 添加项的取消修改
            displayType = DISPLAY_TYPES.TEXT;
        }
        this.setState({
            displayType,
            saveErrMsg: ''
        });
    };
    // 点击添加按钮
    addList = () => {
        let invoiceLists = _.cloneDeep(this.state.invoiceLists);
        invoiceLists.unshift({
            id: '',
            date: moment(),
            amount: '',
            isAdd: true, // 是否是添加
        });
        this.setState({
            invoiceLists,
            displayType: DISPLAY_TYPES.EDIT
        },() => {
            this.invoiceAmountTableRef.setState({
                editingKey: ''
            });
        });
    };

    renderAddInvoicePanel(invoiceLists) {
        let {getFieldDecorator} = this.props.form;

        return (
            <Form layout='inline' className='detailcard-form-container new-add-form-container'>
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
                <ReactIntl.FormattedMessage id="contract.43" defaultMessage="开出"/>
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
                <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元"/>,
                <ReactIntl.FormattedMessage id="contract.46" defaultMessage="发票"/>
                <SaveCancelButton
                    loading={this.state.loading}
                    saveErrorMsg={this.state.submitErrorMsg}
                    handleSubmit={this.handleSubmit.bind(this,'add')}
                    handleCancel={this.handleCancel}
                />
            </Form>
        );
    }

    renderInvoiceList(invoiceLists) {
        let num_col_width = 75;
        const columns = [
            {
                title: Intl.get('contract.197', '开票日期'),
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
                title: `${Intl.get('contract.198', '发票额')}(${Intl.get('contract.155', '元')})`,
                dataIndex: 'amount',
                editable: true,
                width: 'auto',
                editorConfig: {
                    rules: [{
                        required: true,
                        message: Intl.get('contract.44', '不能为空')
                    }, getNumberValidateRule()]
                }
            }
        ];

        return (
            <EditableTable
                ref={ref => this.invoiceAmountTableRef = ref}
                parent={this}
                isEdit={this.state.hasEditPrivilege}
                columns={columns}
                defaultKey='id'
                dataSource={invoiceLists}
                onSave={this.handleEditTableSave}
                onColumnsChange={this.handleColumnsChange}
                onDelete={this.handleDelete}
            />
        );
    }

    // 渲染基础信息
    renderBasicInfo() {
        const invoiceLists = this.state.invoiceLists;
        const noRepaymentData = !invoiceLists.length && !this.state.loading;

        const content = () => {
            return (
                <div className="repayment-list">
                    {this.state.displayType === DISPLAY_TYPES.TEXT && this.state.hasEditPrivilege ? (
                        <span className="iconfont icon-add detail-edit-add" onClick={this.addList}
                            title={Intl.get('common.add', '添加')}/>) : null}
                    {this.renderInvoiceList(invoiceLists)}
                    {this.state.saveErrMsg ? <AlertTimer time={4000} type="error" message={this.state.saveErrMsg} showIcon onHide={() => {
                        this.setState({
                            saveErrMsg: ''
                        });
                    }} /> : null}
                </div>
            );
        };

        let repayTitle = (
            <div className="repayment-repay">
                <span>{Intl.get('contract.199', '开票历史')}</span>
            </div>
        );

        return (
            <DetailCard
                content={content()}
                title={repayTitle}
            />
        );
    }


    render() {
        return this.renderBasicInfo();
    }
}

InvoiceAmount.propTypes = {
    contract: PropTypes.object,
    invoiceLists: PropTypes.array,
    handleSubmit: PropTypes.func,
    showLoading: PropTypes.func,
    hideLoading: PropTypes.func,
    updateScrollBar: PropTypes.func,
    refreshCurrentContract: PropTypes.func,
    refreshCurrentContractNoAjax: PropTypes.func,
    form: PropTypes.object
};
module.exports = Form.create()(InvoiceAmount);

