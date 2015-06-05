# folders
BIN = bin/
TMP = tmp/

# files
PROG = $(BIN)index.html
INDEXIN = index.html
IMAGEJSOUT = $(TMP)images.js
SPRITE = sprites.png
CRAFTYSRC = crafty.js
GAMESRC = game.js
JSOUT = $(TMP)compiled.js
IMGTMP = $(TMP)encoded.txt
IMGOUT = $(TMP)encoded_.txt

all : folders $(PROG)

folders :
	[ -d $(BIN) ] || mkdir $(BIN)
	[ -d $(TMP) ] || mkdir $(TMP)

$(PROG) : $(INDEXIN) $(JSOUT)
	./scripts/replace_script_tags.py $(INDEXIN) $(JSOUT) > $(PROG)

# minify and concatenate js files
$(JSOUT) : $(CRAFTYSRC) $(IMAGEJSOUT) $(GAMESRC)
	./scripts/compile.py $(CRAFTYSRC) > $(JSOUT)
	cat $(IMAGEJSOUT) >> $(JSOUT)
	./scripts/compile.py $(GAMESRC) >> $(JSOUT)

# encode image to base64 and include it in a js file
$(IMAGEJSOUT) : $(SPRITE)
	base64 $(SPRITE) > $(IMGTMP)
	awk '$$1=$$1' ORS='' $(IMGTMP) > $(IMGOUT)
	echo "var img = new Image();" > $(IMAGEJSOUT)
	echo "img.src = \"data:image/png;base64,`cat $(IMGOUT)`\";" >> $(IMAGEJSOUT)
	echo "img.alt = '';" >> $(IMAGEJSOUT)
	echo "Crafty.assets['$(SPRITE)'] = img;" >> $(IMAGEJSOUT)

clean :
	rm -rf $(BIN)*
	rm -rf $(TMP)*
