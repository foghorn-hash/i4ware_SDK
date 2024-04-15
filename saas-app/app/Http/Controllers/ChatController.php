<?php

namespace App\Http\Controllers;

use App\Events\Message;
use App\Events\userTyping;
use App\Models\Message as MessageModel;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * Handle the incoming chat messages.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function message(Request $request)
    {

        event(new Message($request->input('username'), $request->input('message')));


        return response()->json(['status' => 'Message sent successfully!'], 200);
    }

    /**
     * Retrieve the latest chat messages.
     *
     * @return \Illuminate\Http\Response
     */
    public function getMessages()
    {

        $messages = MessageModel::orderBy('created_at', 'desc')
                                ->limit(50)
                                ->get();

        return response()->json($messages);
    }

    public function userTyping(Request $request)
    {
        $username = $request->username;
        $isTyping = $request->isTyping;
    
        broadcast(new UserTyping($username, $isTyping))->toOthers();
    
        return response()->json(['status' => 'success']);
    }      

}
