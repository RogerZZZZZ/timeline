export default {
  none: function() {
		return 0;
	},
	linear: function(k: number) {
		return k;
	},
	quadEaseIn: function(k: number) {
		return k * k;
	},
	quadEaseOut: function(k: number) {
		return - k * ( k - 2 );
	},
	quadEaseInOut: function(k: number) {
		if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
		return - 0.5 * ( --k * ( k - 2 ) - 1 );
	}
}