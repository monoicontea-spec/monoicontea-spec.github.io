/**
 * Google Sheets 실시간 연동 + JSON 폴백
 */
const SHEET_ID = "1o9U88xOretqHd1BoLspjJRVfbJmrHrTUiJcMs_QKq8g";
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri"];

const DAY_LABELS = {
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
};

const MODE_LABELS = {
  online: "온라인",
  offline: "오프라인",
};

function parseStudentCell(text) {
  const raw = String(text).trim();
  if (!raw) return null;

  const slashIdx = raw.lastIndexOf("/");
  if (slashIdx === -1) {
    return { name: raw, mode: null };
  }

  const name = raw.slice(0, slashIdx).trim();
  const modeText = raw.slice(slashIdx + 1).trim();
  const mode = modeText.includes("온라인") ? "online" : "offline";
  return { name, mode };
}

function parseSheetRows(rows) {
  let currentSlot = null;
  const schedule = {};
  const timeSlots = [];

  for (const row of rows) {
    const cells = row.c || [];
    const colA = cells[0]?.v != null ? String(cells[0].v).trim() : "";

    if (cells[1]?.v === "월요일") continue;

    if (colA && /^\d+시$/.test(colA)) {
      currentSlot = colA;
      if (!timeSlots.includes(currentSlot)) timeSlots.push(currentSlot);
      if (!schedule[currentSlot]) schedule[currentSlot] = {};
    }

    if (!currentSlot) continue;

    DAY_KEYS.forEach((dayKey, i) => {
      const val = cells[i + 1]?.v;
      if (val == null || String(val).trim() === "") return;

      const student = parseStudentCell(val);
      if (!student) return;

      if (!schedule[currentSlot][dayKey]) schedule[currentSlot][dayKey] = [];
      schedule[currentSlot][dayKey].push(student);
    });
  }

  return {
    title: "4학년 제품 썸머",
    timeSlots,
    days: DAY_KEYS,
    schedule,
    source: "sheet",
  };
}

async function loadScheduleFromSheet() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&t=${Date.now()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Google Sheets 연결 실패");

  const text = await res.text();
  const json = JSON.parse(text.replace(/^[\s\S]*?setResponse\(/, "").replace(/\);?\s*$/, ""));

  if (json.status !== "ok") throw new Error("시트 데이터를 읽을 수 없습니다.");

  return parseSheetRows(json.table.rows);
}

async function loadScheduleFromJson() {
  const res = await fetch(`data/schedule.json?t=${Date.now()}`);
  if (!res.ok) throw new Error("일정 데이터를 불러올 수 없습니다.");
  const data = await res.json();
  data.source = "json";
  return data;
}

async function loadSchedule() {
  try {
    return await loadScheduleFromSheet();
  } catch (sheetErr) {
    console.warn("Sheet load failed, falling back to JSON:", sheetErr);
    return loadScheduleFromJson();
  }
}
