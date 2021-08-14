import { NodePool } from "cc";
import { Singleton } from "../Framework/Base/Singleton";
import { UIPoker } from "../View/UIPoker/UIPoker";

export class Pool extends Singleton {
    uipoker = new NodePool('UIPoker');
}