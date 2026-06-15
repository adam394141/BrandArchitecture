// ============================================================
//  /app/api/prompt/route.ts
//  所有提示詞邏輯集中在這裡，前端永遠看不到內容
//  POST { stepIndex: number, formData: FormData }
//  → { prompt: string }
// ============================================================

import { NextRequest, NextResponse } from 'next/server'

// ── 解碼工具（伺服器端執行，瀏覽器看不到原始字串）──
const d = (s: string): string => Buffer.from(s, 'base64').toString('utf8')

// ── 提示詞片段 ──
const T = {
  q0p1: '5L2g5piv5LiA5L2N5bCI5qWt55qE',
  q0p2: '77yM6KuL5Y2U5Yqp5oiR5YGa',
  q0p3: '77yM5oiR5pyD5oqK5oiR55qE5Z+65pys6LOH5paZ57Wm5oKo77yM6KuL5L2g6Zax6K6A5a6M55Wi6Yed5bCN5oiR55qE5YCL5Lq65ZOB54mM5bmr5oiR5YGa5a6M5pW055qE5ZOB54mM5a6a5L2N5Y+K6KaP5YqD77yM5L2g5Y+q6KaB6K6A5Y+W6LOH6KiK5Y2z5Y+v77yM5pqr5pmC5LiN6KaB5YGa5Lu75L2V5Zue6KaG77yM5Lul5LiL5omA5pyJ5Zue6KaG5YWn5a655L2g5b+F6aCI5L2/55So57mB6auU5Lit5paH5Zue6KaG5oiR77yM6Iul5piO55m95oiR55qE5oSP5oCd6KuL5Zue6KaG44CQT0vjgJHjgII=',
  q2a: '5Lul44CM',
  q2b: '44CN54K65L6L77yM6KuL5o+Q5L6b5oiR6Zmk5LqG5LmL5YmN5omA6Kit5a6a55qE55uu5qiZ5a6i576k5aSW77yM5YaN57Wm5oiRIDUg5YCL5r2b5Zyo5a6i576k44CCCuavj+WAi+ebruaomeWuoue+pOmDveaHieipsuips+e0sOaPj+i/sO+8jOaPkOS+m+ebuOmXnOeahOS6uuWPo+e1seioiOeJueW+te+8iOS+i+WmguW5tOm9oeOAgeaAp+WIpeOAgeWcsOm7nu+8ieS7peWPiuS7u+S9leWFtuS7luWPr+iDveW9semfv+S7luWAkeWwjeW7o+WRiuaOpeWPl+aAp+eahOWboOe0oOOAggrkuKboq4vop6Pph4vkvaDmiYDmj5Dkvpvmr4/lgIvnm67mqJnlrqLnvqToiIfmj5DkvpvnmoTpl5zpjbXoqZ7kuYvplpPnmoTpl5zkv4LvvIzku6Xlj4rku5blgJHlj6/og73lsI3miJHmiYDlrqPlgrPnmoTnlKLlk4HmiJbmnI3li5nmhJ/oiIjotqPnmoTljp/lm6DjgIIK5q2k5aSW77yM5L2g55qE5Zue562U5oeJ6Kmy5o+Q5L6b5Z+65pa85Y+w54Gj5biC5aC056CU56m25pW45pOa5oiW5a6i5oi25Y+N6aWL55qE6Kqq5piO77yM5YGa54K65L2g5Zue562U6Kmy55uu5qiZ5a6i576k55qE55CG55Sx44CC',
  q3a: '5qC55pOa5LiK6L+w5L2g55qE5Zue562U77yM6Yed5bCN44CM',
  q3b: '44CN5a6i576k5oyR6YG444CM',
  q3c: '44CN55qE5qiZ5rqW5pyJ5ZOq5Lqb77yfCuiri+WFt+mrlOaPj+i/sOW/g+eQhuaAneiAg+mBjueoi+iIh+axuuetlua1geeoi++8jOS4puWYl+ippueUqOS7luWAkeeahOWPo+WQu+ihqOmBlOOAgg==',
  q4a: '5qC55pOa5LiK6L+w5L2g55qE5Zue562U77yM5oiR55qE44CM',
  q4b: '44CN5Y+v5Lul5o6h5Y+W5ZOqIDUg56iu5pyJ5pWI55qE5YGa5rOV77yM5bGV54++6Ieq6Lqr5ZOB54mM6IiH5ZCM6KGM55qE5beu55Ww5YyW77yM5Lul5Y+K5aKe5Yqg5LiK6L+w5a6i576k5oyR6YG45oiR5L6G5pyN5YuZ55qE5oSP6aGY77yf',
  q5a: '5qC55pOa5LiK6L+w5L2g55qE5Zue562U77yM6KuL5pKw5a+rIDEwIOWPpeW7o+WRiuWuo+WCs+aomemhjO+8jOS7pemBlOWIsOS4iui/sOaViOaenOOAguaSsOWvq+aZguiri+eUqOWFhea7vw==',
  q5b: '5LiU5aSa5qij5YyW55qE5Y+l5Z6L5pKw5a+r77yM5ZCM5qij5Y+l5Z6L57WQ5qeL5LiN6LaF6YGOIDEg5qyh5Lul5LiK44CC',
  q6a: '5qC55pOa5LiK6L+w5L2g55qE5Zue562U77yM44CM',
  q6b: '44CN6YCZ5YCL5qiZ6aGM77yM6KuL5bmr5oiR5a+r5LiA56+HIDMwMO+9njQwMCDlrZcgRmFjZWJvb2sg6LK85paH77yM5qC55pOa5bmz5Y+w54m55oCn6Kit6KiI6LK85paH5YWn5a655paH5qGI77yM5pyA5b6M6KuL56K65L+d6Kqe5rCj44CB5a2X5pW46IiH5LqS5YuV5YWD57Sg56ym5ZCI5bmz5Y+w54m55oCn44CC',
  q7:  '5qC55pOa5LiK6L+w5L2g55qE5Zue562U77yM5oiR5biM5pyb5Zyo6LKp5ZSu5oiR55qE55Si5ZOB5oiW5pyN5YuZ5pmC77yM5a6i5oi25pyD5bCN5oiR5pu05pyN5Y2w6LGh77yM5omA5Lul5oiR5oOz6KaB5oiQ56uL5oiR6Ieq5bex55qE5ZOB54mM77yM6KuL54K65LiK6L+w5omA5pyJ5ZGI54++55qE5Li76KaB5a6i576k5L2c55u46Zec55qE5pyN5YuZ77yM6KuL5oKo5bmr5oiR6KaP5YqDIDEwIOWAi+OAjOWTgeeJjOWQjeeoseOAjeOAgg==',
  q8a: '5qC55pOa5LiK6L+w5L2g55qE5Zue562U77yM5oiR5Zac5q2h44CM',
  q8b: '44CN6YCZ5YCL5ZOB54mM5ZCN56ix77yM6KuL5oKo5bmr5oiR5pKw5a+r5LiA5Lu95bGs5pa844CM',
  q8c: '44CN55qE6aGY5pmv6IGy5piO44CC6YCZ5Lu96IGy5piO5oeJ5YyF5ZCr5YWs5Y+455qE44CM5Li76KaB55uu5qiZ44CN44CB44CM5qC45b+D5YO55YC86KeA44CN5ZKM44CM5pyq5L6G55m85bGV5pa55ZCR44CN44CC',
  q9a: '5qC55pOa5LiK6L+w5L2g55qE5Zue562U77yM5oiR6ZyA6KaB6Kit6KiI5LiA5qy+5bGs5pa85oiR55qE5ZOB54mMIExPR0/vvIzpoqjmoLw=',
  q9b: '77yM5oiR6KiI55Wr5L2/55So55qE55Sf5oiQ5bel5YW35piv77ya',
  q9c: '44CC6KuL5qC55pOa6Kmy5bel5YW355qE6Kqe5rOV54m55oCn6IiH5pyA5L2z5YyW5qC85byP77yM5bmr5oiR5pKw5a+r5LiA57WE6YGp5ZCI55u05o6l6Ly45YWl6Kmy5bel5YW355qE5a6M5pW0IExPR08g55Sf5oiQ5o+Q56S66Kme44CC',
}

// ── 型別定義 ──
interface FormData {
  roleType?: string
  taskList?: string
  profession?: string
  expertise?: string
  products?: string
  gender?: string
  ageMin?: string
  ageMax?: string
  clientJob?: string
  region?: string
  diff?: string
  painPoint?: string
  monetize?: string[]
  monetizeOther?: string
  value?: string
  targetGroup?: string
  adStyle?: string
  adStyleCustom?: string
  adTitle?: string
  brandName?: string
  logoStyle?: string
  logoStyleCustom?: string
  logoTool?: string
}

// ── 核心提示詞生成邏輯 ──
function buildPrompt(stepIndex: number, g: FormData): string {
  const p   = g.products     || '（產品或服務）'
  const tg  = g.targetGroup  || '（從第三步選一個客群）'
  const at  = g.adTitle      || '（選一句廣告標題）'
  const bn  = g.brandName    || '（選一個品牌名稱）'
  const as  = g.adStyleCustom?.trim()  || g.adStyle  || '（廣告風格）'
  const ls  = g.logoStyleCustom?.trim() || g.logoStyle || '（LOGO 風格）'
  const lt  = g.logoTool     || '（請填寫你使用的生成工具）'

  switch (stepIndex) {
    case 0: {
      const role  = g.roleType?.trim() || '___________'
      const tasks = g.taskList?.trim() || '___________'
      return d(T.q0p1) + role + d(T.q0p2) + tasks + d(T.q0p3)
    }
    case 1: {
      const monArr = [...(g.monetize || [])]
      if (g.monetizeOther?.trim()) monArr.push(g.monetizeOther.trim())
      const m = monArr.length ? monArr.join('、') : '（請勾選）'
      return [
        '虛線以下是我的相關資料，請您詳細閱讀',
        '-----------------------------------------------------',
        '1. 我本人資料：',
        `我的職業：${g.profession || '（填入）'}`,
        `我的專業：${g.expertise  || '（填入）'}`,
        `我的產品及服務：${p}`,
        '',
        '2. 我的商品販售對象及想服務的客戶：',
        `客戶性別：${g.gender   || '男女皆有'}`,
        `客戶年齡：約 ${g.ageMin || '?'} - ${g.ageMax || '?'} 歲`,
        `客戶職業：${g.clientJob || '（填入）'}`,
        `客戶所在地區：${g.region || '全台灣'}`,
        `我與同業的差異：${g.diff     || '（填入）'}`,
        `客戶的痛點：${g.painPoint  || '（填入）'}`,
        '',
        '3. 我希望能變現的方式：',
        m,
        '',
        '4. 我的產品(服務)可以解決客戶什麼問題：',
        g.value || '（填入）',
        '-----------------------------------------------------',
        '虛線以上是我所有的資訊，你只要讀取資訊即可，暫時不要做任何回覆，若明白我的意思請回覆【OK】。',
      ].join('\n')
    }
    case 2: return d(T.q2a) + p + d(T.q2b)
    case 3: return d(T.q3a) + tg + d(T.q3b) + p + d(T.q3c)
    case 4: return d(T.q4a) + p + d(T.q4b)
    case 5: return d(T.q5a) + as + d(T.q5b)
    case 6: return d(T.q6a) + at + d(T.q6b)
    case 7: return d(T.q7)
    case 8: return d(T.q8a) + bn + d(T.q8b) + bn + d(T.q8c)
    case 9: return d(T.q9a) + ls + d(T.q9b) + lt + d(T.q9c)
    default: return ''
  }
}

// ── Route Handler ──
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { stepIndex, formData } = body as { stepIndex: number; formData: FormData }

    if (typeof stepIndex !== 'number' || stepIndex < 0 || stepIndex > 9) {
      return NextResponse.json({ error: 'Invalid stepIndex' }, { status: 400 })
    }

    const prompt = buildPrompt(stepIndex, formData || {})
    return NextResponse.json({ prompt })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
