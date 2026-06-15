// ============================================================
//  lib/steps-config.ts
//  步驟設定檔 — 只定義 UI 結構，不含任何提示詞邏輯
// ============================================================

export type FieldType =
  | 'text'
  | 'textarea'
  | 'agepair'
  | 'checkbox_with_other'
  | 'chips_with_custom'
  | 'chips'

export interface Field {
  id: string
  label: string
  hint?: string
  type: FieldType
  ph?: string
  chips?: string[]
  options?: string[]
  customId?: string
  customLabel?: string
  customPh?: string
  otherId?: string
  otherPh?: string
}

export interface Section {
  title: string
  fields: Field[]
}

export interface StepConfig {
  id: string
  label: string
  title: string
  desc: string
  type: 'info' | 'form'
  promptIdx: number
  infoMsg?: string
  sections: Section[]
}

export const STEPS_CONFIG: StepConfig[] = [
  {
    id: 'role', label: '角色定位',
    title: '角色定位', desc: '自訂 AI 的身份角色與服務範圍，填完後複製提示詞貼入 AI 工具',
    type: 'form', promptIdx: 0,
    infoMsg: '填完後複製下方提示詞，貼到 ChatGPT 或 Claude，等它回覆 <strong>【OK】</strong> 後再進行下一步。',
    sections: [
      { title: '設定 AI 角色', fields: [
        { id: 'roleType', label: 'AI 的身份', hint: '自訂職業或專業角色', type: 'text', ph: '例：品牌顧問、行銷策略師、商業顧問…' },
        { id: 'taskList', label: '協助我做的事項', hint: '可填多項，用頓號分隔', type: 'text', ph: '例：品牌規劃、商品行銷、商品企劃…' },
      ]},
    ],
  },
  {
    id: 'myinfo', label: '我的資訊',
    title: '我的資訊', desc: '填寫你的基本資料，下方提示詞會即時更新',
    type: 'form', promptIdx: 1,
    sections: [
      { title: '本人資料', fields: [
        { id: 'profession', label: '我的職業',      type: 'text',     ph: '例：生成式AI講師' },
        { id: 'expertise',  label: '我的專業',      type: 'text',     ph: '例：各種生成式AI工具應用' },
        { id: 'products',   label: '我的產品及服務', type: 'text',     ph: '例：生成式AI企業內訓課程' },
      ]},
      { title: '目標客群', fields: [
        { id: 'gender',    label: '客戶性別',       type: 'text',     ph: '例：男女皆有' },
        { id: '_age',      label: '客戶年齡區間',    type: 'agepair' },
        { id: 'clientJob', label: '客戶職業',       type: 'text',     ph: '例：中小企業主、新創業者' },
        { id: 'region',    label: '客戶所在地區',    type: 'text',     ph: '例：全台灣' },
        { id: 'diff',      label: '我與同業的差異',  type: 'textarea', ph: '例：擅長整合AI工具並依照各行業類別實體教授課程' },
        { id: 'painPoint', label: '客戶的痛點',     type: 'textarea', ph: '例：市面上的AI課程皆是講解理論，很少針對各行業分類教授' },
      ]},
      { title: '商業模式', fields: [
        { id: 'monetize', label: '希望能變現的方式', hint: '可複選',
          type: 'checkbox_with_other',
          options: ['知識付費','諮詢付費','課程銷售','廣告收入','代理合作','實體活動','訂閱制'],
          otherId: 'monetizeOther', otherPh: '其他（自訂填寫）' },
        { id: 'value', label: '我的產品可以解決客戶什麼問題', type: 'textarea',
          ph: '例：整合AI工具，針對各行業分門教授，省去搜尋測試時間，大幅降低學習成本' },
      ]},
    ],
  },
  {
    id: 'potential', label: '潛在客戶',
    title: '潛在客戶', desc: '請 AI 幫你找出 5 個潛在客群',
    type: 'info', promptIdx: 2,
    infoMsg: '複製提示詞，接續貼到 AI 對話中。AI 回覆後，從 5 個潛在客群中選一個填入下一步。',
    sections: [],
  },
  {
    id: 'decision', label: '客戶決策',
    title: '客戶決策心理', desc: '選定一個潛在客群，深入了解他的決策邏輯',
    type: 'form', promptIdx: 3,
    sections: [
      { title: '填入 AI 建議的客群', fields: [
        { id: 'targetGroup', label: '從第三步 AI 給的 5 個潛在客群，選一個填入', type: 'text', ph: '例：45歲以上的傳統製造業二代接班人' },
      ]},
    ],
  },
  {
    id: 'diff', label: '差異化',
    title: '差異化策略', desc: '找出 5 種讓客戶選你而非競爭者的方法',
    type: 'info', promptIdx: 4,
    infoMsg: '直接複製提示詞繼續貼給 AI，不需額外填寫。',
    sections: [],
  },
  {
    id: 'adtitle', label: '廣告標題',
    title: '廣告標題生成', desc: '讓 AI 撰寫 10 句廣告宣傳標題',
    type: 'form', promptIdx: 5,
    sections: [
      { title: '廣告語氣風格', fields: [
        { id: 'adStyle', label: '語氣風格', type: 'chips_with_custom',
          chips: ['趣味幽默','專業權威','溫暖親切','激勵鼓舞','簡潔有力','故事感'],
          customId: 'adStyleCustom', customLabel: '自訂語氣風格描述', customPh: '例：融合科技感與人情味，敘述式語氣' },
      ]},
    ],
  },
  {
    id: 'fbpost', label: 'FB貼文',
    title: 'Facebook 貼文', desc: '選定一句廣告標題，生成完整社群貼文',
    type: 'form', promptIdx: 6,
    sections: [
      { title: '填入選定的廣告標題', fields: [
        { id: 'adTitle', label: '從第六步 AI 給的 10 句標題中，選一句填入', type: 'text', ph: '例：不懂程式也能開發 App？AI 讓這件事變成現實' },
      ]},
    ],
  },
  {
    id: 'naming', label: '品牌命名',
    title: '品牌命名提案', desc: '請 AI 為你提案 10 個品牌名稱',
    type: 'info', promptIdx: 7,
    infoMsg: 'AI 根據前面所有資料自動生成，直接複製貼給 AI 即可。AI 回覆後，選你最喜歡的一個填入下一步。',
    sections: [],
  },
  {
    id: 'vision', label: '願景聲明',
    title: '品牌願景聲明', desc: '選定品牌名稱，撰寫品牌願景與核心價值',
    type: 'form', promptIdx: 8,
    sections: [
      { title: '填入選定的品牌名稱', fields: [
        { id: 'brandName', label: '從第八步 AI 給的 10 個品牌名稱中，選一個填入', type: 'text', ph: '例：智策學院、AIBoost 品牌加速器' },
      ]},
    ],
  },
  {
    id: 'logo', label: 'LOGO提示',
    title: 'LOGO 設計提示詞', desc: '生成符合你所選工具語法特性的 LOGO 提示詞',
    type: 'form', promptIdx: 9,
    sections: [
      { title: 'LOGO 設計偏好', fields: [
        { id: 'logoStyle', label: 'LOGO 風格', type: 'chips_with_custom',
          chips: ['極度簡約','科技感','有機自然','幾何現代','手繪溫暖','奢華精緻'],
          customId: 'logoStyleCustom', customLabel: '自訂風格描述', customPh: '例：極簡幾何，帶有羽翼意象，金色系' },
        { id: 'logoTool', label: '你使用的生成工具', hint: '提示詞會依據此工具的語法自動最佳化',
          type: 'text', ph: '例：Midjourney、DALL·E 3、Ideogram、Gemini Imagen…' },
      ]},
    ],
  },
]
