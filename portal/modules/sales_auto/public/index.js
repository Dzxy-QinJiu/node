/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/8/14.
 */
import CustomerScore from '../../customer_score/public/index';
import UserScore from '../../user_score/public/index';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
const LAYOUT = {
    BOTTOM: 12
};
class salesAuto extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }




    componentWillMount() {
    }



    render() {
        var height = $(window).height() - LAYOUT.BOTTOM;
        return (
            <div data-tracename="销售自动化评分" style={{height: height}}>
                <GeminiScrollbar>
                    <CustomerScore/>
                    <UserScore/>
                </GeminiScrollbar>

            </div>
        );
    }
}

module.exports = salesAuto;
