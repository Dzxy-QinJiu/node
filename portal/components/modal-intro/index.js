/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/12/20.
 */
var classNames = require("classnames");
require("./index.less");
class ModalIntro extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            $introElement: this.props.$introElement,//需要加引导的元素
            introModalLayout: this.props.introModalLayout//圈住引导元素圆圈的大小和位置
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.$introElement !== this.state.$introElement) {
            this.setState({
                $introElement: nextProps.$introElement
            });
        }
        if (JSON.stringify(nextProps.introModalLayout) !== JSON.stringify(this.props.introModalLayout)) {
            this.setState({
                introModalLayout: nextProps.introModalLayout
            });
        }
    }

    //计算小蚂蚁和提示的位置
    calculateLayout = () => {
        var $introElement = this.state.$introElement;
        //圈出某个要引导元素的框
        $("#modal-intro .modal-hole").height($introElement.outerHeight() + this.state.introModalLayout.holeGapHeight)
            .width($introElement.outerWidth() + this.state.introModalLayout.holeGapWidth)
            .css({
                top: $introElement.offset().top + this.state.introModalLayout.holeGapTop,
                left: $introElement.offset().left + this.state.introModalLayout.holeGapLeft,
            });
        //小蚂蚁和提示信息所占区域的样式
        $("#modal-intro .modal-tip")
            .css({
                top: $introElement.offset().top + this.state.introModalLayout.tipAreaTop,
                left: $introElement.offset().left + this.state.introModalLayout.tipAreaLeft,
            });
    };

    componentDidMount() {
        this.calculateLayout();
        $(window).on('resize', this.calculateLayout);
    }

    componentWillUnmount() {
        $(window).off('resize', this.calculateLayout);
    }

    render() {
        var cls = classNames("modal-wrap-container", this.props.className,);
        return (
            <div className={cls} id="modal-intro" data-tracename="引导元素的模态框">
                <div className="modal-hole" onClick={this.props.handleOnclickHole} data-tracename="点击加引导的元素"></div>
                <div className="modal-tip">
                    <p className="ant-intro"></p>
                    <div className="modal-message-box" data-tracename="引导元素右侧的提示框">
                        <i className="iconfont icon-close-pannel" onClick={this.props.hideModalIntro} data-tracename="点击关闭引导模态框按钮"></i>
                        <p className="message-wrap">
                            {this.props.message}
                        </p>
                        <p className="message-bottom-tri"></p>
                    </div>
                </div>
            </div>
        );
    }
}
ModalIntro.defaultProps = {
    message:"",
    introModalLayout:{},
    $introElement:"",
    hideModalIntro:function() {},
    handleOnclickHole: function() {},
};
export default ModalIntro;