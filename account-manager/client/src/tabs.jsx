import { useState } from "react";
import { C, calcExpiry, daysLeft, fmtDate, fmtCost, tdSt, groupColors } from "./constants.js";
import { Tag, PwCell, Btn } from "./components.jsx";

// ─────────────────────────────────────────────────────
// 서비스 인라인 행
// ─────────────────────────────────────────────────────
export function ServiceRow({ s, onEdit, onRenew, onEnd, onReactivate, onDelete }) {
  const exp = calcExpiry(s.startDate, s.period);
  const days = daysLeft(exp);
  const isEnded  = s.status === "ended";
  const isWarn   = !isEnded && days !== null && days <= s.alertDays;
  const isDanger = !isEnded && days !== null && days <= 7;
  const alertColor = isDanger ? C.danger : isWarn ? C.warn : C.accent;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", background: isEnded ? "#0e1018" : isDanger ? "#ff5f5f08" : isWarn ? "#f59e0b08" : "#0b0e1a", border: `1px solid ${isEnded ? C.border : isDanger ? C.danger + "30" : isWarn ? C.warn + "30" : C.border}`, borderRadius: 9, padding: "10px 14px", opacity: isEnded ? 0.55 : 1 }}>
      {isEnded && <span style={{ background: "#3a404020", color: C.muted, border: `1px solid ${C.border2}`, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>🛑 이용종료</span>}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", minWidth: 0 }}>
        <span style={{ fontWeight: 700, color: isEnded ? C.muted : "#fff", fontSize: 13, whiteSpace: "nowrap", textDecoration: isEnded ? "line-through" : "none" }}>{s.name}</span>
        <span style={{ fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>{s.startDate} ~ {fmtDate(exp)}</span>
        <Tag text={s.period} color={isEnded ? C.muted : C.blue} />
        <span style={{ fontFamily: "monospace", color: isEnded ? C.muted : C.accent, fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>{fmtCost(s.cost)}</span>
        {!isEnded && <Tag text={s.autoRenew ? "자동갱신" : "수동갱신"} color={s.autoRenew ? C.accent : C.muted} />}
        {s.renewedFromId && <span style={{ fontSize: 11, color: C.blue, borderLeft: `2px solid ${C.blue}30`, paddingLeft: 8 }}>갱신</span>}
      </div>
      {days !== null && !isEnded && (
        <span style={{ background: alertColor + "20", color: alertColor, border: `1px solid ${alertColor}40`, borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
          {days > 0 ? `D-${days}` : days === 0 ? "오늘만료" : `만료+${Math.abs(days)}`}
        </span>
      )}
      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
        {isEnded ? <Btn small accent onClick={() => onReactivate(s.id)}>재개</Btn> : (
          <><Btn small warn onClick={() => onEnd(s)}>이용종료</Btn><Btn small blue onClick={() => onRenew(s)}>갱신</Btn><Btn small ghost onClick={() => onEdit(s)}>수정</Btn></>
        )}
        <Btn small danger onClick={() => onDelete(s)}>삭제</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 계정 탭
// ─────────────────────────────────────────────────────
export function AccountsTab({ accounts, svcByAcc, onEdit, onDelete, onAddService, onEditSvc, onRenewSvc, onEndSvc, onReactivate, onDeleteSvc }) {
  const [expanded, setExpanded] = useState({});
  const toggle = id => setExpanded(p => ({ ...p, [id]: !p[id] }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {accounts.map(a => {
        const svcs = svcByAcc(a.id);
        const isOpen = expanded[a.id];
        return (
          <div key={a.id} style={{ background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", cursor: "pointer" }} onClick={() => toggle(a.id)}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: (groupColors[a.group] || C.muted) + "25", border: `1px solid ${(groupColors[a.group] || C.muted)}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                {a.accessType === "프로그램" ? "💻" : "🌐"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>{a.owner}</span>
                  <Tag text={a.group} color={groupColors[a.group] || C.muted} />
                  {a.cat2 && <Tag text={a.cat2} color={C.muted} />}
                  {a.cat3 && <Tag text={a.cat3} color={C.muted} />}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "monospace", color: C.accent, fontSize: 13 }}>{a.username}</span>
                  <span style={{ color: C.muted, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>{a.url}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {svcs.length > 0 && <span style={{ background: C.blue + "20", color: C.blue, border: `1px solid ${C.blue}40`, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>서비스 {svcs.length}개</span>}
                <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                  <Btn small accent onClick={() => onAddService(a.id)}>+ 서비스</Btn>
                  <Btn small blue   onClick={() => onEdit(a)}>수정</Btn>
                  <Btn small danger onClick={() => onDelete(a)}>삭제</Btn>
                </div>
                <span style={{ color: C.muted, fontSize: 18, marginLeft: 4 }}>{isOpen ? "▾" : "▸"}</span>
              </div>
            </div>
            {isOpen && (
              <div style={{ borderTop: `1px solid ${C.border}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "12px 20px", padding: "14px 18px", background: "#0b0e1a" }}>
                  {[["접속구분", a.accessType], ["로그인방법", a.loginMethod], ["연동계정", a.linkedAccount],
                    ["패스워드", null, a.password], ["인증방법", a.authMethod], ["인증연락처", a.authContact]
                  ].map(([label, val, pw]) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 4 }}>{label}</div>
                      {pw !== undefined ? <PwCell value={pw} /> : <span style={{ fontSize: 13, color: val ? C.text : C.muted }}>{val || "—"}</span>}
                    </div>
                  ))}
                  {a.url && (
                    <div>
                      <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 4 }}>바로가기</div>
                      <a href={a.url} target="_blank" rel="noreferrer" style={{ background: "linear-gradient(135deg,#00d4aa,#0084ff)", color: "#fff", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>접속하기 →</a>
                    </div>
                  )}
                </div>
                <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 18px 14px" }}>
                  <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                    이용 중인 서비스 {svcs.length > 0 ? `(${svcs.length})` : ""}
                  </div>
                  {svcs.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {svcs.map(s => <ServiceRow key={s.id} s={s} onEdit={onEditSvc} onRenew={onRenewSvc} onEnd={onEndSvc} onReactivate={onReactivate} onDelete={onDeleteSvc} />)}
                    </div>
                  ) : (
                    <button onClick={() => onAddService(a.id)} style={{ background: "none", border: `1px dashed ${C.border2}`, color: C.muted, borderRadius: 8, padding: "10px 0", width: "100%", cursor: "pointer", fontSize: 13 }}>+ 서비스 추가</button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
      {accounts.length === 0 && <div style={{ textAlign: "center", padding: 60, color: C.muted }}>계정이 없습니다.</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 서비스 탭 (전체 테이블)
// ─────────────────────────────────────────────────────
export function ServicesTab({ services, accounts, onEdit, onRenew, onEnd, onReactivate, onDelete }) {
  const accMap = Object.fromEntries(accounts.map(a => [a.id, a]));
  const alertSvcs = services.filter(s => { if (s.status !== "active") return false; const d = daysLeft(calcExpiry(s.startDate, s.period)); return d !== null && d <= s.alertDays; });
  return (
    <div>
      {alertSvcs.length > 0 && (
        <div style={{ background: C.warn + "08", border: `1px solid ${C.warn}40`, borderRadius: 10, padding: "12px 18px", marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ color: C.warn, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>만료 임박 서비스</div>
            {alertSvcs.map(s => { const acc = accMap[s.accountId] || {}; const days = daysLeft(calcExpiry(s.startDate, s.period)); return (
              <div key={s.id} style={{ fontSize: 12, color: C.muted, marginBottom: 2 }}>
                <strong style={{ color: C.text }}>{acc.owner}</strong> · {s.name} —
                <span style={{ color: days <= 7 ? C.danger : C.warn, marginLeft: 4 }}>{days > 0 ? `D-${days}` : "만료됨"}</span>
                {s.autoRenew && <span style={{ color: C.accent, marginLeft: 6 }}>(자동갱신)</span>}
                <button onClick={() => onRenew(s)} style={{ background: C.warn + "22", color: C.warn, border: `1px solid ${C.warn}44`, borderRadius: 5, padding: "1px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer", marginLeft: 8 }}>갱신</button>
              </div>
            ); })}
          </div>
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 1000 }}>
          <thead>
            <tr style={{ background: "#0b0e1a", borderBottom: `2px solid ${C.border}` }}>
              {["상태","계정소유자","그룹","계정ID","서비스명","이용시작일","기간","만료일","D-day","비용","자동갱신","갱신이력","액션"].map(h => (
                <th key={h} style={{ padding: "10px 13px", textAlign: "left", color: C.muted, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map((s, i) => {
              const acc = accMap[s.accountId] || {};
              const exp = calcExpiry(s.startDate, s.period);
              const days = daysLeft(exp);
              const isEnded  = s.status === "ended";
              const isWarn   = !isEnded && days !== null && days <= s.alertDays;
              const isDanger = !isEnded && days !== null && days <= 7;
              const alertColor = isDanger ? C.danger : isWarn ? C.warn : C.accent;
              const rowBg = i % 2 === 0 ? C.bg : "#0c0f1c";
              return (
                <tr key={s.id} style={{ background: rowBg, borderBottom: `1px solid ${C.border}`, opacity: isEnded ? 0.5 : 1 }}
                  onMouseEnter={e => e.currentTarget.style.background = "#141c2e"}
                  onMouseLeave={e => e.currentTarget.style.background = rowBg}>
                  <td style={tdSt}>{isEnded ? <Tag text="이용종료" color={C.muted} /> : <Tag text="이용중" color={C.accent} />}</td>
                  <td style={tdSt}><span style={{ fontWeight: 700, color: "#fff" }}>{acc.owner || "—"}</span></td>
                  <td style={tdSt}>{acc.group ? <Tag text={acc.group} color={groupColors[acc.group] || C.muted} /> : "—"}</td>
                  <td style={tdSt}><span style={{ fontFamily: "monospace", color: C.accent, fontSize: 12 }}>{acc.username || "—"}</span></td>
                  <td style={tdSt}><span style={{ fontWeight: 700, textDecoration: isEnded ? "line-through" : "none", color: isEnded ? C.muted : C.text }}>{s.name}</span></td>
                  <td style={tdSt}><span style={{ color: C.muted }}>{s.startDate || "—"}</span></td>
                  <td style={tdSt}><Tag text={s.period} color={isEnded ? C.muted : C.blue} /></td>
                  <td style={tdSt}><span style={{ color: C.muted, fontSize: 12 }}>{fmtDate(exp)}</span></td>
                  <td style={tdSt}>{days === null || isEnded ? <span style={{ color: C.muted }}>—</span> : <span style={{ background: alertColor + "20", color: alertColor, border: `1px solid ${alertColor}40`, borderRadius: 5, padding: "2px 9px", fontSize: 12, fontWeight: 700 }}>{days > 0 ? `D-${days}` : days === 0 ? "오늘" : `+${Math.abs(days)}`}</span>}</td>
                  <td style={tdSt}><span style={{ fontFamily: "monospace", color: isEnded ? C.muted : C.accent, fontWeight: 700 }}>{fmtCost(s.cost)}</span></td>
                  <td style={tdSt}>{isEnded ? "—" : <Tag text={s.autoRenew ? "자동" : "수동"} color={s.autoRenew ? C.accent : C.muted} />}</td>
                  <td style={tdSt}>{s.renewedFromId ? <span style={{ fontSize: 11, color: C.blue }}>갱신건</span> : <span style={{ color: C.muted }}>최초</span>}</td>
                  <td style={{ ...tdSt, whiteSpace: "nowrap" }}>
                    {isEnded ? (
                      <><Btn small accent onClick={() => onReactivate(s.id)}>재개</Btn><span style={{ marginLeft: 5 }}><Btn small danger onClick={() => onDelete(s)}>삭제</Btn></span></>
                    ) : (
                      <><Btn small warn onClick={() => onEnd(s)}>이용종료</Btn><span style={{ margin: "0 4px" }}><Btn small blue onClick={() => onRenew(s)}>갱신</Btn></span><Btn small ghost onClick={() => onEdit(s)}>수정</Btn><span style={{ marginLeft: 4 }}><Btn small danger onClick={() => onDelete(s)}>삭제</Btn></span></>
                    )}
                  </td>
                </tr>
              );
            })}
            {services.length === 0 && <tr><td colSpan={13} style={{ textAlign: "center", padding: 50, color: C.muted }}>서비스가 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
