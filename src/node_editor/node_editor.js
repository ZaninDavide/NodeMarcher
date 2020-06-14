let updateViewport;

(async () => {
    var container = document.querySelector('#rete');
    
    var components_names = {
      "Number": new NumComponent(), 
      "Add": new AddComponent(), 
      "Multiply": new MultiplyComponent(), 
      "Output": new OutputComponent(), 
      "Color": new ColorComponent(), 
      "Vector3": new Vec3Component(), 
      "Scale": new ScaleComponent(), 
      "Mix": new MixColorsComponent(),
      "Sphere": new SphereComponent(),
      "Input": new InputComponent(),
    };

    let components = Object.values(components_names);
    
    var editor = new Rete.NodeEditor('nodeMarcher@0.1.0', container);
    editor.use(ConnectionPlugin.default);
    editor.use(VueRenderPlugin.default);    
    
    editor.use(ContextMenuPlugin.default);
    //editor.use(AreaPlugin);
    editor.use(CommentPlugin.default);
    editor.use(HistoryPlugin, { keyboard: true });
    //editor.use(ConnectionMasteryPlugin.default);


    var engine = new Rete.Engine('nodeMarcher@0.1.0');
    
    components.map(c => {
        editor.register(c);
        engine.register(c);
    });

    // START SCENE --->

    var n1 = await components_names["Sphere"].createNode();
    var n2 = await components_names["Input"].createNode();
    var out = await components_names["Output"].createNode();

    n1.position = [500, 200];
    n2.position = [500, 450];
    out.position = [900, 260];
 

    editor.addNode(n1);
    editor.addNode(n2);
    editor.addNode(out);

    editor.connect(n1.outputs.get('scene'), out.inputs.get('scene'));
    // editor.connect(n2.outputs.get('uv'), out.inputs.get('clearColor'));

    // <---

    // --------------------------- EVENTS ---------------------------

    editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
      await engine.abort();
      await engine.process(editor.toJSON());
      // console.log(editor.toJSON())
    });

    let duplicate_node = async node => {
      let new_node = await (components_names[node.name]).createNode();

      new_node.position = [node.position[0] + 10, node.position[1] + 20]
      new_node.data = node.data

      editor.addNode(new_node)
    }

    editor.on('keyup', async (e) => {
      if(e.target.nodeName === "INPUT") return true
      if(e.keyCode == 46) {
        editor.selected.list.forEach(node => {
          editor.removeNode(node)
        });
      }
      
      if(e.key === "d"){
        editor.selected.list.forEach(node => {
          duplicate_node(node)
        });
      }

      if(e.key === "p"){
        console.log(editor.toJSON())
      }
      /*
      if(e.ctrlKey && e.shiftKey && e.key === "Z"){
        editor.trigger("redo")
      }else if(e.ctrlKey && e.key === "z"){
        editor.trigger("undo")
      }
      */

    });

    editor.on('showcontextmenu', ({ e, node }) => { // e - MouseEvent, node - Node instance or null
      // return !Boolean(node); // do not show context menu for nodes
      // console.log("context")
    });
    
    engine.on('error', ({ message, data }) => { });

    editor.view.resize();
    AreaPlugin.zoomAt(editor);
    editor.trigger('process');

    updateViewport = () => {
      const data = nodes_to_shader_data(editor.toJSON())
      updateShaders(data)
    }

  updateViewport()
})();