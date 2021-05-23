import { awaiter, getElement, log } from '@kot-shrodingera-team/germes-utils';

const getPlacedBetCoefficient = async (): Promise<void> => {
  const eventNameSelector = '.bss-NormalBetItem_FixtureDescription';
  const marketNameSelector = '.bss-NormalBetItem_Market';
  const betNameSelector = '.bss-NormalBetItem_Title';
  const betHandicapSelector = '.bss-NormalBetItem_Handicap';

  const eventNameElement = document.querySelector(eventNameSelector);
  if (!eventNameElement) {
    log('Не найдено событие результата', 'crimson');
    return;
  }
  const marketNameElement = document.querySelector(marketNameSelector);
  if (!marketNameElement) {
    log('Не найден маркет результата', 'crimson');
    return;
  }
  const betNameElement = document.querySelector(betNameSelector);
  if (!betNameElement) {
    log('Не найдена роспись результата', 'crimson');
    return;
  }

  const eventName = eventNameElement.textContent.trim();
  const marketName = marketNameElement.textContent.trim();
  const betHandicapElement = document.querySelector(betHandicapSelector);
  const betHandicap = betHandicapElement
    ? betHandicapElement.textContent.trim()
    : '';

  const betNameRaw = betNameElement.textContent.trim();

  const betName = betHandicap
    ? betNameRaw.replace(betHandicap, ` ${betHandicap}`)
    : betNameRaw;

  log(`Результат:\n${eventName}\n${marketName}\n${betName}`, 'steelblue');

  const betReferenceElement = document.querySelector(
    '.bss-ReceiptContent_BetRef'
  );
  if (!betReferenceElement) {
    log('Не найден Bet Ref успешной ставки', 'crimson');
    return;
  }
  const betReferenceText = betReferenceElement.textContent.trim();
  const betReferenceRegex = /^Bet Ref (.*)$/i;
  const betReferenceMatch = betReferenceText.match(betReferenceRegex);
  if (!betReferenceMatch) {
    log(`Не понятный формат Bet Ref: "${betReferenceText}"`, 'crimson');
    return;
  }
  const betReference = betReferenceMatch[1];
  log(`Bet Ref: "${betReference}"`, 'steelblue');

  const myBetsDropdown = document.querySelector<HTMLElement>(
    '.mbr-MyBetsRhsModule .mbr-Header_DropDownLabel'
  );
  if (!myBetsDropdown) {
    log('Не найден элемент выбора фильтра My Bets', 'crimson');
    return;
  }
  if (myBetsDropdown.textContent.trim() !== 'All') {
    log('Переключаем на All фильтр My Bets', 'orange');
    myBetsDropdown.click();
    const myBetsDropdownAll = [
      ...document.querySelectorAll<HTMLElement>(
        '.mbr-MyBetsRhsModule .mbr-DropDownItem'
      ),
    ].find((element) => element.textContent.trim() === 'All');
    if (!myBetsDropdownAll) {
      log('Не найден All фильтр My Bets', 'crimson');
      return;
    }
    myBetsDropdownAll.click();
    const myBetsAllSelected = await awaiter(
      () => myBetsDropdown.textContent.trim() === 'All',
      1000
    );
    if (!myBetsAllSelected) {
      log('Не удалось переключиться на All фильтр My Bets', 'crimson');
      return;
    }
    log('Ждём появления последней ставки в My Bets', 'steelblue');
    await getElement<HTMLElement>('.mbr-OpenBetItem');
  } else {
    log('Уже выбран All фильтр My Bets', 'steelblue');
    if (window.germesData.prevLastBet) {
      log('Ждём обновления последней ставки в My Bets', 'steelblue');
      const lastBetUpdated = await awaiter(
        () =>
          window.germesData.prevLastBet !==
          document.querySelector('.mbr-OpenBetItem')
      );
      if (!lastBetUpdated) {
        log('Не обновилась последняя ставка в My Bets', 'crimson');
        return;
      }
      log('Обновилась последняя ставка в My Bets', 'steelblue');
    }
  }
  const lastBet = document.querySelector<HTMLElement>('.mbr-OpenBetItem');
  if (!lastBet) {
    log('Не найдена последняя ставка в My Bets', 'crimson');
    return;
  }
  if (lastBet.classList.contains('mbr-OpenBetItem_Collapsed')) {
    log('Раскрываем последнюю ставку в My Bets', 'orange');
    lastBet.click();
  } else {
    log('Уже раскрыта последняя ставка в My Bets', 'steelblue');
  }

  const lastBetEventNameElement = document.querySelector(
    '.mbr-BetParticipant_FixtureName'
  );
  if (!lastBetEventNameElement) {
    log('Не найдено событие последней ставки', 'crimson');
    return;
  }
  const lastBetMaretNameElement = document.querySelector(
    '.mbr-BetParticipant_MarketDescription'
  );
  if (!lastBetMaretNameElement) {
    log('Не найден маркет последней ставки', 'crimson');
    return;
  }
  const lastBetBetNameElement = document.querySelector(
    '.mbr-BetParticipant_ParticipantSpanText'
  );
  if (!lastBetBetNameElement) {
    log('Не найдена роспись последней ставки', 'crimson');
    return;
  }
  const lastBetEventName = lastBetEventNameElement.textContent.trim();
  const lastBetMarketName = lastBetMaretNameElement.textContent.trim();
  const lastBetBetName = lastBetBetNameElement.textContent.trim();

  log(
    `Последняя ставка:\n${lastBetEventName}\n${lastBetMarketName}\n${lastBetBetName}`,
    'steelblue'
  );

  if (eventName !== lastBetEventName) {
    log('Не совпадают события', 'crimson');
    log(`${eventName} != ${lastBetEventName}`, 'crimson');
    return;
  }
  if (marketName !== lastBetMarketName) {
    log('Не совпадают маркеты', 'crimson');
    log(`${marketName} != ${lastBetMarketName}`, 'crimson');
    return;
  }
  if (betName !== lastBetBetName) {
    log('Не совпадают росписи', 'crimson');
    log(`${betName} != ${lastBetBetName}`, 'crimson');
    return;
  }

  const lastBetOddElement = document.querySelector(
    '.mbr-BetParticipant_HeaderOdds'
  );
  if (!lastBetOddElement) {
    log('Не найден коэффициент последней ставки', 'crimson');
    return;
  }
  const lastBetOddText = lastBetOddElement.textContent.trim();
  const lastBetOdd = Number(lastBetOddText);
  if (Number.isNaN(lastBetOdd)) {
    log(
      `Непонятный формат коэффициента последней ставки: "${lastBetOddText}"`,
      'crimson'
    );
    return;
  }
  log(`Итоговый коэффициент: ${lastBetOdd}`, 'steelblue');

  window.germesData.resultCoefficient = lastBetOdd;
};

export default getPlacedBetCoefficient;
