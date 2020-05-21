import {
  awaiter,
  fireEvent,
  getElement,
} from '@kot-shrodingera-team/config/util';
import {
  inPlayControlBarSelectedItemSelector,
  inPlayControlBarItemSelector,
  eventNameSelector,
  // leftSideBarCompetitionSelector,
  // teamStackTeamSelector,
  overviewClassificationBarSelector,
  overviewSportHeaderSelector,
  overviewCompetitionSelector,
  overviewTeamStackTeamSelector,
} from './selectors';
import { ri } from './checkBet/util';

export const getCurrentEventName = (): string => {
  const eventNameElement = document.querySelector(eventNameSelector);
  if (!eventNameElement) {
    console.log(
      'Ошибка получения заголовка события: Не найден заголовок события'
    );
    return null;
  }
  return eventNameElement.textContent;
};

export type teamNames = { teamOne: string; teamTwo: string };

const getWorkerTeamNames = (): teamNames => {
  let teamOne = worker.TeamOne;
  let teamTwo = worker.TeamTwo;
  if (teamOne.split('/ ').length === 2) {
    teamOne = teamOne.replace('/ ', '/');
  }
  if (teamTwo.split('/ ').length === 2) {
    teamTwo = teamTwo.replace('/ ', '/');
  }
  return { teamOne, teamTwo };
};

export const getSiteTeamNames = (): teamNames => {
  const eventName = getCurrentEventName();
  let eventTeams = eventName.split(' v ');
  if (eventTeams.length !== 2) {
    eventTeams = eventName.split(' vs ');
  }
  if (eventTeams.length !== 2) {
    eventTeams = eventName.split(' @ ');
  }
  if (eventTeams.length !== 2) {
    return null;
  }
  return { teamOne: eventTeams[0], teamTwo: eventTeams[1] };
};

const normalize = (string: string): string => {
  // Убираем диактрику
  let result = string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Заменяем дефисы и точки на пробелы
  result = result.replace(/[.-]/g, ' ');
  // Убираем знаки восклицания и кавычки
  result = result.replace(/!'/g, '');
  // Убираем лишние пробелы
  result = result.replace(/\s+/g, ' ').trim();
  return result;
};

const compareTeamNames = (
  workerTeamNames: teamNames,
  siteTeamNames: teamNames
): boolean => {
  const { teamOne: workerTeamOne, teamTwo: workerTeamTwo } = workerTeamNames;
  const { teamOne: siteTeamOne, teamTwo: siteTeamTwo } = siteTeamNames;
  return (
    ri`${normalize(workerTeamOne)}(\s*\(.*\))?(\s*Esports)?`.test(
      normalize(siteTeamOne)
    ) &&
    ri`${normalize(workerTeamTwo)}(\s*\(.*\))?(\s*Esports)?`.test(
      normalize(siteTeamTwo)
    )
  );
};

const checkCurrentEvent = (): boolean => {
  console.log('Проверка текущего открытого события');
  const eventName = getCurrentEventName();
  if (!eventName) {
    console.log('Заголовка ещё нет');
    return false;
  }
  console.log(`Заголовок события - ${eventName}`);
  const siteTeamNames = getSiteTeamNames();
  if (siteTeamNames === null) {
    console.log('Ошибка получения игроков из заголовка события');
    return false;
  }
  const workerTeamNames = getWorkerTeamNames();
  console.log(siteTeamNames);
  console.log(workerTeamNames);
  if (compareTeamNames(workerTeamNames, siteTeamNames)) {
    console.log(`Заголовок подходит`);
    return true;
  }
  console.log('Заголовок не подходит');
  return false;
};

const getTeamNamesFromTeamStack = (
  teamStack: Element,
  teamStackTeamSelector: string
): teamNames => {
  const teamStackTeams = teamStack.querySelectorAll(teamStackTeamSelector);
  if (teamStackTeams.length !== 2) {
    console.log('Количество команд в teamStack не равно двум');
    console.log(teamStack);
    console.log(teamStackTeams);
    return null;
  }
  return {
    teamOne: teamStackTeams[0].textContent,
    teamTwo: teamStackTeams[1].textContent,
  };
};

// const findEventInSideBar = (): Element => {
//   worker.Helper.WriteLine('Ищем событие в боковом меню');

//   const competitions = [
//     ...document.querySelectorAll(leftSideBarCompetitionSelector),
//   ];
//   if (competitions.length === 0) {
//     worker.Helper.WriteLine('Не найдено событий в боковом меню');
//     return null;
//   }
//   const normalizedWorkerTeamNames = getNormalizedWorkerTeamNames();

//   const competition = competitions.find((teamStack) => {
//     const teamStackTeamNames = getTeamNamesFromTeamStack(
//       teamStack,
//       teamStackTeamSelector
//     );
//     if (teamStackTeamNames === null) {
//       return null;
//     }
//     return compareTeamNames(normalizedWorkerTeamNames, teamStackTeamNames);
//   });

//   if (!competition) {
//     worker.Helper.WriteLine('Событие не найдено в боковом меню');
//     return null;
//   }
//   return competition;
// }

const getBet365SportId = (): number => {
  switch (worker.SportId) {
    case 1:
      return 1;
    case 2:
      return 13;
    case 3:
      return 17;
    case 4:
      return 18;
    case 5:
      return 91;
    case 6:
      return 78;
    case 7:
      return 92;
    case 8:
      return 83;
    case 13:
      return 94;
    case 16:
      return 16;
    case 121:
      return 151;
    case 138:
      return 91;
    case 139:
      return 1;
    case 140:
      return 17;
    case 141:
      return 18;
    case 142:
      return 1;
    default:
      return -1;
  }
};

const getBet365SportName = (): string => {
  switch (worker.SportId) {
    case 1:
      return 'Soccer';
    case 2:
      return 'Tennis';
    case 3:
      return 'Ice Hockey';
    case 4:
      return 'Basketball';
    case 5:
      return 'Volleyball';
    case 6:
      return 'Handball';
    case 7:
      return 'Table Tennis';
    case 8:
      return 'Futsal';
    case 13:
      return 'Badminton';
    case 16:
      return 'Baseball';
    case 121:
      return 'Esports';
    case 138:
      return 'Volleyball';
    case 139:
      return 'Soccer';
    case 140:
      return 'Ice Hockey';
    case 141:
      return 'Basketball';
    case 142:
      return 'Tennis';
    default:
      return '';
  }
};

const findEventInOverview = async (): Promise<Element> => {
  worker.Helper.WriteLine('Поиск события в Overview');

  const overviewClassificationBar = await getElement(
    overviewClassificationBarSelector
  );
  if (!overviewClassificationBar) {
    worker.Helper.WriteLine(
      'Ошибка поиска события в Overview: Не найдена панель выбора спорта'
    );
    return null;
  }
  const bet365SportId = getBet365SportId();
  if (!bet365SportId) {
    worker.Helper.WriteLine(
      `Ошибка поиска события в Overview: Неизвестный SportId - ${worker.SportId}`
    );
    return null;
  }
  // let sportIconSelector = `.ipc-InPlayClassificationIcon-${bet365SportId}`;
  const sportIconSelector = `.ovm-ClassificationBarButton-${bet365SportId}`;
  const sportIcon = document.querySelector(sportIconSelector) as HTMLElement;
  if (!sportIcon) {
    worker.Helper.WriteLine(
      'Ошибка поиска события в Overview: Не найдена иконка нужного спорта'
    );
    return null;
  }

  sportIcon.click();
  const bet365SportName = getBet365SportName();
  const sportChangeResult = await awaiter(() => {
    const overviewSportHeader = document.querySelector(
      overviewSportHeaderSelector
    );
    return overviewSportHeader.textContent === bet365SportName;
  });
  if (!sportChangeResult) {
    worker.Helper.WriteLine(
      'Ошибка поиска события в Overview: Спорт не переключился на нужный'
    );
    return null;
  }

  const competitions = [
    ...document.querySelectorAll(overviewCompetitionSelector),
  ];
  if (competitions.length === 0) {
    worker.Helper.WriteLine(
      'Ошибка поиска события в Overview: Не найдено событий в Overview'
    );
    return null;
  }
  const workerTeamNames = getWorkerTeamNames();

  const competition = competitions.find((teamStack) => {
    const teamStackTeamNames = getTeamNamesFromTeamStack(
      teamStack,
      overviewTeamStackTeamSelector
    );
    if (teamStackTeamNames === null) {
      return null;
    }
    return compareTeamNames(workerTeamNames, teamStackTeamNames);
  });

  if (!competition) {
    worker.Helper.WriteLine(
      'Ошибка поиска события в Overview: Событие не найдено в Overview'
    );
    return null;
  }
  return competition;
};

const openEvent = async (): Promise<boolean> => {
  worker.Helper.WriteLine(`Ищем событие ${worker.TeamOne} - ${worker.TeamTwo}`);
  const controlBarSelectedItem = document.querySelector(
    inPlayControlBarSelectedItemSelector
  );
  if (controlBarSelectedItem.textContent === 'Event View') {
    if (checkCurrentEvent()) {
      worker.Helper.WriteLine('Уже открыто нужное событие');
      return true;
    }
    // const foundEvent = findEventInSideBar() as HTMLElement;
    // if (foundEvent) {
    //   worker.Helper.WriteLine('Событие найдено в боковом меню');
    //   foundEvent.click();
    //   if (!(await awaiter(() => checkCurrentEvent()))) {
    //     worker.Helper.WriteLine('Нужное событие так и не открылось');
    //     return false;
    //   }
    //   return true;
    // }
  }
  const controlBarItems = [
    ...document.querySelectorAll(inPlayControlBarItemSelector),
  ] as HTMLElement[];
  const overviewItem = controlBarItems.find(
    (item) => item.textContent === 'Overview'
  );
  if (!overviewItem) {
    worker.Helper.WriteLine(
      'Ошибка открытия события: Не найден раздел Overview'
    );
    return false;
  }
  overviewItem.click();
  const foundEvent = await findEventInOverview();
  if (foundEvent) {
    worker.Helper.WriteLine('Событие найдено в Overview');
    // foundEvent.click();
    const eventDetailsElement = foundEvent.querySelector(
      '.ovm-FixtureDetailsWithIndicators, .ovm-FixtureDetailsTwoWay, .ovm-FixtureDetailsEsports, .ovm-FixtureDetailsBaseball'
    );
    if (!eventDetailsElement) {
      worker.Helper.WriteLine(
        'Ошибка открытия события: Не найден элемент для клика'
      );
      return false;
    }

    fireEvent(eventDetailsElement, 'mouseover', MouseEvent);
    fireEvent(eventDetailsElement, 'mousedown', MouseEvent);
    fireEvent(eventDetailsElement, 'mouseup', MouseEvent);
    fireEvent(eventDetailsElement, 'click', MouseEvent);
    if (!(await awaiter(() => checkCurrentEvent()))) {
      worker.Helper.WriteLine(
        'Ошибка открытия события: Нужное событие так и не открылось'
      );
      return false;
    }
    return true;
  }
  return false;
};

export default openEvent;
