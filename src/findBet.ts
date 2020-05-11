import {
  participantSelector,
  marketGroupSelector,
  marketGroupHeaderSelector,
  closedMarketGroupButtonSelector,
  buttonBarItemNotSelectedSelector,
} from './selectors';

type Participant = HTMLElement & {
  wrapper: {
    betslip_participantID: () => string;
    _suspended: boolean;
  };
};

const findBet = (): Participant => {
  let participants = [
    ...document.querySelectorAll(participantSelector),
  ] as Participant[];
  let participant = participants.find(
    (element) => element.wrapper.betslip_participantID() === worker.BetId
  );

  if (!participant) {
    const marketGroups = [
      ...document.querySelectorAll(marketGroupSelector),
    ] as HTMLElement[];
    console.log(`Смотрим группы (${marketGroups.length})`);
    // eslint-disable-next-line no-restricted-syntax
    for (const marketGroup of marketGroups) {
      const marketGroupHeader = marketGroup.querySelector(
        marketGroupHeaderSelector
      ).textContent;
      if (marketGroup.querySelector(closedMarketGroupButtonSelector)) {
        console.log(`Разворачиваем маркет ${marketGroupHeader}`);
        marketGroup.click();
        participants = [
          ...marketGroup.querySelectorAll(participantSelector),
        ] as Participant[];
        participant = participants.find(
          (element) => element.wrapper.betslip_participantID() === worker.BetId
        );
        if (participant) {
          break;
        }
      }
      const buttonBarItemNotSelected = marketGroup.querySelector(
        buttonBarItemNotSelectedSelector
      ) as HTMLElement;
      if (buttonBarItemNotSelected) {
        const buttonBarItemNotSelectedText =
          buttonBarItemNotSelected.textContent;
        if (['2-Way', '3-Way'].includes(buttonBarItemNotSelectedText)) {
          console.log(
            `Переключаем маркет ${marketGroupHeader} на ${buttonBarItemNotSelectedText}`
          );
          buttonBarItemNotSelected.click();
          participants = [
            ...marketGroup.querySelectorAll(participantSelector),
          ] as Participant[];
          participant = participants.find(
            (element) =>
              element.wrapper.betslip_participantID() === worker.BetId
          );
          if (participant) {
            break;
          }
        }
      }
    }
  }
  return participant;
};

export default findBet;
