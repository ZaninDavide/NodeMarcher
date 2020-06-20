function fragmentSource(data = {}) {

  if(!data.scene) data.scene = "scn(1., mat(vec3(1.), 1.))"
  if(!data.clearColor) data.clearColor = "vec3(0, 0, 0)"

  let vars_text = ""
  if(data.vars){
    Object.keys(data.vars).forEach(v => {
      vars_text += `${data.vars[v].type} ${v} = ${data.vars[v].value};` + "\n  "
    });
  }


  let code = `
#version 300 es
precision mediump float;

// ray marching
uint MAX_ITERATIONS = uint(700);
float CONTACT_DISTANCE = 0.005;
float MARCHING_FACTOR = 0.999;
float EPSILON = 0.001;
float AMBIENT = .05;
float GAMMA = 1.5;


// in/out
uniform vec2 u_resolution; // canvas width and height in pixels
uniform float time; // time in milliseconds
out vec4 color;

// --------------------- data

struct mat{
  vec3 diffuse;
  float specularity;
};

struct scn{
  float distance;
  mat material;
};

struct trace_result{
  bool hit;
  float travelled;
  vec3 hit_point;
  mat material;
};

struct cam{
  vec3 pos;
  vec3 rot;
  float fNear;
};

// --------------------- math

vec3 rotate(vec3 point, vec3 angle){
  if(angle.x != 0.){
    point *= mat3(
      1, 0, 0,
      0, cos(angle.x), sin(angle.x),
      0, -sin(angle.x), cos(angle.x)
    );
  }
  if(angle.y != 0.){
    point *= mat3(
      cos(angle.y), 0, -sin(angle.y),
      0, 1, 0,
      sin(angle.y), 0, cos(angle.y)
    );  
  }
  if(angle.z != 0.){
    point *= mat3(
      cos(angle.z), sin(angle.z), 0,
      -sin(angle.z), cos(angle.z), 0,
      0, 0, 1
    );
  }
  return point;
}

// --------------------- utilities

vec2 get_uv(){
  // Normalizing pixel coordinates (from -1 to 1 both horizontally and vertically)
  vec2 uv = 2. * (gl_FragCoord.xy / u_resolution - vec2(0.5));
  uv.x *= u_resolution.x / u_resolution.y;

  return uv;
}

// --------------------- objects

scn sphere_at(vec3 point, vec3 origin, float radius, mat material){
  scn scene;
  scene.distance = length(point - origin) - radius;
  scene.material = material;
  return scene;
}

scn cube_at(vec3 point, vec3 origin, vec3 size, float radius, mat material){
  scn scene;
  vec3 q = abs(point - origin) - size;
  scene.distance = length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - radius;
  scene.material = material;
  return scene;
}

// --------------------- booleans

scn scene_union(scn sceneA, scn sceneB){
  if(sceneA.distance <= sceneB.distance){
    return sceneA;
  }else{
    return sceneB;
  }
}

scn scene_intersection(scn sceneA, scn sceneB){
  if(sceneA.distance >= sceneB.distance){
    return sceneA;
  }else{
    return sceneB;
  }
}

// --------------------- ray marching

scn apply_material(scn scene, mat material){
  scene.material = material;
  return scene;
}


scn scene_at(vec3 world){
  ${vars_text}
  return ${data.scene};
}

trace_result trace(vec3 origin, vec3 direction){
  trace_result res;
  float travelled = 0.;

  // marching loop
  for (uint i = uint(0); i <= MAX_ITERATIONS; i++){
    vec3 marcher_point = origin + (direction * travelled);
    scn scene = scene_at(marcher_point);

    if(scene.distance < CONTACT_DISTANCE){
      res.hit = true;
      res.hit_point = marcher_point;
      res.travelled = travelled;
      res.material = scene.material;
      return res;
    }else{
      travelled += scene.distance * MARCHING_FACTOR;
    }
  }

  res.hit = false;
  return res;
}

vec3 normal_at(vec3 p) {
  return normalize(vec3(
    scene_at(vec3(p.x + EPSILON, p.y, p.z)).distance  - scene_at(vec3(p.x - EPSILON, p.y, p.z)).distance,
    scene_at(vec3(p.x, p.y + EPSILON, p.z)).distance  - scene_at(vec3(p.x, p.y - EPSILON, p.z)).distance,
    scene_at(vec3(p.x, p.y, p.z  + EPSILON)).distance - scene_at(vec3(p.x, p.y, p.z - EPSILON)).distance
  ));
}

vec3 ray_marcher(vec2 uv, cam camera){

  vec3 pixel_dir = normalize(vec3(uv, -camera.fNear));
  pixel_dir = rotate(pixel_dir, camera.rot);

  // ray march
  trace_result trace_res = trace(camera.pos, pixel_dir);

  // sky
  if(!trace_res.hit) return ${data.clearColor};
  
  // normal
  vec3 normal = normal_at(trace_res.hit_point);

  // lighting
  vec3 light_pos = vec3(1, 1, 1);
  vec3 light_intensity = vec3(.8, .8, .6);
  vec3 hit_to_light = light_pos - trace_res.hit_point;

  float diffuse = dot(normalize(hit_to_light), normal) / length(hit_to_light);
  diffuse = max(0., diffuse);

  float specular = dot(normalize(reflect(pixel_dir, normal)), normalize(hit_to_light));
  specular = pow(max(0., specular), trace_res.material.specularity);

  return ((diffuse + AMBIENT) * trace_res.material.diffuse * light_intensity) + vec3(specular * light_intensity);
}

void main() {
  vec2 uv = get_uv();

  cam camera;
  camera.pos = vec3(0, 0, 5);
  camera.rot = vec3(0, 0, 0);
  camera.fNear = 3.0;

  color = vec4(ray_marcher(uv, camera), 1); 
}
`
  return code
;}