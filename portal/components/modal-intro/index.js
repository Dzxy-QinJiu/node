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
            isShowIntroModal:this.props.isShowIntroModal
        };
    };
    componentWillReceiveProps(nextProps) {
        if (nextProps.isShowIntroModal !== this.state.isShowIntroModal){
            this.setState({
                isShowIntroModal:nextProps.isShowIntroModal
            })
        }
    }
    render(){
        var cls = classNames("modal-wrap-container", this.props.className, {
            'modal-wrap-show': this.state.isShowIntroModal
        });
        return (
            <div className={cls} id="modal-intro">
                <div className="modal-hole" onClick={this.props.handleOnclickHole}></div>
                <div className="modal-tip">
                    <p className="ant-intro"></p>
                    <div className="modal-message-box">
                        <i className="iconfont icon-close-pannel" onClick={this.props.hideModalIntro}></i>
                        <p className="message-wrap">
                            {this.props.message}
                        </p>
                        <p className="message-bottom-tri"></p>
                    </div>

                </div>
            </div>
        )
    }
}
ModalIntro.defaultProps = {
    handleOnclickHole:function () {},
};
export default ModalIntro;