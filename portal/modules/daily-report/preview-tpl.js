/**
 * 预览模板
 */

import { Button } from 'antd';
import { VIEW_TYPE } from './consts';
import { renderButtonZoneFunc } from './utils';
import ReportForm from './report-form';

class PreviewTpl extends React.Component {
    state = {
        currentView: VIEW_TYPE.ADD_TPL,
    }

    render() {
        const { tplList, clickedTpl } = this.props;
        const tpl = _.find(tplList, item => item.id === clickedTpl) || {};
        const renderButtonZone = renderButtonZoneFunc.bind(this);

        return (
            <div>
                <ReportForm />

                {renderButtonZone([{
                    name: '返回',
                    func: () => { this.props.updateState({ currentView: VIEW_TYPE.ADD_TPL }); },
                }])}
            </div>
        );
    }
}

export default PreviewTpl;
