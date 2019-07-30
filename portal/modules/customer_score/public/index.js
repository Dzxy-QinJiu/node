/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/7/30.
 */
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
class customerScore extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            
        };
    }


    //获取竞品列表
    getProductList = () => {
        $.ajax({
            url: '/rest/competing_product',
            type: 'get',
            dateType: 'json',
            success: (data) => {
                this.setState({
                    productList: _.get(data, 'result'),
                    isLoading: false
                });
            },
            error: (errorMsg) => {
                this.setState({
                    isLoading: false,
                    getErrMsg: errorMsg.responseJSON
                });
            }
        });

    };

    componentWillMount() {
        // this.getProductList();
    }
    renderCustomerScoreList = () => {

    };




    render() {
        let height = $(window).height() - BACKGROUG_LAYOUT_CONSTANTS.PADDING_HEIGHT;
        return (
            <div className="customer-score-container" data-tracename="客户评分" style={{height: height}}>
                <div className="customer-score-wrap">
                    <GeminiScrollBar style={{height: height}}>
                        <div className="customer-score-content">
                            {this.renderCustomerScoreList()}
                        </div>
                    </GeminiScrollBar>

                </div>
            </div>
        );
    }
}

module.exports = customerScore;

