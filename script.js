var dropdowns = document.getElementsByClassName('dropdown');
var activeDropdown = null;
var commsAutohide;
var dragging;
var offsetTop;
var lastId;
//adding dropdown event listeners and individual IDs
for (var i = 0; i <= dropdowns.length - 1; i++) {
  dropdowns[i].id = 'dropdown-' + i;
  dropdowns[i].addEventListener('click', function(e) {
    if ((activeDropdown !== null && e.target.parentNode.parentNode.classList.contains('dropdown-menu') === false)) {
      lastId = activeDropdown.parentNode.id;
      activeDropdown.classList.remove('visible');
      activeDropdown = null;
    } else if (activeDropdown !== null) {
      var children = activeDropdown.parentNode.childNodes;
      for (var j = 0; j < children.length; j++) {
        if (children[j].classList !== undefined && children[j].classList.contains('dropdown-replace')) {
          //adding current element back to the dropdown list
          var liElm = document.createElement('li');
          var node = document.createTextNode(children[j].innerHTML);
          liElm.appendChild(node);
          e.target.parentNode.insertBefore(liElm, e.target.parentNode.firstChild);
          //replacing content of the dropdown selection text
          children[j].innerHTML = e.target.innerHTML;
          e.target.parentNode.removeChild(e.target);
          activeDropdown.classList.remove('visible');
          activeDropdown = null;
        }
      }
    }
    if (e.target.classList.contains('dropdown-selection') || e.target.classList.contains('dropdown-icon')) {
      var elm = e.target;
      for (var j = 0; j < elm.parentNode.childNodes.length; j++) {
        if (elm.parentNode.childNodes[j].classList !== undefined) {
          if (elm.parentNode.childNodes[j].classList.contains('dropdown-menu')) {
            elm.parentNode.childNodes[j].classList.add('visible')
            activeDropdown = elm.parentNode.childNodes[j];
          }
        }
      }
    }
    if (lastId === e.target.parentNode.id){
      activeDropdown.classList.remove('visible');
      activeDropdown = null;
    }
    lastId = null;
  })
}

//comms sidebar event listeners
document.getElementById('comms-sidebar').addEventListener('mousedown',function(e){
  offsetTop = document.getElementById('comms-sidebar').offsetTop;
  //showing hiding the sidebar
  if (e.target.id === 'hide-comms-sidebar') {
    document.getElementById('comms-sidebar').classList.toggle('hidden');
    document.getElementById('tournament-content').classList.toggle('wide');
  }
  //initiate dragging the handle
  if (e.target.id === 'comms-divider') {
    dragging = true;
  }
})
document.getElementById('comms-sidebar').addEventListener('mousemove',function(e){
    if (dragging === true) {
      document.getElementById('comms-userlist').style.height = (e.clientY-offsetTop-50)+"px";
    }
})
document.getElementById('comms-sidebar').addEventListener('mouseup',function(e){
  dragging = false;
})
//autohide comms-bar on mobile, auto show on desktop
if (window.innerWidth <= 750) {
  document.getElementById('comms-sidebar').classList.add('hidden');
  document.getElementById('tournament-content').classList.add('wide');
  commsAutohide = true;
}
//autohide comms-bar on ressize to small sizes
window.onresize = function() {
  if (window.innerWidth <= 750) {
    if (!document.getElementById('comms-sidebar').classList.contains('hidden')){
      commsAutohide = true;
    }
    document.getElementById('comms-sidebar').style.transition = 'none';
    document.getElementById('tournament-content').style.transition = 'none';
    document.getElementById('comms-sidebar').classList.add('hidden');
    document.getElementById('tournament-content').classList.add('wide');
    //timeout to restore animation for manual hide/show
    window.setTimeout(function(){
      document.getElementById('comms-sidebar').style.transition = '';
      document.getElementById('tournament-content').style.transition = '';
    },1000)
  }
//restore comms bar if it was previously hidden automatically
  else if (commsAutohide) {
    document.getElementById('comms-sidebar').style.transition = 'none';
    document.getElementById('tournament-content').style.transition = 'none';
    document.getElementById('comms-sidebar').classList.remove('hidden');
    document.getElementById('tournament-content').classList.remove('wide');
    //timeout to restore animation for manual hide/show
    window.setTimeout(function(){
      document.getElementById('comms-sidebar').style.transition = '';
      document.getElementById('tournament-content').style.transition = '';
    },1000)
    commsAutohide = false;
  }
}
window.onclick = function(e) {
  if (activeDropdown !== null && e.target.parentNode.id !== activeDropdown.parentNode.id) {
    activeDropdown.classList.remove('visible');
    activeDropdown = null;
  }
}
