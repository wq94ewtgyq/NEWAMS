import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import { C, inputSt, groupColors, loadData, saveAllData, calcExpiry, daysLeft, uid, emptyAccount, emptyService, getLoginType } from "./constants.js";
import { Btn, Modal, ModalHeader, ModalFooter, FilterSel, ButtonFilter, Toast, Spinner, AccountForm, ServiceForm, ManageListModal } from "./components.jsx";
import { AccountsTab, ServicesTab } from "./tabs.jsx";

// ─────────────────────────────────────────────────────
// 로고 SVG (ROUTE BY 브랜드)
// ─────────────────────────────────────────────────────
function Logo() {
  return (
    <img src="/logo.png" alt="ROUTE BY" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
  );
}

// ─────────────────────────────────────────────────────
// 메인 앱
// ─────────────────────────────────────────────────────
export default function App() {
  const [accounts, setAccounts] = useState([]);
  const [services, setServices] = useState([]);
  const [owners, setOwners] = useState([]);
  const [groups, setGroups] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  const [tab, setTab]                     = useState("accounts");
  const [search1, setSearch1]             = useState("");
  const [search2, setSearch2]             = useState("");
  const [filterOwner, setFilterOwner]     = useState("전체");
  const [filterGroups, setFilterGroups]       = useState([]);
  const [filterTypes, setFilterTypes]          = useState([]);
  const [filterTags, setFilterTags]            = useState([]);
  const [filterService, setFilterService] = useState("전체");
  const [showEnded, setShowEnded]         = useState(false);
  const [showInactive, setShowInactive]   = useState(false);

  const [accModal, setAccModal]     = useState(null);
  const [accForm, setAccForm]       = useState(emptyAccount);
  const [svcModal, setSvcModal]     = useState(null);
  const [svcForm, setSvcForm]       = useState(emptyService);
  const [delConfirm, setDelConfirm] = useState(null);
  const [endConfirm, setEndConfirm] = useState(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState(null);
  const [activateConfirm, setActivateConfirm] = useState(null);

  const [manageOwners, setManageOwners]         = useState(false);
  const [manageGroups, setManageGroups]          = useState(false);
  const [manageTypes, setManageTypes]            = useState(false);
  const [manageTags, setManageTags]              = useState(false);
  const [showTrash, setShowTrash]                = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    loadData()
      .then(data => {
        const accs = (data.accounts || []).map(a => {
          if (a.visitHighlight && (!a.lastVisited || a.lastVisited.slice(0, 10) !== todayStr)) {
            return { ...a, visitHighlight: false };
          }
          return a;
        });
        setAccounts(accs);
        setServices(data.services || []);
        setOwners(data.owners || []);
        setGroups(data.groups || []);
        setTypeOptions(data.typeOptions || []);
        setTagOptions(data.tagOptions || []);
      })
      .catch(() => showToast("데이터를 불러오지 못했습니다.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const persist = useCallback(async (newAccounts, newServices, opts = {}) => {
    setSaving(true);
    try {
      await saveAllData({
        accounts: newAccounts ?? accounts,
        services: newServices ?? services,
        owners: opts.owners ?? owners,
        groups: opts.groups ?? groups,
        typeOptions: opts.typeOptions ?? typeOptions,
        tagOptions: opts.tagOptions ?? tagOptions,
      });
      showToast("저장되었습니다.");
    } catch (e) {
      showToast(e.message || "저장 중 오류가 발생했습니다.", "error");
    } finally {
      setSaving(false);
    }
  }, [showToast, accounts, services, owners, groups, typeOptions, tagOptions]);

  const ownerOptions = useMemo(() => ["전체", ...new Set(accounts.map(a => a.owner).filter(Boolean))], [accounts]);
  const groupOptions = useMemo(() => [...new Set(accounts.map(a => a.group).filter(Boolean))], [accounts]);

  const groupFilteredAccounts = useMemo(() => {
    if (filterGroups.length === 0) return accounts;
    return accounts.filter(a => filterGroups.includes(a.group));
  }, [accounts, filterGroups]);

  const filteredTypeOptions = useMemo(() => [...new Set(groupFilteredAccounts.flatMap(a => a.types || []))], [groupFilteredAccounts]);
  const filteredTagOptions = useMemo(() => [...new Set(groupFilteredAccounts.flatMap(a => a.tags || []))], [groupFilteredAccounts]);

  useEffect(() => {
    setFilterTypes(prev => prev.filter(t => filteredTypeOptions.includes(t)));
  }, [filteredTypeOptions]);
  useEffect(() => {
    setFilterTags(prev => prev.filter(t => filteredTagOptions.includes(t)));
  }, [filteredTagOptions]);

  const visibleAccounts = useMemo(() => accounts.filter(a => {
    if (a.status === "deleted") return false;
    if (!showInactive && a.status === "inactive") return false;
    return true;
  }), [accounts, showInactive]);
  const deletedAccounts = useMemo(() => accounts.filter(a => a.status === "deleted"), [accounts]);
  const inactiveCount = useMemo(() => accounts.filter(a => a.status === "inactive").length, [accounts]);

  const filteredAccounts = useMemo(() => visibleAccounts.filter(a => {
    const q1 = search1.toLowerCase();
    const q2 = search2.toLowerCase();
    const matchOwner = filterOwner === "전체" || a.owner === filterOwner;
    const matchGroup = filterGroups.length === 0 || filterGroups.includes(a.group);
    const matchType = filterTypes.length === 0 || (a.types || []).some(t => filterTypes.includes(t));
    const matchTag = filterTags.length === 0 || (a.tags || []).some(t => filterTags.includes(t));
    const vals = Object.values(a).map(v => {
      if (Array.isArray(v)) return v.map(x => typeof x === "object" ? Object.values(x).join(" ") : String(x)).join(" ");
      return String(v);
    }).join(" ").toLowerCase();
    const matchQ1 = !q1 || vals.includes(q1);
    const matchQ2 = !q2 || vals.includes(q2);

    let matchService = true;
    if (filterService === "Y") {
      matchService = services.some(s => s.accountId === a.id && s.status === "active");
    } else if (filterService === "N") {
      matchService = !services.some(s => s.accountId === a.id && s.status === "active");
    }

    return matchOwner && matchGroup && matchType && matchTag && matchQ1 && matchQ2 && matchService;
  }), [visibleAccounts, search1, search2, filterOwner, filterGroups, filterTypes, filterTags, filterService, services]);

  const filteredServices = useMemo(() => {
    const accIds = new Set(filteredAccounts.map(a => a.id));
    return services.filter(s => {
      const q1 = search1.toLowerCase();
      const q2 = search2.toLowerCase();
      const statusOk = showEnded ? true : s.status === "active";
      const vals = Object.values(s).join(" ").toLowerCase();
      return accIds.has(s.accountId) && statusOk
        && (!q1 || vals.includes(q1))
        && (!q2 || vals.includes(q2));
    });
  }, [services, filteredAccounts, search1, search2, showEnded]);

  const alertCount = useMemo(() => services.filter(s => {
    if (s.status !== "active") return false;
    const d = daysLeft(calcExpiry(s.startDate, s.period));
    return d !== null && d <= s.alertDays;
  }).length, [services]);

  const endedCount = useMemo(() => services.filter(s => s.status === "ended").length, [services]);

  // ── 계정 CRUD ──
  const openAddAcc  = () => { setAccForm({ ...emptyAccount }); setAccModal({ mode: "add" }); };
  const openEditAcc = a  => {
    setAccForm({
      ...a,
      types: a.types || [],
      tags: a.tags || [],
      authInfos: a.authInfos || [{ method: "없음", contact: "" }],
    });
    setAccModal({ mode: "edit", id: a.id });
  };

  const saveAcc = async () => {
    const next = accModal.mode === "add"
      ? [...accounts, { ...accForm, id: uid(), status: "active" }]
      : accounts.map(a => a.id === accModal.id ? { ...accForm, id: a.id, status: a.status || "active" } : a);
    setAccounts(next); setAccModal(null);
    await persist(next, services);
  };

  const deleteAcc = async id => {
    const nextAcc = accounts.map(a => a.id === id ? { ...a, status: "deleted" } : a);
    setAccounts(nextAcc); setDelConfirm(null);
    await persist(nextAcc, services);
    showToast("삭제된 계정으로 이동되었습니다. 복구 가능합니다.");
  };

  const restoreAcc = async id => {
    const nextAcc = accounts.map(a => a.id === id ? { ...a, status: "active" } : a);
    setAccounts(nextAcc);
    await persist(nextAcc, services);
    showToast("계정이 복구되었습니다.");
  };

  const confirmDeactivate = async () => {
    if (!deactivateConfirm) return;
    const nextAcc = accounts.map(a => a.id === deactivateConfirm.id ? { ...a, status: "inactive" } : a);
    setAccounts(nextAcc); setDeactivateConfirm(null);
    await persist(nextAcc, services);
    showToast("계정이 비활성 처리되었습니다.");
  };

  const confirmActivate = async () => {
    if (!activateConfirm) return;
    const nextAcc = accounts.map(a => a.id === activateConfirm.id ? { ...a, status: "active" } : a);
    setAccounts(nextAcc); setActivateConfirm(null);
    await persist(nextAcc, services);
    showToast("계정이 활성화되었습니다.");
  };

  const visitAccount = async id => {
    const now = new Date().toISOString();
    const nextAcc = accounts.map(a => a.id === id ? { ...a, lastVisited: now, visitHighlight: true } : a);
    setAccounts(nextAcc);
    await persist(nextAcc, services);
  };

  const resetVisits = async () => {
    const nextAcc = accounts.map(a => a.visitHighlight ? { ...a, visitHighlight: false } : a);
    setAccounts(nextAcc);
    await persist(nextAcc, services);
    showToast("접속 음영이 초기화되었습니다.");
  };

  const permanentDeleteAcc = async id => {
    const nextAcc = accounts.filter(a => a.id !== id);
    const nextSvc = services.filter(s => s.accountId !== id);
    setAccounts(nextAcc); setServices(nextSvc);
    await persist(nextAcc, nextSvc);
    showToast("계정이 완전 삭제되었습니다.");
  };

  // ── 서비스 CRUD ──
  const openAddSvc  = (accountId = "") => { setSvcForm({ ...emptyService, accountId }); setSvcModal({ mode: "add" }); };
  const openEditSvc = s => { setSvcForm({ ...s }); setSvcModal({ mode: "edit", id: s.id }); };

  const openRenewSvc = s => {
    setSvcForm({ accountId: s.accountId, name: s.name, startDate: "", period: s.period,
      cost: "", autoRenew: s.autoRenew, alertDays: s.alertDays, note: "" });
    setSvcModal({ mode: "renew", renewedFromId: s.id });
  };

  const saveSvc = async () => {
    let next;
    if (svcModal.mode === "add") {
      next = [...services, { ...svcForm, id: uid(), status: "active", renewedFromId: null }];
    } else if (svcModal.mode === "edit") {
      next = services.map(s => s.id === svcModal.id
        ? { ...svcForm, id: s.id, status: s.status, renewedFromId: s.renewedFromId } : s);
    } else {
      next = [...services, { ...svcForm, id: uid(), status: "active", renewedFromId: svcModal.renewedFromId }];
    }
    setServices(next); setSvcModal(null);
    await persist(accounts, next);
  };

  const deleteSvc  = async id => { const next = services.filter(s => s.id !== id); setServices(next); setDelConfirm(null); await persist(accounts, next); };
  const endService = async id => { const next = services.map(s => s.id === id ? { ...s, status: "ended" } : s); setServices(next); setEndConfirm(null); await persist(accounts, next); };
  const reactivate = async id => { const next = services.map(s => s.id === id ? { ...s, status: "active" } : s); setServices(next); await persist(accounts, next); };

  const svcByAcc = accId => services.filter(s => s.accountId === accId && (showEnded ? true : s.status === "active"));
  const svcModalTitle = svcModal?.mode === "add" ? "서비스 추가" : svcModal?.mode === "edit" ? "서비스 수정" : "서비스 갱신";

  // ── 관리 모달 저장 ──
  const saveOwners = async (list) => { setOwners(list); await persist(accounts, services, { owners: list }); };
  const saveGroups = async (list) => { setGroups(list); await persist(accounts, services, { groups: list }); };
  const saveTypeOpts = async (list) => { setTypeOptions(list); await persist(accounts, services, { typeOptions: list }); };
  const saveTagOpts = async (list) => { setTagOptions(list); await persist(accounts, services, { tagOptions: list }); };

  // ── 엑셀 내보내기 ──
  const exportExcel = () => {
    const data = accounts.map(a => {
      const svcs = services.filter(s => s.accountId === a.id && s.status === "active");
      const authStr = (a.authInfos || []).filter(ai => ai.method !== "없음").map(ai => {
        const parts = [ai.method, ai.phone, ai.serviceName, ai.email, ai.certName, ai.contact].filter(Boolean);
        return parts.join(":");
      }).join(" / ");
      const linkedAcc = accounts.find(la => la.id === a.linkedAccount);
      const linkedStr = linkedAcc ? `${linkedAcc.siteName || linkedAcc.url || ""}(${linkedAcc.username || ""})` : "";
      return {
        "계정소유자": a.owner,
        "그룹": a.group,
        "유형": (a.types || []).join(","),
        "태그": (a.tags || []).join(","),
        "사이트명": a.siteName || "",
        "URL": a.url,
        "로그인방법": getLoginType(a),
        "연동계정": linkedStr,
        "아이디": a.username,
        "패스워드": a.password,
        "인증정보": authStr,
        "비고": a.note,
        "서비스수": svcs.length,
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "계정목록");
    XLSX.writeFile(wb, `계정관리_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast("엑셀 파일이 다운로드되었습니다.");
  };

  // ── 엑셀 가져오기 ──
  const importExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);

        const newAccounts = [...accounts];
        let addCount = 0, updateCount = 0;
        const parseTags = str => String(str || "").split(",").map(s => s.replace(/\s/g, "")).filter(Boolean);

        const newOwners = new Set(owners);
        const newGroups = new Set(groups);
        const newTypes = new Set(typeOptions);
        const newTags = new Set(tagOptions);

        for (const row of rows) {
          const username = String(row["아이디"] || "").trim();
          const url = String(row["URL"] || "").trim();
          if (!username && !url) continue;

          const existing = newAccounts.find(a => a.username === username && a.url === url);

          const authStr = String(row["인증정보"] || "");
          const authInfos = authStr ? authStr.split(" / ").map(s => {
            const parts = s.split(":");
            const method = parts[0] || "없음";
            const info = { method };
            const fieldMap = { "SMS문자": "phone", "카카오톡": "phone", "이메일": "email", "공인인증서": "certName" };
            if (method === "휴대폰OTP") {
              info.serviceName = parts[1] || "";
              info.phone = parts[2] || "";
            } else if (fieldMap[method]) {
              info[fieldMap[method]] = parts[1] || "";
            }
            return info;
          }) : [{ method: "없음" }];

          const rowTypes = parseTags(row["유형"]);
          const rowTags = parseTags(row["태그"]);

          rowTypes.forEach(v => newTypes.add(v));
          rowTags.forEach(v => newTags.add(v));

          const rowOwner = String(row["계정소유자"] || "").replace(/\s/g, "");
          const rowGroup = String(row["그룹"] || "").replace(/\s/g, "");
          if (rowOwner) newOwners.add(rowOwner);
          if (rowGroup) newGroups.add(rowGroup);

          const accData = {
            owner: rowOwner,
            group: rowGroup,
            types: rowTypes,
            tags: rowTags,
            siteName: String(row["사이트명"] || ""),
            url: url,
            linkedAccount: "",
            username: username,
            password: String(row["패스워드"] || ""),
            authInfos: authInfos,
            note: String(row["비고"] || ""),
          };

          if (existing) {
            Object.assign(existing, accData);
            updateCount++;
          } else {
            newAccounts.push({ ...accData, id: uid() });
            addCount++;
          }
        }

        const updatedOwners = [...newOwners];
        const updatedGroups = [...newGroups];
        const updatedTypes = [...newTypes];
        const updatedTags = [...newTags];

        setAccounts(newAccounts);
        setOwners(updatedOwners);
        setGroups(updatedGroups);
        setTypeOptions(updatedTypes);
        setTagOptions(updatedTags);
        await persist(newAccounts, services, {
          owners: updatedOwners,
          groups: updatedGroups,
          typeOptions: updatedTypes,
          tagOptions: updatedTags,
        });
        showToast(`엑셀 가져오기 완료: ${addCount}건 추가, ${updateCount}건 수정`);
      } catch (err) {
        showToast("엑셀 파일 처리 중 오류가 발생했습니다.", "error");
      }
      e.target.value = "";
    };
    reader.readAsBinaryString(file);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Pretendard','Noto Sans KR',sans-serif" }}>
      <Spinner />
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: "'Pretendard','Noto Sans KR',sans-serif", color: C.text }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {saving && <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 9998, background: `linear-gradient(90deg,${C.accent},${C.blue})` }} />}

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <Logo />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>ROUTE BY <span style={{ color: C.brand }}>계정 관리</span></div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
              계정 {visibleAccounts.length}개 · 서비스 {services.filter(s => s.status === "active").length}개 이용중
              {alertCount > 0 && <span style={{ color: C.warn, marginLeft: 8 }}>⚠ 만료 임박 {alertCount}건</span>}
              {endedCount > 0 && <span style={{ color: C.ended, marginLeft: 8 }}>· 종료 {endedCount}건</span>}
              {saving && <span style={{ color: C.accent, marginLeft: 8 }}>저장 중...</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={importExcel} style={{ display: "none" }} />
          {deletedAccounts.length > 0 && (
            <Btn danger onClick={() => setShowTrash(true)} disabled={saving}>
              삭제된 계정 ({deletedAccounts.length})
            </Btn>
          )}
          <Btn ghost onClick={() => fileInputRef.current?.click()} disabled={saving}>엑셀 가져오기</Btn>
          <Btn ghost onClick={exportExcel} disabled={saving}>엑셀 내보내기</Btn>
          <Btn onClick={() => tab === "accounts" ? openAddAcc() : openAddSvc()} disabled={saving}>
            + {tab === "accounts" ? "계정 추가" : "서비스 추가"}
          </Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 28px", display: "flex" }}>
        {[["accounts", "계정 관리"], ["services", "서비스 관리"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ background: "none", border: "none", cursor: "pointer", color: tab === key ? C.accent : C.muted, fontWeight: tab === key ? 800 : 500, fontSize: 13, padding: "14px 20px", borderBottom: tab === key ? `2px solid ${C.accent}` : "2px solid transparent", transition: "all 0.2s" }}>{label}</button>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{ padding: "12px 28px", background: "#0b0e1a", borderBottom: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input placeholder="검색 1..." value={search1} onChange={e => setSearch1(e.target.value)} style={{ ...inputSt, width: 180, background: C.bg, padding: "7px 12px" }} />
          <input placeholder="검색 2..." value={search2} onChange={e => setSearch2(e.target.value)} style={{ ...inputSt, width: 180, background: C.bg, padding: "7px 12px" }} />
          <FilterSel label="소유자" value={filterOwner} options={ownerOptions} onChange={setFilterOwner} />
          <FilterSel label="서비스" value={filterService} options={["전체", "Y", "N"]} onChange={setFilterService} />
          <div style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", marginLeft: 8 }} onClick={() => setShowEnded(s => !s)}>
            <div style={{ width: 36, height: 20, borderRadius: 10, position: "relative", background: showEnded ? C.warn + "88" : "#1e2540", border: `1px solid ${showEnded ? C.warn : C.border2}`, transition: "background 0.2s" }}>
              <div style={{ position: "absolute", top: 2, left: showEnded ? 16 : 2, width: 14, height: 14, borderRadius: 7, background: showEnded ? C.warn : "#5a647a", transition: "left 0.2s" }} />
            </div>
            <span style={{ fontSize: 12, color: C.muted, userSelect: "none" }}>이용종료 포함 {endedCount > 0 && `(${endedCount})`}</span>
          </div>
          <button onClick={() => setShowInactive(s => !s)}
            style={{
              background: showInactive ? C.muted + "25" : "transparent",
              color: showInactive ? C.text : C.muted,
              border: `1px solid ${showInactive ? C.muted + "60" : C.border2}`,
              borderRadius: 5, padding: "4px 12px", fontSize: 11, fontWeight: 600,
              cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
            }}>
            비활성 포함 {inactiveCount > 0 && `(${inactiveCount})`}
          </button>
          <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>{tab === "accounts" ? `${filteredAccounts.length}개` : `${filteredServices.length}개`} 표시</span>
        </div>
        <ButtonFilter label="그룹" options={groupOptions} selected={filterGroups} onChange={setFilterGroups} color="#a78bfa" />
        <ButtonFilter label="유형" options={filteredTypeOptions} selected={filterTypes} onChange={setFilterTypes} color={C.blue} />
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <ButtonFilter label="태그" options={filteredTagOptions} selected={filterTags} onChange={setFilterTags} color={C.green} />
          </div>
          {accounts.some(a => a.visitHighlight) && (
            <Btn small ghost onClick={resetVisits}>접속음영 초기화</Btn>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: "auto", padding: 0 }}>
        {tab === "accounts" ? (
          <AccountsTab accounts={filteredAccounts} services={services} allAccounts={accounts} svcByAcc={svcByAcc} onEdit={openEditAcc}
            onDelete={r => setDelConfirm({ type: "account", id: r.id, label: `${r.owner}의 ${r.username}` })}
            onDeactivate={a => setDeactivateConfirm(a)} onActivate={a => setActivateConfirm(a)}
            onVisit={visitAccount} onResetVisits={resetVisits}
            onAddService={openAddSvc} onEditSvc={openEditSvc} onRenewSvc={openRenewSvc}
            onEndSvc={s => setEndConfirm(s)} onReactivate={reactivate}
            onDeleteSvc={s => setDelConfirm({ type: "service", id: s.id, label: s.name })} />
        ) : (
          <ServicesTab services={filteredServices} accounts={accounts} onEdit={openEditSvc}
            onRenew={openRenewSvc} onEnd={s => setEndConfirm(s)} onReactivate={reactivate}
            onDelete={s => setDelConfirm({ type: "service", id: s.id, label: s.name })} />
        )}
      </div>

      {/* Account Modal */}
      <Modal open={!!accModal} onClose={() => !saving && setAccModal(null)} wide>
        <ModalHeader title={accModal?.mode === "add" ? "계정 추가" : "계정 수정"} onClose={() => setAccModal(null)} />
        <AccountForm form={accForm} setForm={setAccForm}
          owners={owners} groups={groups}
          typeOptions={typeOptions} tagOptions={tagOptions}
          accounts={accounts}
          onManageOwners={() => setManageOwners(true)}
          onManageGroups={() => setManageGroups(true)}
          onManageTypes={() => setManageTypes(true)}
          onManageTags={() => setManageTags(true)}
        />
        <ModalFooter onCancel={() => setAccModal(null)} onSave={saveAcc} saving={saving} />
      </Modal>

      {/* Service Modal */}
      <Modal open={!!svcModal} onClose={() => !saving && setSvcModal(null)}>
        <ModalHeader title={svcModalTitle} onClose={() => setSvcModal(null)} />
        {svcModal?.mode === "renew" && (
          <div style={{ background: C.blue + "10", border: `1px solid ${C.blue}40`, borderRadius: 9, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: C.blue }}>
            새 서비스 행이 추가됩니다. 기존 행은 <strong>그대로 유지</strong>됩니다.
          </div>
        )}
        <ServiceForm form={svcForm} setForm={setSvcForm} accounts={accounts} lockAccount={svcModal?.mode === "renew"} />
        <ModalFooter onCancel={() => setSvcModal(null)} onSave={saveSvc} saveLabel={svcModal?.mode === "renew" ? "갱신 확정" : "저장"} saving={saving} />
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!delConfirm} onClose={() => !saving && setDelConfirm(null)}>
        <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
          <div style={{ fontSize: 38, marginBottom: 12 }}>⚠️</div>
          <h3 style={{ color: "#fff", margin: "0 0 8px", fontSize: 17 }}>삭제하시겠습니까?</h3>
          <p style={{ color: C.muted, fontSize: 13, margin: "0 0 22px" }}>
            <strong style={{ color: C.text }}>{delConfirm?.label}</strong>
            {delConfirm?.type === "account" && <span style={{ color: C.warn }}><br />삭제된 계정에서 복구할 수 있습니다.</span>}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn ghost onClick={() => setDelConfirm(null)} disabled={saving}>취소</Btn>
            <Btn danger disabled={saving} onClick={() => delConfirm.type === "account" ? deleteAcc(delConfirm.id) : deleteSvc(delConfirm.id)}>
              {saving ? "삭제 중..." : "삭제"}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* 비활성 Confirm */}
      <Modal open={!!deactivateConfirm} onClose={() => !saving && setDeactivateConfirm(null)}>
        <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
          <div style={{ fontSize: 38, marginBottom: 12 }}>⚠️</div>
          <h3 style={{ color: "#fff", margin: "0 0 8px", fontSize: 17 }}>정말로 비활성화 하시겠습니까?</h3>
          <p style={{ color: C.muted, fontSize: 13, margin: "0 0 6px" }}><strong style={{ color: C.text }}>{deactivateConfirm?.owner} · {deactivateConfirm?.username}</strong></p>
          <p style={{ color: C.muted, fontSize: 12, margin: "0 0 22px" }}>비활성된 계정은 기본 목록에서 숨겨집니다.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn ghost onClick={() => setDeactivateConfirm(null)} disabled={saving}>취소</Btn>
            <Btn warn onClick={confirmDeactivate} disabled={saving}>{saving ? "처리 중..." : "비활성화"}</Btn>
          </div>
        </div>
      </Modal>

      {/* 복구 Confirm */}
      <Modal open={!!activateConfirm} onClose={() => !saving && setActivateConfirm(null)}>
        <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
          <div style={{ fontSize: 38, marginBottom: 12 }}>🔄</div>
          <h3 style={{ color: "#fff", margin: "0 0 8px", fontSize: 17 }}>정말로 복구 하시겠습니까?</h3>
          <p style={{ color: C.muted, fontSize: 13, margin: "0 0 6px" }}><strong style={{ color: C.text }}>{activateConfirm?.owner} · {activateConfirm?.username}</strong></p>
          <p style={{ color: C.muted, fontSize: 12, margin: "0 0 22px" }}>계정이 활성 상태로 복구됩니다.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn ghost onClick={() => setActivateConfirm(null)} disabled={saving}>취소</Btn>
            <Btn accent onClick={confirmActivate} disabled={saving}>{saving ? "처리 중..." : "복구"}</Btn>
          </div>
        </div>
      </Modal>

      {/* 이용종료 Confirm */}
      <Modal open={!!endConfirm} onClose={() => !saving && setEndConfirm(null)}>
        <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
          <div style={{ fontSize: 38, marginBottom: 12 }}>🛑</div>
          <h3 style={{ color: "#fff", margin: "0 0 8px", fontSize: 17 }}>이용종료 처리하시겠습니까?</h3>
          <p style={{ color: C.muted, fontSize: 13, margin: "0 0 6px" }}><strong style={{ color: C.text }}>{endConfirm?.name}</strong></p>
          <p style={{ color: C.muted, fontSize: 12, margin: "0 0 22px" }}>
            이용종료 처리된 서비스는 기본 화면에서 숨겨집니다.<br />
            <span style={{ color: C.accent }}>"이용종료 포함"</span> 토글로 다시 확인할 수 있습니다.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn ghost onClick={() => setEndConfirm(null)} disabled={saving}>취소</Btn>
            <Btn warn onClick={() => endService(endConfirm.id)} disabled={saving}>{saving ? "처리 중..." : "이용종료"}</Btn>
          </div>
        </div>
      </Modal>

      {/* 소유자 관리 */}
      <ManageListModal open={manageOwners} onClose={() => setManageOwners(false)}
        title="계정소유자 관리" items={owners} onSave={saveOwners} />

      {/* 그룹 관리 */}
      <ManageListModal open={manageGroups} onClose={() => setManageGroups(false)}
        title="그룹 관리" items={groups} onSave={saveGroups} />

      {/* 유형 관리 */}
      <ManageListModal open={manageTypes} onClose={() => setManageTypes(false)}
        title="유형 관리" items={typeOptions} onSave={saveTypeOpts} />

      {/* 태그 관리 */}
      <ManageListModal open={manageTags} onClose={() => setManageTags(false)}
        title="태그 관리" items={tagOptions} onSave={saveTagOpts} />

      {/* 삭제된 계정 */}
      <Modal open={showTrash} onClose={() => setShowTrash(false)} wide>
        <ModalHeader title={`삭제된 계정 (${deletedAccounts.length})`} onClose={() => setShowTrash(false)} />
        <div style={{ maxHeight: 450, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {deletedAccounts.map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 9 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, color: "#fff", fontSize: 13 }}>{a.owner || "—"}</span>
                  {a.group && <span style={{ background: C.muted + "20", color: C.muted, borderRadius: 4, padding: "1px 6px", fontSize: 11 }}>{a.group}</span>}
                  <span style={{ color: C.blue, fontFamily: "monospace", fontSize: 12 }}>{a.username || "—"}</span>
                  <span style={{ color: C.muted, fontSize: 11 }}>{a.siteName || a.url || ""}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <Btn small green onClick={() => restoreAcc(a.id)} disabled={saving}>복구</Btn>
                <Btn small danger onClick={() => permanentDeleteAcc(a.id)} disabled={saving}>완전삭제</Btn>
              </div>
            </div>
          ))}
          {deletedAccounts.length === 0 && (
            <div style={{ textAlign: "center", color: C.muted, padding: 40, fontSize: 13 }}>삭제된 계정이 없습니다.</div>
          )}
        </div>
      </Modal>
    </div>
  );
}
