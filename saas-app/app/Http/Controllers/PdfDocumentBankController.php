<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\DocumentBank;
use Laravel\Passport\Token;

class PdfDocumentBankController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index(Request $request)
    {
        $domain = Auth::user()->domain;

        $documents = DocumentBank::where('domain', $domain)
            ->select('id', 'document_name', 'created_at', 'user_id')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($documents);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf|max:51200',
            'document_name' => 'required|string|max:255',
        ]);

        $domain = Auth::user()->domain;
        $uuid = Str::uuid();
        $path = "pdfs/{$domain}/{$uuid}.pdf";

        Storage::disk('local')->put($path, file_get_contents($request->file('file')));

        $doc = DocumentBank::create([
            'document_name' => $request->document_name,
            'document_file_path' => $path,
            'domain' => $domain,
            'user_id' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'Dokumentti ladattu onnistuneesti',
            'document' => $doc,
        ], 201);
    }

    public function view(Request $request, $id)
    {
        $doc = $this->getDocumentForDomain($id);

        if (!Storage::disk('local')->exists($doc->document_file_path)) {
            return response()->json(['error' => 'Tiedostoa ei löydy'], 404);
        }

        $fileContent = Storage::disk('local')->get($doc->document_file_path);

        return response($fileContent, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="' . $doc->document_name . '.pdf"')
            ->header('Cache-Control', 'private, no-store');
    }

    public function download(Request $request, $id)
    {
        $doc = $this->getDocumentForDomain($id);

        if (!Storage::disk('local')->exists($doc->document_file_path)) {
            return response()->json(['error' => 'Tiedostoa ei löydy'], 404);
        }

        return Storage::disk('local')->download(
            $doc->document_file_path,
            $doc->document_name . '.pdf'
        );
    }

    public function destroy(Request $request, $id)
    {
        $doc = $this->getDocumentForDomain($id);
        $doc->delete();

        return response()->json(['message' => 'Dokumentti poistettu']);
    }

    // Tarkistaa että dokumentti kuuluu kirjautuneen käyttäjän domainille
    private function getDocumentForDomain($id): DocumentBank
    {
        $doc = DocumentBank::findOrFail($id);

        if ($doc->domain !== Auth::user()->domain) {
            abort(403, 'Ei oikeutta tähän dokumenttiin');
        }

        return $doc;
    }
}