
$('span').click(function () {
  $(this).find(".toggle-password").toggleClass('fa-eye fa-eye-slash');

  let input = $(this).parent().prev("input");

  if (input.attr("type") === "password") {
    input.attr("type", "text");
  } else {
    input.attr("type", "password");
  };

})