/**
 * Created by hzl on 2019/10/14.
 */
require('./index.less');
const Spinner = require('CMP_DIR/spinner');
import {Icon, message} from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';
import NoData from 'CMP_DIR/no-data';
import LoadDataError from 'CMP_DIR/load-data-error';

class ClueIntegration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            integratedClueList: [], // 线索集成列表
            isLoading: false, // 加载的loadinng
            getErrMsg: '', // 获取线索集成失败的信息
        };
    }

    componentWillMount() {
        this.getIntegratedClueList();
    }

    //获取集成-线索列表
    getIntegratedClueList = () => {
        this.setState({
            isLoading: true
        });
        $.ajax({
            url: '/rest/get/clue/integration',
            type: 'get',
            dateType: 'json',
            data: {page_size: 100},
            success: (data) => {
                this.setState({
                    integratedClueList: _.isArray(data.list) ? data.list : [],
                    isLoading: false
                });
            },
            error: (errorMsg) => {
                this.setState({
                    isLoading: false,
                    getErrMsg: errorMsg.responseJSON || Intl.get('failed.get.config.integrate.list','获取线索集成列表失败')
                });
            }
        });

    };

    //点击刷新按钮
    getRefreshInfo = (e) => {
        this.setState({
            isLoading: true,
            integratedClueList: []
        });
        this.getIntegratedClueList();
    };

    // 重新生成密钥
    handleRegenerateClueIntegration = (item) => {
        $.ajax({
            url: '/rest/change/clue/integration',
            type: 'put',
            dateType: 'json',
            data: {id: item.id, secret: 'refresh'},
            success: (data) => {
                if (data) {
                    this.getIntegratedClueList();
                }
            },
            error: (errorMsg) => {
                this.setState({
                    isLoading: false
                });
                message.error(errorMsg || Intl.get('clue.integration.failed.regenerate.create', '重新生成密钥失败'));
            }
        });
    };

    renderIntegratedClueList = () => {
        let integratedClueList = this.state.integratedClueList;
        //集成-线索列表
        return (<ul className="integrate-list-wrap">
            {integratedClueList.map((item, index) => {
                return (
                    <li className="integrate-list-container" key={index}>
                        <div className="integrate-content">
                            {item.url ? (
                                <p className="url-content">
                                    <span className="integrate-label">url:</span>
                                    <span className="content">{item.url}</span>
                                    <CopyToClipboard text={item.url}>
                                        <Icon type="copy" style={{cursor: 'pointer'}}
                                            title={Intl.get('user.log.copy', '点击可复制')}/>
                                    </CopyToClipboard>
                                </p>

                            ) : null}
                            {item.secret ? (
                                <p className="secret-content">
                                    <span className="integrate-label">{Intl.get('my.app.app.secret.key', '密钥')}:</span>
                                    <span className="content">{item.secret}</span>
                                    <CopyToClipboard text={item.secret}>
                                        <Icon type="copy" style={{cursor: 'pointer'}}
                                            title={Intl.get('user.log.copy', '点击可复制')}/>
                                    </CopyToClipboard>
                                </p>

                            ) : null}
                        </div>
                        <div>
                            <a onClick={this.handleRegenerateClueIntegration.bind(this, item)}>
                                {Intl.get('clue.integration.regenerate.create', '重新生成')}
                            </a>
                        </div>
                    </li>);
            }
            )}
        </ul>);
    };

    handleCreateClueIntegration = () => {
        this.setState({
            isLoading: true,
        });
        $.ajax({
            url: '/rest/create/clue/integration',
            type: 'post',
            dateType: 'json',
            data: {},
            success: (data) => {
                this.setState({
                    integratedClueList: [data],
                    isLoading: false,
                });
            },
            error: (errorMsg) => {
                this.setState({
                    isLoading: false
                });
                message.error(errorMsg || Intl.get('clue.integration.failed.create', '生成密钥失败'));
            }
        });
    };
    
    handleNoDataTextContent = () => {
        return(
            <span>
                {Intl.get('config.integrated.clue.no.list', '暂无线索集成')}，
                <a onClick={this.handleCreateClueIntegration}>
                    {Intl.get('clue.integration.create.secret', '生成密钥')}
                </a>
            </span>
        ); 
    };

    renderNoDataOrLoadError = () => {
        let getErrMsg = this.state.getErrMsg;

        return (
            <div className="msg-tips">
                {
                    getErrMsg ? (
                        <LoadDataError
                            retryLoadData={this.getRefreshInfo}
                        />
                    ) : (
                        <div className="no-data-tips-operate">
                            <NoData
                                textContent={this.handleNoDataTextContent()}
                            />
                        </div>
                    )
                }
            </div>
        );
    };

    renderClueIntegrationContent = () => {
        let integratedClueList = this.state.integratedClueList;
        let length = _.get(integratedClueList, 'length');
        if (length) {
            return this.renderIntegratedClueList();
        } else {
            return this.renderNoDataOrLoadError();
        }
    };

    render() {
        let isLoading = this.state.isLoading;

        return (
            <div
                className="integrate-clue-container"
                data-tracename="线索集成"
            >
                <div className="integrate-clue-content-wrap">
                    {
                        isLoading ? ( <Spinner loadingText={Intl.get('common.sales.frontpage.loading', '加载中')}/>) : (
                            <div className="integrate-clue-content">
                                {this.renderClueIntegrationContent()}
                            </div>
                        )
                    }
                </div>

            </div>
        );
    }
}
export default ClueIntegration;
