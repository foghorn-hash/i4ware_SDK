<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\RolePermissions;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Domain;
use App\Models\Permission;
use App\Models\UserVerify;
use Auth;
use Validator;
use Illuminate\Support\Facades\Hash;
use DB;
use Illuminate\Support\Carbon;
use Storage;
use Illuminate\Support\Facades\Log;

class DomainsController extends Controller
{
    protected $user;

    public function __construct()
    {
        //$this->apiToken = uniqid(base64_encode(Str::random(40)));
        $this->middleware('auth:api');
        $this->user = new User;
    } 

    public function domains(Request $request)
    {
        $user = Auth::user();
    
        if ($user->role == "admin") {
            $domains = Domain::all();
        } else {
            $domain = DB::table('users')->select('domain')->where('id', '=', Auth::user()->id)->first();
            $domains = Domain::where('domain', '=', $domain->domain)->get();
        }
    
        Log::info('Domains:', ['domains' => $domains]);
    
        $perPage = 50;

        $page = $request->input('page', 1);

        $offset = ($page - 1) * $perPage;
    
        $domainList = $domains->slice($offset, $perPage);
    
        $data = [];
    
        foreach ($domainList as $domain) {
            $data[] = [
                'id' => $domain->id,
                'domain' => $domain->domain,
                'valid_before_at' => $domain->valid_before_at,
                'type' => $domain->type,
                'company_name' => $domain->company_name,
                'vat_id' => $domain->vat_id,
                'mobile_no' => $domain->mobile_no,
                'technical_contact_email' => $domain->technical_contact_email,
                'billing_contact_email' => $domain->billing_contact_email,
                'country' => $domain->country
            ];
            
        }
    
        return response()->json($data, 200);
    }
    
    public function updateDomain(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'domain' => 'required|unique:domains,domain,' . $request->id,
            'technical_contact_email' => 'required|email',
            'billing_contact_email' => 'required|email',
            'mobile_no' => 'required',
            'company_name' => 'required',
            'address_line_1' => 'required',
            'city' => 'required',
            'country' => 'required',
            'zip' => 'required',
        ]);

        if ($validator->fails()) {
            $error = $validator->errors();
            return response()->json([
                'success' => false,
                'data' => $error
            ], 200);
        }

        if ($request->id) {
            // update
            $domain = DB::table('domains')
                ->where('id', $request->id)
                ->update([
                    "technical_contact_email" => $request->technical_contact_email,
                    "billing_contact_email" => $request->billing_contact_email,
                    "mobile_no" => $request->mobile_no,
                    "company_name" => $request->company_name,
                    "address_line_1" => $request->address_line_1,
                    "address_line_2" => $request->address_line_2,
                    "city" => $request->city,
                    "country" => $request->country,
                    "zip" => $request->zip,
                    "vat_id" => $request->vat_id,
                ]);

        } else {
            // insert
            $domain = DB::table('domains')
                ->insert([
                    "domain" => $request->domain,
                    "technical_contact_email" => $request->technical_contact_email,
                    "billing_contact_email" => $request->billing_contact_email,
                    "mobile_no" => $request->mobile_no,
                    "company_name" => $request->company_name,
                    "address_line_1" => $request->address_line_1,
                    "address_line_2" => $request->address_line_2,
                    "city" => $request->city,
                    "country" => $request->country,
                    'valid_before_at' => date('Y-m-d H:i:s', strtotime("+30 day")),
                    "type" => 'trial',
                    "zip" => $request->zip,
                    "user_id" => $user->id
                ]);
        }

        return response()->json([
            'success' => true,
            'data' => $domain
        ], 200);
    }

    public function removeDomain(Request $request)
    {
        $id = $request->id;
        $user = Auth::user();

        $domain = DB::table('domains')
            ->where(['id' => $request->id])->delete();

        return response()->json([
            'success' => true,
            'data' => []
        ], 200);
    }

    public function updateDomainRecord(Request $request)
    {
        $id = $request->id;
        $action = $request->action;

        $user = Auth::user();

        $domain = Domain::where(['id' => $request->id])->first();

        switch ($action) {
            case 'extend-trial':
                $validate = Carbon::parse($domain->valid_before_at);
                $validate->addDays(30);
                $domain->valid_before_at = $validate;
                break;
            case 'make-paid':
                $domain->type = 'paid';
                break;
            case 'down-to-trial':
                $domain->type = 'trial';
                break;
            case 'extend-one-year':
                $validate = Carbon::parse($domain->valid_before_at);
                $validate->addYear(1);
                $domain->valid_before_at = $validate;
                break;
            case 'terminate':
                $domain->valid_before_at = Carbon::now()->subDays(1);
                break;
            default:
                # code...
                break;
        }
        $domain->save();

        return response()->json([
            'success' => true,
            'data' => $domain
        ], 200);
    }

}
