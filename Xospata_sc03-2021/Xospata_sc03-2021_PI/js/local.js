(function() {
    /* https://codepen.io/JefMari/pen/NxLaed */
    function hasClass(element, cls) {
        return (" " + element.className + " ").indexOf(" " + cls + " ") > -1;
    }

    var swipeArea = document.getElementsByClassName("swipe-area")[0];
    var swipeRightOn = hasClass(swipeArea, "swipe-right");

    var mc = new Hammer(swipeArea);
    /* Go to next slide on swipe left */
    mc.on("swiperight", function(ev) {
        if (!swipeRightOn) return;
        com.vclm.mt.closeSlide();
    });
})();