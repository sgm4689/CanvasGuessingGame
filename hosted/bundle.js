"use strict";

var token;
var socket;
var canDraw;
var username; // GLOBALS

var canvas,
    ctx,
    dragging = false,
    lineWidth,
    strokeStyle; // CONSTANTS

var DEFAULT_LINE_WIDTH = 3;
var DEFAULT_STROKE_STYLE = "black";
var DEFAULT_FILL_STYLE = "blue";
var TOOL_PENCIL = "toolPencil";
var TOOL_RECTANGLE = "toolRectangle";
var TOOL_CIRCLE = "toolCircle";
var TOOL_LINE = "toolLine";
var currentTool;
var fillStyle;
var origin; //canvases for drawing & displaying

var topCanvas;
var topCtx;
var word;

var setup2 = function setup2() {
  socket = io.connect('http://localhost:3000');
  socket.on('mouseDown', function (data) {
    currentTool = data.currentTool;
    MouseDown(data.e, data.mouse);
  });
  socket.on('clear', clear);
  socket.on('mouse', redraw);
  socket.on('mouseOut', MouseOut);
  socket.on('lineWidth', LineWidthChange);
  socket.on('strokeStyle', StrokeStyleChange);
  socket.on('mouseUp', function (data) {
    MouseUp(data.e, data);
  });
  socket.on('refresh', getInfo);
  getInfo();
};

var redraw = function redraw(data) {
  Draw(data.tool, data.mouse);
};

var getToken2 = function getToken2() {
  sendAjax('GET', '/getToken', null, function (result) {
    token = result.csrfToken;
    setup2();
  });
};

var getInfo = function getInfo() {
  sendAjax('GET', '/word', null, function (result) {
    word = result.Word;
    username = result.Username;
    if (result.Drawer === username) canDraw = true;else canDraw = false;
    console.log(result.Drawer + " " + username);
    createCanvasWindow();
    init();
  });
};

var checkWord = function checkWord(e) {
  e.preventDefault();
  sendAjax('POST', '/word', "word=".concat(msg.value, "&_csrf=").concat(token), function (result) {
    if (result.Correct) {
      socket.emit('refresh', {}); //tell all other players someone guessed the answer
    }
  });
};

var DrawingWindow = function DrawingWindow() {
  return (/*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("canvas", {
      id: "mainCanvas",
      width: 700,
      height: 500
    }), /*#__PURE__*/React.createElement("canvas", {
      id: "topCanvas",
      width: 700,
      height: 500
    }))
  );
};

var DisplayWindow = function DisplayWindow() {
  return (/*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("canvas", {
      id: "mainCanvas",
      width: 700,
      height: 500
    }), /*#__PURE__*/React.createElement("canvas", {
      id: "topCanvas",
      width: 700,
      height: 500,
      hidden: true
    }))
  );
};

var CanvasWindow = function CanvasWindow(props) {
  if (props.drawer) return (/*#__PURE__*/React.createElement(DrawingWindow, null)
  );else {
    return (/*#__PURE__*/React.createElement(DisplayWindow, null)
    );
  }
};

var ControlWindow = function ControlWindow(props) {
  if (props.flag) return (/*#__PURE__*/React.createElement(HasControls, null)
  );else {
    return (/*#__PURE__*/React.createElement(HideControls, null)
    );
  }
};

var HasControls = function HasControls() {
  return (/*#__PURE__*/React.createElement("div", {
      id: "controls"
    }, /*#__PURE__*/React.createElement("label", null, "Tool:", /*#__PURE__*/React.createElement("select", {
      id: "toolChooser"
    }, /*#__PURE__*/React.createElement("option", {
      value: "toolPencil"
    }, "Pencil"), /*#__PURE__*/React.createElement("option", {
      value: "toolRectangle"
    }, "Rectangle"), /*#__PURE__*/React.createElement("option", {
      value: "toolCircle"
    }, "Circle"), /*#__PURE__*/React.createElement("option", {
      value: "toolLine"
    }, "Line"))), /*#__PURE__*/React.createElement("label", null, "Line Width:", /*#__PURE__*/React.createElement("select", {
      id: "lineWidthChooser",
      defaultValue: "3"
    }, /*#__PURE__*/React.createElement("option", {
      value: "1"
    }, "1"), /*#__PURE__*/React.createElement("option", {
      value: "2"
    }, "2"), /*#__PURE__*/React.createElement("option", {
      value: "3"
    }, "3"), /*#__PURE__*/React.createElement("option", {
      value: "4"
    }, "4"), /*#__PURE__*/React.createElement("option", {
      value: "5"
    }, "5"), /*#__PURE__*/React.createElement("option", {
      value: "6"
    }, "6"), /*#__PURE__*/React.createElement("option", {
      value: "7"
    }, "7"), /*#__PURE__*/React.createElement("option", {
      value: "8"
    }, "8"), /*#__PURE__*/React.createElement("option", {
      value: "9"
    }, "9"), /*#__PURE__*/React.createElement("option", {
      value: "10"
    }, "10"))), /*#__PURE__*/React.createElement("label", null, "Line Style", /*#__PURE__*/React.createElement("select", {
      id: "strokeStyleChooser",
      defaultValue: "black"
    }, /*#__PURE__*/React.createElement("option", {
      value: "red"
    }, "red"), /*#__PURE__*/React.createElement("option", {
      value: "green"
    }, "green"), /*#__PURE__*/React.createElement("option", {
      value: "blue"
    }, "blue"), /*#__PURE__*/React.createElement("option", {
      value: "orange"
    }, "orange"), /*#__PURE__*/React.createElement("option", {
      value: "yellow"
    }, "yellow"), /*#__PURE__*/React.createElement("option", {
      value: "purple"
    }, "purple"), /*#__PURE__*/React.createElement("option", {
      value: "pink"
    }, "pink"), /*#__PURE__*/React.createElement("option", {
      value: "black"
    }, "black"), /*#__PURE__*/React.createElement("option", {
      value: "brown"
    }, "brown"), /*#__PURE__*/React.createElement("option", {
      value: "gray"
    }, "gray"), /*#__PURE__*/React.createElement("option", {
      value: "white"
    }, "white"))), /*#__PURE__*/React.createElement("label", null, "fill Style", /*#__PURE__*/React.createElement("select", {
      id: "fillStyleChooser",
      defaultValue: "blue"
    }, /*#__PURE__*/React.createElement("option", {
      value: "red"
    }, "red"), /*#__PURE__*/React.createElement("option", {
      value: "green"
    }, "green"), /*#__PURE__*/React.createElement("option", {
      value: "blue"
    }, "blue"), /*#__PURE__*/React.createElement("option", {
      value: "orange"
    }, "orange"), /*#__PURE__*/React.createElement("option", {
      value: "yellow"
    }, "yellow"), /*#__PURE__*/React.createElement("option", {
      value: "purple"
    }, "purple"), /*#__PURE__*/React.createElement("option", {
      value: "pink"
    }, "pink"), /*#__PURE__*/React.createElement("option", {
      value: "black"
    }, "black"), /*#__PURE__*/React.createElement("option", {
      value: "brown"
    }, "brown"), /*#__PURE__*/React.createElement("option", {
      value: "gray"
    }, "gray"), /*#__PURE__*/React.createElement("option", {
      value: "white"
    }, "white"))), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("input", {
      id: "clearButton",
      type: "button",
      value: "Clear"
    })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("input", {
      id: "exportButton",
      type: "button",
      value: "Export"
    })))
  );
};

var HideControls = function HideControls() {
  return (/*#__PURE__*/React.createElement("div", {
      id: "controls",
      hidden: true
    }, /*#__PURE__*/React.createElement("label", null, "Tool:", /*#__PURE__*/React.createElement("select", {
      id: "toolChooser"
    }, /*#__PURE__*/React.createElement("option", {
      value: "toolPencil"
    }, "Pencil"), /*#__PURE__*/React.createElement("option", {
      value: "toolRectangle"
    }, "Rectangle"), /*#__PURE__*/React.createElement("option", {
      value: "toolCircle"
    }, "Circle"), /*#__PURE__*/React.createElement("option", {
      value: "toolLine"
    }, "Line"))), /*#__PURE__*/React.createElement("label", null, "Line Width:", /*#__PURE__*/React.createElement("select", {
      id: "lineWidthChooser",
      defaultValue: "3"
    }, /*#__PURE__*/React.createElement("option", {
      value: "1"
    }, "1"), /*#__PURE__*/React.createElement("option", {
      value: "2"
    }, "2"), /*#__PURE__*/React.createElement("option", {
      value: "3"
    }, "3"), /*#__PURE__*/React.createElement("option", {
      value: "4"
    }, "4"), /*#__PURE__*/React.createElement("option", {
      value: "5"
    }, "5"), /*#__PURE__*/React.createElement("option", {
      value: "6"
    }, "6"), /*#__PURE__*/React.createElement("option", {
      value: "7"
    }, "7"), /*#__PURE__*/React.createElement("option", {
      value: "8"
    }, "8"), /*#__PURE__*/React.createElement("option", {
      value: "9"
    }, "9"), /*#__PURE__*/React.createElement("option", {
      value: "10"
    }, "10"))), /*#__PURE__*/React.createElement("label", null, "Line Style", /*#__PURE__*/React.createElement("select", {
      id: "strokeStyleChooser",
      defaultValue: "black"
    }, /*#__PURE__*/React.createElement("option", {
      value: "red"
    }, "red"), /*#__PURE__*/React.createElement("option", {
      value: "green"
    }, "green"), /*#__PURE__*/React.createElement("option", {
      value: "blue"
    }, "blue"), /*#__PURE__*/React.createElement("option", {
      value: "orange"
    }, "orange"), /*#__PURE__*/React.createElement("option", {
      value: "yellow"
    }, "yellow"), /*#__PURE__*/React.createElement("option", {
      value: "purple"
    }, "purple"), /*#__PURE__*/React.createElement("option", {
      value: "pink"
    }, "pink"), /*#__PURE__*/React.createElement("option", {
      value: "black"
    }, "black"), /*#__PURE__*/React.createElement("option", {
      value: "brown"
    }, "brown"), /*#__PURE__*/React.createElement("option", {
      value: "gray"
    }, "gray"), /*#__PURE__*/React.createElement("option", {
      value: "white"
    }, "white"))), /*#__PURE__*/React.createElement("label", null, "fill Style", /*#__PURE__*/React.createElement("select", {
      id: "fillStyleChooser",
      defaultValue: "blue"
    }, /*#__PURE__*/React.createElement("option", {
      value: "red"
    }, "red"), /*#__PURE__*/React.createElement("option", {
      value: "green"
    }, "green"), /*#__PURE__*/React.createElement("option", {
      value: "blue"
    }, "blue"), /*#__PURE__*/React.createElement("option", {
      value: "orange"
    }, "orange"), /*#__PURE__*/React.createElement("option", {
      value: "yellow"
    }, "yellow"), /*#__PURE__*/React.createElement("option", {
      value: "purple"
    }, "purple"), /*#__PURE__*/React.createElement("option", {
      value: "pink"
    }, "pink"), /*#__PURE__*/React.createElement("option", {
      value: "black"
    }, "black"), /*#__PURE__*/React.createElement("option", {
      value: "brown"
    }, "brown"), /*#__PURE__*/React.createElement("option", {
      value: "gray"
    }, "gray"), /*#__PURE__*/React.createElement("option", {
      value: "white"
    }, "white"))), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("input", {
      id: "clearButton",
      type: "button",
      value: "Clear"
    })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("input", {
      id: "exportButton",
      type: "button",
      value: "Export"
    })))
  );
};

var FormWindow = function FormWindow() {
  return (/*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("ul", {
      id: "messages"
    }, word), /*#__PURE__*/React.createElement("form", {
      id: "answers",
      onSubmit: checkWord,
      name: "answerForm",
      className: "answerForm"
    }, /*#__PURE__*/React.createElement("input", {
      id: "msg"
    }), /*#__PURE__*/React.createElement("input", {
      id: "submitAnswer",
      type: "submit",
      value: "Enter"
    })))
  );
};

var createCanvasWindow = function createCanvasWindow() {
  ReactDOM.render( /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(CanvasWindow, {
    drawer: canDraw
  }), /*#__PURE__*/React.createElement(ControlWindow, {
    flag: canDraw
  }), /*#__PURE__*/React.createElement(FormWindow, null)), document.querySelector("#content"));
}; // Every action needs 2 functions.  1 event function that contains the actual code
//Plus a 2nd wrapper function that sends a socket message and then calls the first function
//Without this when other browsers recieved information from socket they'd call the drawing method
//which would then recursively send out a new socket message, breaking everything


var init = function init() {
  // initialize some globals
  canvas = document.querySelector("#mainCanvas");
  ctx = canvas.getContext('2d');
  fillStyle = DEFAULT_FILL_STYLE;
  currentTool = TOOL_PENCIL;
  origin = {}; // empty object

  lineWidth = DEFAULT_LINE_WIDTH;
  strokeStyle = DEFAULT_STROKE_STYLE;
  topCanvas = document.querySelector("#topCanvas");
  topCtx = topCanvas.getContext('2d'); // set initial properties of the graphics context

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.lineCap = "round"; // set initial properties of both graphics contexts

  topCtx.lineWidth = ctx.lineWidth = lineWidth;
  topCtx.strokeStyle = ctx.strokeStyle = strokeStyle;
  topCtx.fillStyle = ctx.fillStyle = fillStyle;
  topCtx.lineCap = ctx.lineCap = "round";
  topCtx.lineJoin = ctx.lineJoin = "round";
  topCtx.globalAlpha = 0.3; // "butt", "round", "square" (default "butt")

  ctx.lineJoin = "round"; // "round", "bevel", "miter" (default “miter")

  drawGrid(ctx, 'lightgray', 10, 10);
  topCanvas.onmousedown = doMousedown;
  topCanvas.onmousemove = doMousemove;
  topCanvas.onmouseup = doMouseup;
  topCanvas.onmouseout = doMouseout;
  document.querySelector('#lineWidthChooser').onchange = doLineWidthChange;
  document.querySelector('#strokeStyleChooser').onchange = doStrokeStyleChange;
  document.querySelector('#clearButton').onmousedown = doClear;
  document.querySelector('#exportButton').onmousedown = doExport;

  document.querySelector('#toolChooser').onchange = function (e) {
    currentTool = e.target.value;
    console.log("currentTool=" + currentTool);
  };

  document.querySelector('#fillStyleChooser').onchange = function (e) {
    fillStyle = e.target.value;
    console.log("currentStyle=" + fillStyle);
  };
};

var MouseDown = function MouseDown(e, mouse) {
  dragging = true;

  switch (currentTool) {
    case TOOL_PENCIL:
      ctx.beginPath();
      ctx.moveTo(mouse.x, mouse.y);
      break;

    case TOOL_RECTANGLE:
    case TOOL_CIRCLE:
    case TOOL_LINE:
      origin.x = mouse.x;
      origin.y = mouse.y;
      break;
  }
};

var doMousedown = function doMousedown(e) {
  var mouse = getMouse(e);
  MouseDown(e, mouse);
  var data = {
    currentTool: currentTool,
    origin: origin,
    mouse: mouse
  };
  socket.emit('mouseDown', data);
};

var Draw = function Draw(currentTool, mouse) {
  switch (currentTool) {
    case TOOL_PENCIL:
      // set ctx.strokeStyle and ctx.lineWidth to correct values
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth; // draw a line to x,y of mouse

      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke(); // stroke the line

      break;

    case TOOL_RECTANGLE:
      /*
      These adjustments keep the rectangle tool working even if the user drags from right to left. Recall that canvas will draw a rectangle left to right with the ctx.fillRect() and ctx.strokeRect() methods
      */
      var x = Math.min(mouse.x, origin.x);
      var y = Math.min(mouse.y, origin.y);
      var w = Math.abs(mouse.x - origin.x);
      var h = Math.abs(mouse.y - origin.y); // fill and stroke the rectangle

      topCtx.strokeStyle = strokeStyle;
      topCtx.fillStyle = fillStyle;
      topCtx.lineWidth = lineWidth; //clear old rectangles

      clearTopCanvas();
      topCtx.fillRect(x, y, w, h);
      topCtx.strokeRect(x, y, w, h);
      break;

    case TOOL_CIRCLE:
      var x = Math.min(origin.x, origin.x);
      var y = Math.min(origin.y, origin.y);
      var r = Math.abs(distance(mouse, origin)); // fill and stroke the rectangle

      topCtx.strokeStyle = strokeStyle;
      topCtx.fillStyle = fillStyle;
      topCtx.lineWidth = lineWidth; //clear old rectangles

      clearTopCanvas();
      topCtx.beginPath();
      topCtx.moveTo(x, y);
      topCtx.arc(x, y, r, 0, Math.PI * 2, false);
      topCtx.closePath();
      topCtx.stroke();
      topCtx.fill();
      break;

    case TOOL_LINE:
      /*
      These adjustments keep the line tool working even if the user drags from right to left.
      */
      var x = origin.x;
      var y = origin.y;
      var w = mouse.x - origin.x;
      var h = mouse.y - origin.y; // fill and stroke the rectangle

      topCtx.strokeStyle = strokeStyle;
      topCtx.lineWidth = lineWidth; //clear old rectangles

      clearTopCanvas();
      topCtx.beginPath();
      topCtx.moveTo(x, y);
      topCtx.lineTo(x + w, y + h);
      topCtx.closePath();
      topCtx.stroke();
      break;
  }
};

var doMousemove = function doMousemove(e) {
  if (!dragging) return; // bail out if the mouse button is not down

  var mouse = getMouse(e); // get location of mouse in canvas coordinates

  Draw(currentTool, mouse, origin);
  var data = {
    mouse: mouse,
    origin: origin,
    tool: currentTool
  };
  socket.emit('mouse', data);
  console.log(data);
};

var MouseUp = function MouseUp(e, data) {
  switch (currentTool) {
    case TOOL_PENCIL:
      ctx.closePath();
      break;

    case TOOL_RECTANGLE:
    case TOOL_CIRCLE:
    case TOOL_LINE:
      if (dragging) {
        topCtx.globalAlpha = 1;
        if (data) Draw(data.currentTool, data.mouse, data.origin);else doMousemove(e);
        ctx.drawImage(topCanvas, 0, 0);
        clearTopCanvas();
        topCtx.globalAlpha = 0.3;
      }

      break;
  }

  dragging = false;
};

var doMouseup = function doMouseup(e) {
  var temp = getMouse(e);
  socket.emit('mouseUp', {
    e: e,
    currentTool: currentTool,
    mouse: temp,
    dragging: dragging,
    origin: origin
  });
  MouseUp(e);
};

var MouseOut = function MouseOut(e) {
  switch (currentTool) {
    case TOOL_PENCIL:
      ctx.closePath();
      break;

    case TOOL_RECTANGLE:
    case TOOL_CIRCLE:
    case TOOL_LINE:
      // cancel the drawing
      clearTopCanvas();
      break;
  }

  dragging = false;
}; // if the user drags out of the canvas


var doMouseout = function doMouseout(e) {
  MouseOut(e);
  socket.emit('mouseOut', {
    e: e
  });
};

var clear = function clear() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawGrid(ctx, 'lightgray', 10, 10);
};

var doClear = function doClear() {
  socket.emit('clear', {
    clear: "clear"
  });
  clear();
};

var doExport = function doExport() {
  // open a new window and load the image in it
  // http://www.w3schools.com/jsref/met_win_open.asp
  var data = canvas.toDataURL();
  sendAjax('POST', "/img", "img=".concat(data, "&_csrf=").concat(token), redirect);
};

var LineWidthChange = function LineWidthChange(value) {
  lineWidth = value;
};

var doLineWidthChange = function doLineWidthChange(e) {
  socket.emit("lineWidth", {
    value: e.target.value
  });
  LineWidthChange(e.target.value);
};

var StrokeStyleChange = function StrokeStyleChange(value) {
  strokeStyle = value;
};

var doStrokeStyleChange = function doStrokeStyleChange(e) {
  socket.emit("strokeStyle", {
    value: e.target.value
  });
  StrokeStyleChange(e.target.value);
};

var distance = function distance(p1, p2) {
  var x = p2.x - p1.x;
  var y = p2.y - p1.y;
  return Math.sqrt(x * x + y * y);
};

var getMouse = function getMouse(e) {
  var mouse = {};
  mouse.x = e.pageX - e.target.offsetLeft;
  mouse.y = e.pageY - e.target.offsetTop;
  return mouse;
};

var drawGrid = function drawGrid(ctx, color, cellWidth, cellHeight) {
  // save the current drawing state as it existed before this function was called
  ctx.save(); // set some drawing state variables

  ctx.strokeStyle = color;
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 0.5;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); // vertical lines all set!

  for (var x = cellWidth + 0.5; x < ctx.canvas.width; x += cellWidth) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ctx.canvas.height);
    ctx.stroke();
  }

  for (var x = cellHeight + 0.5; x < ctx.canvas.height; x += cellHeight) {
    ctx.beginPath();
    ctx.moveTo(0, x);
    ctx.lineTo(ctx.canvas.width, x);
    ctx.stroke();
  } // restore the drawing state


  ctx.restore();
};

var clearTopCanvas = function clearTopCanvas() {
  topCtx.clearRect(0, 0, topCtx.canvas.width, topCtx.canvas.height);
};

$(document).ready(function () {
  getToken2();
});
"use strict";

var token, imageURLS, fixedURI;

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    token = result.csrfToken;
    getImages(token);
  });
};

var handleConnect = function handleConnect(e) {
  e.preventDefault();
  sendAjax('POST', '/connect', "id=".concat(msg.value, "&_csrf=").concat(token), redirect);
};

var ConnectWindow = function ConnectWindow() {
  return (/*#__PURE__*/React.createElement("form", {
      id: "connectForm",
      onSubmit: handleConnect,
      name: "connectForm",
      className: "connectForm"
    }, /*#__PURE__*/React.createElement("input", {
      id: "msg"
    }), /*#__PURE__*/React.createElement("input", {
      id: "connect",
      type: "submit",
      value: "Enter"
    }))
  );
};

var handleChange = function handleChange(e) {
  e.preventDefault();
  $("#domoMessage").animate({
    width: 'hide'
  }, 350);

  if ($("#oldPass").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
    handleError("All fields are required");
    return false;
  }

  if ($("#pass").val() !== $("#pass2").val()) {
    handleError("RAWR! Passwords do not match");
    return false;
  }

  sendAjax('POST', $("#passForm").attr("action"), $("#passForm").serialize(), redirect);
  return false;
};

var PasswordWindow = function PasswordWindow(props) {
  return (/*#__PURE__*/React.createElement("form", {
      id: "passForm",
      name: "passForm",
      onSubmit: handleChange,
      action: "/changePass",
      method: "POST",
      className: "mainForm"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "oldPass"
    }, "Current Password: "), /*#__PURE__*/React.createElement("input", {
      id: "oldPass",
      type: "password",
      name: "oldPass",
      placeholder: "password"
    }), /*#__PURE__*/React.createElement("label", {
      htmlFor: "pass"
    }, "Password: "), /*#__PURE__*/React.createElement("input", {
      id: "pass",
      type: "password",
      name: "pass",
      placeholder: "password"
    }), /*#__PURE__*/React.createElement("label", {
      htmlFor: "pass2"
    }, "Password: "), /*#__PURE__*/React.createElement("input", {
      id: "pass2",
      type: "password",
      name: "pass2",
      placeholder: "password"
    }), /*#__PURE__*/React.createElement("input", {
      type: "hidden",
      name: "_csrf",
      value: props.csrf
    }), /*#__PURE__*/React.createElement("input", {
      className: "formSubmit",
      type: "submit",
      value: "Sign in"
    }))
  );
};

var Images = function Images() {
  return (/*#__PURE__*/React.createElement("img", {
      src: fixedURI
    })
  );
}; // const Images = () =>{
//   return(
//     <Carousel>
//       {elements.map((value, index) => {
//         return <Carousel.item><img src={value} key={index}></img></Carousel.item>
//       })}
//     </Carousel>
//   );
// }


var getImages = function getImages() {
  sendAjax('GET', '/images', null, function (results) {
    imageURLS = results.Drawings; //The URI's are stored properly in mongoose, however they're not being retrieved properly.  Instead of the + they're saved with
    //They're being retrieved with spaces.  Until I determine what's wrong, this code'll fix the problem.  Also only displaying the last saved img
    //to reduce clutter on screen

    if (imageURLS.length > 0) {
      fixedURI = imageURLS[imageURLS.length - 1].img.replace(/ /g, "+");
    }

    createContent();
    displayArt();
  });
};

var createContent = function createContent() {
  ReactDOM.render( /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ConnectWindow, null), /*#__PURE__*/React.createElement(PasswordWindow, {
    csrf: token
  })), document.querySelector("#profile"));
};

var displayArt = function displayArt() {
  if (imageURLS.length > 0) {
    ReactDOM.render( /*#__PURE__*/React.createElement(Images, null), document.querySelector("#images"));
  }
};

$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
  $("#domoMessage").animate({
    width: 'toggle'
  }, 350);
};

var redirect = function redirect(response) {
  $("#domoMessage").animate({
    width: 'toggle'
  }, 350);
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cashe: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
