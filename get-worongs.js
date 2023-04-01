// ==UserScript==
// @name         网上练兵错题集题目获取
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://59.63.212.72:9117/html/training/rush-analysis.html?i=*&source=rush
// @icon         https://www.google.com/s2/favicons?sz=64&domain=212.72
// @grant        unsafeWindow
// @require      https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js
// @resource titleBank file:///C://Users/Administrator/Downloads/temp.txt
// @grant        GM_getResourceText
// @run-at       document-end
// ==/UserScript==

/*工作流程：1.调用 checkDataInit函数检查页面数据是否初始化完毕，如果未完毕则等待1s之后再次检查，若完毕则进行第二步
           2.调用 beforeGetData函数获取错题集中错题的总数
           3.调用 getData函数获取题目与答案信息并插入题目集中
           4.调用 afterGETdata函数检差是否已扫描完错题集，如果完成则停止收录题目，如果未完成则点击下一题按钮并调用getData函数继续收录题目
*/
(function () {
  "use strict";
  // 获取本地题库
  const titleStr = GM_getResourceText("titleBank");
  console.log(titleStr);
  const localMap = new Map(JSON.parse(titleStr));
  console.log(titleMap);

  var titleSum, title, answer;
  var nextBtn;
  var titleMap = localMap();
  var judge = false;

  // 用于检查页面中的数据是否已经初始化完毕
  // 检测vue对页面数据的替换是否完毕
  function checkDataInit() {
    let mySeek = setInterval(() => {
      let temp = $("div .answer").children("span").text().substring(3);
      console.log(temp);
      if (temp.length < 10 && temp.length > 0) {
        console.log("成功获取答案");
        clearInterval(mySeek);
        judge = true;
        beforeGetData();
        getData();
        afterGETdata();
      }
    }, 1000);
  }

  // 页面数据初始化完毕之后的前置准备
  // 获取错题集中题目的总数
  function beforeGetData() {
    if (titleSum != undefined) return;
    if (judge) {
      var temp = $("h2.title").children().eq(1).text();
      titleSum = parseInt(temp.split("/")[1]);
      console.log("题目总数为：" + titleSum);
      nextBtn = $("div.change-ques.clearfix").find(".fr");
      console.log(nextBtn);
    }
  }

  // 获取页面中的题目与答案信息
  function getData() {
    if (judge) {
      title = $("div .ques-title.fl").text().split(".")[1];

      //去除题干中所有的非汉字字符方便后续题目比对
      var regEx = /[^\u4e00-\u9fa5\uf900-\ufa2d]/g;
      title=title.replace(regEx, ''); //去除题干中的非汉字字符
      console.log("题目名：" + title);

      //获取答案的正确选项
      console.log("-----------")
      let str = $("div .answer").children("span").text().substring(3);
      console.log("题目选项："+str)
      //用于处理由于平台故障导致的只有题目没有答案的情况
      if(str=="undefined"){
        // (async function() {
        //     console.log('Do some thing, ' + new Date());
        //     $("div.remove-ques.fr").trigger('click')
        //     await sleep(10000);
        //     console.log('Do other things, ' + new Date());
        //   })();
        return
      }

    //   将abc转化为选项的序号
      answer=new Array()
      var liArray=$("ul.rush-left-subject-list").find("li")//包含所有选项的数组
      for (let i=0;i<str.length;i++) {
        console.log(str.charCodeAt(i) - 65);
        let temp=liArray.eq(str.charCodeAt(i) - 65).find("span").text().substring(2)
        if(temp=="对")temp="正确"
        if(temp=="错")temp="错误"
        console.log(temp)
        answer.push(temp);
      }
      console.log("答案序列是：" + answer);

      // 如果本地题库中存在此题目，则跳过此题，不加入题库中
      if(titleMap.get(title)==answer){
        return;
      }
      else{
        titleMap.set(title, answer);
      }
      
    }
  }

  //获取了本条题目数据之后的操作
  //题库未收录完毕则点击下一题按钮之后调用getData继续收录题库
  //收录完毕则停止扫描题库
  function afterGETdata() {
    var tempSum = titleSum;
    //var tempSum =10
    while (tempSum--) {
        console.log("******"+(tempSum+1)+"*****")
        nextBtn.trigger("click");
        getData();
    }
    if (tempSum <= 0) {
      console.log(titleMap);
      let mySerialMap = JSON.stringify(Array.from(titleMap.entries()));
      console.log(mySerialMap);
      let myMap = new Map(JSON.parse(mySerialMap));
      console.log(myMap);

      let downLink = document.createElement("a");
      //downLink.download = $("h2.rush-name").text()+".txt";
      downLink.download = "temp.txt";
      //字符内容转换为blod地址
      let blob = new Blob([mySerialMap]);
      downLink.href = URL.createObjectURL(blob);
      // 链接插入到页面
      document.body.appendChild(downLink);
      downLink.click();
      // 移除下载链接
      document.body.removeChild(downLink);
    }
  }

  $(document).ready(function () {
    nextBtn = $("span fr");
    console.log(nextBtn);
    checkDataInit();
  });
})();
