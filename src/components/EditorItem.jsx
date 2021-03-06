import { defineComponent,computed,inject,ref,onMounted } from "vue";

export default defineComponent({
  props:{
    block:{type:Object},
    index:{type:Number},
  },
  emits:['clearFocus','changeIndex'],
  setup(props,ctx){
    const {index,blockIndex} = props
    const componentConfig = inject('componentConfig') //!vue3后Provide和Inject的数也是响应式的啦
    let blockRef = ref(null)
    onMounted(()=>{
      let {offsetWidth,offsetHeight} = blockRef.value
      if (props.block.alignCenter) { // 说明是拖拽松手的时候才渲染的，其他的默认渲染到页面上的内容不需要居中
        props.block.left = props.block.left - offsetWidth / 2;
        props.block.top = props.block.top - offsetHeight / 2; // 原则上重新派发事件
        props.block.alignCenter = false; // 让渲染后的结果才能去居中
     
    }
      props.block.width = offsetWidth
      props.block.height = offsetHeight
    })
    const style = computed(()=>{
      return {
        top: `${props.block.top}px`,
        left: `${props.block.left}px`,
        zIndex: `${props.block.zIndex}`
      }
    })
    
    let monseDown = (e)=>{
      e.preventDefault()
      if(e.shiftKey){
        
        if(!props.block.focus){
          ctx.emit('changeIndex',index)
          props.block.focus = true
        }
      }else{
        if(!props.block.focus){
          ctx.emit('clearFocus') //先秦楚所有的focus状态
          props.block.focus = true
          ctx.emit('changeIndex',index)
          
        }
      }
    }
  
    const render = componentConfig.componentMap[props.block.key].render
    return ()=>(
      <div class={`editor-block  ${props.block.focus?'focus':''}`} style={style.value} ref={blockRef} onmousedown={monseDown} >
        {render()}
      </div>
    )
  }
})