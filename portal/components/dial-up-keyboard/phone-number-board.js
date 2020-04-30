/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/4/18.
 */
require('./phone-number-board.less');
import {Button, Input, Icon} from 'antd';
import {handleCallOutResult}from 'PUB_DIR/sources/utils/common-data-util';
import {isTelephone} from 'PUB_DIR/sources/utils/validate-util';
//拨号键对应的数组
const phoneNumArray = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
//电话输入框光标的开始结束位置
let cursorSelection = {
    start: 0,//电话输入框的光标所在开始位置（选中内容的开始位置）
    end: 0 //电话输入框的光标所在结束位置（选中内容的结束位置）
};
import {getCallClient, handleBeforeCallOutCheck} from 'PUB_DIR/sources/utils/phone-util';
var classNames = require('classnames');
class PhoneNumberBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //外部传入的电话号码
            phoneNumber: props.phoneNumber,
            //拨号键盘输入的电话号码
            inputNumber: ''
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.phoneNumber !== this.state.phoneNumber) {
            this.setState({phoneNumber: nextProps.phoneNumber});
        }
    }

    onButtonClick = (num) => {
        //光标选中内容的开始位置
        let selectionStart = cursorSelection.start;
        //光标选中内容的结束位置(未选中内容时，开始结束位置相同)
        let selectionEnd = cursorSelection.end;
        let inputNumber = this.state.inputNumber;
        if (inputNumber) {
            inputNumber = inputNumber.slice(0, selectionStart) + num + inputNumber.slice(selectionEnd);
        } else {
            inputNumber += num;
        }
        //电话输入框的光标所在开始后移一位，结束位置跟开始位置相同
        let cursorIndex = selectionStart + 1;
        cursorSelection.start = cursorIndex;
        cursorSelection.end = cursorIndex;
        this.setState({inputNumber});
    }

    onNumberInputBlur = (event) => {
        let numberInputDom = event.target;
        //设置电话输入框的光标所在开始、结束位置
        cursorSelection.start = numberInputDom.selectionStart;
        cursorSelection.end = numberInputDom.selectionEnd;
    }

    //每次只删除最后一个字符
    delPhoneLastNum = () => {
        this.inputNumberInput.focus();
        let inputNumber = this.state.inputNumber;
        if (inputNumber) {
            inputNumber = inputNumber.slice(0, inputNumber.length - 1);
            this.setState({inputNumber});
        }
    }

    //清空输入的电话号码
    clearInputNumber = () => {
        this.setState({inputNumber: ''});
    }

    onNumberInputChange = (e) => {
        let value = _.trim(e.target.value);
        // 复制带横线的座机号时，自动将横线去掉
        if (_.indexOf(value, '-') !== -1) {
            value = value.replace('-', '');
        }
        const reg = /^\d*$/;
        if ((!_.isNaN(value) && reg.test(value)) || value === '') {
            this.setState({inputNumber: value});
        }
    }

    //拨打电话
    dialPhoneNumber = () => {
        let phoneNumber = this.state.inputNumber;
        if (phoneNumber && !Oplate.isCalling) {
            handleBeforeCallOutCheck( () => {
                //先去掉电话号码的验证
                // if (isTelephone(phoneNumber)) {
                handleCallOutResult({
                    phoneNumber: phoneNumber,//拨打的电话
                });
                // } else {
                //     message.error(Intl.get('phone.call.error.tip', '电话号码错误！'));
                // }
            } );
        }
    };
    hangUpPhone = (callClient) => {
        callClient.releaseCall(callClient);
        this.clearInputNumber();
    };

    render() {
        const suffix = this.state.inputNumber ? <Icon type="close-circle" onClick={this.clearInputNumber}/> : null;
        var phoneNum = this.props.inputNumber || this.state.inputNumber;
        var isRonglianCalling = this.props.inputNumber;
        var phonePopIcon = classNames('iconfont',{
            'icon-phone-hang-up': isRonglianCalling,
            'icon-active-call-records-ico': !isRonglianCalling,
        });
        var phoneBtnWrap = classNames('call-btn',{
            'hang-up-background': isRonglianCalling,
        });
        let callClient = getCallClient();
        return (
            <div className="dial-up-keyboard-wrap">
                <Input allowClear
                    suffix={suffix}
                    ref={node => this.inputNumberInput = node}
                    value={phoneNum}
                    placeholder={Intl.get('user.info.input.phone', '请输入电话')}
                    onChange={this.onNumberInputChange}
                    onBlur={this.onNumberInputBlur}
                    disabled={this.props.inputNumber ? true : false}
                />
                <div className="number-key-container">
                    {_.map(phoneNumArray, item => {
                        const cls = classNames({ 'phone-num-star-btn-inner': item === '*' });
                        return (
                            <Button size='small' className='phone-num-btn' disabled={['*'].indexOf(item) !== -1}
                                onClick={item === '#' ? this.delPhoneLastNum.bind(this) : this.onButtonClick.bind(this, item)}>
                                {item === '#' ? <i className='iconfont icon-phone-back phone-back-btn'/> : <span className={cls}>{item}</span>}
                            </Button>);
                    })}
                </div>
                <Button
                    type='primary'
                    className={phoneBtnWrap}
                    onClick={isRonglianCalling && callClient.needShowAnswerView() ?
                        this.hangUpPhone.bind(this, callClient) : this.dialPhoneNumber}
                >
                    <i className={phonePopIcon}/>
                </Button>
            </div>);
    }
}

PhoneNumberBoard.propTypes = {
    //在输入框展示的电话号码
    inputNumber: PropTypes.string,
    //外部传入的电话号码
    phoneNumber: PropTypes.string,
};
export default PhoneNumberBoard;