import './index.less';
import React from 'react';
import { PropTypes } from 'prop-types';
import {Button} from 'antd';
import classNames from 'classnames';
import {isResponsiveDisplay} from 'PUB_DIR/sources/utils/common-method-util';
//统一的返回主面板按钮
class BackMainPage extends React.Component{
    render(){
        let {isWebMin} = isResponsiveDisplay();
        let btnCls = classNames(`back-main-page ${this.props.className}`,
            {'min-btn': isWebMin});
        return(
            <Button className={btnCls}
                type="primary"
                onClick={ this.props.handleBackClick }>
                {isWebMin ? <span className="iconfont icon-return-btn"/> :
                    <React.Fragment>
                        <span className="iconfont icon-return-btn"/>
                        <span className="return-btn-font">  {Intl.get('crm.52', '返回')}</span>
                    </React.Fragment>}
            </Button>
        );
    }
} 
BackMainPage.defaultProps = {
    handleBackClick: function(){

    },
    className: '',
};
BackMainPage.PropTypes = {
    handleBackClick: PropTypes.func,//按钮的点击回调
    className: PropTypes.string,//可以传入class调整样式
};
export default BackMainPage;