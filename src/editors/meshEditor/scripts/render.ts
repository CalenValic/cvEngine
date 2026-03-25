import { device } from "../../../deviceInitialiser.js"
import { bufferManager, computeShaderManager, renderShaderManager, renderTargetManager,  } from "../../../managers.js"
import { resolution } from "../index.js"
import { meshData } from "./meshData.js"

export const render = () => {
    const entityRenderShader = renderShaderManager.getShader("entityRenderShader")
    const transparentEntityRenderShader = renderShaderManager.getShader("transparentEntityRenderShader")
    const shadedEntityRenderShader = renderShaderManager.getShader("shadedEntityRenderShader")
    const shadedTransparentEntityRenderShader = renderShaderManager.getShader("shadedTransparentEntityRenderShader")
    const windowRenderShader = renderShaderManager.getShader("windowRenderShader")
    const lines3dRenderShader = renderShaderManager.getShader("lines3dRenderShader")
    const linesConstantSize3dRenderShader = renderShaderManager.getShader("linesConstantSize3dRenderShader")
    const cubesConstantSizeRenderShader = renderShaderManager.getShader("cubesConstantSizeRenderShader")
    const fogRenderShader = renderShaderManager.getShader("fogRenderShader")
    const gridRenderShader = renderShaderManager.getShader("gridRenderShader")
    const meshRenderShader = renderShaderManager.getShader("meshRenderShader")
    const texturedMeshRenderShader = renderShaderManager.getShader("texturedMeshRenderShader")
    const selectedTrianglesRenderShader = renderShaderManager.getShader("selectedTrianglesRenderShader")
    const tempTrianglesRenderShader = renderShaderManager.getShader("tempTrianglesRenderShader")
    const uvMeshRenderShader = renderShaderManager.getShader("uvMeshRenderShader")

    const commandEncoder = device.createCommandEncoder()

    if (meshData.show.texture) {
        texturedMeshRenderShader.render(commandEncoder, "clear", {
            camera: "mainCamera",
            texture: "defaultTexture",
            target: "mainRenderTarget",
            vertexBuffer: "meshVertexBuffer",
        })    
    } else {
        meshRenderShader.render(commandEncoder, "clear", {
            camera: "mainCamera",
            target: "mainRenderTarget",
            vertexBuffer: "meshVertexBuffer",
        })
    }
    if (meshData.show.xzGrid) {
        gridRenderShader.render(commandEncoder, "load", {
            camera: "mainCamera",
            target: "mainRenderTarget",
            grid: "xzSmallGridBuffer"
        })
        gridRenderShader.render(commandEncoder, "load", {
            camera: "mainCamera",
            target: "mainRenderTarget",
            grid: "xzGridBuffer"
        })
    }
    if (meshData.show.xyGrid) {
        gridRenderShader.render(commandEncoder, "load", {
            camera: "mainCamera",
            target: "mainRenderTarget",
            grid: "xyGridBuffer"
        })
    }
    if (meshData.show.yzGrid) {
        gridRenderShader.render(commandEncoder, "load", {
            camera: "mainCamera",
            target: "mainRenderTarget",
            grid: "yzGridBuffer"
        })
    }
    entityRenderShader.render(commandEncoder, "load", {
        camera: "mainCamera",
        layer: "mainLayer"
    })
    entityRenderShader.render(commandEncoder, "clear", {
        camera: "mainCamera",
        layer: "gizmoLayer"
    })
    shadedEntityRenderShader.render(commandEncoder, "load", {
        camera: "mainCamera",
        layer: "mainLayer"
    })
    lines3dRenderShader.render(commandEncoder, "load", {
        camera: "mainCamera",
        target: "mainRenderTarget",
        buffer: "linesBuffer"
    })
    lines3dRenderShader.render(commandEncoder, "clear", {
        camera: "axisCamera",
        target: "axisRenderTarget",
        buffer: "axisLinesBuffer"
    })
    linesConstantSize3dRenderShader.render(commandEncoder, "load", {
        camera: "mainCamera",
        target: "mainRenderTarget",
        buffer: "constantSizeLinesBuffer"
    })
    cubesConstantSizeRenderShader.render(commandEncoder, "load", {
        camera: "mainCamera",
        target: "mainRenderTarget",
        buffer: "constantSizeCubesBuffer"
    })

    fogRenderShader.render(commandEncoder, "clear", {
        target: "finalRenderTarget",
        fogBindGroup: "fogRenderShaderBindGroup"
    })
    var mainRenderTarget = renderTargetManager.getRenderTarget("mainRenderTarget")
    var finalRenderTarget = renderTargetManager.getRenderTarget("finalRenderTarget")
    commandEncoder.copyTextureToTexture(
        {
            texture: finalRenderTarget.texture!
        },
        {
            texture: mainRenderTarget.texture!
        },
        resolution
    )

    selectedTrianglesRenderShader.render(commandEncoder, "load", {
        camera: "mainCamera",
        target: "mainRenderTarget",
        vertexBuffer: "selectedTrianglesVertexBuffer"
    })
    tempTrianglesRenderShader.render(commandEncoder, "load", {
        camera: "mainCamera",
        target: "mainRenderTarget",
        vertexBuffer: "tempTrianglesVertexBuffer"
    })
    transparentEntityRenderShader.render(commandEncoder, "load", {
        camera: "mainCamera",
        layer: "mainLayer",
        fog: "fogUniformsBindGroup"
    })
    shadedTransparentEntityRenderShader.render(commandEncoder, "load", {
        camera: "mainCamera",
        layer: "mainLayer",
        fog: "fogUniformsBindGroup"
    })

    if (meshData.currentlyEditing == "uvs") {
        // gridRenderShader.render(commandEncoder, "load", {
        //     camera: "uvCamera",
        //     target: "uvRenderTarget",
        //     grid: "uvSmallGridBuffer"
        // })
        uvMeshRenderShader.render(commandEncoder, "clear", {
            camera: "uvCamera",
            target: "uvRenderTarget",
            vertexBuffer: "uvMeshVertexBuffer"
        })
        selectedTrianglesRenderShader.render(commandEncoder, "load", {
            camera: "uvCamera",
            target: "uvRenderTarget",
            vertexBuffer: "selectedUVTrianglesVertexBuffer"
        })
        gridRenderShader.render(commandEncoder, "load", {
            camera: "uvCamera",
            target: "uvRenderTarget",
            grid: "uvGridBuffer"
        })
        linesConstantSize3dRenderShader.render(commandEncoder, "load", {
            camera: "uvCamera",
            target: "uvRenderTarget",
            buffer: "uvLinesBuffer"
        })
        cubesConstantSizeRenderShader.render(commandEncoder, "load", {
            camera: "uvCamera",
            target: "uvRenderTarget",
            buffer: "uvCubesBuffer"
        })
    }

    windowRenderShader.render(commandEncoder, "clear", {})

    device.queue.submit([commandEncoder.finish()])
}