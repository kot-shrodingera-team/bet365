import { log } from '@kot-shrodingera-team/germes-utils';

export const parseParameter = (parameter: string): number => {
  const singleParameterRegex = /^[+-]?\d+\.\d+$/;
  const doubleParameterRegex = /^([+-]?\d+\.\d+),([+-]?\d+\.\d+)$/;
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
  const marketNameElement = document.querySelector('.bss-NormalBetItem_Title');
  if (!marketNameElement) {
    log('Не найден маркет ставки', 'crimson');
    return -9999;
  }
  const marketName = marketNameElement.textContent.trim();
  if (/^(Draw No Bet)$/i.test(marketName)) {
    return 0;
  }

  const betNameElement = document.querySelector('.bss-NormalBetItem_Title');
  if (!betNameElement) {
    log('Не найдена роспись ставки', 'crimson');
    return -9999;
  }
  let betName = betNameElement.textContent.trim();

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
