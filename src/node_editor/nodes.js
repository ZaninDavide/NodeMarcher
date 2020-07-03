// ------------------------------ SOCKETS ------------------------------

var numSocket = new Rete.Socket('Number socket');
var vec3Socket = new Rete.Socket('Vec3 socket');
var sceneSocket = new Rete.Socket('Scene socket');
var matSocket = new Rete.Socket('Material socket');


vec3Socket.combineWith(numSocket);
numSocket.combineWith(vec3Socket);

// ------------------------------ NODES ------------------------------

class OutputComponent extends Rete.Component {
  constructor(){
      super("Output")
  }

  builder(node){
    // define in-out sockets
    let scene_input = new Rete.Input("scene",  "Scene", sceneSocket, false)
    let clear_color_input = new Rete.Input("clearColor",  "Clear color", vec3Socket)

    // apply them all
    node.addInput(scene_input)
    node.addInput(clear_color_input)
    
    // initialize controls
    clear_color_input.addControl(new ColControl(this.editor, 'clearColor', "Clear Color"))

    // set default values
    node.data.scene = 0
    node.data.clearColor = {x: 0, y: 0, z: 0}


    return node
  }

  worker(node, inputs, outputs) {
    inputs["scene"].length > 0 ? JSON.stringify(inputs["scene"][0]) : node.data.scene_input
  }
}

class InputComponent extends Rete.Component {
  constructor(){
      super("Input")
  }

  builder(node){
    // define in-out sockets
    let uv = new Rete.Output("uv",  "UV", vec3Socket)
    let world = new Rete.Output("world",  "World", vec3Socket)
    let time = new Rete.Output("time",  "Time", numSocket)

    // apply them all
    node.addOutput(uv)
    node.addOutput(world)
    node.addOutput(time)

    // set default values
    node.data.world = {x: 0, y:0, z: 0}
    node.data.uv = {x: 0, y:0, z: 0}
    node.data.time = 0


    return node
  }

  worker(node, inputs, outputs) {
    
  }
}

class NumComponent extends Rete.Component {

    constructor(){
      super("Number");
    }

    builder(node) {
      var out1 = new Rete.Output('output', "Value", numSocket);
      
      node.data.output = 0

      return node.addControl(new NumControl(this.editor, 'output', "Value")).addOutput(out1);
    }

    worker(node, inputs, outputs) {
      outputs['output'] = node.data.output;
    }
}

class AddComponent extends Rete.Component {
    constructor(){
      super("Add");
    }

    builder(node) {
      var inp1 = new Rete.Input('input1',"Value", numSocket);
      var inp2 = new Rete.Input('input2', "Value", numSocket);
      var out = new Rete.Output('output', "Value", numSocket);

      inp1.addControl(new NumControl(this.editor, 'input1', "Value"))
      inp2.addControl(new NumControl(this.editor, 'input2', "Value"))

      node.addInput(inp1)
          .addInput(inp2)
          .addOutput(out);
          //.addControl(new NumControl(this.editor, 'preview', true))
      
      node.data.input1 = 0
      node.data.input2 = 0

      return node
    }

    worker(node, inputs, outputs) {
      var n1 = inputs['input1'].length  ? inputs['input1'][0]  : node.data.input1;
      var n2 = inputs['input2'].length  ? inputs['input2'][0]  : node.data.input2;
      var sum = n1 + n2;
      
      // this.editor.nodes.find(n => n.id == node.id).controls.get('preview').setValue(sum);
      outputs['output'] = sum;
    }
}

class MultiplyComponent extends Rete.Component {
    constructor(){
      super("Multiply")
    }

    builder(node){
      // define in-out sockets
      let input1 = new Rete.Input("input1",  "Value", numSocket, false)
      let input2 = new Rete.Input("input2",  "Value", numSocket, true)
      let output = new Rete.Output('output', "Value", numSocket)

      // allow user to edit them if the socket is empty
      input1.addControl(new NumControl(this.editor, "input1", "Value"))
      input2.addControl(new NumControl(this.editor, "input2", "Value"))

      // apply them all
      node.addInput(input1).addInput(input2).addOutput(output)

      // set default values
      node.data.input1 = 0
      node.data.input2 = 1

      return node
    }

    worker(node, inputs, outputs) {
      let acc = inputs["input1"].length ? inputs["input1"][0] : node.data.input1;
      
      if(inputs["input2"].length){
        inputs["input2"].forEach(n => {
            acc *= n
        });
      }else{
          acc *= node.data.input1
      }
      
      outputs["output"] = acc;
    }
}

class ColorComponent extends Rete.Component {
    constructor(){
      super("Color")
    }

    builder(node) {
      var out = new Rete.Output("output", "vec3", vec3Socket);
      
      node.data.output = {x: 0, y: 0, z: 0}

      return node.addControl(new ColControl(this.editor, "output", "Color")).addOutput(out);
    }

    worker(node, inputs, outputs) {
      outputs["output"] = node.data.output;
    }
}

class Vec3Component extends Rete.Component {
    constructor(){
      super("Vector3")
    }

    builder(node) {
      var out = new Rete.Output("output", "vec3", vec3Socket);
      
      node.data.output = {x: 0, y: 0, z: 0}
      
      return node.addControl(new Vec3Control(this.editor, "output", "Vector")).addOutput(out);
    }

    worker(node, inputs, outputs) {
      outputs["output"] = node.data.output;
    }
}

class ScaleComponent extends Rete.Component {
    constructor(){
        super("Scale")
    }

    builder(node) {
      let vector = new Rete.Input("vector",  "Vector", vec3Socket)
      let number = new Rete.Input("number",  "Factor", numSocket)
      var out = new Rete.Output("output", "vec3", vec3Socket);
      
      vector.addControl(new InlineVec3Control(this.editor, 'vector', "Vector"))
      number.addControl(new NumControl(this.editor, 'number', "Factor"))

      node.data.vector = {x: 1, y: 1, z: 1}
      node.data.number = 1
      
      return node.addInput(vector).addInput(number).addOutput(out);
    }

    worker(node, inputs, outputs) {
      let vec = inputs["vector"].length ? inputs["vector"][0] : node.data.vector;
      let num = inputs["number"].length ? inputs["number"][0] : node.data.number;
      
      outputs["output"] = {x: vec.x * num, y: vec.y * num, z: vec.z * num};
    }
}

class MixColorsComponent extends Rete.Component {
    constructor(){
        super("Mix")
    }

    builder(node) {
      let input1 = new Rete.Input("input1",  "Color", vec3Socket)
      let input2 = new Rete.Input("input2",  "Color", vec3Socket)
      var out = new Rete.Output("output", "vec3", vec3Socket);
      
      node.data.input1 = {x: 0, y: 0, z: 0}
      node.data.input2 = {x: 0, y: 0, z: 0}

      input1.addControl(new ColControl(this.editor, 'input1', "Color"))
      input2.addControl(new ColControl(this.editor, 'input2', "Color"))
      
      return node.addInput(input1).addInput(input2).addOutput(out);
    }

    worker(node, inputs, outputs) {
      let in1 = inputs["input1"].length ? inputs["input1"][0] : node.data.input1;
      let in2 = inputs["input2"].length ? inputs["input2"][0] : node.data.input2;
      
      outputs["output"] = {x: (in1.x + in2.x) / 2, y: (in1.y + in2.y) / 2, z: (in1.z + in2.z) / 2};
    }
}

class SphereComponent extends Rete.Component {
    constructor(){
        super("Sphere")
    }

    builder(node) {
      // define in-out sockets
      let scene_output = new Rete.Output("scene",  "Scene", sceneSocket)
      let origin = new Rete.Input("origin",  "Origin", vec3Socket)
      let radius = new Rete.Input("radius",  "Radius", numSocket)
      let material = new Rete.Input("material",  "Material", matSocket)
      let world = new Rete.Input("world",  "World", vec3Socket)
  
      // apply them all
      node.addOutput(scene_output)
      node.addInput(origin)
      node.addInput(radius)
      node.addInput(material)
      node.addInput(world)
      
      // initialize controls
      origin.addControl(new InlineVec3Control(this.editor, 'origin', "Origin"))
      radius.addControl(new NumControl(this.editor, 'radius', "Radius"))
  
      // set default values
      node.data.scene = 0
      node.data.origin = {x: 0, y: 0, z: 0}
      node.data.radius = 1
  
  
      return node
    }

    worker(node, inputs, outputs) {
      outputs["output"] = 0;
    }
}

class MaterialComponent extends Rete.Component {
    constructor(){
        super("Material")
    }

    builder(node) {
      // define in-out sockets
      let material_output = new Rete.Output("material",  "Material", matSocket)
      let diffuse = new Rete.Input("diffuse",  "Diffuse", vec3Socket)
      let spec = new Rete.Input("spec",  "Specularity", numSocket)

      // apply them all
      node.addOutput(material_output)
      node.addInput(diffuse)
      node.addInput(spec)
      
      // initialize controls
      diffuse.addControl(new ColControl(this.editor, 'diffuse', "Diffuse"))
      spec.addControl(new NumControl(this.editor, 'spec', "Specularity"))
  
      // set default values
      node.data.diffuse = {x: 0, y: 0, z: 0}
      node.data.spec = 1
  
  
      return node
    }
}

class MathComponent extends Rete.Component {
  constructor(){
    super("Math");
  }

  builder(node) {
    var inp1 = new Rete.Input('input1',"Value", numSocket);
    var inp2 = new Rete.Input('input2', "Value", numSocket);
    var out = new Rete.Output('output', "Value", numSocket);

    node.addControl(new DropDownControl(this.editor, 'operation', "Operation", ["Add", "Subtract", "Multiply", "Divide", "Pow", "Modulo"]))

    inp1.addControl(new NumControl(this.editor, 'input1', "Value"))
    inp2.addControl(new NumControl(this.editor, 'input2', "Value"))

    node.addInput(inp1)
        .addInput(inp2)
        .addOutput(out);
    
    node.data.input1 = 0
    node.data.input2 = 0

    return node
  }
}

class BooleanComponent extends Rete.Component {
  constructor(){
    super("Boolean");
  }

  builder(node) {
    var inp1 = new Rete.Input('input1',"Scene", sceneSocket);
    var inp2 = new Rete.Input('input2', "Scene", sceneSocket);
    var out = new Rete.Output('output', "Scene", sceneSocket);

    node.addControl(new DropDownControl(this.editor, 'operation', "Operation", ["Union", "Difference", "Intersection"]))

    node.addInput(inp1)
        .addInput(inp2)
        .addOutput(out);

    return node
  }
}

class CubeComponent extends Rete.Component {
  constructor(){
      super("Cube")
  }

  builder(node) {
    // define in-out sockets
    let scene_output = new Rete.Output("scene",  "Scene", sceneSocket)
    let origin = new Rete.Input("origin",  "Origin", vec3Socket)
    let size = new Rete.Input("size",  "Size", vec3Socket)
    let radius = new Rete.Input("radius",  "Radius", numSocket)
    let material = new Rete.Input("material",  "Material", matSocket)
    let world = new Rete.Input("world",  "World", vec3Socket)

    // apply them all
    node.addOutput(scene_output)
    node.addInput(origin)
    node.addInput(size)
    node.addInput(radius)
    node.addInput(material)
    node.addInput(world)
    
    // initialize controls
    origin.addControl(new InlineVec3Control(this.editor, 'origin', "Origin"))
    size.addControl(new InlineVec3Control(this.editor, 'size', "Size"))
    radius.addControl(new NumControl(this.editor, 'radius', "Radius"))

    // set default values
    node.data.scene = 0
    node.data.origin = {x: 0, y: 0, z: 0}
    node.data.size = {x: 1, y: 1, z: 1}
    node.data.radius = .1


    return node
  }

  worker(node, inputs, outputs) {
    outputs["output"] = 0;
  }
}