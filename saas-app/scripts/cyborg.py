import os
import sys
import json

from OCC.Core.gp import gp_Pnt, gp_Dir, gp_Trsf, gp_Vec, gp_Ax2
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox, BRepPrimAPI_MakeSphere, BRepPrimAPI_MakeCylinder
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Fuse
from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_Transform
from OCC.Extend.DataExchange import write_stl_file

from OCC.Display.OCCViewer import OffscreenRenderer
from OCC.Core.Quantity import Quantity_Color, Quantity_TOC_RGB

# === Args ===
filename = sys.argv[1] if len(sys.argv) > 1 else "futuristic_cyborg"

# === Dimensions (meters) ===
total_height = 1.8

# Head
head_radius = 0.1125
head = BRepPrimAPI_MakeSphere(gp_Pnt(0, 0, total_height - head_radius), head_radius).Shape()

# Eyes (cylindrical protrusions)
eye_radius = 0.02
eye_length = 0.06
eye_offset = 0.04

eye_left = BRepPrimAPI_MakeCylinder(
    gp_Ax2(gp_Pnt(-eye_offset, 0.1, total_height - head_radius), gp_Dir(0, 1, 0)),
    eye_radius, eye_length
).Shape()

eye_right = BRepPrimAPI_MakeCylinder(
    gp_Ax2(gp_Pnt(eye_offset, 0.1, total_height - head_radius), gp_Dir(0, 1, 0)),
    eye_radius, eye_length
).Shape()

# Torso
torso_height = 0.55
torso_width = 0.4
torso_depth = 0.25
torso = BRepPrimAPI_MakeBox(
    gp_Pnt(-torso_width/2, -torso_depth/2, total_height - head_radius - torso_height),
    torso_width, torso_depth, torso_height
).Shape()

# Chest core (cylinder)
core = BRepPrimAPI_MakeCylinder(
    gp_Ax2(gp_Pnt(0, torso_depth/2 + 0.001, total_height - head_radius - torso_height/2), gp_Dir(0, 1, 0)),
    0.08, 0.1
).Shape()

# Arm dimensions
upper_arm_length = 0.35
forearm_length = 0.3
arm_radius = 0.05
hand_size = 0.08

# Left Arm (Upper Arm)
left_upper_arm = BRepPrimAPI_MakeCylinder(
    gp_Ax2(gp_Pnt(-torso_width/2 - 0.001, 0, total_height - head_radius - 0.1), gp_Dir(-1, 0, 0)),
    arm_radius, upper_arm_length
).Shape()

# Left Forearm
left_forearm = BRepPrimAPI_MakeCylinder(
    gp_Ax2(gp_Pnt(-torso_width/2 - upper_arm_length - 0.01, 0, total_height - head_radius - 0.3), gp_Dir(-1, 0, 0)),
    arm_radius, forearm_length
).Shape()

# Left Hand
left_hand = BRepPrimAPI_MakeBox(
    gp_Pnt(-torso_width/2 - upper_arm_length - forearm_length - hand_size, -hand_size/2, total_height - head_radius - 0.35),
    hand_size, hand_size, hand_size
).Shape()

# Right Arm (mirror X)
def mirror_x(shape):
    trsf = gp_Trsf()
    trsf.SetMirror(gp_Pnt(0, 0, 0))
    return BRepBuilderAPI_Transform(shape, trsf, True).Shape()

right_upper_arm = mirror_x(left_upper_arm)
right_forearm = mirror_x(left_forearm)
right_hand = mirror_x(left_hand)

# Legs
leg_radius = 0.06
upper_leg_length = 0.45
lower_leg_length = 0.4
foot_height = 0.05
foot_length = 0.2
foot_width = 0.1

# Left Leg (upper)
left_upper_leg = BRepPrimAPI_MakeCylinder(
    gp_Ax2(gp_Pnt(-0.12, 0, total_height - head_radius - torso_height - 0.01), gp_Dir(0, 0, -1)),
    leg_radius, upper_leg_length
).Shape()

left_lower_leg = BRepPrimAPI_MakeCylinder(
    gp_Ax2(gp_Pnt(-0.12, 0, total_height - head_radius - torso_height - upper_leg_length - 0.01), gp_Dir(0, 0, -1)),
    leg_radius, lower_leg_length
).Shape()

left_foot = BRepPrimAPI_MakeBox(
    gp_Pnt(-0.12 - foot_width/2, -foot_length/2, total_height - head_radius - torso_height - upper_leg_length - lower_leg_length - foot_height),
    foot_width, foot_length, foot_height
).Shape()

# Right Leg (mirror X)
right_upper_leg = mirror_x(left_upper_leg)
right_lower_leg = mirror_x(left_lower_leg)
right_foot = mirror_x(left_foot)

# === Fuse all parts ===
parts = [
    head, eye_left, eye_right,
    torso, core,
    left_upper_arm, left_forearm, left_hand,
    right_upper_arm, right_forearm, right_hand,
    left_upper_leg, left_lower_leg, left_foot,
    right_upper_leg, right_lower_leg, right_foot
]

# Fuse one by one
fused = parts[0]
for part in parts[1:]:
    fused = BRepAlgoAPI_Fuse(fused, part).Shape()

# === Laravel Path Handling ===
laravel_root = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
stl_path = os.path.join(laravel_root, 'storage', 'app', 'public', 'stl-files', f'{filename}.stl')
screenshot_path = os.path.join(laravel_root, 'storage', 'app', 'public', 'stl-screenshots', f'screenshot_{filename}.png')

os.makedirs(os.path.dirname(stl_path), exist_ok=True)
os.makedirs(os.path.dirname(screenshot_path), exist_ok=True)

# === Export STL ===
write_stl_file(fused, stl_path)

# === Screenshot ===
renderer = OffscreenRenderer()
renderer.Create()
white = Quantity_Color(1.0, 1.0, 1.0, Quantity_TOC_RGB)
renderer.View.SetBgGradientColors(white, white, 2)
renderer.SetSize(444, 121)
renderer.DisplayShape(fused)
renderer.FitAll()
renderer.ExportToImage(screenshot_path)

# === Final Output ===
print(json.dumps({
    "stl_filename": filename,
    "success": True
}))
