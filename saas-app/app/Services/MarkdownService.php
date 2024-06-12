<?php

namespace App\Services;

use Parsedown;

class MarkdownService
{
    protected $parsedown;

    public function __construct(Parsedown $parsedown)
    {
        $this->parsedown = $parsedown;
    }

    public function parse($content)
    {
        return $this->parsedown->text($content);
    }
}
