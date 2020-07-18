import './workerCheck';
import './globalDefines/request';
import './bookmakerApi';
import { pipeHwlToConsole, checkUrl } from '@kot-shrodingera-team/config/util';
import getStakeInfo from './callbacks/getStakeInfo';
import setStakeSum from './callbacks/setStakeSum';
import doStake from './callbacks/doStake';
import checkCouponLoading, {
  clearSendMessageToTelegram,
} from './callbacks/checkCouponLoading';
import checkStakeStatus from './callbacks/checkStakeStatus';
import authorize from './authorize';
import showStake, { clearReloadCount, clearCashoutChecked } from './showStake';
import { clearTempMaximumStake } from './stakeInfo/getMaximumStake';
import afterSuccesfulStake from './callbacks/afterSuccesfulStake';
import { inPlayControlBarSelector } from './selectors';

pipeHwlToConsole();
clearSendMessageToTelegram();
clearReloadCount();

const FastLoad = async (): Promise<void> => {
  clearReloadCount();
  clearTempMaximumStake();
  clearCashoutChecked();
  worker.Helper.WriteLine('Быстрая загрузка');

  if (!document.querySelector(inPlayControlBarSelector)) {
    if (checkUrl()) {
      worker.Helper.WriteLine(
        'Открыта другая страница Bet365. Переходим на In-Play'
      );
      window.location.href = `${worker.BookmakerMainUrl}#/IP/`;
    } else {
      worker.Helper.WriteLine('Открыт другой сайт. Возвращаемся на Bet365');
      window.location.href = `${worker.BookmakerMainUrl}#/IP/`;
      return;
    }
  }
  showStake();
};

worker.SetCallBacks(
  console.log,
  getStakeInfo,
  setStakeSum,
  doStake,
  checkCouponLoading,
  checkStakeStatus,
  afterSuccesfulStake
);
worker.SetFastCallback(FastLoad);

(async (): Promise<void> => {
  worker.Helper.WriteLine('Начали');
  if (!worker.IsShowStake) {
    authorize();
  } else {
    showStake();
  }
})();
