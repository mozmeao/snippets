(function() {
    'use strict';

    function VideoShareOverlay(video, shareURL, options) {
        this.video = video;
        this.shareURL = shareURL;
        this.ended = false;

        // Store strings (for l10n handyness).
        this.strings = {
            share: 'Share',
            resume: 'Resume',
            replay: 'Replay',
            tweet: 'Tweet',
            twitterShare: ''
        };
        if (options.strings) {
            this.strings = this.util.extend(this.strings, options.strings);
        }

        // Build HTML for the overlay.
        // TODO: Do this smarter.
        var container = document.createElement('div');
        var content = [];

        content.push('<div class="video-overlay">');
        content.push('<i class="close"></i>');
        content.push('<button class="share">' + this.strings.share + '</button>');
        content.push('<div class="shareScreen">');
        content.push('<div class="shareBox">');
        if (options.externalLink) {
            content.push('<a href="' + options.externalLink.href + '" class="external">');
            content.push(options.externalLink.label);
            content.push('</a>');
        }
        content.push('<div class="social">');
        content.push('<a href="' + this.util.buildFacebookURL(shareURL) + '" target="_blank" class="facebook">' + this.strings.share + '</a>');
        content.push('<a href="' + this.util.buildTwitterURL(shareURL, this.strings.twitterShare) + '" target="_blank" class="twitter">' + this.strings.tweet + '</a>');
        content.push('</div>');
        content.push('<input type="text" class="link" value="' + shareURL + '"></input>');
        content.push('<button class="resume">' + this.strings.resume + '</button>');
        content.push('</div>');
        content.push('</div>');
        content.push('</div>');

        container.innerHTML = content.join('\n');

        // Convenient element references!
        this.videoOverlay = container.querySelector('.video-overlay');
        this.closeButton = container.querySelector('.close');
        this.shareButton = container.querySelector('.share');
        this.shareScreen = container.querySelector('.shareScreen');
        this.resumeButton = container.querySelector('.resume');
        this.facebookShare = container.querySelector('.facebook');
        this.twitterShare = container.querySelector('.twitter');

        if (options.hidden) {
            this.setPlayerState('hidden');
        }

        // Replace the video with the overlay and insert it into the overlay.
        video.parentNode.insertBefore(container, video);
        video.parentNode.removeChild(video);
        this.videoOverlay.appendChild(video);

        // Bind event handlers
        this.handleEvent(video, 'play', 'onPlay');
        this.handleEvent(video, 'ended', 'onEnded');
        this.handleEvent(this.closeButton, 'click', 'onClickClose');
        this.handleEvent(this.shareButton, 'click', 'onClickShare');
        this.handleEvent(this.resumeButton, 'click', 'onClickResume');
        this.handleEvent(this.facebookShare, 'click', 'onClickSocial');
        this.handleEvent(this.twitterShare, 'click', 'onClickSocial');
    }

    VideoShareOverlay.prototype = {
        // Set a method on this object as the event handler.
        handleEvent: function(obj, eventName, handlerName) {
            var self = this;
            obj.addEventListener(eventName, function(e) {
                self[handlerName](e);
            });
        },

        setPlayerState: function(state) {
            this.util.removeClass(this.videoOverlay, 'visible', 'hidden');
            this.util.addClass(this.videoOverlay, state);
        },

        setShareState: function(state) {
            this.util.removeClass(this.videoOverlay, 'share-visible',
                                  'share-hidden');
            this.util.addClass(this.videoOverlay, 'share-' + state);
        },

        hide: function() {
            this.setPlayerState('hidden');
            this.video.pause();
        },

        show: function() {
            this.setPlayerState('visible');
        },

        hideShare: function() {
            this.setShareState('hidden');
        },

        showShare: function() {
            this.setShareState('visible');
            this.video.pause();
        },

        onPlay: function(e) {
            e.preventDefault();
            this.util.addClass(this.videoOverlay, 'started');
        },

        onEnded: function(e) {
            e.preventDefault();
            this.util.addClass(this.resumeButton, 'replay');
            this.resumeButton.innerHTML = this.strings.replay;
            this.ended = true;
            this.showShare();
        },

        onClickClose: function(e) {
            e.preventDefault();
            this.hide();
        },

        onClickShare: function(e) {
            e.preventDefault();
            this.video.pause();


            this.util.removeClass(this.resumeButton, 'replay');
            this.resumeButton.innerHTML = this.strings.resume;
            this.showShare();
        },

        onClickResume: function(e) {
            e.preventDefault();
            if (this.ended) {
                this.ended = false;
                this.video.currentTime = 0;
            }

            this.hideShare();
            this.video.play();
        },

        onClickSocial: function(e) {
            e.preventDefault();
            var link = e.target;
            window.open(link.href, 'share-' + link.className, 'toolbar=0,' +
                        'status=0,width=600,height=400').focus();
        },

        util: {
            buildTwitterURL: function(shareURL, message) {
                return ('https://twitter.com/share?url=' +
                        encodeURIComponent(shareURL) + '&amp;text=' +
                        encodeURIComponent(message));
            },

            buildFacebookURL: function(shareURL) {
                return ('https://facebook.com/sharer.php?u=' +
                        encodeURIComponent(shareURL));
            },

            extend: function(obj) {
                var sources = Array.prototype.slice.call(arguments, 1);
                for (var k = 0; k < sources.length; k++) {
                    var source = sources[k];
                    for (var prop in source) {
                        if (source.hasOwnProperty(prop)) {
                            obj[prop] = source[prop];
                        }
                    }
                }
                return obj;
            },

            addClass: function(el, klass) {
                var className = ' ' + el.className + ' ';
                if (className.indexOf(' ' + klass + ' ') === -1) {
                    el.className += ' ' + klass;
                }
            },

            removeClass: function(el) {
                var oldClasses = el.className.split(/\s+/);
                var newClasses = [];
                var removeClasses = Array.prototype.slice.call(arguments, 1);
                for (var k = 0; k < oldClasses.length; k++) {
                    if (removeClasses.indexOf(oldClasses[k]) === -1) {
                        newClasses.push(oldClasses[k]);
                    }
                }
                el.className = newClasses.join(' ');
            }
        }
    };

    var snippet = document.querySelector('#flicks-2012-snippet');
    var video = snippet.querySelector('video');
    var showVideoLink = snippet.querySelector('.show-video');

    var shareOverlay = new VideoShareOverlay(video, 'http://mzl.la/InvJlr', {
        hidden: true,
        externalLink: {
            href: 'https://firefoxflicks.mozilla.org',
            label: 'Visit firefoxflicks.org'
        },
        strings: {
            shareLabel: 'Share',
            shareScreenPrompt: 'Share',
            resume: 'Resume',
            replay: 'Replay',
            twitterShare: 'Fall in love with Firefox. Let this winning video from #Firefox Flicks show you how. Via @Firefox'
        }
    });

    // Trigger animation when show video link is clicked.
    showVideoLink.addEventListener('click', function(e) {
        e.preventDefault();
        shareOverlay.show();
    }, false);
})();
