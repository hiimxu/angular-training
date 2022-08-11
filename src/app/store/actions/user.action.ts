import { Action } from '@ngrx/store';
import { UserInfo } from '../models/userInfo.model';

export enum UserActionType {
  ADD_USER = '[USER] Add User',
}

export class AddUserAction implements Action {
  readonly type = UserActionType.ADD_USER;
  //add an optional payload
  constructor(public payload: UserInfo) {}
}
export type UserAction = AddUserAction;