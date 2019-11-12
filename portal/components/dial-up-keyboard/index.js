/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/4/15.
 */
require('./index.less');
import {Popover} from 'antd';
import classNames from 'classnames';
import PhoneNumberBoard from './phone-number-board';

class DialUpKeyboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputNumber: props.inputNumber,
            //外部传入的电话号码
            phoneNumber: props.phoneNumber,
            //是否展示拨号键盘
            keyboardVisible: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.phoneNumber !== this.state.phoneNumber) {
            this.setState({phoneNumber: nextProps.phoneNumber});
        }
        if (nextProps.inputNumber !== this.state.inputNumber) {
            this.setState({inputNumber: nextProps.inputNumber});
        }
    }

    handleVisibleChange = (visible) => {
        this.setState({
            keyboardVisible: visible,
            inputNumber: visible ? this.state.inputNumber : ''//关闭时清空输入的电话
        });
    }

    renderPhoneNumberBoard() {
        if(this.props.content) {
            return this.props.content;
        }
        if(this.state.keyboardVisible){
            return (<PhoneNumberBoard phoneNumber={this.state.phoneNumber} inputNumber={this.state.inputNumber}/>);
        }
        return null;
    }

    render() {
        let btnClass = classNames('dial-up-keyboard-btn', {
            'keyboard-expanded': this.state.keyboardVisible
        });
        return (
            <Popover
                visible={this.state.keyboardVisible}
                content={this.renderPhoneNumberBoard()}
                trigger="click"
                placement={this.props.placement || 'bottom'}
                onVisibleChange={this.handleVisibleChange}
            >
                <div className={btnClass} title={Intl.get('phone.dial.up.keyboard.btn', '拨号键盘')}>
                    {this.props.dialIcon || <i className='iconfont icon-dial-up-keybord' style={{fontSize: 16}}/>}
                </div>
            </Popover>);
    }
}

DialUpKeyboard.propTypes = {
    //默认展示所拨打电话的号码
    inputNumber: PropTypes.string,
    //外部传入的电话号码
    phoneNumber: PropTypes.string,
    //拨号键盘的显示位置 ：top、right、bottom、left等，不传默认为bottom
    placement: PropTypes.string,
    //拨号图标(可以是字符串也可以是图标等元素)
    dialIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    //拨号键盘的显示内容
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};
export default DialUpKeyboard;