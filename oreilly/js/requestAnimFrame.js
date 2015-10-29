/* Thanks to Paul Irish - 
http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
*/

if ( !window.requestAnimFrame ) {

	window.requestAnimFrame = ( function() {

		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

			window.setTimeout( callback, 1000 / 60 );

		};

	} )();

}