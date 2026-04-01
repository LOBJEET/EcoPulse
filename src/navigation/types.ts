import type { CommunityGroupRouteParams } from "../services/communityService";

export type GroupChatsStackParamList = {
  GroupChatsList: undefined;
  GroupCommunityDetail: { group: CommunityGroupRouteParams };
  GroupChatRoom: { group: CommunityGroupRouteParams };
};
