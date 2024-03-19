<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;
use FFMpeg\Format\Video\X264;
use FFMpeg\Coordinate\Dimension;
use Auth;
use DB;
use App\Models\Assets;
use App\Models\User;
use App\Models\Permission;
use Storage;


class CompressVideo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    protected $pathToStoreInDb;
    protected $filename;
    protected $mediaId;

    public function __construct($path, $filename,$mediaId)
    {
        $this->pathToStoreInDb = $path;
        $this->filename = $filename;
       $this->mediaId = $mediaId;
    }


    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $video = FFMpeg::fromDisk('public')->open($this->pathToStoreInDb);
        
        $video->export()
            ->inFormat(new X264('aac'))
            ->save('photos_videos/compressed'.$this->filename);

        $compressedFilename = 'compressed_'.$this->filename;
        $compressedPath = 'photos_videos/'.$compressedFilename;
         // Update the record in the database
         $media = Assets::find($this->mediaId);
         if ($media) {
             $media->filename = $compressedFilename;
             $media->asset_path = $compressedPath;
             $media->save();

        // Remove the original file
        Storage::disk('public')->delete($this->pathToStoreInDb);
         } else {
             // Handle case where the media record is not found
             // You may log an error or perform other actions as needed
         }
    
    }
}
