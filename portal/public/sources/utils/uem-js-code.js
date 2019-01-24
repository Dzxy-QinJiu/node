/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/1/24.
 */
//uem用户接入时，产品设置的js代码
exports.getUemJSCode = (uemSiteId) => {
    return `<!-- Curtao -->
<script type='text/javascript'>
  var _paq = _paq || [];
  /* 将下一行代码中的星号，替换为真实的用户账号，此项为必须设置的项*/
  _paq.push(['setUserId', '******']);
  /*以下1-4的属性设置，放开需要上传属性的注释，将星号部分都替换为字符串格式的真实数据*/
  /*用户昵称*/
  /*_paq.push(['setCustomVariable', '1', 'nickname', '******', 'visit']);*/
  /*用户角色名称，例如: 管理员、销售等角色名*/
  /*_paq.push(['setCustomVariable', '2', 'role', '******', 'visit']);*/
  /*用户所在单位或公司*/
  /*_paq.push(['setCustomVariable', '3', 'organization', '******', 'visit']);*/
  /*用户到期时间，时间格式为：YYYY-MM-DD*/
  /*_paq.push(['setCustomVariable', '4', 'expiretime', '******', 'visit']);*/
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u='https://ustatweb.antfact.com/';
    _paq.push(['setTrackerUrl', u+'piwik.php']);
    _paq.push(['setSiteId', ${uemSiteId}]);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
  })();
</script>
<!-- End Curtao Code -->`;
};