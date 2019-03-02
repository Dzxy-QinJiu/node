/** Created by 2019-02-28 11:34 */
import { Form } from 'antd';
const FormItem = Form.Item;

class EditableCell extends React.Component {

    state = {
        value: ''
    };

    static propTypes = {
        form: PropTypes.object,
        editor: PropTypes.string,
        editorConfig: PropTypes.object,
        editorProps: PropTypes.object,
        editing: PropTypes.bool,
        dataIndex: PropTypes.string,
        record: PropTypes.object,
        dynamicRule: PropTypes.object,
        parent: PropTypes.object,
    };

    static defaultProps = {
        // 编辑时选用哪种编辑方式，默认是是input输入框，只能是antd的组件
        editor: 'Input',
        // 编辑器在form中的getFieldDecorator的配置
        editorConfig: {},
        // 编辑器上的相关属性
        editorProps: {},
        dynamicRule: {},
        parent: {}
    };

    getEditor = () => {
        let editor = this.props.editor;
        let editorProps = this.props.editorProps;
        const Editor = require('antd')[editor];

        return <Editor {...editorProps}/>;
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

        const { getFieldDecorator } = form;

        if(editing){
            let {initialValue} = editorConfig;
            editorConfig.initialValue = _.isNil(initialValue) ? record[dataIndex] : (_.isFunction(initialValue) ? initialValue(record[dataIndex]) : initialValue);
            // 动态验证时
            this.hasDynamicRule(restProps, editorConfig);

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

export const EditableFormCell = Form.create()(EditableCell);