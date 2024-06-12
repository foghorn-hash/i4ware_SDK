@extends('layouts.app')

@section('content')
    <div class="container">
        @highlight('php') {{-- Assuming the response contains PHP code --}}
        {!! $response !!}
        @endhighlight
    </div>
@endsection