let token;
let socket;
let canDraw;
let username;

// GLOBALS
let canvas,ctx,dragging=false,lineWidth,strokeStyle;

// CONSTANTS
  const DEFAULT_LINE_WIDTH = 3;
  const DEFAULT_STROKE_STYLE = "black";

  const DEFAULT_FILL_STYLE = "blue";
  const TOOL_PENCIL = "toolPencil";
  const TOOL_RECTANGLE = "toolRectangle";
  const TOOL_CIRCLE = "toolCircle";
  const TOOL_LINE = "toolLine";

  let currentTool;
  let fillStyle;
  let origin;

  //canvases for drawing & displaying
  let topCanvas;
  let topCtx;
  let word;

const setup2 = () =>{
  socket = io.connect('http://localhost:3000');
  socket.on('mouseDown', (data) =>{
    currentTool = data.currentTool;
    MouseDown(data.e, data.mouse)
  });
  socket.on('clear', clear);
  socket.on('mouse', redraw);
  socket.on('mouseOut', MouseOut);
  socket.on('lineWidth', LineWidthChange);
  socket.on('strokeStyle', StrokeStyleChange);
  socket.on('mouseUp', (data) =>{
    MouseUp(data.e, data)
  });
  socket.on('refresh', getInfo);
  getInfo();
};

const redraw = (data) =>{
  Draw(data.tool, data.mouse);
}

const getToken2 = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    token = result.csrfToken;
    setup2();
  });
};

const getInfo = () => {
  sendAjax('GET', '/word', null, (result) => {
    word = result.Word;
    username = result.Username;
    if (result.Drawer === username)
      canDraw = true;
    else
      canDraw = false;
      console.log(result.Drawer + " " + username);
    createCanvasWindow();
    init();
  });
};

const checkWord = (e) => {
  e.preventDefault();

  sendAjax('POST', '/word', `word=${msg.value}&_csrf=${token}`, (result) => {
    if (result.Correct){
      socket.emit('refresh', {});//tell all other players someone guessed the answer
    }
  });
};

const DrawingWindow = () =>{
  return(
    <div>
      <canvas id="mainCanvas" width={700} height={500} />
      <canvas id="topCanvas" width={700} height={500} />
    </div>
  );
}

const DisplayWindow = () =>{
  return(
    <div>
      <canvas id="mainCanvas" width={700} height={500} />
      <canvas id="topCanvas" width={700} height={500} hidden/>
    </div>
  );
}

const CanvasWindow = (props) =>{
  if (props.drawer)
    return(<DrawingWindow />);
  else {
    return(<DisplayWindow />)
  }
}

const ControlWindow = (props)=>{
  if (props.flag)
    return(<HasControls />);
  else {
    return(<HideControls />)
  }
}

const HasControls = () =>{
  return(<div id="controls">
		<label>Tool:
			<select id="toolChooser">
				<option value="toolPencil">Pencil</option>
                <option value="toolRectangle">Rectangle</option>
                <option value="toolCircle">Circle</option>
                <option value="toolLine">Line</option>
    		</select>
    	</label>

    	<label>Line Width:
			<select id="lineWidthChooser" defaultValue="3">
				<option value="1">1</option>
				<option value="2">2</option>
        		<option value="3">3</option>
        		<option value="4">4</option>
				<option value="5">5</option>
        		<option value="6">6</option>
        		<option value="7">7</option>
				<option value="8">8</option>
        		<option value="9">9</option>
        		<option value="10">10</option>
    		</select>
    	</label>
        <label>Line Style
            <select id="strokeStyleChooser" defaultValue="black">
                <option value="red">red</option>
                <option value="green">green</option>
                <option value="blue">blue</option>
                <option value="orange">orange</option>
                <option value="yellow">yellow</option>
                <option value="purple">purple</option>
                <option value="pink">pink</option>
                <option value="black">black</option>
                <option value="brown">brown</option>
                <option value="gray">gray</option>
                <option value="white">white</option>
            </select>
        </label>
        <label>fill Style
            <select id="fillStyleChooser" defaultValue="blue">
                <option value="red">red</option>
                <option value="green">green</option>
                <option value="blue">blue</option>
                <option value="orange">orange</option>
                <option value="yellow">yellow</option>
                <option value="purple">purple</option>
                <option value="pink">pink</option>
                <option value="black">black</option>
                <option value="brown">brown</option>
                <option value="gray">gray</option>
                <option value="white">white</option>
            </select>
        </label>


    	<span><input id="clearButton" type="button" value="Clear"/></span>
    	<span><input id="exportButton" type="button" value="Export"/></span>
    </div>
  );
}

const HideControls = () =>{
  return(<div id="controls" hidden>
		<label>Tool:
			<select id="toolChooser">
				<option value="toolPencil">Pencil</option>
                <option value="toolRectangle">Rectangle</option>
                <option value="toolCircle">Circle</option>
                <option value="toolLine">Line</option>
    		</select>
    	</label>

    	<label>Line Width:
			<select id="lineWidthChooser" defaultValue="3">
				<option value="1">1</option>
				<option value="2">2</option>
        		<option value="3">3</option>
        		<option value="4">4</option>
				<option value="5">5</option>
        		<option value="6">6</option>
        		<option value="7">7</option>
				<option value="8">8</option>
        		<option value="9">9</option>
        		<option value="10">10</option>
    		</select>
    	</label>
        <label>Line Style
            <select id="strokeStyleChooser" defaultValue="black">
                <option value="red">red</option>
                <option value="green">green</option>
                <option value="blue">blue</option>
                <option value="orange">orange</option>
                <option value="yellow">yellow</option>
                <option value="purple">purple</option>
                <option value="pink">pink</option>
                <option value="black">black</option>
                <option value="brown">brown</option>
                <option value="gray">gray</option>
                <option value="white">white</option>
            </select>
        </label>
        <label>fill Style
            <select id="fillStyleChooser" defaultValue="blue">
                <option value="red">red</option>
                <option value="green">green</option>
                <option value="blue">blue</option>
                <option value="orange">orange</option>
                <option value="yellow">yellow</option>
                <option value="purple">purple</option>
                <option value="pink">pink</option>
                <option value="black">black</option>
                <option value="brown">brown</option>
                <option value="gray">gray</option>
                <option value="white">white</option>
            </select>
        </label>


    	<span><input id="clearButton" type="button" value="Clear"/></span>
    	<span><input id="exportButton" type="button" value="Export"/></span>
    </div>
  );
}

const FormWindow = () =>{
  return(
    <div>
      <ul id="messages">{word}</ul>
      <form id="answers"
      onSubmit={checkWord}
      name="answerForm"
      className="answerForm"
      >
        <input id="msg" />
        <input id="submitAnswer" type="submit" value="Enter" />
      </form>
    </div>
  );
  }

const createCanvasWindow = () => {
  ReactDOM.render(
    <div>
      <CanvasWindow drawer={canDraw}/>
      <ControlWindow flag={canDraw}/>
      <FormWindow/>
    </div>,
    document.querySelector("#content")
  );
};

// Every action needs 2 functions.  1 event function that contains the actual code
//Plus a 2nd wrapper function that sends a socket message and then calls the first function
//Without this when other browsers recieved information from socket they'd call the drawing method
//which would then recursively send out a new socket message, breaking everything
let init = () =>{
  // initialize some globals
  canvas = document.querySelector("#mainCanvas");
  ctx = canvas.getContext('2d');

      fillStyle = DEFAULT_FILL_STYLE;
      currentTool = TOOL_PENCIL;
      origin = {}; // empty object

  lineWidth = DEFAULT_LINE_WIDTH;
      strokeStyle = DEFAULT_STROKE_STYLE;

      topCanvas = document.querySelector("#topCanvas");
      topCtx = topCanvas.getContext('2d');

      // set initial properties of the graphics context
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeStyle;
      ctx.lineCap = "round";

      // set initial properties of both graphics contexts
      topCtx.lineWidth = ctx.lineWidth = lineWidth;
      topCtx.strokeStyle = ctx.strokeStyle = strokeStyle;
      topCtx.fillStyle = ctx.fillStyle = fillStyle;
      topCtx.lineCap = ctx.lineCap = "round";
      topCtx.lineJoin = ctx.lineJoin = "round";
      topCtx.globalAlpha = 0.3;

      // "butt", "round", "square" (default "butt")
      ctx.lineJoin = "round";
      // "round", "bevel", "miter" (default “miter")

      drawGrid(ctx,'lightgray', 10, 10);

  topCanvas.onmousedown = doMousedown;
      topCanvas.onmousemove = doMousemove;
      topCanvas.onmouseup = doMouseup;
      topCanvas.onmouseout = doMouseout;

      document.querySelector('#lineWidthChooser').onchange = doLineWidthChange;

      document.querySelector('#strokeStyleChooser').onchange = doStrokeStyleChange;
      document.querySelector('#clearButton').onmousedown = doClear;
      document.querySelector('#exportButton').onmousedown = doExport;

      document.querySelector('#toolChooser').onchange = function(e)
      {
          currentTool = e.target.value;
          console.log("currentTool=" + currentTool);
      };
      document.querySelector('#fillStyleChooser').onchange = function(e)
      {
          fillStyle = e.target.value;
          console.log("currentStyle=" + fillStyle);
      };
}

let MouseDown = (e, mouse) =>{
  dragging = true;

      switch(currentTool)
      {
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
}

let doMousedown = (e) =>{
  let mouse = getMouse(e);
  MouseDown(e, mouse);
  let data = {
    currentTool: currentTool,
    origin: origin,
    mouse: mouse,
  }
  socket.emit('mouseDown', data);
}

let Draw = (currentTool, mouse) =>{
  switch(currentTool)
  {
      case TOOL_PENCIL:
          // set ctx.strokeStyle and ctx.lineWidth to correct values
          ctx.strokeStyle = strokeStyle;
          ctx.lineWidth = lineWidth;

          // draw a line to x,y of mouse
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke(); // stroke the line
          break;

      case TOOL_RECTANGLE:
          /*
          These adjustments keep the rectangle tool working even if the user drags from right to left. Recall that canvas will draw a rectangle left to right with the ctx.fillRect() and ctx.strokeRect() methods
          */
          var x = Math.min(mouse.x,origin.x);
          var y = Math.min(mouse.y,origin.y);
          var w = Math.abs(mouse.x - origin.x);
          var h = Math.abs(mouse.y - origin.y);

          // fill and stroke the rectangle
          topCtx.strokeStyle = strokeStyle;
          topCtx.fillStyle = fillStyle;
          topCtx.lineWidth = lineWidth;

          //clear old rectangles
          clearTopCanvas();

          topCtx.fillRect(x,y,w,h);
          topCtx.strokeRect(x,y,w,h);
          break;
      case TOOL_CIRCLE:
          var x = Math.min(origin.x,origin.x);
          var y = Math.min(origin.y,origin.y);
          var r = Math.abs(distance(mouse, origin));

          // fill and stroke the rectangle
          topCtx.strokeStyle = strokeStyle;
          topCtx.fillStyle = fillStyle;
          topCtx.lineWidth = lineWidth;

          //clear old rectangles
          clearTopCanvas();

          topCtx.beginPath();
          topCtx.moveTo(x,y);
          topCtx.arc(x,y,r,0,Math.PI * 2, false);
          topCtx.closePath();
          topCtx.stroke();
          topCtx.fill();
          break;
      case TOOL_LINE:
          /*
          These adjustments keep the line tool working even if the user drags from right to left.
          */
          var x = origin.x  ;
          var y = origin.y;
          var w = mouse.x - origin.x;
          var h = mouse.y - origin.y;

          // fill and stroke the rectangle
          topCtx.strokeStyle = strokeStyle;
          topCtx.lineWidth = lineWidth;

          //clear old rectangles
          clearTopCanvas();

          topCtx.beginPath();
          topCtx.moveTo(x,y);
          topCtx.lineTo(x+w,y+h);
          topCtx.closePath();
          topCtx.stroke();
          break;
  }
}

let doMousemove = (e) =>{
      if(!dragging) return; // bail out if the mouse button is not down
      let mouse = getMouse(e); // get location of mouse in canvas coordinates

      Draw(currentTool, mouse, origin);

      let data = {
        mouse: mouse,
        origin: origin,
        tool: currentTool,
      };

      socket.emit('mouse', data);
      console.log(data);
}

let MouseUp = (e, data) =>{
  switch(currentTool)
      {
          case TOOL_PENCIL:
              ctx.closePath();
              break;
          case TOOL_RECTANGLE:
          case TOOL_CIRCLE:
          case TOOL_LINE:
              if(dragging)
              {
                  topCtx.globalAlpha = 1;
                  if (data)
                    Draw(data.currentTool, data.mouse, data.origin);
                  else
                    doMousemove(e);
                  ctx.drawImage(topCanvas,0,0);
                  clearTopCanvas();
                  topCtx.globalAlpha = 0.3;
              }
              break;
      }
      dragging = false;
}

let doMouseup = (e) =>{
  let temp = getMouse(e);
  socket.emit('mouseUp', {
    e: e,
    currentTool: currentTool,
    mouse: temp,
    dragging: dragging,
    origin: origin,
  });
  MouseUp(e);
}

let MouseOut = (e) =>{
  switch(currentTool)
      {
          case TOOL_PENCIL:
              ctx.closePath();
              break;
          case TOOL_RECTANGLE:
          case TOOL_CIRCLE:
          case TOOL_LINE:
              // cancel the drawing
              clearTopCanvas()
              break;
      }
      dragging = false;
}

// if the user drags out of the canvas
let doMouseout = (e) =>{
  MouseOut(e);
  socket.emit('mouseOut', {e: e});
}

let clear = () =>{
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawGrid(ctx,'lightgray', 10, 10);
}

let doClear = () =>{
  socket.emit('clear', {
    clear: "clear"
  });
  clear();
}

let doExport = () =>{
  // open a new window and load the image in it
  // http://www.w3schools.com/jsref/met_win_open.asp
  var data = canvas.toDataURL();

  sendAjax('POST', "/img", `img=${data}&_csrf=${token}`, redirect);

 }

 let LineWidthChange = (value) =>{
   lineWidth = value;
 }

let doLineWidthChange = (e) =>
{
  socket.emit("lineWidth", {value: e.target.value});
  LineWidthChange(e.target.value);
}

let StrokeStyleChange = (value) =>{
  strokeStyle = value;
}

let doStrokeStyleChange = (e) =>
{
  socket.emit("strokeStyle", {value: e.target.value});
  StrokeStyleChange(e.target.value);
}

let distance = (p1, p2) =>{
  let x = p2.x - p1.x;
  let y = p2.y - p1.y;

  return Math.sqrt((x*x) + (y*y));
}

let getMouse = (e) =>{
  var mouse = {}
  mouse.x = e.pageX - e.target.offsetLeft;
  mouse.y = e.pageY - e.target.offsetTop;
  return mouse;
}


let drawGrid = (ctx, color, cellWidth, cellHeight) =>{
  // save the current drawing state as it existed before this function was called
  ctx.save()

  // set some drawing state variables
  ctx.strokeStyle = color;
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 0.5;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // vertical lines all set!
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
  }


  // restore the drawing state
  ctx.restore();
}

let clearTopCanvas = () =>
{
    topCtx.clearRect(0,0,topCtx.canvas.width,topCtx.canvas.height);
}


$(document).ready(function() {
  getToken2();
});
