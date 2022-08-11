import { UserAction, UserActionType } from './../actions/user.action';
import { UserInfo } from './../models/userInfo.model';
const initialState: Array<UserInfo> = [
  { username: '', token_type: '', access_token: '', refesh_token: '' },
];
export function UserReducer(
  state: Array<UserInfo> = initialState,
  action: UserAction
) {
  switch (action.type) {
    case UserActionType.ADD_USER:
      return [...state, action.payload];
    default:
      return state;
  }
}
