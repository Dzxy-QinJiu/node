/** Created by 2019-02-28 11:34 */
import { Form } from 'antd';
const FormItem = Form.Item;

class EditableCell extends React.Component {

    state = {
        value: ''
    };

    static propTypes = {
        editable: PropTypes.bool,
        form: PropTypes.object,
        editor: PropTypes.string,
        editorConfig: PropTypes.object,
        editorProps: PropTypes.object,
        /*editorChildren: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.element)
        ]),*/
        editorChildren: PropTypes.func,
        editorChildrenType: PropTypes.string,
        getIsEdit: PropTypes.func,
        editing: PropTypes.bool,
        dataIndex: PropTypes.string,
        record: PropTypes.object,
        dynamicRule: PropTypes.object,
        parent: PropTypes.object,
    };

    static defaultProps = {
        // 是否可以编辑
        editable: false,
        // 编辑时选用哪种编辑方式，默认是是input输入框，只能是antd的组件
        editor: 'Input',
        // 编辑器在form中的getFieldDecorator的配置
        editorConfig: {},
        // 编辑器上的相关属性
        editorProps: {},
        // 编辑器的子组件函数, 返回子组件
        editorChildren: null,
        // 编辑器子组件的类型
        editorChildrenType: '',
        dynamicRule: {},
        parent: {}
    };

    getEditor = () => {
        let editor = this.props.editor;
        let editorProps = this.props.editorProps;
        let editorConfig = this.props.editorConfig;
        let Editor, renderElement;
        let isEdit = true, record = this.props.record;
        const { getFieldDecorator } = this.props.form;
        if(_.isFunction(this.props.getIsEdit)) {
            isEdit = this.props.getIsEdit(record[this.props.dataIndex]);
        }

        // 判断是否可以编辑
        if(this.props.editable && isEdit) {
            Editor = require('antd')[editor];
            // 编辑器有无子组件
            if(!_.isFunction(this.props.editorChildren)){
                renderElement = getFieldDecorator(this.props.dataIndex, editorConfig)(<Editor {...editorProps}/>);
            }else {
                let editorChildren = this.props.editorChildren(Editor[this.props.editorChildrenType]);
                renderElement = getFieldDecorator(this.props.dataIndex, editorConfig)(
                    <Editor {...editorProps}>
                        {editorChildren}
                    </Editor>
                );
            }
        }else {
            renderElement = record[this.props.dataIndex];
        }
        return renderElement;
    };
    // 是否需要动态验证
    hasDynamicRule(restProps, editorConfig) {
        // 动态验证属性不为空时 并且动态验证的key不为空时
        if(!_.isEmpty(restProps.dynamicRule) && restProps.dynamicRule.key) {
            // 根据提供的索引插入到验证规则数组
            editorConfig.rules[restProps.dynamicRule.index] = ((parent) => {
                // parent父组件的上下文
                return restProps.dynamicRule.fn(parent);
            })(restProps.parent);
        }
    }

    render() {
        const {
            editing,
            dataIndex,
            editorConfig,
            record,
            form,
            ...restProps
        } = this.props;

        if(editing){
            let {initialValue} = editorConfig;
            editorConfig.initialValue = _.isNil(initialValue) ? record[dataIndex] : (_.isFunction(initialValue) ? initialValue(record[dataIndex]) : initialValue);
            // 动态验证时
            this.hasDynamicRule(restProps, editorConfig);

            return (
                <FormItem style={{ margin: 0 }}>
                    {this.getEditor()}
                </FormItem>
            );
        }else{
            return null;
        }
    }
}

export const EditableFormCell = Form.create()(EditableCell);