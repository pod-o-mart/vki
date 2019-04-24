/* In order to make the script work, add the declaration
 * data-disable-touch-keyboard=""
 * to your input field or textarea.
 *You will also need JQUERY and modernizr.js
 */
$(document).ready(function() {
	if (Modernizr.touch) {
		$('[data-disable-touch-keyboard]').attr('readonly', 'readonly');
		$("head").append($("<link rel='stylesheet' href='keyboard-touch.css' type='text/css' media='screen' />"));
	}
});
