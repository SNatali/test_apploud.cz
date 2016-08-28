
$(document).ready(function() {

  $('.btn_hover').on('click',function(event){
    event.preventDefault();
    $("#modal").fadeIn();
  });

  $('.modal__close').on('click',function(event){
    event.preventDefault();
    $(this).closest('.modal-overlay').fadeOut();
  });

  // $('.modal-overlay').on('click',function(event){
  //   event.stopPropagation();
  //   $(this).fadeOut();
  // });

});