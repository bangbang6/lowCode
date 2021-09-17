import { defineComponent,computed,ref,reactive } from "vue";
import './editor.scss'
import EditorItem from "./EditorItem";
import Menu from "./Menu";
import { useCommand } from './useCommand';
import { events } from './event';
import deepcopy from 'deepcopy'

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
          ctx.emit('update:modelValue',deepcopy(blocks))
        }
      })
      const clear = (e)=>{
        blocks.value.forEach(block=>{
          if(block.focus) block.focus = false
        })
        markline.x = null
        markline.y = null
      }
      let addBlock = (newBlock)=>{
        blocks.value.push(newBlock)
      }
      
      const containerRef = ref(null)
      const blockIndex= ref(-1)

      const lastBlock = ref(null)
      const  focusBlocks = computed(()=>{
        return blocks.value.filter(block=>block.focus)
      })
      const unfocusBlocks = computed(()=>{
        return blocks.value.filter(block=>!block.focus)
      })
      //记录鼠标的位置 而不是block的位置
      let dragState = {
        startX:0,
        startY:0,
        draging:false
      }

    const mouseup = (e) => {
      if(dragState.draging){
        dragState.draging = false
        events.emit('end')
      }
     

        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup)
    }
    let markline= reactive({
      x:null,
      y:null
    })
    const mousemove = (e) => {
      if(!dragState.draging){
        dragState.draging = true
      events.emit('start')

      }
      if(focusBlocks.value.length === 0) return
      let {clientX:nowX,clientY:nowY} = e
      //console.log('dragState',dragState);
      
      //记录下最后那个元素的现在的位置
      let left = nowX - dragState.startX + dragState.startLeft;
      let top = nowY - dragState.startY+ dragState.startTop;
      
      let x = null
      let y = null
      //去比对所有的线
      for(let i = 0;i<dragState.lines.y.length;i++){
        const {top:t,showTop:st} = dragState.lines.y[i]
      

        if(Math.abs(t-top)<10){
          y = st
          nowY = dragState.startY - dragState.startTop + t; // 容器距离顶部的距离 + 目标的高度 就是最新的moveY
          break;
        }
      }
      for (let i = 0; i < dragState.lines.x.length; i++) {
        const { left: l, showLeft: s } = dragState.lines.x[i]; // 获取每一根线
        if (Math.abs(l - left) < 10) { // 如果小于五说明接近了 
            x = s; // 线要现实的位置
            nowX = dragState.startX - dragState.startLeft + l; // 容器距离顶部的距离 + 目标的高度 就是最新的moveY
            // 实现快速和这个元素贴在一起
            break; // 找到一根线后就跳出循环
        }
    }
    markline.x = x
    markline.y = y
   
      let durX = nowX - dragState.startX //记录鼠标移动的距离
      let durY = nowY - dragState.startY //记录鼠标移动的距离
      focusBlocks.value.forEach((block,idx)=>{
        block.top = dragState.focusPos[idx].top+durY
        block.left = dragState.focusPos[idx].left+durX
      })
    }
    const changeIndex = (index)=>{
      blockIndex.value = index
      lastBlock.value = blocks.value[index]
    }
      //!注意这里的移动不是根据移动品的初始位置和现在位置来移动 而是根据鼠标位置的初始位置和移动位置算出偏移量然后让移動物品去移動 因为有很多移動物品
      let containerMousedown = (e)=>{
        
       dragState = {
          startX:e.clientX,//鼠标的x位置
          startY:e.clientY,//鼠标的y位置
          startLeft:lastBlock.value.left,
          startTop:lastBlock.value.top,
          draging:false,

          focusPos:focusBlocks.value.map(({top,left})=>({top,left})), //blovks的初始位置
          lines: (() => {
            const { width: BWidth, height: BHeight } = lastBlock.value; // 拖拽的最后的元素
            let lines = { x: [], y: [] }; // 计算横线的位置用y来存放  x存的是纵向的

            unfocusBlocks.value.forEach((block) => {
                const { top: ATop, left: ALeft, width: AWidth, height: AHeight } = block;
                // 当此元素拖拽到和A元素top一致的时候，要显示这根辅助线，辅助线的位置就是ATop
                lines.y.push({ showTop: ATop, top: ATop });
                lines.y.push({ showTop: ATop, top: ATop - BHeight }); // 顶对底
                lines.y.push({ showTop: ATop + AHeight / 2, top: ATop + AHeight / 2 - BHeight / 2 }); // 中对中
                lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight }); // 底对顶
                lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight - BHeight }); // 底对底

                lines.x.push({ showLeft: ALeft, left: ALeft }); // 左对左边
                lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth }); // 右边对左边
                lines.x.push({ showLeft: ALeft + AWidth / 2, left: ALeft + AWidth / 2 - BWidth / 2 })
                lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth - BWidth })
                lines.x.push({ showLeft: ALeft, left: ALeft - BWidth }) // 左对右
            });
            return lines
        })()
        }
        document.addEventListener('mousemove',mousemove)
        document.addEventListener('mouseup',mouseup)
      }
      const commands = useCommand(blocks)
      const buttons = [
        {
          label:'撤销',icon:'icon-back',handler:()=>{commands.commands['undo']()}
        },
        {
          label:'重做',icon:'icon-forward',handler:()=>{commands.commands['redo']()}
        },
        {
          label:'取消选中',icon:'icon-reset',handler:e=>clear(e)
        },
      ]
      return ()=><div class='editor'>
        <div className="editor-left">
          <Menu containerRef={containerRef} onAddBlock={addBlock}></Menu>
        </div>
        <div className="editor-top">
          {
            buttons.map((btn)=>{
              return <div class='editor-top-button' onClick={btn.handler}>
                <i class={btn.icon}></i>
                <span>{btn.label}</span>
              </div>
            })
          }
        </div>
        <div className="editor-right">属性控制栏</div>
        <div className="editor-container" ref={containerRef}>
          <div className="editor-container-canvas">
            <div className="editor-container-canvas__content" onmousedown={containerMousedown} > 
              {
                blocks.value.map((block,index)=>(<EditorItem block={block} index={index}  onChangeIndex= {changeIndex} onClearFocus={e=>{
                  blocks.value.forEach(block=>{
                    if(block.focus) block.focus = false
                  })
                }}></EditorItem> ))
              }
               {
                  markline.x !== null && <div class="line-x" style={{ left: markline.x + 'px' }}></div>
                
                }
                {markline.y !== null && <div class="line-y" style={{ top: markline.y + 'px' }}></div>}
 
            </div>
          </div>
        </div>
      </div>
    }
})