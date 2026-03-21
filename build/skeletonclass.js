import { vec3 } from "./vec3class.js";
import { quaternion } from "./quaternionclass.js";
import { mat4 } from "./mat4class.js";
export class skeleton {
    name;
    url;
    transformNodes = [];
    constructor(name, url) {
        this.name = name;
        this.url = url;
    }
    async load() {
        var importedSkeleton;
        await fetch(this.url)
            .then(v => v.json()
            .then(skeleton => importedSkeleton = skeleton)
            .catch(exception => console.log("Model does not exist")));
        if (importedSkeleton == undefined) {
            console.log("Model does not exist");
            return;
        }
        this.loadTransformNodes(0, -1, importedSkeleton.transformNodes);
    }
    loadTransformNodes(nodeIndex, parentIndex, importedTransformNodes) {
        var importedTransformNode = importedTransformNodes[nodeIndex];
        if (parentIndex == -1) {
            var inverseBindPose = new mat4().set(importedTransformNode.inverseBindPose);
            var bindPose = mat4.inverse(inverseBindPose);
            var localTranslation = new vec3(0, 0, 0);
            var localRotation = new quaternion();
            var localScale = new vec3(0, 0, 0);
            bindPose.decompose(localTranslation, localRotation, localScale);
            this.transformNodes[nodeIndex] = {
                parent: parentIndex,
                children: importedTransformNode.children,
                bindPose: {
                    translation: localTranslation,
                    rotation: localRotation,
                    scale: localScale
                },
                inverseBindPose: inverseBindPose
            };
        }
        else {
            var parentNode = this.transformNodes[parentIndex];
            var inverseBindPose = new mat4().set(importedTransformNode.inverseBindPose);
            var bindPose = mat4.inverse(inverseBindPose);
            var parentBindPose = mat4.inverse(parentNode.inverseBindPose);
            var globalTranslation = new vec3(0, 0, 0);
            var globalRotation = new quaternion();
            var globalScale = new vec3(0, 0, 0);
            var parentGlobalTranslation = new vec3(0, 0, 0);
            var parentGlobalRotation = new quaternion();
            var parentGlobalScale = new vec3(0, 0, 0);
            var localTranslation = new vec3(0, 0, 0);
            var localRotation = new quaternion();
            var localScale = new vec3(0, 0, 0);
            bindPose.decompose(globalTranslation, globalRotation, globalScale);
            parentBindPose.decompose(parentGlobalTranslation, parentGlobalRotation, parentGlobalScale);
            localTranslation = vec3.subtract(globalTranslation, parentGlobalTranslation);
            parentGlobalRotation.vectorMultiply(localTranslation, localTranslation);
            localTranslation.xyz = [
                localTranslation.x / parentGlobalScale.x,
                localTranslation.y / parentGlobalScale.y,
                localTranslation.z / parentGlobalScale.z
            ];
            quaternion.multiply(globalRotation, parentGlobalRotation.conjugate(), localRotation);
            localScale.xyz = [
                globalScale.x / parentGlobalScale.x,
                globalScale.y / parentGlobalScale.y,
                globalScale.z / parentGlobalScale.z
            ];
            this.transformNodes[nodeIndex] = {
                parent: parentIndex,
                children: importedTransformNode.children,
                bindPose: {
                    translation: localTranslation,
                    rotation: localRotation,
                    scale: localScale
                },
                inverseBindPose: inverseBindPose
            };
        }
        importedTransformNode.children.forEach((childIndex) => {
            this.loadTransformNodes(childIndex, nodeIndex, importedTransformNodes);
        });
    }
}
