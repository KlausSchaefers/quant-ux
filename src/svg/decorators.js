import { createDecorator } from 'vue-class-component'


export const Value = createDecorator((options, key) => {
  const originalMethod = options.methods[key]

  options.methods[key] = function wrapperMethod(...args) {
    console.debug('key')
    originalMethod.apply(this, args)
  }
})