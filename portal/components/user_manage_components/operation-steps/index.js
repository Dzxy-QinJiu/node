/**
 * <OperationSteps title={Intl.get("user.user.add", "添加用户")} current={2}>
         <OperationSteps.Step action={Intl.get("user.user.basic", "基本信息")} />
         <OperationSteps.Step action={Intl.get("user.user.app.select", "选择应用")} />
         <OperationSteps.Step action={Intl.get("user.user.app.set", "应用设置")} />
   </OperationSteps>
 */
var language = require("../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require('./index-es_VE.less');
}else if (language.lan() == "zh"){
    require('./index-zh_CN.less');
}
const PropTypes = React.PropTypes;
import classNames  from "classnames";
//步骤条
class OperationSteps extends React.Component {
    //构造器
    constructor(props) {
        super(props);
    }
    render(){
        const props = this.props;
        const {children,className,current,style,title,...restProps} = props;
        const cls = classNames("operation-steps","clearfix",`operation-steps-current-${current}`,className);
        return (
            <div className={cls} style={style} {...restProps}>
                <span className="operation-steps-title">{title}</span>
                <ul className="list-unstyled list-inline">
                    {
                        React.Children.map(children, (ele , idx) => {
                            const newProps = {};
                            if(idx === 0) {
                                newProps.activeDot = true;
                            }
                            return React.cloneElement(ele , newProps);
                        })
                    }
                </ul>
            </div>
        );
    }
}
//步骤条的默认值
OperationSteps.defaultProps = {
    current : 0,
    title : '',
    className : '',
    style : {}
};
OperationSteps.propTypes = {
    current : PropTypes.number,
    title : PropTypes.string,
    className: PropTypes.string,
    style : PropTypes.object
};
//步骤
class OperationStep extends React.Component {
    constructor(props) {
        super(props);
    }
    render(){
        const props = this.props;
        const {className,action,style,children,...restProps} = props;
        var cls = classNames("operation-steps-action",className);
        return (
            <li className={cls} style={style} {...restProps}>
                {this.props.action}
                {this.props.activeDot ? (<span className="active-dot"></span>) : null}
            </li>
        );
    }
}
//步骤的属性类型
OperationStep.propTypes = {
    action : PropTypes.string,
    className : PropTypes.string,
    style : PropTypes.object,
    activeDot : PropTypes.bool
};
//步骤的默认属性
OperationStep.defaultProps = {
    action : "",
    className : "",
    style : {},
    activeDot : false
};
//挂载步骤
OperationSteps.Step = OperationStep;
//高度恒定,56
OperationSteps.height = 56;
//暴露步骤条
export default OperationSteps;