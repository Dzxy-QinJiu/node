/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/12/13.
 */
import {Input, Button, Form, Icon, message} from 'antd';
require('./index.less');
import NoDataIntro from 'CMP_DIR/no-data-intro';
import AccessUserTemplate from './access-user-template';

class IntegrateConfigView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isAddingProduct: false,
            addErrorMsg: '',
            jsCopied: false,
            testResult: '',//测试结果success、error
            custom_variable: {}, // 自定义属性
            isAccessUserTemplateShow: false //接入用户模块展示
        };
    }

    //接入用户按钮
    renderAccessUserBtn = () => {
        return (
            <Button
                type='primary'
                onClick={this.displayAccessPanel}
            >{Intl.get('app.manage.access.user', '接入用户')}</Button>
        );
    };

    //接入用户panel展示操作
    displayAccessPanel = () => {
        this.setState({
            isAccessUserTemplateShow: true
        });
    }

    //关闭接入用户panel
    closeAccessUserTemplatePanel = () => {
        this.setState({
            isAccessUserTemplateShow: false
        });
    }

    render() {
        //计算垂直居中需要的距离
        let marginTop = ($(window).height() - $('.no-data-intro').height()) / 2;
        return (
            <div className="integrate-config-wrap" style={{'margin-top': marginTop}}>
                <NoDataIntro
                    noDataAndAddBtnTip={Intl.get('app.manage.no.user.info', '暂无用户信息')}
                    showAddBtn={true}
                    renderAddAndImportBtns={this.renderAccessUserBtn}
                />
                <AccessUserTemplate
                    showFlag={this.state.isAccessUserTemplateShow}
                    closeTemplatePanel={this.closeAccessUserTemplatePanel}
                />
            </div>
        );
    }
}

IntegrateConfigView.propTypes = {
    form: PropTypes.object
};
export default Form.create()(IntegrateConfigView);