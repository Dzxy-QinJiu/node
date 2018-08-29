/**
 * 合同列表
 */

var React = require('react');
import { Table, Input, Select, Modal, message, Button, Checkbox } from 'antd';
const CheckboxGroup = Checkbox.Group;
import TableUtil from '../../../components/antd-table-pagination';
import GeminiScrollBar from '../../../components/react-gemini-scrollbar';
import { getTeamName } from './utils';
const extend = require('extend');
const userData = require('../../../public/sources/user-data');
const DATE_FORMAT = oplateConsts.DATE_FORMAT;
import { CONTRACT_STAGE, CONTRACT_LABEL, SELLS_CONTRACT_COLUMNS, BUY_CONTRACT_COLUMNS, REPAYMENT_COLUMNS, COST_COLUMNS, VIEW_TYPE } from '../consts';
import { formatAmount, decimalToPercent } from 'LIB_DIR/func';
import { contractEmitter } from '../../../public/sources/utils/emitters';
import routeList from '../common/route';
import ajax from '../common/ajax';
import Trace from 'LIB_DIR/trace';
import classNames from 'classnames';
import websiteConfig from '../../../lib/utils/websiteConfig';
const setWebsiteConfig = websiteConfig.setWebsiteConfig;
const getLocalWebsiteConfig = websiteConfig.getLocalWebsiteConfig;

//窗口改变的事件emitter
const resizeEmitter = require('PUB_DIR/sources/utils/emitters').resizeEmitter;

let searchTimeout = null;
const LAYOUT_CONSTNTS = {
    BOTTOM: 20,
    H_SCROLL_BAR_HEIGHT: 15,
    CONTENT_PADDING: 16,
};

class List extends React.Component {
    componentWillReceiveProps(nextProps) {
        // 切换视图时清空表头搜索筛选条件
        if (nextProps.type !== this.props.type) {
            let filterSelected = {};
            for (const prop in this.state.filterSelected) {
                filterSelected[prop] = 'all';
            }
            let selectShowColumnsValue = this.getSelectShowColumnsValue(nextProps.type),
                currentTypeAllColumns = this.getCurrentTypeAllColumns(nextProps.type);
            this.handleSelectShowColumnsChange(selectShowColumnsValue, currentTypeAllColumns);

            this.setState({
                condition: {},
                filterSelected,
                currentTypeAllColumns
            });
        }

        this.setState({
            isScrollTop: nextProps.isScrollTop,
            sum: nextProps.sum
        });

        //如果新属性中的合同列表不为空，且指定了需要打开右侧面板，则自动打开右侧面板
        //从订单点击查看合同过来的时候就是这种情况
        if (nextProps.contractList.length && !nextProps.isRightPanelShow && nextProps.shouldRightPanelShow) {
            //加延时，等表格渲染完后再点击
            setTimeout(() => {
                const td = $('.custom-tbody td')[0];
                $(td).click();
            });
        }

        this.setState({
            hideCustomColumnDiv: true
        });
    }

    componentDidMount() {
        //窗口大小改变事件
        resizeEmitter.on(resizeEmitter.WINDOW_SIZE_CHANGE, this.setTableHeight);
        TableUtil.zoomInSortArea(this.refs.listTable);
        contractEmitter.on(contractEmitter.IMPORT_CONTRACT, this.onContractImport);
        // 获取展示列的值
        let selectShowColumnsValue = this.getSelectShowColumnsValue();
        // 根据当前获取的展示列的值设置当前展示的列
        this.handleSelectShowColumnsChange(selectShowColumnsValue);
    }

    componentWillUnmount() {
        //窗口大小改变事件
        resizeEmitter.removeListener(resizeEmitter.WINDOW_SIZE_CHANGE, this.setTableHeight);
        contractEmitter.removeListener(contractEmitter.IMPORT_CONTRACT, this.onContractImport);
    }

    componentDidUpdate() {
        this.setTableHeight();
        if (this.state.isScrollTop) {
            this.scrollTop();
        }
    }

    setTableHeight = () => {
        let newHeight = $(window).height() 
            - $('.custom-tbody').offset().top 
            - $('.custom-tfoot').outerHeight() 
            - LAYOUT_CONSTNTS.H_SCROLL_BAR_HEIGHT
            - LAYOUT_CONSTNTS.CONTENT_PADDING
            - LAYOUT_CONSTNTS.BOTTOM;
        $(this.refs.listTable).find('.custom-tbody').height(newHeight);
        this.refs.gemiScrollBar.update();
    };

    getRowKey = (record, index) => {
        return index;
    };

    onRowClick = (record, index, e) => {
        if (e.currentTarget.className === 'ant-table-selection-column') return;
        const $tr = $(e.target).closest('tr');
        $tr.addClass('current-row').siblings().removeClass('current-row');
        const view = this.props.type === VIEW_TYPE.COST ? 'detailCost' : 'detail';
        this.state.selectedItemId = record.id;
        this.setState(this.state);
        this.props.showRightPanel(view, index);
    };

    //处理选中行的样式
    handleRowClassName = (record, index) => {
        if ((record.id === this.state.selectedItemId) && this.props.isRightPanelShow) {
            return 'current-row';
        }
        else {
            return '';
        }
    };

    onChange = (pagination, filters, sorter) => {
        this.props.getContractList(true, sorter);
    };

    onFilterChange = (field, value) => {
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
            Trace.traceEvent(ReactDOM.findDOMNode(this),'按照' + field + '筛选');
        }, 500);
    };

    toggleDateSelector = (field) => {
        this.state[field] = !this.state[field];
        this.setState(this.state);
    };

    handleScrollBottom = () => {
        this.props.getContractList();
    };

    scrollTop = () => {
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
        this.setState({isScrollTop: false});
    };

    /**
     * 表头筛选下拉菜单构造器
     *
     * 参数说明：
     *
     * @clumn 当前列定义
     *
     * @list 用于生成下拉选项的列表数组，可能是简单数组，也可能是对象数组
     *
     * @valueKey 用于从对象数组中根据该key取出下拉选项的实际值
     * 例如：若list=[{value: "某某"}]，则若要构造<option value="某某">某某</option>这样的下拉选项，@valueKey就需要传"value"
     *
     * @nameKey 用于从对象数组中根据该key取出下拉选项的显示值
     * 例如：若list=[{name: "某某", value: "some one"}]，则若要构造<option value="some one">某某</option>这样的下拉选项，@valueKey就需要传"value"，@nameKey就需要传"name"
     *
     * 若@valueKey、@nameKey都不传，则认为list为简单数组，直接以数组项本身作为下拉菜单的显示值和实际值
     *
     */
    buildFilterSelect = (column, list, valueKey, nameKey) => {
        let options = list.map(item => {
            const name = nameKey ? item[nameKey] : '';
            const value = valueKey ? item[valueKey] : item;
            return (<Option
                title={value}
                key={value}
            >
                {name || value}
            </Option>);
        });
        options.unshift(<Option key="all" title={Intl.get('common.all', '全部')}><ReactIntl.FormattedMessage id="common.all" defaultMessage="全部" /></Option>);

        column.title = (
            <Select
                showSearch={list.length > 10}
                optionFilterProp="children"
                dropdownMatchSelectWidth={false}
                value={this.state.filterSelected[column.dataIndex]}
                onChange={this.onFilterSelectChange.bind(this, column.dataIndex)}
            >
                {options}
            </Select>
        );
    };

    onFilterSelectChange = (column, value) => {
        let condition = this.state.condition;

        if (value === 'all') {
            delete condition[column];
        } else {
            condition[column] = value;
        }

        if (value !== this.state[column]) {
            this.state.filterSelected[column] = value;

            this.setState(this.state, () => {
                this.props.getContractList(true);
            });
        }
    };

    onContractImport = (list) => {
        this.setState({
            isPreviewShow: true,
            previewList: list,
        });
    };

    confirmImport = (flag, cb) => {
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
    };

    doImport = () => {
        this.confirmImport(true, () => {
            this.setState({
                isPreviewShow: false,
            });

            //刷新合同列表
            this.props.getContractList();
        });
    };

    cancelImport = () => {
        this.setState({
            isPreviewShow: false,
        });
        this.confirmImport(false);
    };

    toggleCustomColumnDivVisible = () => {
        this.setState({
            hideCustomColumnDiv: !this.state.hideCustomColumnDiv
        });
    };

    // 设置当前选择的展示列及展示列的值数组
    handleSelectShowColumnsChange = (values, currentTypeAllColumns) => {
        if (!values.length) return;

        let newCurrentTypeShowColumns = [],
            allColumns = currentTypeAllColumns || this.state.currentTypeAllColumns;

        _.chain(allColumns).filter(column => {
            return values.includes(column.title);
        }).each(column => {
            newCurrentTypeShowColumns.push(column);
        }).value();

        this.setState({
            currentTypeShowColumns: newCurrentTypeShowColumns,
            selectShowColumnsValue: values
        });
    };

    // 获取当前所有列
    getCurrentTypeAllColumns = (nextTypeFlag) => {
        let type = nextTypeFlag || this.props.type;
        let columns = [];
        //根据视图类型定义表格列
        switch (type) {
            case VIEW_TYPE.SELL:
            //销售合同表格列
                columns = extend(true, [], SELLS_CONTRACT_COLUMNS);
                break;
            case VIEW_TYPE.BUY:
            //采购合同表格列
                columns = extend(true, [], BUY_CONTRACT_COLUMNS);
                break;
            case VIEW_TYPE.REPAYMENT:
            //回款表格列
                columns = extend(true, [], REPAYMENT_COLUMNS);
                break;
            case VIEW_TYPE.COST:
            //费用表格列
                columns = extend(true, [], COST_COLUMNS);
                break;
            default:
                columns = extend(true, [], SELLS_CONTRACT_COLUMNS);
        }
        //销售查看自己的合同列表时不显示负责人列
        const firstContract = this.props.contractList[0];
        const currentUser = userData.getUserData().nick_name;
        if (firstContract && firstContract.user_name === currentUser) {
            columns = _.filter(columns, column => column.dataIndex !== 'user_name');
        }

        //对表格列进行处理，添加扩展属性
        columns = columns.map(column => {
            column.key = column.dataIndex;

            //带表头搜索的列
            const filterColumns = ['num', 'customer_name', 'user_name', 'sales_team', 'stage', 'contract_amount', 'cost_price', 'gross_profit', 'sales_name', 'repayment_amount', 'repayment_gross_profit', 'label'];

            if (filterColumns.indexOf(column.dataIndex) > -1) {
                column.hasFilter = true;
            }

            if (column.dataIndex === 'category' && this.props.type === VIEW_TYPE.SELL) {
                column.hasFilter = true;
            }

            if (!column.className) {
                column.className = '';
            }

            if (column.sorter) {
                column.className += ' has-filter';
            }

            if (['contract_amount', 'cost_price', 'gross_profit', 'gross_profit_rate', 'total_amount', 'total_gross_profit', 'total_plan_amount', 'total_invoice_amount', 'repayment_amount', 'repayment_gross_profit', 'cost'].indexOf(column.dataIndex) > -1) {
                column.className += ' number-value';
                column.render = function(text) {
                    if (column.dataIndex === 'cost') {
                        text = parseFloat(text);
                        text = isNaN(text) ? '' : text.toFixed(2);
                    } else if (column.dataIndex === 'gross_profit_rate') {
                        text = decimalToPercent(text);
                    } else {
                        text = formatAmount(text);
                        text = parseFloat(text);
                        text = isNaN(text) ? '' : text.toFixed(2);
                    }

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

            //签约类型（新签/续约）
            if (column.dataIndex === 'label') {
                column.render = function(text, record) {
                    const label = _.find(CONTRACT_LABEL, item => item.value === text);
                    text = label ? label.name : '';
                    return <span>{text}</span>;
                };
            }

            column.label = column.title;
            column.value = column.title;

            return column;
        });

        return columns;
    };

    // 获取存储在localStorage中的当前合同类型的展示列值数组(默认为当前合同类型的全部列的值组成的数组)
    getSelectShowColumnsValue = (nextTypeFlag) => {
        let type = nextTypeFlag || this.props.type,
            websiteConfig = getLocalWebsiteConfig(),
            selectShowColumnsValue;
        if (websiteConfig && websiteConfig[type]) {
            selectShowColumnsValue = websiteConfig[type];
        } else {
            let columns = this.getCurrentTypeAllColumns(type);
            selectShowColumnsValue = columns.map(column => column.title);
        }
        return selectShowColumnsValue;
    };

    // 保存当前合同分类的展示列的值数组
    saveNewCustomColumns = () => {
        let curTypeSelectColumnsValueObj = {};
        curTypeSelectColumnsValueObj[this.props.type] = this.state.selectShowColumnsValue;
        setWebsiteConfig(curTypeSelectColumnsValueObj, this.toggleCustomColumnDivVisible);
    };

    //获取显示的列
    getShowColumns = () => {
        return extend(true, [], this.state.currentTypeShowColumns);
    };

    state = {
        condition: {},
        rangeParams: [],
        isScrollTop: this.props.isScrollTop,
        sum: this.props.sum,
        filterSelected: {
            user_name: 'all',
            sales_name: 'all',
            sales_team: 'all',
            category: 'all',
            stage: 'all',
            label: 'all',
        },
        isPreviewShow: false,
        previewList: [],
        selectedItemId: '',//选中的合同id
        hideCustomColumnDiv: true, // 是否隐藏自定义选择展示列的div
        currentTypeShowColumns: [], // 展示的列
        currentTypeAllColumns: this.getCurrentTypeAllColumns(), // 当前分类下所有列
        selectShowColumnsValue: [], // 选中的展示列的值
    };

    render() {
        const filterColumns = this.getShowColumns().map(column => {
            if (column.hasFilter) {
                if (column.dataIndex === 'sales_team') {
                    this.buildFilterSelect(column, this.props.teamList, 'groupName');
                } else if (column.dataIndex === 'user_name') {
                    this.buildFilterSelect(column, this.props.userList, 'nick_name');
                } else if (column.dataIndex === 'sales_name') {
                    this.buildFilterSelect(column, this.props.userList, 'nick_name');
                } else if (column.dataIndex === 'category' && this.props.type === VIEW_TYPE.SELL) {
                    const typeList = _.filter(this.props.typeList, type => type !== Intl.get('contract.9', '采购合同'));
                    this.buildFilterSelect(column, typeList);
                } else if (column.dataIndex === 'stage') {
                    this.buildFilterSelect(column, CONTRACT_STAGE);
                } else if (column.dataIndex === 'label') {
                    this.buildFilterSelect(column, CONTRACT_LABEL, 'value', 'name');
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
        let sumColumns = this.getShowColumns().map(column => {
            const columnSum = sum[column.dataIndex];

            //将非数值列标题置空，数值列标题设为转为万单位的数值
            if (isNaN(columnSum)) {
                column.title = '';
            } else {
                if (column.dataIndex === 'cost') {
                    column.title = columnSum;
                } else {
                    column.title = formatAmount(columnSum);
                }
                column.title = parseFloat(column.title);
                column.title = isNaN(column.title) ? '' : column.title.toFixed(2);
            }

            if (column.sorter) delete column.sorter;        

            return column;
        });

        let typeName = Intl.get('contract.125', '合同');

        if (this.props.type === VIEW_TYPE.REPAYMENT) {
            typeName = Intl.get('contract.108', '回款');
        }

        if (this.props.type === VIEW_TYPE.COST) {
            typeName = Intl.get('contract.133', '费用');
        }

        const tableWidth = this.state.currentTypeShowColumns.reduce((memo, column) => memo + (column.width || 100), 0);
        const style = {minWidth: tableWidth};

        let customColumnDivClassName = classNames('custom-column-div', {
            'hide-custom-column-div': this.state.hideCustomColumnDiv
        });

        let customColumnBackgroundDivClassName = classNames('custom-column-div-fullscreen-background', {
            'hide-custom-column-div': this.state.hideCustomColumnDiv
        });

        return (
            <div>
                <div>
                    <Button className='custom-column-button' title={Intl.get('common.table.customize', '自定义表格列')} onClick={this.toggleCustomColumnDivVisible}>
                        <i className='iconfont icon-down-twoline'></i>
                    </Button>
                    <div className={customColumnDivClassName}>
                        <CheckboxGroup options={this.state.currentTypeAllColumns} value={this.state.selectShowColumnsValue} onChange={this.handleSelectShowColumnsChange} />
                        <Button className='custom-column-div-save-button' type='primary' onClick={this.saveNewCustomColumns}>
                            {Intl.get('common.save', '保存')}
                        </Button>
                    </div>
                    <div className={customColumnBackgroundDivClassName} onClick={this.toggleCustomColumnDivVisible}></div>
                </div>
                <div className="table-wrap-outer">
                    <div className="table-wrap splice-table" style={style} ref="listTable">
                        <div className="custom-thead">
                            <Table
                                columns={this.state.currentTypeShowColumns}
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
                                itemCssSelector=".custom-tbody .ant-table-tbody .ant-table-row"
                            >
                                <Table
                                    dataSource={this.props.contractList}
                                    columns={this.state.currentTypeShowColumns}
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
                                    defaultMessage={'共{num}个{type}'} />
                                <span>
                                    <span>, </span>
                                    <ReactIntl.FormattedMessage
                                        id="contract.126"
                                        defaultMessage="相关合计"
                                    />
                                    <span>(</span>
                                    {this.props.type === VIEW_TYPE.COST ? (
                                        <ReactIntl.FormattedMessage
                                            id="contract.155"
                                            defaultMessage="元"
                                        />
                                    ) : (
                                        <ReactIntl.FormattedMessage
                                            id="contract.139"
                                            defaultMessage="万"
                                        />
                                    )}
                                    <span>) :</span>
                                </span>
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
                                    columns={this.state.currentTypeAllColumns}
                                    rowKey={this.getRowKey}
                                    pagination={false}
                                />
                            ) : null}
                        </Modal>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = List;

