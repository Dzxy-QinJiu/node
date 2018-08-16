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
        appList: [],
        columns: [],
        dataSource: [],
        bordered: true,
        isAdd: false,
        isEdit: false,
        isEditBtnShow: false,
        onChange: function() {},
        onSave: function() {},
        totalAmount: 0,
    };

    static propTypes = {
        appList: PropTypes.array,
        columns: PropTypes.array,
        dataSource: PropTypes.array,
        bordered: PropTypes.bool,
        isAdd: PropTypes.bool,
        isEdit: PropTypes.bool,
        isEditBtnShow: PropTypes.bool,
        onChange: PropTypes.func,
        onSave: PropTypes.func,
        totalAmount: PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.state = {
            isEdit: this.props.isEdit || this.props.isAdd,
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
                    componentType: 'inputNumber',
                    key: 'count'
                },
                {
                    title: Intl.get('crm.contract.money', '金额(元)'),
                    dataIndex: 'total_price',
                    editable: true,
                    componentType: 'inputNumber',
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
    }

    handleChange = data => {
        this.setState({
            data,
            saveErrMsg: '',
        }, () => {
            if (this.props.isAdd) {
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
            if (this.props.isAdd) {
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
                {this.props.isAdd && _.isEmpty(this.state.data) ? null : (
                    <AntcEditableTable
                        isEdit={this.state.isEdit}
                        onEdit={this.handleChange}
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
                        {this.props.isAdd ? null : (
                            <SaveCancelButton
                                handleSubmit={this.handleSubmit}
                                handleCancel={this.handleCancel}
                                loading={this.state.loading}
                                saveErrorMsg={this.state.saveErrMsg}
                            /> 
                        )}
                    </div>
                ) : null}
            </div>
        );
    }
}

export default ProductTable;
