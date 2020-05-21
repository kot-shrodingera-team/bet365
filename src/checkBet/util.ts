import { ri } from '@kot-shrodingera-team/config/util';

export const getTennisCompletedSetsCount = (): number => {
  const setScore = [
    ...document.querySelectorAll(
      '.ipe-TennisHeaderLayout_ColumnSets > .ipe-TennisGridColumn_Cell:not(:first-child)'
    ),
  ];
  return setScore.reduce(
    (accumulator, cell) => accumulator + parseInt(cell.textContent, 10),
    0
  );
};

const getTennisCompletedSetsGamesScores = (): Element[] => {
  const completedSetsCount = getTennisCompletedSetsCount();
  return [...document.querySelectorAll('.ipe-TennisGridColumn')].filter(
    (column) => {
      return parseInt(column.firstChild.textContent, 10) <= completedSetsCount;
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
          gameAccumulator + parseInt(playerScore.textContent, 10),
        0
      ),
    0
  );
};

export const getHandicapScoreOffset = (score: string): number => {
  const match = score.match(/\((\d+)-(\d+)\)/);
  if (!match) {
    // worker.Helper.WriteLine(`Не удалось распаристь счёт - ${score}`);
    return null;
  }
  const left = parseInt(match[1], 10);
  const right = parseInt(match[2], 10);
  return left - right;
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
  // worker.Helper.WriteLine(`Не удалось спарсить параметр форы - ${parameter}`);
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
