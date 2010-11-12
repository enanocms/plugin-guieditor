#!/bin/bash
# separator is special (only 8px wide) so ensure it goes last
images=(`ls *.png | grep -v sprite | grep -v separator` separator.png)

echo "Creating sprite.png. Update spritelist in ../editor.js with:"
echo -ne "\t["
for img in ${images[@]}; do
	echo -n "'${img%.png}'"
	if [ $img != "separator.png" ]; then
		echo -n ", "
	fi
done
echo "]"

montage=`which montage`
if [ -z "$montage" ]; then
	echo "Could not find montage, please install imagemagick"
	exit 1
fi

montage -background transparent -tile ${#images[@]}x1 -geometry +0+0 ${images[@]} sprite.png

