import {
  getWorkerParameter,
  log,
  ri,
} from '@kot-shrodingera-team/germes-utils';
import getSiteTeamNames from '../show_stake/helpers/checkBet/getSiteTeamNames';
import {
  formatParameterRegex,
  getHandicapScoreOffset,
} from '../show_stake/helpers/checkBet/util';

export const parseParameter = (parameter: string): number => {
  const singleParameterRegex = /^[+-]?\d+(?:\.\d+)?$/;
  const doubleParameterRegex = /^([+-]?\d+(?:\.\d+)?),([+-]?\d+(?:\.\d+)?)$/;
  const doubleParameterMatch = parameter.match(doubleParameterRegex);
  if (doubleParameterMatch) {
    const firstParameter = Number(doubleParameterMatch[1]);
    const secondParameter = Number(doubleParameterMatch[2]);
    return (firstParameter + secondParameter) / 2;
  }
  if (singleParameterRegex.test(parameter)) {
    return Number(parameter);
  }
  return null;
};

const getParameter = (): number => {
  if (
    getWorkerParameter('fakeParameter') ||
    getWorkerParameter('fakeOpenStake')
  ) {
    const parameter = Number(JSON.parse(worker.ForkObj).param);
    if (Number.isNaN(parameter)) {
      return -6666;
    }
    return parameter;
  }

  const marketNameSelector = '.bss-NormalBetItem_Title';
  const betNameSelector = '.bss-NormalBetItem_Title';

  const marketNameElement = document.querySelector(marketNameSelector);
  const betNameElement = document.querySelector(betNameSelector);

  if (!marketNameElement) {
    log('Не найден маркет ставки', 'crimson');
    return -9999;
  }
  if (!betNameElement) {
    log('Не найдена роспись ставки', 'crimson');
    return -9999;
  }

  const marketName = marketNameElement.textContent.trim();
  let betName = betNameElement.textContent.trim();

  if (/^(Draw No Bet)$/i.test(marketName)) {
    return 0;
  }

  const betslipHandicapElement = document.querySelector(
    '.bss-NormalBetItem_Handicap'
  );

  if (betslipHandicapElement) {
    log('Есть отдельный элемент параметра', 'white', true);
    const betslipHandicap = betslipHandicapElement.textContent.trim();
    if (
      betslipHandicap &&
      betName.endsWith(betslipHandicap) &&
      !betName.endsWith(` ${betslipHandicap}`)
    ) {
      betName = betName.replace(betslipHandicap, ` ${betslipHandicap}`);
    }
  }

  const { market, bet_type: betType } = JSON.parse(worker.ForkObj);
  let handicapOffset = 0;
  if (worker.SportId === 1 && (market === 'F' || betType === 'HANDICAP')) {
    log('Фора от счёта в футболе', 'steelblue');
    const teamNames = getSiteTeamNames();
    const teamRegex = ri`${teamNames.teamOne}|${teamNames.teamTwo}`;
    const gameScoreRegex = /\(\d+-\d+\)/;
    const betslipHandicapRegex = ri`^(${gameScoreRegex}) (${teamRegex}) (${formatParameterRegex(
      { sign: true, double: true }
    )})$`;
    const betslipMatch = betName.match(betslipHandicapRegex);
    if (!betslipMatch) {
      log('В купоне неподходящая роспись', 'crimson');
      return -9999;
    }
    const handicapPlayer = ri`${betslipMatch[2]}`.test(teamNames.teamOne)
      ? 1
      : 2;
    handicapOffset = getHandicapScoreOffset(betslipMatch[1], handicapPlayer);
  }

  if (betslipHandicapElement) {
    const betslipHandicap = betslipHandicapElement.textContent.trim();

    if (betslipHandicap === '') {
      log('Отдельный элемент параметра пуст', 'white', true);
    } else {
      const result = parseParameter(betslipHandicap);
      if (result === null) {
        log(
          `Не удалось определить параметр ставки: "${betslipHandicap}"`,
          'crimson'
        );
        return -9999;
      }
      return result + handicapOffset;
    }
  }

  // A to win game 1
  // Over 6.5 games in set 1
  const parameterRegex = /.*(?<!set|game) ([-+]?\d+(?:\.\d+)?)(?=\s|$)/i;

  const betslipParameterMatch = betName.match(parameterRegex);
  if (betslipParameterMatch) {
    return parseParameter(betslipParameterMatch[1]);
  }
  const scoreRegex = /.* (\d+)-(\d+)$/i;
  const scoreMatch = betName.match(scoreRegex);
  if (scoreMatch) {
    const leftScore = Number(scoreMatch[1]);
    const rightScore = Number(scoreMatch[2]);
    const digitsCount = Math.ceil(Math.log10(rightScore + 1));
    const result = Number(leftScore + rightScore / 10 ** digitsCount);
    return result;
  }
  return -6666;
};

export default getParameter;
