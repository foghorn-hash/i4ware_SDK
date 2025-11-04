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

# === Dimensions (scaled to match other models ~100 units) ===
total_height = 100  # Changed from 1.8 meters to 100 units to match other models

# Scaling factor: from 1.8m to 100 units
scale_factor = 100 / 1.8

# Head
head_radius = 0.1125 * scale_factor
head = BRepPrimAPI_MakeSphere(gp_Pnt(0, 0, total_height - head_radius), head_radius).Shape()

# Eyes (cylindrical protrusions)
eye_radius = 0.02 * scale_factor
eye_length = 0.06 * scale_factor
eye_offset = 0.04 * scale_factor

eye_left = BRepPrimAPI_MakeCylinder(
    gp_Ax2(gp_Pnt(-eye_offset, 0.1 * scale_factor, total_height - head_radius), gp_Dir(0, 1, 0)),
    eye_radius, eye_length
).Shape()

eye_right = BRepPrimAPI_MakeCylinder(
    gp_Ax2(gp_Pnt(eye_offset, 0.1 * scale_factor, total_height - head_radius), gp_Dir(0, 1, 0)),
    eye_radius, eye_length
).Shape()

# Torso
torso_height = 0.55 * scale_factor
torso_width = 0.4 * scale_factor
torso_depth = 0.25 * scale_factor
torso = BRepPrimAPI_MakeBox(
    gp_Pnt(-torso_width/2, -torso_depth/2, total_height - head_radius - torso_height),
    torso_width, torso_depth, torso_height
).Shape()

# Chest core (cylinder)
core = BRepPrimAPI_MakeCylinder(
    gp_Ax2(gp_Pnt(0, torso_depth/2 + 0.001 * scale_factor, total_height - head_radius - torso_height/2), gp_Dir(0, 1, 0)),
    0.08 * scale_factor, 0.1 * scale_factor
).Shape()

# Arm dimensions
upper_arm_length = 0.35 * scale_factor
forearm_length = 0.3 * scale_factor
arm_radius = 0.05 * scale_factor
hand_size = 0.08 * scale_factor

# Left Arm (Upper Arm)
left_upper_arm = BRepPrimAPI_MakeCylinder(
    gp_Ax2(gp_Pnt(-torso_width/2 - 0.001 * scale_factor, 0, total_height - head_radius - 0.1 * scale_factor), gp_Dir(-1, 0, 0)),
    arm_radius, upper_arm_length
).Shape()

# Left Forearm
left_forearm = BRepPrimAPI_MakeCylinder(
    gp_Ax2(gp_Pnt(-torso_width/2 - upper_arm_length - 0.01 * scale_factor, 0, total_height - head_radius - 0.3 * scale_factor), gp_Dir(-1, 0, 0)),
    arm_radius, forearm_length
).Shape()

# Left Hand
left_hand = BRepPrimAPI_MakeBox(
    gp_Pnt(-torso_width/2 - upper_arm_length - forearm_length - hand_size, -hand_size/2, total_height - head_radius - 0.35 * scale_factor),
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
leg_radius = 0.06 * scale_factor
upper_leg_length = 0.45 * scale_factor
lower_leg_length = 0.4 * scale_factor
foot_height = 0.05 * scale_factor
foot_length = 0.2 * scale_factor
foot_width = 0.1 * scale_factor

# Left Leg (upper)
left_upper_leg = BRepPrimAPI_MakeCylinder(
    gp_Ax2(gp_Pnt(-0.12 * scale_factor, 0, total_height - head_radius - torso_height - 0.01 * scale_factor), gp_Dir(0, 0, -1)),
    leg_radius, upper_leg_length
).Shape()

left_lower_leg = BRepPrimAPI_MakeCylinder(
    gp_Ax2(gp_Pnt(-0.12 * scale_factor, 0, total_height - head_radius - torso_height - upper_leg_length - 0.01 * scale_factor), gp_Dir(0, 0, -1)),
    leg_radius, lower_leg_length
).Shape()

left_foot = BRepPrimAPI_MakeBox(
    gp_Pnt(-0.12 * scale_factor - foot_width/2, -foot_length/2, total_height - head_radius - torso_height - upper_leg_length - lower_leg_length - foot_height),
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
screenshot_path = os.path.join(laravel_root, 'storage', 'app', 'stl-screenshots', f'screenshot_{filename}.png')

os.makedirs(os.path.dirname(stl_path), exist_ok=True)
os.makedirs(os.path.dirname(screenshot_path), exist_ok=True)

# === Export STL ===
write_stl_file(fused, stl_path)

# === Screenshot ===
try:
    # Try OffscreenRenderer first (works on Linux/Windows)
    renderer = OffscreenRenderer()
    renderer.Create()
    white = Quantity_Color(1.0, 1.0, 1.0, Quantity_TOC_RGB)
    renderer.View.SetBgGradientColors(white, white, 2)
    renderer.SetSize(444, 121)
    renderer.DisplayShape(fused)
    renderer.FitAll()
    renderer.ExportToImage(screenshot_path)
except Exception as e:
    # OffscreenRenderer failed (likely macOS), use isometric projection to match 3D viewer
    try:
        from PIL import Image, ImageDraw

        # Create image matching OffscreenRenderer size
        img = Image.new('RGB', (444, 121), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Compact rendering for card size
        center_x, center_y = 222, 60
        scale = 1.2  # Moderate scale

        # Gray metallic colors to match original style
        main_metal = '#A0A0A0'   # Light Gray
        dark_metal = '#707070'   # Dark Gray
        light_metal = '#C0C0C0'  # Silver
        accent_blue = '#8090A0'  # Light blue-gray for accents

        # Isometric projection for 3D viewer camera perspective
        iso_x_factor = 0.866  # cos(30°)
        iso_y_factor = 0.5    # sin(30°)

        def iso_project(x, y, z):
            screen_x = center_x + (x - y) * iso_x_factor * scale
            screen_y = center_y - z * iso_y_factor * scale + (x + y) * iso_y_factor * scale * 0.3
            return int(screen_x), int(screen_y)

        # Cyborg dimensions in scaled units
        h = total_height  # 100 units
        hr = head_radius  # 0.1125 * scale_factor

        # Head
        head_center = iso_project(0, 0, h - hr)
        head_r = int(hr * scale)
        draw.ellipse([head_center[0] - head_r, head_center[1] - head_r//2,
                     head_center[0] + head_r, head_center[1] + head_r//2],
                    fill=main_metal, outline=dark_metal, width=1)

        # Eyes
        eye_r = int(eye_radius * scale)
        for eye_x in [-eye_offset, eye_offset]:
            eye_pos = iso_project(eye_x, 0.1 * scale_factor, h - hr)
            draw.ellipse([eye_pos[0] - eye_r, eye_pos[1] - eye_r//2,
                         eye_pos[0] + eye_r, eye_pos[1] + eye_r//2],
                        fill=accent_blue, outline=dark_metal, width=1)

        # Torso
        tw, td, th = torso_width, torso_depth, torso_height
        torso_corners = [
            iso_project(-tw/2, -td/2, h - hr - th),  # front left bottom
            iso_project(tw/2, -td/2, h - hr - th),   # front right bottom
            iso_project(tw/2, td/2, h - hr - th),    # back right bottom
            iso_project(-tw/2, td/2, h - hr - th),   # back left bottom
            iso_project(-tw/2, -td/2, h - hr),       # front left top
            iso_project(tw/2, -td/2, h - hr),        # front right top
            iso_project(tw/2, td/2, h - hr),         # back right top
            iso_project(-tw/2, td/2, h - hr)         # back left top
        ]

        # Draw torso faces
        # Front face
        draw.polygon([torso_corners[0], torso_corners[1], torso_corners[5], torso_corners[4]],
                    fill=main_metal, outline=dark_metal, width=1)
        # Right face
        draw.polygon([torso_corners[1], torso_corners[2], torso_corners[6], torso_corners[5]],
                    fill=light_metal, outline=dark_metal, width=1)
        # Top face
        draw.polygon([torso_corners[4], torso_corners[5], torso_corners[6], torso_corners[7]],
                    fill=light_metal, outline=dark_metal, width=1)

        # Chest Core
        core_center = iso_project(0, td/2 + 0.001 * scale_factor, h - hr - th/2)
        core_r = int(0.08 * scale_factor * scale)
        draw.ellipse([core_center[0] - core_r, core_center[1] - core_r//2,
                     core_center[0] + core_r, core_center[1] + core_r//2],
                    fill=accent_blue, outline=dark_metal, width=1)

        # Arms
        arm_start = iso_project(-tw/2, 0, h - hr - 0.1 * scale_factor)
        arm_end = iso_project(-tw/2 - upper_arm_length - forearm_length, 0, h - hr - 0.3 * scale_factor)
        arm_width = int(arm_radius * scale * 2)

        # Left arm
        draw.line([arm_start, arm_end], fill=main_metal, width=arm_width)
        # Right arm (mirror)
        arm_start_r = iso_project(tw/2, 0, h - hr - 0.1 * scale_factor)
        arm_end_r = iso_project(tw/2 + upper_arm_length + forearm_length, 0, h - hr - 0.3 * scale_factor)
        draw.line([arm_start_r, arm_end_r], fill=main_metal, width=arm_width)

        # Legs
        leg_width = int(leg_radius * scale * 2)
        for leg_x in [-0.12 * scale_factor, 0.12 * scale_factor]:
            leg_start = iso_project(leg_x, 0, h - hr - th)
            leg_end = iso_project(leg_x, 0, h - hr - th - upper_leg_length - lower_leg_length)
            draw.line([leg_start, leg_end], fill=main_metal, width=leg_width)

        img.save(screenshot_path, 'PNG', quality=90)

    except Exception as fallback_e:
        # Final fallback
        from PIL import Image, ImageDraw
        img = Image.new('RGB', (444, 121), color=(240, 240, 240))
        draw = ImageDraw.Draw(img)
        draw.text((180, 55), "CYBORG", fill=(100, 100, 100))
        img.save(screenshot_path, 'PNG')

# === Final Output ===
print(json.dumps({
    "stl_filename": filename,
    "success": True
}))
