import {
  getWorkerParameter,
  awaiter,
  getElement,
  log,
  toFormData,
} from '@kot-shrodingera-team/germes-utils';

import { JsFailError } from '@kot-shrodingera-team/germes-utils/errors';
import findEventInOverview from './helpers/findEventInOverview';

const openEvent = async (): Promise<void> => {
  const prematchOnly = getWorkerParameter('prematchOnly');
  const sendLiveMatchTime = getWorkerParameter('sendLiveMatchTime');
  if (prematchOnly || sendLiveMatchTime) {
    if (window.location.hash === '#/IP/B1') {
      log('Открываем Overview футбола', 'orange');
      const footballIconSelected = await getElement(
        '.ovm-ClassificationBarButton-1.ovm-ClassificationBarButton-active'
      );
      if (!footballIconSelected) {
        throw new JsFailError('Иконка футбола не стала активной');
      }
    }
    await getElement('.ovm-Fixture');
    const targetMatch = await findEventInOverview();
    if (!targetMatch) {
      throw new JsFailError('Событие не найдено');
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
      throw new JsFailError('Не найдено время матча');
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
        throw new JsFailError('Матч уже начался');
      }
    }
  }
};

export default openEvent;
