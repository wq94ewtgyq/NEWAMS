import { useState } from "react";
import { C, calcExpiry, daysLeft, fmtDate, fmtCost, tdSt, groupColors } from "./constants.js";
import { Tag, PwCell, CopyBtn, Btn } from "./components.jsx";

// ─────────────────────────────────────────────────────
// 서비스 인라인 행
// ─────────────────────────────────────────────────────
export function ServiceRow({ s, onEdit, onRenew, onEnd, onReactivate, onDelete }) {
  const exp = calcExpiry(s.startDate, s.period);
  const days = daysLeft(exp);
  const isEnded  = s.status === "ended";
  const isWarn   = !isEnded && days !== null && days <= s.alertDays;
  const isDanger = !isEnded && days !== null && days <= 7;
  const alertColor = isDanger ? C.danger : isWarn ? C.warn : C.green;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", background: isEnded ? "#0e1018" : isDanger ? "#ff5f5f08" : isWarn ? "#f59e0b08" : "#0b0e1a", border: `1px solid ${isEnded ? C.border : isDanger ? C.danger + "30" : isWarn ? C.warn + "30" : C.border}`, borderRadius: 9, padding: "10px 14px", opacity: isEnded ? 0.55 : 1 }}>
      {isEnded && <Tag text="이용종료" color={C.muted} />}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", minWidth: 0 }}>
        <span style={{ fontWeight: 700, color: isEnded ? C.muted : "#fff", fontSize: 13, whiteSpace: "nowrap", textDecoration: isEnded ? "line-through" : "none" }}>{s.name}</span>
        <span style={{ fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>{s.startDate} ~ {fmtDate(exp)}</span>
        <Tag text={s.period} color={isEnded ? C.muted : C.blue} />
        <span style={{ fontFamily: "monospace", color: isEnded ? C.muted : C.green, fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>{fmtCost(s.cost)}</span>
        {!isEnded && <Tag text={s.autoRenew ? "자동갱신" : "수동갱신"} color={s.autoRenew ? C.green : C.muted} />}
      </div>
      {days !== null && !isEnded && (
        <span style={{ background: alertColor + "20", color: alertColor, border: `1px solid ${alertColor}40`, borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
          {days > 0 ? `D-${days}` : days === 0 ? "오늘만료" : `만료+${Math.abs(days)}`}
        </span>
      )}
      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
        {isEnded ? <Btn small green onClick={() => onReactivate(s.id)}>재개</Btn> : (
          <><Btn small warn onClick={() => onEnd(s)}>이용종료</Btn><Btn small blue onClick={() => onRenew(s)}>갱신</Btn><Btn small ghost onClick={() => onEdit(s)}>수정</Btn></>
        )}
        <Btn small danger onClick={() => onDelete(s)}>삭제</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 계정 탭 — 관리형 테이블 UI
// ─────────────────────────────────────────────────────
export function AccountsTab({ accounts, services, svcByAcc, onEdit, onDelete, onAddService, onEditSvc, onRenewSvc, onEndSvc, onReactivate, onDeleteSvc, allAccounts }) {
  const [expanded, setExpanded] = useState({});
  const toggle = id => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const getLinkedLabel = (linkedId) => {
    if (!linkedId) return "—";
    const linked = (allAccounts || accounts).find(a => a.id === linkedId);
    if (!linked) return "—";
    return `${linked.siteName || linked.url || "—"}(${linked.username || "—"})`;
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 1200 }}>
        <thead>
          <tr style={{ background: "#0b0e1a", borderBottom: `2px solid ${C.border}` }}>
            {["", "소유자", "그룹", "구분", "세부구분", "사이트명", "아이디", "패스워드", "접속", "서비스", "액션"].map(h => (
              <th key={h} style={{ padding: "10px 13px", textAlign: "left", color: C.muted, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {accounts.map((a, i) => {
            const svcs = svcByAcc(a.id);
            const isOpen = expanded[a.id];
            const rowBg = i % 2 === 0 ? C.bg : "#0c0f1c";
            const activeCount = svcs.filter(s => s.status === "active").length;
            return (
              <>
                <tr key={a.id} style={{ background: rowBg, borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}
                  onClick={() => toggle(a.id)}
                  onMouseEnter={e => e.currentTarget.style.background = "#141c2e"}
                  onMouseLeave={e => e.currentTarget.style.background = rowBg}>
                  <td style={tdSt}>
                    <span style={{ color: C.muted, fontSize: 16 }}>{isOpen ? "▾" : "▸"}</span>
                  </td>
                  <td style={tdSt}><span style={{ fontWeight: 700, color: "#fff" }}>{a.owner || "—"}</span></td>
                  <td style={tdSt}>{a.group ? <Tag text={a.group} color={groupColors[a.group] || C.muted} /> : "—"}</td>
                  <td style={tdSt}>{a.category ? <Tag text={a.category} color={C.accent} /> : "—"}</td>
                  <td style={tdSt}>{a.subcategory ? <Tag text={a.subcategory} color={C.blue} /> : "—"}</td>
                  <td style={tdSt}>
                    <span style={{ color: C.text, fontSize: 13 }}>{a.siteName || "—"}</span>
                  </td>
                  <td style={tdSt}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "monospace", color: C.accent, fontSize: 13 }}>{a.username || "—"}</span>
                      {a.username && <CopyBtn text={a.username} label="ID" />}
                    </div>
                  </td>
                  <td style={tdSt} onClick={e => e.stopPropagation()}>
                    {a.password ? <PwCell value={a.password} /> : <span style={{ color: C.muted }}>—</span>}
                  </td>
                  <td style={tdSt} onClick={e => e.stopPropagation()}>
                    {a.url ? (
                      <a href={a.url.startsWith("http") ? a.url : `https://${a.url}`} target="_blank" rel="noreferrer"
                        style={{ background: `linear-gradient(135deg,${C.accent},#ff6b9d)`, color: "#fff", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                        접속하기
                      </a>
                    ) : <span style={{ color: C.muted }}>—</span>}
                  </td>
                  <td style={tdSt}>
                    {activeCount > 0 ? (
                      <Tag text={`${activeCount}개`} color={C.green} />
                    ) : (
                      <Tag text="없음" color={C.muted} />
                    )}
                  </td>
                  <td style={{ ...tdSt, whiteSpace: "nowrap" }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Btn small accent onClick={() => onAddService(a.id)}>+ 서비스</Btn>
                      <Btn small blue onClick={() => onEdit(a)}>수정</Btn>
                      <Btn small danger onClick={() => onDelete(a)}>삭제</Btn>
                    </div>
                  </td>
                </tr>
                {isOpen && (
                  <tr key={a.id + "_detail"} style={{ background: "#080b15" }}>
                    <td colSpan={11} style={{ padding: 0 }}>
                      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "12px 20px", marginBottom: 14 }}>
                          {[
                            ["접속구분", a.accessType],
                            ["로그인방법", a.loginMethod],
                            ["연동계정", getLinkedLabel(a.linkedAccount)],
                            ["URL", a.url],
                          ].map(([label, val]) => (
                            <div key={label}>
                              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 4 }}>{label}</div>
                              <span style={{ fontSize: 13, color: val ? C.text : C.muted }}>{val || "—"}</span>
                            </div>
                          ))}
                          {(a.authInfos || []).filter(ai => ai.method !== "없음").map((ai, idx) => (
                            <div key={`auth-${idx}`}>
                              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 4 }}>인증{idx + 1}</div>
                              <span style={{ fontSize: 13, color: C.text }}>{ai.method} · {ai.contact || "—"}</span>
                            </div>
                          ))}
                          {a.note && (
                            <div>
                              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 4 }}>비고</div>
                              <span style={{ fontSize: 13, color: C.text }}>{a.note}</span>
                            </div>
                          )}
                        </div>
                        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                          <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                            서비스 {svcs.length > 0 ? `(${svcs.length})` : ""}
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
                    </td>
                  </tr>
                )}
              </>
            );
          })}
          {accounts.length === 0 && (
            <tr><td colSpan={11} style={{ textAlign: "center", padding: 60, color: C.muted }}>계정이 없습니다.</td></tr>
          )}
        </tbody>
      </table>
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
                {s.autoRenew && <span style={{ color: C.green, marginLeft: 6 }}>(자동갱신)</span>}
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
              {["상태","계정소유자","그룹","계정ID","서비스명","이용시작일","기간","만료일","D-day","비용","자동갱신","액션"].map(h => (
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
              const alertColor = isDanger ? C.danger : isWarn ? C.warn : C.green;
              const rowBg = i % 2 === 0 ? C.bg : "#0c0f1c";
              return (
                <tr key={s.id} style={{ background: rowBg, borderBottom: `1px solid ${C.border}`, opacity: isEnded ? 0.5 : 1 }}
                  onMouseEnter={e => e.currentTarget.style.background = "#141c2e"}
                  onMouseLeave={e => e.currentTarget.style.background = rowBg}>
                  <td style={tdSt}>{isEnded ? <Tag text="이용종료" color={C.muted} /> : <Tag text="이용중" color={C.green} />}</td>
                  <td style={tdSt}><span style={{ fontWeight: 700, color: "#fff" }}>{acc.owner || "—"}</span></td>
                  <td style={tdSt}>{acc.group ? <Tag text={acc.group} color={groupColors[acc.group] || C.muted} /> : "—"}</td>
                  <td style={tdSt}><span style={{ fontFamily: "monospace", color: C.accent, fontSize: 12 }}>{acc.username || "—"}</span></td>
                  <td style={tdSt}><span style={{ fontWeight: 700, textDecoration: isEnded ? "line-through" : "none", color: isEnded ? C.muted : C.text }}>{s.name}</span></td>
                  <td style={tdSt}><span style={{ color: C.muted }}>{s.startDate || "—"}</span></td>
                  <td style={tdSt}><Tag text={s.period} color={isEnded ? C.muted : C.blue} /></td>
                  <td style={tdSt}><span style={{ color: C.muted, fontSize: 12 }}>{fmtDate(exp)}</span></td>
                  <td style={tdSt}>{days === null || isEnded ? <span style={{ color: C.muted }}>—</span> : <span style={{ background: alertColor + "20", color: alertColor, border: `1px solid ${alertColor}40`, borderRadius: 5, padding: "2px 9px", fontSize: 12, fontWeight: 700 }}>{days > 0 ? `D-${days}` : days === 0 ? "오늘" : `+${Math.abs(days)}`}</span>}</td>
                  <td style={tdSt}><span style={{ fontFamily: "monospace", color: isEnded ? C.muted : C.green, fontWeight: 700 }}>{fmtCost(s.cost)}</span></td>
                  <td style={tdSt}>{isEnded ? "—" : <Tag text={s.autoRenew ? "자동" : "수동"} color={s.autoRenew ? C.green : C.muted} />}</td>
                  <td style={{ ...tdSt, whiteSpace: "nowrap" }}>
                    {isEnded ? (
                      <div style={{ display: "flex", gap: 4 }}>
                        <Btn small green onClick={() => onReactivate(s.id)}>재개</Btn>
                        <Btn small danger onClick={() => onDelete(s)}>삭제</Btn>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 4 }}>
                        <Btn small warn onClick={() => onEnd(s)}>이용종료</Btn>
                        <Btn small blue onClick={() => onRenew(s)}>갱신</Btn>
                        <Btn small ghost onClick={() => onEdit(s)}>수정</Btn>
                        <Btn small danger onClick={() => onDelete(s)}>삭제</Btn>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {services.length === 0 && <tr><td colSpan={12} style={{ textAlign: "center", padding: 50, color: C.muted }}>서비스가 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
