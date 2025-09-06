import sys
import os
import json

from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_MakeWire, BRepBuilderAPI_MakeEdge, BRepBuilderAPI_MakePolygon
from OCC.Core.BRepOffsetAPI import BRepOffsetAPI_ThruSections
from OCC.Core.gp import gp_Pnt, gp_Ax2, gp_Dir, gp_Elips
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeCylinder, BRepPrimAPI_MakeBox
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Cut
from OCC.Display.SimpleGui import init_display
from OCC.Core.TopoDS import TopoDS_Compound
from OCC.Core.BRep import BRep_Builder
from OCC.Display.OCCViewer import rgb_color
from OCC.Extend.DataExchange import write_stl_file

# === Args ===
filename = sys.argv[1] if len(sys.argv) > 1 else "futuristic_spaceship"

# === Functions ===

def make_ellipse_wire(width, height, x_offset):
    ellipse = gp_Elips(gp_Ax2(gp_Pnt(x_offset, 0, 0), gp_Dir(0, 0, 1)), width / 2, height / 2)
    ellipse_edge = BRepBuilderAPI_MakeEdge(ellipse).Edge()
    wire = BRepBuilderAPI_MakeWire(ellipse_edge).Wire()
    return wire

def make_rect_wire(width, height, fillet_radius, x_offset):
    poly = BRepBuilderAPI_MakePolygon()
    hw = width / 2
    hh = height / 2
    points = [
        gp_Pnt(x_offset, -hw, -hh),
        gp_Pnt(x_offset, hw, -hh),
        gp_Pnt(x_offset, hw, hh),
        gp_Pnt(x_offset, -hw, hh),
        gp_Pnt(x_offset, -hw, -hh)
    ]
    for pt in points:
        poly.Add(pt)
    wire = poly.Wire()
    return wire

# === Main Body ===

# Build chassis
front_wire = make_ellipse_wire(1200, 400, 0)
mid_wire = make_rect_wire(1800, 500, 100, 2000)
rear_wire = make_ellipse_wire(1400, 350, 4000)
loft = BRepOffsetAPI_ThruSections(True, True, 1.0e-4)
loft.AddWire(front_wire)
loft.AddWire(mid_wire)
loft.AddWire(rear_wire)
loft.Build()
chassis = loft.Shape()

# Cut wheel arches
arch_radius = 400
arch_width = 300
arch_z = 200
arch_positions = [900, 900, 3200, 3200]
arch_offsets = [-arch_width/2, arch_width/2, -arch_width/2, arch_width/2]

for i in range(4):
    x = arch_positions[i]
    y = arch_offsets[i % 2]
    arch_cyl = BRepPrimAPI_MakeCylinder(gp_Ax2(gp_Pnt(x, y, arch_z), gp_Dir(0, 1, 0)), arch_radius, arch_width).Shape()
    chassis = BRepAlgoAPI_Cut(chassis, arch_cyl).Shape()

# Cut side windows
window_x = 1600
window_z = 300
window_y_offset = 900
for side in [-1, 1]:
    window_box = BRepPrimAPI_MakeBox(
        gp_Pnt(window_x, side * window_y_offset, window_z),
        800, side * 20, 300
    ).Shape()
    chassis = BRepAlgoAPI_Cut(chassis, window_box).Shape()

# Cut sunroof
sunroof_box = BRepPrimAPI_MakeBox(gp_Pnt(1600, -300, 550), 800, 600, 20).Shape()
chassis = BRepAlgoAPI_Cut(chassis, sunroof_box).Shape()

# === Display Initialization ===
display, start_display, add_menu, add_function_to_menu = init_display()
builder = BRep_Builder()
assembly = TopoDS_Compound()
builder.MakeCompound(assembly)

# Add chassis
builder.Add(assembly, chassis)
display.DisplayShape(chassis, color=rgb_color(1.0, 0.0, 0.0), transparency=0.0)

# === Add Wheels ===
wheel_radius = 390
wheel_width = 280
wheel_positions = [(900, -150), (900, 150), (3200, -150), (3200, 150)]
for (x, y) in wheel_positions:
    wheel = BRepPrimAPI_MakeCylinder(gp_Ax2(gp_Pnt(x, y, arch_z), gp_Dir(0, 1, 0)), wheel_radius, wheel_width).Shape()
    builder.Add(assembly, wheel)
    display.DisplayShape(wheel, color=rgb_color(0.2, 0.2, 0.2))

# === Add Mirrors ===
mirror_size = (120, 20, 80)
for side in [-1, 1]:
    mirror = BRepPrimAPI_MakeBox(gp_Pnt(1700, side * 950, 450), mirror_size[0], side * mirror_size[1], mirror_size[2]).Shape()
    builder.Add(assembly, mirror)
    display.DisplayShape(mirror, color=rgb_color(0.8, 0.8, 0.8))

# === Add Spoiler ===
spoiler = BRepPrimAPI_MakeBox(gp_Pnt(3900, -500, 620), 1000, 150, 20).Shape()
builder.Add(assembly, spoiler)
display.DisplayShape(spoiler, color=rgb_color(0.1, 0.1, 0.1))

# Spoiler legs
for y in [-300, 300]:
    leg = BRepPrimAPI_MakeCylinder(gp_Ax2(gp_Pnt(4000, y, 600), gp_Dir(0, 0, 1)), 15, 20).Shape()
    builder.Add(assembly, leg)
    display.DisplayShape(leg, color=rgb_color(0.1, 0.1, 0.1))

# === Add Headlights ===
for side in [-1, 1]:
    headlight = BRepPrimAPI_MakeCylinder(
        gp_Ax2(gp_Pnt(200, side * 500, 300), gp_Dir(1, 0, 0)),
        80, 100
    ).Shape()
    builder.Add(assembly, headlight)
    display.DisplayShape(headlight, color=rgb_color(1.0, 1.0, 1.0))

# === Laravel Integration Paths ===
laravel_root = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))

stl_path = os.path.join(laravel_root, 'storage', 'app', 'public', 'stl-files', f'{filename}.stl')
screenshot_path = os.path.join(laravel_root, 'storage', 'app', 'public', 'stl-screenshots', f'screenshot_{filename}.png')

os.makedirs(os.path.dirname(stl_path), exist_ok=True)
os.makedirs(os.path.dirname(screenshot_path), exist_ok=True)

# === Export STL ===
write_stl_file(assembly, stl_path)
# === Screenshot ===
renderer = OffscreenRenderer()
renderer.Create()
white = Quantity_Color(1.0, 1.0, 1.0, Quantity_TOC_RGB)
renderer.View.SetBgGradientColors(white, white, 2)
renderer.SetSize(444, 121)
renderer.DisplayShape(assembly)
renderer.FitAll()
renderer.ExportToImage(screenshot_path)

# === Final Output ===
print(json.dumps({
    "stl_filename": filename,
    "success": True
}))
