let vars = "" // the list of variables that it's used not to calculate anything twice
let nodes = []

function missing_input(node, input_name){
    const error = {log: "Warn", info: `Error at node of type '${node.name}' and id = ${node.id}. Missing input '${input_name}'.`}
    console.log(error)
    return error
}

function parse_vec3(json){
    if (typeof json === "object"){
        return `vec3(${json.x || 0}, ${json.y || 0}, ${json.z || 0})`
    }else{
        return json
    }
}

function parse_num(value){
    return value.toString().indexOf(".") !== -1 ? value.toString() : value.toString() + "."
}


function defaultMaterial(){
    return "mat(vec3(1, 1, 1), 100.)"
}

function parse_input(node, input_name, has_control = true){
    if(node.inputs[input_name].connections.length === 0){
        if(has_control){
            if(!node.data[input_name]){
                missing_input(node, input_name)
                return false
            }else{
                return [ node.data[input_name] ]
            }
        }else{
            missing_input(node, input_name)
            return false
        }
    }else{
        return node.inputs[input_name].connections.map(c => resolve_node(c.node, c.output))
    }
}

function resolve_node(node_id, output_name){
    const node = nodes[node_id]
    switch (node.name) {
        case "Output":
            const scene = parse_input(node, "scene", false)[0];
            const clearColor = parse_input(node, "clearColor")[0];

            return {log: "Success", scene, clearColor: parse_vec3(clearColor)}
            break;

        case "Sphere":
            const origin = parse_input(node, "origin")[0];
            const radius = parse_input(node, "radius")[0];
            const material = parse_input(node, "material")[0] || defaultMaterial();
            const world = parse_input(node, "world")[0] || "point";
            
            switch (output_name){
                case "scene":
                    return `sphere_at(${world}, ${parse_vec3(origin)}, ${parse_num(radius)}, ${material})`
                    break;
                default:
                    console.log(`This input is unknown: '${output_name}' for node of type ${node.name}`)
                    return ""
            }

            break;

        case "Input":
            switch (output_name){
                case "uv":
                    return `vec3(get_uv(), 0)`
                    break;
                default:
                    console.log(`This input is unknown: '${output_name}' for node of type ${node.name}`)
                    return ""
            }
            break;

        default:
            console.log(`This node is unknown: '${node.name}'`)
            return ""
    }
}

function nodes_to_shader_data(json){
    // reset
    vars = ""
    nodes = json.nodes

    let output_node = Object.values(nodes).filter(n => n.name === "Output")[0];
    if(!output_node) return {log: "Error", info: "Missing 'Output' node."}

    let out = resolve_node(output_node.id) // a long sequence of function and math operations that uses simple values and variables to give the SCENE result

    // console.log(out.scene)
    // console.log(out.clearColor)
    
    return {vars, scene: out.scene, clearColor: out.clearColor};
}