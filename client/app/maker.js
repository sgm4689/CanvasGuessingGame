let token;

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
  let word

const setup = (csrf) =>{
  getWord();
};

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    token = result.csrfToken;
    setup(token);
  });
};

const getWord = () => {
  sendAjax('GET', '/word', null, (result) => {
    word = result.Word;
    createCanvasWindow();
    createControlWindow();
    createFormWindow();
    init();
  });
};

const checkWord = (e) => {
  e.preventDefault();

  sendAjax('POST', '/word', `word=${msg.value}&_csrf=${token}`, (result) => {
    messages.innerHTML = result.Word;
  });
};

const CavnasWindow = () =>{
  return(
    <div>
      <canvas id="mainCanvas" width={700} height={500} />
      <canvas id="topCanvas" width={700} height={500} />
    </div>
  );
}

const ControlWindow = () =>{
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
    <CavnasWindow/>,
    document.querySelector("#content")
  );
};

const createControlWindow = () =>{
  ReactDOM.render(
    <ControlWindow/>,
    document.querySelector("#controls")
  );
}

const createFormWindow = () =>{
  ReactDOM.render(
    <FormWindow/>,
    document.querySelector("#form")
  );
}

$(document).ready(function() {
  getToken();
});

// FUNCTIONS
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


// EVENT CALLBACK FUNCTIONS
let doMousedown = (e) =>{
  dragging = true;
      var mouse = getMouse(e);

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

let doMousemove = (e) =>{
      if(!dragging) return; // bail out if the mouse button is not down
      var mouse = getMouse(e); // get location of mouse in canvas coordinates

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

let doMouseup = (e) =>{
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
                  doMousemove(e);
                  ctx.drawImage(topCanvas,0,0);
                  clearTopCanvas();
                  topCtx.globalAlpha = 0.3;
              }
              break;
      }
      dragging = false;
}

// if the user drags out of the canvas
let doMouseout = (e) =>{
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

let doClear = () =>{
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawGrid(ctx,'lightgray', 10, 10);
}

let doExport = () =>{
  // open a new window and load the image in it
  // http://www.w3schools.com/jsref/met_win_open.asp
  var data = canvas.toDataURL();

  //console.log(data);
  sendAjax('POST', "/img", `img=${data}&_csrf=${token}`, function () {
    return true;
  });

 }

  let doLineWidthChange = (e) =>
  {
      lineWidth = e.target.value;
  }

  let doStrokeStyleChange = (e) =>
  {
      strokeStyle = e.target.value;
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
