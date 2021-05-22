import { User } from "../../user/models/user";
import { MovementHistory } from "../models/movement-history";

export class UserMovementHistoryDto{
    user : User;
    usersMovementHistory : MovementHistory[]
}