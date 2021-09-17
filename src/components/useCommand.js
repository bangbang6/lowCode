import deepcopy from 'deepcopy'
import { events } from './event';
import {onUnmounted} from 'vue'
export function useCommand(blocks){
  const state = {
    current:-1, //前进后退的指针
    queue:[],//存放操作的命令 比如drag和move 没有redo redo是操作队列指针的
    commands:{},//指令和功能的对应表
    commandArray:[],//存放所有的命令 drag move redo undo都是命令
    destoryList:[]
  }
  const register = (command)=>{
    state.commandArray.push(command)
    state.commands[command.name] = ()=>{ //!事件执行的函数 
      const {redo,undo} = command.execute()
      redo()
      if(!command.enterQueue){
        return
      }
      //下面是drag执行的逻辑 queue里面都是drag的redo和undo 当新增元素的时候 我们要把之前撤销的都清空 如果不是新增元素 那么不要清空 因为用户可能前进那些清空的就有用 如果是新增的那么那些前进应该也是前进到这个新的新增元素中
      if(state.queue.length>0){
        state.queue = state.queue.slice(0,state.current+1)
      }
      state.queue.push({
        redo:redo,
        undo:undo
      })
      state.current =state.current+1
    }
  }
  register({
    name:"redo",
    keyboard:'ctrl+y',
    execute(){
      return {
        redo(){

          let item =  state.queue[state.current + 1]
          if(item){
            item.redo && item.redo()
            state.current = state.current+1
          }
        }
      }
    }
  })
  register({
    name:"undo",
    keyboard:'ctrl+z',
    execute(){
      return {
        redo(){

          if (state.current == -1) return; // 没有可以撤销的了
          let item =  state.queue[state.current]
          if(item){
            item.undo && item.undo()
            state.current--
          }
        }
      }
    }
  })
  register({
    name:'drag',
    enterQueue:true,
    init(){
      this.before = null
      let start = ()=>{
        this.before = deepcopy(blocks.value)
      }
      let end = ()=>{
        state.commands.drag()
      }
      events.on('start',start)
      events.on('end',end)
      return ()=>{
        events.off('start')
        events.off('end')
      }
    },
    execute(){
      let before = this.before
      let after = deepcopy(blocks.value)
      return{
        redo(){
          console.log('after',after[0].left);
          blocks.value = [...after] //默认用最新的状态
          
        },
        undo(){
          blocks.value = [...before] //用之前的状态
          
        }
      }
    }
  });

  const keyboard = (()=>{
    const keyCodes = {
      90:'z',
      89:'y'
    }
    const onKeydown = (e)=>{
     
      const {ctrlKey,keyCode} = e
      let keys = []
      if(ctrlKey){
        keys.push('ctrl')
      }
      if(keyCodes[keyCode]){
        keys.push(keyCodes[keyCode])
      }
      keys = keys.join('+')
      
      state.commandArray.forEach(({keyboard,name})=>{
        if(!keyboard) return

        if(keyboard === keys){
          console.log('name',name);
          state.commands[name]()
          e.preventDefault()
        }
      })
    }
    const init= ()=>{
      window.addEventListener('keydown',onKeydown)
      return ()=>{
        window.removeEventListener('keydown',onKeydown)
      }
    }
    return init
  })();
  ;(()=>{
    state.destoryList.push(keyboard())
    state.commandArray.forEach(command=>command.init && state.destoryList.push(command.init()))
  })();
 
  
  onUnmounted(()=>{
    state.destoryList.forEach((fn)=>fn&&fn())
  })
  return state
}