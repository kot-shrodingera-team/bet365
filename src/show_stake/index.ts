import {
  log,
  awaiter,
  getElement,
  toFormData,
  sleep,
} from '@kot-shrodingera-team/germes-utils';
import WorkerBetObject from '@kot-shrodingera-team/worker-declaration/workerBetObject';
import { updateBalance, balanceReady } from '../stake_info/getBalance';
import {
  checkCashOutEnabled,
  accountLimited,
} from '../initialization/accountChecks';
import getStakeCount from '../stake_info/getStakeCount';
import getCurrentEventName from '../checkBet/getCurrentEventName';
import changeToStandardBetslip from './changeToStandardBetslip';
import checkAuth, { authStateReady } from '../stake_info/checkAuth';
import clearCoupon from './clearCoupon';
import checkCurrentLanguage from '../initialization/checkCurrentLanguage';
import { setConfig } from '../config';
import findEventInOverview from './findEventInOverview';

let couponOpenning = false;

export const isCouponOpenning = (): boolean => couponOpenning;

const jsFail = (message = ''): void => {
  if (message) {
    log(message, 'red');
  }
  couponOpenning = false;
  worker.JSFail();
};

const showStake = async (): Promise<void> => {
  couponOpenning = true;
  log(`Событие: ${worker.TeamOne} vs ${worker.TeamTwo}`, 'steelblue');
  log(`Ставка: ${worker.BetName}`, 'steelblue');
  if (
    worker.GetSessionData &&
    worker.GetSessionData('Bet365 Blocked') === '1'
  ) {
    const message =
      worker.SetBookmakerPaused && worker.SetBookmakerPaused(true)
        ? 'Аккаунт Bet365 заблокирован! Bet365 поставлен на паузу'
        : 'Аккаунт Bet365 заблокирован! Bet365 НЕ поставлен на паузу. Поставьте на паузу вручную';
    log(message, 'red');
    worker.Helper.SendInformedMessage(message);
    jsFail();
    return;
  }

  if (worker.IsRu && worker.Currency !== 'RUR') {
    jsFail(
      `Выбран ЦУПИС, но валюта не рубли (${worker.Currency}). Поменяйте валюту в настройках БК`
    );
    return;
  }

  if (
    /^(www\.)?bet365.ru$/.test(window.location.hostname) &&
    worker.Currency !== 'RUR'
  ) {
    jsFail(
      `Открыта RU версия сайта, но валюта не рубли (${worker.Currency}). Поменяйте валюту в настройках БК`
    );
    return;
  }

  if (
    !/^(www\.)?bet365.ru$/.test(new URL(worker.BookmakerMainUrl).hostname) &&
    worker.Currency === 'RUR'
  ) {
    jsFail(
      'Валюта рубли, но зеркало не bet365.ru. Поменяйте зеркало в настройках БК'
    );
    return;
  }

  const rawBetData = worker.BetId.split('_');
  if (rawBetData.length < 5) {
    jsFail('Некорректный формат данных о ставке. Сообщите в ТП');
    return;
  }
  const betData = rawBetData.slice(0, 4).concat(rawBetData.slice(4).join('_'));
  const [betId, fi, od, zw, config] = betData;
  setConfig(config);

  if (config.includes('reload_before_show_stake')) {
    if (localStorage.getItem('reloadedBeforeShowStake') === '0') {
      log('Перезагружаем страницу перед открытием ставки', 'orange');
      localStorage.setItem('reloadedBeforeShowStake', '1');
      window.location.reload();
      return;
    }
  }

  const locatorLoaded = await awaiter(
    () => typeof Locator !== 'undefined',
    10000
  );
  if (!locatorLoaded) {
    jsFail('API не загрузилось');
    return;
  }

  const remindLatterCode =
    `var remindLaterButton = document.querySelector('#remindLater');\n` +
    `if (remindLaterButton) {\n` +
    `  remindLatterButton.click();\n` +
    `}\n`;
  worker.ExecuteCodeInAllFrames(remindLatterCode);

  const remainLoginned = document.querySelector(
    '.alm-InactivityAlert_Remain'
  ) as HTMLElement;
  if (remainLoginned) {
    log('Нажимаем кнопку "Оставаться в системе"', 'orange');
    remainLoginned.click();
  }

  const freeBetMessageClose = document.querySelector(
    '.pm-FreeBetsPushGraphicOverlay_Close'
  ) as HTMLElement;
  if (freeBetMessageClose) {
    log('Закрываем сообщение о фрибетах', 'orange');
    freeBetMessageClose.click();
  }

  await authStateReady();
  worker.Islogin = checkAuth();
  worker.JSLogined();
  if (!worker.Islogin) {
    jsFail('Нет авторизации');
    return;
  }
  await balanceReady();
  updateBalance();

  if (!(await checkCurrentLanguage())) {
    jsFail();
    return;
  }
  log('Проверка языка прошла', 'steelblue');

  const cashOutEnabled = await checkCashOutEnabled();
  if (cashOutEnabled === 0) {
    log('Не удалось определить порезку аккаунта', 'steelblue');
  } else if (cashOutEnabled === -1) {
    accountLimited();
    if (worker.PauseOnLimitedAccount) {
      jsFail();
      return;
    }
  }

  const betslipModule = await getElement('.bsl-BetslipLoaderModule');
  if (!betslipModule) {
    jsFail('Не загрузился модуль купона');
    return;
  }

  if (typeof ns_favouriteslib_ui === 'undefined') {
    jsFail('Страница не догрузилась');
    window.location.href = new URL('/#/IP/', worker.BookmakerMainUrl).href;
    return;
  }

  // Если осталось висеть Check My Bets в купоне
  // const closeBetslipButton = document.querySelector(
  //   '.bss-DefaultContent_Close'
  // ) as HTMLElement;
  // if (closeBetslipButton) {
  //   log('Закрываем купон', 'orange);
  //   closeBetslipButton.click();
  // }

  const couponCleared = await clearCoupon();
  if (!couponCleared) {
    jsFail();
    return;
  }

  const remainLoggedInButton = document.querySelector(
    '.alm-ActivityLimitAlert_Button'
  ) as HTMLElement;
  if (remainLoggedInButton) {
    log('Нажимаем кнопку "Remain Logged In"', 'orange');
    remainLoggedInButton.click();
  }

  const prematchOnly = config.includes('prematch_only');
  const sendLiveMatchTime = config.includes('send_live_match_time');
  if (prematchOnly || sendLiveMatchTime) {
    if (window.location.hash === '#/IP/B1') {
      log('Открываем Overview футбола', 'orange');
      const footballIconSelected = await getElement(
        '.ovm-ClassificationBarButton-1.ovm-ClassificationBarButton-active'
      );
      if (!footballIconSelected) {
        jsFail('Иконка футбола не выбрана');
        return;
      }
    }
    await getElement('.ovm-Fixture');
    const targetMatch = await findEventInOverview();
    if (!targetMatch) {
      jsFail('Событие не найдено');
      return;
    }
    log('Определяем время матча', 'steelblue');
    await awaiter(() => {
      const timerElement = targetMatch.querySelector('.ovm-InPlayTimer');
      if (!timerElement) {
        return false;
      }
      return timerElement.textContent.trim();
    });
    const timerElement = targetMatch.querySelector('.ovm-InPlayTimer');
    if (!timerElement) {
      jsFail('Не найдено время матча');
      return;
    }
    const matchTime = timerElement.textContent.trim();
    log(`Время матча: ${matchTime}`);
    if (matchTime !== '00:00') {
      if (sendLiveMatchTime) {
        log('Отправляем время матча', 'orange');
        const bodyData = toFormData({
          bot_api: worker.ApiKey,
          fork_id: worker.ForkId,
          event_id: worker.EventId,
          match_time: matchTime,
        });
        fetch('https://strike.ws/bet_365_event_duration.php', {
          method: 'POST',
          body: bodyData,
        });
      }
      if (prematchOnly) {
        jsFail('Матч уже начался');
        return;
      }
    }
  }

  const ConstructString = `pt=N#o=${od}#f=${fi}#fp=${betId}#so=#c=1#mt=1#id=${zw}Y#|TP=BS${zw}#`;
  const Uid = '';
  // const pom = '1';
  const partType = 'N';
  const getSportType = (): string => partType;
  const getCastCode = (): string => '';
  const key = (): string => zw;
  const bet = {
    // pom,
    ConstructString,
    Uid,
  };

  Locator.betSlipManager.addBet({
    item: bet,
    action: 0,
    partType,
    constructString: ConstructString,
    key,
    getSportType,
    getCastCode,
  });

  const betAdded = await awaiter(() => getStakeCount() === 1);
  if (!betAdded) {
    jsFail('Ставка не попала в купон');
    return;
  }
  log('Купон открыт', 'steelblue');
  await Promise.race([
    getElement('.bss-NormalBetItem_FixtureDescription'),
    getElement('.qbs-StakeBox_StakeInput'),
  ]);
  const qbsStakeInput = document.querySelector('.qbs-StakeBox_StakeInput');
  if (qbsStakeInput) {
    log('Мобильный купон. Переключаем на стандартный', 'orange');
    const changed = await changeToStandardBetslip();
    if (!changed) {
      jsFail('Не удалось переключится на стандартный купон');
      return;
    }
  }
  if (getCurrentEventName() === null) {
    jsFail('Название события так и не повилось в купоне');
    return;
  }
  // Если есть параметр, нужно его дождаться
  const { param } = JSON.parse(worker.ForkObj) as WorkerBetObject;
  if (param) {
    const marketNameElement = document.querySelector(
      '.bss-NormalBetItem_Market'
    );
    if (!marketNameElement) {
      jsFail('Не найдена роспись ставки');
      return;
    }
    const marketName = marketNameElement.textContent.trim();
    if (!/^(Draw No Bet)$/i.test(marketName)) {
      log(
        'Ставка с параметром, ожидаем появления параметра в купоне',
        'steelblue'
      );
      // const parameterLoaded = await awaiter(
      //   () => getParameter() !== -6666 && getParameter() !== -9999,
      //   5000,
      //   50
      // );
      const parameterLoaded = await getElement('.bss-NormalBetItem_Handicap');
      if (!parameterLoaded) {
        jsFail('Параметр не появился');
        return;
      }
    }
  }
  const couponOpenDelayRegex = /coupon_open_delay=(\d+(?:\.\d+)?)/i;
  const couponOpenDelayMatch = config.match(couponOpenDelayRegex);
  if (couponOpenDelayMatch) {
    const delay = Number(couponOpenDelayMatch[1]);
    log(`Задержка ${delay} секунд после открытия купона`, 'orange');
    await sleep(delay * 1000);
  }
  const eventNameSelector = '.bss-NormalBetItem_FixtureDescription';
  const marketNameSelector = '.bss-NormalBetItem_Market';
  const betNameSelector = '.bss-NormalBetItem_Title';
  const eventNameElement = document.querySelector(eventNameSelector);
  if (!eventNameElement) {
    jsFail('Не найдено событие открытой ставки');
    return;
  }
  const marketNameElement = document.querySelector(marketNameSelector);
  if (!marketNameElement) {
    jsFail('Не найден маркет открытой ставки');
    return;
  }
  const betNameElement = document.querySelector(betNameSelector);
  if (!betNameElement) {
    jsFail('Не найдена роспись открытой ставки');
    return;
  }
  const eventName = eventNameElement.textContent.trim();
  const marketName = marketNameElement.textContent.trim();
  const betName = betNameElement.textContent.trim();
  log(`Открыта ставка\n${eventName}\n${marketName}\n${betName}`, 'steelblue');
  log('Ставка успешно открыта', 'green');
  couponOpenning = false;
  worker.JSStop();
  // const eventUrl = worker.EventUrl;
  // const [eventId] = eventUrl.split('/').slice(-1);
  // window.location.href = new URL(
  //   `/#/IP/${eventId}/`,
  //   window.location.origin
  // ).href;
};

export default showStake;
