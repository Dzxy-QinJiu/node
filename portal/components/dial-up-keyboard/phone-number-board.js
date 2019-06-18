/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/4/18.
 */
require('./phone-number-board.less');
import {Button, Popover, Input, Icon, message} from 'antd';
import {handleCallOutResult}from 'PUB_DIR/sources/utils/common-data-util';
// import {insertAfterText} from 'PUB_DIR/sources/utils/common-method-util';
import {isTelephone} from 'PUB_DIR/sources/utils/validate-util';
//拨号键对应的数组
const phoneNumArray = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
class PhoneNumberBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //外部传入的电话号码
            phoneNumber: props.phoneNumber,
            //拨号键盘输入的电话号码
            inputNumber: '',
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.phoneNumber !== this.state.phoneNumber) {
            this.setState({phoneNumber: nextProps.phoneNumber});
        }
    }

    onButtonClick = (num) => {
        let numberInputDom = this.inputNumberInput.refs.input;
        //光标选中内容的开始位置
        let selectionStart = numberInputDom.selectionStart;
        //光标选中内容的结束位置(未选中内容时，开始结束位置相同)
        let selectionEnd = numberInputDom.selectionEnd;
        let inputNumber = this.state.inputNumber;
        if (inputNumber) {
            inputNumber = inputNumber.slice(0, selectionStart) + num + inputNumber.slice(selectionEnd);
            numberInputDom.focus();
            let focusIndex = selectionStart + 1;
            numberInputDom.setSelectionRange(focusIndex, focusIndex, 'forward');
        } else {
            inputNumber += num;
            numberInputDom.focus();
        }
        this.setState({
            inputNumber
        });
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
        const {value} = e.target;
        const reg = /^\d*$/;
        if ((!_.isNaN(value) && reg.test(value)) || value === '') {
            this.setState({inputNumber: value});
        }
    }

    //拨打电话
    dialPhoneNumber = () => {
        let phoneNumber = this.state.inputNumber;
        if (phoneNumber && !Oplate.isCalling) {
            //先去掉电话号码的验证
            // if (isTelephone(phoneNumber)) {
            handleCallOutResult({
                phoneNumber: phoneNumber,//拨打的电话
            });
            // } else {
            //     message.error(Intl.get('phone.call.error.tip', '电话号码错误！'));
            // }
        }
    }

    render() {
        const suffix = this.state.inputNumber ? <Icon type="close-circle" onClick={this.clearInputNumber}/> : null;
        return (
            <div className="dial-up-keyboard-wrap">
                <Input allowClear
                    suffix={suffix}
                    ref={node => this.inputNumberInput = node}
                    value={this.state.inputNumber}
                    placeholder={Intl.get('user.info.input.phone', '请输入电话')}
                    onChange={this.onNumberInputChange}
                />
                <div className="number-key-container">
                    {_.map(phoneNumArray, item => {
                        return (
                            <Button size='small' className='phone-num-btn' disabled={['*', '#'].indexOf(item) !== -1}
                                onClick={this.onButtonClick.bind(this, item)}>{item}</Button>);
                    })}
                </div>
                <Button type='primary' className='call-btn' onClick={this.dialPhoneNumber}>
                    <i className="iconfont icon-active-call_record-ico"/></Button>
            </div>);
    }
}

PhoneNumberBoard.propTypes = {
    //外部传入的电话号码
    phoneNumber: PropTypes.string,
};
export default PhoneNumberBoard;