(function() {
	'use strict';

	var app = {
		init: function() {
			routes.init();
			search.init();
		}
	};

	var routes = {
		init: function() {
			window.addEventListener('hashchange', sections.toggle, false);
 			window.addEventListener('load', sections.toggle, false);
		}
	};

	var sections = {
		toggle: function() {
			var hash = window.location.hash;

			if (hash) {
				sections.hideScreens();

				var show = document.querySelector(hash);
				show.style.display = '';
			} else {
				window.location.hash = '#start-screen';
			};
			
			sections.navigation();
		},
		hideScreens(){
		 	var screens = document.querySelectorAll('body > section');
			for (var i = 0; i < screens.length; i++) {
				screens[i].style.display = 'none';
			};	
		},
		navigation: function() {
			var hash = window.location.hash;
			var ahref = document.querySelectorAll('.menu-button a');

			for (var i = 0; i < ahref.length; i++) {
				var hrefValue = ahref[i].getAttribute('href');
				if (hrefValue == hash) {
					ahref[i].parentElement.classList.add("active-menu-button");
				} else {
					ahref[i].parentElement.classList.remove("active-menu-button");
				};
			};
		}
	};

	var search = {
		searchResults: [],
		init: function() {
			this.elements();
			this.submit();
		},
		elements: function() {
			this.list = document.getElementById('list');
			this.form = document.getElementById('form');
			this.submitButton = document.getElementById('submit');
			this.searchvalue = document.getElementById('searchvalue');
		},
		apiCall: function(search, callback) {
			var xhr = new XMLHttpRequest();

			var s = encodeURI(search)

			xhr.open('GET', 'http://www.omdbapi.com/?s='+s+'&r=json', true);
			xhr.send(null);
			
			xhr.onreadystatechange = function() {
			    if (xhr.readyState == XMLHttpRequest.DONE) {
			        var json = JSON.parse(xhr.responseText);
			        callback(json.Search);
			    }
			}.bind(this)
		},
		pushToArray: function(search) {
			var callback = function(object) {
				this.searchResults = object;
				this.render();
			}.bind(this);

			this.apiCall(search, callback)		
		},
		submit: function() {
			this.form.addEventListener("submit", this.getValue.bind(this) )
		},
		getValue: function(e) {
			e.preventDefault();
			var value = this.searchvalue.value;
			this.pushToArray(value);
		},
		render: function() {
			while (this.list.firstChild) {
			    this.list.removeChild(this.list.firstChild);
			}

			for (var i = 0; i < this.searchResults.length; i++) {
				var li = document.createElement("li");
				li.setAttribute('id', 'searchLi-'+this.searchResults[i].imdbID)
				li.setAttribute('value', this.searchResults[i].imdbID)
				var div = document.createElement("div");
				var h1 = document.createElement("h1");
				var img = document.createElement("img");
				img.setAttribute('src', this.searchResults[i].Poster);
				var span = document.createElement("span");
				var checkbox = document.createElement("input");
				checkbox.setAttribute('type', 'checkbox');
				checkbox.setAttribute('id', 'checkboxSearch-'+this.searchResults[i].imdbID);
				checkbox.setAttribute('value', this.searchResults[i].imdbID);
				var label = document.createElement('label');
				label.setAttribute('for', 'checkboxSearch-'+this.searchResults[i].imdbID);
				var year = document.createTextNode(this.searchResults[i].Year);
				var title = document.createTextNode(this.searchResults[i].Title);

				li.appendChild(img);
				li.appendChild(div).appendChild(h1).appendChild(title);
				div.appendChild(span).appendChild(year);
				li.appendChild(checkbox);
				li.appendChild(label);
				
				this.list.appendChild(li);
			}
		}
	}

	app.init();
})();
