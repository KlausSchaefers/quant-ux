import CoreUtil from '../CoreUtil'
import JSONPath from '../JSONPath'

export function getNPMTemplate (){
  return 'npm i luisa-vue@3'
}

export function getRouterTemplate () {
  return `import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "about" */ '../views/Home.vue')
  },
  {
    path: '/:screenName.html',
    name: 'qux',
    component: () => import(/* webpackChunkName: "about" */ '../views/Home.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
`
}

export function getMainTemplate(hash, model) {


  let viewModel = {}
  let methods = ''
  let dataBindingPaths = []

  Object.values(model.widgets).forEach(widget => {
    console.debug(widget.name, CoreUtil.getDataBinding(widget))
    let dataBinding = CoreUtil.getDataBinding(widget)
    if (dataBinding) {
      Object.values(dataBinding).forEach(path => {
        dataBindingPaths.push(path)
      })
    }
    let callbacks = CoreUtil.getCallbacks(widget)
    if (callbacks) {
      Object.values(callbacks).forEach(callback => {
        if (callback && callback.length > 0) {
          methods += `    ${callback} () {\n`
          methods += `    },\n`
        }
      })
    }
  })
  dataBindingPaths.sort((a, b) => {
    return a.localeCompare(b)
  })
  dataBindingPaths.forEach(path => {
    JSONPath.set(viewModel, path, '')
  })
  viewModel = stringify(viewModel)

  methods = methods.substring(0, methods.length-2)


  return `<template>
  <div class="">
    <Luisa design="${hash}" v-model="viewModel"/>
  </div>
</template>

<script>
import Vue from 'vue';
import Luisa from 'luisa-vue'
Vue.use(Luisa);
// more documentation can be found at https://luias.could

export default {
  name: '${model.name}',
  data: function () {
    return {
      viewModel: {
${viewModel}
      }
    }
  },
  components: {
  },
  methods: {
${methods}
  }
}
</script>
`
}

function stringify(obj, space='        ') {
  let lines = []
  for (let key in obj) {
    let value = obj[key]
    if (value === '') {
      lines.push(`${space}${key}: '',`)
    } else {
      lines.push(`${space}${key}: {`)
      lines.push(stringify(value, space + '  '))
      lines.push(`${space}},`)
    }
  }

  return lines.join('\n')
}