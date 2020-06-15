import { betslipBetSelector, betslipBetOddsSelector } from '../selectors';

const getCoefficient = (): number => {
  const bet = document.querySelector(betslipBetSelector);
  if (!bet) {
    console.log('Нет ставки');
    return -1;
  }
  const odds = bet.querySelector(betslipBetOddsSelector);
  try {
    const coefficient = Number(odds.textContent);
    if (Number.isNaN(coefficient)) {
      worker.Helper.WriteLine(
        `Не удалось определить коэффициент (${odds.textContent})`
      );
      return 1;
    }
    return coefficient;
  } catch (e) {
    worker.Helper.WriteLine(`Ошибка получения коэффициента - ${e}`);
    return -1;
  }
};

export default getCoefficient;
