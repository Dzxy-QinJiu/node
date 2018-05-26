/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/4/23.
 */
import {Button} from "antd";
var rightPanelUtil = require("../../../../components/rightPanel");
var RightPanel = rightPanelUtil.RightPanel;
var RightPanelClose = rightPanelUtil.RightPanelClose;
import ClueImport from "./clue-import";
class ClueImportTemplate extends React.Component {
    constructor(props){
        super(props);
    }
    handleCancel= (e) =>{
        e.preventDefault();
        this.props.closeClueTemplatePanel();
    };
    render(){
        return (
            <RightPanel className="import-clue-template-panel white-space-nowrap"
                showFlag={this.props.showFlag} data-tracename="导入线索模板">
                <RightPanelClose onClick={this.props.closeClueTemplatePanel} data-tracename="点击关闭导入线索面板"/>
                <div>
                    <div className="import-tips">
                        <p>
                            1.<ReactIntl.FormattedMessage
                                id="common.download.template"
                                defaultMessage={`点击下载{template}`}
                                values={{
                                    "template":  <a data-tracename="点击导入线索模板" href="/rest/clue/download_template">{Intl.get("clue.manage.import.clue.template", "导入线索模板")}</a>
                                }}
                            />
                        </p>
                        <p>
                            2.{Intl.get("common.write.template", "填写模板文件后，选择文件并导入")}
                        </p>
                    </div>

                    <div className="import-file">
                        <ClueImport
                            refreshClueList={this.props.refreshClueList}
                            closeClueTemplatePanel={this.props.closeClueTemplatePanel}
                        />
                        <Button
                            type="ghost"
                            onClick={this.handleCancel}
                            data-tracename="点击取消导入线索模板按钮"
                        >
                            <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                        </Button>
                    </div>
                </div>
            </RightPanel>
        );
    }
}
export default ClueImportTemplate;