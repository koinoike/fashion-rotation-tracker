// курс румбиков в рублях по пакетам
const RUMB_RATES = [
  { rumb: 21, rub: 100 },
  { rumb: 32, rub: 150 },
  { rumb: 120, rub: 500 },
  { rumb: 250, rub: 990 },
  { rumb: 500, rub: 1500 },
];

// находим минимальный и максимальный курс одного румбика
export const RUMB_COURSE = {
  min: Math.min(...RUMB_RATES.map((p) => p.rub / p.rumb)),
  max: Math.max(...RUMB_RATES.map((p) => p.rub / p.rumb)),
};

// функция для расчёта диапазона цены румбиков в рублях
export function rumbToRub(totalRumb) {
  return {
    min: totalRumb * RUMB_COURSE.min,
    max: totalRumb * RUMB_COURSE.max,
  };
}
