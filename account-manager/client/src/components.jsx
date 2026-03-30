import { useState, useEffect } from "react";
import { C, inputSt } from "./constants.js";

// ─────────────────────────────────────────────────────
// 공통 소형 컴포넌트
// ─────────────────────────────────────────────────────
export function Tag({ text, color = C.muted }) {
  return (
    <span style={{
      background: color + "20", color, border: `1px solid ${color}40`,
      borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
    }}>{text}</span>
  );
}
export function CopyBtn({ text }) {
  const [ok, set] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); set(true); setTimeout(() => set(false), 1500); }}
      style={{ background: "none", border: "none", cursor: "pointer", color: ok ? C.accent : C.muted, padding: "0 3px", fontSize: 12 }}>
      {ok ? "✓" : "⧉"}
    </button>
  );
}
export function PwCell({ value }) {
  const [show, set] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontFamily: "monospace", fontSize: 12, color: show ? C.text : C.muted, letterSpacing: show ? 1 : 2 }}>
        {show ? value : "••••••••"}
      </span>
      <button onClick={() => set(s => !s)}
        style={{ background: "none", border: "none", cursor: "pointer", color: show ? C.accent : C.muted, fontSize: 11, padding: "0 2px" }}>
        {show ? "◉" : "○"}
      </button>
      <CopyBtn text={value} />
    </div>
  );
}
export function Btn({ children, onClick, small, accent, blue, danger, ghost, warn, disabled }) {
  let bg, color, border;
  if (danger)      { bg = C.danger + "22"; color = C.danger; border = `1px solid ${C.danger}44`; }
  else if (blue)   { bg = C.blue + "22";   color = C.blue;   border = `1px solid ${C.blue}44`; }
  else if (accent) { bg = C.accent + "22"; color = C.accent; border = `1px solid ${C.accent}44`; }
  else if (warn)   { bg = C.warn + "22";   color = C.warn;   border = `1px solid ${C.warn}44`; }
  else if (ghost)  { bg = "transparent";   color = C.muted;  border = `1px solid ${C.border2}`; }
  else             { bg = "linear-gradient(135deg,#00d4aa,#0084ff)"; color = "#fff"; border = "none"; }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: bg, color, border, borderRadius: small ? 6 : 9,
      padding: small ? "4px 10px" : "9px 22px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      fontSize: small ? 11 : 13, fontWeight: 700,
      boxShadow: (!small && !ghost && !accent && !blue && !danger && !warn) ? "0 4px 14px rgba(0,212,170,0.25)" : "none",
      transition: "opacity 0.15s", whiteSpace: "nowrap",
    }}>{children}</button>
  );
}
export function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      <div style={{
        background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 14,
        padding: 28, minWidth: 560, maxWidth: 760, maxHeight: "90vh",
        overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
      }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
export function ModalHeader({ title, onClose }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
      <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#fff" }}>{title}</h2>
      <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer" }}>✕</button>
    </div>
  );
}
export function ModalFooter({ onCancel, onSave, saveLabel = "저장", saving = false }) {
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
      <Btn ghost onClick={onCancel} disabled={saving}>취소</Btn>
      <Btn onClick={onSave} disabled={saving}>{saving ? "저장 중..." : saveLabel}</Btn>
    </div>
  );
}
export function FieldRow({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      {children}
    </div>
  );
}
export function Input({ value, onChange, placeholder, type = "text" }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ""} style={inputSt} />;
}
export function Sel({ value, onChange, options, disabled }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled} style={{ ...inputSt, opacity: disabled ? 0.5 : 1 }}>
      {options.map(o => <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>)}
    </select>
  );
}
export function SectionTitle({ title }) {
  return (
    <div style={{
      fontSize: 11, color: C.accent, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: 1, borderBottom: `1px solid ${C.border}`, paddingBottom: 6, marginBottom: 12,
    }}>{title}</div>
  );
}
export function FilterSel({ label, value, options, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ ...inputSt, width: "auto", padding: "6px 10px", fontSize: 12 }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 토스트
// ─────────────────────────────────────────────────────
export function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg = type === "error" ? C.danger : C.accent;
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: bg + "ee", color: "#fff", borderRadius: 10,
      padding: "12px 20px", fontSize: 13, fontWeight: 600,
      boxShadow: `0 8px 24px ${bg}44`, maxWidth: 360,
      border: `1px solid ${bg}`,
      animation: "fadeIn 0.2s ease",
    }}>
      {type === "error" ? "⚠ " : "✓ "}{message}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 로딩 스피너
// ─────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: `3px solid ${C.border2}`,
        borderTop: `3px solid ${C.accent}`,
        animation: "spin 0.8s linear infinite",
      }} />
      <span style={{ color: C.muted, fontSize: 13 }}>데이터 불러오는 중...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 계정 폼
// ─────────────────────────────────────────────────────
export function AccountForm({ form, setForm }) {
  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <SectionTitle title="기본 정보" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
          <FieldRow label="계정소유자"><Input value={form.owner} onChange={f("owner")} /></FieldRow>
          <FieldRow label="그룹"><Input value={form.group} onChange={f("group")} /></FieldRow>
          <FieldRow label="구분2"><Input value={form.cat2} onChange={f("cat2")} /></FieldRow>
          <FieldRow label="구분3"><Input value={form.cat3} onChange={f("cat3")} /></FieldRow>
          <FieldRow label="접속구분"><Sel value={form.accessType} onChange={f("accessType")} options={["사이트", "프로그램", "앱"]} /></FieldRow>
          <FieldRow label="로그인방법"><Sel value={form.loginMethod} onChange={f("loginMethod")} options={["일반", "간편로그인", "SSO"]} /></FieldRow>
        </div>
      </div>
      <div>
        <SectionTitle title="접속 정보" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
          <FieldRow label="URL"><Input value={form.url} onChange={f("url")} /></FieldRow>
          <FieldRow label="연동계정"><Input value={form.linkedAccount} onChange={f("linkedAccount")} /></FieldRow>
          <FieldRow label="아이디"><Input value={form.username} onChange={f("username")} /></FieldRow>
          <FieldRow label="패스워드"><Input value={form.password} onChange={f("password")} /></FieldRow>
        </div>
      </div>
      <div>
        <SectionTitle title="인증 정보" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
          <FieldRow label="인증방법"><Sel value={form.authMethod} onChange={f("authMethod")} options={["없음", "휴대폰문자", "휴대폰OTP", "이메일OTP", "보안카드"]} /></FieldRow>
          <FieldRow label="인증연락처"><Input value={form.authContact} onChange={f("authContact")} /></FieldRow>
        </div>
      </div>
      <FieldRow label="비고"><Input value={form.note} onChange={f("note")} /></FieldRow>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 서비스 폼
// ─────────────────────────────────────────────────────
export function ServiceForm({ form, setForm, accounts, lockAccount = false }) {
  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <SectionTitle title="연결 계정" />
        <FieldRow label="계정 선택">
          <Sel value={form.accountId} onChange={f("accountId")} disabled={lockAccount}
            options={[{ v: "", l: "— 선택 —" }, ...accounts.map(a => ({ v: a.id, l: `${a.owner} · ${a.username} (${a.url})` }))]} />
        </FieldRow>
      </div>
      <div>
        <SectionTitle title="서비스 정보" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
          <FieldRow label="서비스명"><Input value={form.name} onChange={f("name")} /></FieldRow>
          <FieldRow label="이용시작일"><Input type="date" value={form.startDate} onChange={f("startDate")} /></FieldRow>
          <FieldRow label="기간"><Sel value={form.period} onChange={f("period")} options={["1개월", "3개월", "6개월", "12개월", "24개월"]} /></FieldRow>
          <FieldRow label="비용(원)"><Input value={form.cost} onChange={f("cost")} placeholder="숫자만 입력" /></FieldRow>
        </div>
      </div>
      <div>
        <SectionTitle title="갱신 & 알림" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
          <FieldRow label="자동갱신">
            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              {["사용", "미사용"].map(o => (
                <label key={o} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: C.text }}>
                  <input type="radio" name="autoRenew" checked={form.autoRenew === (o === "사용")}
                    onChange={() => f("autoRenew")(o === "사용")} style={{ accentColor: C.accent }} />
                  {o}
                </label>
              ))}
            </div>
          </FieldRow>
          <FieldRow label="만료 알림 (일 전)">
            <Sel value={String(form.alertDays)} onChange={v => f("alertDays")(Number(v))}
              options={["7", "14", "30", "60"].map(v => ({ v, l: `${v}일 전` }))} />
          </FieldRow>
        </div>
      </div>
      <FieldRow label="비고"><Input value={form.note} onChange={f("note")} /></FieldRow>
    </div>
  );
}
