/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/01/21.
 */
// 带上报功能的播放录音组件
import AudioPlayer from 'CMP_DIR/audioPlayer';
import { addInvalidPhone, getInvalidPhone } from 'LIB_DIR/utils/invalidPhone';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';


class AudioReportFunction extends React.Component{
    constructor(props) {
        super(props);

        let playItemAddr = this.getPlayItemAddr(props.curPlayItem);
        this.state = {
            curPlayItem: props.curPlayItem,//当前播放的录音所属的通话记录信息
            isShowReportButton: false,//是否显示上报按钮
            playingItemAddr: playItemAddr,//正在播放的录音的地址
            invalidPhoneLists: [],//无效电话列表
            getInvalidPhoneErrMsg: '',//获取无效电话失败后的信息
            playingItemPhone: '',//正在听的录音所属的电话号码
            isAddingInvalidPhone: false,//正在添加无效电话
            addingInvalidPhoneErrMsg: '',//添加无效电话出错的情况
        };
    }

    componentDidMount() {
        this.getInvalidPhone();
    }

    componentWillReceiveProps(nextProps) {
        if(!_.isEqual(_.get(nextProps,'curPlayItem.id'), _.get(this.props, 'curPlayItem.id'))) {
            this.setState({
                curPlayItem: nextProps.curPlayItem,
                isShowReportButton: false
            }, () => {
                this.getInvalidPhone();
            });
        }
    }

    getPlayItemAddr = (item) => {
        return commonMethodUtil.getAudioRecordUrl(item.local, item.recording, item.type);
    };

    getInvalidPhone = () => {
        let item = this.state.curPlayItem;
        let playItemAddr = this.getPlayItemAddr(item);
        //一开始隐藏掉上报按钮，通过获取电话是否已上报，判断显示按钮
        if(!_.includes(this.state.invalidPhoneLists, item.dst)) {
            getInvalidPhone({number: item.dst}, (data) => {
                if(!_.get(data, 'total')) {//没有上报过时，显示上报按钮
                    this.setState({
                        isShowReportButton: true,
                    });
                }else {
                    let invalidPhoneLists = this.state.invalidPhoneLists;
                    invalidPhoneLists.push(item.dst);
                    this.setState({
                        invalidPhoneLists
                    });
                }
            });
        }
        this.setState({
            playingItemAddr: playItemAddr,
            playingItemPhone: item.dst//正在播放的录音所属的电话号码
        });
    };

    //上报客服电话
    handleAddInvalidPhone = () => {
        let curPhone = this.state.playingItemPhone;
        if (!curPhone){
            return;
        }
        this.setState({
            isAddingInvalidPhone: true
        });
        addInvalidPhone({'number': curPhone},() => {
            this.state.invalidPhoneLists.push(curPhone);
            this.setState({
                isShowReportButton: false,
                isAddingInvalidPhone: false,
                invalidPhoneLists: this.state.invalidPhoneLists,
                addingInvalidPhoneErrMsg: ''
            });
        },(errMsg) => {
            this.setState({
                isAddingInvalidPhone: false,
                addingInvalidPhoneErrMsg: errMsg || Intl.get('fail.report.phone.err.tip', '上报无效电话失败！')
            });
        });
    };

    //提示框隐藏后的处理
    hideErrTooltip = () => {
        this.setState({
            addingInvalidPhoneErrMsg: ''
        });
    };

    render() {
        return (
            <AudioPlayer
                playingItemAddr={this.state.playingItemAddr}
                getInvalidPhoneErrMsg={this.state.getInvalidPhoneErrMsg}
                addingInvalidPhoneErrMsg={this.state.addingInvalidPhoneErrMsg}
                isAddingInvalidPhone={this.state.isAddingInvalidPhone}
                isShowReportButton={this.state.isShowReportButton}
                closeAudioPlayContainer={this.props.closeAudioPanel}
                handleAddInvalidPhone={this.handleAddInvalidPhone}
                hideErrTooltip={this.hideErrTooltip}
            />
        );
    }
}

AudioReportFunction.defaultProps = {
    curPlayItem: null,
    closeAudioPanel: function() {},
};
AudioReportFunction.propTypes = {
    curPlayItem: PropTypes.object,
    closeAudioPanel: PropTypes.func,
};
export default AudioReportFunction;