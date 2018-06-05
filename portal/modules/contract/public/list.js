/**
 * 合同列表
 */

import { Table, Input, Select, Modal, message } from 'antd';
import TableUtil from '../../../components/antd-table-pagination';
import GeminiScrollBar from '../../../components/react-gemini-scrollbar';
import { getTeamName } from './utils';
const extend = require('extend');
const userData = require('../../../public/sources/user-data');
const DATE_FORMAT = oplateConsts.DATE_FORMAT;
import { CONTRACT_STAGE, CONTRACT_COLUMNS, REPAYMENT_COLUMNS, COST_COLUMNS } from '../consts';
import { formatAmount, decimalToPercent } from 'LIB_DIR/func';
import { contractEmitter } from '../../../public/sources/utils/emitters';
import routeList from '../common/route';
import ajax from '../common/ajax';
import Trace from 'LIB_DIR/trace';

let searchTimeout = null;
const LAYOUT_CONSTNTS = {
    BOTTOM: 20
};
const List = React.createClass({
    getInitialState: function() {
        return {
            condition: {},
            rangeParams: [],
            isScrollTop: this.props.isScrollTop,
            sum: this.props.sum,
            user_name: 'all',
            sales_name: 'all',
            sales_team: 'all',
            category: 'all',
            stage: 'all',
            isPreviewShow: false,
            previewList: [],
            selectedItemId: ''//选中的合同id
        };
    },
    componentWillReceiveProps: function(nextProps) {
        this.state.isScrollTop = nextProps.isScrollTop;
        this.state.sum = nextProps.sum;
        this.setState(this.state);

        //如果新属性中的合同列表不为空，且指定了需要打开右侧面板，则自动打开右侧面板
        //从订单点击查看合同过来的时候就是这种情况
        if (nextProps.contractList.length && !nextProps.isRightPanelShow && nextProps.shouldRightPanelShow) {
            //加延时，等表格渲染完后再点击
            setTimeout(() => {
                const td = $('.custom-tbody td')[0];
                $(td).click();
            });
        }
    },
    componentDidMount: function() {
        $(window).on('resize', this.setTableHeight);
        TableUtil.zoomInSortArea(this.refs.listTable);
        contractEmitter.on(contractEmitter.IMPORT_CONTRACT, this.onContractImport);
    },
    componentWillUnmount: function() {
        $(window).off('resize', this.setTableHeight);
        contractEmitter.removeListener(contractEmitter.IMPORT_CONTRACT, this.onContractImport);
    },
    componentDidUpdate: function() {
        this.setTableHeight();
        if (this.state.isScrollTop) {
            this.scrollTop();
        }
    },
    setTableHeight: function() {
        let newHeight = $(window).height() 
            - $('.custom-tbody').offset().top 
            - $('.custom-tfoot').outerHeight() 
            - LAYOUT_CONSTNTS.BOTTOM;
        $(this.refs.listTable).find('.custom-tbody').height(newHeight);
        this.refs.gemiScrollBar.update();
    },
    getRowKey: function(record, index) {
        return index;
    },
    onRowClick: function(record, index, e) {
        if (e.currentTarget.className === 'ant-table-selection-column') return;
        const $tr = $(e.target).closest('tr');
        $tr.addClass('current-row').siblings().removeClass('current-row');
        const view = this.props.type === 'cost' ? 'detailCost' : 'detail';
        this.state.selectedItemId = record.id;
        this.setState(this.state);
        this.props.showRightPanel(view, index);
    },
    //处理选中行的样式
    handleRowClassName: function(record, index) {
        if ((record.id == this.state.selectedItemId) && this.props.isRightPanelShow) {
            return 'current-row';
        }
        else {
            return '';
        }
    },
    onChange: function(pagination, filters, sorter) {
        this.props.getContractList(true, sorter);
    },
    onFilterChange: function(field, value) {
        //value可能为undefined，需要处理一下
        if (!value) {
            value = '';
        } else if (moment.isDate(value)) {
            value = moment(value).valueOf();
        } else {
            //此时value为一个事件对象
            value = value.target.value.trim();
        }

        if (value) {
            if (['>', '<', '='].indexOf(value) > -1) {
                return;
            }

            const matched = value.match(/(>|<)\s*(\d+\.?\d*)$/);

            if (matched) {
                const operator = matched[1];
                value = parseFloat(matched[2]);
                const params = this.state.rangeParams;
                const index = _.findIndex(params, item => item.name === field);
                let param = params[index];
                if (!param) {
                    param = {
                        name: field,
                        type: 'number',
                    };
                }
                if (operator === '>') {
                    param.from = value;
                    delete param.to;
                } else {
                    param.to = value;
                    delete param.from;
                }
                if (index === -1) {
                    params.push(param);
                } else {
                    params[index] = param;
                }
            } else {
                if (!isNaN(value)) {
                    value = parseFloat(value);
                }
                this.state.condition[field] = value;
            }
        } else {
            delete this.state.condition[field];
            const params = this.state.rangeParams;
            const index = _.findIndex(params, item => item.name === field);
            if (index > -1) params.splice(index, 1);
        }

        this.setState(this.state);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        searchTimeout = setTimeout(() => {
            this.props.getContractList(true);
            Trace.traceEvent(this.getDOMNode(),'按照' + field + '筛选');
        }, 500);
    },

    toggleDateSelector: function(field) {
        this.state[field] = !this.state[field];
        this.setState(this.state);
    },

    handleScrollBottom: function() {
        this.props.getContractList();
    },

    scrollTop: function() {
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
        this.setState({isScrollTop: false});
    },

    buildFilterSelect: function(column, list, key) {
        let options = list.map(item => {
            const value = key ? item[key] : item;
            return (<Option
                title={value}
                key={value}
            >
                {value}
            </Option>);
        });
        options.unshift(<Option key="all" title={Intl.get('common.all', '全部')}><ReactIntl.FormattedMessage id="common.all" defaultMessage="全部" /></Option>);

        column.title = (
            <Select
                showSearch={list.length > 10}
                optionFilterProp="children"
                dropdownMatchSelectWidth={false}
                value={this.state[column.dataIndex]}
                onChange={this.onFilterSelectChange.bind(this, column.dataIndex)}
            >
                {options}
            </Select>
        );
    },

    onFilterSelectChange: function(column, value) {
        let condition = this.state.condition;

        if (value === 'all') {
            delete condition[column];
        } else {
            condition[column] = value;
        }

        if (value !== this.state[column]) {
            this.state[column] = value;

            this.setState(this.state, () => {
                this.props.getContractList(true);
            });
        }
    },

    onContractImport(list) {
        this.setState({
            isPreviewShow: true,
            previewList: list,
        });
    },

    confirmImport(flag, cb) {
        const route = _.find(routeList, route => route.handler === 'uploadContractConfirm');

        const params = {
            flag: flag,
        };

        const arg = {
            url: route.path,
            type: route.method,
            params: params
        };
        
        ajax(arg).then(result => {
            if (_.isFunction(cb)) cb();
        }, () => {
            message.error(Intl.get('contract.86', '导入合同失败'));
        });
    },

    doImport() {
        this.confirmImport(true, () => {
            this.setState({
                isPreviewShow: false,
            });

            //刷新合同列表
            this.props.getContractList();
        });
    },

    cancelImport() {
        this.setState({
            isPreviewShow: false,
        });
        this.confirmImport(false);
    },

    render: function() {
        const _this = this;
        let columns = CONTRACT_COLUMNS;

        //销售查看自己的合同列表时不显示负责人列
        const firstContract = this.props.contractList[0];
        const currentUser = userData.getUserData().nick_name;
        if (firstContract && firstContract.user_name === currentUser) {
            columns = _.filter(columns, column => column.dataIndex !== 'user_name');
        }

        if (this.props.type === 'buy') {
            //采购合同不显示成本、毛利、回款等字段
            const excludeColumns = ['cost_price', 'gross_profit', 'total_amount', 'total_gross_profit', 'total_plan_amount', 'total_invoice_amount'];

            columns = _.filter(columns, column => {
                return excludeColumns.indexOf(column.dataIndex) < 0;
            });
        } else if (this.props.type === 'repayment') {
            //定义回款表格列
            columns = REPAYMENT_COLUMNS;
        } else if (this.props.type === 'cost') {
            //定义费用表格列
            columns = COST_COLUMNS;
        }

        columns = columns.map(column => {
            column.key = column.dataIndex;

            //带表头搜索的列
            const filterColumns = ['num', 'customer_name', 'user_name', 'sales_team', 'stage', 'contract_amount', 'cost_price', 'gross_profit', 'sales_name', 'repayment_amount', 'repayment_gross_profit'];

            if (filterColumns.indexOf(column.dataIndex) > -1) {
                column.hasFilter = true;
            }

            if (column.dataIndex === 'category' && this.props.type === 'sell') {
                column.hasFilter = true;
            }

            if (column.dataIndex === 'num') {
                column.width = 120;
            }

            if (column.dataIndex === 'customer_name') {
                column.width = 160;
            }

            if (['date', 'start_time', 'end_time', 'total_invoice_amount'].indexOf(column.dataIndex) > -1) {
                column.width = 90;
            }

            if (['date', 'start_time', 'end_time', 'repayment_date'].indexOf(column.dataIndex) > -1) {
                column.render = function(text) {
                    let time = text ? moment(text).format(DATE_FORMAT) : '';
                    return <span>{time}</span>;
                };
            }

            if (['date', 'start_time', 'end_time', 'repayment_date'].indexOf(column.dataIndex) > -1) {
                column.sorter = true;
            }

            if (column.sorter) {
                column.className = 'has-filter';
            }

            if (['contract_amount', 'cost_price', 'gross_profit', 'total_amount', 'total_gross_profit', 'total_plan_amount', 'total_invoice_amount', 'repayment_amount', 'repayment_gross_profit', 'cost'].indexOf(column.dataIndex) > -1) {
                column.className = 'number-value';
                column.render = function(text) {
                    if (column.dataIndex === 'cost') {
                        text = parseFloat(text);
                        text = isNaN(text) ? '' : text.toFixed(2);
                    } else {
                        text = formatAmount(text);
                    }

                    return <span>{text}</span>;
                };
            }

            if (['gross_profit_rate'].indexOf(column.dataIndex) > -1) {
                column.className = 'number-value';
                column.render = function(text) {
                    text = decimalToPercent(text);
                    return <span>{text}</span>;
                };
            }

            if (column.dataIndex === 'contract_amount') {
                column.className += ' border-left';
            }

            if (column.dataIndex === 'category') {
                column.render = function(text) {
                    text = text ? text : '';
                    return <span>{text}</span>;
                };
            }

            if (column.sorter) {
                column.className = 'has-filter';
            }

            if (column.dataIndex === 'repayment_is_first') {
                column.render = function(text, record) {
                    text = text === 'true' ? Intl.get('user.yes', '是') : Intl.get('user.no', '否');
                    return <span>{text}</span>;
                };
            }

            return column;
        });

        const filterColumns = extend(true, [], columns).map(column => {
            if (column.hasFilter) {
                if (column.dataIndex === 'sales_team') {
                    this.buildFilterSelect(column, this.props.teamList, 'groupName');
                } else if (column.dataIndex === 'user_name') {
                    this.buildFilterSelect(column, this.props.userList, 'nick_name');
                } else if (column.dataIndex === 'sales_name') {
                    this.buildFilterSelect(column, this.props.userList, 'nick_name');
                } else if (column.dataIndex === 'category' && this.props.type === 'sell') {
                    const typeList = _.filter(this.props.typeList, type => type !== Intl.get('contract.9', '采购合同'));
                    this.buildFilterSelect(column, typeList);
                } else if (column.dataIndex === 'stage') {
                    this.buildFilterSelect(column, CONTRACT_STAGE);
                } else {
                    column.title = (
                        <Input onChange={this.onFilterChange.bind(this, column.dataIndex)} />
                    );
                }
            } else {
                column.title = '';
            }

            if (column.sorter) delete column.sorter;

            return column;
        });

        const sum = this.state.sum;
        let sumColumns = extend(true, [], columns).map(column => {
            column.title = formatAmount(sum[column.dataIndex]);
            if (column.sorter) delete column.sorter;        
            if (!_.has(sum, column.dataIndex)) {
                column.colSpan = 0;
            }    
            return column;
        });
        //将第一个不计算合计的单元格colSpan设置为所有不计算合计的单元格数量
        sumColumns.find(x => !x.title).colSpan = sumColumns.filter(x => !_.has(sum, x.dataIndex)).length;
        let typeName = Intl.get('contract.125', '合同');
        if (this.props.type === 'repayment') {
            typeName = Intl.get('contract.108', '回款');
        }

        if (this.props.type === 'cost') {
            typeName = Intl.get('contract.133', '费用');
        }

        return (
            <div className="table-wrap splice-table" ref="listTable">
                <div className="custom-thead">
                    <Table
                        columns={columns}
                        pagination={false}
                        onChange={this.onChange}
                    />
                </div>
                {this.props.isTheadFilterShow ? (
                    <div className="custom-thead-filter">
                        <Table
                            columns={filterColumns}
                            pagination={false}
                        />
                    </div>
                ) : null}
                <div className="custom-tbody" ref="tableWrap">
                    <GeminiScrollBar
                        ref="gemiScrollBar"
                        listenScrollBottom={this.props.listenScrollBottom}
                        handleScrollBottom={this.handleScrollBottom}
                        itemCssSelector=".ant-table-tbody .ant-table-row"
                    >
                        <Table
                            dataSource={this.props.contractList}
                            columns={columns}
                            rowKey={this.getRowKey}
                            loading={this.props.isListLoading}
                            pagination={false}
                            rowClassName={this.handleRowClassName}
                            onRowClick={this.onRowClick}
                        />
                    </GeminiScrollBar>
                </div>
                <div className="custom-tfoot">
                    <Table
                        columns={sumColumns}
                        pagination={false}
                    />
                    <span className="info-title">
                        <ReactIntl.FormattedMessage
                            id="contract.124"
                            values={{
                                'num': this.props.contractCount + '',
                                'type': typeName
                            }}
                            defaultMessage={'共{num}个符合当前查询条件的{type}'} />
                        {this.props.type === 'cost' ? null : (
                            <span>
                                <span>, </span>
                                <ReactIntl.FormattedMessage
                                    id="contract.126"
                                    defaultMessage="相关款项合计"
                                />
                            (
                                <ReactIntl.FormattedMessage
                                    id="contract.160"
                                    defaultMessage="单位"
                                />
                                <span>: </span>
                                <ReactIntl.FormattedMessage
                                    id="contract.139"
                                    defaultMessage="万"
                                />
                            )
                            :
                            </span>
                        )}
                    </span>
                </div>
                <Modal
                    visible={this.state.isPreviewShow}
                    width="90%"
                    prefixCls="contract-import-modal ant-modal"
                    title={Intl.get('coontract.114', '导入合同') + Intl.get('common.preview', '预览')}
                    okText={Intl.get('common.sure', '确定') + Intl.get('common.import', '导入')}
                    onOk={this.doImport}
                    onCancel={this.cancelImport}
                >
                    {this.state.isPreviewShow ? (
                        <Table
                            dataSource={this.state.previewList}
                            columns={columns}
                            rowKey={this.getRowKey}
                            pagination={false}
                        />
                    ) : null}
                </Modal>
            </div>
        );
    }
});

module.exports = List;
