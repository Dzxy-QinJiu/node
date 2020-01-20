/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/10/22.
 */
// 操作成功后的界面
import './style.less';
import {Button} from 'antd';
import CountDown from 'CMP_DIR/countdown';
import Spinner from 'CMP_DIR/spinner';

function loop() {}

class OperateSuccessTip extends React.Component {
    constructor(props) {
        super(props);
    }

    onComplete = () => {
        this.props.onCountDownComplete();
    };

    renderCoutDownBlock = (seconds) => {
        return <Spinner
            className='loading-wrapper'
            content={seconds}
            loadingText={this.props.countDownMsg}
        />;
    };

    render() {
        return (
            <div className="operate-finished-wrapper" data-tracename="完成提示框">
                {
                    this.props.showCountDown ? (
                        <CountDown seconds={this.props.countDownSeconds} msg={this.props.countDownMsg} onComplete={this.onComplete} renderContent={this.renderCoutDownBlock}/>
                    ) : (
                        <div>
                            <i className="iconfont icon-add-success" style={{color: this.props.iconColor}}/>
                            <div className="operate-finished-title">{this.props.title}</div>
                            <div className="operate-finished-tip">{this.props.tip}</div>
                            {this.props.isShowBtn ? (
                                <div className="btn-wrapper">
                                    <Button type="primary" onClick={this.props.continueFn} data-tracename={`点击${this.props.continueText}按钮`}>{this.props.continueText}</Button>
                                    <Button onClick={this.props.goFn} data-tracename={`点击${this.props.goText}按钮`}>{this.props.goText}</Button>
                                </div>
                            ) : null}
                            {this.props.otherContent ? (
                                <div className="operate-finished-other-wrapper">{this.props.otherContent}</div>
                            ) : null}
                        </div>
                    )
                }
            </div>
        );
    }
}
OperateSuccessTip.defaultProps = {
    title: Intl.get('user.user.add.success', '添加成功'),
    tip: '',
    continueText: Intl.get('guide.continue.add', '继续添加'),//继续操作按钮提示文本
    goText: Intl.get('user.apply.check', '查看'),//其他操作按钮提示文本
    continueFn: loop,//继续操作事件
    goFn: loop,//其他操作事件
    isShowBtn: true,//是否显示按钮
    iconColor: '#28AF6A',
    showCountDown: false,//是否显示倒计时
    countDownSeconds: 10,//倒计时时间
    onCountDownComplete: loop,//倒计时完成回调函数
    otherContent: null,//倒计时完成回调函数
};
OperateSuccessTip.propTypes = {
    title: PropTypes.oneOfType[PropTypes.string, PropTypes.element],
    tip: PropTypes.oneOfType[PropTypes.string, PropTypes.element],
    continueText: PropTypes.string,
    goText: PropTypes.string,
    continueFn: PropTypes.func,
    goFn: PropTypes.func,
    isShowBtn: PropTypes.bool,
    iconColor: PropTypes.string,
    showCountDown: PropTypes.bool,
    countDownMsg: PropTypes.string,
    countDownSeconds: PropTypes.number,
    onCountDownComplete: PropTypes.func,
    otherContent: PropTypes.oneOfType[PropTypes.string, PropTypes.element],
};

module.exports = OperateSuccessTip;