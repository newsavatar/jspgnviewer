#!/bin/bash
# Author Toomas R�mer toomasr@gmail.com

# Intended to be used from the project root directory
# or ./res directory

OLD_DIR=`pwd`

PROJ_DIR="."
DEST_DIR="bin"
SRC_DIR="src"
WP_DIR="wpPlugin"
WP_IMG_DIR="bin/pgnviewer/pgnviewer/img"
TEST_DIR="tests"
IMG_DIR="img"

if [ ! -d $SRC_DIR ];then
	 DEST_DIR="../bin"
	 SRC_DIR="../src"
	 TEST_DIR="../tests"
	 IMG_DIR="../img"
	 WP_DIR="../wpPlugin"
	 PROJ_DIR="../"
	 WP_IMG_DIR="../"$WP_IMG_DIR
fi

WP_DEST_DIR=$DEST_DIR/"pgnviewer"
JS_DEST_DIR=$DEST_DIR/"jspgnviewer"

if  [ ! -d $DEST_DIR ];then
	 mkdir $DEST_DIR
fi

if [ ! -d $JS_DEST_DIR ];then
	 mkdir $JS_DEST_DIR
fi

if [ ! -d $WP_DEST_DIR ];then
	 mkdir $WP_DEST_DIR
fi

if [ ! -d $WP_IMG_DIR ];then
	 mkdir -p $WP_IMG_DIR
fi

cat $SRC_DIR/converter.js > $JS_DEST_DIR/jsPgnViewer.js
cat $SRC_DIR/pgn.js >> $JS_DEST_DIR/jsPgnViewer.js
cat $SRC_DIR/board.js >> $JS_DEST_DIR/jsPgnViewer.js

cp $TEST_DIR/testPage.html $JS_DEST_DIR/
cp $SRC_DIR/README.txt $JS_DEST_DIR/

cp $WP_DIR/pgnviewer.php $WP_DEST_DIR/pgnviewer.php

# functions
# functions EOF

if [ $# -eq 1 ];then
	if [ $1 == 'wp' ]; then
		echo "Updating tom.jabber.ee wordpress plugin"
		scp $WP_DEST_DIR/pgnviewer.php toomas@jabber.ee:/home/toomas/public_html/chessblog/wp-content/plugins/pgnviewer/pgnviewer.php
		scp $JS_DEST_DIR/jsPgnViewer.js toomas@jabber.ee:/home/toomas/public_html/chessblog/wp-content/plugins/pgnviewer/jsPgnViewer.js
	elif [ $1 == 'test' ];then
		echo "Updating tom.jabber.ee test page"
		scp $JS_DEST_DIR/jsPgnViewer.js toomas@jabber.ee:/home/toomas/public_html/jspgnviewer/jsPgnViewer.js
		scp $JS_DEST_DIR/testPage.html toomas@jabber.ee:/home/toomas/public_html/jspgnviewer/index.html
	elif [ $1 == 'wpr' ];then
		echo "Making and uploading wordpress plugin release"
		cp $WP_DIR/* $WP_DEST_DIR
		cp -r $IMG_DIR/* $WP_IMG_DIR
		cp $JS_DEST_DIR/jsPgnViewer.js $WP_DEST_DIR
		
		cd $DEST_DIR
		NAME="pgnviewer-"`cat ../wpVersion`".tar.gz"
		tar --exclude=.svn -cvzf $NAME pgnviewer
		scp $NAME toomas@jabber.ee:/home/toomas/public_html/jspgnviewer/downloads/$NAME
		cd $OLD_DIR
	elif [ $1 == 'jsr' ];then
		echo "Making and uploading jspgnviewer release"
		cp -r $IMG_DIR $JS_DEST_DIR
		cd $DEST_DIR
		NAME="jspgnviewer-"`cat ../jsVersion`".tar.gz"
		tar --exclude=.svn -cvzf $NAME jspgnviewer
		scp $NAME toomas@jabber.ee:/home/toomas/public_html/jspgnviewer/downloads/$NAME
		cd $OLD_DIR
	elif [ $1 == 'snap' ];then
		echo "Making and uploading a snapshot of the project"
		tar --exclude=.svn -cvzf $DEST_DIR/pgnviewer-snapshot.tar.gz ../jspgnviewer
		scp $DEST_DIR/pgnviewer-snapshot.tar.gz toomas@jabber.ee:/home/toomas/public_html/jspgnviewer/downloads/pgnviewer-snapshot.tar.gz
	elif [ $1 == 'clean' ];then
		echo "clean "$DEST_DIR
		rm -rf $DEST_DIR
	fi
fi

