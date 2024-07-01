<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Auth;

class UserSpeech implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $username;
    public $isSpeech;

    public function __construct($username, $isSpeech)
    {
        $this->username = $username;
        $this->isSpeech= $isSpeech;
    }

    public function broadcastOn()
    {
        $user = Auth::user();
        return new Channel($user->domain . '_chat');
    }

    public function broadcastAs()
    {
        return 'user-speech';
    }
}

