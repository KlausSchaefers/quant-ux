import Vue from "vue";

export function  $new(cls, params) {
  var ComponentClass = Vue.extend(cls);
  var instance = new ComponentClass();
  for (let key in params){
    instance[key] = params[key]
  }
  /**
   * FIMXE: pass here some how the NLS stuff
   */
  instance.$mount(); // pass nothing
  return instance;
}