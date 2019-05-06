/**
 * 列表表格
 *
 * 显示以表格形式展示的列表，用于点击统计数字时滑出右侧面板显示详细的客户列表等场景
 */

require('./style.less');
import ListPanel from 'CMP_DIR/list-panel';
import { AntcTable, AntcDataSource } from 'antc';

//数据表格组件
class DataTable extends React.Component {
    static propTypes = {
        columns: PropTypes.array,
        data: PropTypes.obj,
        dataField: PropTypes.string,
        onRowClick: PropTypes.func,
        backendPagination: PropTypes.bool
    };

    static defaultProps = {
        columns: [],
        data: {},
        dataField: 'list',
        onRowClick: function() {},
        backendPagination: false
    };

    render() {
        const props = this.props;
        const data = props.data;

        let tableProps = {
            columns: props.columns,
            dataSource: data[props.dataField],
            onRowClick: props.onRowClick,
            pagination: {
                showTotal: total => `共${total}条`
            }
        };

        if (props.backendPagination) {
            const total = data.total;

            _.extend(tableProps.pagination, {
                total,
                pageSize: 20,
                onChange: page => {
                    //Todo: 增加后端分页的支持
                }
            });
        }

        return <AntcTable {...tableProps} />;
    }
}

//数据列表组件
class DataList extends React.Component {
    static propTypes = {
        listPanelParamObj: PropTypes.obj
    };

    static defaultProps = {
        listPanelParamObj: {}
    };

    render() {
        let paramObj = this.props.listPanelParamObj;

        if (paramObj.backendPagination) {
            paramObj = _.cloneDeep(paramObj);
            //Todo: 增加后端分页的支持
        }

        return (
            <AntcDataSource {...paramObj}>
                <DataTable {...paramObj} />
            </AntcDataSource>
        );
    }
}

//列表表格组件
function ListTable(props) { 
    return (
        <ListPanel listType='customer'>
            <DataList {...props}/>
        </ListPanel>
    );
}

export default ListTable;
