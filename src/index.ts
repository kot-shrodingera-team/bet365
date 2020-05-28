import './workerCheck';
import './bookmakerApi';
import { sleep } from '@kot-shrodingera-team/config/util';
import getStakeInfo from './callbacks/getStakeInfo';
import setStakeSum from './callbacks/setStakeSum';
import doStake from './callbacks/doStake';
import checkCouponLoading, {
  clearSendMessageToTelegram,
} from './callbacks/checkCouponLoading';
import checkStakeStatus from './callbacks/checkStakeStatus';
import authorize from './authorize';
import showStake, { clearReloadCount } from './showStake';
import { inPlayControlBarSelector } from './selectors';
import { clearTempMaximumStake } from './getInfo';

clearSendMessageToTelegram();
clearReloadCount();

const FastLoad = async (): Promise<void> => {
  clearReloadCount();
  // worker.Helper.WriteLine('Быстрая загрузка');

  // Можно заменить на проверку url
  if (!document.querySelector(inPlayControlBarSelector)) {
    worker.Helper.WriteLine('Открываем In-Play');
    window.location.href = `${worker.BookmakerMainUrl}/#/IP/`;
  }
  clearTempMaximumStake();
  showStake();
};

worker.SetCallBacks(
  console.log,
  getStakeInfo,
  setStakeSum,
  doStake,
  checkCouponLoading,
  checkStakeStatus
);
worker.SetFastCallback(FastLoad);

(async (): Promise<void> => {
  worker.Helper.WriteLine('Начали');
  // await domLoaded();
  await sleep(3000);
  // console.log('DOM загружен');
  if (!worker.IsShowStake) {
    authorize();
  } else {
    // showStake();
  }
})();
