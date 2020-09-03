import initializeGenerator from '@kot-shrodingera-team/germes-generators/initialization/initialize';
import checkAuth, { authCheckReady } from '../stake_info/checkAuth';
import { balanceReady, updateBalance } from '../stake_info/getBalance';
import authorize from './authorize';
import afterSuccesfulLogin from './afterSuccesfulLogin';

const initialize = initializeGenerator({
  authCheckReady,
  checkAuth,
  balanceReady,
  updateBalance,
  authorize,
  afterSuccesfulLogin,
});

export default initialize;
