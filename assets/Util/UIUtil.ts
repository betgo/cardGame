import { Node, UITransform, v3 } from "cc";

export default class UIUtil {
    public static move(this: any, node: Node, targetParent: Node) {
        let wp = node.getWorldPosition(v3(0, 0, 0))
        let gp = targetParent.getComponent(UITransform)!.convertToNodeSpaceAR(wp)
        node.removeFromParent();
        targetParent.addChild(node)
        node.setPosition(gp)
        return this
    }
}