/**
 * Created by hzl on 2020/5/14.
 */
import { Button} from 'antd';
import { customFieldType } from 'PUB_DIR/sources/utils/consts';
import { AntcTable } from 'antc';
import classNames from 'classnames';
import Spinner from 'CMP_DIR/spinner';
import ajax from './ajax';
require('./css/index.less');

class CustomFieldManage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'lead', // 默认的tab
            loading: false,
            customFieldData: {}, // 自定义字段数据
            isShowAddRightPanel: false, // 是否显示添加的面板
        };
    }

    componentDidMount() {
        this.getCustomFieldConfig();
    }

    // 获取自定义参数配置
    getCustomFieldConfig = () => {
        const queryObj = {
            customized_type: this.state.activeTab
        };
        this.setState({
            loading: true
        });
        ajax.getCustomFieldConfig(queryObj).then( (result) => {
            this.setState({
                loading: false,
                customFieldData: result
            });
        } );
    }

    handleChangeCustomFieldActiveTab = (item) => {
        this.setState({
            activeTab: _.get(item, 'value')
        }, () => {
            this.getCustomFieldConfig();
        });
    };

    // 添加自定义字段
    handleAddCustomField = () => {
        this.setState({
            isShowAddRightPanel: true,
        }, () => {
        });
    };

    //渲染操作按钮区
    renderTopNavOperation = () => {
        const activeTab = this.state.activeTab;
        return (
            <div className='condition-operator'>
                <div className='pull-left'>
                    <ul className='custom-field-type'>
                        {
                            _.map(customFieldType, item => {
                                const cls = classNames('custom_field_type_item', {
                                    'active-tab': activeTab === _.get(item, 'value', '')
                                });
                                return (
                                    <li
                                        className={cls}
                                        key={item.value}
                                        onClick={this.handleChangeCustomFieldActiveTab.bind(this, item)}
                                    >
                                        {_.get(item, 'name')}
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
                <div className='pull-right'>
                    <Button onClick={this.handleAddCustomField.bind(this)}>
                        {Intl.get('common.add', '添加')}
                    </Button>
                </div>
            </div>
        );
    };

    handleEdit = () => {

    };

    handleDelete = () => {

    };

    getTableColumns = () => {
        return [{
            title: Intl.get('custom.field.title', '字段名'),
            dataIndex: 'name',
            key: 'name',
            width: '50%',
        }, {
            title: Intl.get('common.type', '类型'),
            dataIndex: 'field_type',
            key: 'field_type',
            width: '25%',
        }, {
            title: Intl.get('common.operate', '操作'),
            width: '25%',
            render: (text, rowData, idx) => {
                return (
                    <div className="operate-zone">
                        <span onClick={this.handleEdit.bind(this, rowData, idx)}>
                            {Intl.get('common.edit', '编辑')}
                        </span>
                        <span onClick={this.handleDelete.bind(this, rowData, idx)}>
                            {Intl.get('common.delete', '删除')}
                        </span>
                    </div>
                );
            }
        }];
    };

    renderTableContent = () => {
        let columns = this.getTableColumns();
        const dataSource = _.get(this.state.customFieldData, '[0]customized_variables', []);
        return (
            <div className="scroll-load">
                <AntcTable
                    tableType='data'
                    util={{zoomInSortArea: true}}
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false}
                    locale={{ emptyText: Intl.get('common.no.data', '暂无数据')}}
                />
            </div>
        );
    };

    render() {
        return (
            <div
                className="custom-field-manage-wrap"
                data-tracename="字段管理"
            >
                <div className="custom-field-content-wrap">
                    <div className="top-nav">
                        {this.renderTopNavOperation()}
                    </div>
                    {
                        this.state.loading ? (
                            <Spinner loadingText={Intl.get('common.sales.frontpage.loading', '加载中')}/>
                        ) : (
                            <div className="custom-field-content">
                                {this.renderTableContent()}
                            </div>
                        )
                    }
                </div>
            </div>
        );
    }
}

export default CustomFieldManage;