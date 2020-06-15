import {
  betslipBetSelector,
  betslipBetStakeSumInputSelector,
} from '../selectors';

const getSumFromCoupon = (): number => {
  const bet = document.querySelector(betslipBetSelector);
  if (!bet) {
    console.log('Нет ставки');
    return -1;
  }
  const stakeSumInput = bet.querySelector(
    betslipBetStakeSumInputSelector
  ) as HTMLInputElement;
  try {
    return parseFloat(stakeSumInput.value);
  } catch (e) {
    worker.Helper.WriteLine(`Ошибка получения суммы ставки - ${e}`);
    return -1;
  }
};

export default getSumFromCoupon;
