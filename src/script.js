var previewWIDTH = 0.3;

var canvas = document.getElementById("canvas");
var gl = canvas.getContext("webgl2");

//************** Shader sources **************

// NB. since we trim the fragment shader before loading it there's no problem with the version at the second line

var vertexSource = `
#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

function resize() {
    canvas.width = window.innerWidth * previewWIDTH;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resHandle, canvas.width, canvas.height);
}


//Compile shader and combine with source
function compileShader(shaderSource, shaderType) {
  var shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw "Shader compile failed with: " + gl.getShaderInfoLog(shader);
  }
  return shader;
}

//From https://codepen.io/jlfwong/pen/GqmroZ
//Utility to complain loudly if we fail to find the attribute/uniform
function getAttribLocation(program, name) {
  var attributeLocation = gl.getAttribLocation(program, name);
  if (attributeLocation === -1) {
    console.warn("Cannot find attribute", name);
  }
  return attributeLocation;
}

function getUniformLocation(program, name) {
  var uniformLocation = gl.getUniformLocation(program, name);
  if (uniformLocation === null) {
    console.warn("Cannot find uniform", name);
  }
  return uniformLocation;
}

//************** Create shaders **************
let program;
var timeHandle;
var resHandle;

function updateShaders(data = {}){
  //Create vertex and fragment shaders
  var vertexShader = compileShader(vertexSource.trim(), gl.VERTEX_SHADER);
  var fragmentShader = compileShader(fragmentSource(data).trim(), gl.FRAGMENT_SHADER);
  
  //Create shader programs
  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw "Program link failed with: " + gl.getProgramInfoLog(program);
  }
  
  gl.useProgram(program);

  //Set uniform handle
  timeHandle = getUniformLocation(program, "time");
  resHandle = getUniformLocation(program, "u_resolution");

  gl.uniform2f(resHandle, canvas.width, canvas.height);

  return program
}

updateShaders()

//Set up rectangle covering entire canvas
var vertexData = new Float32Array([
  -1.0,
  1.0, // top left
  -1.0,
  -1.0, // bottom left
  1.0,
  1.0, // top right
  1.0,
  -1.0 // bottom right
]);

//Create vertex buffer
var vertexDataBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

// Layout of our data in the vertex buffer
var positionHandle = getAttribLocation(program, "position");

gl.enableVertexAttribArray(positionHandle);
gl.vertexAttribPointer(
  positionHandle,
  2, // position is a vec2 (2 values per component)
  gl.FLOAT, // each component is a float
  false, // don't normalize values
  2 * 4, // two 4 byte float components per vertex (32 bit float is 4 bytes)
  0 // how many bytes inside the buffer to start from
);

function draw(time) {
  // Send uniforms to program
  gl.uniform1f(timeHandle, time);
  //Draw a triangle strip connecting vertices 0-4
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
resize();

// draw function recive the time in milliseconds
requestAnimationFrame(draw);
