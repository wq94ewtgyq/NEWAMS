// ─────────────────────────────────────────────────────
// API 유틸
// ─────────────────────────────────────────────────────
export const API = "/api";

export async function loadData() {
  const res = await fetch(`${API}/data`);
  if (!res.ok) throw new Error("데이터 로드 실패");
  const data = await res.json();
  return {
    accounts: data.accounts || [],
    services: data.services || [],
    owners: data.owners || [],
    groups: data.groups || [],
    platformOptions: data.platformOptions || [],
    typeOptions: data.typeOptions || [],
    tagOptions: data.tagOptions || [],
  };
}

export async function saveAllData({ accounts, services, owners, groups, platformOptions, typeOptions, tagOptions }) {
  const res = await fetch(`${API}/data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accounts, services, owners, groups, platformOptions, typeOptions, tagOptions }),
  });
  if (res.status === 503) throw new Error("다른 사용자가 저장 중입니다. 잠시 후 다시 시도하세요.");
  if (!res.ok) throw new Error("저장 실패");
}

// ─────────────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────────────
export const PERIOD_MAP = { "1개월": 1, "3개월": 3, "6개월": 6, "12개월": 12, "24개월": 24 };
export const uid = () => Math.random().toString(36).slice(2, 9);

export function calcExpiry(startDate, period) {
  if (!startDate || !period) return null;
  const months = PERIOD_MAP[period];
  if (!months) return null;
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + months);
  return d;
}
export function daysLeft(expiry) {
  if (!expiry) return null;
  return Math.ceil((expiry - new Date()) / 86400000);
}
export function fmtDate(d) {
  if (!d) return "—";
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}
export function fmtCost(v) {
  if (!v) return "—";
  return "₩" + Number(v).toLocaleString("ko-KR");
}

// ─────────────────────────────────────────────────────
// 색상 / 스타일 — 브랜드 컬러 #E81E1E
// ─────────────────────────────────────────────────────
export const C = {
  bg: "#090c17", surface: "#0f1220", border: "#1c2238", border2: "#242b42",
  text: "#dde2f0", muted: "#5a647a",
  accent: "#E81E1E", blue: "#4d8cff", warn: "#f59e0b", danger: "#ff5f5f",
  ended: "#3a4050", green: "#00d4aa",
};
export const inputSt = {
  background: "#070a14", border: `1px solid ${C.border2}`,
  borderRadius: 7, color: C.text, padding: "8px 11px",
  fontSize: 13, outline: "none", fontFamily: "inherit",
  width: "100%", boxSizing: "border-box",
};
export const tdSt = { padding: "11px 13px", verticalAlign: "middle", whiteSpace: "nowrap" };
export const groupColors = { "메인": "#E81E1E", "업무유틸": "#4d8cff", "데일리": "#f59e0b" };

// ─────────────────────────────────────────────────────
// 인증방법 옵션
// ─────────────────────────────────────────────────────
export const AUTH_METHODS = ["없음", "휴대폰문자", "휴대폰OTP", "이메일OTP", "보안카드"];

// ─────────────────────────────────────────────────────
// 폼 초기값
// ─────────────────────────────────────────────────────
export const emptyAccount = {
  owner: "", group: "", platforms: [], types: [], tags: [], accessType: "사이트",
  siteName: "", url: "", loginMethod: "일반", linkedAccount: "",
  username: "", password: "",
  authInfos: [{ method: "없음", contact: "" }],
  note: "",
};
export const emptyService = {
  accountId: "", name: "", startDate: "", period: "12개월",
  cost: "", autoRenew: false, alertDays: 30, note: "",
};
