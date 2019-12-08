'use strict';
require('./css/logo.less');
import {Link} from 'react-router-dom';
const LogoSrc = require('./image/logo.png');
const PropTypes = require('prop-types');

//var LogoSrcUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAYAAADFw8lbAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABIFJREFUeNrkmV1MW2UYx5+2p7SHFvpFP6QtHYKCEQZrYpyR+REzB4lZ8G46o2TxTkO82GKMMd54Y7zZhVdemAXjSDRGUGOccRkDpiKbsVsR6loog37TrzPK6Ret73tGa7E06zk9gMQneXLSt6fv++v7/M/zPH0ryOfzcBCM4Guij6cCvegyhPwF5OvILyAfe/OY3s3H/IJadhTBDaIL9meQWyrctoyBMTiC/mNPQBGYcgusAKdguV58Cxr7BAKP8QaK4A6VwD3Ns/TGS6DdrEFL9IZ3rWePnhfblq4ndpLINtCPLq98R4gIq1gkfGA/n/Bg6G4wtUGPfPhK97nCmLD0huNdKiVFJ7ULPipO0Zk9B7w1701e/Oo6HfSGdc/2Nicqpie5RJQ9/YSBmF2kFKMzAZBJRMk2nTxvUEjJ3YJLprJgm/PEZ213yHR6Uzp8ygqdh9TV5dHHHmyEZpUEPp3ySm+uxGHeS2VaNPV0s5JsJOtEvACikMHl6dtri3fCqlR6U2HWN8DwGSs0KUl2Cd+IQM/2W2B0xg/21YTYFWQcdI2SVQRtUsvqOAE6XCGYmnGFAmvrWvSyiZHc4xZ4uf8R7pWJrBPCmWPNMOmIwdjvoXtCp1Im5NAoJYJmTX2DUUWS1YR3wRmgr1xzZjeSmQY0pGXmlxDw+mA3WDv1/JTQpzqU96Qw6YVkJseMUcmsbs5DwV/+9ZhJTQpam2QKQiQoC+/07NKafcEvz27mtn0hHGoM2WJo5LfWt+tIeO9kK9YtuIJ0cTyzmVMuhRKAHcki8LChQR8KUnDlZ+eKxx83F8Jbak/2GFGoO6FeKt6dpgRL4Y3nTHDpVhgu2SPl+Y9K6d2rEZi7vshsWtnnUaixFvt6jXvTPZ3o1jBSGP01UJRCMcVVyAoaBQnDp45UHWre2rxukxyMA1i3PvDGUsVxVNXK7j3SoWP0yCbU/zZhLblQLRPD2YEW5mGrZC+d6AScxGuB5K1xHrRqwaiUwNcoheUz/+ixUpXZ1w6/UM1GfnJDh0XN6LHWXdwV0EI1e+tkO3hCZt57AiEcEPv/gvqiSUD1/L/7c9mJyuqkIwq3l6IwPeVgyuTzRy2cEzyvoHQ6h1rAdfjBHoZoIsuMSbbeu2bzMI4zAC6ZXMpmzaCRRIZp/X5bpMpKaFn/uRxhfGzCycDiXeaStggu4UWNNOuFwnEaxq86GeciC4JLeGs1LrIg+AgvV2MjC4LP8HK1amSxDfTzX/zRG+67+5rYsSRuzAdyaIdj/V19Oyf89wdaX3zUKOtp1ZK2/YCU1hG5rram8WQ6q/nsXN/5qg7J3vnGdXgjnRtZCtGszp4kmTST8NkCtpuV39pda0O+L0/HOJ3msQVmA4p61jzawcnZP/2DlQCrBmULXA1oAdCgkb32yfDR5WrWZ33ifD/g+4E+ZFbZ5PXiV7//4PhNNutyPhqvBFwJlCtgzaAFO391pc8TSV1w+DfadgKtFZA30FJgV5C+6PdRZgzKF2DRMCif/vYX80MD7/54mO95BQflD7G/BRgAnynGNqbzxZEAAAAASUVORK5CYII=";
// Logo组件
class Logo extends React.Component {
    render() {
        // 链接样式
        var aStyle = {
            height: this.props.size || '40px',
            display: 'inline-block',
            textDecoration: 'none'
        };
        // 图片样式
        var imgStyle = {
            width: this.props.size || '40px',
            height: this.props.size || '40px',
            marginRight: '10px',
            verticalAlign: 'top'
        };
        // 文本样式
        var textStyle = {
            lineHeight: this.props.size || '40px',
            fontSize: this.props.fontSize || '14px',
            color: this.props.fontColor || '#ffffff'
        };
        return (
            <Link to={this.props.jumpUrl || '/'} className="logo" style={aStyle}>
                <img style={imgStyle} src={this.props.logoSrc || LogoSrc}/>
                <span style={textStyle}>
                    {
                        this.props.logoText ? this.props.logoText : (
                            <i className="iconfont icon-ketao-logo" style={{fontSize: this.props.fontSize || '24px'}}/>
                        )
                    }
                </span>
            </Link>
        );
    }
}
Logo.propTypes = {
    jumpUrl: PropTypes.string,
    size: PropTypes.string,
    fontSize: PropTypes.string,
    fontColor: PropTypes.string,
    logoSrc: PropTypes.string,
    logoText: PropTypes.sting,
};
module.exports = Logo;
