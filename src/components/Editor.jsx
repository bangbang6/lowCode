import { defineComponent,computed,ref } from "vue";
import './editor.scss'
import EditorItem from "./EditorItem";
import Menu from "./Menu";
export default defineComponent({  //!defineComponent才能用Jsx
   props:{
    modelValue:Object
   },
    emits:['update:modelValue'],
    components:{
      EditorItem,
      Menu
    },
    setup(props,ctx){
      const blocks = computed({
        get:()=>{
          return props.modelValue
        },
        set:(blocks)=>{
          ctx.emit('update:modelValue',blocks)
        }
      })
      let addBlock = (newBlock)=>{
        blocks.value.push(newBlock)
      }
    
      const containerRef = ref(null)
      const  focusBlocks = computed(()=>{
        return blocks.value.filter(block=>block.focus)
      })
      //记录鼠标的位置 而不是block的位置
      let dragState = {
        startX:0,
        startY:0
      }

      const mouseup = (e) => {
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup)
    }
    const mousemove = (e) => {
      let {clientX:nowX,clientY:nowY} = e
      let durX = nowX - dragState.startX //记录鼠标移动的距离
      let durY = nowY - dragState.startY //记录鼠标移动的距离
      focusBlocks.value.forEach((block,idx)=>{
        block.top = dragState.focusPos[idx].top+durY
        block.left = dragState.focusPos[idx].left+durX
      })
  }
      
      let containerMousedown = (e)=>{
        dragState = {
          startX:e.clientX,//鼠标的x位置
          startY:e.clientY,//鼠标的y位置
          focusPos:focusBlocks.value.map(({top,left})=>({top,left})) //blovks的初始位置
        }
        document.addEventListener('mousemove',mousemove)
        document.addEventListener('mouseup',mouseup)
      }
      
      return ()=><div class='editor'>
        <div className="editor-left">
          <Menu containerRef={containerRef} onAddBlock={addBlock}></Menu>
        </div>
        <div className="editor-top">菜单栏</div>
        <div className="editor-right">属性控制栏</div>
        <div className="editor-container" ref={containerRef}>
          <div className="editor-container-canvas">
            <div className="editor-container-canvas__content" onmousedown={containerMousedown}> 
              {
                blocks.value.map((block)=>(<EditorItem block={block} onClearFocus={e=>{
                  blocks.value.forEach(block=>{
                    if(block.focus) block.focus = false
                  })
                }}></EditorItem> ))
              }
            </div>
          </div>
        </div>
      </div>
    }
})