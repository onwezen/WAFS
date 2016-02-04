(function() {
	var app = {
		init: function() {
			routes.init();
		}
	};

	var routes = {
		init: function() {
			if(location.hash){
				sections.toggle(location.hash);
			} else {
				sections.toggle('#start-screen')
			};

			window.addEventListener("hashchange", function() {
				sections.toggle(location.hash);
			})
		}
	};

	var sections = {
		toggle: function(route) {
			this.hideScreens();
			var show = document.querySelector(route);
			show.style.display = '';

			this.navigation(route);
		},
		hideScreens: function(){
			var screens = document.querySelectorAll('body > section')
			for (var i = 0; i < screens.length; i++) {
				screens[i].style.display = 'none';
			};
		},
		navigation: function(route) {
			var ahref = document.querySelectorAll('.menu-button a');
			for (var i = 0; i < ahref.length; i++) {
				var hrefValue = ahref[i].getAttribute('href');
				if (hrefValue == route) {
					ahref[i].parentElement.classList.add("active-menu-button");
				} else {
					ahref[i].parentElement.classList.remove("active-menu-button");
				};
			};
		}
	};

	app.init();
})();
