# 品牌架構提示詞 — Next.js 版本

## 架構說明

```
app/
├── api/
│   └── prompt/
│       └── route.ts    ← ✅ 所有提示詞邏輯在這裡（伺服器端，前端看不到）
├── page.tsx            ← 前端 UI（空殼，只負責顯示）
└── layout.tsx
lib/
├── steps-config.ts     ← 步驟結構設定（UI 用，無提示詞）
└── types.ts            ← TypeScript 型別
```

## 核心設計

- **前端**只知道「表單有哪些欄位」，不知道提示詞長什麼樣子
- **前端**填完表單 → POST `/api/prompt` → **後端**組合提示詞 → 回傳給前端顯示
- 任何人打開 DevTools 或 View Source，只能看到 API 呼叫，看不到提示詞邏輯

## 快速開始

```bash
# 1. 用 Cursor 或 Claude Code 建立 Next.js 專案
npx create-next-app@latest brand-prompt-tool --typescript --tailwind --app --no-src-dir

# 2. 把這幾個檔案放入專案
#    app/api/prompt/route.ts
#    lib/steps-config.ts
#    lib/types.ts

# 3. 本地測試 API
npm run dev
curl -X POST http://localhost:3000/api/prompt \
  -H "Content-Type: application/json" \
  -d '{"stepIndex":0,"formData":{"roleType":"品牌顧問","taskList":"品牌規劃、商品行銷"}}'

# 4. 部署到 Vercel
vercel --prod
```

## 新增步驟的方式

1. 在 `lib/steps-config.ts` 加一個 StepConfig 物件（定義 UI）
2. 在 `app/api/prompt/route.ts` 的 `buildPrompt()` switch 加一個 `case`（定義邏輯）
3. 完成

## API 規格

### POST /api/prompt

**Request:**
```json
{
  "stepIndex": 0,
  "formData": {
    "roleType": "品牌顧問",
    "taskList": "品牌規劃、商品行銷"
  }
}
```

**Response:**
```json
{
  "prompt": "你是一位專業的品牌顧問，請協助我做品牌規劃、商品行銷…"
}
```

## 未來擴充方向

- **多版本問卷**：在 `lib/steps-config.ts` 加入不同 `STEPS_CONFIG` 陣列，用 URL 參數選版本
- **登入保護**：加 NextAuth.js + Google OAuth，只有登入者才能用
- **儲存記錄**：把填寫記錄存到 Supabase，讓學員下次繼續
- **管理後台**：Adam 可以在後台修改提示詞模板（存 Supabase，route.ts 從 DB 讀取）
