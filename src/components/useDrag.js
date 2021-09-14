export default function(container,callback){
  
    
    
  let currentCmp = null
  const dragenter = (e)=>{
    e.dataTransfer.dropEffect= 'move'
  }
  const dragover = (e) => {
    e.preventDefault();
}
const dragleave = (e) => {
    e.dataTransfer.dropEffect = 'none';
}

const drop = (e)=>{

  let newBlock= {
    key:currentCmp.key,
    zIndex:1,
    left:e.offsetX, //要让他居中
    top:e.offsetY,
    alignCenter:true
  }
  callback(newBlock)
  
}
  let dragStart = (e,cmp)=>{
    currentCmp = cmp
    container.value.addEventListener('dragenter',dragenter)
    container.value.addEventListener('dragover',dragover)
    container.value.addEventListener('dragleave',dragleave)
    container.value.addEventListener('drop',drop)
  }
  let dragend = (e)=>{
    currentCmp = null
    container.value.removeEventListener('dragenter',dragenter)
    container.value.removeEventListener('dragover',dragover)
    container.value.removeEventListener('dragleave',dragleave)
    container.value.removeEventListener('drop',drop)
  }
  return {
    dragStart,
    dragend
  }
}