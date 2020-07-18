import { minVersion } from '@kot-shrodingera-team/config/util';

const afterSuccesfulStake = (): void => {
  if (minVersion('0.1.814.0')) {
    worker.Helper.WriteLine('Обновление данных об успешной ставке');
    const lastStakeCoefficient = document.querySelector('.bs-OddsLabel');
    if (!lastStakeCoefficient) {
      worker.Helper.WriteLine('Не найден коэффициент последней ставки');
      return;
    }
    const coefficient = Number(lastStakeCoefficient.textContent);
    if (Number.isNaN(coefficient)) {
      worker.Helper.WriteLine(
        `Непонятный формат коэффициента последней ставки: ${lastStakeCoefficient.textContent}`
      );
      return;
    }
    if (coefficient !== worker.StakeInfo.Coef) {
      worker.Helper.WriteLine(
        `Коэффициент изменился: ${worker.StakeInfo.Coef} => ${coefficient}`
      );
      worker.StakeInfo.Coef = coefficient;
      return;
    }
    worker.Helper.WriteLine('Коэффициент не изменился');
  }
};

export default afterSuccesfulStake;
