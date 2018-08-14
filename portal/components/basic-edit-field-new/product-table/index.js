/**
 * 产品展示、编辑组件

 * 适应场景：用在需要以表格形式展示数据，并能直接在表格内编辑、删除数据的情况下
 * 
 * 用法：
 * 支持antd表格的所有属性
 * 另外增加了两个属性：
 *   isEdit - 表格是否处于编辑状态，默认为false。若设置为true，则列定义中包含editable为true属性的列会显示为输入框，同时在每一行的后面会出现一个删除按钮
 *   onEdit - 表格数据被修改后触发的回调函数，会将改变后的表格数据整体传出去。通过将传出去的值再通过dataSource属性的方式回传回该组件，可实现表格展示与变化后的数据的同步。
 * 
 * 列定义中增加了一个属性：
 *   editable - 控制该列是否可编辑，若设置为true，则在表格的isEdit属性为true的情况下，该列会显示成输入框的形式，里面的值可以被编辑
 */
require('./style.less');
import PropTypes from 'prop-types'; 
import { AntcEditableTable } from 'antc';
import {DetailEditBtn} from '../../rightPanel';
import SaveCancelButton from '../../detail-card/save-cancel-button';
import SelectAppList from '../../select-app-list';
import { num as antUtilsNum } from 'ant-utils';
const parseAmount = antUtilsNum.parseAmount;

class ProductTable extends React.Component {
    static defaultProps = {
        appList: [],
        columns: [],
        dataSource: [],
        bordered: true,
        isAdd: false,
        isEdit: false,
    };

    static propTypes = {
        appList: PropTypes.array,
        columns: PropTypes.array,
        dataSource: PropTypes.array,
        bordered: PropTypes.bool,
        isAdd: PropTypes.bool,
        isEdit: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = {
            isEdit: this.props.isEdit || this.props.isAdd,
            columns: this.getColumns(),
            data: this.props.dataSource,
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
                    key: 'count'
                },
                {
                    title: Intl.get('crm.contract.money', '金额(元)'),
                    dataIndex: 'total_price',
                    editable: true,
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

    handleChange(value, recordIndex, column) {
    }

    handleCancel = () => {
        this.setState({
            isEdit: false
        });
    }

    handleSubmit = () => {
    }

    handleDelete(recordIndex) {
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
    render() {
        return (
            <div className="product-table">
                {this.state.isEdit ? null : (
                    <DetailEditBtn
                        onClick={this.showEdit}
                    /> 
                )}
                <AntcEditableTable
                    isEdit={this.state.isEdit}
                    columns={this.state.columns}
                    dataSource={this.state.data}
                    bordered={this.props.bordered}
                /> 
                {this.state.isEdit ? (
                    <div>
                        <SelectAppList
                            appList={this.props.appList}
                        /> 
                        {this.props.isAdd ? null : (
                            <SaveCancelButton
                                handleSubmit={this.handleSubmit}
                                handleCancel={this.handleCancel}
                            /> 
                        )}
                    </div>
                ) : null}
            </div>
        );
    }
}

export default ProductTable;
