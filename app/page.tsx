"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { STEPS_CONFIG, type StepConfig, type Field } from "@/lib/steps-config";
import { DEFAULT_FORM_DATA, type FormData } from "@/lib/types";

// ─── Prompt fetcher ───
async function fetchPrompt(
  stepIndex: number,
  formData: FormData
): Promise<string> {
  const res = await fetch("/api/prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stepIndex, formData }),
  });
  const json = await res.json();
  return json.prompt ?? "";
}

// ─── Copy helper ───
function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }, []);
  return { copiedKey, copy };
}

// ─── Main Page ───
export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({ ...DEFAULT_FORM_DATA });
  const [prompts, setPrompts] = useState<Record<number, string>>({});
  const [aiReplies, setAiReplies] = useState<Record<number, string>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { copiedKey, copy } = useCopy();

  const step = STEPS_CONFIG[currentStep];
  const completedSteps = useRef(new Set<number>());

  // Fetch prompt for current step
  const refreshPrompt = useCallback(
    async (idx?: number) => {
      const i = idx ?? currentStep;
      const prompt = await fetchPrompt(i, formData);
      setPrompts((prev) => ({ ...prev, [i]: prompt }));
    },
    [currentStep, formData]
  );

  // Auto-fetch prompt on step change and for info-type steps
  useEffect(() => {
    refreshPrompt();
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update field
  const updateField = (key: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Navigate
  const goTo = (idx: number) => {
    completedSteps.current.add(currentStep);
    setCurrentStep(idx);
  };

  const next = () => {
    if (currentStep < STEPS_CONFIG.length - 1) {
      completedSteps.current.add(currentStep);
      setCurrentStep(currentStep + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const currentPrompt = prompts[currentStep] ?? "";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg"
            style={{ background: "#FCC800", color: "#000" }}
          >
            B
          </div>
          <h1 className="text-lg font-bold tracking-tight">
            品牌架構提示詞產生器
          </h1>
        </div>
      </header>

      {/* Progress Bar */}
      <nav className="bg-white border-b border-gray-100 sticky top-[57px] z-20 overflow-x-auto">
        <div className="max-w-4xl mx-auto px-4 py-2 flex gap-1">
          {STEPS_CONFIG.map((s, i) => {
            const isActive = i === currentStep;
            const isDone = completedSteps.current.has(i);
            return (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                className={`
                  flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  ${
                    isActive
                      ? "text-black shadow-sm"
                      : isDone
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                  }
                `}
                style={isActive ? { background: "#FCC800" } : undefined}
              >
                <span className="mr-1 opacity-60">{i + 1}</span>
                {s.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {/* Step Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold"
              style={{ background: "#FCC800", color: "#000" }}
            >
              {currentStep + 1}
            </span>
            <h2 className="text-xl font-bold">{step.title}</h2>
          </div>
          <p className="text-gray-500 text-sm ml-9">{step.desc}</p>
        </div>

        {/* Info message */}
        {step.infoMsg && (
          <div
            className="rounded-lg px-4 py-3 mb-6 text-sm border"
            style={{
              background: "#fff8d6",
              borderColor: "#FCC800",
              color: "#6b5900",
            }}
            dangerouslySetInnerHTML={{ __html: step.infoMsg }}
          />
        )}

        {/* Form Sections */}
        {step.sections.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span
                className="w-1 h-4 rounded-full inline-block"
                style={{ background: "#FCC800" }}
              />
              {section.title}
            </h3>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  formData={formData}
                  onChange={updateField}
                  onBlur={() => refreshPrompt()}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Prompt Display */}
        {currentPrompt && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                提示詞
              </span>
              <button
                onClick={() => copy(currentPrompt, `step-${currentStep}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all hover:shadow-sm"
                style={
                  copiedKey === `step-${currentStep}`
                    ? { background: "#22c55e", color: "#fff" }
                    : { background: "#FCC800", color: "#000" }
                }
              >
                {copiedKey === `step-${currentStep}` ? (
                  <>
                    <CheckIcon /> 已複製
                  </>
                ) : (
                  <>
                    <CopyIcon /> 複製
                  </>
                )}
              </button>
            </div>
            <pre className="px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-gray-800 max-h-80 overflow-y-auto font-sans">
              {currentPrompt}
            </pre>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 mb-12">
          <button
            onClick={prev}
            disabled={currentStep === 0}
            className="px-5 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            上一步
          </button>
          <button
            onClick={next}
            disabled={currentStep === STEPS_CONFIG.length - 1}
            className="px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow transition disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: "#FCC800", color: "#000" }}
          >
            下一步 →
          </button>
        </div>
      </main>

      {/* Floating Drawer Toggle (from step 3 onward, i.e. index >= 2) */}
      {currentStep >= 2 && (
        <button
          onClick={() => setDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          style={{ background: "#FCC800", color: "#000" }}
          title="AI 回覆紀錄"
        >
          <NoteIcon />
        </button>
      )}

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="font-bold text-base">AI 回覆紀錄</h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto drawer-scroll p-4 space-y-4">
              {STEPS_CONFIG.map((s, i) => {
                const p = prompts[i];
                if (!p) return null;

                // Step 2 (index 1): only show prompt + copy, no AI reply
                if (i === 1) {
                  return (
                    <DrawerCardPromptOnly
                      key={s.id}
                      stepIndex={i}
                      label={s.label}
                      prompt={p}
                      copiedKey={copiedKey}
                      onCopy={copy}
                    />
                  );
                }

                // Steps 3+ (index >= 2): prompt + AI reply textarea
                if (i >= 2) {
                  return (
                    <DrawerCard
                      key={s.id}
                      stepIndex={i}
                      label={s.label}
                      prompt={p}
                      aiReply={aiReplies[i] ?? ""}
                      onAiReplyChange={(val) =>
                        setAiReplies((prev) => ({ ...prev, [i]: val }))
                      }
                      copiedKey={copiedKey}
                      onCopy={copy}
                    />
                  );
                }

                return null;
              })}
            </div>
          </div>
        </div>
      )}

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}

// ─── Field Renderer ───
function FieldRenderer({
  field,
  formData,
  onChange,
  onBlur,
}: {
  field: Field;
  formData: FormData;
  onChange: (key: string, value: string | string[]) => void;
  onBlur: () => void;
}) {
  const val = (formData as unknown as Record<string, string>)[field.id] ?? "";

  switch (field.type) {
    case "text":
      return (
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            {field.label}
          </span>
          {field.hint && (
            <span className="text-xs text-gray-400 ml-2">{field.hint}</span>
          )}
          <input
            type="text"
            value={val ?? ""}
            placeholder={field.ph}
            onChange={(e) => onChange(field.id, e.target.value)}
            onBlur={onBlur}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FCC800]/50 focus:border-[#FCC800] transition"
          />
        </label>
      );

    case "textarea":
      return (
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            {field.label}
          </span>
          {field.hint && (
            <span className="text-xs text-gray-400 ml-2">{field.hint}</span>
          )}
          <textarea
            value={val ?? ""}
            placeholder={field.ph}
            rows={3}
            onChange={(e) => onChange(field.id, e.target.value)}
            onBlur={onBlur}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FCC800]/50 focus:border-[#FCC800] transition resize-none"
          />
        </label>
      );

    case "agepair":
      return (
        <div>
          <span className="text-sm font-medium text-gray-700">
            {field.label}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="number"
              value={formData.ageMin ?? ""}
              placeholder="最小"
              onChange={(e) => onChange("ageMin", e.target.value)}
              onBlur={onBlur}
              className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FCC800]/50 focus:border-[#FCC800] transition"
            />
            <span className="text-gray-400">—</span>
            <input
              type="number"
              value={formData.ageMax ?? ""}
              placeholder="最大"
              onChange={(e) => onChange("ageMax", e.target.value)}
              onBlur={onBlur}
              className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FCC800]/50 focus:border-[#FCC800] transition"
            />
            <span className="text-sm text-gray-400">歲</span>
          </div>
        </div>
      );

    case "checkbox_with_other": {
      const selected = (formData as unknown as Record<string, string[]>)[field.id] ?? [];
      const otherVal = field.otherId
        ? ((formData as unknown as Record<string, string>)[field.otherId!] ?? "")
        : "";
      return (
        <div>
          <span className="text-sm font-medium text-gray-700">
            {field.label}
          </span>
          {field.hint && (
            <span className="text-xs text-gray-400 ml-2">{field.hint}</span>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {(field.options ?? []).map((opt) => {
              const checked = selected.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    const next = checked
                      ? selected.filter((v) => v !== opt)
                      : [...selected, opt];
                    onChange(field.id, next);
                    setTimeout(onBlur, 0);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    checked
                      ? "border-transparent text-black"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
                  style={checked ? { background: "#FCC800" } : undefined}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {field.otherId && (
            <input
              type="text"
              value={otherVal}
              placeholder={field.otherPh}
              onChange={(e) => onChange(field.otherId!, e.target.value)}
              onBlur={onBlur}
              className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FCC800]/50 focus:border-[#FCC800] transition"
            />
          )}
        </div>
      );
    }

    case "chips_with_custom": {
      const chipVal = val ?? "";
      return (
        <div>
          <span className="text-sm font-medium text-gray-700">
            {field.label}
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {(field.chips ?? []).map((chip) => {
              const active = chipVal === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    onChange(field.id, active ? "" : chip);
                    if (field.customId) onChange(field.customId, "");
                    setTimeout(onBlur, 0);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    active
                      ? "border-transparent text-black"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
                  style={active ? { background: "#FCC800" } : undefined}
                >
                  {chip}
                </button>
              );
            })}
          </div>
          {field.customId && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                {field.customLabel}
              </span>
              <input
                type="text"
                value={
                  (formData as unknown as Record<string, string>)[field.customId!] ?? ""
                }
                placeholder={field.customPh}
                onChange={(e) => {
                  onChange(field.customId!, e.target.value);
                  if (e.target.value) onChange(field.id, "");
                }}
                onBlur={onBlur}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FCC800]/50 focus:border-[#FCC800] transition"
              />
            </div>
          )}
        </div>
      );
    }

    case "chips": {
      const chipVal = val ?? "";
      return (
        <div>
          <span className="text-sm font-medium text-gray-700">
            {field.label}
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {(field.chips ?? []).map((chip) => {
              const active = chipVal === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    onChange(field.id, active ? "" : chip);
                    setTimeout(onBlur, 0);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    active
                      ? "border-transparent text-black"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
                  style={active ? { background: "#FCC800" } : undefined}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

// ─── Drawer Card (with AI reply) ───
function DrawerCard({
  stepIndex,
  label,
  prompt,
  aiReply,
  onAiReplyChange,
  copiedKey,
  onCopy,
}: {
  stepIndex: number;
  label: string;
  prompt: string;
  aiReply: string;
  onAiReplyChange: (val: string) => void;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  const key = `drawer-${stepIndex}`;
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-600">
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold mr-1.5"
            style={{ background: "#FCC800", color: "#000" }}
          >
            {stepIndex + 1}
          </span>
          {label}
        </span>
        <button
          onClick={() => onCopy(prompt, key)}
          className="text-xs px-2 py-0.5 rounded font-medium transition"
          style={
            copiedKey === key
              ? { background: "#22c55e", color: "#fff" }
              : { background: "#FCC800", color: "#000" }
          }
        >
          {copiedKey === key ? "已複製" : "複製"}
        </button>
      </div>
      <pre className="px-4 py-2 text-xs leading-relaxed whitespace-pre-wrap text-gray-600 max-h-32 overflow-y-auto font-sans border-b border-gray-100">
        {prompt}
      </pre>
      <div className="px-4 py-3">
        <label className="text-xs font-medium text-gray-500 mb-1 block">
          AI 回覆
        </label>
        <textarea
          value={aiReply}
          onChange={(e) => onAiReplyChange(e.target.value)}
          placeholder="貼上 AI 的回覆內容…"
          rows={4}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FCC800]/50 focus:border-[#FCC800] transition resize-none"
        />
      </div>
    </div>
  );
}

// ─── Drawer Card (prompt only, no AI reply — for step 2) ───
function DrawerCardPromptOnly({
  stepIndex,
  label,
  prompt,
  copiedKey,
  onCopy,
}: {
  stepIndex: number;
  label: string;
  prompt: string;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  const key = `drawer-${stepIndex}`;
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-600">
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold mr-1.5"
            style={{ background: "#FCC800", color: "#000" }}
          >
            {stepIndex + 1}
          </span>
          {label}
        </span>
        <button
          onClick={() => onCopy(prompt, key)}
          className="text-xs px-2 py-0.5 rounded font-medium transition"
          style={
            copiedKey === key
              ? { background: "#22c55e", color: "#fff" }
              : { background: "#FCC800", color: "#000" }
          }
        >
          {copiedKey === key ? "已複製" : "複製"}
        </button>
      </div>
      <pre className="px-4 py-2 text-xs leading-relaxed whitespace-pre-wrap text-gray-600 max-h-32 overflow-y-auto font-sans">
        {prompt}
      </pre>
    </div>
  );
}

// ─── Icons ───
function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
