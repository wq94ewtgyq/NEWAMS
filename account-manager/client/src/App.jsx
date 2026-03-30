import { useState, useMemo, useEffect, useCallback } from "react";
import { C, inputSt, groupColors, loadData, saveData, calcExpiry, daysLeft, uid, emptyAccount, emptyService } from "./constants.js";
import { Btn, Modal, ModalHeader, ModalFooter, FilterSel, Toast, Spinner, AccountForm, ServiceForm } from "./components.jsx";
import { AccountsTab, ServicesTab } from "./tabs.jsx";

// ─────────────────────────────────────────────────────
// 메인 앱
// ─────────────────────────────────────────────────────
export default function App() {
  const [accounts, setAccounts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  const [tab, setTab]                 = useState("accounts");
  const [search, setSearch]           = useState("");
  const [filterOwner, setFilterOwner] = useState("전체");
  const [filterGroup, setFilterGroup] = useState("전체");
  const [showEnded, setShowEnded]     = useState(false);

  const [accModal, setAccModal]     = useState(null);
  const [accForm, setAccForm]       = useState(emptyAccount);
  const [svcModal, setSvcModal]     = useState(null);
  const [svcForm, setSvcForm]       = useState(emptyService);
  const [delConfirm, setDelConfirm] = useState(null);
  const [endConfirm, setEndConfirm] = useState(null);

  useEffect(() => {
    loadData()
      .then(data => { setAccounts(data.accounts || []); setServices(data.services || []); })
      .catch(() => showToast("데이터를 불러오지 못했습니다.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const persist = useCallback(async (newAccounts, newServices) => {
    setSaving(true);
    try {
      await saveData(newAccounts, newServices);
      showToast("저장되었습니다.");
    } catch (e) {
      showToast(e.message || "저장 중 오류가 발생했습니다.", "error");
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  const owners = useMemo(() => ["전체", ...new Set(accounts.map(a => a.owner))], [accounts]);
  const groups  = useMemo(() => ["전체", ...new Set(accounts.map(a => a.group))], [accounts]);

  const filteredAccounts = useMemo(() => accounts.filter(a => {
    const q = search.toLowerCase();
    return (filterOwner === "전체" || a.owner === filterOwner)
      && (filterGroup === "전체" || a.group === filterGroup)
      && (!q || Object.values(a).some(v => String(v).toLowerCase().includes(q)));
  }), [accounts, search, filterOwner, filterGroup]);

  const filteredServices = useMemo(() => {
    const accIds = new Set(filteredAccounts.map(a => a.id));
    return services.filter(s => {
      const q = search.toLowerCase();
      const statusOk = showEnded ? true : s.status === "active";
      return accIds.has(s.accountId) && statusOk
        && (!q || Object.values(s).some(v => String(v).toLowerCase().includes(q)));
    });
  }, [services, filteredAccounts, search, showEnded]);

  const alertCount = useMemo(() => services.filter(s => {
    if (s.status !== "active") return false;
    const d = daysLeft(calcExpiry(s.startDate, s.period));
    return d !== null && d <= s.alertDays;
  }).length, [services]);

  const endedCount = useMemo(() => services.filter(s => s.status === "ended").length, [services]);

  const openAddAcc  = () => { setAccForm({ ...emptyAccount }); setAccModal({ mode: "add" }); };
  const openEditAcc = a  => { setAccForm({ ...a });            setAccModal({ mode: "edit", id: a.id }); };

  const saveAcc = async () => {
    const next = accModal.mode === "add"
      ? [...accounts, { ...accForm, id: uid() }]
      : accounts.map(a => a.id === accModal.id ? { ...accForm, id: a.id } : a);
    setAccounts(next); setAccModal(null);
    await persist(next, services);
  };

  const deleteAcc = async id => {
    const nextAcc = accounts.filter(a => a.id !== id);
    const nextSvc = services.filter(s => s.accountId !== id);
    setAccounts(nextAcc); setServices(nextSvc); setDelConfirm(null);
    await persist(nextAcc, nextSvc);
  };

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
  const svcModalTitle = svcModal?.mode === "add" ? "✚ 서비스 추가" : svcModal?.mode === "edit" ? "✎ 서비스 수정" : "🔄 서비스 갱신";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Pretendard','Noto Sans KR',sans-serif" }}>
      <Spinner />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Pretendard','Noto Sans KR',sans-serif", color: C.text }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {saving && <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 9998, background: `linear-gradient(90deg,${C.accent},${C.blue})` }} />}

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg,#00d4aa,#0084ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🔐</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>계정 관리 시스템</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
              계정 {accounts.length}개 · 서비스 {services.filter(s => s.status === "active").length}개 이용중
              {alertCount > 0 && <span style={{ color: C.warn, marginLeft: 8 }}>⚠ 만료 임박 {alertCount}건</span>}
              {endedCount > 0 && <span style={{ color: C.ended, marginLeft: 8 }}>• 종료 {endedCount}건</span>}
              {saving && <span style={{ color: C.accent, marginLeft: 8 }}>저장 중...</span>}
            </div>
          </div>
        </div>
        <Btn onClick={() => tab === "accounts" ? openAddAcc() : openAddSvc()} disabled={saving}>
          + {tab === "accounts" ? "계정 추가" : "서비스 추가"}
        </Btn>
      </div>

      {/* Tabs */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 28px", display: "flex" }}>
        {[["accounts", "계정 관리"], ["services", "서비스 관리"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ background: "none", border: "none", cursor: "pointer", color: tab === key ? C.accent : C.muted, fontWeight: tab === key ? 800 : 500, fontSize: 13, padding: "14px 20px", borderBottom: tab === key ? `2px solid ${C.accent}` : "2px solid transparent", transition: "all 0.2s" }}>{label}</button>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{ padding: "12px 28px", background: "#0b0e1a", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input placeholder="🔍  검색..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputSt, width: 210, background: C.bg, padding: "7px 12px" }} />
        <FilterSel label="소유자" value={filterOwner} options={owners} onChange={setFilterOwner} />
        <FilterSel label="그룹"   value={filterGroup}  options={groups}  onChange={setFilterGroup} />
        <div style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", marginLeft: 8 }} onClick={() => setShowEnded(s => !s)}>
          <div style={{ width: 36, height: 20, borderRadius: 10, position: "relative", background: showEnded ? C.warn + "88" : "#1e2540", border: `1px solid ${showEnded ? C.warn : C.border2}`, transition: "background 0.2s" }}>
            <div style={{ position: "absolute", top: 2, left: showEnded ? 16 : 2, width: 14, height: 14, borderRadius: 7, background: showEnded ? C.warn : "#5a647a", transition: "left 0.2s" }} />
          </div>
          <span style={{ fontSize: 12, color: C.muted, userSelect: "none" }}>이용종료 포함 {endedCount > 0 && `(${endedCount})`}</span>
        </div>
        <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>{tab === "accounts" ? `${filteredAccounts.length}개` : `${filteredServices.length}개`} 표시</span>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 28px" }}>
        {tab === "accounts" ? (
          <AccountsTab accounts={filteredAccounts} svcByAcc={svcByAcc} onEdit={openEditAcc}
            onDelete={r => setDelConfirm({ type: "account", id: r.id, label: `${r.owner}의 ${r.username}` })}
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
      <Modal open={!!accModal} onClose={() => !saving && setAccModal(null)}>
        <ModalHeader title={accModal?.mode === "add" ? "✚ 계정 추가" : "✎ 계정 수정"} onClose={() => setAccModal(null)} />
        <AccountForm form={accForm} setForm={setAccForm} />
        <ModalFooter onCancel={() => setAccModal(null)} onSave={saveAcc} saving={saving} />
      </Modal>

      {/* Service Modal */}
      <Modal open={!!svcModal} onClose={() => !saving && setSvcModal(null)}>
        <ModalHeader title={svcModalTitle} onClose={() => setSvcModal(null)} />
        {svcModal?.mode === "renew" && (
          <div style={{ background: C.blue + "10", border: `1px solid ${C.blue}40`, borderRadius: 9, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: C.blue }}>
            🔄 새 서비스 행이 추가됩니다. 기존 행은 <strong>그대로 유지</strong>됩니다.<br />
            <span style={{ color: C.muted, fontSize: 12 }}>기존 이용기간 만료 후 직접 <strong style={{ color: C.text }}>이용종료</strong> 버튼을 눌러 종료 처리하세요.</span>
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
            {delConfirm?.type === "account" && <span style={{ color: C.danger }}><br />연결된 서비스도 모두 삭제됩니다.</span>}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn ghost onClick={() => setDelConfirm(null)} disabled={saving}>취소</Btn>
            <Btn danger disabled={saving} onClick={() => delConfirm.type === "account" ? deleteAcc(delConfirm.id) : deleteSvc(delConfirm.id)}>
              {saving ? "삭제 중..." : "삭제"}
            </Btn>
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
    </div>
  );
}
