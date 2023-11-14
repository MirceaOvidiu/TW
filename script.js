function goBack() {
    window.history.back();
}

var mybutton = document.getElementById("myBtn");

// when the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// scroll to the top of the document on button press
mybutton.onclick = function() {topFunction()};

function topFunction() {
  document.body.scrollTop = 0; //Safari
  document.documentElement.scrollTop = 0; //Chrome, Firefox
}