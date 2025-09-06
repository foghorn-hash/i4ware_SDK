import sys
import os
import json

from OCC.Core.gp import gp_Pnt
from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_MakeEdge, BRepBuilderAPI_MakeWire
from OCC.Core.BRepOffsetAPI import BRepOffsetAPI_ThruSections
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Fuse
from OCC.Extend.DataExchange import write_stl_file

from OCC.Display.OCCViewer import OffscreenRenderer
from OCC.Core.Quantity import Quantity_Color, Quantity_TOC_RGB

# === Args ===
filename = sys.argv[1] if len(sys.argv) > 1 else "futuristic_hypercar"

# === === Car Body Construction === ===
def make_profile(points):
    edges = []
    for i in range(len(points) - 1):
        edge = BRepBuilderAPI_MakeEdge(points[i], points[i + 1]).Edge()
        edges.append(edge)
    edge = BRepBuilderAPI_MakeEdge(points[-1], points[0]).Edge()  # close loop
    wire = BRepBuilderAPI_MakeWire()
    for e in edges:
        wire.Add(e)
    return wire.Wire()

# Define car body profiles (cyberpunk style)
front = make_profile([
    gp_Pnt(-1.0, 0.0, 0.2),
    gp_Pnt(0.0, 1.0, 0.1),
    gp_Pnt(1.0, 0.0, 0.2),
    gp_Pnt(0.0, -1.0, 0.1)
])

mid = make_profile([
    gp_Pnt(-1.2, 0.0, 0.5),
    gp_Pnt(0.0, 1.1, 1.1),
    gp_Pnt(1.2, 0.0, 0.5),
    gp_Pnt(0.0, -1.1, 1.1)
])

rear = make_profile([
    gp_Pnt(-1.1, 0.0, 0.4),
    gp_Pnt(0.0, 1.2, 0.7),
    gp_Pnt(1.1, 0.0, 0.4),
    gp_Pnt(0.0, -1.2, 0.7)
])

# Loft sections into car body shell
section_loft = BRepOffsetAPI_ThruSections(True)
section_loft.AddWire(front)
section_loft.AddWire(mid)
section_loft.AddWire(rear)
section_loft.Build()
car_body = section_loft.Shape()

# === Laravel Integration Paths ===
laravel_root = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))

stl_path = os.path.join(laravel_root, 'storage', 'app', 'public', 'stl-files', f'{filename}.stl')
screenshot_path = os.path.join(laravel_root, 'storage', 'app', 'public', 'stl-screenshots', f'screenshot_{filename}.png')

os.makedirs(os.path.dirname(stl_path), exist_ok=True)
os.makedirs(os.path.dirname(screenshot_path), exist_ok=True)

# === Export STL ===
write_stl_file(car_body, stl_path)

# === Screenshot ===
renderer = OffscreenRenderer()
renderer.Create()
white = Quantity_Color(1.0, 1.0, 1.0, Quantity_TOC_RGB)
renderer.View.SetBgGradientColors(white, white, 2)
renderer.SetSize(444, 121)
renderer.DisplayShape(car_body)
renderer.FitAll()
renderer.ExportToImage(screenshot_path)

# === Final Output ===
print(json.dumps({
    "stl_filename": filename,
    "success": True
}))
