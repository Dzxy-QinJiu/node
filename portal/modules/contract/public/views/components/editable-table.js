/** Created by 2019-02-14 13:27 */
import { Table, Popconfirm, Form, Icon, Button } from 'antd';
import { DetailEditBtn } from 'CMP_DIR/rightPanel';
import Trace from 'LIB_DIR/trace';
const FormItem = Form.Item;

class EditableCell extends React.Component {
    static propTypes = {
        form: PropTypes.object,
        editor: PropTypes.string,
        editorConfig: PropTypes.object,
        editorProps: PropTypes.object,
        editing: PropTypes.bool,
        dataIndex: PropTypes.string,
        record: PropTypes.object,
        disabledDate: PropTypes.func,
    };

    static defaultProps = {
        // 编辑时选用哪种编辑方式，默认是是input输入框
        editor: 'Input',
        // 编辑器在form中的getFieldDecorator的配置
        editorConfig: {},
        // 编辑器上的属性
        editorProps: {}
    };

    getEditor = () => {
        let editor = this.props.editor;
        let editorProps = this.props.editorProps;
        const Editor = require('antd')[editor];

        return <Editor {...editorProps}/>;
    };
    render() {
        const {
            editing,
            dataIndex,
            editorConfig,
            record,
            form,
            ...restProps
        } = this.props;

        const { getFieldDecorator } = form;

        if(editing){
            let {initialValue} = editorConfig;
            editorConfig.initialValue = _.isNil(initialValue) ? record[dataIndex] : (_.isFunction(initialValue) ? initialValue(record[dataIndex]) : initialValue);
            return (
                <FormItem style={{ margin: 0 }}>
                    {getFieldDecorator(dataIndex, editorConfig)(this.getEditor())}
                </FormItem>
            );
        }else{
            return null;
        }
    }
}

const EditableFormCell = Form.create({
    onValuesChange: (props, values) => {
        // _.isFunction(props.onValuesChange) && props.onValuesChange(props, values);
    }
})(EditableCell);

class EditableTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: props.dataSource,
            editingKey: '',
            currentContractId: props.parent.props.contract.id,
            loading: false
        };
        // this.cacheData = props.dataSource.map(item => ({ ...item }));
    }
    editableFormCellRef = {};

    static defaultProps = {
        //表格列定义
        columns: [],
        //表格数据
        dataSource: [],
        parent: {},
        // 默认编辑时对比的key键
        defaultKey: 'id',
        // 是否是首笔回款
        isFirstType: false,
        //表格是否显示边框
        bordered: true,
        //表格是否处于编辑状态
        isEdit: false,
        //保存事件，在点击保存按钮后会被触发，其回调参数为变化后的表格数据
        onSave: function() {},
        onDelete: function() {},
        //变更事件，在表格内容变化后会被触发，其回调参数为变化后的表格数据
        onChange: function() {},
        // 取消事件
        onCancel: function() {}
    };

    componentWillReceiveProps(nextProps) {
        let newState = {};
        if(!_.isEqual(this.props.dataSource, nextProps.dataSource)) {
            newState.data = nextProps.dataSource;
        }
        if (!_.isEmpty(this.state.currentContractId) && !_.isEqual(this.state.currentContractId, nextProps.parent.props.contract.id)) {
            newState.editingKey = '';
            newState.currentContractId = nextProps.parent.props.contract.id;
        }
        this.setState(newState);
    }

    getColumns(columnsArg) {
        let columns = _.cloneDeep(columnsArg);
        let _this2 = this;
        _.each(columns, function(column) {
            let rawRender = column.render;
            let rawRules = !_.isNil(column.editorConfig) ? column.editorConfig['rules'] : [];
            if (!column.width) {
                column.width = 90;
            }

            if (column.editable) {
                column.render = function(text, record, index) {
                    if(_.isFunction(rawRules)) {
                        column.editorConfig.rules = rawRules(text, record, index);
                    }
                    if(_.isEqual(record[_this2.props.defaultKey], _this2.state.editingKey)) {
                        return _this2.renderColumns(text, record, index, column);
                    } else if (_.isFunction(rawRender)) {
                        return rawRender(text, record, index);
                    } else {
                        return text;
                    }
                };
            } else {
                column.render = function(text, record, index) {
                    if (_.isFunction(rawRender)) {
                        return rawRender(text, record, index);
                    } else {
                        return text;
                    }
                };
            }
        });
        return columns;
    }
    onValuesChange = (props, values) => {
        this.editableFormCellRef.props.form.resetFields();
        let record = props.record;
        const newData = [...this.state.data];
        const index = newData.findIndex(item => record[this.props.defaultKey] === item[this.props.defaultKey]);
        /*if (index > -1) {
            const item = newData[index];
            if(!_.isEmpty(props.editor) && props.editor === 'date') {
                values.date = values.date.valueOf();
            }
            newData.splice(index, 1, {
                ...item,
                ...values,
            });
            this.setState({ data: newData },() => {
                // this.props.onChange(newData);
            });
        }*/
    };
    renderColumns(text, record, index, col) {
        return (
            <EditableFormCell
                wrappedComponentRef={ref => this.editableFormCellRef = ref}
                {...col}
                record={record}
                onValuesChange={this.onValuesChange.bind(this)}
                editing={ this.isEditing(record) }
            />
        );
    }
    isEditing = (record) => {
        return record[this.props.defaultKey] === this.state.editingKey;
    };
    edit(e, key) {
        Trace.traceEvent(e,'点击编辑某行单元格');
        this.setState({ editingKey: key},() => {
            this.props.onCancel();
        });
    }
    save(key) {
        this.editableFormCellRef.props.form.validateFields((error, row) => {
            if (error) {
                return;
            }
            const newData = [...this.state.data];
            const index = newData.findIndex(item => key === item[this.props.defaultKey]);
            if (index > -1) {
                const item = {...newData[index], ...row};
                // newData.splice(index, 1, item);
                this.setState({
                    loading: true
                }, () => {
                    const successFunc = () => {
                        this.setState({
                            editingKey: '',
                            loading: false
                        });
                    };

                    const errorFunc = (errorMsg) => {
                        this.setState({
                            loading: false,
                        });
                    };
                    this.props.onSave(item, successFunc, errorFunc);
                });
            }
        });
    }
    cancel(key) {
        this.setState({ editingKey: '' });
        this.props.onCancel();
        Trace.traceEvent(ReactDOM.findDOMNode(this), '取消对表格的修改');
    }
    handleDelete(record) {
        Trace.traceEvent(ReactDOM.findDOMNode(this),'点击删除某行单元格');
        this.setState({loading: true}, () => {
            const successFunc = () => {
                this.setState({
                    loading: false
                });
            };
            const errorFunc = () => {
                this.setState({
                    loading: false
                });
            };
            this.props.onDelete(record, successFunc, errorFunc);
        });
    }
    render() {
        let columns = _.cloneDeep(this.props.columns);
        // 是否添加首笔回款列
        if(this.props.isFirstType && this.state.editingKey) {
            columns.push({
                title: Intl.get('contract.167', '首笔回款'),
                dataIndex: 'is_first',
                editor: 'Switch',
                editorConfig: {
                    initialValue: (value) => {
                        return ['true', true].indexOf(value) > -1;
                    },
                    valuePropName: 'checked',
                },
                editable: true,
                width: 60,
                render: (text, record, index) => {
                    return text === 'true' ? Intl.get('user.yes', '是') : Intl.get('user.no', '否');
                }
            });
            if(!this.props.isFirstAdd){
                _.isFunction(this.props.onColumnsChange) && this.props.onColumnsChange();
            }
        }
        // 是否添加操作列
        if(this.props.isEdit) {
            columns.push({
                title: Intl.get('common.operate', '操作'),
                dataIndex: 'operation',
                className: 'repayment-table-operation',
                width: 65,
                align: 'center',
                render: (text, record, index) => {
                    const editable = this.isEditing(record);
                    return (
                        <div>
                            {editable ? (
                                <span>
                                    <Button
                                        shape="circle"
                                        title={Intl.get('common.save', '保存')}
                                        className="btn-save"
                                        onClick={() => this.save(record[this.props.defaultKey])}
                                    >
                                        <Icon type="save"/>
                                    </Button>
                                    <Button
                                        shape="circle"
                                        className="btn-cancel"
                                        title={Intl.get('common.cancel', '取消')}
                                        onClick={() => this.cancel(record[this.props.defaultKey])}
                                    >
                                        <Icon type="cross"/>
                                    </Button>
                                </span>
                            ) : (
                                <span>
                                    <DetailEditBtn title={Intl.get('common.edit', '编辑')} onClick={(e) => {
                                        this.edit(e, record[this.props.defaultKey]);
                                    }}/>
                                    <Popconfirm title={`${Intl.get('crm.contact.delete.confirm', '确认删除')}?`} onConfirm={this.handleDelete.bind(this, record)}>
                                        <span
                                            className="btn-bar"
                                            title={Intl.get('common.delete', '删除')}>
                                            <Icon type="close" theme="outlined" />
                                        </span>
                                    </Popconfirm>
                                </span>
                            )}
                        </div>
                    );
                }
            });
        }
        // 重新处理columns
        columns = this.getColumns(columns);

        return <Table
            bordered
            dataSource={this.state.data}
            columns={columns}
            loading={this.state.loading}
            pagination={false}
        />;
    }
}

EditableTable.propTypes = {
    columns: PropTypes.array,
    dataSource: PropTypes.array,
    parent: PropTypes.object,
    onSave: PropTypes.func,
    bordered: PropTypes.bool,
    isEdit: PropTypes.bool,
    isFirstAdd: PropTypes.bool,
    defaultKey: PropTypes.string,
    isFirstType: PropTypes.bool,
    onDelete: PropTypes.func,
    onChange: PropTypes.func,
    onCancel: PropTypes.func,
    onColumnsChange: PropTypes.func,
};

module.exports = EditableTable;