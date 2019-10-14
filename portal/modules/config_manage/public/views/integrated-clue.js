/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/10/29.
 */
require('../css/index.less');
const Spinner = require('CMP_DIR/spinner');
const AlertTimer = require('CMP_DIR/alert-timer');
import Trace from 'LIB_DIR/trace';
import {Icon, Alert} from 'antd';
const ALERT_TIME = 4000;//错误提示的展示时间：4s
import CopyToClipboard from 'react-copy-to-clipboard';

class IntegratedClueManage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //集成-线索列表
            integratedClueList: [],
            //点击刷新按钮的loading效果是否显示
            isRefreshLoading: false,
            //加载失败的提示信息
            getErrMsg: '',
        };
    }

    componentWillMount() {
        this.getIntegratedClueList();
    }

    //获取集成-线索列表
    getIntegratedClueList = () => {
        this.setState({
            isRefreshLoading: true
        });
        $.ajax({
            url: '/rest/getIntegrationList',
            type: 'get',
            dateType: 'json',
            data: {page_size: 100},
            success: (data) => {
                this.setState({
                    integratedClueList: _.isArray(data.list) ? data.list : [],
                    isRefreshLoading: false
                });
            },
            error: (errorMsg) => {
                this.setState({
                    isRefreshLoading: false,
                    getErrMsg: errorMsg.responseJSON || Intl.get('failed.get.config.integrate.list','获取线索集成列表失败')
                });
            }
        });

    };

    //点击刷新按钮
    getRefreshInfo = (e) => {
        this.setState({
            isRefreshLoading: true,
            integratedClueList: []
        });
        this.getIntegratedClueList();
    };

    renderErrorAlert = (errorMsg, hide) => {
        return (<AlertTimer time={ALERT_TIME} message={errorMsg} type="error" showIcon onHide={hide}/>);
    };

    renderIntegratedClueList = () => {
        let integratedClueList = this.state.integratedClueList;
        //正在获取数据的状态渲染
        if (this.state.isRefreshLoading) {
            return <Spinner/>;
        } else if (this.state.getErrMsg) {
            //错误提示
            return <Alert type="error" showIcon message={this.state.getErrMsg}/>;
        } else if (_.get(integratedClueList, '[0]')) {
            //集成-线索列表
            return (<ul className="integrate-list-wrap">
                {integratedClueList.map((item, index) => {
                    return (
                        <li className="integrate-list-container" key={index}>
                            <div className="integrate-content">
                                {item.uRL ? (
                                    <p className="url-content">
                                            url:{item.uRL}
                                        <CopyToClipboard text={item.uRL}>
                                            <Icon type="copy" style={{cursor: 'pointer'}}
                                                title={Intl.get('user.log.copy', '点击可复制')}/>
                                        </CopyToClipboard>
                                    </p>

                                ) : null}
                                {item.secret ? (
                                    <p className="secret-content">
                                        {Intl.get('my.app.app.secret.key', '密钥')}:{item.secret}
                                        <CopyToClipboard text={item.secret}>
                                            <Icon type="copy" style={{cursor: 'pointer'}}
                                                title={Intl.get('user.log.copy', '点击可复制')}/>
                                        </CopyToClipboard>
                                    </p>

                                ) : null}
                            </div>
                        </li>);
                }
                )}
            </ul>);
        } else {//没有集成-线索时的提示
            return <Alert type="info" showIcon
                message={Intl.get('config.integrated.clue.no.list', '暂无线索集成')}/>;
        }
    };

    render() {
        return (
            <div className="box integrate-clue-list-container" data-tracename="线索同步">
                <div className="box-title">
                    {Intl.get('config.integrated.clue.manage', '线索同步')}&nbsp;&nbsp;
                    <span
                        onClick={this.getIntegratedClueList.bind(this)}
                        className="refresh"
                        data-tracename="点击获取线索集成的刷新按钮"
                    >
                        <Icon type="reload" title={Intl.get('config.customer.stage.reload', '重新获取线索集成列表')}/>
                    </span>
                </div>
                <div className="box-body">
                    {this.renderIntegratedClueList()}
                </div>
            </div>
        );
    }
}
export default IntegratedClueManage;

