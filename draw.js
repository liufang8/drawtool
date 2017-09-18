// 使用自动执行函数减少全局变量的污染

//  减少事件的绑定
(function() {
  var cvs,
      ctx,
      text, // 输入框
      r,
      isMove = false,
      isFrist = true,
      isDraw = false, // 是否开始画,
      operationType,  // 操作类型
      savePoint ,   //保存点，用户恢复
      textContent = '', // 文本内容
      graphs = [],  // 所画的图形
      isSelectedGraph, // 选择的图形
      startPoint = {};
  document.addEventListener('DOMContentLoaded', init, false);

  function init() {
    // dom 加载完后，才能获取元素
    cvs = document.querySelector('canvas');
    ctx = cvs.getContext('2d');
    text = document.querySelector('#text');
    setCanvasSize();
    bindEvent();
  }

  // 设置canvas大小
  function setCanvasSize() {
    cvs.width = document.body.clientWidth * 0.80;
    cvs.height = document.body.clientHeight * 0.93;
  }

  function bindEvent() {
    var tools = document.querySelector('.tool-bar');

    tools.addEventListener('click', doOperation, false);
    text.addEventListener('input', TextInputEvent, false);
    text.addEventListener('change', TextChangeEvent, false);
    cvs.addEventListener('click', clickEvent, false);
    cvs.addEventListener('mousedown', eventDown, false);
    cvs.addEventListener('mousemove', eventMove, false);
    cvs.addEventListener('mouseup',  eventUp, false);
  }

  function doOperation() {
    var ele = event.target,
        toolType;
    _addSelectedStyle();
    _addSelectedEvent();

    // 内部函数命名使用"_"

    function _addSelectedStyle() {
      _addToolStyle();
      _addCanvasCursor();
    }

    function _addToolStyle() {
      var images = document.querySelectorAll('.tool-bar img');
      for (var i = 0; i < images.length; i++) {
        images[i].classList.remove('selected');
      }
      ele.classList.add('selected');
    }

    function _addCanvasCursor() {
      if(ele.tag = "IMG") {
        toolType = ele.className.split(" ")[0];
        switch(toolType) {
            case 'move':
              cvs.style.cursor = 'move';
              break;
            case 'fill':
              cvs.style.cursor = 'default';
              break;
            case 'text':
              cvs.style.cursor = 'text';
              break;
            case 'clear':
              cvs.style.cursor = "url(rect.cur), auto";
              break;
            default:
              cvs.style.cursor = 'crosshair';
              break;
          }
      }
    }
    function _addSelectedEvent() {
      if(ele.tag = "IMG") {
        toolType = ele.className.split(" ")[0];
        operationType = toolType;
      }
    }
   }

   function eventDown() {
     var e = event || window.event;
     if(operationType === 'circle' || operationType === 'rect' || operationType === 'line') {
      savePoint = ctx.getImageData(0, 0, cvs.width, cvs.height);
     }
     if(operationType === 'move') {
        ctx.save();
        for (var i = 0; i < graphs.length; i++) {
          draw(graphs[i]);
          if(ctx.isPointInPath(e.offsetX, e.offsetY)) {
            isSelectedGraph = (graphs.splice(i,1))[0];
            break;
          }
        }
     }
     if(operationType !== "text") {
       isDraw = true;
       startPoint.x = event.offsetX;
       startPoint.y = event.offsetY;
       ctx.clearRect(0, 0, cvs.width, cvs.height); //
       doDraws(); // 重新画
       savePoint = ctx.getImageData(0, 0, cvs.width, cvs.height);
     }
   }

   function eventMove() {
      switch(operationType) {
        case 'move':
          moveEventMove();
          break;
        case 'circle':
          circleEventMove();
          break;
        case 'rect':
          rectEventMove();
          break;
        case 'line':
          lineEventMove();
          break;
        case 'curve':
          curveEventMove();
          break;
        case 'clear':
          clearEventMove();
          break;
        default:
          break;
      }
   }

   function eventUp() {
    switch(operationType) {
      case 'move':
        moveEventUp();
        break;
      case 'circle':
        circleEventUp();
        break;
      case 'rect':
        rectEventUp();
        break;
      case 'line':
        lineEventUp();
        break;
      case 'curve':
        curveEventUp();
        break;
      case 'clear':
        clearEventUp();
        break;
      default:
        break;
    }
   }

function clickEvent() {
  switch(operationType) {
    case 'fill':
      fillEvent();
      break;
    case 'text':
      textEvent();
      break;
    default:
      break;
  }
}

  // fill
  function fillEvent() {
    var box = windowToCanvasPoint(event);
    doDraws(function() {
      if(ctx.isPointInPath(box.x, box.y)) {
        ctx.fillStyle = 'red';
        ctx.fill();
      }
    });
  }

  // text
  function textEvent() {
    var e = event || window.event;
    startPoint.x = e.offsetX;
    startPoint.y = e.offsetY;
    startPoint.sx = e.offsetX;
    startPoint.sy = e.offsetY;

    // ctx.fillStyle = 'green';
    // ctx.font = (FONTSITE + 2) + 'px Microsoft YaHei';

    text.style.top = e.offsetY + 'px';
    text.style.left = e.offsetX + 'px';
    text.style.display = 'inline-block';
    text.focus();
    text.value = '';
  }

  function TextInputEvent() {
    var e = event || window.event,
        v = text.value.substr(-1, 1), //取最后一个字母
        w = parseInt(ctx.measureText(v).width + 1); //字符间距大些
    textContent += v;
    ctx.fillText(v, startPoint.x - 1, startPoint.y + 13);
    startPoint.x += w ;
    // 判断显示的值和输入的值是否相等
    if(text.value !== textContent) {
      // 清空文字
      ctx.clearRect(startPoint.sx-1, startPoint.sy, ctx.measureText(textContent).width + 3, 16);

      //重新写文字
      textContent = text.value;
      ctx.fillText(text.value, startPoint.sx - 1, startPoint.sy + 13);
      text.style.left = startPoint.sx + parseInt(ctx.measureText(text.value).width) + 1 + 'px';
      startPoint.x = startPoint.sx + parseInt(ctx.measureText(text.value).width);

    } else {
      text.style.left = parseInt(text.style.left) + w + 'px';
    }
  }

  function TextChangeEvent() {
    
  }

  // move
  function moveEventMove() {
    var e = event || window.event;
    if(isDraw) {
      ctx.putImageData(savePoint, 0, 0);
      if(isSelectedGraph) {
        isSelectedGraph.x = e.offsetX;
        isSelectedGraph.y = e.offsetY;
        draw(isSelectedGraph);
      }
    }
  }

  function moveEventUp() {
    isDraw = false;
    graphs.push(isSelectedGraph);
    setStartPointEmpty();
    isSelectedGraph = undefined;
  }

  // circle
  function circleEventMove() {
    if(isDraw) {
      ctx.putImageData(savePoint, 0, 0);
      r = Math.hypot(event.offsetX - startPoint.x, event.offsetY - startPoint.y); // 平方根的和
      draw({type: 'arc', x: startPoint.x, y: startPoint.y, r: Math.round(r)});
    }
  }

  function circleEventUp() {
    isDraw = false;
    graphs.push({type: 'arc', x: startPoint.x, y: startPoint.y, r: r});
    setStartPointEmpty();
    r = undefined;
  }

  // 画矩形
  function rectEventMove() {
    if(isDraw) {
      ctx.putImageData(savePoint, 0, 0);
      draw({type: 'rect', x: startPoint.x, y: startPoint.y, w: Math.abs(startPoint.x -event.offsetX), h: Math.abs(startPoint.y - event.offsetY)});
    }
  }

  function rectEventUp() {
    isDraw = false;
    graphs.push({type: 'rect', x: startPoint.x, y: startPoint.y, w: Math.abs(startPoint.x -event.offsetX), h: Math.abs(startPoint.y - event.offsetY)});
    setStartPointEmpty();
  }

  // 画直线
  function lineEventMove() {
    if(isDraw) {
      ctx.putImageData(savePoint, 0, 0);
      draw({type: 'line', x: startPoint.x, y: startPoint.y, x1: event.offsetX, y1: event.offsetY});
    }
  }

  function lineEventUp() {
    isDraw = false;
    setStartPointEmpty();
  }

  // 画曲线
  function curveEventMove() {
    if(isDraw) {
      draw({type: 'line', x: startPoint.x, y: startPoint.y, x1: event.offsetX, y1: event.offsetY});
      startPoint.x = event.offsetX;
      startPoint.y = event.offsetY;
    }
  }

  function curveEventUp() {
    isDraw = false;
    setStartPointEmpty();
  }


  // 删除
  function clearEventMove() {
    if(isDraw) {
      ctx.clearRect(startPoint.x +1, startPoint.y + 3, 28, 26);
      startPoint.x = event.offsetX;
      startPoint.y = event.offsetY;
    }
  }

  function clearEventUp() {
    isDraw = false;
    setStartPointEmpty();
  }

  function doDraws(bc) {
    for (var i = 0; i < graphs.length; i++) {
      draw(graphs[i]);
      bc && bc();
    }
  }


  // 执行画的具体操作
  function draw(graph) {
    switch(graph.type) {
      case 'arc':
        _drawCircle(graph);
        break;
      case 'rect':
        _drawRect(graph);
        break;
      case 'line':
        _drawLine(graph);
        break;
      default:
        break;
    }

    function _drawCircle(graph) {
      ctx.beginPath();
      ctx.strokeStyle = '#FF0000';
      ctx.arc(graph.x, graph.y, graph.r, 0, 2 * Math.PI, false);
      ctx.closePath();
      ctx.stroke();
    }

    function _drawRect(graph) {
      ctx.beginPath();
      ctx.strokeStyle = '#FF0000';
      ctx.closePath();
      ctx.rect(graph.x, graph.y, graph.w, graph.h);
      ctx.stroke();
    }

    function _drawLine(graph) {
      ctx.beginPath();
      ctx.strokeStyle = graph.color || '#FF0000';
      ctx.moveTo(graph.x, graph.y);
      ctx.lineTo(graph.x1, graph.y1);
      ctx.stroke();
    }
  }

  // 设置起始点为新的位置
  function setStartPoint(endPoint) {
    startPoint.x = endPoint.offsetX;
    startPoint.y = endPoint.offsetY;
  }
   // 设置起始点为空
  function setStartPointEmpty() {
    startPoint.x = undefined;
    startPoint.y = undefined;
  }

  // 相对于窗口的坐标转化为相对canvas的坐标
  function windowToCanvasPoint(event) {
    //getBoundingClientRect 方法获取dom对象的位置对象（left,top, bottom, right,width, height）
    //canvas.widht属性只是内容的宽度，如果canvas有border和padding样式，位置对象和canvas的width就会不同
    var box = cvs.getBoundingClientRect();
    return {x: event.x - box.left*(cvs.width/box.width), y: event.y - box.top* (cvs.height/box.height)};
  }

}())

// 完善text
// 全局变量的优化
