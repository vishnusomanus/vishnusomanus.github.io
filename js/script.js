
let icons = $(".icons i");
let delayTime = 50; // Time for each icon to stay visible

function showIconsSequentially(index) {
    if (index < icons.length) {
    $(icons[index]).fadeIn(50).delay(delayTime).fadeOut(50, function() {
        showIconsSequentially(index + 1);
    });
    } else {
        // After last icon, show boy face
        $("#boyFace").fadeIn(1000).css("opacity", "1");
        toggleFace();
        setTimeout(function () {
            $("#message").fadeIn(500).fadeOut(4000);
          }, 1000);
    }
}
function toggleFace() {
    // Hide pupils and the smiling mouth.
    $("#pupilLeft, #pupilRight, #mouthSmiling").hide();
    // Show the S-shaped mouth and the eye-line paths.
    $("#mouthS, #eyeLeftLine, #eyeRightLine").show();
  
    // Add bounce animation to SVG.
    $("#boyFace").addClass("bounce").one("animationend", function () {
      $(this).removeClass("bounce");
    });
  
    setTimeout(function () {
      // Revert to smiling face: show pupils, show the smiling mouth, hide S-shaped mouth and eye lines.
      $("#pupilLeft, #pupilRight, #mouthSmiling").show();
      $("#mouthS, #eyeLeftLine, #eyeRightLine").hide();
    }, 500);
  }
    
$(document).ready(function(){
    showIconsSequentially(0);

    // Select elements using jQuery
    var $hair       = $("#hair");
    var $pupilLeft  = $("#pupilLeft");
    var $pupilRight = $("#pupilRight");
    var $parentDiv  = $("#avatar");
    var $svg        = $("#boyFace");
    
    // Hair shake animation on click
    $svg.on("click", function(){
      $hair.addClass("shake").one("animationend", function(){
        $hair.removeClass("shake");
      });
    });
    
    // Pupil movement on mouse move
    $parentDiv.on("mousemove", function(e){
      var rect = $parentDiv[0].getBoundingClientRect();
      var mouseX = e.clientX - rect.left;
      var mouseY = e.clientY - rect.top;
      
      function movePupil(eyeX, eyeY, $pupil){
        var dx = mouseX - eyeX;
        var dy = mouseY - eyeY;
        var angle = Math.atan2(dy, dx);
        var maxMove = 5;
        $pupil.attr("cx", Math.cos(angle) * maxMove);
        $pupil.attr("cy", Math.sin(angle) * maxMove);
      }
      
      movePupil(120, 140, $pupilLeft);
      movePupil(180, 140, $pupilRight);
    });
    
    // On mousedown: update appearance, add bounce animation, and keep the state permanently.
    $svg.on("mousedown", toggleFace);


    // $("#draggable").on("mousedown", function () {
    //     $("body").addClass("dragging");
    // });
    
    // $("#draggable").on("mouseup", function () {
    //     $("body").removeClass("dragging");
    // });

    $("#draggable").draggable({
    containment: ".contact-me", // Restrict movement inside parent
    // revert: "invalid", 
    revert: true,
    drag: function(event, ui) {
        $("body").addClass("dragging"); 
        $("#message").removeClass('animate__shakeX').addClass('animate__bounce animate__infinite	infinite').show().text("Slide It!"); 

    },
    stop: function(event, ui) {
        console.log("Stopped dragging."); 
        $("body").removeClass("dragging"); 
        $("#message").hide();
    }
    });

    $("#droppable").droppable({
    drop: function (event, ui) {
        alert('droped');
    }
    });
    
  });