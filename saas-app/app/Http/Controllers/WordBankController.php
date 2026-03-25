<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\WordBank;

class WordBankController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index()
    {
        $documents = WordBank::where('domain', Auth::user()->domain)
            ->select('id', 'document_name', 'created_at', 'user_id')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($documents);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file'          => 'required|file|mimes:docx,doc|max:51200',
            'document_name' => 'required|string|max:255',
        ]);

        $domain = Auth::user()->domain;
        $path   = "word/{$domain}/" . Str::uuid() . ".docx";

        Storage::disk('local')->put($path, file_get_contents($request->file('file')));

        $doc = WordBank::create([
            'document_name'      => $request->document_name,
            'document_file_path' => $path,
            'domain'             => $domain,
            'user_id'            => Auth::id(),
        ]);

        return response()->json(['message' => 'Word-dokumentti ladattu', 'document' => $doc], 201);
    }

    public function view(Request $request, $id)
    {
        $doc = $this->getDocumentForDomain($id);

        if (!Storage::disk('local')->exists($doc->document_file_path)) {
            return response()->json(['error' => 'Tiedostoa ei löydy'], 404);
        }

        $fileContent = Storage::disk('local')->get($doc->document_file_path);

        return response($fileContent, 200)
            ->header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            ->header('Content-Disposition', 'inline; filename="' . $doc->document_name . '.docx"')
            ->header('Cache-Control', 'private, no-store');
    }

    public function download(Request $request, $id)
    {
        $doc = $this->getDocumentForDomain($id);

        if (!Storage::disk('local')->exists($doc->document_file_path)) {
            return response()->json(['error' => 'Tiedostoa ei löydy'], 404);
        }

        return Storage::disk('local')->download($doc->document_file_path, $doc->document_name . '.docx');
    }

    public function destroy($id)
    {
        $this->getDocumentForDomain($id)->delete();
        return response()->json(['message' => 'Dokumentti poistettu']);
    }

    private function getDocumentForDomain($id): WordBank
    {
        $doc = WordBank::findOrFail($id);
        if ($doc->domain !== Auth::user()->domain) {
            abort(403, 'Ei oikeutta tähän dokumenttiin');
        }
        return $doc;
    }
}