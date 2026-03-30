import { useState } from "react";
import { C, calcExpiry, daysLeft, fmtDate, fmtCost, tdSt, groupColors, getLoginType } from "./constants.js";
import { Tag, PwCell, IdCopyBtn, CopyBtn, Btn } from "./components.jsx";

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
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", background: isEnded ? C.rowEven : isDanger ? C.danger + "08" : isWarn ? C.warn + "08" : C.rowOdd, border: `1px solid ${isEnded ? C.border : isDanger ? C.danger + "30" : isWarn ? C.warn + "30" : C.border}`, borderRadius: 8, padding: "10px 14px", opacity: isEnded ? 0.55 : 1 }}>
      {isEnded && <Tag text="이용종료" color={C.sub} />}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", minWidth: 0 }}>
        <span style={{ fontWeight: 700, color: isEnded ? C.sub : C.text, fontSize: 13, whiteSpace: "nowrap", textDecoration: isEnded ? "line-through" : "none" }}>{s.name}</span>
        <span style={{ fontSize: 12, color: C.sub, whiteSpace: "nowrap" }}>{s.startDate} ~ {fmtDate(exp)}</span>
        <Tag text={s.period} color={isEnded ? C.sub : C.blue} />
        <span style={{ fontFamily: "monospace", color: isEnded ? C.sub : C.green, fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>{fmtCost(s.cost)}</span>
        {!isEnded && <Tag text={s.autoRenew ? "자동갱신" : "수동갱신"} color={s.autoRenew ? C.green : C.sub} />}
      </div>
      {days !== null && !isEnded && (
        <span style={{ background: alertColor + "18", color: alertColor, border: `1px solid ${alertColor}35`, borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
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
// 계정 탭
// ─────────────────────────────────────────────────────
const thSt = { padding: "10px 14px", textAlign: "left", color: C.muted, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap", background: C.surface, borderBottom: `2px solid ${C.border}`, position: "sticky", top: 0, zIndex: 10 };

export function AccountsTab({ accounts, services, svcByAcc, onEdit, onDelete, onDeactivate, onActivate, onVisit, onResetVisits, onAddService, onEditSvc, onRenewSvc, onEndSvc, onReactivate, onDeleteSvc, allAccounts, sortKey, sortDir, onSort }) {
  const [expanded, setExpanded] = useState({});
  const [hovered, setHovered] = useState(null);
  const toggle = id => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const fmtVisit = (iso) => {
    if (!iso) return "—";
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (diff < 1) return "방금 전";
    if (diff < 60) return `${diff}분 전`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  };

  const getLinkedLabel = (linkedId) => {
    if (!linkedId) return "—";
    const linked = (allAccounts || accounts).find(a => a.id === linkedId);
    if (!linked) return "—";
    return `${linked.siteName || linked.url || "—"}(${linked.username || "—"})`;
  };

  const sortIcon = (key) => {
    if (sortKey !== key) return <span style={{ color: C.border2, marginLeft: 3 }}>↕</span>;
    return <span style={{ color: C.accent, marginLeft: 3 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const SortTh = ({ k, children }) => (
    <th style={{ ...thSt, cursor: "pointer", userSelect: "none" }} onClick={() => onSort(k)}>
      {children}{sortIcon(k)}
    </th>
  );

  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13, tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: 36 }} />
          <col style={{ width: 80 }} />
          <col style={{ width: 180 }} />
          <col style={{ width: 200 }} />
          <col style={{ width: 170 }} />
          <col style={{ width: 120 }} />
          <col style={{ width: 60 }} />
          <col style={{ width: 80 }} />
          <col style={{ width: 60 }} />
          <col style={{ width: 120 }} />
        </colgroup>
        <thead>
          <tr>
            <th style={thSt}></th>
            <SortTh k="group">그룹</SortTh>
            <SortTh k="siteName">사이트명</SortTh>
            <th style={thSt}>아이디</th>
            <th style={thSt}>패스워드</th>
            <th style={thSt}>2차인증</th>
            <th style={thSt}>접속</th>
            <SortTh k="lastVisited">최근접속</SortTh>
            <th style={thSt}>서비스</th>
            <th style={thSt}>액션</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a, i) => {
            const svcs = svcByAcc(a.id);
            const isOpen = expanded[a.id];
            const isVisited = !!a.visitHighlight;
            const rowBg = isVisited ? "#172554" : (i % 2 === 0 ? C.rowEven : C.rowOdd);
            const activeCount = svcs.filter(s => s.status === "active").length;
            const isInactive = a.status === "inactive";
            const grpColor = groupColors[a.group] || C.sub;
            const isHov = hovered === a.id;
            const hasMeta = (a.types || []).length > 0 || (a.tags || []).length > 0;
            return (
              <>
                <tr key={a.id} style={{ background: rowBg, borderBottom: `1px solid ${isVisited ? C.blue + "30" : C.border}`, cursor: "pointer", opacity: isInactive ? 0.45 : 1, borderLeft: `3px solid ${grpColor}40` }}
                  onClick={() => toggle(a.id)}
                  onMouseEnter={e => { e.currentTarget.style.background = C.rowHover; setHovered(a.id); }}
                  onMouseLeave={e => { e.currentTarget.style.background = rowBg; setHovered(null); }}>
                  <td style={tdSt}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: C.sub, fontSize: 14, transition: "transform 0.15s", transform: isOpen ? "rotate(90deg)" : "none" }}>▸</span>
                      {isInactive && <Tag text="비활성" color={C.sub} />}
                    </div>
                  </td>
                  <td style={tdSt}>{a.group ? <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 8px", borderRadius: 999, background: grpColor + "18", border: `1px solid ${grpColor}30`, color: grpColor, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{a.group}</span> : <span style={{ color: C.sub }}>—</span>}</td>
                  <td style={{ ...tdSt, overflow: "hidden" }}>
                    <div>
                      <span style={{ fontWeight: 800, color: "#ffffff", fontSize: 14, letterSpacing: -0.2 }}>{a.siteName || "—"}</span>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: hasMeta ? 3 : 0, height: hasMeta ? "auto" : 0, overflow: "hidden", opacity: isHov ? 1 : 0, visibility: isHov ? "visible" : "hidden", transition: "opacity 0.15s" }}>
                        {(a.types || []).map(t => <span key={"t_"+t} style={{ color: C.muted, fontSize: 10, background: C.border + "50", borderRadius: 3, padding: "1px 5px" }}>{t}</span>)}
                        {(a.tags || []).map(t => <span key={"g_"+t} style={{ color: C.sub, fontSize: 10, background: C.border + "30", borderRadius: 3, padding: "1px 5px" }}>{t}</span>)}
                      </div>
                    </div>
                  </td>
                  <td style={tdSt}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "monospace", color: C.muted, fontSize: 12 }}>{a.username || "—"}</span>
                      {a.username && <IdCopyBtn text={a.username} />}
                    </div>
                  </td>
                  <td style={tdSt} onClick={e => e.stopPropagation()}>
                    {a.password ? <PwCell value={a.password} /> : <span style={{ color: C.sub }}>—</span>}
                  </td>
                  <td style={tdSt}>
                    {(() => { const auth = (a.authInfos || []).find(ai => ai.method !== "없음"); if (!auth) return <span style={{ color: C.sub }}>—</span>; const detail = [auth.phone, auth.email, auth.certName, auth.serviceName].filter(Boolean).join(" "); return <span style={{ color: C.muted, fontSize: 11 }}>{auth.method}{detail ? ` · ${detail}` : ""}</span>; })()}
                  </td>
                  <td style={tdSt} onClick={e => e.stopPropagation()}>
                    {a.url ? (
                      <a href={a.url.startsWith("http") ? a.url : `https://${a.url}`} target="_blank" rel="noreferrer"
                        onClick={() => onVisit(a.id)}
                        style={{ background: C.blue, color: "#fff", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                        접속
                      </a>
                    ) : <span style={{ color: C.sub }}>—</span>}
                  </td>
                  <td style={tdSt}>
                    <span style={{ fontSize: 11, color: a.lastVisited ? C.blue : C.sub }}>{fmtVisit(a.lastVisited)}</span>
                  </td>
                  <td style={tdSt}>
                    {activeCount > 0 ? (
                      <span style={{ color: C.green, fontWeight: 600, fontSize: 12 }}>{activeCount}개</span>
                    ) : (
                      <span style={{ color: C.sub, fontSize: 12 }}>없음</span>
                    )}
                  </td>
                  <td style={{ ...tdSt, whiteSpace: "nowrap" }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Btn small ghost onClick={() => onEdit(a)}>수정</Btn>
                      {isInactive ? (
                        <><Btn small green onClick={() => onActivate(a)}>복구</Btn><Btn small danger onClick={() => onDelete(a)}>삭제</Btn></>
                      ) : (
                        <button onClick={() => onDeactivate(a)} style={{ background: "none", border: "none", color: C.sub, cursor: "pointer", fontSize: 11, padding: "4px 8px", opacity: 0.6 }}>비활성</button>
                      )}
                    </div>
                  </td>
                </tr>
                {isOpen && (
                  <tr key={a.id + "_detail"} style={{ background: C.rowEven }}>
                    <td colSpan={10} style={{ padding: 0, borderLeft: `3px solid ${grpColor}40` }}>
                      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "12px 20px", marginBottom: 14 }}>
                          {[
                            ["계정소유자", a.owner],
                            ["로그인방법", getLoginType(a)],
                            ["연동계정", getLinkedLabel(a.linkedAccount)],
                            ["URL", a.url],
                          ].map(([label, val]) => (
                            <div key={label}>
                              <div style={{ fontSize: 10, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 4 }}>{label}</div>
                              <span style={{ fontSize: 13, color: val ? C.text : C.sub }}>{val || "—"}</span>
                            </div>
                          ))}
                          {(a.authInfos || []).filter(ai => ai.method !== "없음").map((ai, idx) => {
                            const detail = [ai.phone, ai.serviceName, ai.email, ai.certName, ai.contact].filter(Boolean).join(" · ");
                            return (
                              <div key={`auth-${idx}`}>
                                <div style={{ fontSize: 10, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 4 }}>인증{idx + 1}</div>
                                <span style={{ fontSize: 13, color: C.text }}>{ai.method}{detail ? ` · ${detail}` : ""}</span>
                              </div>
                            );
                          })}
                          {a.note && (
                            <div>
                              <div style={{ fontSize: 10, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 4 }}>비고</div>
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
                            <button onClick={() => onAddService(a.id)} style={{ background: "none", border: `1px dashed ${C.border}`, color: C.muted, borderRadius: 8, padding: "10px 0", width: "100%", cursor: "pointer", fontSize: 13 }}>+ 서비스 추가</button>
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
            <tr><td colSpan={10} style={{ textAlign: "center", padding: 60, color: C.sub }}>계정이 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// 서비스 탭
// ─────────────────────────────────────────────────────
export function ServicesTab({ services, accounts, onEdit, onRenew, onEnd, onReactivate, onDelete }) {
  const accMap = Object.fromEntries(accounts.map(a => [a.id, a]));
  const alertSvcs = services.filter(s => { if (s.status !== "active") return false; const d = daysLeft(calcExpiry(s.startDate, s.period)); return d !== null && d <= s.alertDays; });
  return (
    <div>
      {alertSvcs.length > 0 && (
        <div style={{ background: C.warn + "0a", border: `1px solid ${C.warn}30`, borderRadius: 10, padding: "12px 18px", marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 10 }}>
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
      <div>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13, minWidth: 1000 }}>
          <thead>
            <tr>
              {["상태","계정소유자","그룹","계정ID","서비스명","이용시작일","기간","만료일","D-day","비용","자동갱신","액션"].map(h => (
                <th key={h} style={thSt}>{h}</th>
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
              const rowBg = i % 2 === 0 ? C.rowEven : C.rowOdd;
              return (
                <tr key={s.id} style={{ background: rowBg, borderBottom: `1px solid ${C.border}`, opacity: isEnded ? 0.5 : 1 }}
                  onMouseEnter={e => e.currentTarget.style.background = C.rowHover}
                  onMouseLeave={e => e.currentTarget.style.background = rowBg}>
                  <td style={tdSt}>{isEnded ? <Tag text="이용종료" color={C.sub} /> : <Tag text="이용중" color={C.green} />}</td>
                  <td style={tdSt}><span style={{ fontWeight: 600, color: C.text }}>{acc.owner || "—"}</span></td>
                  <td style={tdSt}>{acc.group ? <Tag text={acc.group} color={groupColors[acc.group] || C.sub} /> : "—"}</td>
                  <td style={tdSt}><span style={{ fontFamily: "monospace", color: C.muted, fontSize: 12 }}>{acc.username || "—"}</span></td>
                  <td style={tdSt}><span style={{ fontWeight: 700, textDecoration: isEnded ? "line-through" : "none", color: isEnded ? C.sub : C.text }}>{s.name}</span></td>
                  <td style={tdSt}><span style={{ color: C.muted }}>{s.startDate || "—"}</span></td>
                  <td style={tdSt}><Tag text={s.period} color={isEnded ? C.sub : C.blue} /></td>
                  <td style={tdSt}><span style={{ color: C.muted, fontSize: 12 }}>{fmtDate(exp)}</span></td>
                  <td style={tdSt}>{days === null || isEnded ? <span style={{ color: C.sub }}>—</span> : <span style={{ background: alertColor + "18", color: alertColor, border: `1px solid ${alertColor}35`, borderRadius: 5, padding: "2px 9px", fontSize: 12, fontWeight: 700 }}>{days > 0 ? `D-${days}` : days === 0 ? "오늘" : `+${Math.abs(days)}`}</span>}</td>
                  <td style={tdSt}><span style={{ fontFamily: "monospace", color: isEnded ? C.sub : C.green, fontWeight: 700 }}>{fmtCost(s.cost)}</span></td>
                  <td style={tdSt}>{isEnded ? "—" : <Tag text={s.autoRenew ? "자동" : "수동"} color={s.autoRenew ? C.green : C.sub} />}</td>
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
            {services.length === 0 && <tr><td colSpan={12} style={{ textAlign: "center", padding: 50, color: C.sub }}>서비스가 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
