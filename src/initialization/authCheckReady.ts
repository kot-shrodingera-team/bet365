import { authCheckReadyGenerator } from '@kot-shrodingera-team/germes-generators/stake_info/checkAuth';

const authCheckReady = authCheckReadyGenerator({
  authFormSelector: '.hm-MainHeaderRHSLoggedOutWide_Login',
  accountSelector: '.hm-MainHeaderMembersWide',
});

export default authCheckReady;
