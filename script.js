document.addEventListener("DOMContentLoaded", function() {
    var headerElements = document.querySelectorAll(".header-element");
    headerElements.forEach(function(element) {
        element.classList.add("show");
    });
});