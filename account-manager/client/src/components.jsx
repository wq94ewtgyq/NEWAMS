import { useState, useEffect, useRef } from "react";
import { C, inputSt, AUTH_METHODS } from "./constants.js";

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
export function CopyBtn({ text, label }) {
  const [ok, set] = useState(false);
  return (
    <button
      onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(text); set(true); setTimeout(() => set(false), 1500); }}
      title={`${label || "복사"}`}
      style={{ background: ok ? C.accent + "22" : "transparent", border: `1px solid ${ok ? C.accent + "44" : C.border2}`, cursor: "pointer", color: ok ? C.accent : C.muted, padding: "3px 8px", fontSize: 11, borderRadius: 5, fontWeight: 600, whiteSpace: "nowrap", transition: "all 0.15s" }}>
      {ok ? "✓ 복사됨" : `⧉ ${label || "복사"}`}
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
      <button onClick={e => { e.stopPropagation(); set(s => !s); }}
        style={{ background: "none", border: "none", cursor: "pointer", color: show ? C.accent : C.muted, fontSize: 14, padding: "0 2px" }}>
        {show ? "👁" : "👁‍🗨"}
      </button>
      <CopyBtn text={value} label="PW" />
    </div>
  );
}
export function Btn({ children, onClick, small, accent, blue, danger, ghost, warn, disabled, green }) {
  let bg, color, border;
  if (danger)      { bg = C.danger + "22"; color = C.danger; border = `1px solid ${C.danger}44`; }
  else if (blue)   { bg = C.blue + "22";   color = C.blue;   border = `1px solid ${C.blue}44`; }
  else if (accent) { bg = C.accent + "22"; color = C.accent; border = `1px solid ${C.accent}44`; }
  else if (green)  { bg = C.green + "22";  color = C.green;  border = `1px solid ${C.green}44`; }
  else if (warn)   { bg = C.warn + "22";   color = C.warn;   border = `1px solid ${C.warn}44`; }
  else if (ghost)  { bg = "transparent";   color = C.muted;  border = `1px solid ${C.border2}`; }
  else             { bg = `linear-gradient(135deg,${C.accent},#ff4d4d)`; color = "#fff"; border = "none"; }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: bg, color, border, borderRadius: small ? 6 : 9,
      padding: small ? "4px 10px" : "9px 22px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      fontSize: small ? 11 : 13, fontWeight: 700,
      boxShadow: (!small && !ghost && !accent && !blue && !danger && !warn && !green) ? `0 4px 14px ${C.accent}40` : "none",
      transition: "opacity 0.15s", whiteSpace: "nowrap",
    }}>{children}</button>
  );
}
export function Modal({ open, onClose, children, wide }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      <div style={{
        background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 14,
        padding: 28, minWidth: wide ? 700 : 560, maxWidth: wide ? 900 : 760, maxHeight: "90vh",
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
// 검색형 드롭다운
// ─────────────────────────────────────────────────────
export function SearchableDropdown({ value, onChange, options, onManage, placeholder = "검색 또는 선택..." }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o => {
    const label = typeof o === "string" ? o : o.label;
    return label.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 4 }}>
        <input
          value={open ? query : value}
          onChange={e => { setQuery(e.target.value); if (!open) setOpen(true); }}
          onFocus={() => { setOpen(true); setQuery(""); }}
          placeholder={placeholder}
          style={{ ...inputSt, flex: 1 }}
        />
        {onManage && (
          <button onClick={onManage} title="관리"
            style={{ ...inputSt, width: 36, padding: 0, textAlign: "center", cursor: "pointer", flexShrink: 0, fontSize: 14 }}>
            ⚙
          </button>
        )}
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
          background: "#0a0d18", border: `1px solid ${C.border2}`, borderRadius: 7,
          maxHeight: 200, overflowY: "auto", marginTop: 2,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}>
          {filtered.length === 0 && (
            <div style={{ padding: "10px 12px", color: C.muted, fontSize: 12 }}>결과 없음</div>
          )}
          {filtered.map((o, i) => {
            const val = typeof o === "string" ? o : o.value;
            const label = typeof o === "string" ? o : o.label;
            return (
              <div key={i}
                onClick={() => { onChange(val); setOpen(false); setQuery(""); }}
                style={{
                  padding: "8px 12px", cursor: "pointer", fontSize: 13, color: C.text,
                  background: val === value ? C.accent + "15" : "transparent",
                  borderBottom: `1px solid ${C.border}`,
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.accent + "20"}
                onMouseLeave={e => e.currentTarget.style.background = val === value ? C.accent + "15" : "transparent"}
              >
                {label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 패스워드 입력 (눈 아이콘 토글)
// ─────────────────────────────────────────────────────
export function PasswordInput({ value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputSt, paddingRight: 36 }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{
          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer",
          color: show ? C.accent : C.muted, fontSize: 16, padding: 0, lineHeight: 1,
        }}
        title={show ? "숨기기" : "보기"}
      >
        {show ? "👁" : "👁‍🗨"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 인증정보 목록 (여러개 추가 가능)
// ─────────────────────────────────────────────────────
export function AuthInfoList({ authInfos, onChange }) {
  const update = (idx, key, val) => {
    const next = authInfos.map((a, i) => i === idx ? { ...a, [key]: val } : a);
    onChange(next);
  };
  const add = () => onChange([...authInfos, { method: "없음", contact: "" }]);
  const remove = idx => {
    if (authInfos.length <= 1) return;
    onChange(authInfos.filter((_, i) => i !== idx));
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {authInfos.map((info, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <Sel value={info.method} onChange={v => update(i, "method", v)} options={AUTH_METHODS} />
          </div>
          <div style={{ flex: 1 }}>
            <input value={info.contact} onChange={e => update(i, "contact", e.target.value)}
              placeholder="인증연락처" style={inputSt} />
          </div>
          <button onClick={() => remove(i)} disabled={authInfos.length <= 1}
            style={{ background: "none", border: "none", color: authInfos.length <= 1 ? C.border2 : C.danger, cursor: authInfos.length <= 1 ? "default" : "pointer", fontSize: 16, padding: "0 4px", flexShrink: 0 }}>
            ✕
          </button>
        </div>
      ))}
      <button onClick={add}
        style={{ background: "none", border: `1px dashed ${C.border2}`, color: C.muted, borderRadius: 6, padding: "6px 0", cursor: "pointer", fontSize: 12, width: "100%" }}>
        + 인증정보 추가
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 관리 모달 (소유자/그룹 목록 관리)
// ─────────────────────────────────────────────────────
export function ManageListModal({ open, onClose, title, items, onSave }) {
  const [list, setList] = useState([]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => { if (open) setList([...items]); }, [open, items]);

  const add = () => {
    const v = newItem.trim();
    if (v && !list.includes(v)) { setList([...list, v]); setNewItem(""); }
  };
  const remove = idx => setList(list.filter((_, i) => i !== idx));
  const save = () => { onSave(list); onClose(); };

  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title={title} onClose={onClose} />
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input value={newItem} onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="새 항목 입력..." style={{ ...inputSt, flex: 1 }} />
        <Btn accent small onClick={add}>추가</Btn>
      </div>
      <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        {list.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7 }}>
            <span style={{ color: C.text, fontSize: 13 }}>{item}</span>
            <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
        ))}
        {list.length === 0 && <div style={{ textAlign: "center", color: C.muted, padding: 20, fontSize: 12 }}>항목이 없습니다.</div>}
      </div>
      <ModalFooter onCancel={onClose} onSave={save} />
    </Modal>
  );
}

// ─────────────────────────────────────────────────────
// 카테고리 관리 모달 (구분 > 세부구분 계층)
// ─────────────────────────────────────────────────────
export function ManageCategoryModal({ open, onClose, categories, onSave }) {
  const [cats, setCats] = useState([]);
  const [newCat, setNewCat] = useState("");
  const [newSubs, setNewSubs] = useState({});

  useEffect(() => { if (open) { setCats(categories.map(c => ({ ...c, subcategories: [...c.subcategories] }))); setNewSubs({}); } }, [open, categories]);

  const addCat = () => {
    const v = newCat.trim();
    if (v && !cats.find(c => c.name === v)) { setCats([...cats, { name: v, subcategories: [] }]); setNewCat(""); }
  };
  const removeCat = idx => setCats(cats.filter((_, i) => i !== idx));
  const addSub = (catIdx) => {
    const v = (newSubs[catIdx] || "").trim();
    if (!v) return;
    const next = cats.map((c, i) => i === catIdx && !c.subcategories.includes(v) ? { ...c, subcategories: [...c.subcategories, v] } : c);
    setCats(next);
    setNewSubs({ ...newSubs, [catIdx]: "" });
  };
  const removeSub = (catIdx, subIdx) => {
    const next = cats.map((c, i) => i === catIdx ? { ...c, subcategories: c.subcategories.filter((_, j) => j !== subIdx) } : c);
    setCats(next);
  };
  const save = () => { onSave(cats); onClose(); };

  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} wide>
      <ModalHeader title="구분 / 세부구분 관리" onClose={onClose} />
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input value={newCat} onChange={e => setNewCat(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addCat()}
          placeholder="새 구분 입력..." style={{ ...inputSt, flex: 1 }} />
        <Btn accent small onClick={addCat}>구분 추가</Btn>
      </div>
      <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {cats.map((cat, ci) => (
          <div key={ci} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 9, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ color: C.accent, fontWeight: 700, fontSize: 14 }}>{cat.name}</span>
              <button onClick={() => removeCat(ci)} style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✕ 삭제</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {cat.subcategories.map((sub, si) => (
                <span key={si} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.blue + "15", color: C.blue, border: `1px solid ${C.blue}30`, borderRadius: 5, padding: "3px 8px", fontSize: 12 }}>
                  {sub}
                  <button onClick={() => removeSub(ci, si)} style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontSize: 11, padding: 0 }}>✕</button>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input value={newSubs[ci] || ""} onChange={e => setNewSubs({ ...newSubs, [ci]: e.target.value })}
                onKeyDown={e => e.key === "Enter" && addSub(ci)}
                placeholder="세부구분 입력..." style={{ ...inputSt, flex: 1, padding: "5px 10px", fontSize: 12 }} />
              <Btn blue small onClick={() => addSub(ci)}>추가</Btn>
            </div>
          </div>
        ))}
        {cats.length === 0 && <div style={{ textAlign: "center", color: C.muted, padding: 30, fontSize: 12 }}>구분이 없습니다. 위에서 추가해주세요.</div>}
      </div>
      <ModalFooter onCancel={onClose} onSave={save} />
    </Modal>
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
export function AccountForm({ form, setForm, owners, groups, categories, accounts, onManageOwners, onManageGroups, onManageCategories }) {
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const selectedCat = categories.find(c => c.name === form.category);
  const subcategories = selectedCat ? selectedCat.subcategories : [];

  const linkedOptions = accounts
    .filter(a => a.id !== form.id)
    .map(a => ({ value: a.id, label: `${a.siteName || a.url || "—"}(${a.username || "—"})` }));

  const linkedDisplay = form.linkedAccount
    ? (linkedOptions.find(o => o.value === form.linkedAccount)?.label || "")
    : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <SectionTitle title="기본 정보" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
          <FieldRow label="계정소유자">
            <SearchableDropdown value={form.owner} onChange={f("owner")} options={owners} onManage={onManageOwners} placeholder="소유자 검색..." />
          </FieldRow>
          <FieldRow label="그룹">
            <SearchableDropdown value={form.group} onChange={f("group")} options={groups} onManage={onManageGroups} placeholder="그룹 검색..." />
          </FieldRow>
          <FieldRow label="구분">
            <SearchableDropdown
              value={form.category} onChange={v => { f("category")(v); f("subcategory")(""); }}
              options={categories.map(c => c.name)} onManage={onManageCategories} placeholder="구분 검색..."
            />
          </FieldRow>
          <FieldRow label="세부구분">
            <SearchableDropdown value={form.subcategory} onChange={f("subcategory")} options={subcategories} placeholder="세부구분 검색..." />
          </FieldRow>
          <FieldRow label="접속구분"><Sel value={form.accessType} onChange={f("accessType")} options={["사이트", "프로그램", "앱"]} /></FieldRow>
          <FieldRow label="로그인방법"><Sel value={form.loginMethod} onChange={f("loginMethod")} options={["일반", "간편로그인", "SSO"]} /></FieldRow>
        </div>
      </div>
      <div>
        <SectionTitle title="접속 정보" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
          <FieldRow label="사이트명"><Input value={form.siteName || ""} onChange={f("siteName")} placeholder="예: Google" /></FieldRow>
          <FieldRow label="URL"><Input value={form.url} onChange={f("url")} /></FieldRow>
          <FieldRow label="연동계정">
            <SearchableDropdown
              value={linkedDisplay}
              onChange={f("linkedAccount")}
              options={[{ value: "", label: "— 없음 —" }, ...linkedOptions]}
              placeholder="연동계정 검색..."
            />
          </FieldRow>
          <div />
          <FieldRow label="아이디"><Input value={form.username} onChange={f("username")} /></FieldRow>
          <FieldRow label="패스워드"><PasswordInput value={form.password} onChange={f("password")} /></FieldRow>
        </div>
      </div>
      <div>
        <SectionTitle title="인증 정보" />
        <AuthInfoList authInfos={form.authInfos || [{ method: "없음", contact: "" }]} onChange={v => setForm(p => ({ ...p, authInfos: v }))} />
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
            options={[{ v: "", l: "— 선택 —" }, ...accounts.map(a => ({ v: a.id, l: `${a.owner} · ${a.username} (${a.siteName || a.url || ""})` }))]} />
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
