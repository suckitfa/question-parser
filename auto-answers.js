// ==UserScript==
// @name         网上练兵自动答题
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://59.63.212.72:9117/html/training/training.html?id=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=212.72
// @grant        unsafeWindow
// @require      https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js
// @resource titleBank file:///C://Users/Administrator/Downloads/temp.txt
// @grant        GM_getResourceText
// @run-at       document-end
// ==/UserScript==

/*工作流程：1.调用 checkDataInit函数检查页面数据是否初始化完毕，如果未完毕则等待1s之后再次检查，若完毕则进行第二步
           2.调用 getData函数获取页面中显示的题目和答案选项
           3.调用 autoAnswer函数对比题目集自动获取答案并完成选中，其中调用creatChoiceArray函数判断得出应该选择的答案序列数组
           4.调用 afterAutoAnswer函数判断答题是否已完成，如果完成则点击再次挑战，否则点击下一题
           4.调用 updateData函数此函数用于答题未完成点击下一题之后的数据刷新，即或许新的题目与选项
*/

(function () {
  "use strict";
  // 获取本地题库
  const titleStr = GM_getResourceText("titleBank");
  console.log(titleStr);
  // 转为map对象
  const titleMap = new Map(JSON.parse(titleStr));
  console.log(titleMap);

  var title, choiceList, nextBtn;
  var sum = 1;

  var testSum = 0 //尝试获取题目信息的次数

  //   此正则表达式用去去除所有的非汉字字符
  //   用于将获取的题目信息中的非汉字字符去除，方便与题库中的题目比对
  const regEx = /[^\u4e00-\u9fa5\uf900-\ufa2d]/g;

  // 用于检查页面中的数据是否已经初始化完毕
  // 判断vue对页面中的数据替换是否完成
  function checkDataInit() {
    let mySeek = setInterval(() => {
      let temp = $("h3.title.fB").text();
      console.log(temp);
      if (temp.length > 0) {
        console.log("成功获取题目");
        clearInterval(mySeek);
        getData();
        autoAnswer();
      }
      else {
        testSum++
        if (testSum >= 20) {
          testSum = 0
          clearInterval(mySeek);
          location.reload()
        }
      }
    }, 1000);
  }

  //获取题目内容
  // 获取选项列表
  function getData() {
    title = $("h3.title.fB").text();
    title = title.replace(regEx, "");
    console.log("成功获取题目信息：" + title);
    choiceList = $("ul.exam-right-subject-list").find("li");
    console.log("成功获取选择列表：");
    console.log(choiceList);
  }

  //答案无法加载的题目点击退出闯关
  function checkTitle(title){
    if(title=="正确的第三视图是"){
      //点击退出闯关按钮
      $("ul.clearfix").find("li.fr").trigger("click")
      //检测结算页面的出现并准备再次闯关
      afterAutoAnswer()
    }
  }

  //   在点击下一题之后用来刷新题目与选项信息
  function updateData() {
    let mySeek = setInterval(() => {
      let temp = $("h3.title.fB").text();
      console.log("***************" + sum + "**************");
      sum++;

      //1.如果页面题目信息已经更新完毕，则获取最新题目与选项并自动答题
      //2.如果页面题目信息未更新完毕，则继续等待1s
      if (title == temp) {
        //1.更新题目与选项信息
        //console.log("成功获取题目");
        clearInterval(mySeek);
        title = title.replace(regEx, "");
        console.log("成功刷新题目信息：" + title);
        choiceList = $("ul.exam-right-subject-list").find("li");
        //2.对题目的有效性进行检测
        checkTitle(title)
        //3.进行下一次答题
        autoAnswer();

      } else {
        //获取了最新显示的题目信息，即temp！=“”
        if (temp.length > 0) {
          title = temp;
        } else {
          var str = $("div.title.posr").eq(0).find("h2").text();
          console.log(str);
          if (str.length > 1) {
            clearInterval(mySeek);
            console.log("本轮答题结束,开始下一轮答题");
            $("ul.clearfix.rush-result-btns").find("li").eq(1).trigger("click");
          }
          else {
            testSum++
            if (testSum >= 20) {
              testSum = 0
              clearInterval(mySeek);
              location.reload()
            }

          }
        }
      }
    }, 1000);
  }

  //   根据答案的文字确定选中的li的index
  function creatChoiceArray(answer) {
    var indexArray = new Array();
    console.log("从题库中获取的答案：" + answer);
    if (answer != undefined) {
      console.log("answer=" + answer);
      console.log("符合转换条件");
      console.log("answer.length=" + answer.length);

      //构建选项的答案数据
      let tempArray = new Array();
      for (let i = 0; i < choiceList.length; i++) {
        tempArray.push(choiceList.eq(i).find("span").text());
      }
      console.log("当前题目的选项有:" + tempArray);
      //找出与答案对应的选项的序列号
      for (let i = 0; i < answer.length; i++) {
        for (let j = 0; j < tempArray.length; j++) {
          if (tempArray[j] == answer[i]) {
            //判断选项与题库中的答案是否相等
            indexArray.push(j);
          } else if (tempArray[j].length > answer[i].length) {
            //选项与题库中的答案不相等时，判断选项与题库中获取的所有答案组成的字符串是否相等
            let temp;
            for (let k = 0; k < answer.length; k++) {
              temp = temp + answer[k] + "、";
            }
            temp -= "、";
            if (tempArray[j] == temp) {
              indexArray.push(j);
              i = answer.length;
            }
          }
        }
      }
    } else {
      //题库中找不到答案时，即默认选中第一个选项
      console.log("answer=undefined");
      indexArray.push(0);
    }
    if (indexArray.length < 1) indexArray.push(0);
    return indexArray;
  }

  // 根据题目信息从题库中获取答案并自动选中题目
  function autoAnswer() {
    //检测答题未完毕则继续答题
    //1.从题库中获取答案
    let answer = titleMap.get(title);
    let cArray = creatChoiceArray(answer);
    console.log("答案的序列号：" + cArray);
    //2.选中答案
    for (let i = 0; i < cArray.length; i++) {
      console.log("选中的序列号：" + cArray[i]);
      choiceList.eq(cArray[i]).trigger("click");
    }

    //3.调用检测是否答题完毕的函数
    afterAutoAnswer();
  }

  //判断是否本轮答题是否已经完毕
  //如果完毕则开始下一轮答题
  function afterAutoAnswer() {
    var str = $("div.title.posr").eq(0).find("h2").text();
    console.log(str);
    console.log("str.length=" + str.length);
    if (str.length <= 1) {
      nextBtn.trigger("click");
      console.log("本轮答题还未结束");
      updateData();
      return;
    } else {
      console.log("本轮答题结束,开始下一轮答题");
      $("ul.clearfix.rush-result-btns").find("li").eq(1).trigger("click");
    }
  }

  $(document).ready(function () {
    nextBtn = $("div.exam-right-down.mt20").find("div.button");
    console.log(nextBtn);
    checkDataInit();
  });
})();
