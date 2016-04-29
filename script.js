

//Hiding comms sidebar event listener
document.getElementById('hide-comms-sidebar').addEventListener('click',function(){
  document.getElementById('comms-sidebar').classList.toggle('hidden');
  document.getElementById('tournament-content').classList.toggle('wide');

});
