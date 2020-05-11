import { fireEvent } from '@kot-shrodingera-team/config/util';
import {
  betslipBetSelector,
  betslipBetStakeSumInputSelector,
} from '../selectors';

const setStakeSum = (sum: number): boolean => {
  const bet = document.querySelector(betslipBetSelector);
  if (!bet) {
    worker.Helper.WriteLine(`Ошибка ввода суммы ставки: Не найден купон`);
    return false;
  }
  const stakeSumInput = bet.querySelector(
    betslipBetStakeSumInputSelector
  ) as HTMLInputElement;
  if (!stakeSumInput) {
    worker.Helper.WriteLine(
      `Ошибка ввода суммы ставки: Не найдено поле ввода суммы ставки`
    );
    return false;
  }
  stakeSumInput.value = String(sum);
  fireEvent(stakeSumInput, 'input');
  return true;
};

export default setStakeSum;
