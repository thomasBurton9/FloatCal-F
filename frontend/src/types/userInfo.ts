export type UserInfo = {
  user_id: number;
  email: string;
  display_name: string;
};

export type SharedMemberProps = {
  member: UserInfo;
  isEditable: boolean;
  isOwner: boolean;
};
