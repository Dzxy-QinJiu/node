var React = require('react');
/**
 * 产品展示、编辑组件
 */
require('./style.less');
import PropTypes from 'prop-types'; 
import classNames from 'classnames';
import {DetailEditBtn} from '../../rightPanel';
import SaveCancelButton from '../../detail-card/save-cancel-button';
import {AntcAppSelector, AntcEditableTable} from 'antc';
import { num as antUtilsNum } from 'ant-utils';
import Trace from 'LIB_DIR/trace';
const parseAmount = antUtilsNum.parseAmount;
// 开通应用，默认的数量和金额
const APP_DEFAULT_INFO = {
    COUNT: 1,
    PRICE: 1000
};

class ProductTable extends React.Component {
    static defaultProps = {
        //应用列表
        appList: [],
        //表格列定义
        columns: [],
        //表格数据
        dataSource: [],
        //表格是否显示边框
        bordered: true,
        //是否显示保存取消按钮
        isSaveCancelBtnShow: true,
        //表格是否处于编辑状态
        isEdit: false,
        //编辑按钮是否显示
        isEditBtnShow: false,
        //变更事件，在表格内容变化后会被触发，其回调参数为变化后的表格数据
        onChange: function() {},
        //保存事件，在点击保存按钮后会被触发，其回调参数为变化后的表格数据
        onSave: function() {},
        //预设总金额，用于验证所有产品的金额之和是否正确
        totalAmount: 0,
        //编辑按钮的提示文案
        editBtnTip: Intl.get('common.update', '修改'),
        //默认值和对应key的map
        defaultValueMap: {
            count: APP_DEFAULT_INFO.COUNT,
            total_price: APP_DEFAULT_INFO.PRICE
        }
    };

    static propTypes = {
        appList: PropTypes.array,
        columns: PropTypes.array,
        dataSource: PropTypes.array,
        bordered: PropTypes.bool,
        isSaveCancelBtnShow: PropTypes.bool,
        isEdit: PropTypes.bool,
        isEditBtnShow: PropTypes.bool,
        onChange: PropTypes.func,
        onSave: PropTypes.func,
        onEditBtnSubmit: PropTypes.func,
        totalAmount: PropTypes.number,
        editBtnTip: PropTypes.string,
        defaultValueMap: PropTypes.object,
        data: PropTypes.array,
        appendDOM: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.element,
        ]),
        addBtnText: PropTypes.string,
        handleCancel: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            isEdit: this.props.isEdit,
            data: this.props.dataSource,
            loading: false,
            saveErrMsg: '',
        };
    }

    getDefaultColumns() {
        return [
            {
                title: Intl.get('common.product.name', '产品名称'),
                dataIndex: 'name',
                key: 'name',
                render: (text, record, index) => {
                    return <span className='app-info'>{this.renderAppIconName(text, record.id)}</span>;
                }
            },
            {
                title: Intl.get('crm.contract.account.count', '账号数量'),
                dataIndex: 'count',
                editable: true,
                //                    componentType: 'inputNumber',
                key: 'count'
            },
            {
                title: Intl.get('crm.contract.money', '金额(元)'),
                dataIndex: 'total_price',
                editable: true,
                //                    componentType: 'inputNumber',
                key: 'total_price',
                render: (text) => {
                    return <span>{parseAmount(text.toFixed(2))}</span>;
                }
            }
        ];
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props.dataSource, nextProps.dataSource)) {
            this.setState({
                data: nextProps.dataSource,
            });
        }
    }

    handleChange = data => {
        this.setState({
            data,
            saveErrMsg: '',
        }, () => {
            if (this.props.onChange) {
                this.props.onChange(data);
            }
        });
    }

    handleCancel = (e) => {
        this.setState({
            isEdit: false,
            data: this.props.dataSource,
            saveErrMsg: '',
        });
        if(_.isFunction(this.props.handleCancel)) this.props.handleCancel();
        Trace.traceEvent(e, '取消对产品的修改');
    }

    handleSubmit = () => {
        const totalAmount = this.props.totalAmount;

        const sumAmount = _.reduce(this.state.data, (sum, item) => {
            const amount = +item.total_price;
            return sum + amount;
        }, 0);

        // 需求改为不大于合同总额
        if (sumAmount > totalAmount) {
            this.setState({
                // saveErrMsg: Intl.get('crm.contract.check.tips', '合同额与产品总额不相等，请核对')
                saveErrMsg: Intl.get('contract.mount.check.tip', '总价合计不能大于合同总额{num}元，请核对',{num: totalAmount})
            });
            return;
        }

        this.setState({loading: true});

        const data = _.cloneDeep(this.state.data);

        const successFunc = () => {
            this.setState({
                loading: false,
                saveErrMsg: '',
                isEdit: false,
            });
        };

        const errorFunc = (errorMsg) => {
            this.setState({
                loading: false,
                saveErrMsg: errorMsg || Intl.get('common.edit.failed', '修改失败')
            });
        };

        this.props.onSave(data, successFunc, errorFunc);
    }

    showEdit = () => {
        this.setState({
            isEdit: true
        });
    }

    renderAppIconName(appName, appId) {
        let appList = this.props.appList;
        let matchAppObj = _.find( appList, (appItem) => {
            return appItem.client_id === appId;
        });
        return (
            <span className='app-icon-name'>
                {appName ? (
                    matchAppObj && matchAppObj.client_image ? (
                        <span className='app-self'>
                            <img src={matchAppObj.client_image} />
                        </span>
                    ) : (
                        <span className='app-default'>
                            <i className='iconfont icon-app-default'></i>
                        </span>
                    )
                ) : null}
                <span className='app-name' title={appName}>{appName}</span>
            </span>
        );
    }
    handleAppSelect = selectedAppList => {
        let data = _.cloneDeep(this.state.data);

        _.each(selectedAppList, app => {
            data.push({
                id: app.client_id,
                name: app.client_name,
                ...this.props.defaultValueMap
            });
        });

        this.setState({data}, () => {
            if (this.props.onChange) {
                this.props.onChange(data);
            }
        });
    }
    render() {
        const appNames = _.map(this.state.data, 'name');

        const appList = _.filter(this.props.appList, app => appNames.indexOf(app.client_name) === -1);

        const className = classNames('product-table', {
            'is-edit': this.state.isEdit,
        });
        const columns = _.isEmpty(this.props.columns) ? this.getDefaultColumns() : this.props.columns;
        return (
            <div className={className}>
                {this.state.isEdit || !this.props.isEditBtnShow ? null : (
                    <DetailEditBtn
                        title={this.props.editBtnTip}
                        onClick={this.showEdit}
                    /> 
                )}
                <AntcEditableTable
                    isEdit={this.state.isEdit}
                    onChange={this.handleChange}
                    columns={columns}
                    dataSource={this.props.data || this.state.data}
                    bordered={this.props.bordered}
                />
                {this.state.isEdit ? (
                    <div>
                        <div className="add-app-container">
                            <AntcAppSelector
                                appList={appList}
                                onConfirm={this.handleAppSelect}
                                appendDOM={this.props.appendDOM}    
                                addBtnText={this.props.addBtnText}                                               
                            /> 
                        </div>
                        {this.props.isSaveCancelBtnShow ? (
                            <SaveCancelButton
                                handleSubmit={this.handleSubmit}
                                handleCancel={this.handleCancel}
                                loading={this.state.loading}
                                saveErrorMsg={this.state.saveErrMsg}
                            /> 
                        ) : null}
                    </div>
                ) : null}
            </div>
        );
    }
}

export default ProductTable;
