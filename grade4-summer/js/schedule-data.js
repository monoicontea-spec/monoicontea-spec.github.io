/**
 * Load schedule data from JSON
 */
async function loadSchedule() {
  const res = await fetch("data/schedule.json");
  if (!res.ok) throw new Error("일정 데이터를 불러올 수 없습니다.");
  return res.json();
}

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
