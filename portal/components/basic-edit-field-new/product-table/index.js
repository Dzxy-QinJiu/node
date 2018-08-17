/**
 * 产品展示、编辑组件
 */
require('./style.less');
import PropTypes from 'prop-types'; 
import classNames from 'classnames';
import { AntcEditableTable } from 'antc';
import {DetailEditBtn} from '../../rightPanel';
import SaveCancelButton from '../../detail-card/save-cancel-button';
import SelectAppList from '../../select-app-list';
import { num as antUtilsNum } from 'ant-utils';
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
        totalAmount: PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.state = {
            isEdit: this.props.isEdit,
            columns: this.getColumns(),
            data: this.props.dataSource,
            loading: false,
            saveErrMsg: '',
        };
    }

    getColumns() {
        let columns = this.props.columns;

        if (_.isEmpty(columns)) {
            columns = [
                {
                    title: Intl.get('crm.contract.product.name', '产品名称'),
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

        return columns;
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

    handleCancel = () => {
        this.setState({
            isEdit: false,
            data: this.props.dataSource,
            saveErrMsg: '',
        });
    }

    handleSubmit = () => {
        const totalAmount = this.props.totalAmount;

        const sumAmount = _.reduce(this.state.data, (sum, item) => {
            const amount = +item.total_price;
            return sum + amount;
        }, 0);

        if (totalAmount !== sumAmount) {
            this.setState({
                saveErrMsg: Intl.get('crm.contract.check.tips', '合同额与产品总额不相等，请核对')
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

        const errorFunc = () => {
            this.setState({
                loading: false,
                saveErrMsg: Intl.get('common.edit.failed', '修改失败'),
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
    getSelectAppList = selectedAppIds => {
        let data = _.cloneDeep(this.state.data);

        _.each(selectedAppIds, appId => {
            const selectedApp = _.find(this.props.appList, app => app.client_id === appId);

            data.push({
                id: selectedApp.client_id,
                name: selectedApp.client_name,
                count: APP_DEFAULT_INFO.COUNT,
                total_price: APP_DEFAULT_INFO.PRICE,
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

        return (
            <div className={className}>
                {this.state.isEdit || !this.props.isEditBtnShow ? null : (
                    <DetailEditBtn
                        onClick={this.showEdit}
                    /> 
                )}
                {_.isEmpty(this.state.data) ? null : (
                    <AntcEditableTable
                        isEdit={this.state.isEdit}
                        onChange={this.handleChange}
                        columns={this.state.columns}
                        dataSource={this.state.data}
                        bordered={this.props.bordered}
                    /> 
                )}
                {this.state.isEdit ? (
                    <div>
                        <SelectAppList
                            appList={appList}
                            getSelectAppList={this.getSelectAppList}
                        /> 
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
