/** Created by 2019-01-31 11:11 */

var React = require('react');
import { message, Select, Icon, Form, Input, DatePicker, Checkbox, Alert } from 'antd';
var FirstRepaymentSrc = require('../../image/first-repayment.png');

let Option = Select.Option;
let FormItem = Form.Item;
import Trace from 'LIB_DIR/trace';
import 'MOD_DIR/user_manage/public/css/user-info.less';
import DetailCard from 'CMP_DIR/detail-card';
import EditableTable from '../components/editable-table';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import ajax from 'MOD_DIR/contract/common/ajax';
import { DISPLAY_TYPES, OPERATE, PRIVILEGE_MAP} from 'MOD_DIR/contract/consts';
import routeList from 'MOD_DIR/contract/common/route';
import {parseAmount} from 'LIB_DIR/func';
import { getNumberValidateRule, numberAddNoMoreThan } from 'PUB_DIR/sources/utils/validate-util';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';

// 图片样式
var imgStyle = {
    width: '16px',
    height: '16px',
    marginLeft: '5px',
    verticalAlign: 'middle'
};
const disabledDate = function(current) {
    //不允许选择大于当前天的日期
    return current && current.valueOf() > Date.now();
};

class RepaymentInfo extends React.Component {
    state = {
        ...this.getInitStateData(this.props),
    };

    getInitStateData(props) {
        let hasEditPrivilege = hasPrivilege(PRIVILEGE_MAP.CONTRACT_UPDATE_REPAYMENT);


        return {
            formData: {},
            loading: false,
            repayLists: this.getRepayList(props.contract),
            submitErrorMsg: '',
            hasEditPrivilege,
            displayType: DISPLAY_TYPES.TEXT,
            isFirstAdd: false, // 是否添加了首笔回款列
            saveErrMsg: '',
            currentKey: '', //当前编辑项
        };
    }

    static defaultProps = {
        updateScrollBar: function() {}
    };

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps.contract, 'id') && this.props.contract.id !== nextProps.contract.id) {
            const contract = _.cloneDeep(nextProps.contract);

            this.setState({
                displayType: DISPLAY_TYPES.TEXT,
                repayLists: this.getRepayList(contract),
                isFirstAdd: false,
                currentKey: ''
            });
        }
    }
    getRepayList(contract) {
        let repayments = _.sortBy(_.cloneDeep(_.get(contract,'repayments',[])), item => item.date).reverse();
        return _.filter(repayments,item => item.type === 'repay');
    }
    // 获取更新后的列表
    getUpdateList() {
        let propRepayLists = this.getRepayList(this.props.contract);
        let repayLists;
        // 需要判断列表中是否有添加项
        // 有：合并并更新
        // 没有: 直接覆盖
        let addItem = _.filter(_.get(this.state,'repayLists',[]), item => item.isAdd);
        if(addItem) {
            repayLists = [...addItem,...propRepayLists];
        }else {
            repayLists = propRepayLists;
        }
        return repayLists;
    }
    changeDisplayType(type) {
        if (type === DISPLAY_TYPES.TEXT) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '关闭添加已回款输入区');
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
    handleSubmit = (type, index, id) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '添加已回款内容');
        let _this = this;
        let saveObj;
        if (type === DISPLAY_TYPES.DELETE) {
            saveObj = [id];
            const successFunc = (resultData) => {
                _this.setState({
                    repayLists: this.getRepayList(this.props.contract),
                }, () => {
                    this.props.updateScrollBar();
                });
            };
            this.editRepayment(type, saveObj,'', successFunc, (errormsg) => {
                message.error(errormsg);
            });
        } else if(type === DISPLAY_TYPES.ADD) {
            this.props.form.validateFields((err,value) => {
                if (err) return false;

                this.setState({loading: true});
                const params = {contractId: this.props.contract.id, type: 'repay'};
                let { formData } = this.state;
                formData = JSON.parse(JSON.stringify(formData));

                saveObj = {...formData,...value};
                if(saveObj.date) {
                    saveObj.date = saveObj.date.valueOf();
                }

                const successFunc = (resultData) => {
                    let repayments = _.sortBy(_.cloneDeep(this.props.contract.repayments) || [], item => item.date).reverse();
                    let repayLists = _.filter(repayments,item => item.type === 'repay');
                    _this.setState({
                        loading: false,
                        formData: {},
                        repayLists: this.getRepayList(this.props.contract),
                        submitErrorMsg: '',
                        displayType: DISPLAY_TYPES.TEXT,
                        currentRepayment: {}
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
                this.editRepayment(type, saveObj, params, successFunc, errorFunc);
            });
        }
    };
    editRepayment(type, data, params, successFunc, errorFunc) {

        const handler = type + 'Repayment';
        const route = _.find(routeList, route => route.handler === handler);
        let arg = {
            url: route.path,
            type: route.method,
            data: data,
        };
        if (params) arg.params = params;
        ajax(arg).then(result => {
            if (result.code === 0) {
                message.success(OPERATE[type] + Intl.get('contract.41', '成功'));
                //返回数据
                let resultData = result.result;

                //删除的时候没有返回数据，需要根据id从当前回款列表中取
                if (type === 'delete') {
                    const repaymentId = data[0];
                    resultData = _.find(this.props.contract.repayments, repayment => repayment.id === repaymentId);
                }else if(type === 'update') { // 更新后没有返回id
                    resultData = _.extend({},this.state.currentRepayment, resultData);
                }
                //刷新合同列表中的回款信息
                this.props.refreshCurrentContractRepayment(type, resultData);

                if (_.isFunction(successFunc)) successFunc(resultData);
            } else {
                if (_.isFunction(errorFunc)) errorFunc(OPERATE[type] + Intl.get('user.failed', '失败'));
            }
        }, errorMsg => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg || OPERATE[type] + Intl.get('user.failed', '失败'));
        });
    }
    handleCancel = () => {
        this.changeDisplayType(DISPLAY_TYPES.TEXT);
    };
    handleEditTableChange = (data) => {
        this.setState({repayLists: data});
    };
    handleColumnsChange = (type, key) => {
        let isFirstAdd = false;
        let displayType = this.state.displayType;
        if(type === 'editing') {
            isFirstAdd = this.isShowFirstColumn(key);
        }else if(type === 'addCancel') {
            // 添加项的取消修改
            displayType = DISPLAY_TYPES.TEXT;
        }else if(type === 'addAndEditCancel') {
            // 这里是因为已有项取消时有添加项存在，所以这里需要将isFirstAdd置为true
            isFirstAdd = this.isShowFirstColumn('');//true;
        }
        this.setState({
            isFirstAdd,
            displayType,
            saveErrMsg: '',
            currentKey: key
        });
    };
    handleEditTableSave = (data, successFunc, errorFunc) => {
        const params = {contractId: this.props.contract.id, type: 'repay'};
        let successFuncs, type = DISPLAY_TYPES.UPDATE;
        // 处理时间
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
                    repayLists: this.getRepayList(this.props.contract),
                    isFirstAdd: false,
                    displayType: DISPLAY_TYPES.TEXT,
                    currentKey: ''
                });
            };
        }else { // 编辑更新
            successFuncs = () => {
                _.isFunction(successFunc) && successFunc();

                this.setState({
                    repayLists: this.getUpdateList(),
                    currentKey: ''
                });
            };
        }
        this.editRepayment(type, data, params, successFuncs, (errorMsg) => {
            this.setState({saveErrMsg: errorMsg});
            _.isFunction(errorFunc) && errorFunc();
        });
    };
    handleDelete = (record,successFunc, errorFunc) => {
        let saveObj = [record.id];
        const successFuncs = () => {
            _.isFunction(successFunc) && successFunc();
            this.setState({
                repayLists: this.getUpdateList(),
                currentKey: ''
            }, () => {
                this.props.updateScrollBar();
            });
        };
        this.editRepayment(DISPLAY_TYPES.DELETE, saveObj,'', successFuncs, (errorMsg) => {
            message.error(errorMsg);
            _.isFunction(errorFunc) && errorFunc();
        });
    };
    // 点击添加按钮
    addList = () => {
        let repayLists = _.cloneDeep(this.state.repayLists);
        repayLists.unshift({
            id: '',
            date: moment(),
            amount: '',
            gross_profit: '',
            is_first: 'false',
            isAdd: true, // 是否是添加
        });
        this.setState({
            repayLists,
            isFirstAdd: this.isShowFirstColumn(''),
            currentKey: '',
            displayType: DISPLAY_TYPES.EDIT
        },() => {
            this.repaymentTableRef.setState({
                editingKey: ''
            });
        });
    };

    // 是否显示首笔添加列
    isShowFirstColumn(key) {
        /** 数据源是否有添加首笔的项
         *  是： 是当前项 ？ 显示 ：不显示；
         *  否： 显示
         * */
        let isShowFirstAdd;
        let hasIsFirstItem = _.find(this.state.repayLists, item => {
            return !_.isNil(item.is_first) && 'true' === item.is_first;
        });
        if(hasIsFirstItem) {
            isShowFirstAdd = hasIsFirstItem.id === key;
        }else {
            isShowFirstAdd = true;
        }
        return isShowFirstAdd;
    }

    renderAddRepaymentPanel(repayLists) {
        let {getFieldDecorator} = this.props.form;
        let formData = this.state.formData;

        return (
            <Form layout='inline' className='detailcard-form-container new-add-repayment-container'>
                <FormItem
                    className='add-repayment-date'
                >
                    {
                        getFieldDecorator('date', {
                            initialValue: formData.date ? moment(formData.date) : moment(),
                        })(
                            <DatePicker
                                disabledDate={disabledDate}
                            />
                        )
                    }
                </FormItem>
                <ReactIntl.FormattedMessage id="contract.108" defaultMessage="回款"/>
                <FormItem>
                    {
                        getFieldDecorator('amount', {
                            initialValue: formData.amount,
                            rules: [{
                                required: true,
                                message: Intl.get('contract.44', '不能为空')
                            }, getNumberValidateRule(), numberAddNoMoreThan.bind(this, this.props.contract.contract_amount, this.props.contract.total_amount, Intl.get('contract.161', '已超合同额'))]
                        })(
                            <Input
                                value={formData.amount}
                            />
                        )
                    }
                </FormItem>
                <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元"/>,
                <ReactIntl.FormattedMessage id="contract.109" defaultMessage="毛利"/>
                <FormItem>
                    {
                        getFieldDecorator('gross_profit', {
                            initialValue: formData.gross_profit,
                            rules: [{
                                required: true,
                                message: Intl.get('contract.44', '不能为空')
                            }, getNumberValidateRule(), numberAddNoMoreThan.bind(this, this.props.form.getFieldValue('amount'), 0, Intl.get('contract.gross.profit.can.not.exceed.repayment', '毛利不能大于回款'))]
                        })(
                            <Input
                                value={formData.gross_profit}
                            />
                        )
                    }
                </FormItem>
                <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元"/>
                <FormItem
                    className='add-repayment-check'
                >
                    {
                        getFieldDecorator('is_first', {
                            initialValue: ['true', true].indexOf(formData.is_first) > -1,
                        })(
                            <Checkbox
                                // checked={['true', true].indexOf(formData.is_first) > -1}
                            >
                                {Intl.get('contract.167', '首笔回款')}
                            </Checkbox>
                        )
                    }
                </FormItem>
                <SaveCancelButton
                    loading={this.state.loading}
                    saveErrorMsg={this.state.submitErrorMsg}
                    handleSubmit={this.handleSubmit.bind(this,'add')}
                    handleCancel={this.handleCancel}
                />
            </Form>
        );
    }

    renderRepaymentList(repayLists, total_plan_amount) {
        //已回款总额
        let repaymentsAmount = 0;

        if (repayLists.length) {
            repaymentsAmount = _.reduce(repayLists, (memo, item) => {
                // 过滤掉单个添加的，和当前项
                const num = item.isAdd || this.state.currentKey === item.id ? 0 : parseFloat(item.amount);
                return memo + num;
            }, 0);
        }

        let num_col_width = 80;
        const columns = [
            {
                title: Intl.get('contract.237', '回款日期'),
                dataIndex: 'date',
                editable: true,
                inputType: 'date',
                editor: 'DatePicker',
                editorConfig: {
                    initialValue: (value) => {
                        return moment(value);
                    }
                },
                editorProps: {
                    disabledDate
                },
                width: this.state.isFirstAdd ? '25%' : '30%',
                align: 'left',
                render: (text, record, index) => {
                    return <span>{moment(text).format(oplateConsts.DATE_FORMAT)}{['true', true].indexOf(record.is_first) > -1 ? <img style={imgStyle} src={FirstRepaymentSrc}/> : null}</span>;
                },
            },
            {
                title: `${Intl.get('contract.28', '回款额')}(${Intl.get('contract.155', '元')})`,
                dataIndex: 'amount',
                editable: true,
                width: this.state.isFirstAdd ? num_col_width : 'auto',
                editorConfig: {
                    rules: [{
                        required: true,
                        message: Intl.get('contract.44', '不能为空')
                    }, getNumberValidateRule(), numberAddNoMoreThan.bind(this, this.props.contract.contract_amount, repaymentsAmount, Intl.get('contract.161', '已超合同额'))]
                }
            },
            {
                title: `${Intl.get('contract.29', '回款毛利')}(${Intl.get('contract.155', '元')})`,
                dataIndex: 'gross_profit',
                editable: true,
                width: this.state.isFirstAdd ? 95 : 'auto',
                dynamicRule: {
                    index: 2,
                    key: 'amount',
                    fn: (parent) => {
                        return {
                            validator: (rule,value,callback) => {
                                let dynamicRef = _.get(parent,'amounteditableFormCellRef');
                                let dynamicValue = dynamicRef.props.form.getFieldValue('amount');
                                numberAddNoMoreThan(dynamicValue, 0, Intl.get('contract.gross.profit.can.not.exceed.repayment', '毛利不能大于回款'), rule, value, callback);
                            }
                        };
                    },
                },
                editorConfig: {
                    rules: (text, record, index) => {
                        return [{
                            required: true,
                            message: Intl.get('contract.44', '不能为空')
                        }, getNumberValidateRule()];
                    }
                }
            }
        ];


        if(this.state.isFirstAdd){
            columns.splice(1, 0, {
                title: Intl.get('contract.repeyment.first', '首笔'),
                dataIndex: 'is_first',
                editor: 'Switch',
                editorConfig: {
                    initialValue: (value) => {
                        return ['true', true].indexOf(value) > -1;
                    },
                    valuePropName: 'checked',
                },
                editable: true,
                width: 45,
                render: (text, record, index) => {
                    return text === 'true' ? Intl.get('user.yes', '是') : Intl.get('user.no', '否');
                }
            });
        }

        return (
            <EditableTable
                ref={ref => this.repaymentTableRef = ref}
                parent={this}
                isEdit={this.state.hasEditPrivilege}
                columns={columns}
                defaultKey='id'
                dataSource={repayLists}
                onChange={this.handleEditTableChange}
                onColumnsChange={this.handleColumnsChange}
                onSave={this.handleEditTableSave}
                onDelete={this.handleDelete}
            />
        );
    }

    // 渲染基础信息
    renderBasicInfo() {
        const contract = this.props.contract;
        const repayLists = this.state.repayLists;
        const noRepaymentData = !repayLists.length && !this.state.loading;
        const contract_amount = _.get(this.props.contract,'contract_amount',0);
        const total_amount = _.get(this.props.contract,'total_amount',0);
        const total_plan_amount = contract_amount - total_amount;

        const content = () => {
            return (
                <div className="repayment-list">
                    {/*是展示状态，且有权限编辑，且尾款不等于0*/}
                    {this.state.displayType === DISPLAY_TYPES.TEXT && this.state.hasEditPrivilege && total_plan_amount > 0 ? (
                        <span className="iconfont icon-add detail-edit-add" onClick={this.addList}
                            title={Intl.get('common.add', '添加')}/>) : null}
                    {this.renderRepaymentList(repayLists, total_plan_amount)}
                    {this.state.saveErrMsg ? <Alert type="error" message={this.state.saveErrMsg} showIcon /> : null}
                </div>
            );
        };

        let repayTitle = (
            <div className="repayment-repay">
                <span>{Intl.get('contract.194', '回款进程')}: </span>
                <span className='repayment-label'>{Intl.get('contract.179', '已回款')}: {parseAmount(total_amount)}{Intl.get('contract.82', '元')}/ </span>
                <span className='repayment-label'>{Intl.get('contract.180', '尾款')}: {parseAmount(total_plan_amount)}{Intl.get('contract.82', '元')}</span>
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

RepaymentInfo.propTypes = {
    contract: PropTypes.object,
    repayLists: PropTypes.array,
    handleSubmit: PropTypes.func,
    showLoading: PropTypes.func,
    hideLoading: PropTypes.func,
    updateScrollBar: PropTypes.func,
    refreshCurrentContract: PropTypes.func,
    refreshCurrentContractRepayment: PropTypes.func,
    form: PropTypes.object
};
module.exports = Form.create()(RepaymentInfo);

