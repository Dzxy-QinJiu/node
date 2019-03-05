/** Created by 2019-03-02 21:24 */
var React = require('react');
import { message, Alert } from 'antd';

import Trace from 'LIB_DIR/trace';
import DetailCard from 'CMP_DIR/detail-card';
import EditableTable from '../components/editable-table';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import ajax from 'MOD_DIR/contract/common/ajax';
import {
    LITE_SERVICE_TYPE,
    OPERATE_INFO,
    PRIVILEGE_MAP,
    REPORT_TYPE,
    DISPLAY_TYPES,
    VIEW_TYPE
} from 'MOD_DIR/contract/consts';
import routeList from 'MOD_DIR/contract/common/route';
import { getNumberValidateRule } from 'PUB_DIR/sources/utils/validate-util';

const defaultValueMap = {
    num: 1,
    total_price: 1000,
    commission_rate: 6
};

class DetailReport extends React.Component {
    state = {
        ...this.getInitStateData(this.props),
    };

    getInitStateData(props) {
        let hasEditPrivilege = hasPrivilege(PRIVILEGE_MAP.CONTRACT_UPATE_PRIVILEGE);
        let appList = REPORT_TYPE.concat(LITE_SERVICE_TYPE).map(x => ({
            id: x,
            name: x
        }));

        return {
            loading: false,
            reports: this.getReportLists(props.contract),
            submitErrorMsg: '',
            hasEditPrivilege,
            displayType: DISPLAY_TYPES.TEXT,
            saveErrMsg: '',
            appList
        };
    }

    static defaultProps = {
        updateScrollBar: function() {}
    };

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps.contract, 'id') && this.props.contract.id !== nextProps.contract.id) {

            this.setState({
                displayType: DISPLAY_TYPES.TEXT,
                reports: this.getReportLists(nextProps.contract),
            });
        }
    }
    getReportLists(contract) {
        let reports = _.cloneDeep(_.get(contract,'reports',[]));
        _.each(reports,(item) => {
            if(!item.name) {
                item.id = item.type;
                item.name = item.type;
            }
        });
        return reports;
    }
    // 获取更新后的列表
    getUpdateList() {
        let propLists = this.getReportLists(this.props.contract);
        let Lists;
        // 需要判断列表中是否有添加项
        // 有：合并并更新
        // 没有: 直接覆盖
        let addItem = _.filter(_.get(this.state,'reports',[]), item => !item.isAdd);
        if(addItem) {
            Lists = [...addItem,...propLists];
        }else {
            Lists = propLists;
        }
        return Lists;
    }
    // 是否大于合同总额
    isGtAmount(reports) {
        // 获取产品总价
        let products = _.get(this,'props.contract.products',[]);
        let totalProductsPrice = 0;
        products.length > 0 ? totalProductsPrice = _.reduce(products,(sum, item) => {
            const amount = +item.total_price;
            return sum + amount;
        }, 0) : '';
        // 获取剩余合同金额
        let totalAmount = parseFloat(this.props.contract.contract_amount) - totalProductsPrice;

        const sumAmount = _.reduce(reports, (sum, item) => {
            const amount = +item.total_price;
            return sum + amount;
        }, 0);

        // 需求改为不大于合同总额
        return sumAmount > totalAmount;
    }
    editReportsInfo(type, saveObj,successFunc,errorFunc) {
        saveObj = {reports: saveObj, id: this.props.contract.id};
        Trace.traceEvent(ReactDOM.findDOMNode(this),'修改服务产品信息');
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
                message.success(OPERATE_INFO[type]['success']);
                const hasResult = _.isObject(result.result) && !_.isEmpty(result.result);
                let contract = _.extend(this.props.contract,result.result);
                if (hasResult) {
                    this.props.refreshCurrentContract(this.props.contract.id, true, contract);
                }
                if (_.isFunction(successFunc)) successFunc();
            } else {
                if (_.isFunction(errorFunc)) errorFunc(OPERATE_INFO[type]['faild']);
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg || OPERATE_INFO[type]['faild']);
        });
    }
    handleEditTableSave = (data, successFunc, errorFunc) => {
        let successFuncs, type = DISPLAY_TYPES.UPDATE;
        data = _.cloneDeep(data);
        // 这里需要将数据进行合并，修改项和未修改项一并提交
        let reports = _.filter(this.getReportLists(this.props.contract), item => item.id !== data.id);
        data.id = data.type;
        data.name = data.type;
        // 如果是添加
        if(_.get(data,'isAdd',false)) {
            // 需要删除isAdd属性
            delete data.isAdd;
            type = DISPLAY_TYPES.ADD;
            successFuncs = () => {
                _.isFunction(successFunc) && successFunc();
                this.setState({
                    reports: this.getReportLists(this.props.contract),
                    displayType: DISPLAY_TYPES.TEXT,
                    saveErrMsg: ''
                });
            };
        }else { // 编辑更新
            successFuncs = () => {
                _.isFunction(successFunc) && successFunc();
                this.setState({
                    reports: this.getUpdateList(),
                    saveErrMsg: ''
                }, () => {
                    this.props.updateScrollBar();
                });
            };
        }
        reports = [...[data], ...reports];

        this.editReportsInfo(type, reports, successFuncs, (errorMsg) => {
            this.setState({ saveErrMsg: errorMsg });
            _.isFunction(errorFunc) && errorFunc();
        });
    };
    handleDelete = (record,successFunc, errorFunc) => {
        let data = _.cloneDeep(record);
        let reports = _.cloneDeep(_.filter(this.getReportLists(this.props.contract), item => item.id !== data.id));
        const successFuncs = () => {
            _.isFunction(successFunc) && successFunc();
            this.setState({
                reports: this.getUpdateList(),
            }, () => {
                this.props.updateScrollBar();
            });
        };
        this.editReportsInfo(DISPLAY_TYPES.DELETE, reports, successFuncs, (errorMsg) => {
            this.setState({ saveErrMsg: errorMsg});
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
    // 总价与合同总额验证事件，
    handleAmountValide = (data) => {
        data = _.cloneDeep(data);
        let reports = _.filter(this.getReportLists(this.props.contract), item => item.id !== data.id);
        reports = [...[data], ...reports];
        // 判断是否大于合同总额
        let result = this.isGtAmount(reports);

        if (result) {
            this.setState({
                saveErrMsg: Intl.get('contract.mount.check.tip', '总价合计不能大于合同总额{num}元，请核对',{num: this.props.contract.contract_amount})
            });
            return false;
        }
        return true;
    };
    // 点击添加按钮
    addList = () => {
        let reports = _.cloneDeep(this.state.reports);
        reports.unshift({
            id: '',
            name: '',
            type: '',
            ...defaultValueMap,
            isAdd: true, // 是否是添加
        });
        this.setState({
            reports,
            displayType: DISPLAY_TYPES.EDIT,
            saveErrMsg: ''
        },() => {
            this.reportTableRef.setState({
                editingKey: ''
            });
        });
    };
    renderReportList(reports) {
        let num_col_width = 75;
        const appNames = _.map(this.state.reports, 'name');

        const appList = _.filter(this.state.appList, app => appNames.indexOf(app.name) === -1);

        const columns = [
            {
                title: Intl.get('contract.75', '服务类型'),
                dataIndex: 'type',
                editable: true,
                width: '30%',
                editor: 'Select',
                editorChildrenType: 'Option',
                editorChildren: (Childern) => {
                    return _.map(appList, app => {
                        return (<Childern value={app.id} key={app.id}>{app.name}</Childern>);
                    });
                },
                editorConfig: {
                    rules: [{
                        required: true,
                        message: Intl.get('contract.44', '不能为空')
                    }]
                },
                getIsEdit: text => !text
            },
            {
                title: `${Intl.get('common.app.count', '数量')}(${Intl.get('contract.22', '个')})`,
                dataIndex: 'num',
                editable: true,
                width: 'auto',
                editorConfig: {
                    rules: [{
                        required: true,
                        message: Intl.get('contract.44', '不能为空')
                    }, getNumberValidateRule()]
                }
            },
            {
                title: `${Intl.get('contract.23', '总价')}(${Intl.get('contract.82', '元')})`,
                dataIndex: 'total_price',
                editable: true,
                width: 'auto',
                editorConfig: {
                    rules: [{
                        required: true,
                        message: Intl.get('contract.44', '不能为空')
                    }, getNumberValidateRule()]
                }
            },
            {
                title: Intl.get('sales.commission', '提成') + '(%)',
                dataIndex: 'commission_rate',
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
                ref={ref => this.reportTableRef = ref}
                parent={this}
                isEdit={this.state.hasEditPrivilege}
                columns={columns}
                defaultKey='id'
                dataSource={reports}
                onSave={this.handleEditTableSave}
                onColumnsChange={this.handleColumnsChange}
                onDelete={this.handleDelete}
                onValidate={this.handleAmountValide}
            />
        );
    }

    render() {
        const reports = this.state.reports;

        const content = () => {
            return (
                <div>
                    {this.state.displayType === DISPLAY_TYPES.TEXT && this.state.hasEditPrivilege ? (
                        <span className="iconfont icon-add" onClick={this.addList}
                            title={Intl.get('common.add', '添加')}/>) : null}
                    {this.renderReportList(reports)}
                    {this.state.saveErrMsg ? <Alert type="error" message={this.state.saveErrMsg} showIcon /> : null}
                </div>
            );
        };

        let reportTitle = (
            <div>
                <span>{Intl.get('contract.96', '服务信息')}</span>
            </div>
        );

        return (
            <DetailCard
                className='detail-report-container contract-repayment-container'
                content={content()}
                title={reportTitle}
            />
        );
    }
}

DetailReport.propTypes = {
    contract: PropTypes.object,
    updateScrollBar: PropTypes.func,
    refreshCurrentContract: PropTypes.func,
};
module.exports = DetailReport;

