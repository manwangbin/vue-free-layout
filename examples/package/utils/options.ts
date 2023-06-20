// 页边距
export const pagePadding = [
  {
    label: '窄',
    value: '20'
  },
  {
    label: '适中',
    value: '30'
  },
  {
    label: '宽',
    value: '40'
  },
  {
    label: '自定义',
    value: null
  }
]

export const pageSize = [{
    label: 'A2',
    value: '1682,2378'
  },{
    label: 'A3',
    value: '1189,1682'
  },{
    label: 'A4',
    value: '841,1189'
  },{
    label: 'A5',
    value: '594,841'
  },
]

// export const pageSize = [{
//   label: 'A2',
//   value: '420,594'
// },{
//   label: 'A3',
//   value: '297,420'
// },{
//   label: 'A4',
//   value: '210,297'
// },{
//   label: 'A5',
//   value: '148,210'
// },
// ]


// 布局
export const layoutOpt = [
  {
    label: '名称在上',
    value: 'column',
  },{
    label: '名称在左',
    value: 'row'
  }
]

// 图片填充模式
export const imgFit = [
  {
    label: 'fill',
    value: 'fill',
  },{
    label: 'contain',
    value: 'contain',
  },{
    label: 'cover',
    value: 'cover',
  },{
    label: 'none',
    value: 'none',
  },{
    label: 'scale-down',
    value: 'scale-down',
  }
]

// 字体样式
export const fontFamily = [
  {
    label: '楷体',
    value: 'KaiTi'
  },{
    label: '华文黑体',
    value: 'STHeiti'
  },{
    label: '华文楷体',
    value: 'STKaiti'
  },{
    label: '华文宋体',
    value: 'STSong'
  }
]

// 字体大小
export const fontSize = [
  {
    label: '12',
    value: '12px'
  },
  {
    label: '14',
    value: '14px'
  },
  {
    label: '16',
    value: '16px'
  },
  {
    label: '18',
    value: '18px'
  },
  {
    label: '20',
    value: '20px'
  },
  {
    label: '22',
    value: '22px'
  },
  {
    label: '24',
    value: '24px'
  },
  {
    label: '26',
    value: '26px'
  },
  {
    label: '28',
    value: '28px'
  },
  {
    label: '30',
    value: '30px'
  },
]

// 字体装饰（加粗、倾斜、下划线、删除线）
export const textStyle = [
  {
    label: '加粗',
    html: '<svg t="1686626298581" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2380" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16"><path d="M311.296 460.8h266.24c59.392 0 108.544-49.152 108.544-108.544s-49.152-108.544-108.544-108.544h-266.24V460.8z m-30.72-296.96h296.96C681.984 163.84 768 247.808 768 354.304c0 55.296-22.528 104.448-61.44 139.264 55.296 34.816 92.16 98.304 92.16 167.936 0 110.592-90.112 198.656-198.656 198.656h-368.64V163.84h49.152z m30.72 614.4h286.72c65.536 0 116.736-53.248 116.736-116.736s-53.248-116.736-116.736-116.736h-286.72V778.24z" p-id="2381"></path></svg>',
    style: {
      fontWeight: 500
    },
    value: 'block'
  },{
    label: '倾斜',
    html: '<svg t="1686626520029" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3062" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16"><path d="M640 853.333333H298.666667v-85.333333h124.885333l90.282667-512H384V170.666667h341.333333v85.333333h-124.885333l-90.282667 512H640v85.333333z" p-id="3063"></path></svg>',
    style: {
      fontStyle: 'italic'
    },
    value: 'slanting'
  },{
    label: '下划线',
    html: '<svg t="1686626701631" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3894" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16"><path d="M512 811.296a312 312 0 0 0 312-312V89.6h-112v409.696a200 200 0 1 1-400 0V89.6h-112v409.696a312 312 0 0 0 312 312zM864 885.792H160a32 32 0 0 0 0 64h704a32 32 0 0 0 0-64z" p-id="3895"></path></svg>',
    style: {
      textDecoration: 'underline'
    },
    value: 'underline'
  }
]

// 边框类型
export const borderType = [
  {
    label: '实线',
    value: 'solid',
  },{
    label: '虚线',
    value: 'dashed'
  },{
    label: '双实线',
    value: 'double'
  },{
    label: '立体',
    value:'ridge'
  }
]
