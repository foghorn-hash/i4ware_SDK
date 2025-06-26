<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Auth;

class Message implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // public $username;
    public $message;

    public function __construct($message)
    {
        $this->message = $message;
    }

    public function broadcastOn()
    {
        $user = Auth::user();
        return new Channel($user->domain . '_chat');
    }

    public function broadcastAs()
    {
        return 'message';
    }

    public function broadcastWith()
    {
        if (is_string($this->message)) {
            return ['message' => $this->message];
        }

        return [
            'id' => $this->message->id,
            'username' => $this->message->username,
            'message' => $this->message->message,
            'formatted_created_at' => optional($this->message->created_at)->format('Y-m-d H:i:s'),
            'profile_picture_path' => optional($this->message->users)->profile_picture_path,
            'gender' => optional($this->message->users)->gender,
            'image_path' => $this->message->image_path,
            'type' => $this->message->type,
        ];
    }
}
