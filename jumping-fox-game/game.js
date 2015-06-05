(function() {

    // -----------------------------------------------------------------
    // Configuration
    // -----------------------------------------------------------------

    var FOX = {
        'width' : 572,
        'height' : 120,
        'player' : null,
        'life' : 1,
        'score' : 0,
        'newHighScore' : false,
        'sprites' : {
            'src' : 'sprites.png',
            'size' : 1
        },
        'entities' : {
            'star' : {
                'attr' : {
                    'y' : 20,
                    'speed' : 5
                },
                'spawn' : {
                    'min' : 600,
                    'max' : 2000,
                    'next' : null
                },
                'sprite' : {
                    'size' : 16,
                    'coords' : [0, 224, 16, 16]
                }
            },
            'enemy' : {
                'attr' : {
                    'y' : 84,
                    'speed' : 5
                },
                'spawn' : {
                    'min' : 400,
                    'max' : 2000,
                    'next' : null
                },
                'sprite' : {
                    'size' : 16,
                    'coords' : [32, 224, 16, 16]
                }
            },
            'superEnemy' : {
                'attr' : {
                    'y' : 84,
                    'speed' : 8
                },
                'spawn' : {
                    'min' : 3000,
                    'max' : 10000,
                    'next' : null
                },
                'sprite' : {
                    'size' : 16,
                    'coords' : [48, 224, 16, 16]
                }
            },
            'player' : {
                'sprite' : {
                    'size' : 64,
                    'coords' : [0, 160, 64, 64]
                }
            },
            'floor' : {
                'sprite' : {
                    'size' : 20,
                    'coords' : [0,128]
                }
            },
            'sky' : {
                'sprite' : {
                    'coords' : [0, 0, 600, 120]
                }
            }
        }
    };

    // -----------------------------------------------------------------
    // Components
    // -----------------------------------------------------------------

    /**
     * Twoway component but the caracter goes faster left than right.
     * This is used to simulate the moving ground.
     */
    Crafty.c("TwowayRunning", {
        _speed: 3,
        _up: false,

        init: function() {
            this.requires("Keyboard");
        },

        twoway: function(speed,jump) {
            if(speed) this._speed = speed;
            jump = jump || this._speed * 2;

            this.bind("EnterFrame", function() {
                if (this.disableControls) return;
                if(this.isDown("RIGHT_ARROW") || this.isDown("D")) {
                    this.x += this._speed;
                }
                if(this.isDown("LEFT_ARROW") || this.isDown("A")) {
                    this.x -= this._speed * 2;
                }
                if(this._up) {
                    this.y -= jump;
                    this._falling = true;
                }
            }).bind("KeyDown", function() {
                if(this.isDown("UP_ARROW") || this.isDown("W")) this._up = true;
            });

            return this;
        }
    });

    /**
     * Inside component to make sure an entity cannot go outside the stage.
     */
    Crafty.c("Inside", {
        init: function() {
            this.bind("EnterFrame", function() {
                if (this.x < 0) {
                    this.x = 0;
                }
                if (this.x > Crafty.viewport.width - this.w) {
                    this.x = Crafty.viewport.width - this.w
                }

                return this;
            });
        }
    });

    /**
     * Moving component for entities moving from right to left.
     */
    Crafty.c("Moving", {
        init: function() {
            this.requires("2D, Canvas");

            this.attr({
                x : Crafty.viewport.width,
                speed : 5
            });

            this.bind("EnterFrame", function() {
                this._moveLeft();
            });
        },

        moving: function(speed) {
            this.speed = speed;
        },

        _moveLeft: function() {
            this.x -= this.speed;

            if (this._isOutside()) {
                this.destroy();
            }
        },

        _isOutside: function() {
            return (this.x <= - this.width);
        }
    });

    Crafty.c("Enemy", {
        init: function() {
            this.requires("Collision");

            this.collision()
                .onHit("fox", function() {
                    FOX.player.hurt(1);
                    FOX.player.losing(2);
                    this.destroy();
                })
                ;
        }
    });

    Crafty.c("Star", {
        init: function() {
            this.requires("Collision");

            this.collision()
                .onHit("fox", function() {
                    FOX.player.winning(10);
                    this.destroy();
                })
                ;
        }
    });

    Crafty.c("Health", {
        init: function() {
            this.health = FOX.life;
        },

        hurt: function(aouch) {
            this.health -= aouch;
            if (this.health <= 0) {
                gameOver();
            }
        }
    });

    Crafty.c("Score", {
        init: function() {
            this.score = FOX.score;
        },

        winning: function(points) {
            this.score += points;
        },

        losing: function(points) {
            this.score -= points;
            if (this.score <= 0) {
                this.score = 0;
            }
        }
    });

    // -----------------------------------------------------------------
    // Loading sprites
    // -----------------------------------------------------------------

    // Init the game
    Crafty.init(FOX.width, FOX.height);
    Crafty.canvas.init();

    function createSprites() {
        // Splice the fox sprite
        Crafty.sprite(FOX.sprites.size, FOX.sprites.src, {
            'sky' : FOX.entities.sky.sprite.coords,
            'floor' : FOX.entities.floor.sprite.coords,
            'fox' : FOX.entities.player.sprite.coords,
            'enemy' : FOX.entities.enemy.sprite.coords,
            'superEnemy' : FOX.entities.superEnemy.sprite.coords,
            'star' : FOX.entities.star.sprite.coords
        });

        // Start the main scene when loaded
        Crafty.scene("start");
        //~ Crafty.scene("main");
    }

    // -----------------------------------------------------------------
    // Functions
    // -----------------------------------------------------------------

    function gameOver() {
        // Stop spawning
        clearInterval(FOX.entities.star.spawn.next);
        clearInterval(FOX.entities.enemy.spawn.next);
        clearInterval(FOX.entities.superEnemy.spawn.next);

        // Save score if highest
        FOX.newHighScore = false;
        if (window.localStorage) {
            if (FOX.player.score > window.localStorage.getItem("highscore")) {
                window.localStorage.setItem("highscore", FOX.player.score);
                FOX.newHighScore = true;
            }
        }

        // Go to game over scene
        Crafty.scene("gameover");
    }

    // -----------------------------------------------------------------
    // Scenes
    // -----------------------------------------------------------------

    Crafty.scene("start", function() {
        Crafty.e("2D, Canvas, sky")
            .attr({x: 0, y: 0});

        Crafty.e("2D, DOM, Text").text('<a href="#" id="play" onclick="Crafty.scene(\'main\'); return false;">Play</a>');
    });

    Crafty.scene("gameover", function() {
        var highScoreText = "";
        if (FOX.newHighScore) {
            highScoreText = "NEW High Score";
        }
        else {
            highScoreText = "High Score";
        }
        Crafty.e("2D, Canvas, sky")
            .attr({x: 0, y: 0});

        Crafty.e("2D, DOM, Text").text('<p><a href="#" id="play-again" onclick="Crafty.scene(\'main\'); return false;">Play again!</a></p>');
        Crafty.e("2D, DOM, Text").text('<p id="highscore">'+ highScoreText +': <span class="score">'+ window.localStorage.getItem("highscore") +'</span></p>');
        Crafty.e("2D, DOM, Text")
            .css("color", "red")
            .text('<p id="life">Life: ' + FOX.player.health + '</p>')
            ;
        Crafty.e("2D, DOM, Text")
            .text('<p id="score">' + FOX.player.score + '</p>')
            ;
    });

    Crafty.scene("main", function() {
        Crafty.e("2D, Canvas, sky")
            .attr({x: 0, y: 0});

        FOX.player = Crafty.e("2D, Canvas, SpriteAnimation, TwowayRunning, Gravity, Inside, Collision, Health, Score, fox")
            .attr({
                x: 0,
                y: Crafty.viewport.height - FOX.entities.floor.sprite.size - FOX.entities.player.sprite.size,
                health : FOX.life
            })
            .animate("walk", [ [0, 160], [64, 160], [128, 160], [192, 160], [256, 160] ])
            .twoway(0, 7)
            .gravity("floor")
        ;

        FOX.player.animate("walk", 10, -1);

        // Life text
        Crafty.e("2D, DOM, Text")
            .css("color", "red")
            .bind("EnterFrame", function() {
                this.text('<p id="life">Life: ' + FOX.player.health + '</p>');
            })
            ;
        // Score text
        Crafty.e("2D, DOM, Text")
            .bind("EnterFrame", function() {
                this.text('<p id="score">' + FOX.player.score + '</p>');
            })
            ;

        // Floor (mainly for gravity)
        Crafty.e("2D, floor")
            .attr({
                x: 0,
                y: Crafty.viewport.height - FOX.entities.floor.sprite.size,
                w: Crafty.viewport.width,
                h: FOX.entities.floor.sprite.size
            })
        ;

        function spawn(type, components) {
            var entity = FOX.entities[type];
            clearInterval(entity.spawn.next);
            entity.spawn.next = setInterval(
                function() {
                    Crafty.e("Moving, " + components).attr(entity.attr);
                    spawn(type, components);
                },
                Math.floor(Math.random() * (entity.spawn.max - entity.spawn.min + 1)) + entity.spawn.min
            );
        }

        // Start generating enemies and stars
        spawn("enemy", "Enemy, enemy");
        spawn("star", "Star, star");
        spawn("superEnemy", "Enemy, superEnemy");
    });

    // Start loading the game
    createSprites();
})();
