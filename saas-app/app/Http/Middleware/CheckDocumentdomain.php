<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\DocumentBank;

class CheckDocumentDomain
{
    public function handle(Request $request, Closure $next)
    {
        $id = $request->route('id');

        if ($id) {
            $doc = DocumentBank::find($id);

            if (!$doc) {
                return response()->json(['error' => 'Dokumenttia ei löydy'], 404);
            }

            $requestDomain = $request->getHost();

            if ($doc->domain !== $requestDomain) {
                return response()->json(['error' => 'Ei oikeutta tähän dokumenttiin'], 403);
            }
        }

        return $next($request);
    }
}