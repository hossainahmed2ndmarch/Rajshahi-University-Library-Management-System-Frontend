import { RudcMemberService } from './rudc/rudcMember.service';
import { RudcTeamService } from './rudc/rudcTeam.service';
import { RudcIyanotService } from './rudc/rudcIyanot.service';

export * from './rudc/rudcMember.service';
export * from './rudc/rudcTeam.service';
export * from './rudc/rudcIyanot.service';

export const RudcService = {
  ...RudcMemberService,
  ...RudcTeamService,
  ...RudcIyanotService,
};
