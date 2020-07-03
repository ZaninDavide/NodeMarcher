let vars = {} // the list of variables that it's used not to calculate anything twice
let nodes = []

function missing_input(node, input_name){
    const error = {log: "Warn", info: `Error at node of type '${node.name}' and id = ${node.id}. Missing input '${input_name}'.`}
    console.log(error)
    return error
}

function missing_data(node, output_name){
    const error = {log: "Warn", info: `Error at node of type '${node.name}' and id = ${node.id}. Missing data '${output_name}'.`}
    console.log(error)
    return error
}

function parse_vec3(json){
    if(typeof json !== "object") return json
    switch (json.type) {
        case "vec3":
        case "vec3 expr":
        case "vec3 var":
            return json.value
            break;
        case "data":
            return `vec3(${json.value.x || 0}, ${json.value.y || 0}, ${json.value.z || 0})`
            break;
        case "var":
            return json.value
            break;
        case "float":
        case "float var":
        case "float expr":
            return `vec3(${json.value})`
            break;
        default:
            return json
            break;
    }
}

function num_to_glsl(value){
    if(!isNaN(parseFloat(value))){
        return (value.toString().indexOf(".") === -1 && value.toString().indexOf("e") === -1) ? (value.toString() + ".") : value.toString()
    }else{
        return value
    }
}

function parse_num(json){
    if(typeof json !== "object") return json
    switch (json.type) {
        case "float":
        case "float var":
        case "float expr":
        case "data":
            return num_to_glsl(json.value)
            break;
        case "vec3":
        case "vec3 expr":
        case "vec3 var":
            return `length(${num_to_glsl(json.value)})`
            break;
        case "var":
            return json.value
            break;
        default:
            return json
            break;
    }
    
}

function defaultMaterial(){
    return {type: "mat", value: "mat(vec3(1, 1, 1), 100.)"}
}

function has_multiple_connections(node_id, output_name){
    const node = nodes[node_id]
    return node.outputs[output_name].connections.length > 1
}

function get_var_type(var_name){
    return vars[var_name].type.split(" ")[0]
}

function parse_input(node, input_name, input_settings = {}){
    const settings = {has_control: true, can_variable: true, default: undefined, ...input_settings};

    if(node.inputs[input_name].connections.length === 0){
        if(settings.has_control){
            if(node.data[input_name] === undefined){
                if(settings.default) {
                    return [settings.default]
                }else{
                    missing_input(node, input_name)
                    return false
                }
            }else{
                return [ get_data(node, input_name) ]
            }
        }else{
            if(settings.default) {
                return [settings.default]
            }else{
                missing_input(node, input_name)
                return false
            }
        }
    }else{
        return node.inputs[input_name].connections.map(c => {
            const var_name = "var_" + c.node + "_" + c.output
            if(vars[var_name] === undefined || !settings.can_variable){
                if(has_multiple_connections(c.node, c.output) && settings.can_variable){
                    vars[var_name] = resolve_node(c.node, c.output)
                    return {type: get_var_type(var_name) + " var", value: var_name}
                }else{
                    return resolve_node(c.node, c.output)
                }
            }else{
                return {type: get_var_type(var_name) + " var", value: var_name}
            }
        })
    }
}

function get_data(node, input_name){
    if(node.data[input_name] !== undefined){
        return {type: "data", value: node.data[input_name]}
    }else{
        missing_data(node, input_name)
        return false
    }
}

function resolve_node(node_id, output_name){
    const node = nodes[node_id]
    switch (node.name) {
        // -------------------------- OUTPUT --------------------------
        case "Output":
            const scene = parse_input(node, "scene", {has_control: false})[0];
            const clearColor = parse_input(node, "clearColor", {can_variable: false})[0];

            return {log: "Success", scene: scene !== undefined ? scene.value : undefined, clearColor: parse_vec3(clearColor)}
            break;

        // -------------------------- SPHERE --------------------------
        case "Sphere":
            const origin = parse_input(node, "origin")[0];
            const radius = parse_input(node, "radius")[0];
            const material = parse_input(node, "material", {default: defaultMaterial()})[0].value;
            const world = parse_input(node, "world", {default: {type: "vec3 expr", value: "world"}})[0];

            switch (output_name){
                case "scene":
                    return {type: "scn", value: `sphere_at(${parse_vec3(world)}, ${parse_vec3(origin)}, ${parse_num(radius)}, ${material})`}
                    break;
                default:
                    console.log(`This input is unknown: '${output_name}' for node of type ${node.name}`)
                    return ""
            }

            break;

        // -------------------------- INPUT --------------------------
        case "Input":
            switch (output_name){
                case "uv":
                    return {type: "vec3", value: `vec3(get_uv(), 0)`}
                    break;
                case "world":
                    return {type: "vec3 var", value: `world`}
                    break;
                case "time":
                    return {type: "float var", value: `time`}
                    break;
                default:
                    console.log(`This input is unknown: '${output_name}' for node of type ${node.name}`)
                    return ""
            }
            break;

        // -------------------------- NUMBER --------------------------
        case "Number":
            switch (output_name){
                case "output":
                    return {type: "float", value: parse_num(get_data(node, "output"))};
                    break;
                default:
                    console.log(`This input is unknown: '${output_name}' for node of type ${node.name}`)
                    return ""
            }
            break;
        
        // -------------------------- ADD --------------------------
        case "Add":
            const input1 = parse_input(node, "input1")[0];
            const input2 = parse_input(node, "input2")[0];

            switch (output_name){
                case "output":
                    return {type: "float expr", value: `${parse_num(input1)} + ${parse_num(input2)}`};
                    break;
                default:
                    console.log(`This input is unknown: '${output_name}' for node of type ${node.name}`)
                    return ""
            }
            break;

        // -------------------------- MULTIPLY --------------------------
        case "Multiply":
            const factor1 = parse_input(node, "input1")[0];
            const factor2 = parse_input(node, "input2")[0];

            switch (output_name){
                case "output":
                    return {type: "float expr", value: `${parse_num(factor1)} * ${parse_num(factor2)}`};
                    break;
                default:
                    console.log(`This input is unknown: '${output_name}' for node of type ${node.name}`)
                    return ""
            }
            break;

        // -------------------------- MATERIAL --------------------------
        case "Material":
            const diffuse = parse_input(node, "diffuse")[0];
            const spec = parse_input(node, "spec")[0];

            switch (output_name){
                case "material":
                    return {type: "mat", value: `mat(${parse_vec3(diffuse)}, ${parse_num(spec)})`};
                    break;
                default:
                    console.log(`This input is unknown: '${output_name}' for node of type ${node.name}`)
                    return ""
            }
            break;

        // -------------------------- SCALE --------------------------
        case "Scale":
            const vector = parse_input(node, "vector")[0];
            const number = parse_input(node, "number")[0];

            switch (output_name){
                case "output":
                    return {type: "vec3", value: `${parse_vec3(vector)} * ${parse_num(number)}`};
                    break;
                default:
                    console.log(`This input is unknown: '${output_name}' for node of type ${node.name}`)
                    return ""
            }
            break;

        // -------------------------- MATH --------------------------
        case "Math":
            const operation = get_data(node, "operation").value;
            const math_input1 = parse_input(node, "input1")[0];
            const math_input2 = parse_input(node, "input2")[0];

            switch (output_name){
                case "output":
                    switch (operation){
                        case "Add":         return {type: "float expr", value: `${parse_num(math_input1)} + ${parse_num(math_input2)}`}; break;
                        case "Subtract":    return {type: "float expr", value: `${parse_num(math_input1)} - ${parse_num(math_input2)}`}; break;
                        case "Multiply":    return {type: "float expr", value: `${parse_num(math_input1)} * ${parse_num(math_input2)}`}; break;
                        case "Divide":      return {type: "float expr", value: `${parse_num(math_input1)} / ${parse_num(math_input2)}`}; break;
                        case "Pow":         return {type: "float expr", value: `pow(${parse_num(math_input1)}, ${parse_num(math_input2)})`}; break;
                        case "Modulo":      return {type: "float expr", value: `mod(${parse_num(math_input1)}, ${parse_num(math_input2)})`}; break;
                        default: 
                            console.log(`This item is unknown: '${operation}' for node of type ${node.name}`)
                            return ""
                    }
                    break;
                default:
                    console.log(`This input is unknown: '${output_name}' for node of type ${node.name}`)
                    return ""
            }
            break;

        // -------------------------- BOOLEAN --------------------------
        case "Boolean":
            const boolean_operation = get_data(node, "operation").value;
            const boolean_input1 = parse_input(node, "input1")[0].value;
            const boolean_input2 = parse_input(node, "input2")[0].value;

            switch (output_name){
                case "output":
                    switch (boolean_operation){
                        case "Union":         return {type: "scn", value: `scene_union(${boolean_input1}, ${boolean_input2})`}; break;
                        case "Difference":    return {type: "scn", value: `scene_difference(${boolean_input1}, ${boolean_input2})`}; break;
                        case "Intersection":  return {type: "scn", value: `scene_intersection(${boolean_input1}, ${boolean_input2})`}; break;
                        default: 
                            console.log(`This item is unknown: '${boolean_operation}' for node of type ${node.name}`)
                            return ""
                    }
                    break;
                default:
                    console.log(`This input is unknown: '${output_name}' for node of type ${node.name}`)
                    return ""
            }
            break;

        // -------------------------- CUBE --------------------------
        case "Cube":
            const cube_origin = parse_input(node, "origin")[0];
            const cube_size = parse_input(node, "size")[0];
            const cube_radius = parse_input(node, "radius")[0];
            const cube_material = parse_input(node, "material", {default: defaultMaterial()})[0].value;
            const cube_world = parse_input(node, "world", {default: {type: "vec3 expr", value: "world"}})[0];

            switch (output_name){
                case "scene":
                    return {type: "scn", value: `cube_at(${parse_vec3(cube_world)}, ${parse_vec3(cube_origin)}, ${parse_vec3(cube_size)}, ${parse_num(cube_radius)}, ${cube_material})`}
                    break;
                default:
                    console.log(`This input is unknown: '${output_name}' for node of type ${node.name}`)
                    return ""
            }

            break;


        // -------------------------- ELSE --------------------------
        default:
            throw `This node is unknown: '${node.name}'`
            return ""
    }
}

function nodes_to_shader_data(json){
    // reset
    vars = {}
    nodes = json.nodes

    let output_node = Object.values(nodes).filter(n => n.name === "Output")[0];
    if(!output_node) return {log: "Error", info: "Missing 'Output' node."}

    let out = resolve_node(output_node.id) // a long sequence of function and math operations that uses simple values and variables to give the SCENE result

    // console.log(out.scene)
    // console.log(out.clearColor)
    
    return {vars, scene: out.scene, clearColor: out.clearColor};
}