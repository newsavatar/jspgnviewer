/**
 * Copyright 2008 Toomas Römer
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
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

	function Board(divId, options) {
		var pgn = null;
        if (isYahoo(document.getElementById(divId).firstChild.nodeValue))
            pgn = new Yahoo(document.getElementById(divId).firstChild.nodeValue);
        else
            pgn = new Pgn(document.getElementById(divId).firstChild.nodeValue);

		this.conv = new Converter(pgn);
		this.conv.convert();
		this.movesOnPane = new Array();

		this.flipped = false;
		this.id = (new Date()).getTime();
		window[this.id] = this;
		if (!options)
			options={};
		this.moveInput = null;
		this.lastBold = null;
		this.lastBoldIdx = null;
		this.lastSquare = null;
		this.visuals = {"pgn":{}};

		this.opts = [];
		this.opts['imagePrefix'] = "img/default/";
		this.opts['buttonPrefix'] = "img/default/buttons/";
		this.opts['imageSuffix'] = 'gif';
		this.opts['moveFontSize'] = "8pt";
		this.opts['moveFontColor'] = "#537c3a";
		this.opts['moveFont'] = 'Tahoma, Arial, sans-serif';

		this.opts['commentFontSize'] = "8pt";
		this.opts['commentFontColor'] = "#6060df";
		this.opts['commentFont'] = 'Tahoma, Arial, sans-serif';
		
		this.opts['boardSize'] = '257px';
		this.opts['squareSize'] = '31px';
			
		this.opts['blackSqColor'] = "#4b4b4b";
		this.opts['whiteSqColor'] = "#ffffff";
		this.opts['squareBorder'] = "1px solid #000000";
		this.opts['flipped'] = false;
		this.opts['showMovesPane'] = true;
		
		this.opts['showComments'] = true;
		this.opts['markLastMove'] = true;
		
		this.opts['altRewind'] = "Rewind to the beginning";
		this.opts['altBack'] = "One move back";
		this.opts['altFlip'] = "Flip the board";
		this.opts['altShowMoves'] = "Show moves pane";
		this.opts['altComments'] = "Show comments";
		this.opts['altPlayMove'] = "Play one move";
		this.opts['altFastForward'] = "Fast-forward to the end";
		this.opts['moveBorder'] = "0px solid #000000";
		this.opts['downloadURL'] = "http://www.chesspastebin.com/asPgn.php?PGN=";
		this.opts['skipToMove'] = null;

		var optionNames = ['flipped', 'moveFontSize', 'moveFontColor',
										'moveFont', 'commentFontSize',
										'commentFontColor', 'commentFont',
										'boardSize', 'squareSize',
										'blackSqColor', 'whiteSqColor',
										'imagePrefix', 'showMovesPane',
										'movesPaneWidth','imageSuffix',
										'comments','squareBorder',
										'markLastMove','altRewind',
										'altBack','altFlip','altShowMoves',
										'altComments','altPlayMove',
										'altFastForward','moveBorder',
										'skipToMove', 'downloadURL',
										'buttonPrefix'];

		// if keys in options define new values then
		// set the this.opts for that key with the 
		// custom value
		for (var i=0;i<optionNames.length;i++) {
			if (options && typeof(options[optionNames[i]]) != 'undefined') {
				this.opts[optionNames[i]] = options[optionNames[i]];
			}
		}

    if (options && typeof(options['buttonPrefix']) == 'undefined')
      this.opts['buttonPrefix'] = this.opts['imagePrefix']+"buttons/";
		
		var brdI = new BoardImages(this.opts);
		var imageNames = brdI.imageNames['default'];
		brdI = null;
		// end of static
		this.pos = new Array();

		for(var i = 0;i<8;i++)
			this.pos[i] = new Array();

		this.init = function() {
			// the main frame
			var boardFrame = document.getElementById(divId+"_board");

			var mainTable = resetStyles(document.createElement("table"));
			mainTable.border = 0;
			var mainTableTb = document.createElement("tbody");
			mainTable.appendChild(mainTableTb);
			mainTable.style.border = "1px solid #000000";
			var tmp = document.createElement("tr");
			mainTableTb.appendChild(tmp);
			var topLeftTd = resetStyles(document.createElement("td"));
			topLeftTd.vAlign = "top";
			topLeftTd.style.width = this.opts['boardSize'];
			tmp.appendChild(topLeftTd);
			var topRightTd = resetStyles(document.createElement("td"));
			topRightTd.style.verticalAlign = "top";
			tmp.appendChild(topRightTd);

			// toplevel table;
			var topTable = resetStyles(document.createElement("table"));
			topTable.style.width = (parseInt(this.opts['boardSize'])+15)+"px";
			topTable.style.height = (parseInt(this.opts['boardSize'])+15)+"px";
			topLeftTd.appendChild(topTable);
			topTable.border = 0;
			var topTableTb = document.createElement("tbody");
			topTable.appendChild(topTableTb);
			
			var boardTd = resetStyles(document.createElement("td"));
			boardTd.style.width = this.opts['boardSize'];
			boardTd.style.height = this.opts['boardSize'];
			boardTd.vAlign = "top";
			var btnTdNext = resetStyles(document.createElement("td"));
			btnTdNext.vAlign = 'top';
			btnTdNext.align = 'center';
			btnTdNext.style.height = '10px';
			var btnTd = resetStyles(document.createElement("td"));
			btnTd.vAlign = 'top';
			btnTd.style.height = '10px';
			var propsTd = resetStyles(document.createElement("td"));
			propsTd.style.height = '10px';
			
			// movesTable
			var movesDiv = resetStyles(document.createElement("div"));
			this.movesDiv = movesDiv;
			if (this.opts['movesPaneWidth'])
				movesDiv.style.width = this.opts['movesPaneWidth'];
//			else
//				movesDiv.style.overflow = "hidden";
			movesDiv.style.height = boardTd.style.height;
			movesDiv.id = divId+"_board_moves";
			movesDiv.style.overflow = "auto";
			movesDiv.style.border = "1px solid #cccccc";
			movesDiv.style.verticalAlign = "top";
			movesDiv.style.textAlign = "left";
			topRightTd.appendChild(movesDiv);
			
			var tmp = document.createElement("tr");
			tmp.style.height = "0%";
			tmp.appendChild(boardTd);
			topTableTb.appendChild(tmp);

			topTableTb.appendChild(document.createElement("tr")).appendChild(btnTd);
			topTableTb.appendChild(document.createElement("tr")).appendChild(btnTdNext);
			topTableTb.appendChild(document.createElement("tr")).appendChild(propsTd);
			tmp = resetStyles(document.createElement("td"));
			var tmpStr = document.createTextNode("");
			tmp.style.height = "auto";
			tmp.appendChild(tmpStr);
			topTableTb.appendChild(document.createElement("tr")).appendChild(tmp);


			var board = resetStyles(document.createElement("table"));
			var boardTb = document.createElement("tbody");
			board.appendChild(boardTb);

			board.style.top = boardFrame.style.top;
			board.style.left = boardFrame.style.left;
			board.style.borderCollapse = "collapse";

			boardFrame.appendChild(mainTable);
			boardTd.appendChild(board);
			
			var whiteC = this.opts['whiteSqColor'];
			var blackC = this.opts['blackSqColor'];

			// white pieces
			for(var i = 0; i < 8; i++) {
				var tr = document.createElement("tr");
				tr.style.height = (parseInt(this.opts['squareSize'].replace("px",""))+1)+"px";
				var flip = (i % 2)?1:0;
				for(var j = 0; j < 8; j++) {
					var td = resetStyles(document.createElement("td"));

					td.style.height = this.opts['squareSize'];
					td.style.width = this.opts['squareSize'];
					td.style.border = this.opts['squareBorder'];
					td.style.padding = "0px";
					td.vAlign = "middle";
					td.align = "center";
					var color = !flip?(j%2)?blackC:whiteC:!(j%2)?blackC:whiteC;
					
					td.style.background = color;

					this.pos[i][j] = td;
					tr.appendChild(td);
				}
				boardTb.appendChild(tr);
			}
			this.populatePieces();
			if (this.opts['flipped'])
				flipBoard(this);
			this.populateProps(propsTd);
			this.populateMoves(movesDiv, pgn.pgnOrig);

			// in java i could do Board.this in anon function;
			var tmp = this;
			// button td
			btnTd.align = 'center';
			btnTd.valign = 'middle';

			// rwnd;
			var hrefS = document.createElement("a");
			hrefS.href = "javascript:void(0)";
			var href = hrefS.cloneNode(false);
			var input = this.getImg("rwind","btns");
			input.alt = this.opts['altRewind'];
			input.title = this.opts['altRewind'];;
			href.appendChild(input);
			
			input.onclick = function() {
				startPosition(tmp);
			};
			btnTd.appendChild(href);

			// back
			input = this.getImg("back","btns");
			input.alt = this.opts['altBack'];
			input.title = this.opts['altBack'];
			href = hrefS.cloneNode(false);
			href.appendChild(input);
			
			input.onclick = function() {
				makeBwMove(tmp);
			};

			btnTd.appendChild(href);
			
			// flip the board
			input = this.getImg("flip","btns");
			input.alt = this.opts['altFlip'];
			input.title = this.opts['altFlip'];
			href = hrefS.cloneNode(false);
			href.appendChild(input);
			
			input.onclick = function() {
				flipBoard(tmp);
			};

			btnTd.appendChild(href);

			// current move
			// it is initialized in updateMoveInfo
			var input = resetStyles(document.createElement("input"));
			input.style.fontSize = "7pt";
			input.size = "9";
			input.style.border = this.opts['moveBorder'];
			input.style.textAlign = 'center';
			this.moveInput = input;
			btnTdNext.appendChild(input);
			// end of current move

			// hide
			input = this.getImg("toggle","btns");
			input.alt = this.opts['altShowMoves'];
			input.title = this.opts['altShowMoves'];
			href = hrefS.cloneNode(false);
			href.appendChild(input);

			input.onclick = function() {
				toggleMoves(tmp, "flip");
			};

			btnTd.appendChild(href);

			// comments
			input = this.getImg("comments","btns");
			input.alt = this.opts['altComments'];
			input.title = this.opts['altComments'];
			href = hrefS.cloneNode(false);
			href.appendChild(input);

			input.onclick = function() {
				toggleComments(tmp, "flip");
			};

			btnTd.appendChild(href);

			// next btn
			input = this.getImg("forward","btns");
			input.alt = this.opts['altPlayMove'];
			input.title = this.opts['altPlayMove'];
			href = hrefS.cloneNode(false);
			href.appendChild(input);

			input.onclick = function() {
				makeMove(tmp);
			};

			btnTd.appendChild(href);

			// ffwd
			input = this.getImg("ffward","btns");
			input.alt = this.opts['altFastForward'];
			input.title = this.opts['altFastForward'];
			href = hrefS.cloneNode(false);
			href.appendChild(input);

			input.onclick = function() {
					endPosition(tmp);
			};
			btnTd.appendChild(href);
			updateMoveInfo(this);
			this.toggleMoves(this.opts['showMovesPane']);	//force the moves pane overflow to get picked up
			if (this.opts['skipToMove']) { 
				try {
					var tmp2 = parseInt(this.opts['skipToMove']);
					if (tmp2>2) {
						var color2 = tmp2%2==0?1:0;
						tmp2 = Math.round(tmp2/2);
						this.skipToMove(tmp2-1,color2);
					}
					else if (tmp2 == 1) {
						 this.skipToMove(0,0);
					}
					else if (tmp2 == 2) {
						 this.skipToMove(0,1);
					}
				}catch(e){}
			}
	 };

		flipBoard = function(board) {
			board.deMarkLastMove(true);
			var frst, snd, tmp;
			board.flipped = !board.flipped;
			for (var i = 0;i<8;i++) {
				for (var j = 0;j<4;j++){
					frst = board.pos[i][j];
					snd = board.pos[7-i][7-j];

					try {
						 tmp = frst.removeChild(frst.firstChild);
					}
					catch (e) {tmp=null;}

					try{
						 frst.appendChild(snd.removeChild(snd.firstChild));
					}
					catch (e) {}
					
					if (tmp)
						snd.appendChild(tmp);
				}
			}
		};

					this.skipToMove = function(no, color) {
						var rNo = no*2+color+1;
						if (this.conv.getCurMoveNo()<rNo) {
							var i = 0;
							while(this.conv.getCurMoveNo()<rNo && i < 400) {
								makeMove(this, true);
								i++;
							}
							updateMoveInfo(this);
							updateMovePane(this);
							this.deMarkLastMove();
							this.markLastMove();
						}
						else if (this.conv.getCurMoveNo()>rNo) {
							var i = 0;
							while(this.conv.getCurMoveNo()>rNo && i < 200) {
								makeBwMove(this, true);
								i++;
							};
							updateMoveInfo(this);
							updateMovePane(this);
							this.deMarkLastMove();
							this.markLastMove();
						}
					};

					endPosition = function(board) {
						board.deMarkLastMove();
						var vBoard = board.conv.getEndPos(board.flipped);
						board.syncBoard(vBoard);;
						board.conv.resetToEnd();
						updateMoveInfo(board);
						updateMovePane(board, true);
						board.markLastMove();
					};

					this.startPosition = function() {
						startPosition(this);
					};

					startPosition = function(board) {
						board.deMarkLastMove(true);
						var vBoard = board.conv.getStartPos(board.flipped);
						board.syncBoard(vBoard);
						board.conv.resetToStart();
						updateMoveInfo(board);
						updateMovePane(board);
					};

					makeBwMove = function(board, noUpdate) {
						var move = board.conv.prevMove();
						if (move == null)
							 return;
						
						if (!noUpdate) {
							board.deMarkLastMove(true);
							board.markLastMove();
							updateMoveInfo(board);
							updateMovePane(board, true);
						}

						for(var i=move.actions.length;i > 1;i-=2) {
							var frst = move.actions[i-1].clone();
							var snd = move.actions[i-2].clone();
							var tmpM = new MySquare();
							tmpM.piece = frst.piece;
							tmpM.color = frst.color;
							frst.piece = snd.piece;
							frst.color = snd.color;
							snd.piece = tmpM.piece;
							snd.color = tmpM.color;

							frst.piece = move.oPiece;
							frst.color = move.oColor;

							if (move.pPiece)
								 snd.piece = move.pPiece;

							board.drawSquare(frst);
							board.drawSquare(snd);
						}
						if (move.enP) {
							 var x = move.enP.x, y = move.enP.y;
							 if (board.flipped) {
								 x=7-x;
								 y=7-y;
							}
							var sq = board.pos[x][y];
							sq.appendChild(board.getImg(move.enP.piece, move.enP.color));
						}
					};

					this.markLastMove = function() {
						if (!this.opts['markLastMove'])
							return;
						try {
							var move = this.conv.moves[this.conv.iteIndex-1].actions[1];;
							var piece = this.pos[move.x][move.y];
							if (this.flipped) {
								piece = this.pos[7-move.x][7-move.y];
							}
							// on konq the bg contains "initial initial initial "
							// i guess xtra information. Anyways setting the
							// background to a color containing the "initial"
							// parts fails. Go figure
							piece.lastBg = piece.style.backgroundColor.replace(/initial/g, "");
							piece.style.backgroundColor = "#e89292";
							this.lastSquare = piece;
						}
						catch (e) {}
					};

					this.deMarkLastMove = function() {
						var move = this.conv.moves[this.conv.iteIndex-2];
						if (arguments.length && arguments[0]) {
							move = this.conv.moves[this.conv.iteIndex-1];
						}
						
						if (this.conv.iteIndex+1 == this.conv.moves.length)
							 move = this.conv.getCurMove();

						if (move) {
							move = move.actions[1];
							
							var piece = this.pos[move.x][move.y];
							if (this.flipped)
								piece = this.pos[7-move.x][7-move.y];
							if (piece.lastBg)
								piece.style.background = piece.lastBg;
						}
						if (this.lastSquare && this.lastSquare.lastBg) {
							this.lastSquare.style.backgroundColor = this.lastSquare.lastBg;
							this.lastSquare = null;
						}
					};

					/*
						Toggle moves pane, actually not toggle but
						showing it depending the 'flag'.
					*/
					this.toggleMoves = function(flag) {
						if (flag == "flip")
							flag = this.movesDiv.style.visibility=="hidden";
						if (flag) {
							this.movesDiv.style.display = "block";
							this.movesDiv.style.visibility = "visible";
						}
						else {
							this.movesDiv.style.display = "none";
							this.movesDiv.style.visibility = "hidden";
						}
					};

					this.toggleComments = function(flag) {
						if (flag == "flip")
							flag = !this.opts['showComments'];
						if (flag) {
							this.opts['showComments'] = true;
						}
						else {
							this.opts['showComments'] = false;
						}
						var list = this.movesDiv.getElementsByTagName("span");
						if (list) {
							for (var i=0;i<list.length;i++) {
								if (flag) {
									list[i].style.display = "inline";
								}
								else {
									list[i].style.display = "none";
								}
							}
						}
					};

					/*
						Non-member toggle function. The onClick that I'm
						setting must not be a member function. I'm just
						using it to proxy.
					*/
					toggleMoves = function(board, flag) {
						board.toggleMoves(flag);
					};

					toggleComments = function(board, flag) {
						board.toggleComments(flag);
					};

					updateMoveInfo = function(board) {
						var idx = board.conv.getCurMoveNo()-1;
//						if (board.conv.getCurMoveNo() == board.conv.moves.length-1)
//							idx = board.conv.getCurMoveNo();
						var move = board.conv.moves[idx];
						if (move && move.moveStr) {
							 var str = Math.floor((idx==0?1:idx)/2+1)+". "+move.moveStr;
							 board.moveInput.value = str;
						}
						else
							 board.moveInput.value = "...";
					};

					makeMove = function(board, noUpdate) {
						var move = board.conv.nextMove();
						if (move == null)
							 return;
						
						if (!noUpdate) {
							 board.deMarkLastMove();
							 board.markLastMove();

							 updateMoveInfo(board);
							 updateMovePane(board);
						}
						
						for(var i=0;i < move.actions.length;i++) {
							board.drawSquare(move.actions[i]);
						}
						
						board.drawEnPassante(move);
					};

					updateMovePane = function(board, bw) {
						// highlight the move in the move's pane
						var idx = board.conv.getCurMoveNo();
						board.movesOnPane[this.lastBoldIdx] = deMakeBold(this.lastBold);
//						if (bw)
//							 idx+=1;
						this.lastBold = null;
						this.lastBoldIdx = null;
						if (board.movesOnPane[idx-1]) {
							board.movesOnPane[idx-1] = makeBold(board.movesOnPane[idx-1]);
							this.lastBold = board.movesOnPane[idx-1];
							this.lastBoldIdx = idx-1;
						}
					};

					makeBold = function(el) {
						var b = document.createElement("b");
						b.appendChild(el.cloneNode(true));
						el.parentNode.replaceChild(b, el);
						return b;
					};

					deMakeBold = function(el) {
						if (!el)
							 return;
						var rtrn = el.firstChild.cloneNode(true);
						el.parentNode.replaceChild(rtrn, el);
						return rtrn;
					};

					this.drawEnPassante = function(move) {
						if (!move.enP)
							 return;
						var x = move.enP.x, y = move.enP.y;
						if (this.flipped) {
							x = 7-x;
							y = 7-y;
						}
						var sq = this.pos[x][y];
						
						sq.color = null;
						sq.piece = null;

						sq.removeChild(sq.firstChild);
					};

					this.drawSquare = function(square) {
						var x = square.x, y = square.y;
						if (this.flipped) {
							x=7-x;
							y=7-y;
						}
						var sq = this.pos[x][y];

						sq.color = square.color;
						sq.piece = square.piece;

						if (sq.firstChild)
							sq.removeChild(sq.firstChild);

						if (sq.piece) {
							sq.appendChild(this.getImg(sq.piece,sq.color));
						}
					};

					this.updatePGNInfo = function() {
						this.visuals['pgn']['players'].nodeValue = ' ';
						this.visuals['pgn']['elos'].nodeValue = ' ';
						this.visuals['pgn']['event'].nodeValue = ' ';
						this.visuals['pgn']['timecontrol'].nodeValue = ' ';
						if (this.conv.pgn.props['White']) {
							this.visuals['pgn']['players'].nodeValue = this.conv.pgn.props['White'];
						}
						if (this.conv.pgn.props['White'] || this.conv.pgn.props['Black'])
							this.visuals['pgn']['players'].nodeValue += " - ";
						
						if (this.conv.pgn.props['Black']) {
							this.visuals['pgn']['players'].nodeValue += this.conv.pgn.props['Black'];
						}
						
						if (this.conv.pgn.props['WhiteElo']) {
							this.visuals['pgn']['elos'].nodeValue = 
									this.conv.pgn.props['WhiteElo'];
						}
						if (this.conv.pgn.props['WhiteElo'] || this.conv.pgn.props['BlackElo'])
							this.visuals['pgn']['elos'].nodeValue += " - ";
						if (this.conv.pgn.props['BlackElo']) {
							this.visuals['pgn']['elos'].nodeValue += 
									this.conv.pgn.props['BlackElo'];
						}
						if (this.conv.pgn.props['Event']) {
							this.visuals['pgn']['event'].nodeValue =
									this.conv.pgn.props['Event'];
						}
						if (this.conv.pgn.props['Date']) {
							this.visuals['pgn']['event'].nodeValue +=
									", "+this.conv.pgn.props['Date'];
						}
						if (this.conv.pgn.props['TimeControl']) {
							this.visuals['pgn']['timecontrol'].nodeValue =
									this.conv.pgn.props['TimeControl'];
						}
					};

					this.updateSettings = function() {
						var blacks = this.opts['blackSqColor'];
						var whites = this.opts['whiteSqColor'];
						
						for(var i=0;i<8;i++){
							var flip = (i%2)?true:false;
							for(var j=0;j<8;j++){
								var color = flip?(j%2)?whites:blacks:!(j%2)?whites:blacks;
								this.pos[i][j].style.background = color;
							}
						}
					};

					/*
					 * Draw the board with all the pieces in the initial
					 * position
					*/
					this.populatePieces = function() {
					for (var r=0;r<8;r++) {
						for (var f=0;f<8;f++) {
							var p = this.conv.initialBoard[r][f];
							if (p.piece) {
								var img = this.getImg(p.piece,p.color);
								this.pos[r][f].appendChild(img);
								this.pos[r][f].piece = p.piece;
								this.pos[r][f].color = p.color;
							}
						}
					}
				};

				this.populateMoves = function(cont, pgn) {
					if (!this.opts['showMovesPane']) {
						 cont.style.visibility="hidden";
						 cont.style.display="none";
					}
					cont.vAlign = "top";
					var tmp2=this.conv.pgn.moves;
					var p = document.createElement("p");
					p.style.fontSize = "9pt";
					p.style.fontFace = "Tahoma, Arial, sans-serif";
					p.style.fontWeight = "bold";
					var tmpA = document.createElement("a");

					tmpA.href = this.opts['downloadURL']+escape(pgn);
					tmpA.appendChild(document.createTextNode("PGN"));
				 	tmpA.style.fontFamily = this.opts['moveFont'];
				 	tmpA.style.fontSize = this.opts['moveFontSize'];
				 	tmpA.style.color = this.opts['moveFontColor'];

					var txt = document.createTextNode("");
					if (this.conv.pgn.props['White']) {
						var txt = document.createTextNode(this.conv.pgn.props['White']
										+" - "+this.conv.pgn.props['Black']);
						p.appendChild(txt);
					}
					else {
						var txt = document.createTextNode("Unknown - Unknown");
						p.appendChild(txt);
					}
					p.appendChild(document.createTextNode(" ("));
					p.appendChild(tmpA);
					p.appendChild(document.createTextNode(")"));
					cont.appendChild(p);
					
					var link, tmp, tmp3;
					var lastMoveIdx = 0;
					var comment;

					for (var i = 0;i < tmp2.length;i++) {
						if (tmp2[i].white != null) {
							link = document.createElement("a");
							tmp = document.createTextNode(tmp2[i].white);
							tmp3 = document.createElement("b");
	
							tmp3.style.fontFamily = "Tahoma, Arial, sans-serif";
							tmp3.style.fontSize = "8pt";
							tmp3.style.color = "black";
							tmp3.appendChild(document.createTextNode(" "+(i+this.conv.startMoveNum)+". "));
							cont.appendChild(tmp3);
							
							link.href = 'javascript:void(window['+this.id+']'
													+'.skipToMove('+i+','+0+'))';
							link.appendChild(tmp);
							link.style.fontFamily = this.opts['moveFont'];
							link.style.fontSize = this.opts['moveFontSize'];
							link.style.color = this.opts['moveFontColor'];
							link.style.textDecoration = "none";
							cont.appendChild(link);
	
							comment = this.conv.pgn.getComment(tmp2[i].white,lastMoveIdx);
							if (comment[0]) {
								var tmp4 = document.createElement("span");
								if (!this.opts['showComments']) {
									tmp4.style.display = "none";
								}
								tmp4.style.fontFamily = this.opts['commentFont'];
								tmp4.style.fontSize = this.opts['commentFontSize'];
								tmp4.style.color = this.opts['commentFontColor'];
								tmp4.appendChild(document.createTextNode(comment[0]));
								cont.appendChild(tmp4);
								lastMoveIdx = comment[1];
							}
	
							this.movesOnPane[this.movesOnPane.length] = link;
						}

						if (tmp2[i].black != null) {
							cont.appendChild(document.createTextNode(" "));
							tmp = document.createTextNode(tmp2[i].black);
							link = document.createElement("a");
							link.style.fontFamily = this.opts['moveFont'];
							link.style.fontSize = this.opts['moveFontSize'];
							link.style.color = this.opts['moveFontColor'];
							link.style.textDecoration = "none";
							link.appendChild(tmp);
							link.href = 'javascript:void(window['+this.id+']'
												+'.skipToMove('+i+','+1+'))';
							cont.appendChild(link);
							comment = this.conv.pgn.getComment(tmp2[i].black,lastMoveIdx);
							if (comment[0]) {
								var tmp4 = document.createElement("span");
								if (!this.opts['showComments']) {
									tmp4.style.display = "none";
								}
								tmp4.style.fontFamily = this.opts['commentFont'];
								tmp4.style.fontSize = this.opts['commentFontSize'];
								tmp4.style.color = this.opts['commentFontColor'];
								tmp4.appendChild(document.createTextNode(comment[0]));
								cont.appendChild(tmp4);
								lastMoveIdx = comment[1];
							}
							this.movesOnPane[this.movesOnPane.length] = link;
						}
					}
					if(!(typeof(this.conv.pgn.props['Result']) == 'undefined')) {
						txt = document.createTextNode("  "+this.conv.pgn.props['Result']);
						tmp2 = document.createElement("b");
						tmp2.appendChild(txt);
						tmp2.style.fontSize = "9pt";
						cont.appendChild(tmp2);
						this.movesOnPane[this.movesOnPane.length] = tmp2;
					}
				};

				this.populateProps = function(container) {
					// init the style
					var tdS = resetStyles(document.createElement('td'));
					tdS.style.fontFamily = "Tahoma, Arial, sans-serif";
					tdS.style.fontSize = "8pt";
					tdS.align = 'center';
					// end of init the style;
					
					var tbl = resetStyles(document.createElement('table'));
					tbl.cellPadding = "0";
					tbl.cellSpacing = "0";
					var tblTb = document.createElement("tbody");
					tbl.appendChild(tblTb);

					tbl.width = "100%";
					container.appendChild(tbl);

					// white - black;
					var tr = document.createElement('tr');
					tblTb.appendChild(tr);

					var td = tdS.cloneNode(true);
					td.style.fontWeight = "bold";
					tr.appendChild(td);

					var txt = document.createTextNode('&nbsp;');
					this.visuals['pgn']['players'] = txt;
					td.appendChild(txt);
					//
					
					// ELO
					tr = document.createElement('tr');
					tblTb.appendChild(tr);

					td = tdS.cloneNode(false);
					tr.appendChild(td);

					txt = document.createTextNode('&nbsp;');
					this.visuals['pgn']['elos'] = txt;
					td.appendChild(txt);
					//
					
					// Date 
					tr = document.createElement('tr');
					tblTb.appendChild(tr);

					td = tdS.cloneNode(false);
					tr.appendChild(td);

					txt = document.createTextNode('&nbsp;');
					this.visuals['pgn']['event'] = txt;
					td.appendChild(txt);

					// Time control
					tr = document.createElement('tr');
					tblTb.appendChild(tr);

					td = tdS.cloneNode(false);
					tr.appendChild(td);

					txt = document.createTextNode('&nbsp;');
					this.visuals['pgn']['timecontrol'] = txt;
					td.appendChild(txt);
					//;
					this.updatePGNInfo();
				};

				this.getImg = function(piece, color) {
					var btns = {"ffward":true,"rwind":true,"forward":true,
					            "back":true,"toggle":true,"comments":true,"flip":true};
					
					var prefix = this.opts['imagePrefix'];
					if (btns[piece]) {
						prefix = this.opts['buttonPrefix'];
						imageNames[color][piece] = imageNames[color][piece].replace("buttons\/","");
					}
					
					var src = prefix + imageNames[color][piece];
					var img = resetStyles(document.createElement("img"));
					img.style.border = "0px solid #cccccc";
					
					if ( /\.png$/.test( img.src.toLowerCase()) &&
							navigator.userAgent.toLowerCase().indexOf("msie") != -1) {
      					// set filter
      					img.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true,src='" + 
									src + "',sizingMethod='image')";	
					}
					else {
						img.src = src;
					}

					return img;
				};

				this.syncBoard = function(result) {
					for(var i=0;i<8;i++) {
						for(var j=0;j<8;j++) {
							this.syncSquare(result[i][j]
													,this.pos[i][j]);
						}
					}
				};

				this.syncSquare = function(from, to) {
					to.piece = from.piece;
					to.color = from.color;

					if (to.firstChild)
						 to.removeChild(to.firstChild);
					if (to.piece) {
						to.appendChild(this.getImg(to.piece, to.color));
					}
				};
			};

	/*
		Provides support for different chess & button sets. Takes
		three optional arguments. The first argument specifies the SET
		identifier (defaults to 'default'), the second is the
		image prefix (defaults to ""), and the third is the
		image suffix (defaults to 'gif').
	*/
	function BoardImages(options) {
		this.set = "default";
		this.pref = "";
		this.suf = 'gif';
		if (options['set']) {
			this.set = options['set'];
		}
		if (options['imagePrefix']) {
			this.pref = options['imagePrefix'];
		}
		if (options['imageSuffix']) {
			this.suf = options['imageSuffix'];
		}
		this.imageNames = {
			"default": {
				"white" : {"rook":"wRook."+this.suf
									 ,"bishop":"wBishop."+this.suf
									 ,"knight":"wKnight."+this.suf
									 ,"queen":"wQueen."+this.suf
									 ,"king":"wKing."+this.suf
									 ,"pawn":"wPawn."+this.suf}
					
				,"black" : {"rook":"bRook."+this.suf
									 ,"bishop":"bBishop."+this.suf
									 ,"knight":"bKnight."+this.suf
									 ,"queen":"bQueen."+this.suf
									 ,"king":"bKing."+this.suf
									 ,"pawn":"bPawn."+this.suf}

				,"btns" : {"ffward":"buttons/ffward."+this.suf
										,"rwind":"buttons/rwind."+this.suf
										,"forward":"buttons/forward."+this.suf
										,"back":"buttons/back."+this.suf
										,"toggle":"buttons/toggle."+this.suf
										,"comments":"buttons/comments."+this.suf
										,"flip":"buttons/flip."+this.suf
										}
			}
		};

		this.preload = function() {
			var set = this.set;
			var pref = this.pref;
			if (arguments.length>0)
				set = arguments[0];
			if (arguments.length>1)
				pref = arguments[1];
			var img;
			for (var i in this.imageNames[set]) {
				for (var j in this.imageNames[set][i]) {
					img = new Image();
					img.src = this.imageNames[set][i][j];
				}
			}
		};
	};

function isYahoo(pgn) {
    pgn = pgn.replace(/^\s+|\s+$/g, '');
    return pgn.charAt(0) == ';'; 
}

function resetStyles(obj) {
  obj.style.background = 'transparent';
  obj.style.margin = 0;
  obj.style.padding = 0;
  obj.style.border = 0;
  obj.style.fontSize = "100%";
  obj.style.outline = 0;
  obj.style.verticalAlign = "middle";
  obj.style.textAlign = "center";
  obj.style.borderCollapse = "separate";
  return obj;
}
