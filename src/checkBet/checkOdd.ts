import { ri, log } from '@kot-shrodingera-team/germes-utils';
import WorkerBetObject from '@kot-shrodingera-team/worker-declaration/workerBetObject';
import {
  formatParameterRegex,
  getHandicapScoreOffset,
  parseParameter,
  getTennisCompletedSetsCount,
  getTennisCompletedSetsGamesCount,
} from './util';
import getSiteTeamNames from './getSiteTeamNames';

type CheckOddData = {
  error: boolean;
  parameter: number;
  errorMessage: string;
};

// type checkData = {
//   marketCheck: check;
//   oddCheck: check;
// };

// eslint-disable-next-line no-shadow
const getCheckOdd = (
  betslipBetDetails: string,
  betslipBetDescription: string
): CheckOddData => {
  const teamNames = getSiteTeamNames();
  const teamRegex = ri`${teamNames.teamOne}|${teamNames.teamTwo}`;
  // Да, в конце бывает пробел
  const eHandicapTeamRegex = ri`${teamRegex}|Draw \(${teamNames.teamTwo} ?\)`;
  const gameScoreRegex = /\(\d+-\d+\)/;
  const {
    market,
    odd,
    param,
    period,
    subperiod,
    // overtimeType,
  } = JSON.parse(worker.ForkObj) as WorkerBetObject;
  const error = (errorMessage: string): CheckOddData => ({
    error: true,
    parameter: null,
    errorMessage,
  });
  const success = (parameter: number): CheckOddData => ({
    error: false,
    parameter,
    errorMessage: null,
  });
  if (/^ML$/i.test(market)) {
    if (worker.SportId === 2) {
      let betslipResultRegex;
      if (period === 0) {
        betslipResultRegex = ri`^(${teamRegex})$`;
      } else if (period !== 0 && subperiod === 0) {
        betslipResultRegex = ri`^(${teamRegex}) to win set ([1-5])$`;
      } else if (period !== 0 && subperiod !== 0) {
        betslipResultRegex = ri`^(${teamRegex})(?: \(Svr\))? to win (\d+)(?:st|nd|rd|th) game$`;
      } else {
        return error(`Необрабатываемый период (${period}). Напишите в ТП`);
      }
      const betslipMatch = betslipBetDescription.match(betslipResultRegex);
      if (!betslipMatch) {
        return error('В купоне неподходящая роспись');
      }
      if (/^ML1$/i.test(odd)) {
        if (!ri`${betslipMatch[1]}`.test(teamNames.teamOne)) {
          return error('Открыта не победа первого игрока');
        }
      } else if (/^ML2$/i.test(odd)) {
        if (!ri`${betslipMatch[1]}`.test(teamNames.teamTwo)) {
          return error('Открыта не победа второго игрока');
        }
      } else {
        return error(`Необрабатываемый исход (${odd}). Напишите в ТП`);
      }
      if (period !== 0 && subperiod === 0) {
        if (period !== Number(betslipMatch[2])) {
          return error(`Открыта не победа в ${period} сете`);
        }
      } else if (period !== 0 && subperiod !== 0) {
        const completedSetsCount = getTennisCompletedSetsCount();
        if (period !== completedSetsCount + 1) {
          return error('В росписи не текущий сет');
        }
        const completedSetsGamesCount = getTennisCompletedSetsGamesCount();
        const resultGamesCount = completedSetsGamesCount + Number(subperiod);
        if (resultGamesCount !== Number(betslipMatch[2])) {
          return error(`Открыта не победа в ${resultGamesCount} гейме`);
        }
      }
      return success(-6666);
    }
  }
  if (/^F$/i.test(market)) {
    if (worker.SportId === 1) {
      if (/^Draw No Bet$/i.test(betslipBetDetails)) {
        if (param !== 0) {
          return error(
            'Открыта фора 0 (Draw No Bet), но в росписи бота не фора 0'
          );
        }
        if (/^F1$/i.test(odd)) {
          if (!ri`${teamNames.teamOne}`.test(betslipBetDescription)) {
            return error('Открыта не победа первой команды');
          }
        } else if (/^F2$/i.test(odd)) {
          if (!ri`${teamNames.teamTwo}`.test(betslipBetDescription)) {
            return error('Открыта не победа второй команды');
          }
        } else {
          return error(`Необрабатываемый исход (${odd}). Напишите в ТП`);
        }
        return success(0);
      }
      const betslipHandicapRegex = ri`^(${gameScoreRegex}) (${teamRegex}) (${formatParameterRegex(
        { sign: true, double: true }
      )})$`;
      const betslipMatch = betslipBetDescription.match(betslipHandicapRegex);
      if (!betslipMatch) {
        return error('В купоне неподходящая роспись');
      }
      if (/^F1$/i.test(odd)) {
        if (!ri`${betslipMatch[2]}`.test(teamNames.teamOne)) {
          return error('Открыта фора не на первую команду');
        }
      } else if (/^F2$/i.test(odd)) {
        if (!ri`${betslipMatch[2]}`.test(teamNames.teamTwo)) {
          return error('Открыта фора не на вторую команду');
        }
      } else {
        return error(`Необрабатываемый исход (${odd}). Напишите в ТП`);
      }
      const handicapPlayer = ri`${betslipMatch[2]}`.test(teamNames.teamOne)
        ? 1
        : 2;
      const handicapOffset = getHandicapScoreOffset(
        betslipMatch[1],
        handicapPlayer
      );
      if (handicapOffset === null) {
        return error(`Не удалось распаристь счёт - ${betslipMatch[1]}`);
      }
      return success(parseParameter(betslipMatch[3]) + handicapOffset);
    }
    if (worker.SportId === 2) {
      const betslipHandicapRegex = ri`^(${teamRegex})(?: \(Set ([1-5])\))? (${formatParameterRegex(
        { sign: true, double: false }
      )})$`;
      const betslipMatch = betslipBetDescription.match(betslipHandicapRegex);
      if (!betslipMatch) {
        return error('В купоне неподходящая роспись');
      }
      if (/^F1$/i.test(odd)) {
        if (!ri`${betslipMatch[1]}`.test(teamNames.teamOne)) {
          return error('Открыта фора не на первого игрока');
        }
      } else if (/^F2$/i.test(odd)) {
        if (!ri`${betslipMatch[2]}`.test(teamNames.teamTwo)) {
          return error('Открыта фора не на второго игрока');
        }
      } else {
        return error(`Необрабатываемый исход (${odd}). Напишите в ТП`);
      }
      if (period !== 0 && period !== Number(betslipMatch[2])) {
        return error(`Открыта фора не на ${period} сет`);
      }
      return success(parseParameter(betslipMatch[3]));
    }
  }
  // if (/^1X2$/i.test(market)) {
  //   if (/^1$/i.test(odd)) {
  //     if (!ri`${teamNames.teamOne}`.test(betslipBetDescription)) {
  //       return error('Открыта не победа первой команды');
  //     }
  //   } else if (/^2$/i.test(odd)) {
  //     if (!ri`${teamNames.teamTwo}`.test(betslipBetDescription)) {
  //       return error('Открыта не победа второй команды');
  //     }
  //   } else if (/^X$/i.test(odd)) {
  //     if (!/Draw/i.test(betslipBetDescription)) {
  //       return error('Открыта не ничья');
  //     }
  //   } else {
  //     return error(`Необрабатываемый исход (${odd}). Напишите в ТП`);
  //   }
  //   return success(-6666);
  // }
  if (/^OU$/i.test(market)) {
    if (worker.SportId === 1) {
      let betslipTotalRegex;
      if (betslipBetDetails.includes('Goal Line')) {
        betslipTotalRegex = ri`^${gameScoreRegex} (Over|Under) (${formatParameterRegex(
          {
            sign: false,
            double: true,
          }
        )})$`;
      } else {
        betslipTotalRegex = ri`^(Over|Under) (${formatParameterRegex({
          sign: false,
          double: false,
        })})$`;
      }
      const betslipMatch = betslipBetDescription.match(betslipTotalRegex);
      if (!betslipMatch) {
        return error('В купоне неподходящая роспись');
      }
      if (/^TO$/i.test(odd)) {
        if (!/^over$/i.test(betslipMatch[1])) {
          return error('Открыт не тотал больше');
        }
      } else if (/^TU$/i.test(odd)) {
        if (!/^under$/i.test(betslipMatch[1])) {
          return error('Открыт не тотал меньше');
        }
      } else {
        return error(`Необрабатываемый исход (${odd}). Напишите в ТП`);
      }
      return success(parseParameter(betslipMatch[2]));
    }
    if (worker.SportId === 2) {
      const betslipTotalRegEx = ri`^(Over|Under) (${formatParameterRegex({
        sign: false,
        double: false,
      })})(?: games in set ([1-5]))?$`;
      const betslipMatch = betslipBetDescription.match(betslipTotalRegEx);
      if (!betslipMatch) {
        return error('В купоне неподходящая роспись');
      }
      if (/^TO$/i.test(odd)) {
        if (!/^over$/i.test(betslipMatch[1])) {
          return error('Открыт не тотал больше');
        }
      } else if (/^TU$/i.test(odd)) {
        if (!/^under$/i.test(betslipMatch[1])) {
          return error('Открыт не тотал меньше');
        }
      } else {
        return error(`Необрабатываемый исход (${odd}). Напишите в ТП`);
      }
      if (period !== 0 && period !== Number(betslipMatch[3])) {
        return error(`Открыт тотал не на ${period} сет`);
      }
      return success(parseParameter(betslipMatch[2]));
    }
  }
  if (/^OU[12]$/i.test(market)) {
    if (worker.SportId === 1) {
      const betslipTeamTotalRegex = ri`^(${teamRegex}) - (Over|Under) (${formatParameterRegex(
        { sign: false, double: false }
      )})$`;
      const betslipMatch = betslipBetDescription.match(betslipTeamTotalRegex);
      if (!betslipMatch) {
        return error('В купоне неподходящая роспись');
      }
      if (/^OU1$/i.test(market)) {
        if (!ri`${betslipMatch[1]}`.test(teamNames.teamOne)) {
          return error('Открыт не тотал первой команды');
        }
      } else if (/^OU2$/i.test(market)) {
        if (!ri`${betslipMatch[1]}`.test(teamNames.teamTwo)) {
          return error('Открыт не тотал второй команды');
        }
      }
      if (/^TO$/i.test(odd)) {
        if (!/^over$/i.test(betslipMatch[2])) {
          return error('Открыт не тотал больше');
        }
      } else if (/^TU$/i.test(odd)) {
        if (!/^under$/i.test(betslipMatch[2])) {
          return error('Открыт не тотал меньше');
        }
      } else {
        return error(`Необрабатываемый исход (${odd}). Напишите в ТП`);
      }
      return success(parseParameter(betslipMatch[3]));
    }
    if (worker.SportId === 2) {
      const betslipPlayerTotalRegEx = ri`^(${teamRegex}) (Over|Under) (${formatParameterRegex(
        { sign: false, double: false }
      )})$`;
      const betslipMatch = betslipBetDescription.match(betslipPlayerTotalRegEx);
      if (!betslipMatch) {
        return error('В купоне неподходящая роспись');
      }
      if (/^OU1$/i.test(market)) {
        if (!ri`${betslipMatch[1]}`.test(teamNames.teamOne)) {
          return error('Открыт не тотал первого игрока');
        }
      } else if (/^OU2$/i.test(market)) {
        if (!ri`${betslipMatch[1]}`.test(teamNames.teamTwo)) {
          return error('Открыта не тотал второго игрока');
        }
      }
      if (/^TO$/i.test(odd)) {
        if (!/^over$/i.test(betslipMatch[2])) {
          return error('Открыт не тотал больше');
        }
      } else if (/^TU$/i.test(odd)) {
        if (!/^under$/i.test(betslipMatch[2])) {
          return error('Открыт не тотал меньше');
        }
      } else {
        return error(`Необрабатываемый исход (${odd}). Напишите в ТП`);
      }
      return success(parseParameter(betslipMatch[3]));
    }
  }
  if (/^DC$/i.test(market)) {
    if (/^1X$/i.test(odd)) {
      if (!ri`${teamNames.teamOne} or Draw$`.test(betslipBetDescription)) {
        return error('Открыт не двойной шанс 1X');
      }
    } else if (/^12$/i.test(odd)) {
      if (
        !ri`^${teamNames.teamOne} or ${teamNames.teamTwo}$`.test(
          betslipBetDescription
        )
      ) {
        return error('Открыт не двойной шанс 12');
      }
    } else if (/^X2$/i.test(odd)) {
      if (!ri`^${teamNames.teamTwo} or Draw$`.test(betslipBetDescription)) {
        return error('Открыт не двойной шанс X2');
      }
    } else {
      return error(`Необрабатываемый исход (${odd}). Напишите в ТП`);
    }
    return success(-6666);
  }
  if (/^EH$/i.test(market)) {
    if (worker.SportId === 1) {
      const betslipEHandicapRegex = ri`^(${eHandicapTeamRegex}) (${formatParameterRegex(
        { sign: true, double: false }
      )})$`;
      const betslipMatch = betslipBetDescription.match(betslipEHandicapRegex);
      if (!betslipMatch) {
        return error('В купоне неподходящая роспись');
      }
      if (/^EH1$/i.test(odd)) {
        if (!ri`${betslipMatch[1]}`.test(teamNames.teamOne)) {
          return error('Открыт не европейский гандикап на первую команду');
        }
      } else if (/^EH2$/i.test(odd)) {
        if (!ri`${betslipMatch[1]}`.test(teamNames.teamTwo)) {
          return error('Открыт не европейский гандикап на вторую команду');
        }
      } else if (/^EHX$/i.test(odd)) {
        if (!ri`Draw \(${teamNames.teamTwo} ?\)`.test(betslipMatch[1])) {
          return error('Открыт не европейский гандикап на ничью');
        }
      } else {
        return error(`Необрабатываемый исход (${odd}). Напишите в ТП`);
      }
      return success(parseParameter(betslipMatch[2]));
    }
  }
  if (/^BTS$/i.test(market)) {
    const betslipBtsRegex = /^(Yes|No)$/i;
    const betslipMatch = betslipBetDescription.match(betslipBtsRegex);
    if (!betslipMatch) {
      return error('В купоне неподходящая роспись');
    }
    if (/^Y$/i.test(odd)) {
      if (!/^Yes$/i.test(betslipMatch[1])) {
        return error('Открыт не BTS - Yes');
      }
    } else if (/^N$/i.test(odd)) {
      if (!/^No$/i.test(betslipMatch[1])) {
        return error('Открыт не BTS - No');
      }
    } else {
      return error(`Необрабатываемый исход (${odd}). Напишите в ТП`);
    }
    return success(-6666);
  }
  if (/^CNR_OU$/i.test(market)) {
    if (worker.SportId === 1) {
      let parameterOffset = 0;
      if (
        /^((Alternative )?Total Corners|(1st|2nd) Half Corners)$/i.test(
          betslipBetDetails
        )
      ) {
        if (/^TO$/i.test(odd)) {
          log(
            'Открыт 3-Way тотал больше, добавляем 0.5 к параметру',
            'steelbue'
          );
          parameterOffset = 0.5;
        } else if (/^TU$/i.test(odd)) {
          log(
            'Открыт 3-Way тотал меньше, отнимаем 0.5 от параметра',
            'steelblue'
          );
          parameterOffset = -0.5;
        } else {
          return error(`Необрабатываемый исход (${odd}). Напишите в ТП`);
        }
      }

      const betslipCornersTotalHandicapRegex = ri`^(Over|Under) (${formatParameterRegex(
        { sign: false, double: false }
      )})$`;
      const betslipMatch = betslipBetDescription.match(
        betslipCornersTotalHandicapRegex
      );
      if (!betslipMatch) {
        return error('В купоне неподходящая роспись');
      }
      if (odd === 'TO') {
        if (!/^over$/i.test(betslipMatch[1])) {
          return error('Открыт не тотал больше');
        }
      }
      if (odd === 'TU') {
        if (!/^under$/i.test(betslipMatch[1])) {
          return error('Открыт не тотал меньше');
        }
      } else {
        return error(`Необрабатываемый исход (${odd}). Напишите в ТП`);
      }
      return success(parameterOffset + parseParameter(betslipMatch[2]));
    }
  }
  if (/^T[OU]$/i.test(odd)) {
    if (/^TO$/i.test(odd)) {
      if (!/over/i.test(betslipBetDescription)) {
        return error('Открыт не тотал больше');
      }
    } else if (/^TU$/i.test(odd)) {
      if (!/under/i.test(betslipBetDescription)) {
        return error('Открыт не тотал меньше');
      }
    }
    const betslipTotalRegex = /^.* (\d+(?:\.\d+)?)$/i;
    const betslipMatch = betslipBetDescription.match(betslipTotalRegex);
    if (!betslipMatch) {
      return error('В купоне не найден параметр тотала');
    }
    let parameter = parseParameter(betslipMatch[1]);
    if (!Number.isInteger(param) && Number.isInteger(parameter)) {
      log(
        'В росписи бота параметр не целый, а в росписи бетки целый. Отнимаем 0.5 от параметра',
        'steelblue'
      );
      parameter -= 0.5;
    }
    return success(parameter);
  }
  if (/^(1|ML1|F1)$/i.test(odd)) {
    if (!ri`${teamNames.teamOne}`.test(betslipBetDescription)) {
      error(
        'Ставка на первую команду/игрока, но в купоне нет названия первой команды/игрока'
      );
    }
  }
  if (/^(2|ML2|F2)$/i.test(odd)) {
    if (!ri`${teamNames.teamTwo}`.test(betslipBetDescription)) {
      error(
        'Ставка на вторую команду/игрока, но в купоне нет названия второй команды/игрока'
      );
    }
  }
  if (/^(ODD|EVEN)$/i.test(odd)) {
    if (/^ODD$/i.test(odd)) {
      if (!/Odd/i.test(betslipBetDescription)) {
        return error('Открыт не тотал нечётный');
      }
    } else if (/^EVEN$/i.test(odd)) {
      if (!/Even/i.test(betslipBetDescription)) {
        return error('Открыт не тотал чётный');
      }
    }
  }
  const parameterRegex = /.* ([-+]?\d+\.\d+)$/i;
  const betslipParameterMatch = betslipBetDescription.match(parameterRegex);
  if (betslipParameterMatch) {
    return success(parseParameter(betslipParameterMatch[1]));
  }
  const scoreRegex = /.* (\d+)-(\d+)/i;
  const betslipScoreMatch = betslipBetDescription.match(scoreRegex);
  if (betslipScoreMatch) {
    const leftScore = Number(betslipScoreMatch[1]);
    const rightScore = Number(betslipScoreMatch[2]);
    const digitsCount = Math.ceil(Math.log10(rightScore + 1));
    const result = Number(leftScore + rightScore / 10 ** digitsCount);
    return success(result);
  }
  return success(-6666);
};

export default getCheckOdd;
