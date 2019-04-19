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
    }

    handleVisibleChange = (visible) => {
        this.setState({
            keyboardVisible: visible,
            inputNumber: visible ? this.state.inputNumber : ''//关闭时清空输入的电话
        });
    }

    renderPhoneNumberBoard() {
        if(this.state.keyboardVisible){
            return (<PhoneNumberBoard phoneNumber={this.state.phoneNumber}/>);
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
                    <i className='iconfont icon-dial-up-keybord' style={{fontSize: this.props.btnSize || 16}}/>
                </div>
            </Popover>);
    }
}

DialUpKeyboard.propTypes = {
    //外部传入的电话号码
    phoneNumber: PropTypes.string,
    //拨号键盘的显示位置 ：top、right、bottom、left等，不传默认为bottom
    placement: PropTypes.string,
    //拨号图标大小,不传默认16
    btnSize: PropTypes.number,
};
export default DialUpKeyboard;