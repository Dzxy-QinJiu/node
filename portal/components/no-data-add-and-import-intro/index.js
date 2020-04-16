/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/8/15.

 名称: 没有数据展示引导操作组件
 适用场景： 没有数据时，引导添加或者导入数据，如果没有添加和导入的权限，展示没有数据的提示
 用法：
    showAddBtn ： 展示添加或引导按钮
    renderAddDataContent： 添加按钮及添加相关提示
    renderImportDataContent：导入按钮及导入相关提示
    noDataTip： 没有数据的提示
    renderOtherOperation： 渲染其他操作的区域
 */
require('./index.less');
class NoDataIntro extends React.Component {
    constructor(props) {
        super();
        this.state = {};
    }
    renderNodataAddIntro = () => {
        return (
            <div className="no-data-add-and-import-intro">
                <div className="no-data-container-warp">
                    <div className="add-data-wrap">
                        <span className="add-data-background"></span>
                        <div className="add-data-tip">
                            {this.props.renderAddDataContent()}
                        </div>
                    </div>
                    {this.props.useImportContent ? (
                        <div className="import-data-wrap">
                            <span className="import-data-background"></span>
                            <div className="import-data-tip">
                                {this.props.renderImportDataContent()}
                            </div>

                        </div>
                    ) : null}
                </div>
                <div className="add-other-operation">
                    {_.isFunction(this.props.renderOtherOperation) && this.props.renderOtherOperation()}
                </div>
            </div>
        );
    }
    renderNodataTip = () => {
        return (
            <div className="no-data-add-and-import">
                <i className="iconfont icon-no-data"></i>
                <p className="abnornal-status-tip">{this.props.noDataTip}</p>
            </div>
        );
    }
    render() {
        return (
            <div className={`no-data-add-and-import-intro-wrap ${this.props.className}`}>
                {this.props.showAddBtn ? this.renderNodataAddIntro() : this.renderNodataTip()}
            </div>
        );
    }
}

NoDataIntro.defaultProps = {
    showAddBtn: false,
    noDataTip: '',
    renderAddDataContent: function() {},
    renderImportDataContent: function() {},
    renderOtherOperation: function(){},
    useImportContent: true,
    className: ''
};
NoDataIntro.propTypes = {
    showAddBtn: PropTypes.bool,
    noDataTip: PropTypes.string,
    renderAddDataContent: PropTypes.func,
    renderImportDataContent: PropTypes.func,
    renderOtherOperation: PropTypes.func,
    useImportContent: PropTypes.bool,
    className: PropTypes.string,
};
export default NoDataIntro;