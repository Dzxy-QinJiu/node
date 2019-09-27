import React from 'react';
import { PropTypes } from 'prop-types';
import {Button} from 'antd';
import './index.less';
//统一的返回主面板按钮
class BackMainPage extends React.Component{
    render(){
        return(
            <Button className={'back-main-page ' + this.props.className} 
                type="primary"
                onClick={ this.props.handleBackClick }>
                <span className="iconfont icon-return-btn"/>
                <span className="return-btn-font">  {Intl.get('crm.52', '返回')}</span>
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