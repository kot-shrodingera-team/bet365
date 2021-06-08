import { log, sleep } from '@kot-shrodingera-team/germes-utils';

const findEventInOverview = async (): Promise<HTMLElement> => {
  const scroller = document.querySelector<HTMLElement>('.ovm-OverviewScroller');
  if (!scroller) {
    return null;
  }
  const overviewContent = document.querySelector<HTMLElement>(
    '.ovm-OverviewView_Content'
  );
  if (!overviewContent) {
    return null;
  }
  const matches = [] as HTMLElement[];
  const workerTeamOne = worker.TeamOne;
  const workerTeamTwo = worker.TeamTwo.replace(/_eventid\[[^\]]*]$/, '');
  log(`Ищем событие "${workerTeamOne} - ${workerTeamTwo}"`, 'white', true);
  while (
    scroller.scrollTop !==
    overviewContent.offsetHeight - scroller.offsetHeight
  ) {
    const newMatches = [
      ...document.querySelectorAll<HTMLElement>('.ovm-Fixture'),
    ].filter((matchElement) => {
      return !matches.includes(matchElement);
    });
    scroller.scrollTo(0, overviewContent.offsetHeight - scroller.offsetHeight);
    const targetMatch = newMatches.find((match) => {
      const teamNameOneElement = match.querySelector(
        '.ovm-FixtureDetailsTwoWay_Team:nth-child(1)'
      );
      const teamNameTwoElement = match.querySelector(
        '.ovm-FixtureDetailsTwoWay_Team:nth-child(2)'
      );
      if (!teamNameOneElement) {
        log('Не найдена первая команда события', 'crimson');
      }
      if (!teamNameTwoElement) {
        log('Не найдена первая команда события', 'crimson');
      }
      const teamNameOne = teamNameOneElement.textContent.trim();
      const teamNameTwo = teamNameTwoElement.textContent.trim();
      log(`${teamNameOne} - ${teamNameTwo}`, 'white', true);
      return teamNameOne === workerTeamOne && teamNameTwo === workerTeamTwo;
    });
    if (targetMatch) {
      return targetMatch;
    }
    matches.push(...newMatches);
    // eslint-disable-next-line no-await-in-loop
    await sleep(100);
  }
  return null;
};

export default findEventInOverview;
