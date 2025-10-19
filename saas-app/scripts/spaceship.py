from OCC.Core.BRepPrimAPI import (
    BRepPrimAPI_MakeCylinder, BRepPrimAPI_MakeSphere,
    BRepPrimAPI_MakeCone, BRepPrimAPI_MakeBox
)
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Common, BRepAlgoAPI_Fuse
from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_Transform
from OCC.Core.gp import gp_Pnt, gp_Dir, gp_Ax1, gp_Ax2, gp_Trsf, gp_Vec
from OCC.Core.TopoDS import TopoDS_Shape
from OCC.Extend.DataExchange import write_stl_file
from OCC.Display.OCCViewer import OffscreenRenderer
from OCC.Core.Quantity import Quantity_Color, Quantity_TOC_RGB
import sys
import math
import traceback
import json
import os

try:
    # === Args ===
    filename = sys.argv[1] if len(sys.argv) > 1 else "futuristic_spaceship"

    # === Fuselage ===
    fuselage_length = 100.0
    fuselage_radius = 20.0
    fuselage = BRepPrimAPI_MakeCylinder(
        gp_Ax2(gp_Pnt(0, 0, 0), gp_Dir(0, 0, 1)),
        fuselage_radius, fuselage_length
    ).Shape()

    # === Cockpit ===
    cockpit_radius = 15.0
    sphere = BRepPrimAPI_MakeSphere(gp_Pnt(0, 0, 0), cockpit_radius).Shape()
    cut_box = BRepPrimAPI_MakeBox(gp_Pnt(-cockpit_radius, -cockpit_radius, 0),
                                  cockpit_radius * 2, cockpit_radius * 2, cockpit_radius).Shape()
    cockpit_dome = BRepAlgoAPI_Common(sphere, cut_box).Shape()

    trsf_cockpit = gp_Trsf()
    trsf_cockpit.SetTranslation(gp_Vec(0, 0, -cockpit_radius + 5.0))
    cockpit_dome = BRepBuilderAPI_Transform(cockpit_dome, trsf_cockpit, True).Shape()

    # === Engines ===
    engine_radius = 8.0
    engine_length = 30.0
    cyl = BRepPrimAPI_MakeCylinder(engine_radius, engine_length * 0.6).Shape()
    cone = BRepPrimAPI_MakeCone(engine_radius * 1.2, engine_radius, engine_length * 0.4).Shape()

    engine_z = 30
    offset_x = fuselage_radius + engine_radius + 2

    trsf_e1 = gp_Trsf()
    trsf_e1.SetTranslation(gp_Vec(-offset_x, 0, engine_z))
    e1_cyl = BRepBuilderAPI_Transform(cyl, trsf_e1, True).Shape()
    e1_cone = BRepBuilderAPI_Transform(cone, trsf_e1, True).Shape()

    trsf_e2 = gp_Trsf()
    trsf_e2.SetTranslation(gp_Vec(offset_x, 0, engine_z))
    e2_cyl = BRepBuilderAPI_Transform(cyl, trsf_e2, True).Shape()
    e2_cone = BRepBuilderAPI_Transform(cone, trsf_e2, True).Shape()

    # === Wings ===
    wing_length = 40.0
    wing_width = 10.0
    wing_thickness = 2.0
    wing_z = fuselage_length / 2 - wing_thickness / 2

    wing_box = BRepPrimAPI_MakeBox(wing_length, wing_width, wing_thickness).Shape()
    angles = [45, 135, 225, 315]
    wings = []

    for angle_deg in angles:
        angle_rad = math.radians(angle_deg)
        trsf = gp_Trsf()
        trsf.SetTranslation(gp_Vec(-wing_length / 2, -wing_width / 2, wing_z))
        wing_trans = BRepBuilderAPI_Transform(wing_box, trsf, True).Shape()

        trsf_rot = gp_Trsf()
        trsf_rot.SetRotation(
            gp_Ax1(gp_Pnt(0, 0, wing_z), gp_Dir(0, 0, 1)),
            angle_rad
        )
        final_wing = BRepBuilderAPI_Transform(wing_trans, trsf_rot, True).Shape()
        wings.append(final_wing)

    # === Fusion ===
    components = [fuselage, cockpit_dome, e1_cyl, e1_cone, e2_cyl, e2_cone] + wings
    fused: TopoDS_Shape = components[0]
    for part in components[1:]:
        fused = BRepAlgoAPI_Fuse(fused, part).Shape()

    # === Export STL ===
    # Get absolute Laravel project root
    laravel_root = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))

    # Build absolute paths
    stl_path = os.path.join(laravel_root, 'storage', 'app', 'public', 'stl-files', f'{filename}.stl')
    screenshot_path = os.path.join(laravel_root, 'storage', 'app', 'stl-screenshots', f'screenshot_{filename}.png')

    # Make sure directories exist
    os.makedirs(os.path.dirname(stl_path), exist_ok=True)
    os.makedirs(os.path.dirname(screenshot_path), exist_ok=True)

    # Export STL file
    write_stl_file(fused, stl_path)

    # === Screenshot ===
    try:
        # Try OffscreenRenderer first (works on Linux/Windows)
        renderer = OffscreenRenderer()
        renderer.Create()
        white = Quantity_Color(1.0, 1.0, 1.0, Quantity_TOC_RGB)
        renderer.View.SetBgGradientColors(white, white, 2)
        renderer.SetSize(444, 121)

        # Set brown color for the shape to match original
        brown_color = Quantity_Color(0.6, 0.4, 0.2, Quantity_TOC_RGB)
        renderer.DisplayShape(fused, brown_color)

        # Custom camera positioning for better view
        renderer.View.Camera().SetEye(gp_Pnt(150, 150, 100))
        renderer.View.Camera().SetUp(gp_Dir(0, 0, 1))
        renderer.View.Camera().SetCenter(gp_Pnt(0, 0, 50))

        # Scale to fill more of the image
        renderer.View.FitAll(0.8)  # 0.8 margin means object takes 80% of view
        renderer.ExportToImage(screenshot_path)

    except Exception as e:
        # OffscreenRenderer failed (likely macOS), use large brown spaceship like original
        from PIL import Image, ImageDraw

        # Create image matching original size
        img = Image.new('RGB', (444, 121), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)

        # Compact rendering for card size
        center_x, center_y = 222, 60
        scale = 1.2  # Moderate scale - not too big, not too small

        # Gray metallic colors to match original style
        main_gray = '#A0A0A0'    # Light Gray
        dark_gray = '#707070'    # Dark Gray
        light_gray = '#C0C0C0'   # Silver

        # Isometric projection
        iso_x_factor = 0.866
        iso_y_factor = 0.5

        def iso_project(x, y, z):
            screen_x = center_x + (x - y) * iso_x_factor * scale
            screen_y = center_y - z * iso_y_factor * scale + (x + y) * iso_y_factor * scale * 0.3
            return int(screen_x), int(screen_y)

        # Main fuselage (cylinder Z=0 to Z=100, radius=20) - make it LARGE
        front_center = iso_project(0, 0, 0)
        back_center = iso_project(0, 0, fuselage_length)
        left_side = iso_project(-fuselage_radius, 0, fuselage_length/2)
        right_side = iso_project(fuselage_radius, 0, fuselage_length/2)

        # Main fuselage body
        fuselage_points = [front_center, left_side, back_center, right_side]
        draw.polygon(fuselage_points, fill=main_gray, outline=dark_gray, width=1)

        # Cockpit dome
        cockpit_pos = iso_project(0, 0, -cockpit_radius + 5.0)
        cockpit_r = int(cockpit_radius * scale)
        draw.ellipse([cockpit_pos[0] - cockpit_r, cockpit_pos[1] - cockpit_r//2,
                     cockpit_pos[0] + cockpit_r, cockpit_pos[1] + cockpit_r//2],
                    fill=light_gray, outline=dark_gray, width=1)

        # Larger wings (4 diagonal wings)
        wing_z = fuselage_length / 2 - wing_thickness / 2
        wing_positions = [
            (wing_length/2, wing_width/2, wing_z),
            (-wing_length/2, wing_width/2, wing_z),
            (wing_length/2, -wing_width/2, wing_z),
            (-wing_length/2, -wing_width/2, wing_z)
        ]

        for wx, wy, wz in wing_positions:
            wing_center = iso_project(wx, wy, wz)
            wing_tip = iso_project(wx*1.3, wy*1.3, wz)
            wing_points = [wing_center, wing_tip,
                          (wing_center[0] + int(5*scale), wing_center[1] + int(3*scale))]
            draw.polygon(wing_points, fill=main_gray, outline=dark_gray, width=1)

        # Engines
        for side in [-1, 1]:
            engine_pos = iso_project(side * offset_x, 0, engine_z)
            engine_r = int(engine_radius * scale)
            draw.ellipse([engine_pos[0] - engine_r, engine_pos[1] - engine_r//2,
                         engine_pos[0] + engine_r, engine_pos[1] + engine_r//2],
                        fill='#808080', outline='#606060', width=1)

        img.save(screenshot_path, 'PNG', quality=90)

    except Exception as fallback_e:
            # Final fallback
            from PIL import Image, ImageDraw
            img = Image.new('RGB', (444, 121), color=(240, 240, 240))
            draw = ImageDraw.Draw(img)
            draw.text((180, 55), "SPACESHIP", fill=(100, 100, 100))
            img.save(screenshot_path, 'PNG')

    # Final output response
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


