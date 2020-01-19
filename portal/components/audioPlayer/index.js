/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/1/11.
 */
import {Icon} from 'antd';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import privilegeConst_common from 'MOD_DIR/common/public/privilege-const';
var AlertTimer = require('CMP_DIR/alert-timer');
require('./index.less');
class AudioPlayer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowReportButton: this.props.isShowReportButton,//是否展示上报按钮
            playingItemAddr: this.props.playingItemAddr//当前正在播放的录音的地址
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isShowReportButton !== this.props.isShowReportButton) {
            this.setState({
                isShowReportButton: nextProps.isShowReportButton
            });
        }
        if (nextProps.playingItemAddr !== this.props.playingItemAddr) {
            this.setState({
                playingItemAddr: nextProps.playingItemAddr
            });
        }
    }

    render() {
        return (
            <div className="audio-foot">
                <div className="audio-player-wrap" data-tracename="播放录音界面">
                    <audio id="audio" width="320" controls="controls" autoPlay="autoplay"
                        src={this.state.playingItemAddr}>
                    </audio>
                    <i className="iconfont icon-close close-panel" onClick={this.props.closeAudioPlayContainer}
                        data-tracename="关闭播放录音"></i>
                    {/*如果获取无效电话出错或者没有上报的权限，不要显示上报电话区域*/}
                    {this.props.getInvalidPhoneErrMsg || !hasPrivilege(privilegeConst_common.CALLSYSTEM_CONFIG_MANAGE) ? null :
                        <div className="report-wrap">
                            <span className="report-tip">
                                {Intl.get('call.record.customer.phone', '这是一个客服电话')}
                                {this.state.isShowReportButton ? '？' : '。'}
                            </span>
                            {this.state.isShowReportButton ?
                                <span className="report-button"
                                    onClick={this.props.handleAddInvalidPhone}
                                    data-tracename="上报客服电话"
                                >{Intl.get('call.record.report', '上报')}
                                    {this.props.isAddingInvalidPhone ? <Icon type="loading"/> : null}
                                </span> : null
                            }
                            {this.props.addingInvalidPhoneErrMsg ? (<AlertTimer time={2000}
                                message={this.props.addingInvalidPhoneErrMsg}
                                type='error' showIcon
                                onHide={this.props.hideErrTooltip}/>) : null
                            }
                        </div>
                    }

                </div>
            </div>
        );
    }
}
AudioPlayer.defaultProps = {
    isShowReportButton: false,
    playingItemAddr: '',//正在播放的录音的地址
    getInvalidPhoneErrMsg: '',//获取无效电话失败的提示
    addingInvalidPhoneErrMsg: '',//上报无效电话时出错
    isAddingInvalidPhone: '',//正在添加无效电话
    closeAudioPlayContainer: function() {
    },
    handleAddInvalidPhone: function() {
    },
    hideErrTooltip: function() {
    }
};
export default AudioPlayer;