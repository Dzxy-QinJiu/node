/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/5/7.
 */
require('./css/no-data-tip.less');
class NoDataTip extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="no-data-tip">
                {this.props.tipContent || ''}
            </div>);
    }
}
NoDataTip.defaultProps = {
    tipContent: ''//无数据时的提示内容
};
export default NoDataTip;