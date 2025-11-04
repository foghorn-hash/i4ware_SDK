import sys
import os
import json
import traceback

from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_MakeWire, BRepBuilderAPI_MakeEdge, BRepBuilderAPI_MakePolygon
from OCC.Core.BRepOffsetAPI import BRepOffsetAPI_ThruSections
from OCC.Core.gp import gp_Pnt, gp_Ax2, gp_Dir, gp_Elips
from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeCylinder, BRepPrimAPI_MakeBox
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Cut
from OCC.Core.TopoDS import TopoDS_Compound
from OCC.Core.BRep import BRep_Builder
from OCC.Display.OCCViewer import OffscreenRenderer
from OCC.Core.Quantity import Quantity_Color, Quantity_TOC_RGB
from OCC.Extend.DataExchange import write_stl_file

try:
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

    # Build chassis (scaled to ~100 units to match other models)
    front_wire = make_ellipse_wire(30, 10, 0)
    mid_wire = make_rect_wire(45, 12.5, 2.5, 50)
    rear_wire = make_ellipse_wire(35, 8.75, 100)
    loft = BRepOffsetAPI_ThruSections(True, True, 1.0e-4)
    loft.AddWire(front_wire)
    loft.AddWire(mid_wire)
    loft.AddWire(rear_wire)
    loft.Build()
    chassis = loft.Shape()

    # Cut wheel arches
    arch_radius = 10
    arch_width = 7.5
    arch_z = 5
    arch_positions = [22.5, 22.5, 80, 80]
    arch_offsets = [-arch_width/2, arch_width/2, -arch_width/2, arch_width/2]

    for i in range(4):
        x = arch_positions[i]
        y = arch_offsets[i % 2]
        arch_cyl = BRepPrimAPI_MakeCylinder(gp_Ax2(gp_Pnt(x, y, arch_z), gp_Dir(0, 1, 0)), arch_radius, arch_width).Shape()
        chassis = BRepAlgoAPI_Cut(chassis, arch_cyl).Shape()

    # Cut side windows
    window_x = 40
    window_z = 7.5
    window_y_offset = 22.5
    for side in [-1, 1]:
        window_box = BRepPrimAPI_MakeBox(
            gp_Pnt(window_x, side * window_y_offset, window_z),
            20, side * 0.5, 7.5
        ).Shape()
        chassis = BRepAlgoAPI_Cut(chassis, window_box).Shape()

    # Cut sunroof
    sunroof_box = BRepPrimAPI_MakeBox(gp_Pnt(40, -7.5, 13.75), 20, 15, 0.5).Shape()
    chassis = BRepAlgoAPI_Cut(chassis, sunroof_box).Shape()

    # === Assembly ===
    builder = BRep_Builder()
    assembly = TopoDS_Compound()
    builder.MakeCompound(assembly)

    # Add chassis
    builder.Add(assembly, chassis)

    # === Add Wheels ===
    wheel_radius = 9.75
    wheel_width = 7
    wheel_positions = [(22.5, -3.75), (22.5, 3.75), (80, -3.75), (80, 3.75)]
    for (x, y) in wheel_positions:
        wheel = BRepPrimAPI_MakeCylinder(gp_Ax2(gp_Pnt(x, y, arch_z), gp_Dir(0, 1, 0)), wheel_radius, wheel_width).Shape()
        builder.Add(assembly, wheel)

    # === Add Mirrors ===
    mirror_size = (3, 0.5, 2)
    for side in [-1, 1]:
        mirror = BRepPrimAPI_MakeBox(gp_Pnt(42.5, side * 23.75, 11.25), mirror_size[0], side * mirror_size[1], mirror_size[2]).Shape()
        builder.Add(assembly, mirror)

    # === Add Spoiler ===
    spoiler = BRepPrimAPI_MakeBox(gp_Pnt(97.5, -12.5, 15.5), 25, 3.75, 0.5).Shape()
    builder.Add(assembly, spoiler)

    # Spoiler legs
    for y in [-7.5, 7.5]:
        leg = BRepPrimAPI_MakeCylinder(gp_Ax2(gp_Pnt(100, y, 15), gp_Dir(0, 0, 1)), 0.375, 0.5).Shape()
        builder.Add(assembly, leg)

    # === Add Headlights ===
    for side in [-1, 1]:
        headlight = BRepPrimAPI_MakeCylinder(
            gp_Ax2(gp_Pnt(5, side * 12.5, 7.5), gp_Dir(1, 0, 0)),
            2, 2.5
        ).Shape()
        builder.Add(assembly, headlight)

    # === Laravel Integration Paths ===
    laravel_root = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))

    stl_path = os.path.join(laravel_root, 'storage', 'app', 'public', 'stl-files', f'{filename}.stl')
    screenshot_path = os.path.join(laravel_root, 'storage', 'app', 'stl-screenshots', f'screenshot_{filename}.png')

    os.makedirs(os.path.dirname(stl_path), exist_ok=True)
    os.makedirs(os.path.dirname(screenshot_path), exist_ok=True)

    # === Export STL ===
    write_stl_file(assembly, stl_path)
    # === Screenshot ===
    try:
        # Try OffscreenRenderer first (works on Linux/Windows)
        renderer = OffscreenRenderer()
        renderer.Create()
        white = Quantity_Color(1.0, 1.0, 1.0, Quantity_TOC_RGB)
        renderer.View.SetBgGradientColors(white, white, 2)
        renderer.SetSize(444, 121)
        renderer.DisplayShape(assembly)
        renderer.FitAll()
        renderer.ExportToImage(screenshot_path)

    except Exception as e:
        # OffscreenRenderer failed (likely macOS), use isometric fallback
        try:
            from PIL import Image, ImageDraw

            # Create image matching original size
            img = Image.new('RGB', (444, 121), color=(255, 255, 255))
            draw = ImageDraw.Draw(img)

            # Compact rendering for card size
            center_x, center_y = 222, 60
            scale = 1.2  # Moderate scale

            # Gray metallic colors to match original style
            main_gray = '#A0A0A0'    # Light Gray
            dark_gray = '#707070'    # Dark Gray
            light_gray = '#C0C0C0'   # Silver
            accent_gray = '#909090'  # Medium Gray

            # Isometric projection
            iso_x_factor = 0.866
            iso_y_factor = 0.5

            def iso_project(x, y, z):
                screen_x = center_x + (x - y) * iso_x_factor * scale
                screen_y = center_y - z * iso_y_factor * scale + (x + y) * iso_y_factor * scale * 0.3
                return int(screen_x), int(screen_y)

            # Main car body (loft X=0->100)
            # Front ellipse
            front_center = iso_project(0, 0, 0)
            front_top = iso_project(0, -5, 0)
            front_bottom = iso_project(0, 5, 0)

            # Mid rectangle
            mid_center = iso_project(50, 0, 7.5)
            mid_left = iso_project(50, -22.5, 0)
            mid_right = iso_project(50, 22.5, 0)
            mid_top = iso_project(50, -22.5, 15)
            mid_top_right = iso_project(50, 22.5, 15)

            # Rear ellipse
            rear_center = iso_project(100, 0, 4.375)

            # Draw main body shape
            body_points = [front_center, mid_left, rear_center, mid_right]
            draw.polygon(body_points, fill=main_gray, outline=dark_gray, width=1)

            # Top/windscreen area
            windscreen_points = [mid_center, mid_top, mid_top_right,
                               (mid_center[0] + int(15*scale), mid_center[1] - int(4*scale))]
            draw.polygon(windscreen_points, fill=light_gray, outline=dark_gray, width=1)

            # Wheels (4 positions)
            wheel_r = int(9.75 * scale)
            wheel_positions = [(22.5, -3.75, 5), (22.5, 3.75, 5),
                             (80, -3.75, 5), (80, 3.75, 5)]

            for wx, wy, wz in wheel_positions:
                wheel_pos = iso_project(wx, wy, wz)
                draw.ellipse([wheel_pos[0] - wheel_r, wheel_pos[1] - wheel_r//2,
                             wheel_pos[0] + wheel_r, wheel_pos[1] + wheel_r//2],
                            fill='#606060', outline='#404040', width=1)

            # Spoiler
            spoiler_start = iso_project(97.5, -12.5, 15.5)
            spoiler_end = iso_project(122.5, 12.5, 16)
            spoiler_points = [spoiler_start, spoiler_end,
                            (spoiler_end[0], spoiler_end[1] + int(2*scale)),
                            (spoiler_start[0], spoiler_start[1] + int(2*scale))]
            draw.polygon(spoiler_points, fill=accent_gray, outline=dark_gray, width=1)

            # Headlights
            for side in [-1, 1]:
                light_pos = iso_project(5, side * 12.5, 7.5)
                light_r = int(2 * scale)
                draw.ellipse([light_pos[0] - light_r, light_pos[1] - light_r//2,
                             light_pos[0] + light_r, light_pos[1] + light_r//2],
                            fill='#E0E0E0', outline='#C0C0C0', width=1)

            img.save(screenshot_path, 'PNG', quality=90)

        except Exception as fallback_e:
            # Final fallback
            from PIL import Image, ImageDraw
            img = Image.new('RGB', (444, 121), color=(240, 240, 240))
            draw = ImageDraw.Draw(img)
            draw.text((180, 55), "SPORTS CAR", fill=(100, 100, 100))
            img.save(screenshot_path, 'PNG')

    # === Final Output ===
    print(json.dumps({
        "stl_filename": filename,
        "success": True
    }))

except Exception as e:
    print(json.dumps({
        "success": False,
        "error": str(e),
        "traceback": traceback.format_exc()
    }))
    sys.exit(1)
