// ============================================================
//  lib/types.ts — 共用型別
// ============================================================

export interface FormData {
  roleType: string
  taskList: string
  profession: string
  expertise: string
  products: string
  gender: string
  ageMin: string
  ageMax: string
  clientJob: string
  region: string
  diff: string
  painPoint: string
  monetize: string[]
  monetizeOther: string
  value: string
  targetGroup: string
  adStyle: string
  adStyleCustom: string
  adTitle: string
  brandName: string
  logoStyle: string
  logoStyleCustom: string
  logoTool: string
}

export const DEFAULT_FORM_DATA: FormData = {
  roleType: '', taskList: '',
  profession: '', expertise: '', products: '',
  gender: '男女皆有', ageMin: '', ageMax: '',
  clientJob: '', region: '全台灣',
  diff: '', painPoint: '',
  monetize: [], monetizeOther: '', value: '',
  targetGroup: '',
  adStyle: '', adStyleCustom: '',
  adTitle: '',
  brandName: '',
  logoStyle: '', logoStyleCustom: '',
  logoTool: '',
}
