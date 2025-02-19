$(document).ready(function(){
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
    $svg.on("mousedown", function(){
      // Hide pupils and the smiling mouth.
      $("#pupilLeft, #pupilRight, #mouthSmiling").hide();
      // Show the S-shaped mouth and the eye-line paths.
      $("#mouthS, #eyeLeftLine, #eyeRightLine").show();
      
      // Add bounce animation to svg.
      $svg.addClass("bounce").one("animationend", function(){
        $svg.removeClass("bounce");
      });
      setTimeout(function(){
        // Revert to smiling face: show pupils, show the smiling mouth, hide S-shaped mouth and eye lines.
        $("#pupilLeft, #pupilRight").show();
        $("#mouthSmiling").show();
        $("#mouthS, #eyeLeftLine, #eyeRightLine").hide();
      }, 500);
    });
  });