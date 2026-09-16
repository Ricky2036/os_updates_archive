(function () {
  /**
   * 页面加载事件
   */
  let actionCode = "",
    /**
     * 元素 的 DOM路径 的 xpath
     * @type {string}
     */
    elementSign = "",
    /**
     * 元素 的 文本值
     * @type {string}
     */
    elementValue = "",
    /**
     * 页面标题
     * @type {string}
     */
    actionName = window.document.title,
    /**
     * 页面由JSSDK自动获取当前页面URL
     * @type {string}
     */
    path = window.document.location.href
      .replace(/Patterns/gi, "Pattern")
      .replace(/Pattern/gi, "Patterns"),
    /**
     * 页面由JSSDK自动获取跳转过来地址
     * @type {string}
     */
    referer = getReferer(),
    /** 事件类型 1：页面加载，2：点击，3：左滑动，4：右滑动，5：长按，6：拖动，7：曝光(后续可能扩展)
     **/
    eventType = "",
    /** 登录后的用户ID
     **/
    uid = "",
    /**
     * 设备类型（P8，P9，P10等对应型号。例如：KNT-UL10）
     * @type {string}
     */
    deviceType = "",
    /**
     * 设备标识(例如：99999999)
     * @type {string}
     */
    deviceId = "",
    /**
     * APP版本名称（例如：1.3.01）
     * @type {string}
     */
    appVersionName = "",
    /**
     * 接入类型.取值范围：0-9 WAP，10-19 APP，20 PC
     * @type {string}
     */
    at = getAt(),
    /**
     * 请求头User-Agent
     * @type {string}
     */
    ua = getUserAgent(),
    /**
     * 渠道号（例如：sogou）
     * @type {string}
     */
    channel = "",
    /**
     * 事件内容，扩展字段（例如："content": {"bb": "1111","cc":"2221","dd":"3331"}）
     * @type {{load: string}}
     */
    content = {
      load: "1",
    },
    /**
     * 国家码， CN 是默认值，也可以手动设置
     * @type {string}
     */
    co = "CN",
    /**
     * 设备制造商
     * @type {string}
     */
    dm = "",
    /**
     * 省
     * @type {string}
     */
    province = "",
    /**
     * 市
     * @type {string}
     */
    city = "",
    /**
     * 渠道追踪
     * @type {string}
     */
    appPath = "",
    /**
     * 底层操作系统，如安卓
     * @type {string}
     */
    os = "",
    /**
     * 操作系统的版本例如：9
     * @type {string}
     */
    osv = "",
    /**
     * 系统UI版本（例如：EmotionUI_9.0.1）
     * @type {string}
     */
    ouv = "",
    /**
     * IP地址，考虑到隐私问题最好最后一位用*号替代（例如：192.1.1.*）
     * @type {string}
     */
    ia = "",
    /**
     * 是否接入WIFI（例如：1）
     * @type {string}
     */
    wf = "",
    /**
     * 网络制式（例如：5G）
     * @type {string}
     */
    nt = "",
    /**
     * 运营商名称（例如：中国移动）
     * @type {string}
     */
    nn = "",
    /**
     *  接入站点, 区域码（例如：CN）
     * @type {string}
     */
    ac = "",
    /**
     * 设备UDID（例如：1234564131231）
     * @type {string}
     */
    udid = "",
    /**
     * 用户访问ID(用户打开浏览器访问分配，登陆前和登陆后一样，需要开发。例如：666999848888)
     * 从cookie里面获取。
     */
    tid = getTid(),
    /**
     * 导流商标识（例如：9999991）
     * 从cookie里面获取。
     */
    cpsId = getValueFromCookie("cps_id") || "",
    /**
     * 导流商子信息。（例如：8888881）
     * 从cookie里面获取
     */
    wi = getValueFromCookie("cps_wi") || "",
    /**
     * 语言
     * @type {string}
     */
    ln = window.navigator.language,
    /**
     * 自研的webPush
     * @type {string}
     */
    webPushToken = "",
    /**
     * 数据上报的地址
     */
    reportUrl = "",
    /**
     * 开关：是否自动上报标识
     * 默认自动上报，布尔型
     */
    autoReportFalg = true,
    /**
     * 策略ID
     * @type {string}
     */
    strategies = "",
    /**
         * 手机类型。取值范围：1 手机；2 平板；3 折叠屏
         * 普通WAP ：6
         微信公众号 ：7
         支付宝生活号 ：8
         APK嵌入WAP（荣耀商城APK）:9
         APK嵌入WAP（myhonor APK）:10
         APK嵌入WAP（俱乐部APK）:11
         APK嵌入WAP（智慧生活APK）:12
         */
    dc = "",
    /**
     * 智慧生活APK上报uuid
     */
    uuid = "",
    /**
     * 同一开放平台下的（公众号/小程序）用户唯一标识
     */
    unionId = "",
    /**
     * 公众号/小程序用户唯一标识
     */
    openId = "",
    /**
     * 页面ID
     */
    pageId = "",
    /**
     * 平台类型
     */
    platformType = "",
    /**
     * 站内渠道ID
     */
    nid = "",
    /**
     * 站内渠道参数
     */
    nwi = "",
    /**
     * 推广ID
     */
    oaid = "",
    /**
     * 手机序列号
     */
    sn = "",
      /**
       * 未成年标识
       */
    appModel;

  /**
   * 获取用户访问的ID
   * @returns {string|null}
   */
  function getTid() {
    var tid;

    //第二步
    if (
      "undefined" != typeof vmallAndroid &&
      vmallAndroid.getTID &&
      vmallAndroid.getTID()
    ) {
      //判断是否存在安卓方法
      tid = vmallAndroid.getTID();
      setCookie("TID", tid, {
        expires: 3650,
        domain: get2LevelDomain(),
      });
      sessionStorage.setItem("TID", tid);
      return tid;
    }
    tid = sessionStorage.getItem("TID"); //第一步
    if (tid) {
      return tid;
    }
    //第三步
    tid = getValueFromCookie("TID");
    if (tid) {
      return tid;
    }

    let deviceid = getValueFromCookie("deviceid");
    if (deviceid == null || deviceid == "" || deviceid == undefined) {
      var s = [];
      var h = "0123456789abcdef";
      for (var a = 0; a < 32; a++) {
        s[a] = h.substr(Math.floor(Math.random() * 16), 1);
      }
      s[14] = "4";
      s[19] = h.substr((s[19] & 3) | 8, 1);
      s[8] = s[13] = s[18] = s[23];
      deviceid = s.join("");

      setCookie("deviceid", deviceid, {
        expires: 3650,
        domain: get2LevelDomain(),
      });
    }

    setCookie("TID", deviceid, {
      expires: 3650,
      domain: get2LevelDomain(),
    });

    sessionStorage.setItem("TID", deviceid);

    return deviceid;
  }

  /**
   * 自动获取 referer 字段
   * 如果 连接中包含 ‘src’，替换成 ‘***’，解决安全框架拦截的问题。
   */
  function getReferer() {
    return document.referrer.replace(new RegExp("src", "g"), "***");
  }

  /**
   * 暴露给外部使用的实体对象， 调用SDK的方法的时候通过 JSAnalysisSDK.XXX() 调用
   * @type {{buildArray: *, alertTest: *}}
   */
  JSAnalysisSDK = (function () {
    // 开关：是否自动上报标识
    function autoReport(flag) {
      autoReportFalg = flag;
      return this;
    }

    function setReportUrl(reportUrlValue) {
      reportUrl = reportUrlValue;
      return this;
    }

    function report() {
      onReport(buildPostParams());
      return this;
    }

    return {
      autoReport: autoReport,
      report: report,
      set: set,
      track: track,
      setReportUrl: setReportUrl,
    };
  })();

  (function bindReady() {
    /**
     * desc: 对 document 的点击事件 监听, 获取点击事件的 元素的 DOM 路径 Xpath 值
     * updated by: 00014903
     */
    if (document.body.addEventListener) {
      document.body.addEventListener("click", docClickHandler, true);
    } else {
      document.body.attachEvent(
        "onclick",
        (event) => docClickHandler.call(document.body, event),
        false
      );
    }
    /**
     * ========================================================
     * ========================= END ==========================
     * ========================================================
     */

    if (window.addEventListener) {
      document.addEventListener("DOMContentLoaded", init, false);
    } else {
      init();
    }
  })();

  /**
   * 初始化SDK，SDK被引入的时候会自动初始化
   */
  function init() {
    if (!autoReportFalg) return; // 判断是否阻止自动上报
    onReport(buildPostParams());
  }
  /**
   * window点击事件处理函数
   * @param {*} e
   */
  function docClickHandler(e) {
    const event = e || window.event;
    const targetElement = event.target || event.srcElement;

    let tmpEleValue = targetElement
      ? targetElement.innerText || targetElement.value || ""
      : "";
    tmpEleValue = tmpEleValue.replace(/[\r\n]/g, " ").replace(/[ ]+/g, " ");
    // tmpValue 已经删除了回车换行以及空格
    let startSub = tmpEleValue.length - 100 > -1 ? tmpEleValue.length - 100 : 0;

    let pointer = targetElement,
      flag = false;
    let nodeName = pointer.tagName.toLowerCase();
    while (pointer && nodeName != "body" && nodeName != "html") {
      if (nodeName == "input" || pointer.className == "search index-search") {
        flag = true;
        break;
      }
      pointer = pointer.parentNode;
    }
    if (flag) {
      elementValue = "搜索框";
      elementSign = getXPath(pointer);
    } else {
      elementValue = tmpEleValue.substring(startSub, tmpEleValue.length);
      elementSign = getXPath(targetElement);
    }
  }
  /**
   * 获取当前时间，时间格式为（四位年+两位月+两位日+两位时+两位分+两位秒+三位毫秒 20200109121159001）
   * @returns {*} 北京时间（UTC + 8：00）
   */
  function getTime() {
    let localDate = new Date();

    // 将个位数前面加0，转换为字符串
    function parseTwo(n) {
      return (n < 10 ? "0" : "") + n;
    }
    // 当前时间取毫秒小于100的，需补足三位数
    function parseMillSec(n) {
      return (n < 10 ? "00" : n < 100 ? "0" : "") + n;
    }

    return (
      localDate.getFullYear() +
      parseTwo(localDate.getMonth() + 1) +
      parseTwo(localDate.getDate()) +
      parseTwo(localDate.getHours()) +
      parseTwo(localDate.getMinutes()) +
      parseTwo(localDate.getSeconds()) +
      parseMillSec(localDate.getMilliseconds())
    );
  }

  function track (params) {
    onTrack(params);
  }

  function set(params) {
    if (params) {
      if (params.actionCode) {
        actionCode = params.actionCode;
      }
      if (params.actionName) {
        actionName = params.actionName;
      }
      if (params.uid || "" === params.uid) {
        uid = params.uid;
      }
      if (params.eventType) {
        eventType = params.eventType;
      }
      if (params.deviceType) {
        deviceType = params.deviceType;
      }
      if (params.deviceId) {
        deviceId = params.deviceId;
      }
      if (params.appVersionName) {
        appVersionName = params.appVersionName;
      }
      if (params.channel) {
        channel = params.channel;
      }
      if (params.ouv) {
        ouv = params.ouv;
      }
      if (params.province) {
          province = params.province;
       }
      if (params.city) {
        city = params.city;
      }
      if (params.appPath) {
          appPath = params.appPath;
       }
      if (params.os) {
        os = params.os;
      }
      if (params.osv) {
        osv = params.osv;
      }

      if (params.content) {
        content = params.content;
      }
      if (params.co) {
        co = params.co;
      }
      if (params.wf) {
        wf = params.wf;
      }
      if (params.nt) {
        nt = params.nt;
      }
      if (params.nn) {
        nn = params.nn;
      }
      if (params.ln) {
        ln = params.ln;
      }
      if (params.udid || "" === params.udid) {
        udid = params.udid;
      }
      if (params.ac) {
        ac = params.ac;
      }
      if (params.at) {
        at = params.at;
      }
      if (params.ua) {
        ua = params.ua;
      }
      if (params.cpsId || "" === params.cpsId) {
        cpsId = params.cpsId;
      }
      if (params.wi || "" === params.wi) {
        wi = params.wi;
      }
      if (params.tid || "" === params.tid) {
        tid = params.tid;
      }
      if (params.referer) {
        referer = params.referer;
      }
      if (params.webPushToken) {
        webPushToken = params.webPushToken;
      }
      if (params.strategies) {
        strategies = params.strategies;
      }
      if (params.dc) {
        dc = params.dc;
      }
      if (params.uuid) {
        uuid = params.uuid;
      }
      if (params.unionId) {
        unionId = params.unionId;
      }
      if (params.openId) {
        openId = params.openId;
      }
      if (params.pageId) {
        pageId = params.pageId;
      }
      if (params.platformType) {
        platformType = params.platformType;
      }
      if (params.nid) {
        nid = params.nid;
      }
      if (params.nwi) {
        nwi = params.nwi;
      }
      if (params.oaid) {
        oaid = params.oaid;
      }
      if (params.sn) {
        sn = params.sn;
      }
      if (params.appModel) {
        appModel = params.appModel;
      }
      //支持端侧自定义传入elementSign
      if (params.elementSign) {
        console.log("set--->" + elementSign);
        elementSign = params.elementSign;
      }

      //支持端侧自定义传入elementValue
      if (params.elementValue) {
        console.log("set--->" + elementValue);
        elementValue = params.elementValue;
      }
    }
  }

  function onTrack(params) {
    let reportData = buildPostParams();

    if (params) {
      if (params.actionCode) {
        reportData.actionCode = params.actionCode;
      }
      if (params.actionName) {
        reportData.actionName = params.actionName;
      }
      if (params.uid) {
        reportData.uid = params.uid;
      }
      if (params.tid && params.tid != "") {
        reportData.tid = params.tid;
      }
      if (params.deviceType) {
        reportData.deviceType = params.deviceType;
      }
      if (params.deviceId) {
        reportData.deviceId = params.deviceId;
      }
      if (params.eventType) {
        reportData.eventType = params.eventType;
      }
      if (params.appVersionName) {
        reportData.appVersionName = params.appVersionName;
      }
      if (params.channel) {
        reportData.channel = params.channel;
      }
      if (params.content) {
        reportData.content = params.content;
      }
      if (params.province) {
        reportData.province = params.province;
      }
      if (params.city) {
        reportData.city = params.city;
      }
      if (params.appPath) {
         reportData.appPath = params.appPath;
       }
      if (params.os) {
        reportData.os = params.os;
      }
      if (params.osv) {
        reportData.osv = params.osv;
      }
      if (params.ouv) {
        reportData.ouv = params.ouv;
      }
      if (params.co) {
        reportData.co = params.co;
      }
      if (params.wf) {
        reportData.wf = params.wf;
      }
      if (params.nt) {
        reportData.nt = params.nt;
      }
      if (params.nn) {
        reportData.nn = params.nn;
      }
      if (params.ln) {
        reportData.ln = params.ln;
      }
      if (params.udid) {
        reportData.udid = params.udid;
      }
      if (params.ac) {
        reportData.ac = params.ac;
      }
      if (params.at) {
        reportData.at = params.at;
      }
      if (params.ua) {
        reportData.ua = params.ua;
      }
      if (params.cpsId) {
        reportData.cpsId = params.cpsId;
      }
      if (params.wi) {
        reportData.wi = params.wi;
      }
      if (params.referer) {
        reportData.referer = params.referer;
      }
      if (params.webPushToken) {
        reportData.webPushToken = params.webPushToken;
      }
      if (params.strategies) {
        reportData.strategies = params.strategies;
      }
      if (params.dc) {
        reportData.dc = params.dc;
      }
      if (params.uuid) {
        reportData.uuid = params.uuid;
      }
      if (params.unionId) {
        reportData.unionId = params.unionId;
      }
      if (params.openId) {
        reportData.openId = params.openId;
      }
      if (params.pageId) {
        reportData.pageId = params.pageId;
      }
      if (params.platformType) {
        reportData.platformType = params.platformType;
      }
      if (params.nid) {
        reportData.nid = params.nid;
      }
      if (params.nwi) {
        reportData.nwi = params.nwi;
      }
      if (params.oaid) {
        reportData.oaid = params.oaid;
      }
      if (params.sn) {
        reportData.sn = params.sn;
      }
      if (params.appModel) {
        reportData.appModel = params.appModel;
      }

      //支持端侧自定义传入elementSign
      if (params.elementSign) {
        console.log(elementSign);
        reportData.elementSign = params.elementSign;
      }

      //支持端侧自定义传入elementValue
      if (params.elementValue) {
        console.log(elementValue);
        reportData.elementValue = params.elementValue;
      }

    }

    onReport(reportData); //修改
  }

  function buildPostParams() {
    analysisReportUrl("");

    let reportData = {};

    if (actionCode) {
      reportData.actionCode = actionCode; // 事件ID（例如：2221）
    }
    if (actionName) {
      reportData.actionName = actionName;
    }
    if (path) {
      reportData.path = window.document.location.href
        .replace(/Patterns/gi, "Pattern")
        .replace(/Pattern/gi, "Patterns");
    }
    if (referer) {
      reportData.referer = referer;
    }

    reportData.idsite = getIdsite();

    if (uid) {
      reportData.uid = uid; // 帐号ID（例如：1001）
    }
    if (deviceType) {
      reportData.deviceType = deviceType; // 设备类型（P8，P9，P10等对应型号。例如：KNT-UL10）
    }
    if (eventType) {
      reportData.eventType = eventType; // 事件类型 1：页面加载，2：点击，3：左滑动，4：右滑动，5：长按，6：拖动，7：曝光(后续可能扩展)
    }
    if (deviceId) {
      reportData.deviceId = deviceId; // 设备标识(例如：99999999)
    }
    if (appVersionName) {
      reportData.appVersionName = appVersionName; // APP版本名称（例如：1.3.01）
    }
    if (tid) {
      reportData.tid = tid; // 用户访问ID(用户打开浏览器访问分配，登陆前和登陆后一样，需要开发。例如：666999848888)
    }
    if (at) {
      reportData.at = at; // 接入类型.取值范围：0-9 WAP，10-19 APP，20 PC
    }
    if (ua) {
      reportData.ua = ua; // 请求头user-agent
    }
    if (cpsId) {
      reportData.cpsId = cpsId; // 导流商标识（例如：9999991）
    }
    if (wi) {
      reportData.wi = wi; // 导流商子信息。（例如：8888881）
    }
    if (channel) {
      reportData.channel = channel; // 渠道号（例如：sogou）
    }
    if (content) {
      reportData.content = content; // 事件内容，扩展字段（例如："content": {"bb": "1111","cc":"2221","dd":"3331"}）
    }
    if (co) {
      reportData.co = co; // 国家码（例如：CN）
    }
    if (dm) {
      reportData.dm = dm; // 设备制造商，（例如：Apple）
    }
    if (province) {
      reportData.province = province; // 省
    }
    if (city) {
      reportData.city = city; // 市
    }
    if (appPath) {
      reportData.appPath = appPath; // 渠道追踪
    }
    if (os) {
      reportData.os = os; // 底层操作系统，（例如：iOS）
    }
    if (osv) {
      reportData.osv = osv; // 系统版本，（例如：9）
    }
    if (ouv) {
      reportData.ouv = ouv; // 系统UI版本（例如：EmotionUI_9.0.1）
    }
    if (ia) {
      reportData.ia = ia; // IP地址，考虑到隐私问题最好最后一位用*号替代（例如：192.1.1.*）
    }
    if (ln) {
      reportData.ln = ln; // 语言（例如：zh）
    }
    if (wf) {
      reportData.wf = wf; // 是否接入WIFI（例如：1）
    }
    if (nt) {
      reportData.nt = nt; // 网络制式（例如：5G）
    }
    if (nn) {
      reportData.nn = nn; // 运营商名称（例如：中国移动）
    }
    if (udid) {
      reportData.udid = udid; // 设备UDID（例如：1234564131231）
    }
    if (ac) {
      reportData.ac = ac; // 接入站点, 区域码（例如：CN）
    }
    if (webPushToken) {
      reportData.webPushToken = webPushToken; // 自研webpush token
    }
    if (strategies) {
      reportData.strategies = strategies;
    }
    if (dc) {
      reportData.dc = dc;
    }
    if (uuid) {
      reportData.uuid = uuid;
    }
    if (unionId) {
      reportData.unionId = unionId;
    }
    if (openId) {
      reportData.openId = openId;
    }
    if (pageId) {
      reportData.pageId = pageId;
    }
    if (platformType) {
      reportData.platformType = platformType;
    }
    if (nid) {
      reportData.nid = nid;
    }
    if (nwi) {
      reportData.nwi = nwi;
    }
    if (oaid) {
      reportData.oaid = oaid;
    }
    if (sn) {
      reportData.sn = sn;
    }
    if(appModel) {
      reportData.appModel = appModel;
    }

    reportData.time = getTime();
    reportData.sr = screen.width + "*" + screen.height; // 屏幕分辨率(例如：800*600)
    reportData.dat = -new Date().getTimezoneOffset() / 60;
    // 上报点击事件的 元素 DOM 路径
    reportData.elementSign = elementSign;
    reportData.elementValue = elementValue;
    return reportData;
  }

  /**
   * 获取接入类型.取值范围：0-9 WAP，10-19 APP，20 PC
   */
  function getAt() {
    let lowerCaseUserAgent = window.navigator.userAgent.toLowerCase();
    if (lowerCaseUserAgent.indexOf("android") > -1) {
      return "0";
    } else if (lowerCaseUserAgent.indexOf("iphone") > -1) {
      return "0";
    } else {
      return "20";
    }
  }

  /**
   * 如果 document.location.hostname = “www.hihonor.com” 取二级域名
   *         例如 path = “https://www.hihonor.com/cn/mw/help/storeaddr”， idsite = “www.hihonor.com/cn/mw”
   * 其余情况 idsite = “www.hihonor.com”
   * @returns {string} idsite
   */
  function getIdsite() {
    if (document.location.hostname == "www.hihonor.com" || document.location.hostname == "www.honor.com") {
      var pathnameArray = document.location.pathname.split("/");
      if (pathnameArray.length >= 3) {
        return (
          document.location.hostname +
          "/" +
          pathnameArray[1] +
          "/" +
          pathnameArray[2]
        );
      }
    }
    return document.location.hostname;
  }

  /**
   * 请求头User-Agent
   */
  function getUserAgent() {
    return window.navigator.userAgent;
  }

  /**
   * 解析url的参数，支持url后面拼接国家码
   * @param paramsString url
   */
  function analysisReportUrl(paramsString) {
    if (reportUrl != null && reportUrl.indexOf("?") > -1) {
      let stringArray = reportUrl.split("?");
      reportUrl = stringArray[0];

      if (stringArray.length < 2) {
        return;
      }

      let keyValueItem = stringArray[1].split("=");
      if (keyValueItem[0] == "areaCode") {
        co = keyValueItem[1];
      }
    }
  }
  /**
   * 向服务端发送数据
   *
   * @param params 发送数据的参数 (数据样例 link=200080100&idsite=hihonor.com)
   */
  function onReport(params) {
    let httpRequest;

    if (window.XMLHttpRequest) {
      // IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
      httpRequest = new XMLHttpRequest();
    } else {
      // IE6, IE5 浏览器执行代码
      httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
    }
    httpRequest.onreadystatechange = function () {
      if (httpRequest.readyState === 4 && httpRequest.status === 200) {
      }
    };
    if (!reportUrl || reportUrl == "") {
      reportUrl = "https://dap-cn.c.hihonor.com/dap/report";//生产
      //reportUrl = "https://dapsit-cn.test.hihonor.com/dap/report";//测试
    }
    if (reportUrl.indexOf("/v2") == -1) {
      reportUrl = reportUrl.replace("/batchReport", "/batchReport/v2"); ///将batchreport替换成report
    }

    httpRequest.open("POST", reportUrl, true);
    httpRequest.setRequestHeader(
      "Content-Type",
      "application/x-www-form-urlencoded; charset=UTF-8"
    );
    let paramsHandle = Object.keys(params)
      .map(function (key) {
        let str = "";
        if (params[key] instanceof Object) {
          str =
            encodeURI(key) +
            "=" +
            encodeURIComponent(JSON.stringify(params[key]));
        } else {
          str = encodeURI(key) + "=" + encodeURIComponent(params[key]);
        }
        return str;
      })
      .join("&");

    httpRequest.send(paramsHandle);
  }
  /**
   * 从cookie里面获取值
   * @param key cookie 里面存储数据的key值
   */
  function getValueFromCookie(key) {
    let f = null;
    if (document.cookie && document.cookie != "") {
      let d = document.cookie.split(";");
      for (let c = 0; c < d.length; c++) {
        let b = (d[c] || "").replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, "");
        if (b.substring(0, key.length + 1) == key + "=") {
          let e = function (j) {
            j = j.replace(/\+/g, " ");
            let h = '()<>@,;:\\"/[]?={}';
            for (let g = 0; g < h.length; g++) {
              if (j.indexOf(h.charAt(g)) != -1) {
                if (j.startWith('"')) {
                  j = j.substring(1);
                }
                if (j.endWith('"')) {
                  j = j.substring(0, j.length - 1);
                }
                break;
              }
            }
            return decodeURIComponent(j);
          };
          f = e(b.substring(key.length + 1));
          break;
        }
      }
    }
    return f;
  }

  /**
   * 设置cookie
   * @param key
   * @param val
   * @param c
   */
  function setCookie(key, val, c) {
    c = c || {};
    if (val === null) {
      val = "";
      c.expires = -1;
    }
    var expires = "";
    if (c.expires && (typeof c.expires == "number" || c.expires.toUTCString)) {
      var now;
      if (typeof c.expires == "number") {
        now = new Date();
        now.setTime(now.getTime() + c.expires * 24 * 60 * 60 * 1000);
      } else {
        now = c.expires;
      }
      expires = "; expires=" + now.toUTCString();
    }
    var path = "; path=" + (c.path || "/");
    var domain = c.domain ? "; domain=" + c.domain : "";
    var secure = c.secure ? "; secure=" : "";
    document.cookie = [
      key,
      "=",
      encodeURIComponent(val),
      expires,
      path,
      domain,
      secure,
    ].join("");
  }

  function getXPath(element) {
    const idx = (sib, name) =>
      sib
        ? idx(sib.previousElementSibling, name || sib.localName) +
          (sib.localName == name)
        : 1;
    const segs = (elm) =>
      !elm || elm.nodeType !== 1
        ? [""]
        : elm.id && document.getElementById(elm.id) === elm
        ? [`id("${elm.id}")`]
        : [
            ...segs(elm.parentNode),
            `${elm.localName.toLowerCase()}[${idx(elm)}]`,
          ];
    return segs(element).join("/");
  }

  function get2LevelDomain() {
    try {
      let curDomain = window.location.hostname.split(".").slice(-2).join(".");
      console.log("current domain: ", curDomain)
      return curDomain;
    } catch (error) {
      console.error("Failed to get2LevelDomain,", error);
      return "";
    }
  }
})();
