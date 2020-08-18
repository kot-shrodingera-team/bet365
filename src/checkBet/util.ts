import { ri } from '@kot-shrodingera-team/germes-utils';

export const getTennisCompletedSetsCount = (): number => {
  const setScore = [
    ...document.querySelectorAll(
      '.ipe-TennisHeaderLayout_ColumnSets > .ipe-TennisGridColumn_Cell:not(:first-child)'
    ),
  ];
  return setScore.reduce(
    (accumulator, cell) => accumulator + Number(cell.textContent),
    0
  );
};

const getTennisCompletedSetsGamesScores = (): Element[] => {
  const completedSetsCount = getTennisCompletedSetsCount();
  return [...document.querySelectorAll('.ipe-TennisGridColumn')].filter(
    (column) => {
      return Number(column.firstChild.textContent) <= completedSetsCount;
    }
  );
};

export const getTennisCompletedSetsGamesCount = (): number => {
  const comletedSetsGamesScores = getTennisCompletedSetsGamesScores();
  return comletedSetsGamesScores.reduce(
    (gamesAccumulator, setRow) =>
      gamesAccumulator +
      [
        ...setRow.querySelectorAll(
          '.ipe-TennisGridColumn_Cell:not(:first-child)'
        ),
      ].reduce(
        (gameAccumulator, playerScore) =>
          gameAccumulator + Number(playerScore.textContent),
        0
      ),
    0
  );
};

export const getHandicapScoreOffset = (
  score: string,
  player: 1 | 2
): number => {
  const match = score.match(/\((\d+)-(\d+)\)/);
  if (!match) {
    // log(`Не удалось распаристь счёт: "${score}"`, 'crimson');
    return null;
  }
  const left = Number(match[1]);
  const right = Number(match[2]);
  return player === 1 ? right - left : left - right;
};

export const parseParameter = (parameter: string): number => {
  const match = parameter.match(/^([+-]?\d+\.\d+),([+-]?\d+\.\d+)$/);
  if (match) {
    const firstParameter = Number(match[1]);
    const secondParameter = Number(match[2]);
    return (firstParameter + secondParameter) / 2;
  }
  if (/^[+-]?\d+\.\d+$/.test(parameter)) {
    return Number(parameter);
  }
  // log(`Не удалось спарсить параметр форы: "${parameter}"`, 'crimson');
  return null;
};

export const formatParameterRegex = ({
  sign,
  double,
}: {
  sign: boolean;
  double: boolean;
}): RegExp => {
  let parameterRegex = /\d+\.\d+/;
  if (sign) {
    parameterRegex = ri`[+-]?${parameterRegex}`;
  }
  if (double) {
    parameterRegex = ri`${parameterRegex}(?:,${parameterRegex})?`;
  }
  return parameterRegex;
};
