from OCC.Core.BRepPrimAPI import (
    BRepPrimAPI_MakeCylinder, BRepPrimAPI_MakeSphere,
    BRepPrimAPI_MakeCone, BRepPrimAPI_MakeBox
)
from OCC.Core.BRepAlgoAPI import BRepAlgoAPI_Common, BRepAlgoAPI_Fuse
from OCC.Core.BRepBuilderAPI import BRepBuilderAPI_Transform
from OCC.Core.gp import gp_Pnt, gp_Dir, gp_Ax1, gp_Ax2, gp_Trsf, gp_Vec
from OCC.Display.SimpleGui import init_display
from OCC.Extend.DataExchange import write_stl_file
import sys
import math
import traceback
import json

try:
    # === Imports ===
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
    from OCC.Core.Graphic3d import Graphic3d_RenderingParams
    from OCC.Core.Quantity import Quantity_NOC_WHITE

    # === Display Init (headless) ===
    from OCC.Display.SimpleGui import init_display
    display, start_display, add_menu, add_function_to_menu = init_display()

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
    import os

    # Get absolute Laravel project root, no matter where script is run from
    laravel_root = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))

    # Build absolute paths
    stl_path = os.path.join(laravel_root, 'storage', 'app', 'public', 'stl-files', f'{filename}.stl')
    # Good Laravel location: storage/app/public/stl-screenshots/
    screenshot_path = os.path.join(laravel_root, 'storage', 'app', 'public', 'stl-screenshots', f'screenshot_{filename}.png')


    # Make sure directories exist
    os.makedirs(os.path.dirname(stl_path), exist_ok=True)
    os.makedirs(os.path.dirname(screenshot_path), exist_ok=True)

    # Export files using absolute paths
    write_stl_file(fused, stl_path)

    # === Screenshot ===
    from OCC.Display.OCCViewer import OffscreenRenderer
    from OCC.Core.Quantity import Quantity_Color, Quantity_TOC_RGB

    # Create renderer
    renderer = OffscreenRenderer()
    renderer.Create()

    # Optional: white background using gradient
    white = Quantity_Color(1.0, 1.0, 1.0, Quantity_TOC_RGB)
    renderer.View.SetBgGradientColors(white, white, 2)

    width, height = 444, 121  # ← Set to match your viewer (you can adjust)
    renderer.SetSize(width, height)

    # Display the shape and save image
    renderer.DisplayShape(fused)
    renderer.FitAll()
    renderer.ExportToImage(screenshot_path)

    # Final output response — this is the ONLY thing printed
    import json
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


