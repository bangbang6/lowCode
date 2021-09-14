import { ElButton, ElInput } from 'element-plus'
function createComponentConfig(){
  const componentList = []
  const componentMap = {}
  return {
    componentList,
    componentMap,
    register:(component)=>{
      componentMap[component.key] = component
      componentList.push(component)
    }
  }
}
export let componentConfig = createComponentConfig()
 
componentConfig.register({
  key:'text',
  label:'文本',
  preview:()=>'预览文本',
  render:()=>'预览文本',
})
componentConfig.register({
  key:'input',
  label:'输入框',
  preview:()=><ElInput placeholder='预览输入框'></ElInput>,
  render:()=><ElInput placeholder='渲染输入框'></ElInput>
})
componentConfig.register({
  key:'button',
  label:'按钮',
  preview:()=><ElButton>预览按钮</ElButton>,
  render:()=><ElButton>渲染按钮</ElButton>
})
