/**
 * Created by hzl on 2020/5/14.
 */
import { Button, message} from 'antd';
import { manageCustomType, customFieldType } from 'PUB_DIR/sources/utils/consts';
import { AntcTable } from 'antc';
import classNames from 'classnames';
import Spinner from 'CMP_DIR/spinner';
import CustomFieldPanel from './views/custom-field-panel';
import ajax from './ajax';
const LAYOUT_CONSTANTS = {
    FRIST_NAV_WIDTH: 75, // 一级导航的宽度
    NAV_WIDTH: 120, // 导航宽度
    TOP_ZONE_HEIGHT: 80, // 头部（添加成员、筛选的高度）高度
    TABLE_HEAD_HEIGHT: 40, // 表格头部的高度
    PADDING_WIDTH: 24 * 2, // padding占的宽度
    PADDING_HEIGHT: 24 * 2 // padding占的高度
};
require('./css/index.less');

class CustomFieldManage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'lead', // 默认的tab
            loading: false,
            customFieldData: {}, // 自定义字段数据
            isShowRightPanel: false, // 是否显示右侧面板，默认不显示
            editCustomField: {}, // 编辑的内容
            isDeleteCustomFieldKey: '', // 删除自定义字段key
        };
    }

    componentDidMount() {
        $('body').css('overflow', 'hidden');
        this.getCustomFieldConfig();
    }

    componentWillUnmount() {
        $('body').css('overflow', 'auto');
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
            activeTab: _.get(item, 'value'),
            isDeleteCustomFieldKey: '',
        }, () => {
            this.getCustomFieldConfig();
        });
    };

    // 添加自定义字段
    handleAddCustomField = () => {
        this.setState({
            isShowRightPanel: true,
            editCustomField: {}
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
                            _.map(manageCustomType, item => {
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

    handleEdit = (rowData) => {
        this.setState({
            editCustomField: rowData,
            isShowRightPanel: true
        });
    };

    handleConfirmDelete = (rowData) => {
        const customizedVariables = _.get(this.state.customFieldData, '[0]customized_variables', []);
        const id = _.get(this.state.customFieldData, '[0]id');
        // 删除接口
        if (customizedVariables.length === 1) {
            ajax.deleteCustomFieldConfig(id).then( (result) => {
                if (result) {
                    this.setState({
                        customFieldData: {}
                    });
                    message.success(Intl.get('crm.138', '删除成功！'));
                } else {
                    message.error(Intl.get('crm.139', '删除失败！'));
                }
            }, (errMsg) => {
                message.error(errMsg || Intl.get('crm.139', '删除失败！'));
            } );
        } else { // 编辑接口
            const deleteIndex = _.get(rowData, 'show_index');
            const originCustomFieldLength = _.get(customizedVariables, 'length');
            let updateCustomField = _.filter(customizedVariables, item => item.show_index !== deleteIndex);
            if (originCustomFieldLength !== deleteIndex) {
                _.each(updateCustomField, (item, index) => {
                    item.show_index = index + 1;
                    delete item.key;
                });
            }
            let queryObj = {
                id: id,
                customized_type: this.state.activeTab,
                customized_variables: updateCustomField
            };
            ajax.updateCustomFieldConfig(queryObj).then( (result) => {
                if (result) {
                    this.setState({
                        customFieldData: [queryObj]
                    });
                    message.success(Intl.get('crm.218', '修改成功！'));
                } else {
                    message.error(Intl.get('crm.219', '修改失败！'));
                }
            }, (errMsg) => {
                message.error(errMsg || Intl.get('crm.219', '修改失败！'));
            } );
        }
    };

    handleDelete = (rowData) => {
        this.setState({
            isDeleteCustomFieldKey: _.get(rowData, 'key')
        });
    };

    handleCancelDelete = () => {
        this.setState({
            isDeleteCustomFieldKey: ''
        });
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
            render: (text) => {
                return (
                    <div>{customFieldType[text]}</div>
                );
            }
        }, {
            title: Intl.get('common.operate', '操作'),
            width: '25%',
            render: (text, rowData, idx) => {
                return (
                    <div className="operate-zone">
                        {
                            this.state.isDeleteCustomFieldKey === _.get(rowData, 'key') ? (
                                <span className="delete-buttons">
                                    <Button
                                        className="delete-confirm"
                                        onClick={this.handleConfirmDelete.bind(this, rowData, idx)}
                                    >
                                        {Intl.get('crm.contact.delete.confirm', '确认删除')}
                                    </Button>
                                    <Button
                                        className="delete-cancel"
                                        onClick={this.handleCancelDelete.bind(this, rowData, idx)}
                                    >
                                        {Intl.get('common.cancel', '取消')}
                                    </Button>
                                </span>
                            ) : (
                                <React.Fragment>
                                    <span onClick={this.handleEdit.bind(this, rowData, idx)}>
                                        {Intl.get('common.edit', '编辑')}
                                    </span>
                                    <span onClick={this.handleDelete.bind(this, rowData, idx)}>
                                        {Intl.get('common.delete', '删除')}
                                    </span>
                                </React.Fragment>
                            )
                        }
                    </div>
                );
            }
        }];
    };

    renderTableContent = () => {
        let columns = this.getTableColumns();
        const dataSource = _.get(this.state.customFieldData, '[0]customized_variables', []);
        let tableHeight = $(window).height() - LAYOUT_CONSTANTS.PADDING_HEIGHT -
            LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT - LAYOUT_CONSTANTS.TABLE_HEAD_HEIGHT;
        return (
            <div className="scroll-load" style={{height: tableHeight}}>
                <AntcTable
                    tableType='data'
                    util={{zoomInSortArea: true}}
                    dataSource={dataSource}
                    columns={columns}
                    onRowClick={this.handleRowClick}
                    rowClassName={this.handleRowClassName}
                    pagination={false}
                    locale={{ emptyText: Intl.get('common.no.data', '暂无数据')}}
                    scroll={{ y: tableHeight }}
                />
            </div>
        );
    };

    handleClosePanel = () => {
        this.setState({
            isShowRightPanel: false
        });
    };

    // 更新数据
    updateCustomFieldData = (customFieldData) => {
        this.setState({
            customFieldData: customFieldData
        });
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
                {
                    this.state.isShowRightPanel ? (
                        <CustomFieldPanel
                            tabType={this.state.activeTab}
                            onClosePanel={this.handleClosePanel}
                            editCustomField ={this.state.editCustomField}
                            customFieldData={this.state.customFieldData}
                            updateCustomFieldData={this.updateCustomFieldData}
                        />
                    ) : null
                }
            </div>
        );
    }
}

export default CustomFieldManage;