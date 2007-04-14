/**
 * Copyright 2006 Toomas Römer
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
**/

/*
	Representation of the PGN format. Different meta information
	about the actual game(s) plus the moves and result of the game.
*/

function Pgn(pgn) {
	// FUNCTIONS USED IN THE CONSTRUCTOR
	this.extractMovesN = function() {
		var pgn = this.oPgn
		pgn = pgn.replace(/\n/g, " ")
		while(pgn.indexOf("  ")!=-1)
			pgn = pgn.replace("  ", " ")
		//console.log(pgn)
		//pgn = pgn.replace(/\.\.\./g, ".")
		var comment = false
		var commentStarted = true
		var commentEnded = false

		var props = false

		var moveIndex = 1
		var moves = new Array()

		var variation = false
		var variationStarted = false
		var variationEnded = false
		
		var cMove = new DirtyMove()
		cMove.no = 1
		pgn = pgn.replace(/\.\.\./g, ".");	
		for (var i=0;i<pgn.length;i++) {
			switch (pgn.charAt(i)) {
				case '{':
					comment=true
					commentStarted = true
					break
				case '}':
					comment=false
					commentEnded = true
					break
				case '(':
					if (!comment) {
						variation=true
						variationStarted=true
					}
					break
				case ')':
					if (!comment) {
						variation=false
						variationEnded=true
					}
					break
				case '[':
					props = true
					continue
				case ']':
					props = false
					continue
			}

			if (props)
				continue;

			if (commentStarted) {
				cMove.startNewComment()
				//console.log("Starting a new comment");
				commentStarted = false
				continue
			}
			if (commentEnded) {
				commentEnded = false
				comment = false
				//console.log("Ending a comment");
				continue
			}
			if (comment) {
				cMove.addToComment(pgn.charAt(i))
				//console.log("Adding to comment ", pgn.charAt(i))
				continue
			}

			if (variationStarted) {
				cMove.startNewVariation()
				//console.log("Starting a variation")
				variationStarted = false	
				continue
			}
			if (variationEnded) {
				//console.log("Ending a variation")
				variation = false
				variationEnded = false
				continue
			}
			if (variation) {
				//console.log("Adding to variation "+pgn.charAt(i))
				cMove.addToVariation(pgn.charAt(i))
				continue;
			}
			
			//console.log("Looking for "+(moveIndex+1))
			if (!((pgn.substr(i,(""+(moveIndex+1)).length+1) == (moveIndex+1)+"."))) {
				cMove.addToMove(pgn.charAt(i))
				//console.log("NOT Found, we have char '"+pgn.charAt(i)+"'");
			}
			else {
				//console.log("Found, we have char '"+pgn.charAt(i)+"'");
				cMove.normalize()
				moveIndex++
				moves[moves.length] = cMove
				cMove = new DirtyMove()
				cMove.addToMove(pgn.charAt(i))
				cMove.no = moveIndex
			}
		}
		console.log("PGN LENGTH: "+pgn.length+"chars")

		moves[moves.length] = cMove
		console.log(moves.length)
		console.log(moves[0].moveStr.join("").charAt(1)== " ")
		for (i in moves) {
			console.log("'"+moves[i].moveStr.join("")+"'",
							moves[i])
		}
	}
	this.extractMoves = function(gameOverre){
		// the moves
		var re;
		for(var i = 1;;i++) {
			re = i+"\\.(\\n| )?([^.]*)"
			
			var result = this.pgn.match(re)
			if (result == null)
				break
			// newlines to spaces
			result[2] = result[2].replace(/\n/g, " ")
			// leave only one space in the middle
			while(result[2].indexOf("  ")!=-1)
				 result[2] = result[2].replace("  ", " ")
			// possible first space gets removed
			if (" "==result[2].charAt(0))
				result[2] = result[2].substring(1)
			var tmp = result[2].split(" ")
			for (var j = 0;j<gameOverre.length;j++) {
				if (gameOverre[j].test(tmp[1]))
				tmp[1] = null
			}
			if (tmp[1] && 0 == tmp[1].length)	
				 tmp[1] = null
			var move = new Move(tmp[0], tmp[1])
			this.moves[this.moves.length] = move
		}
	}
	// END OF FUNCTIONS USED IN THE CONSTRUCTOR
	// properties of the game eg players, ELOs etc
	this.props = new Object()
	this.validProps = ['Event','Site','Date','Rount',
							 'White','Black']
	// the moves, one move contains the black and white move
	this.moves = new Array()
	// the current move in the game
	this.currentMove = 0;
	// for outputting white and black moves separately
	this.skip = 0

	this.pgn = pgn
	this.oPgn = pgn

	/* constructor */

	// strip comments
	this.pgn = this.pgn.replace(/\{[^}]*\}/g,'')

	// the properties
	var reprop = /\[([^\]]*)\]/gi
	var matches = this.pgn.match(reprop)
	if (matches) {
		 for(var i = 0;i < matches.length; i++) {
			 // lose the brackets
			 tmpMatches = matches[i].substring(1, matches[i].length-1)
			 // split by the first space
			 var key = tmpMatches.substring(0, tmpMatches.indexOf(" "))
			 var value = tmpMatches.substring(tmpMatches.indexOf(" ")+1)
			 if (value.charAt(0) == '"')
				 value = value.substr(1)
			 if (value.charAt(value.length-1) == '"')
				 value = value.substr(0, value.length-1)
			 
			 this.props[key] = value;
			 this.pgn = this.pgn.replace(matches[i], "")
		 }
	}
	
	var gameOverre = new Array(
		/1\/2-1\/2/,
		/0-1/,
		/1-0/
	)

	console.time("extractN")
	this.extractMovesN()
	console.timeEnd("extractN")

	console.time("extract")
	//this.extractMoves(gameOverre)
	console.timeEnd("extract")
	// no moves
	if (this.moves.length>0) {
		 for(var i = 0; i < gameOverre.length; i++) {
			 if (gameOverre[i].test(this.moves[this.moves.length-1][1])) {
				 this.moves[this.moves.length-1][1] = null
			 }
		 }
	}

	if (/1\/2-1\/2/.test(this.pgn)) {
		this.props['result'] = '1/2-1/2'
	}
	else if (/1-0/.test(this.pgn)) {
		this.props['result'] = '1-0'   
	}
	else if (/0-1/.test(this.pgn)) {
		this.props['result'] = '0-1'
	}
	else {
		this.props['result'] = ''   
	}
	


	this.nextMove = function() {
		var rtrn = null
		try{
			if (this.skip) {
				this.skip = 0
				rtrn = new Array(this.moves[this.currentMove].black,
													'black');
				this.currentMove++
			}
			else {
				this.skip = 1
				rtrn = new Array(this.moves[this.currentMove].white,
											'white')
			}
	
			if (rtrn[0] == null || rtrn[0].length == 0)
				rtrn = null
			return rtrn
			}
		catch (e) {
			return null
		}
	}
	
}

function DirtyMove() {
	this.move = ""
	this.moveStr = new Array()
	this.no = 0
	
	this.variations = new Array()
	this.variationIndex = -1
	
	this.comments = new Array()
	this.commentIndex = -1

	this.normalize = function() {
		this.move = this.moveStr.join("")
		this.move = this.move.replace(this.no+"\.","")
		this.move = this.move.replace(this.no+"\.","")
	}

	this.startNewComment = function() {
		this.commentIndex++
		this.comments[this.commentIndex] = new Array()
	}

	this.startNewVariation = function() {
		this.variationIndex++
		this.variations[this.variationIndex] = new Array()
	}

	this.addToComment = function(ch) {
		this.comments[this.commentIndex][this.comments[this.commentIndex].length] = ch
	}

	this.addToVariation = function(ch) {
		this.variations[this.variationIndex][this.variations[this.variationIndex].length] = ch
	}

	this.addToMove = function(ch) {
		this.moveStr[this.moveStr.length] = ch
	}

	this.toString = function() {
		return "no="+this.no+";move="+this.move+";moveStr="+this.moveStr.join("")+"; "+this.variations.length+"; "+this.comments.length+"\n"
	}
}

function Move(white, black) {
	this.white = white
	this.black = black

	this.toString = function() {
		return this.white+" "+this.black
	}
}

