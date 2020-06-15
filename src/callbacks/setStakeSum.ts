import { fireEvent } from '@kot-shrodingera-team/config/util';
import {
  betslipBetSelector,
  betslipBetStakeSumInputSelector,
} from '../selectors';
import {
  getTempMaximumStake,
  setTempMaximumStake,
} from '../stakeInfo/getMaximumStake';

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
  worker.Helper.WriteLine(`Вводим сумму ставки: ${sum}`);
  const tempMaximumStake = getTempMaximumStake();
  if (tempMaximumStake !== -1 && sum > tempMaximumStake) {
    worker.Helper.WriteLine(
      `Сумма (${sum} больше временного макса (${tempMaximumStake})`
    );
    const difference = Number((sum - tempMaximumStake).toFixed(2));
    const newTempMaximumStake = Number(
      (tempMaximumStake - difference).toFixed(2)
    );
    worker.Helper.WriteLine(`Новый временный макс: ${newTempMaximumStake}`);
    setTempMaximumStake(newTempMaximumStake);
  }
  stakeSumInput.value = String(sum);
  fireEvent(stakeSumInput, 'input');
  worker.StakeInfo.Summ = sum;
  return true;
};

export default setStakeSum;
