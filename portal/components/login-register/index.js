/**
 * Copyright (c) 2015-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2019 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/11/14.
 */
'use strict';

import Translate from '../../public/intl/i18nTemplate';
import RegisterMain from './main';

class Register extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Translate Template={<RegisterMain {...this.props}/>}></Translate>
        );
    }
}

module.exports = Register;