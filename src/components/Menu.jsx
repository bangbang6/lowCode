import { defineComponent,inject } from "vue";
import useDrag from "./useDrag";

export default defineComponent({
  props:{
    containerRef:Object,
    blockRef:Object
  },
  emits:['addBlock'],
  setup(props,ctx){
    const {componentList} = inject('componentConfig')
    const container = props.containerRef
    
    const {dragStart,dragend} = useDrag(container,(newBlock)=>{
      ctx.emit('addBlock',newBlock)
    })
   
    return ()=>(
      <div class='editor-menu'>
        {componentList.map((cmp)=>{
          
          return <div class='editor-menu-item' draggable onDragstart={e=>dragStart(e,cmp)} onDragend={dragend}>
            <span class= 'editor-menu-item-label'>{cmp.label}</span>
            <div class= 'editor-menu-item-content'>{cmp.render()}</div>
          </div>
        })}
      </div>
    )
      
    
  }
})