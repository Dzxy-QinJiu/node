/** Created by 2019-02-14 13:27
 * 一个可编辑和展示的Table扩展组件
 * columns=[{
                title?: Intl.get('common.start.end.time', '起止时间'), // 选填，label名称
                dataIndex: 'name', // 必填，输入控件唯一标志
                editable?: true,  // 选填，是否可编辑
                editor?: 'Select', // 编辑器的类型，必须是antd或者antc上的组件，选填，默认为Input
                editorChildrenType?: 'Option', // 选填，编辑器的子组件类型
                editorChildren？: (Children) => { // 选填，Children为编辑器的子组件，
                    return _.map(appList, item => {
                        return <Children value={item.app_id} key={item.app_id}>{item.app_name}</Children>;
                    });
                },
                editorConfig?: { 选填, Form表单getFieldDecorator的配置项
                    rules: (text,record,index) => { // rules规则，[Function|Object],可以是函数或者对象
                        return [{
                            required: true,
                            message: Intl.get('contract.44', '不能为空')
                        }, getNumberValidateRule()];
                    }
                },
                editorProps?: (record, isEdit) => { // 选填，编辑器上的属性，[Function|Object],可以是函数或者对象
                    return {
                        onChange: (e) => {}
                    };
                },
                dynamicRule?: { // 选填， 动态验证函数
                    index: 2, // 插入到rules规则数组里的索引
                    key: 'amount', // 需要联动验证的另一控件的标志(dataIndex)
                    fn: (parent) => { // 参数[parent],使用此组件的父组件的上下文，返回一个validator验证函数
                        return {
                            validator: (rule,value,callback) => {
                                // 这里需要获取其他产品的价格
                                let validateArr = [];
                                _.each(this.state.products, (item, index) => {
                                    let ref = parent[`form${item.id}Ref`];
                                    let formValue = ref.props.form.getFieldsValue();
                                    if(!_.get(item,'account_start_time')) {
                                        item.account_start_time = moment().valueOf();
                                        item.account_end_time = moment().valueOf();
                                    }
                                    validateArr.push({...item, ...formValue});
                                });
                                this.validateAmount(validateArr,rule,value,callback);
                            }
                        };
                    },
                },
                width?: '30%', // 选填
                render?: (text, record, index) => { 选填，table
                    return <span>{moment(text).format(oplateConsts.DATE_FORMAT)}</span>;
                },
                getIsEdit: text => !text // 在添加时，可以编辑此项，但是编辑项修改时，就不能编辑此项了，
            },];
 * */
import React, { Component } from 'react';
import { Table, Popconfirm, Icon, Button } from 'antd';
import { DetailEditBtn } from 'CMP_DIR/rightPanel';
import Trace from 'LIB_DIR/trace';
import {EditableFormCell} from './editable-cell';
import './index.less';

class EditableTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: props.dataSource,
            editingKey: '',
            currentContractId: props.parent.props.contract.id,
            loading: false
        };
    }

    static defaultProps = {
        //表格列定义
        columns: [],
        //表格数据
        dataSource: [],
        parent: {},
        // 默认编辑时对比的key键
        defaultKey: 'id',
        //表格是否显示边框
        bordered: true,
        //表格是否有编辑权限
        isEdit: false,
        //保存事件，在点击保存按钮后会被触发，其回调参数为变化后的表格数据
        onSave: function() {},
        onDelete: function() {},
        //变更事件，在表格内容变化后会被触发，其回调参数为变化后的表格数据
        onChange: function() {},
        // 取消事件
        onCancel: function() {},
        /*
         * 表格修改的取消操作事件，其回调参数为
         * editing: 正在编辑中
         * addCancel: 添加项的取消修改
         * addAndEditCancel： 有添加项的编辑项取消修改
         * cancel: 编辑项取消修改
         */
        onColumnsChange: function() {},
    };

    componentWillReceiveProps(nextProps) {
        let newState = {};
        if(!_.isEqual(this.props.dataSource, nextProps.dataSource)) {
            newState.data = nextProps.dataSource;
        }
        if (!_.isNil(this.state.currentContractId) && !_.isEqual(this.state.currentContractId, nextProps.parent.props.contract.id)) {
            newState.editingKey = '';
            newState.currentContractId = nextProps.parent.props.contract.id;
        }
        this.setState(newState);
    }
    // 重新过滤列表头
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
    renderColumns(text, record, index, col) {
        if(this.isEditing(record)){
            return (
                <EditableFormCell
                    wrappedComponentRef={ref => this[`${col.dataIndex}editableFormCellRef`] = ref}
                    parent={this}
                    {...col}
                    record={record}
                    editing={this.isEditing(record)}
                />
            );
        }else {
            return text;
        }

    }
    // 是否是可编辑
    isEditing = (record) => {
        return record[this.props.defaultKey] === this.state.editingKey;
    };
    edit(e, key) {
        Trace.traceEvent(e,'点击编辑某行单元格');
        this.setState({ editingKey: key},() => {
            this.props.onCancel();
            _.isFunction(this.props.onColumnsChange) && this.props.onColumnsChange('editing', key);
        });
    }
    save(defaultKey) {
        let validateObj = {};
        let validateLength;
        // 这里将所有列都验证一遍
        _.each(this.props.columns, col => {
            let ref = this[`${col.dataIndex}editableFormCellRef`];
            ref.props.form.validateFields((err, value) => {
                if(err) return false;
                validateObj = {...validateObj, ...value};
            });
        });
        validateLength = Object.keys(validateObj).length;
        // 通过验证的列与所有的列长度是否一致
        if(validateLength !== this.props.columns.length) {
            return false;
        }else {
            const newData = _.find(this.state.data, item => defaultKey === item[this.props.defaultKey]);
            if (newData) {
                const item = {...newData, ...validateObj};
                // 有验证事件时，不满足条件，
                if(_.isFunction(this.props.onValidate) && !this.props.onValidate(item)) return false;

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
        }
    }
    // 取消按钮事件
    cancel(key, isAdd) {
        // 这里判断是添加项取消，还是编辑项取消
        // 是：添加项取消，需要删除添加项，
        // 否：编辑项不变
        let index = _.findIndex(this.props.dataSource, item => item[this.props.defaultKey] === key);
        let hasAddItem = _.find(this.state.data,['isAdd', true]);
        let type;
        if(isAdd) {
            this.props.dataSource.splice(index, 1);
            type = 'addCancel';
        }else {
            // 有添加项时，编辑项的取消需要通知父组件
            type = hasAddItem ? 'addAndEditCancel' : 'cancel';
        }

        this.setState({ editingKey: '', data: this.props.dataSource });
        this.props.onCancel();
        _.isFunction(this.props.onColumnsChange) && this.props.onColumnsChange(type, key);
        Trace.traceEvent(ReactDOM.findDOMNode(this), '取消对表格的修改');
    }
    // 删除某一项
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
        // 是否有编辑权限，添加操作列
        if(this.props.isEdit) {
            columns.push({
                title: Intl.get('common.operate', '操作'),
                dataIndex: 'operation',
                className: 'edit-table-operation',
                width: 65,
                align: 'center',
                render: (text, record, index) => {
                    const editable = this.isEditing(record);
                    return (
                        <div>
                            {/*是否可编辑*/}
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
                                        onClick={() => this.cancel(record[this.props.defaultKey], record.isAdd)}
                                    >
                                        <Icon type="cross"/>
                                    </Button>
                                </span>
                            ) : (
                                <span>
                                    <DetailEditBtn title={Intl.get('common.edit', '编辑')} onClick={(e) => {
                                        this.edit(e, record[this.props.defaultKey]);
                                    }}/>
                                    {/*如果是添加，删除直接删除；如果是已有项删除，请求接口*/}
                                    {record.isAdd ? null :
                                        <Popconfirm title={`${Intl.get('crm.contact.delete.confirm', '确认删除')}?`} onConfirm={this.handleDelete.bind(this, record)}>
                                            <span
                                                className="btn-bar"
                                                title={Intl.get('common.delete', '删除')}>
                                                <Icon type="close" theme="outlined" />
                                            </span>
                                        </Popconfirm>}
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
            className='edit-table-container'
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
    defaultKey: PropTypes.string,
    onDelete: PropTypes.func,
    onChange: PropTypes.func,
    onCancel: PropTypes.func,
    onColumnsChange: PropTypes.func,
    onValidate: PropTypes.func, // 验证事件，点击保存按钮后，需要验证的操作，
};

module.exports = EditableTable;