import bpy

stl_file = 'original.stl'
fbx_file = 'test.fbx'

bpy.ops.import_mesh.stl(filepath=stl_file)

bpy.ops.object.modifier_add(type='DECIMATE')
bpy.context.object.modifiers["Decimate"].decimate_type = 'DISSOLVE'
bpy.ops.object.modifier_apply(apply_as='DATA', modifier="Decimate")

bpy.ops.export_scene.fbx(filepath=fbx_file)
