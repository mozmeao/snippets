(function() {
    'use strict';

    var snippet = document.querySelector('#flicks-2012-snippet');
    var video = snippet.querySelector('video');
    var showVideoLink = snippet.querySelector('.show-video');

    var shareControls = new ShareVideoControls(video, {
        overlayClass: 'hidden'
    });

    // Bind click event only after snippet has loaded.
    snippet.addEventListener('show_snippet', function() {
        // Trigger animation when show video link is clicked.
        showVideoLink.addEventListener('click', function(e) {
            var newClass = (shareControls.videoOverlay.className
                            .replace('hidden', ''));
            shareControls.videoOverlay.className = newClass;
            e.stopPropagation();
        }, false);
    }, false);

    function ShareVideoControls(video, options) {
        this.video = video;

        // Building HTML via strings; ugly, but good enough!
        var controls = [];
        controls.push('<div class="controls">');
        controls.push('<button class="play"></button>');
        controls.push('<div class="seek-bar"><i class="seek-thumb"></i></div>');
        controls.push('<button class="volume"></button>');
        controls.push('<button class="share"></button>');
        controls.push('<button class="fullscreen"></button>');
        controls.push('</div>');

        var videoOverlayContents = [];
        videoOverlayContents.push('<i class="close"></i>');
        videoOverlayContents.push(controls.join(''));

        this.videoOverlay = document.createElement('div');
        this.videoOverlay.className = 'video-overlay';
        this.videoOverlay.innerHTML = videoOverlayContents.join('');

        if (options.overlayClass) {
            this.videoOverlay.className += ' ' + options.overlayClass;
        }

        // Replace the video with the overlay and insert it into the overlay.
        video.parentNode.insertBefore(this.videoOverlay, video);
        video.parentNode.removeChild(video);
        this.videoOverlay.appendChild(video);
    }

    ShareVideoControls.prototype = {

    };
})();
