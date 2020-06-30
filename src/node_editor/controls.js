// ------------------------------ CONTROLS ------------------------------

// --- NUMBER ---

var VueNumControl = {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData', 'caption'],
  template: '<div class="control_grid"><div class="control_caption" :title="title">{{title}}</div><input type="number" step=".1" lang="en" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/></div>',
  data() {
    return {
      value: 0,
      title: "",
    }
  },
  methods: {
    change(e){
      this.value = e.target.value;
      this.update();
    },
    update() {
      if (this.ikey)
        this.putData(this.ikey, parseFloat(this.value))
      this.emitter.trigger('process');
    }
  },
  mounted() {
    this.value = this.getData(this.ikey);
    this.title = this.caption
  }
}

class NumControl extends Rete.Control {

  constructor(emitter, key, caption, readonly) {
    super(key);
    this.component = VueNumControl;
    this.props = { emitter, ikey: key, readonly, caption };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}

// --- COLOR ---

var VueColControl = {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData', 'caption'],
  template: '<div class="control_grid"><div class="control_caption control_caption_color" :title="title">{{title}}</div><input type="color" step="any" lang="en" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/></div>',
  data() {
    return {
      value: "#000000",
      x: 0,
      y: 0,
      z: 0,
      title: "",
    }
  },
  methods: {
    change(e){
      this.value = e.target.value;
      this.update();
    },
    hexToXyz(hex){
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        x: parseInt(result[1], 16) / 255,
        y: parseInt(result[2], 16) / 255,
        z: parseInt(result[3], 16) / 255,
        value: hex,
      } : null;
    },
    update() {
      if (this.ikey)
        this.putData(this.ikey, this.hexToXyz(this.value))
      this.emitter.trigger('process');
    }
  },
  mounted() {
    let data = this.getData(this.ikey);
    this.x = data.x;
    this.y = data.y;
    this.z = data.z;
    this.value = data.value;
    this.title = this.caption;
  }
}

class ColControl extends Rete.Control {

  constructor(emitter, key, caption, readonly) {
    super(key);
    this.component = VueColControl;
    this.props = { emitter, ikey: key, readonly, caption };
  }
}

// --- VEC3 ---

var VueVec3Control = {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData', 'caption'],
  template: `
    <div class="control_grid"><div class="control_caption" :title="title">{{title}}</div>
    <div class="vec3ControlContainer">
      <input type="number" step=".1" lang="en" :readonly="readonly" :value="x" @input="changex($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/><br/>
      <input type="number" step=".1" lang="en" :readonly="readonly" :value="y" @input="changey($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/><br/>
      <input type="number" step=".1" lang="en" :readonly="readonly" :value="z" @input="changez($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/>
    </div>
    </div>
    `,
  data() {
    return {
      x: 0,
      y: 0,
      z: 0,
      title: "",
    }
  },
  methods: {
    changex(e){
      this.x = e.target.value;
      this.update();
    },
    changey(e){
      this.y = e.target.value;
      this.update();
    },
    changez(e){
      this.z = e.target.value;
      this.update();
    },
    update() {
      if (this.ikey)
        this.putData(this.ikey, {x: parseFloat(this.x), y: parseFloat(this.y), z: parseFloat(this.z)})
      this.emitter.trigger('process');
    }
  },
  mounted() {
    let data = this.getData(this.ikey);
    this.x = data.x;
    this.y = data.y;
    this.z = data.z;
    this.title = this.caption;
  }
}

class Vec3Control extends Rete.Control {
  constructor(emitter, key, caption, readonly) {
    super(key);
    this.component = VueVec3Control;
    this.props = { emitter, ikey: key, caption, readonly };
  }
}

// --- INLINE VEC3 ---

var VueInlineVec3Control = {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData', 'caption'],
  template: `
    <div class="control_grid"><div class="control_caption" :title="title">{{title}}</div>
    <div class="inlineVec3ControlContainer" style="display: flex">
      <input type="number" step=".1" lang="en" :readonly="readonly" :value="x" @input="changex($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/>
      <input type="number" step=".1" lang="en" :readonly="readonly" :value="y" @input="changey($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/>
      <input type="number" step=".1" lang="en" :readonly="readonly" :value="z" @input="changez($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/>
    </div>
    </div>
    `,
  data() {
    return {
      x: 0,
      y: 0,
      z: 0,
      title: "",
    }
  },
  methods: {
    changex(e){
      this.x = e.target.value;
      this.update();
    },
    changey(e){
      this.y = e.target.value;
      this.update();
    },
    changez(e){
      this.z = e.target.value;
      this.update();
    },
    update() {
      if (this.ikey)
        this.putData(this.ikey, {x: parseFloat(this.x), y: parseFloat(this.y), z: parseFloat(this.z)})
      this.emitter.trigger('process');
    }
  },
  mounted() {
    let data = this.getData(this.ikey);
    this.x = data.x;
    this.y = data.y;
    this.z = data.z;
    this.title = this.caption;
  }
}

class InlineVec3Control extends Rete.Control {
  constructor(emitter, key, caption, readonly) {
    super(key);
    this.component = VueInlineVec3Control;
    this.props = { emitter, ikey: key, readonly, caption };
  }
}


// --- BOOLEAN ---

var VueBoolControl = {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData', 'default', 'caption'],
  template: `<div class="control_grid"><div class="control_caption" :title="title">{{title}}</div><div :title="title" :class="value ? 'boolControlTrue' : 'boolControlFalse'" :readonly="readonly" @click="change()" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop="" /></div>`,
  data() {
    return {
      value: false,
      title: "",
    }
  },
  methods: {
    change(){
      this.value = !this.value;
      this.update();
    },
    update() {
      if (this.ikey)
        this.putData(this.ikey, {value: this.value})
      this.emitter.trigger('process');
    }
  },
  mounted() {
    this.value = this.default;
    this.title = this.caption;
  }
}

class BoolControl extends Rete.Control {

  constructor(emitter, key, caption, readonly) {
    super(key);
    this.component = VueBoolControl;
    this.props = { emitter, ikey: key, readonly, default: false, caption: caption };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}


// --- TEXTAREA ---

var VueTextareaControl = {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData', 'default', 'caption'],
  template: `<div class="control_grid_vertical"><div class="control_caption" :title="title">{{title}}</div>
              <textarea style="overflow: hidden" :title="title" class="controlTextarea " spellcheck="false" @keyup="e => {e.stopPropagation(); e.target.style.height = '24px'; e.target.style.height = (e.target.scrollHeight + 12).toString() + 'px'}" :value="value" @input="change($event)" :readonly="readonly" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop="" />
            </div>`,
  data() {
    return {
      value: "",
      title: "",
    }
  },
  methods: {
    change(e){
      this.value = e.target.value;
      this.update();
    },
    update() {
      if (this.ikey)
        this.putData(this.ikey, {value: this.value})
      this.emitter.trigger('process');
    }
  },
  mounted() {
    this.value = this.default;
    this.title = this.caption;
  }
}

class TextAreaControl extends Rete.Control {

  constructor(emitter, key, caption, readonly) {
    super(key);
    this.component = VueTextareaControl;
    this.props = { emitter, ikey: key, readonly, default: "4. + 3. * 2. + pow(34., 1.5)", caption: caption };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}


// --- DROPDOWN ---

var VueDropDownControl = {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData', 'caption', 'options'],
  template: `<div class="control_grid"><div class="control_caption" :title="title">{{title}}</div>
              <select :title="title" @input="change($event)" >
                <option v-for="(item, index) in items" :value="item">{{ item }}</option>
              </select>
            </div>`,
  data() {
    return {
      items: [],
      value: "",
      title: "",
    }
  },
  methods: {
    change(e){
      this.value = e.target.value;
      this.update();
    },
    update() {
      if (this.ikey)
        this.putData(this.ikey, this.value)
      this.emitter.trigger('process');
    }
  },
  mounted() {
    this.items = this.options;
    this.value = this.options[0];
    this.putData(this.ikey, this.value)
    this.title = this.caption;
  }
}

class DropDownControl extends Rete.Control {

  constructor(emitter, key, caption, options, readonly) {
    super(key);
    this.component = VueDropDownControl;
    this.props = { emitter, ikey: key, readonly, caption: caption, options };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}
