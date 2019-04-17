/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/4/15.
 */
require('./index.less');
import {Button, Popover, Input, Icon} from 'antd';
import {handleCallOutResult}from 'PUB_DIR/sources/utils/common-data-util';
import {releaseCall} from 'PUB_DIR/sources/utils/phone-util';
//拨号键对应的数组
const phoneNumArray = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
class DialUpKeyboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            phoneNumber: props.phoneNumber,
            extensionNumber: '',

        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.phoneNumber !== this.state.phoneNumber) {
            this.setState({phoneNumber: nextProps.phoneNumber});
        }
    }

    onButtonClick = (num) => {
        num = this.state.extensionNumber + num;
        this.setState({
            extensionNumber: num
        });
    }
    //每次只删除最后一个字符
    delPhoneLastNum = () => {
        this.extensionNumberInput.focus();
        let extensionNumber = this.state.extensionNumber;
        if (extensionNumber) {
            extensionNumber = extensionNumber.slice(0, extensionNumber.length - 1);
            this.setState({extensionNumber});
        }
    }
    //拨打分机号
    dialExtensionNumber = () => {
        let phoneNumber = `${this.state.phoneNumber}-${this.state.extensionNumber}`;
        if (phoneNumber) {
            // releaseCall();
            // setTimeout():
            //加上分机号继续拨打
            handleCallOutResult({
                phoneNumber: phoneNumber,//拨打的电话
            });
        }
    }

    renderDialUpKeyboard() {
        const suffix = this.state.extensionNumber ? <Icon type="close-circle" onClick={this.delPhoneLastNum}/> : null;
        return (
            <div className="dial-up-keyboard-wrap">
                <Input allowClear
                    suffix={suffix}
                    ref={node => this.extensionNumberInput = node}
                    value={this.state.extensionNumber}
                    placeholder={Intl.get('user.info.input.phone', '请输入电话')}
                />
                <div className="number-key-container">
                    {_.map(phoneNumArray, item => {
                        return (<Button size='small' className='phone-num-btn'
                            onClick={this.onButtonClick.bind(this, item)}>{item}</Button>);
                    })}
                </div>
                <Button type='primary' className='call-btn' onClick={this.dialExtensionNumber}>
                    <i className="iconfont icon-active-call_record-ico"/></Button>
            </div>);
    }

    render() {
        return (
            <Popover
                content={this.renderDialUpKeyboard()}
                trigger="click"
            >
                <Button className='dial-up-keyboard-btn'
                    size='small'>{Intl.get('phone.dial.up.keyboard.btn', '拨号键盘')}</Button>
            </Popover>);
    }
}

DialUpKeyboard.propTypes = {
    phoneNumber: PropTypes.string,
};
export default DialUpKeyboard;