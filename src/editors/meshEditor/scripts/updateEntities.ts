import { entityManager } from "../../../managers.js"
import { user } from "../../../user.js"
import { selectedGizmo } from "./updateGizmos.js"

export const updateEntities = () => {
    for (var entityID in entityManager.entities) {
        var entity = entityManager.entities[entityID]
        if (entity.properties["gizmo"] == selectedGizmo) {
            entity.meshes[0].baseColour.set([1, 1, 1, 1])
        } else if (entity.properties["gizmo"]) {
            switch (entity.properties["gizmo"]) {
                case "xAxis":
                    entity.meshes[0].baseColour.set([1, 0, 0, 1])
                break
                case "yAxis":
                    entity.meshes[0].baseColour.set([0, 1, 0, 1])
                break
                case "zAxis":
                    entity.meshes[0].baseColour.set([0, 0, 1, 1])
                break
                case "yzPlane":
                    entity.meshes[0].baseColour.set([1, 0, 0, 1])
                break
                case "xzPlane":
                    entity.meshes[0].baseColour.set([0, 1, 0, 1])
                break
                case "xyPlane":
                    entity.meshes[0].baseColour.set([0, 0, 1, 1])
                break
                case "xRotator":
                    entity.meshes[0].baseColour.set([1, 0, 0, 1])
                break
                case "yRotator":
                    entity.meshes[0].baseColour.set([0, 1, 0, 1])
                break
                case "zRotator":
                    entity.meshes[0].baseColour.set([0, 0, 1, 1])
                break
            }
        }
    }

    if (user.hoveredEntity != "") {
        var hoveredEntity = entityManager.getEntity(user.hoveredEntity)
        if (hoveredEntity.properties["gizmo"] != undefined && selectedGizmo == "") {
            hoveredEntity.meshes[0].baseColour.set([1, 1, 1, 1])
        }
    }
}